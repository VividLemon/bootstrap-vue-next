<template>
  <div class="d-flex flex-column gap-2">
    <div>
      <label class="form-label" for="granularity-hour">Hour granularity</label>
      <BTimeField id="granularity-hour" granularity="hour" />
    </div>
    <div>
      <label class="form-label" for="granularity-minute">Minute granularity (default)</label>
      <BTimeField id="granularity-minute" granularity="minute" />
    </div>
    <div>
      <label class="form-label" for="granularity-second">Second granularity</label>
      <BTimeField id="granularity-second" granularity="second" />
    </div>
    <div>
      <label class="form-label" for="hour-cycle">12-hour cycle</label>
      <BTimeField id="hour-cycle" :hour-cycle="12" />
    </div>
  </div>
</template>

<script setup lang="ts"></script>
