import {computed, type MaybeRef, readonly, toRef} from 'vue'
import {isLink} from '../utils/isLink'
import {pick} from '../utils/object'

export const useBLinkHelper = <
  T extends Record<string, unknown>,
  const B extends ReadonlyArray<PropertyKey>,
>(
  props: MaybeRef<T>,
  pickProps?: MaybeRef<B | (keyof T)[]>
) => {
  const pickPropsResolved = readonly(toRef(pickProps))
  const resolvedProps = readonly(toRef(props))

  const computedLink = computed(() => isLink(resolvedProps.value))
  const computedLinkProps = computed(() =>
    computedLink.value
      ? pick(
          resolvedProps.value,
          pickPropsResolved.value ?? [
            'active',
            'activeClass',
            'disabled',
            'exactActiveClass',
            'href',
            'icon',
            'noRel',
            'opacity',
            'prefetch',
            'prefetchOn',
            'prefetchedClass',
            'rel',
            'replace',
            'routerComponentName',
            'stretched',
            'target',
            'to',
            'underline',
            'color',
          ]
        )
      : {}
  )

  return {computedLink, computedLinkProps}
}
