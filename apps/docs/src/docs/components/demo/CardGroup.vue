<template>
  <!-- #region template -->
  <div class="contains-inline">
    <BCardGroup>
      <BCard title="Title" img-src="https://picsum.photos/g/300/450" img-alt="Image">
        <BCardText>
          This is a wider card with supporting text below as a natural lead-in to additional
          content. This content is a little bit longer.
        </BCardText>
        <template #footer>
          <small class="fg-2">Last updated 3 mins ago</small>
        </template>
      </BCard>
      <BCard title="Title" img-src="https://picsum.photos/g/300/450" img-alt="Image">
        <BCardText>
          This card has supporting text below as a natural lead-in to additional content.
        </BCardText>
        <template #footer>
          <small class="fg-2">Last updated 3 mins ago</small>
        </template>
      </BCard>
      <BCard title="Title" img-src="https://picsum.photos/g/300/450" img-alt="Image">
        <BCardText>
          This is a wider card with supporting text below as a natural lead-in to additional
          content. This card has even longer content than the first to show that equal height
          action.
        </BCardText>
        <template #footer>
          <small class="fg-2">Last updated 3 mins ago</small>
        </template>
      </BCard>
    </BCardGroup>
  </div>
  <!-- #endregion template -->
</template>
