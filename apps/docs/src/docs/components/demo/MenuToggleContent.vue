<template>
  <!-- #region template -->
  <BMenu>
    <template #toggle>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        viewBox="0 0 16 16"
        aria-hidden="true"
      >
        <path
          d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0"
        />
      </svg>
      Settings
    </template>
    <BMenuItem>Profile</BMenuItem>
    <BMenuItem>Preferences</BMenuItem>
  </BMenu>
  <!-- #endregion template -->
</template>
