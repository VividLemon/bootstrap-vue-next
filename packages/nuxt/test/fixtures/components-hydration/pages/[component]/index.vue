<template>
  <div id="components-hydration-page">
    <div id="hydration-mounted">
      {{ mounted ? 'mounted' : 'ssr' }}
    </div>
    <div :id="markerId">
      {{ markerId }}
    </div>

    <BAccordion v-if="scenario === 'accordion-item'">
      <component
        :is="componentName"
        title="Item title"
      >
        Item content
      </component>
    </BAccordion>

    <BBreadcrumb v-else-if="scenario === 'breadcrumb-item'">
      <component
        :is="componentName"
        text="Current"
      />
    </BBreadcrumb>

    <BCarousel v-else-if="scenario === 'carousel-slide'">
      <component
        :is="componentName"
        caption="Slide"
        text="Slide body"
      />
    </BCarousel>

    <BDropdown
      v-else-if="scenario === 'dropdown-child'"
      text="Menu"
      model-value
    >
      <component :is="componentName">
        Dropdown item
      </component>
    </BDropdown>

    <BDropdown
      v-else-if="scenario === 'dropdown-form'"
      text="Menu"
      model-value
    >
      <component :is="componentName">
        <BFormInput placeholder="Input" />
      </component>
    </BDropdown>

    <BDropdown
      v-else-if="scenario === 'dropdown-header'"
      text="Menu"
      model-value
    >
      <component :is="componentName">
        Group header
      </component>
    </BDropdown>

    <BFormGroup
      v-else-if="scenario === 'form-feedback'"
      label="Field"
    >
      <BFormInput />
      <component :is="componentName">
        Feedback text
      </component>
    </BFormGroup>

    <BFormSelect
      v-else-if="scenario === 'form-select-option'"
      :model-value="'a'"
    >
      <component
        :is="componentName"
        value="a"
      >
        Option A
      </component>
    </BFormSelect>

    <BFormSelect
      v-else-if="scenario === 'form-select-option-group'"
      :model-value="'a'"
    >
      <component
        :is="componentName"
        label="Group A"
      >
        <BFormSelectOption value="a">
          Option A
        </BFormSelectOption>
      </component>
    </BFormSelect>

    <BFormTags
      v-else-if="scenario === 'form-tag'"
      :model-value="['tag']"
    >
      <template #default="{ tags }">
        <component
          :is="componentName"
          v-bind="tags[0]"
          title="tag"
        />
      </template>
    </BFormTags>

    <BInputGroup v-else-if="scenario === 'input-group-text'">
      <component :is="componentName">
        Prefix
      </component>
      <BFormInput />
    </BInputGroup>

    <BListGroup v-else-if="scenario === 'list-group-item'">
      <component :is="componentName">
        List item
      </component>
    </BListGroup>

    <BNav v-else-if="scenario === 'nav-child'">
      <component :is="componentName">
        Nav content
      </component>
    </BNav>

    <BNav v-else-if="scenario === 'nav-item-dropdown'">
      <component
        :is="componentName"
        text="More"
      >
        <BDropdownItem>Item</BDropdownItem>
      </component>
    </BNav>

    <BNavbar v-else-if="scenario === 'navbar-child'">
      <component :is="componentName">
        Navbar content
      </component>
    </BNavbar>

    <BProgress
      v-else-if="scenario === 'progress-bar'"
      :max="100"
    >
      <component
        :is="componentName"
        :value="50"
      />
    </BProgress>

    <BTabs
      v-else-if="scenario === 'tab'"
      model-value="tab-1"
    >
      <component
        :is="componentName"
        id="tab-1"
        title="Tab title"
      >
        Tab content
      </component>
    </BTabs>

    <BTableSimple v-else-if="scenario === 'table-body'">
      <component :is="componentName">
        <BTr>
          <BTd>Cell</BTd>
        </BTr>
      </component>
    </BTableSimple>

    <BTableSimple v-else-if="scenario === 'table-cell'">
      <BTr>
        <component :is="componentName">
          Cell
        </component>
      </BTr>
    </BTableSimple>

    <BTableSimple v-else-if="scenario === 'table-foot'">
      <component :is="componentName">
        <BTr>
          <BTd>Foot cell</BTd>
        </BTr>
      </component>
    </BTableSimple>

    <BTableSimple v-else-if="scenario === 'table-head'">
      <component :is="componentName">
        <BTr>
          <BTh>Head cell</BTh>
        </BTr>
      </component>
    </BTableSimple>

    <BTableSimple v-else-if="scenario === 'table-head-cell'">
      <BTr>
        <component :is="componentName">
          Head cell
        </component>
      </BTr>
    </BTableSimple>

    <BTableSimple v-else-if="scenario === 'table-row'">
      <component :is="componentName">
        <BTd>Row cell</BTd>
      </component>
    </BTableSimple>

    <component
      :is="componentName"
      v-else
    >
      Rendered content
    </component>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'ComponentsHydrationPage' })

const route = useRoute()

const componentName = computed(() => String(route.params.component ?? 'BAlert'))
const scenario = computed(() => String(route.query.scenario ?? 'default'))
const markerId = computed(() => `hydration-case-${componentName.value}`)
const mounted = ref(false)

onMounted(() => {
  mounted.value = true
})
</script>
