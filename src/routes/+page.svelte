<script lang="ts">
import { flip } from 'svelte/animate';
import { Select } from 'bits-ui';
import { type Character, characters } from '#lib/characters.ts';
import MessageItem from '#lib/components/MessageItem.svelte';
import { type MessageItem as MessageItemData, setMessages, setMe } from '#lib/context.ts';

const selections = characters
  .toSorted((a, b) => {
    return a.name > b.name ? 1 : a.name < b.name ? -1 : 0
  })
  .map(c => {
    return {
      value: c.id,
      label: c.name,
      thumbnail: c.image
    }
})

let me = $state<Character>(characters[0]);
let messages = $state<MessageItemData[]>([]);

// Pass a getter so MessageItem always sees the current character, even after
// the sender selection reassigns `me`.
setMe(() => me);

// The array itself is reactive state; entries are mutated in place by the
// MessageItem components, so every context consumer sees the same list.
setMessages(messages);

function addMessage() {
  messages.push({ me: true, sender: me, override: '', text: '' });
}

type DragState = {
  pointerId: number;
  index: number;
  startIndex: number;
  offsetY: number;
  ghost: HTMLElement;
};

let listEl: HTMLDivElement;
let draggingIndex = $state<number | null>(null);
let dragState: DragState | null = null;

function startDrag(event: PointerEvent, index: number) {
  if (event.button !== 0 || dragState) return;

  const target = event.target as HTMLElement;
  const row = target.closest<HTMLElement>('[data-message-row]');
  if (!row) return;

  // Clone the row so the drag preview looks exactly like the item being moved
  // while the source row stays behind as an invisible placeholder.
  const rect = row.getBoundingClientRect();
  const ghost = row.cloneNode(true) as HTMLElement;
  ghost.removeAttribute('data-message-row');
  ghost.classList.add('drag-ghost');
  ghost.setAttribute('aria-hidden', 'true');
  ghost.classList.add('bg-slate-800', 'shadow-2xl', 'rounded-xl');
  Object.assign(ghost.style, {
    position: 'fixed',
    top: `${rect.top}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    margin: '0',
    zIndex: '60',
    pointerEvents: 'none'
  });

  // cloneNode copies input attributes, not the values typed into them
  const originalInputs = row.querySelectorAll('input');
  const clonedInputs = ghost.querySelectorAll('input');
  originalInputs.forEach((input, i) => {
    const clone = clonedInputs[i];
    if (clone) clone.value = input.value;
  });
  ghost.querySelectorAll<HTMLElement>('input, button, select, textarea, a').forEach((el) => {
    el.setAttribute('tabindex', '-1');
  });

  document.body.appendChild(ghost);
  document.body.classList.add('select-none');

  dragState = {
    pointerId: event.pointerId,
    index,
    startIndex: index,
    offsetY: event.clientY - rect.top,
    ghost
  };
  draggingIndex = index;

  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);
  window.addEventListener('keydown', onKeyDown);
}

/** Index the dragged item should occupy for the current pointer position. */
function getTargetIndex(clientY: number) {
  if (!dragState) return 0;

  const index = dragState.index;
  const rows = Array.from(listEl.querySelectorAll<HTMLElement>('[data-message-row]'));
  const listTop = listEl.getBoundingClientRect().top - listEl.scrollTop;
  const y = clientY - listTop;

  // Count the rows (other than the dragged one) whose midpoint is above the
  // pointer; that is the insertion index of the dragged item.
  let target = 0;
  rows.forEach((row, i) => {
    if (i !== index && y > row.offsetTop + row.offsetHeight / 2) {
      target += 1;
    }
  });
  return target;
}

function onPointerMove(event: PointerEvent) {
  if (!dragState || event.pointerId !== dragState.pointerId) return;

  dragState.ghost.style.top = `${event.clientY - dragState.offsetY}px`;

  const target = getTargetIndex(event.clientY);
  if (target === dragState.index) return;

  // Reorder the shared array immediately so the list animates while dragging
  // and the context array is already correct by the time the pointer is released.
  const moved = messages.splice(dragState.index, 1)[0];
  if (!moved) return;

  messages.splice(target, 0, moved);
  dragState.index = target;
  draggingIndex = target;
}

function onKeyDown(event: KeyboardEvent) {
  if (!dragState || event.key !== 'Escape') return;

  const moved = messages.splice(dragState.index, 1)[0];
  if (moved) {
    messages.splice(dragState.startIndex, 0, moved);
  }
  endDrag();
}

function suppressClick(event: MouseEvent) {
  event.preventDefault();
  event.stopPropagation();
}

function endDrag(event?: Event) {
  if (!dragState) return;

  dragState.ghost.remove();
  window.removeEventListener('pointermove', onPointerMove);
  window.removeEventListener('pointerup', endDrag);
  window.removeEventListener('pointercancel', endDrag);
  window.removeEventListener('keydown', onKeyDown);
  document.body.classList.remove('select-none');

  // Swallow the click that follows a drop so it doesn't activate whatever
  // control happened to be under the pointer.
  if (event?.type === 'pointerup') {
    window.addEventListener('click', suppressClick, { capture: true, once: true });
  }

  dragState = null;
  draggingIndex = null;
}
</script>

<div class="w-full h-dvh flex">
  <div class="flex-1">
    <div class="flex flex-col gap-2 p-4">

    </div>
  </div>
  <div class="flex-2">
    <div class="flex flex-col gap-2 p-4">
      <h1>NTE Message Generator</h1>
      <Select.Root type="single" items={selections} allowDeselect={false} bind:value={() => me.id, (v) => me = characters.find(c => c.id === v) as Character}>
        <Select.Trigger class="select w-full inline-flex h-10 items-center rounded-9px border border-border-input bg-gray-800 px-2.75 text-sm transition-colors select-none data-placeholder:text-foreground-alt/50" aria-label="Select sender">
          <div class="avatar">
            <div class="w-8 rounded-xl">
              <img alt="Profile" src={selections.find(s => s.value === me.id)?.thumbnail} />
            </div>
          </div>
          {selections.find(s => s.value === me.id)?.label}
        </Select.Trigger>
        <Select.Portal>
          <Select.Content class="focus-override overflow-y-scroll z-50 h-96 max-h-(--bits-select-content-available-height) w-(--bits-select-anchor-width) min-w-(--bits-select-anchor-width) rounded-xl border border-gray-600 bg-gray-800 px-1 py-3 shadow-popover outline-hidden select-none">
            {#each selections as selection (selection.value)}
            <Select.Item class="flex gap-4 h-12 w-full items-center rounded-full py-3 pr-1.5 pl-5 text-sm capitalize outline-hidden select-none data-disabled:opacity-50 data-highlighted:bg-gray-600"
                value={selection.value}
                label={selection.label}
              >
                <div class="avatar">
                  <div class="w-8 rounded-xl">
                    <img alt="Profile" src={selection.thumbnail} />
                  </div>
                </div>
                {selection.label}
              </Select.Item>
              {/each}
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      <div class="relative flex flex-col gap-2" bind:this={listEl}>
        {#each messages as message, i (message)}
          <div
            data-message-row
            class="flex items-start gap-2 place-items-center"
            style:visibility={draggingIndex === i ? 'hidden' : null}
            animate:flip={{ duration: 150 }}
          >
            <button
              type="button"
              class="btn btn-ghost btn-square mt-0.5 shrink-0 cursor-grab touch-none active:cursor-grabbing"
              aria-label="Drag to reorder message"
              onpointerdown={(e) => startDrag(e, i)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-5" aria-hidden="true">
                <circle cx="9" cy="6" r="1.5" />
                <circle cx="15" cy="6" r="1.5" />
                <circle cx="9" cy="12" r="1.5" />
                <circle cx="15" cy="12" r="1.5" />
                <circle cx="9" cy="18" r="1.5" />
                <circle cx="15" cy="18" r="1.5" />
              </svg>
            </button>
            <div class="min-w-0 flex-1">
              <MessageItem bind:item={messages[i]} />
            </div>
          </div>
        {/each}
      </div>
      <button class="btn" aria-label="Add message" onclick={addMessage}>+</button>
    </div>
  </div>
</div>
