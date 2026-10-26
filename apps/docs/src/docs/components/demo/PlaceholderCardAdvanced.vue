<template>
  <BPlaceholderCard
    img-src="https://picsum.photos/1024/480/?image=1"
    img-placement="bottom"
    no-header
  >
    <template #footer> Footer </template>

    <template #default>
      <BPlaceholder />
      <BPlaceholder width="65" bg="danger" />
      <BPlaceholder cols="6" bg="info" />
    </template>
  </BPlaceholderCard>
</template>
