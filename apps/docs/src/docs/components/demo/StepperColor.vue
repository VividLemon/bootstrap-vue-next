<template>
  <!-- #region template -->
  <BStepper :model-value="3" horizontal>
    <BStepperItem :color="{ theme: 'success' }">Create account</BStepperItem>
    <BStepperItem :color="{ theme: 'success' }">Confirm email</BStepperItem>
    <BStepperItem :color="{ theme: 'danger' }">Payment failed</BStepperItem>
    <BStepperItem :color="{ theme: 'warning' }">Retry</BStepperItem>
  </BStepper>
  <!-- #endregion template -->
</template>
