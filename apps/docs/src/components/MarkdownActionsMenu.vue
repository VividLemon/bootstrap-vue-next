<template>
  <!-- The group carries the spacing: a split BMenu inside BButtonGroup renders no group of its own -->
  <BButtonGroup class="me-2">
    <BMenu
      split
      variant="outline"
      :color="{ theme: 'info' }"
      split-variant="outline"
      :split-color="{ theme: 'info' }"
      toggle-text="More markdown actions"
      :disabled="!actionsReady"
      :split-disabled="!actionsReady"
      @split-click="onSplitClick"
    >
      <template #toggle>
        {{ copied ? 'Copied as Markdown' : 'Copy as Markdown' }}
      </template>

      <BMenuItem :disabled="!actionsReady" @click="onDownloadClick"> Download Markdown </BMenuItem>
      <BMenuItem :disabled="!actionsReady" @click="onViewClick"> View as Markdown </BMenuItem>
      <BMenuDivider />
      <BMenuItem
        v-for="provider in aiProviders"
        :key="provider.name"
        :disabled="!actionsReady"
        @click="onOpenInAI(provider)"
      >
        Open in {{ provider.name }}
      </BMenuItem>
    </BMenu>
  </BButtonGroup>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  defaultAiProviders,
  useCopyOrDownloadAsMarkdownButtons,
} from 'vitepress-plugin-llms/vitepress-components'

const supportedAiProviderNames = new Set(['ChatGPT', 'Claude'])

const aiProviders = defaultAiProviders.filter(({ name }) => supportedAiProviderNames.has(name))

const { copied, copyAsMarkdown, downloadMarkdown, markdownPageURL, openInAI, viewAsMarkdown } =
  useCopyOrDownloadAsMarkdownButtons({
    aiProviders,
  })

const isMounted = ref(false)

const actionsReady = computed(() => isMounted.value && Boolean(markdownPageURL.value))

const onSplitClick = async () => {
  if (!actionsReady.value) return
  await copyAsMarkdown()
}

const onDownloadClick = async () => {
  if (!actionsReady.value) return
  await downloadMarkdown()
}

const onViewClick = () => {
  if (!actionsReady.value) return
  viewAsMarkdown()
}

const onOpenInAI = (provider: Parameters<typeof openInAI>[0]) => {
  if (!actionsReady.value) return
  openInAI(provider)
}

onMounted(() => {
  isMounted.value = true
})
</script>
