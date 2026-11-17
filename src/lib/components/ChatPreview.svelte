<script lang="ts">
import { onMount } from 'svelte';
import { getMessages, getMe } from '#lib/context.ts';
import { renderPreview } from '#lib/drawing.ts';

const messages = getMessages();

// `getMe()` returns the accessor stored in context; resolve it once during
// initialisation, then call it from `$derived` to track the player character.
const getCurrentMe = getMe();
const me = $derived(getCurrentMe());

let canvas: HTMLCanvasElement | null = $state(null);
let ctx: CanvasRenderingContext2D | null = null;
let frame = 0;

function render() {
  renderPreview(canvas, ctx, messages, me, requestRender);
}

function requestRender() {
  if (frame) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    render();
  });
}

$effect(() => {
  if (!canvas) return;
  ctx = canvas.getContext('2d');

  // The renderer runs on the next frame, outside this tracking scope, so read
  // every field it uses here. Mutations to nested message state (typing,
  // changing sender, reordering) then schedule exactly one repaint.
  for (const message of messages) {
    void message.me;
    void message.sender.id;
    void message.sender.name;
    void message.sender.image;
    void message.override;
    void message.text;
  }
  void me.id;
  void me.name;
  void me.image;

  requestRender();
});

onMount(() => {
  const el = canvas;
  if (!el) return;

  let lastWidth = -1;
  const observer = new ResizeObserver(([entry]) => {
    const width = Math.round(entry.contentRect.width);
    if (width === lastWidth) return;
    lastWidth = width;
    requestRender();
  });
  observer.observe(el);

  // Canvas renders are rasterized, so a late webfont swap would otherwise
  // leave the previous font baked into the preview until the next edit.
  document.fonts?.ready?.then(requestRender);

  return () => {
    observer.disconnect();
    if (frame) cancelAnimationFrame(frame);
  };
});
</script>

<canvas bind:this={canvas} id="preview" class="block w-full" aria-label="Chat preview"></canvas>
