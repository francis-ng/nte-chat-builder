<script lang="ts">
import { Select } from 'bits-ui';
import { type Character, characters } from '#lib/characters.ts';
import MessageItem from '#lib/components/MessageItem.svelte';
import { type MessageItem as MessageItemData, setMessages, setMe } from '#lib/context.ts';

const selections = characters.map(c => {
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
</script>

<div class="w-full h-dvh flex">
  <div class="flex-1 bg-amber-800">
    <div class="flex flex-col gap-2 p-4">

    </div>
  </div>
  <div class="flex-2 bg-blue-800">
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
      {#each messages as message, i (message)}
        <MessageItem bind:item={messages[i]} />
      {/each}
      <button class="btn" aria-label="Add message" onclick={addMessage}>+</button>
    </div>
  </div>
</div>
