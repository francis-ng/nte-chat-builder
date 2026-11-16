import { createContext } from 'svelte';
import { type Character } from '#lib/characters.ts';

export type MessageItem = {
  me: boolean,
  sender: Character,
  override: string,
  text: string
}

/**
 * The current player character. `me` is reassigned when the page's sender
 * selection changes, so the context carries a getter instead of a snapshot of
 * the value — passing the character itself would only capture its initial
 * value and never update.
 */
export const [getMe, setMe] = createContext<() => Character>();
export const [getMessages, setMessages] = createContext<MessageItem[]>();