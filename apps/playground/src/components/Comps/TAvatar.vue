<template>
  <BContainer fluid>
    <BAvatar class="me-2">BV</BAvatar>
    <BAvatar
      class="me-2"
      img="https://picsum.photos/300/300"
      img-alt="Random"
      size="lg"
    />
    <BAvatar
      class="me-2"
      variant="success"
      status="online"
      >ED</BAvatar
    >
    <BAvatarGroup size="sm">
      <template #default="{count}">
        <BAvatar>A</BAvatar>
        <BAvatar subtle>B</BAvatar>
        <BAvatar variant="primary">{{ count }}</BAvatar>
      </template>
    </BAvatarGroup>
  </BContainer>
</template>
