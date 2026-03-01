<template>
  <BLink
    v-bind="props"
    :to="undefined"
    :href="props.href || props.to"
    :active="route.path === props.to"
    @click.stop.prevent="onClick"
  >
    <slot />
  </BLink>
</template>

<script setup lang="ts">
import {useRoute, useRouter} from 'vitepress'
import {BLink} from 'bootstrap-vue-next/components/BLink'
import {useModal} from 'bootstrap-vue-next/composables/useModal'
import type {BLinkProps} from 'bootstrap-vue-next'
import {computed, h} from 'vue'
import {BButton} from 'bootstrap-vue-next/components/BButton'

const props = defineProps<Omit<BLinkProps, 'to'> & {to?: string}>()

const route = useRoute()
const router = useRouter()
const modal = useModal()

const isExternalLink = computed(() => {
  const url = props.href || props.to
  if (!url) return false
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')
})

const onClick = async () => {
  if (isExternalLink.value) {
    await using conf = modal.create({
      title: 'You are leaving the site',
      cancelTitle: 'Cancel',
      slots: {
        ok: (scope) =>
          h(
            BButton,
            {
              href: props.href || props.to,
              variant: 'primary',
              target: '_blank',
              onClick: () => {
                if (
                  typeof scope === 'object' &&
                  scope !== null &&
                  'ok' in scope &&
                  typeof scope.ok === 'function'
                ) {
                  scope.ok()
                }
              },
            },
            {default: () => 'Continue'}
          ),
        default: () =>
          h('div', null, [
            'You are about to leave the current page to go to ',
            h('code', null, props.href || props.to),
            '. Do you want to continue?',
          ]),
      },
    })
    const result = await conf.show()
    if (result.ok) {
      window.open(props.href || props.to, '_blank')
    }
  } else if (props.to) {
    router.go(props.to)
  }
}
</script>
