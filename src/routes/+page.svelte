<script lang="ts">
import { type Character, characters } from '#lib/characters.ts';
  import MessageItem from '#lib/components/MessageItem.svelte';
import { setMe } from '#lib/context.ts';

let me = $state<Character>(characters[0]);
setMe(me);
</script>

<div class="w-full h-dvh flex">
  <div class="flex-1 bg-amber-800">
    <div class="flex flex-col gap-2 p-4">

    </div>
  </div>
  <div class="flex-2 bg-blue-800">
    <div class="flex flex-col gap-2 p-4">
      <h1>NTE Message Generator</h1>
      <MessageItem />
    </div>
  </div>
</div>