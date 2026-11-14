---
id: bformfile
components:
- BFormFile
safeRewrite: true
manualReviewRequired: true
confidence: high
match:
- BFormFile
- useFileDialog
- useDropZone
- $path
- drop-placeholder
- <BFormFile>
---

# BFormFile Migration

## Summary

Migration notes for BFormFile from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BFormFile

## Breaking Change

BootstrapVueNext has completely rewritten `BFormFile` using [VueUse](https://vueuse.org/) composables (`useFileDialog` and `useDropZone`), resulting in a more modern, maintainable implementation.

The `capture` prop no longer accepts a boolean value. Modern browser specifications require `capture` to be either `'user'` (for front-facing camera) or `'environment'` (for rear-facing camera).

### Directory Mode

The `noTraverse` prop has been **removed**. BootstrapVueNext directory mode always returns files as a flat array, which matches the behavior of the browser's native file input with the `webkitdirectory` attribute.

When using `directory` mode, each `File` object includes the standard `webkitRelativePath` property containing the relative path from the selected directory root. This is a native browser property that's automatically available when using directory selection. This has replaced the deprecated `$path` property.

**Example:**

```ts
// Each File object includes webkitRelativePath property
// Note: 'files' would come from a file input event
const files = [] as File[]
files.forEach((file) => {
  console.log(file.webkitRelativePath) // e.g., "my-folder/subfolder/file.txt"
})

// Group files by directory
const filesByDirectory = files.reduce(
  (acc, file) => {
    const dir = file.webkitRelativePath.split('/')[0]
    if (dir && !acc[dir]) acc[dir] = []
    if (dir !== undefined) {
      acc[dir]?.push(file)
    }
    return acc
  },
  {} as Record<string, File[]>,
)
```

The `webkitRelativePath` property allows you to reconstruct directory structure or group files by folder as needed.

**BootstrapVue code:**

```vue-html
<BFormFile directory />
```

**BootstrapVueNext equivalent:**

```vue
<template>
  <BFormFile
    v-model="files"
    directory
  />
</template>

<script setup lang="ts">
import {ref, watch} from 'vue'

const files = ref<File[]>([])

// Access file paths via the webkitRelativePath property
watch(files, (newFiles) => {
  newFiles.forEach((file) => {
    console.log(file.webkitRelativePath) // e.g., "src/components/Button.vue"
  })
})
</script>
```

### Drop Placeholder Slot

The `drop-placeholder` slot no longer receives a `dropAllowed` scope property. VueUse's `useDropZone` handles file type validation internally, and we don't have access to its validation state. The slot now simply displays the drop placeholder text.

The `noDropPlaceholder` prop has been removed as it was only used when `dropAllowed` was `false`, which never occurred.

## Migration Notes

## Safe Automatic Rewrite

Yes. This entry is mostly mechanical, but review the result when surrounding behavior or adjacent props may affect the final markup.

## Related Migrations

- None
