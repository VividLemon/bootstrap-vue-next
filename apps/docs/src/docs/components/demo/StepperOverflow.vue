<template>
  <!-- #region template -->
  <BStepper :model-value="2" horizontal overflow>
    <BStepperItem v-for="n in 10" :key="n">Step {{ n }}</BStepperItem>
  </BStepper>
  <!-- #endregion template -->
</template>
