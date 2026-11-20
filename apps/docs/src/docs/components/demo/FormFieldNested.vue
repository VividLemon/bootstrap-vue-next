<template>
  <!-- #region template -->
  <BCard :color="{ bg: '2' }">
    <BFormField
      :label-cols="{ lg: 3 }"
      label="Shipping Address"
      label-size="lg"
      :label-attrs="{ class: 'fw-bold pt-0' }"
      class="mb-0"
    >
      <BFormField
        label="Street:"
        label-for="nested-street"
        :label-cols="{ sm: 3 }"
        :label-align="{ sm: 'end' }"
      >
        <BFormInput id="nested-street" />
      </BFormField>
      <BFormField
        label="City:"
        label-for="nested-city"
        :label-cols="{ sm: 3 }"
        :label-align="{ sm: 'end' }"
      >
        <BFormInput id="nested-city" />
      </BFormField>
      <BFormField
        label="State:"
        label-for="nested-state"
        :label-cols="{ sm: 3 }"
        :label-align="{ sm: 'end' }"
      >
        <BFormInput id="nested-state" />
      </BFormField>
      <BFormField
        label="Country:"
        label-for="nested-country"
        :label-cols="{ sm: 3 }"
        :label-align="{ sm: 'end' }"
      >
        <BFormInput id="nested-country" />
      </BFormField>
      <BFormField
        label="Ship via:"
        :label-cols="{ sm: 3 }"
        :label-align="{ sm: 'end' }"
        class="mb-0"
      >
        <BFormRadioGroup class="pt-2" :options="['Air', 'Courier', 'Mail']" />
      </BFormField>
    </BFormField>
  </BCard>
  <!-- #endregion template -->
</template>
