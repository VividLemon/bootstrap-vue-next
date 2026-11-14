<template>
  <!-- #region template -->
  <BTabs
    :active-nav-item-attrs="{ class: 'fw-bold text-uppercase fg-danger' }"
    :active-tab-attrs="{ class: 'fw-bold fg-success' }"
    :content-attrs="{ class: 'mt-3' }"
  >
    <BTab title="First" active><p>I'm the first tab</p></BTab>
    <BTab title="Second"><p>I'm the second tab</p></BTab>
    <BTab title="Disabled" disabled><p>I'm a disabled tab!</p></BTab>
  </BTabs>
  <!-- #endregion template -->
</template>
