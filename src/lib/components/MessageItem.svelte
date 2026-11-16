<script lang="ts">
import { Select } from 'bits-ui';
import { getMe } from '#lib/context.ts';
import { characters } from '#lib/characters.ts';

const me = getMe();
const selections = [
  {
    value: me.id,
    label: me.name,
    thumbnail: me.image
  },
  ...characters.slice(2).map((char) => {
    return {
      value: char.id,
      label: char.name,
      thumbnail: char.image
    }
  })
];

let sender = $state(me.id);
</script>

<div class="flex flex-col gap-2">
  <div class="flex gap-2">
    <Select.Root type="single" items={selections} allowDeselect={false} bind:value={sender}>
      <Select.Trigger class="flex-1 select inline-flex h-input items-center rounded-9px border border-border-input bg-gray-800 px-2.75 text-sm transition-colors select-none data-placeholder:text-foreground-alt/50" aria-label="Select sender">
        <Select.Value placeholder="Select sender" />
      </Select.Trigger>
      <Select.Portal>
        <Select.Content class="focus-override z-50 h-96 max-h-(--bits-select-content-available-height) w-(--bits-select-anchor-width) min-w-(--bits-select-anchor-width) rounded-xl border border-gray-600 bg-gray-800 px-1 py-3 shadow-popover outline-hidden select-none data-[side=bottom]:translate-y-1 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:-translate-x-1 data-[side=left]:slide-in-from-right-2 data-[side=right]:translate-x-1 data-[side=right]:slide-in-from-left-2 data-[side=top]:-translate-y-1 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          <Select.Viewport class="p-2">
            {#each selections as selection (selection.value)}
            <Select.Item class="flex h-10 w-full items-center rounded-button py-3 pr-1.5 pl-5 text-sm capitalize outline-hidden select-none data-disabled:opacity-50 data-highlighted:bg-gray-600"
                value={selection.value}
                label={selection.label}
              >
                {selection.label}
              </Select.Item>
              {/each}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
      <input type="text" placeholder="Override" class="input flex-1" />
  </div>
  <input type="text" placeholder="Message" class="input w-full" />
</div>