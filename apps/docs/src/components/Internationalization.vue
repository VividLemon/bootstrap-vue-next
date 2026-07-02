<template>
  <div>
    <p>
      BootstrapVueNext ships with English text defaults. These defaults are intended to be
      overridden for non-English applications where appropriate.
    </p>
    <template v-if="props.props && props.props.length > 0">
      <p>The following props provide override points for user-facing text:</p>
      <ul>
        <li v-for="item in props.props" :key="item.prop">
          <code>{{ item.prop }}</code
          ><template v-if="item.description"> — {{ item.description }}</template>
        </li>
      </ul>
    </template>
    <template v-if="props.slots && props.slots.length > 0">
      <p>The following slots can be used to replace text with custom content:</p>
      <ul>
        <li v-for="item in props.slots" :key="item.slot">
          <code>#{{ item.slot }}</code
          ><template v-if="item.description"> — {{ item.description }}</template>
        </li>
      </ul>
    </template>
    <template v-if="props.notes">
      <p>{{ props.notes }}</p>
    </template>
  </div>
</template>

<script setup lang="ts">
interface PropEntry {
  prop: string
  description?: string
}

interface SlotEntry {
  slot: string
  description?: string
}

const props = defineProps<{
  props?: PropEntry[]
  slots?: SlotEntry[]
  notes?: string
}>()
</script>
