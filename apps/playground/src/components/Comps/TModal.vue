<template>
  <BContainer fluid>
    <BOrchestrator />
    <BRow>
      <BCol>
        <BButton @click="showModal = !showModal">Toggle dialog v-model</BButton>
        <BButton v-bind="exampleToggle.props.value">Toggle with useComponentToggle</BButton>
        {{ showModal }}
        <BDialog
          id="exampleModal"
          v-model="showModal"
          :backdrop="noClose ? 'static' : true"
          size="xl"
          title="Dialog title"
        >
          ...
          <template #footer>
            <BDialogActions />
          </template>
        </BDialog>
      </BCol>
    </BRow>
    <BRow>
      <BCol>
        <BDialog
          v-model="isModalVisible"
          :keyboard="!noClose"
          :backdrop="noClose ? 'static' : true"
          title="My Dialog"
        >
          abc
        </BDialog>

        <BButton @click="isModalVisible = true">Show Dialog</BButton>
      </BCol>
    </BRow>
    <BRow>
      <BCol>
        <BDialog v-model="showModal2" title="First">
          <BButton @click="showModal3 = true">Click me</BButton>
          <BDialog v-model="showModal3" title="Stacked" />
        </BDialog>
        <BButton @click="showModal2 = true">Show stacked dialogs</BButton>
        <BButton @click="showNonModal = !showNonModal">Toggle non-modal dialog</BButton>
        <BDialog v-model="showNonModal" :modal="false" slide="up" title="Non-modal">
          The page stays usable.
        </BDialog>
      </BCol>
    </BRow>
    <BRow>
      <BCol>
        <div>noClose is {{ noClose }}</div>
        <BButton @click="noClose = true">Set noClose = true</BButton>
        <BButton @click="noClose = false">Set noClose = false</BButton>
      </BCol>
    </BRow>
    <BRow>
      <BCol>
        <BButton v-for="(fn, name) in showFns" :key="name" @click="fn">{{ name }}</BButton>
      </BCol>
    </BRow>
    <BRow>
      <BCol>
        {{ modalCount }}
      </BCol>
    </BRow>
  </BContainer>
</template>

<script setup lang="ts">
import {computed, h, onMounted, onUnmounted, ref, watchEffect} from 'vue'
import type {DialogOrchestratorCreateParamBase} from 'bootstrap-vue-next'
import {useOrchestratorRegistry} from 'bootstrap-vue-next/composables/orchestratorShared'
import {BDialog, BDialogActions} from 'bootstrap-vue-next/components/BDialog'
import {useDialog} from 'bootstrap-vue-next/composables/useDialog'
import {useComponentToggle} from 'bootstrap-vue-next/composables/useComponentToggle'

const {create} = useDialog()
const {store} = useOrchestratorRegistry()
const modalCount = computed(() => store.value.dialog.size)

const showModal = ref(false)
const showModal2 = ref(false)
const exampleToggle = useComponentToggle('exampleModal')
const showModal3 = ref(false)
const showNonModal = ref(false)

const noClose = ref(true)
const isModalVisible = ref(false)

const body = ref<DialogOrchestratorCreateParamBase['body']>('foo')
const firstRef = ref<DialogOrchestratorCreateParamBase>({
  // If we want to sync this, we will need a watcher
  body: body.value,
  title: 'foobar',
})
let interval: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  interval = setInterval(() => {
    body.value = body.value === 'foo' ? 'bar' : 'foo'
  }, 1000)
})
onUnmounted(() => {
  if (interval !== null) {
    clearInterval(interval)
  }
})
watchEffect(() => {
  firstRef.value.body = body.value
})

const dynamicModalModelValue = ref<DialogOrchestratorCreateParamBase['modelValue']>(false)
const dynamicModal = computed<DialogOrchestratorCreateParamBase>({
  get: () => ({
    // We use a computed to make derivations down below, but we NEED to make sure we have a syncable modelValue. So we use a writable computed
    modelValue: dynamicModalModelValue.value,

    body: 'my body',
    title: 'my title',
    size: firstRef.value.body === 'foo' ? ('sm' as const) : ('lg' as const),
  }),
  set: (value) => {
    dynamicModalModelValue.value = value.modelValue ?? dynamicModalModelValue.value
  },
})

const showFns = {
  basicNoReactive: async () => {
    await using _ = await create({
      title: 'foobar',
      body: 'OK and Cancel come from the default BDialogActions footer',
    }).show()
    return _
  },
  basicCustomComponent: async () => {
    await using _ = await create(
      {},
      {
        slots: {
          default: () => h('div', null, {default: () => 'foobar!'}),
          footer: () => h(BDialogActions, {okOnly: true, okTitle: 'Got it'}),
        },
      }
    ).show()
    return _
  },
  simpleRefProps: async () => {
    await using _ = await create(firstRef).show()
    return _
  },
  dynamicRefProps: async () => {
    await using _ = await create(dynamicModal).show()
    return _
  },
  // Demonstration pseudocode, you can import a component and use it
  // importedComponent: () => {
  //   create({}, {component: (await import('./MyModalComponent.vue')).default})
  // },
}
</script>
