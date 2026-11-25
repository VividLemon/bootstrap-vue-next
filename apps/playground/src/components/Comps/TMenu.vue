<template>
  <BContainer fluid>
    <BRow>
      <BCol>
        <h4 class="m-2">Sizes</h4>
        <div class="d-flex flex-wrap gap-2 m-2">
          <BMenu text="Small" size="sm">
            <BMenuItem href="#">Action</BMenuItem>
          </BMenu>
          <BMenu text="Medium">
            <BMenuItem href="#">Action</BMenuItem>
          </BMenu>
          <BMenu text="Large" size="lg">
            <BMenuItem href="#">Action</BMenuItem>
          </BMenu>
        </div>
      </BCol>
    </BRow>
    <BRow>
      <BCol>
        <h4 class="m-2">v-model and disabled</h4>
        <div class="d-flex flex-wrap gap-2 m-2 align-items-center">
          <BMenu v-model="state" text="using v-model" :disabled="disabled">
            <BMenuItem href="#">Action</BMenuItem>
          </BMenu>
          <span>Open: {{ state }}</span>
          <BFormCheckbox v-model="disabled" switch>Disabled</BFormCheckbox>
        </div>
      </BCol>
    </BRow>
    <BRow>
      <BCol>
        <h4 class="m-2">Events</h4>
        <BMenu
          text="Logs events"
          class="m-2"
          @show="consoleLog('show', $event)"
          @shown="consoleLog('shown', $event)"
          @hide="consoleLog('hide', $event.trigger)"
          @hidden="consoleLog('hidden', $event.trigger)"
        >
          <BMenuItem href="#">Action</BMenuItem>
        </BMenu>
      </BCol>
    </BRow>
    <BRow>
      <BCol>
        <h4 class="m-2">Placement</h4>
        <div class="d-flex flex-wrap gap-2 m-2">
          <BMenu
            v-for="placement in placements"
            :key="placement"
            :placement="placement"
            :text="placement"
          >
            <BMenuItem href="#">Action</BMenuItem>
            <BMenuItem href="#">Action</BMenuItem>
          </BMenu>
          <BMenu text="Responsive" :responsive-placement="{ md: 'end-start', lg: 'top-end' }">
            <BMenuItem href="#">Action</BMenuItem>
          </BMenu>
          <BMenu text="Offset [10, 20]" :offset="[10, 20]">
            <BMenuItem href="#">Action</BMenuItem>
          </BMenu>
        </div>
      </BCol>
    </BRow>
    <BRow>
      <BCol>
        <h4 class="m-2">Auto close and scrollable</h4>
        <div class="d-flex flex-wrap gap-2 m-2">
          <BMenu text="Auto close inside" auto-close="inside">
            <BMenuItem href="#">Action</BMenuItem>
          </BMenu>
          <BMenu text="Auto close outside" auto-close="outside">
            <BMenuItem href="#">Action</BMenuItem>
          </BMenu>
          <BMenu text="Scrollable" scrollable translucent>
            <BMenuItem v-for="i in 200" :key="i" href="#">Action {{ i }}</BMenuItem>
          </BMenu>
        </div>
      </BCol>
    </BRow>
    <BRow>
      <BCol>
        <h4 class="m-2">Items</h4>
        <BMenu text="Various items" class="m-2" auto-close="outside">
          <BMenuHeader>Header</BMenuHeader>
          <BMenuItem href="#">Link</BMenuItem>
          <BMenuItem description="With a description">Button</BMenuItem>
          <BMenuItem :color="{ theme: 'danger' }">Danger</BMenuItem>
          <BMenuItem :selected="selected" @click="selected = !selected">Selectable</BMenuItem>
          <BMenuDivider />
          <BMenuItem href="#" active>Active action</BMenuItem>
          <BMenuItem href="#" disabled>Disabled action</BMenuItem>
          <BMenuText>Some text</BMenuText>
          <BMenuItem to="/">Router link</BMenuItem>
        </BMenu>
      </BCol>
    </BRow>
    <BRow>
      <BCol>
        <h4 class="m-2">Split</h4>
        <div class="d-flex flex-wrap gap-2 m-2">
          <BMenu split text="Split" @split-click="consoleLog('split click')">
            <BMenuItem href="#">Action</BMenuItem>
          </BMenu>
          <BMenu
            split
            split-href="#foo"
            text="Split link"
            variant="outline"
            :color="{ theme: 'primary' }"
          >
            <BMenuItem href="#">Action</BMenuItem>
          </BMenu>
          <BButtonGroup>
            <BButton>Left</BButton>
            <BMenu split text="In a group">
              <BMenuItem href="#">Action</BMenuItem>
            </BMenu>
          </BButtonGroup>
        </div>
      </BCol>
    </BRow>
    <BRow>
      <BCol>
        <h4 class="m-2">Custom toggle</h4>
        <BMenu class="m-2">
          <template #activator="{ props }">
            <BBadge tag="button" type="button" v-bind="props">Badge opener</BBadge>
          </template>
          <BMenuItem href="#">Action</BMenuItem>
        </BMenu>
        <BMenu text="Toggle slot" class="m-2" variant="link">
          <template #toggle>
            <img src="../../assets/logo.png" style="height: 1em" alt="Menu" />
          </template>
          <BMenuItem href="#">Action</BMenuItem>
        </BMenu>
      </BCol>
    </BRow>
  </BContainer>
</template>

<script setup lang="ts">
import type {MenuPlacement} from 'bootstrap-vue-next'
import {ref} from 'vue'

const consoleLog = (...args: unknown[]) => console.log(...args)
const state = ref(false)
const disabled = ref(false)
const selected = ref(false)
const placements: MenuPlacement[] = ['bottom-start', 'bottom-end', 'top', 'start', 'end-start']
</script>
