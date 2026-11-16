<script lang="ts">
import { Select } from 'bits-ui';
import { getMe, type MessageItem } from '#lib/context.ts';
import { characters } from '#lib/characters.ts';

let { item = $bindable() }: { item: MessageItem } = $props();

// `getMe()` returns the accessor stored in context; resolve it once during
// initialisation, then call it inside `$derived` to track `me` changes.
const getCurrentMe = getMe();
const me = $derived(getCurrentMe());

const selections = $derived([
  {
    value: me.id,
    label: `Me [${me.name}]`,
    thumbnail: me.image
  },
  ...characters.slice(2).filter((char) => char.id !== me.id).map((char) => {
    return {
      value: char.id,
      label: char.name,
      thumbnail: char.image
    }
  })
]);

// Items sent as "Me" follow the current player character; everything else
// keeps the character the user picked.
const senderId = $derived(item.me ? me.id : item.sender.id);

function setSender(value: string) {
  if (value === me.id) {
    item.me = true;
    return;
  }

  const character = characters.find((char) => char.id === value);
  if (character) {
    item.me = false;
    item.sender = character;
  }
}
</script>

<div class="flex flex-col gap-2">
  <div class="flex gap-2">
    <Select.Root type="single" items={selections} allowDeselect={false} bind:value={() => senderId, (v) => setSender(v)}>
      <Select.Trigger class="flex-1 select inline-flex h-input items-center rounded-9px border border-border-input bg-gray-800 px-2.75 text-sm transition-colors select-none data-placeholder:text-foreground-alt/50" aria-label="Select sender">
        <div class="avatar">
          <div class="w-8 rounded-xl">
            <img alt="Profile" src={selections.find(s => s.value === senderId)?.thumbnail} />
          </div>
        </div>
        {selections.find(s => s.value === senderId)?.label}
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
      {#if !item.me}
        <input type="text" placeholder="Name override" class="input flex-1" bind:value={item.override} />
      {/if}
  </div>
  <input type="text" placeholder="Message" class="input w-full" bind:value={item.text} />
</div>
