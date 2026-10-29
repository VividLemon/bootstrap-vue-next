<template>
  <div>
    <BFormGroup v-slot="{ ariaDescribedby }" label="Table Options" label-cols-lg="2">
      <BFormCheckbox v-model="striped" :aria-describedby="ariaDescribedby" inline
        >Striped</BFormCheckbox
      >
      <BFormCheckbox v-model="stripedColumns" :aria-describedby="ariaDescribedby" inline
        >Striped Columns</BFormCheckbox
      >
      <BFormCheckbox v-model="bordered" :aria-describedby="ariaDescribedby" inline
        >Bordered</BFormCheckbox
      >
      <BFormCheckbox v-model="borderless" :aria-describedby="ariaDescribedby" inline
        >Borderless</BFormCheckbox
      >
      <BFormCheckbox v-model="outlined" :aria-describedby="ariaDescribedby" inline
        >Outlined</BFormCheckbox
      >
      <BFormCheckbox v-model="small" :aria-describedby="ariaDescribedby" inline
        >Small</BFormCheckbox
      >
      <BFormCheckbox v-model="hover" :aria-describedby="ariaDescribedby" inline
        >Hover</BFormCheckbox
      >
      <BFormCheckbox v-model="dark" :aria-describedby="ariaDescribedby" inline>Dark</BFormCheckbox>
      <BFormCheckbox v-model="fixed" :aria-describedby="ariaDescribedby" inline
        >Fixed</BFormCheckbox
      >
      <BFormCheckbox v-model="footClone" :aria-describedby="ariaDescribedby" inline
        >Foot Clone</BFormCheckbox
      >
      <BFormCheckbox v-model="noCollapse" :aria-describedby="ariaDescribedby" inline
        >No border collapse</BFormCheckbox
      >
    </BFormGroup>

    <BFormGroup label="Theme" label-for="table-style-theme" label-cols-lg="2" class="my-2">
      <BFormSelect id="table-style-theme" v-model="theme" :options="themes">
        <template #first>
          <option :value="null">-- None --</option>
        </template>
      </BFormSelect>
    </BFormGroup>

    <BFormGroup label="Head Theme" label-for="head-style-theme" label-cols-lg="2" class="my-2">
      <BFormSelect id="head-style-theme" v-model="headTheme" :options="themes">
        <template #first>
          <option :value="null">-- None --</option>
        </template>
      </BFormSelect>
    </BFormGroup>

    <BFormGroup label="Foot Theme" label-for="foot-style-theme" label-cols-lg="2" class="my-2">
      <BFormSelect id="foot-style-theme" v-model="footTheme" :options="themes">
        <template #first>
          <option :value="null">-- None --</option>
        </template>
      </BFormSelect>
    </BFormGroup>

    <BTable
      :striped="striped"
      :striped-columns="stripedColumns"
      :bordered="bordered"
      :borderless="borderless"
      :outlined="outlined"
      :small="small"
      :hover="hover"
      v-b-color-mode="dark ? 'dark' : 'light'"
      :fixed="fixed"
      :foot-clone="footClone"
      :no-border-collapse="noCollapse"
      :items="items"
      :fields="fields"
      :theme="theme"
      :head-theme="headTheme"
      :foot-theme="footTheme"
    />
  </div>
</template>

<script setup lang="ts">
import type { ThemeColor } from 'bootstrap-vue-next'
import { ref } from 'vue'

const fields = ['first_name', 'last_name', 'age']
const items = [
  { age: 40, first_name: 'Dickerson', last_name: 'Macdonald' },
  { age: 21, first_name: 'Larsen', last_name: 'Shaw' },
  { age: 89, first_name: 'Geneva', last_name: 'Wilson' },
]

const striped = ref(false)
const stripedColumns = ref(false)
const bordered = ref(false)
const borderless = ref(false)
const outlined = ref(false)
const small = ref(false)
const hover = ref(false)
const dark = ref(false)
const fixed = ref(false)
const footClone = ref(false)
const theme = ref<ThemeColor | null>(null)
const headTheme = ref<ThemeColor | null>(null)
const footTheme = ref<ThemeColor | null>(null)
const noCollapse = ref(false)

const themes = [
  { text: 'Primary', value: 'primary' as ThemeColor },
  { text: 'Secondary', value: 'secondary' as ThemeColor },
  { text: 'Info', value: 'info' as ThemeColor },
  { text: 'Danger', value: 'danger' as ThemeColor },
  { text: 'Warning', value: 'warning' as ThemeColor },
  { text: 'Success', value: 'success' as ThemeColor },
  { text: 'Inverse', value: 'inverse' as ThemeColor },
]
</script>
