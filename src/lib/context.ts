import { createContext } from 'svelte';
import { type Character, characters } from '#lib/characters.ts';

export type MessageItem = {
  me: boolean,
  sender: Character,
  override: string,
  text: string
}

export const [getMe, setMe] = createContext<() => Character>();
export const [getMessages, setMessages] = createContext<MessageItem[]>();

const getChar = (name: string) => characters.find(c => c.name === name) as Character;
export const initialMessages: MessageItem[] = [
  {
    me: false,
    sender: getChar('Elyms'),
    text: 'Appraiser appraiser',
    override: ''
  },
  {
    me: true,
    sender: getChar('Zero (Female)'),
    text: 'hm?',
    override: ''
  },
  {
    me: false,
    sender: getChar('Elyms'),
    text: 'Want to play a game?',
    override: ''
  },
];