<template>
  <BContainer fluid>
    <BRow>
      <BCol>
        <BBadge>New</BBadge>
      </BCol>
      <BCol>
        <h2>
          Example heading
          <BBadge>New</BBadge>
        </h2>
      </BCol>
      <BCol>
        <h3>
          Example heading
          <BBadge>New</BBadge>
        </h3>
      </BCol>
      <BCol>
        <h4>
          Example heading
          <BBadge>New</BBadge>
        </h4>
      </BCol>
      <BCol>
        <h5>
          Example heading
          <BBadge>New</BBadge>
        </h5>
      </BCol>
      <BCol>
        <h6>
          Example heading
          <BBadge>New</BBadge>
        </h6>
      </BCol>
    </BRow>
    <BRow>
      <BCol> Variants </BCol>
    </BRow>
    <BRow>
      <BCol>
        <BBadge pill :color="{ theme: 'primary' }">Primary</BBadge>
        <BBadge pill :color="{ theme: 'secondary' }">Secondary</BBadge>
        <BBadge pill :color="{ theme: 'success' }">Success</BBadge>
        <BBadge pill :color="{ theme: 'danger' }">Danger</BBadge>
        <BBadge pill :color="{ theme: 'warning' }">Warning</BBadge>
        <BBadge pill :color="{ theme: 'info' }">Info</BBadge>
        <BBadge pill :color="{ theme: 'accent' }">Accent</BBadge>
        <BBadge pill :color="{ theme: 'inverse' }">Inverse</BBadge>
      </BCol>
    </BRow>
    <BRow>
      <BCol> Actionables </BCol>
    </BRow>
    <BRow>
      <BCol>
        <BBadge href="#" :color="{ theme: 'primary' }">Primary</BBadge>
        <BBadge href="#" :color="{ theme: 'secondary' }">Secondary</BBadge>
        <BBadge href="#" :color="{ theme: 'success' }">Success</BBadge>
        <BBadge href="#" :color="{ theme: 'danger' }">Danger</BBadge>
        <BBadge href="#" :color="{ theme: 'warning' }">Warning</BBadge>
        <BBadge href="#" :color="{ theme: 'info' }">Info</BBadge>
        <BBadge href="#" :color="{ theme: 'accent' }">Accent</BBadge>
        <BBadge href="#" :color="{ theme: 'inverse' }">Inverse</BBadge>
      </BCol>
    </BRow>
  </BContainer>
</template>
