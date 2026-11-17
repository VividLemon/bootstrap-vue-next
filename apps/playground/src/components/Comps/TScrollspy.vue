<template>
  <BContainer>
    <h2 class="my-3">Basic (smooth scroll)</h2>
    <p>current: {{ current }}</p>
    <BCard id="basic" no-body>
      <BCardHeader>
        <BNav ref="target" pills card-header>
          <BNavItem
            v-for="id in basicIds"
            :key="id"
            :href="`#${id}`"
            :active="current === id"
            :link-attrs="{'aria-current': current === id ? 'location' : undefined}"
          >
            {{ id }}
          </BNavItem>
        </BNav>
      </BCardHeader>
      <BCardBody
        ref="content"
        style="position: relative; height: 300px; overflow-y: auto"
        tabindex="0"
      >
        <template v-for="id in basicIds" :key="id">
          <h4 :id="id">{{ id }}</h4>
          <p v-for="i in 3" :key="i">{{ lorem }}</p>
        </template>
      </BCardBody>
    </BCard>

    <h2 class="my-3">Nested</h2>
    <p>activeIds: {{ nestedActiveIds }}</p>
    <BCard>
      <BRow>
        <BCol :cols="{xs: 4}">
          <BNav ref="targetNested" pills vertical>
            <BNavItem
              v-for="item in nested"
              :key="item.id"
              :href="`#${item.id}`"
              :active="nestedActiveIds.includes(item.id)"
            >
              {{ item.id }}
              <template v-if="item.children.length" #after>
                <BNav pills vertical class="ms-3">
                  <BNavItem
                    v-for="child in item.children"
                    :key="child"
                    :href="`#${child}`"
                    :active="nestedActiveIds.includes(child)"
                  >
                    {{ child }}
                  </BNavItem>
                </BNav>
              </template>
            </BNavItem>
          </BNav>
        </BCol>
        <BCol :cols="{xs: 8}">
          <div ref="contentNested" style="position: relative; height: 300px; overflow-y: auto">
            <template v-for="item in nested" :key="item.id">
              <h4 :id="item.id">{{ item.id }}</h4>
              <p>{{ lorem }}</p>
              <template v-for="child in item.children" :key="child">
                <h5 :id="child">{{ child }}</h5>
                <p>{{ lorem }}</p>
              </template>
            </template>
          </div>
        </BCol>
      </BRow>
    </BCard>

    <h2 class="my-3">Dynamic list (page scroll, sticky header)</h2>
    <p>current: {{ currentList }} — sections: {{ listSections.length }}</p>
    <BButton class="mb-2" @click="addItem">add</BButton>
    <BRow>
      <BCol :cols="{xs: 4}">
        <BListGroup ref="targetList" class="position-sticky" style="top: 4rem">
          <BListGroupItem
            v-for="item in items"
            :key="item.id"
            :href="`#${item.id}`"
            :active="currentList === item.id"
            :aria-current="currentList === item.id ? 'location' : undefined"
          >
            {{ item.text }}
          </BListGroupItem>
        </BListGroup>
      </BCol>
      <BCol :cols="{xs: 8}">
        <div ref="contentList">
          <template v-for="item in items" :key="item.id">
            <h4 :id="item.id">{{ item.text }}</h4>
            <p v-for="i in 3" :key="i">{{ lorem }}</p>
          </template>
        </div>
      </BCol>
    </BRow>
    <div class="split" />
  </BContainer>
</template>

<script setup lang="ts">
import {ref, useTemplateRef} from 'vue'
import {useScrollspy} from 'bootstrap-vue-next/composables/useScrollspy'

const lorem = `
  Quis magna Lorem anim amet ipsum do mollit sit cillum voluptate ex nulla tempor. Laborum
  consequat non elit enim exercitation cillum aliqua consequat id aliqua. Esse ex consectetur
  mollit voluptate est in duis laboris ad sit ipsum anim Lorem.
`

const basicIds = ['fat', 'mdo', 'one', 'two', 'three', 'pi0']
const nested = [
  {id: 'nested-1', children: ['nested-1-1', 'nested-1-2', 'nested-1-3']},
  {id: 'nested-2', children: []},
  {id: 'nested-3', children: ['nested-3-1', 'nested-3-2']},
]

const content = useTemplateRef('content')
const target = useTemplateRef('target')
const contentNested = useTemplateRef('contentNested')
const targetNested = useTemplateRef('targetNested')
const contentList = useTemplateRef('contentList')
const targetList = useTemplateRef('targetList')

const {current} = useScrollspy(content, target, {smoothScroll: true})
const {activeIds: nestedActiveIds} = useScrollspy(contentNested, targetNested)
const {current: currentList, sections: listSections} = useScrollspy(contentList, targetList, {
  topMargin: '64px',
})

const items = ref([
  {id: 'list-1', text: 'Item 1'},
  {id: 'list-2', text: 'Item 2'},
  {id: 'list-3', text: 'Item 3'},
])

function addItem() {
  const n = items.value.length + 1
  items.value.push({id: `list-${n}`, text: `Item ${n}`})
}
</script>

<style scoped>
.split {
  height: 70vh !important;
}
</style>
