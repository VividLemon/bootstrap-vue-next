<template>
  <!-- #region template -->
  <div>
    <div class="contains-inline">
      <BCardGroup>
        <BCard
          :color="{ bg: 'primary', fg: 'contrast-primary' }"
          header="Primary"
          class="text-center"
        >
          <BCardText>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</BCardText>
        </BCard>
        <BCard
          :color="{ bg: 'secondary', fg: 'contrast-secondary' }"
          header="Secondary"
          class="text-center"
        >
          <BCardText>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</BCardText>
        </BCard>
        <BCard
          :color="{ bg: 'success', fg: 'contrast-success' }"
          header="Success"
          class="text-center"
        >
          <BCardText>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</BCardText>
        </BCard>
      </BCardGroup>
    </div>
  </div>
  <div class="mt-3">
    <div class="contains-inline">
      <BCardGroup>
        <BCard :color="{ bg: 'info', fg: 'contrast-info' }" header="Info" class="text-center">
          <BCardText>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</BCardText>
        </BCard>
        <BCard
          :color="{ bg: 'warning', fg: 'contrast-warning' }"
          header="Warning"
          class="text-center"
        >
          <BCardText>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</BCardText>
        </BCard>
        <BCard :color="{ bg: 'danger', fg: 'contrast-danger' }" header="Danger" class="text-center">
          <BCardText>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</BCardText>
        </BCard>
      </BCardGroup>
    </div>
  </div>
  <div class="mt-3">
    <div class="contains-inline">
      <BCardGroup>
        <BCard :color="{ bg: 'accent', fg: 'contrast-accent' }" header="Accent" class="text-center">
          <BCardText>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</BCardText>
        </BCard>
        <BCard
          :color="{ bg: 'inverse', fg: 'contrast-inverse' }"
          header="Inverse"
          class="text-center"
        >
          <BCardText>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</BCardText>
        </BCard>
        <BCard header="Default" class="text-center">
          <BCardText>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</BCardText>
        </BCard>
      </BCardGroup>
    </div>
  </div>
  <!-- #endregion template -->
</template>
