import { createContext } from 'svelte';
import { type Character } from '#lib/characters.ts';

export type MessageItem = {
  me: boolean,
  sender: Character,
  override: string,
  text: string
}

export const [getMe, setMe] = createContext<Character>();
export const [getMessages, setMessages] = createContext<MessageItem[]>();