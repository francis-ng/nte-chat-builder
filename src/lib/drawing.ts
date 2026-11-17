import { type Character } from '#lib/characters.ts';
import { type MessageItem } from '#lib/context.ts';

/** Layout constants, all in CSS pixels. */
const SIDE = 26;
const TOP = 28;
const BOTTOM = 28;
const AVATAR = 46;
const AVATAR_RADIUS = 14;
const AVATAR_GAP = 12;
const ROW_GAP = 20;
const BUBBLE_PAD_X = 15;
const BUBBLE_PAD_Y = 11;
const BUBBLE_RADIUS = 18;
const TAIL = 7;
const NAME_SIZE = 12;
const NAME_LINE = 16;
const NAME_GAP = 3;
const TEXT_SIZE = 15;
const TEXT_LINE = 21;
const EMPTY_HEIGHT = 168;

const TEXT_FONT = `400 ${TEXT_SIZE}px "Segoe UI Variable Text", "Segoe UI", system-ui, -apple-system, sans-serif`;
const NAME_FONT = `600 ${NAME_SIZE}px "Segoe UI Variable Text", "Segoe UI", system-ui, -apple-system, sans-serif`;

type ImageEntry = {
  image: HTMLImageElement;
  state: 'loading' | 'loaded' | 'error';
};

const imageCache = new Map<string, ImageEntry>();

function getImage(src: string, onLoad: () => void): HTMLImageElement | null {
  if (!src) return null;

  let entry = imageCache.get(src);
  if (!entry) {
    if (typeof Image === 'undefined') return null;

    const image = new Image();
    entry = { image, state: 'loading' };
    imageCache.set(src, entry);

    image.onload = () => {
      entry!.state = 'loaded';
      onLoad();
    };
    image.onerror = () => {
      entry!.state = 'error';
      onLoad();
    };
    image.src = src;

    // Cached images can already be complete before the handlers are attached.
    if (image.complete && image.naturalWidth > 0) entry.state = 'loaded';
  }

  return entry.state === 'loaded' ? entry.image : null;
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const limit = Math.max(8, maxWidth);
  ctx.font = TEXT_FONT;

  const lines: string[] = [];
  const paragraphs = text.replace(/\r\n?/g, '\n').split('\n');

  for (const paragraph of paragraphs) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push('');
      continue;
    }

    let line = '';
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (ctx.measureText(candidate).width <= limit) {
        line = candidate;
        continue;
      }

      if (line) lines.push(line);
      line = '';

      // A single word wider than the bubble has to break mid-word. This also
      // covers CJK text, which arrives as one whitespace-free token.
      if (ctx.measureText(word).width <= limit) {
        line = word;
        continue;
      }

      for (const char of Array.from(word)) {
        if (line && ctx.measureText(line + char).width > limit) {
          lines.push(line);
          line = char;
        } else {
          line += char;
        }
      }
    }

    lines.push(line);
  }

  return lines.length > 0 ? lines : [''];
}

function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;

  const chars = Array.from(text);
  while (chars.length > 0) {
    chars.pop();
    const candidate = `${chars.join('')}…`;
    if (ctx.measureText(candidate).width <= maxWidth) return candidate;
  }
  return '…';
}

type Row = {
  me: boolean;
  image: string;
  name: string;
  lines: string[];
  bubbleX: number;
  bubbleY: number;
  bubbleW: number;
  bubbleH: number;
  avatarX: number;
  avatarY: number;
};

function layoutRows(
  ctx: CanvasRenderingContext2D,
  messages: MessageItem[],
  me: Character,
  width: number
): Row[] {
  const maxBubble = Math.max(72, Math.min(width * 0.68, width - SIDE * 2 - AVATAR - AVATAR_GAP - TAIL));
  const maxContent = Math.max(40, maxBubble - BUBBLE_PAD_X * 2);

  const rows: Row[] = [];
  let y = TOP;

  for (const message of messages) {
    const sender = message.me ? me : message.sender;
    const name = message.me ? me.name : (message.override.trim() || sender.name);
    const lines = wrapText(ctx, message.text, maxContent);

    ctx.font = NAME_FONT;
    const fittedName = fitText(ctx, name, maxContent);
    const nameWidth = ctx.measureText(fittedName).width;

    ctx.font = TEXT_FONT;
    let textWidth = 0;
    for (const line of lines) {
      textWidth = Math.max(textWidth, ctx.measureText(line).width);
    }

    const bubbleW = Math.ceil(Math.min(maxBubble, BUBBLE_PAD_X * 2 + Math.max(textWidth, nameWidth, 8)));
    const bubbleH = Math.max(AVATAR, BUBBLE_PAD_Y * 2 + NAME_LINE + NAME_GAP + lines.length * TEXT_LINE);

    const avatarX = message.me ? width - SIDE - AVATAR : SIDE;
    const bubbleX = message.me
      ? avatarX - AVATAR_GAP - TAIL - bubbleW
      : SIDE + AVATAR + AVATAR_GAP + TAIL;

    rows.push({
      me: message.me,
      image: sender.image,
      name: fittedName,
      lines,
      bubbleX,
      bubbleY: y,
      bubbleW,
      bubbleH,
      avatarX,
      avatarY: y
    });

    y += Math.max(AVATAR, bubbleH) + ROW_GAP;
  }

  return rows;
}

function drawAvatar(ctx: CanvasRenderingContext2D, row: Row, onLoad: () => void) {
  const { avatarX: x, avatarY: y } = row;
  const image = getImage(row.image, onLoad);

  ctx.save();
  roundedRect(ctx, x, y, AVATAR, AVATAR, AVATAR_RADIUS);
  ctx.clip();

  if (image) {
    // Cover-crop the square source so non-square avatars are not distorted.
    const size = Math.min(image.naturalWidth, image.naturalHeight);
    const sx = (image.naturalWidth - size) / 2;
    const sy = (image.naturalHeight - size) / 2;
    ctx.drawImage(image, sx, sy, size, size, x, y, AVATAR, AVATAR);
  } else {
    const gradient = ctx.createLinearGradient(x, y, x, y + AVATAR);
    gradient.addColorStop(0, '#323b4d');
    gradient.addColorStop(1, '#222936');
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, AVATAR, AVATAR);

    const initial = row.name.trim().charAt(0).toUpperCase() || '?';
    ctx.fillStyle = 'rgba(235, 241, 250, 0.82)';
    ctx.font = '600 18px "Segoe UI Variable Text", "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initial, x + AVATAR / 2, y + AVATAR / 2 + 1);
  }

  ctx.restore();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
  ctx.lineWidth = 1;
  roundedRect(ctx, x + 0.5, y + 0.5, AVATAR - 1, AVATAR - 1, AVATAR_RADIUS);
  ctx.stroke();
}

function drawBubble(ctx: CanvasRenderingContext2D, row: Row) {
  const { bubbleX, bubbleY, bubbleW, bubbleH, me } = row;
  const fill = me ? '#2f6df6' : '#1e2532';
  const stroke = me ? 'rgba(120, 166, 255, 0.55)' : 'rgba(255, 255, 255, 0.1)';

  // Speech tail pointing at the avatar on the outer side.
  const tailY = bubbleY + 18;
  ctx.beginPath();
  if (me) {
    ctx.moveTo(bubbleX + bubbleW, tailY);
    ctx.lineTo(bubbleX + bubbleW + TAIL, tailY + 5);
    ctx.lineTo(bubbleX + bubbleW, tailY + 12);
  } else {
    ctx.moveTo(bubbleX, tailY);
    ctx.lineTo(bubbleX - TAIL, tailY + 5);
    ctx.lineTo(bubbleX, tailY + 12);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.32)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 5;
  roundedRect(ctx, bubbleX, bubbleY, bubbleW, bubbleH, BUBBLE_RADIUS);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.restore();

  roundedRect(ctx, bubbleX + 0.5, bubbleY + 0.5, bubbleW - 1, bubbleH - 1, BUBBLE_RADIUS);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1;
  ctx.stroke();

  // The text is laid out with the same metrics used for measuring, so it
  // always lands inside the measured bubble.
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  ctx.font = NAME_FONT;
  ctx.fillStyle = me ? 'rgba(255, 255, 255, 0.74)' : 'rgba(168, 186, 210, 0.92)';
  ctx.fillText(row.name, bubbleX + BUBBLE_PAD_X, bubbleY + BUBBLE_PAD_Y);

  ctx.font = TEXT_FONT;
  ctx.fillStyle = me ? '#ffffff' : '#e8eef9';
  let textY = bubbleY + BUBBLE_PAD_Y + NAME_LINE + NAME_GAP;
  for (const line of row.lines) {
    if (line) ctx.fillText(line, bubbleX + BUBBLE_PAD_X, textY);
    textY += TEXT_LINE;
  }
}

function drawEmptyState(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.font = '600 14px "Segoe UI Variable Text", "Segoe UI", system-ui, sans-serif';
  ctx.fillStyle = 'rgba(210, 222, 240, 0.66)';
  ctx.fillText('No messages yet', width / 2, height / 2 - 8);

  ctx.font = '400 12px "Segoe UI Variable Text", "Segoe UI", system-ui, sans-serif';
  ctx.fillStyle = 'rgba(160, 178, 203, 0.5)';
  ctx.fillText('Add a message to see the preview', width / 2, height / 2 + 14);
}

export function renderPreview(
  canvas: HTMLCanvasElement | null,
  ctx: CanvasRenderingContext2D | null,
  messages: MessageItem[],
  me: Character,
  onAssetLoad: () => void = () => {}
): void {
  if (canvas === null || ctx === null) return;

  const cssW = Math.max(1, Math.round(canvas.clientWidth || canvas.parentElement?.clientWidth || 640));

  const rows = layoutRows(ctx, messages, me, cssW);
  let contentHeight = EMPTY_HEIGHT;
  if (rows.length > 0) {
    const last = rows[rows.length - 1];
    contentHeight = last.bubbleY + Math.max(AVATAR, last.bubbleH) + BOTTOM;
  }
  const cssH = Math.max(1, Math.round(contentHeight));

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);
  if (canvas.style.height !== `${cssH}px`) canvas.style.height = `${cssH}px`;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssW, cssH);

  const background = ctx.createLinearGradient(0, 0, cssW, cssH);
  background.addColorStop(0, '#151b26');
  background.addColorStop(0.55, '#10141d');
  background.addColorStop(1, '#0a0d13');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, cssW, cssH);

  if (rows.length === 0) {
    drawEmptyState(ctx, cssW, cssH);
    return;
  }

  for (const row of rows) {
    drawBubble(ctx, row);
    drawAvatar(ctx, row, onAssetLoad);
  }
}
