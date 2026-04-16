<template>
  <AutocompleteRoot
    v-model="modelValue"
    v-model:open="isOpen"
    :disabled="props.disabled"
    :ignore-filter="isExternalSearch"
    open-on-focus
    open-on-click
    class="b-autocomplete"
    @update:model-value="onUpdateModelValue"
  >
    <AutocompleteAnchor class="b-autocomplete-anchor">
      <AutocompleteInput
        v-model="searchModel"
        class="form-control"
        :placeholder="props.placeholder"
        :disabled="props.disabled"
        @input="onInput"
      />
      <AutocompleteTrigger
        class="b-autocomplete-trigger"
        :disabled="props.disabled"
      >
        <svg
          class="b-autocomplete-chevron"
          :class="{'b-autocomplete-chevron-open': isOpen}"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
          />
        </svg>
      </AutocompleteTrigger>
    </AutocompleteAnchor>

    <AutocompleteContent class="b-autocomplete-content dropdown-menu show">
      <AutocompleteViewport class="b-autocomplete-viewport">
        <AutocompleteEmpty class="b-autocomplete-empty"> No results found. </AutocompleteEmpty>
        <AutocompleteItem
          v-for="option in props.options"
          :key="option"
          :value="option"
          class="b-autocomplete-item dropdown-item"
        >
          <slot :option="option">
            {{ option }}
          </slot>
          <AutocompleteItemIndicator class="b-autocomplete-item-indicator">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path
                d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z"
              />
            </svg>
          </AutocompleteItemIndicator>
        </AutocompleteItem>
      </AutocompleteViewport>
    </AutocompleteContent>
  </AutocompleteRoot>
</template>

<script setup lang="ts">
import {computed, ref, watch} from 'vue'
import {
  AutocompleteAnchor,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteItemIndicator,
  AutocompleteRoot,
  AutocompleteTrigger,
  AutocompleteViewport,
} from 'reka-ui'

const props = withDefaults(
  defineProps<{
    disabled?: boolean
    modelValue?: string
    options?: string[]
    placeholder?: string
    search?: string
  }>(),
  {
    disabled: false,
    modelValue: '',
    options: () => [],
    placeholder: undefined,
    search: '',
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:search': [value: string]
}>()

const modelValue = computed({
  get: () => props.modelValue,
  set: (val: string) => {
    emit('update:modelValue', val)
  },
})

const searchModel = ref(props.search)

const isOpen = ref(false)

const isExternalSearch = computed(() => props.search !== '')

watch(
  () => props.search,
  (val) => {
    searchModel.value = val
  }
)

function onInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:search', target.value)
}

function onUpdateModelValue(value: string) {
  emit('update:modelValue', value)
  // When an item is selected, update search to match
  searchModel.value = value
  emit('update:search', value)
}
</script>