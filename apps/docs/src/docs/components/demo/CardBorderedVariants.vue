<template>
  <!-- #region template -->
  <div>
    <div class="contains-inline">
      <BCardGroup>
        <BCard
          border="primary"
          header="Primary"
          header-bg="primary"
          header-fg="white"
          align="center"
        >
          <BCardText>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</BCardText>
        </BCard>
        <BCard border="secondary" header="Secondary" header-border="secondary" align="center">
          <BCardText>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</BCardText>
        </BCard>
        <BCard border="success" header="Success" align="center">
          <BCardText>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</BCardText>
        </BCard>
      </BCardGroup>
    </div>
  </div>
  <div class="mt-3">
    <div class="contains-inline">
      <BCardGroup>
        <BCard border="info" header="Info" align="center">
          <BCardText>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</BCardText>
        </BCard>
        <BCard border="warning" header="Warning" align="center">
          <BCardText>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</BCardText>
        </BCard>
        <BCard
          border="danger"
          header="Danger"
          header-border="danger"
          header-fg="danger"
          align="center"
        >
          <BCardText>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</BCardText>
        </BCard>
      </BCardGroup>
    </div>
  </div>
  <div class="mt-3">
    <BCardGroup class="mb-3">
      <BCard border="accent" header="Accent" class="text-center">
        <BCardText>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</BCardText>
      </BCard>
      <BCard border="inverse" header="Inverse" align="center">
        <BCardText>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</BCardText>
      </BCard>
    </BCardGroup>
  </div>
  <!-- #endregion template -->
</template>
