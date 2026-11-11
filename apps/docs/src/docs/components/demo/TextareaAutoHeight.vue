<template>
  <!-- #region template -->
  <BContainer fluid>
    <BRow>
      <BCol :cols="{ sm: 2 }">
        <label for="textarea-auto-height">Auto height:</label>
      </BCol>
      <BCol :cols="{ sm: 10 }">
        <BFormTextarea
          id="textarea-auto-height"
          placeholder="Auto height textarea"
          rows="3"
          max-rows="8"
        />
      </BCol>
    </BRow>

    <BRow class="mt-2">
      <BCol :cols="{ sm: 2 }">
        <label for="textarea-no-auto-shrink">No auto-shrink:</label>
      </BCol>
      <BCol :cols="{ sm: 10 }">
        <BFormTextarea
          id="textarea-no-auto-shrink"
          placeholder="Auto height (no-shrink) textarea"
          rows="3"
          max-rows="8"
          no-auto-shrink
        />
      </BCol>
    </BRow>
  </BContainer>
  <!-- #endregion template -->
</template>
