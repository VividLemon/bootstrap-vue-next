<template>
  <!-- #region template -->
  <div>
    <div class="contains-inline">
      <BCardGroup>
        <BCard
          :color="{ border: 'primary' }"
          header="Primary"
          :header-color="{ bg: 'primary', fg: 'white' }"
          align="center"
        >
          <BCardText>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</BCardText>
        </BCard>
        <BCard
          :color="{ border: 'secondary' }"
          header="Secondary"
          :header-color="{ border: 'secondary' }"
          align="center"
        >
          <BCardText>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</BCardText>
        </BCard>
        <BCard :color="{ border: 'success' }" header="Success" align="center">
          <BCardText>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</BCardText>
        </BCard>
      </BCardGroup>
    </div>
  </div>
  <div class="mt-3">
    <div class="contains-inline">
      <BCardGroup>
        <BCard :color="{ border: 'info' }" header="Info" align="center">
          <BCardText>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</BCardText>
        </BCard>
        <BCard :color="{ border: 'warning' }" header="Warning" align="center">
          <BCardText>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</BCardText>
        </BCard>
        <BCard
          :color="{ border: 'danger' }"
          header="Danger"
          :header-color="{ border: 'danger', fg: 'danger' }"
          align="center"
        >
          <BCardText>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</BCardText>
        </BCard>
      </BCardGroup>
    </div>
  </div>
  <div class="mt-3">
    <BCardGroup class="mb-3">
      <BCard :color="{ border: 'accent' }" header="Accent" class="text-center">
        <BCardText>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</BCardText>
      </BCard>
      <BCard :color="{ border: 'inverse' }" header="Inverse" align="center">
        <BCardText>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</BCardText>
      </BCard>
    </BCardGroup>
  </div>
  <!-- #endregion template -->
</template>
