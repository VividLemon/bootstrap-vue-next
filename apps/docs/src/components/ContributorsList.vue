<template>
  <section
    v-if="pageContributors && pageContributors.contributors.length > 0"
    class="contributors-section mt-5 mb-3"
  >
    <h3 id="contributors">Contributors</h3>
    <p class="text-muted">Thank you to the contributors who have worked on this source code.</p>
    <div class="d-flex flex-wrap gap-2 align-items-center">
      <BLink
        v-for="contributor in pageContributors.contributors"
        :key="contributor.login"
        :href="contributor.profileUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="contributor-item text-decoration-none"
        :title="`${contributor.name} (${contributor.commits} commit${contributor.commits !== 1 ? 's' : ''})`"
      >
        <BAvatar :src="contributor.avatarUrl" :alt="contributor.name" size="sm" />
      </BLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import { data as contributorsData } from '../data/contributors.data'

const { page } = useData()

const pageContributors = computed(() => {
  if (!page.value?.relativePath) return null

  // Convert relativePath (e.g. 'docs/components/button.md') to page key
  const relativePath = page.value.relativePath.replace(/\.md$/, '')

  // Try exact match first
  if (contributorsData[relativePath]) {
    return contributorsData[relativePath]
  }

  // Try with src/ prefix stripped
  const withoutSrc = relativePath.replace(/^src\//, '')
  if (contributorsData[withoutSrc]) {
    return contributorsData[withoutSrc]
  }

  return null
})
</script>

<style scoped>
.contributors-section {
  border-top: 1px solid var(--vp-c-divider);
  padding-top: 1.5rem;
}

.contributor-item {
  transition: transform 0.2s ease;
}

.contributor-item:hover {
  transform: scale(1.1);
}
</style>
