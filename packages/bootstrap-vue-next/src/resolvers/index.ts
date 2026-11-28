import type {ComponentResolver} from 'unplugin-vue-components'
import {
  componentNames,
  componentsWithExternalPath,
  type ComponentType,
  type ConfigurationOption,
} from '../types/BootstrapVueOptions'

const bvKey = 'bootstrap-vue-next'

const parseActiveImports = <Type extends string, Base extends ConfigurationOption<Type>>(
  options: Readonly<Base>,
  values: readonly Type[]
): Type[] => {
  const {all, ...others} = options
  const valuesCopy: Partial<Record<keyof Base, boolean>> = {}
  if (all) {
    values.forEach((el) => {
      valuesCopy[el] = all
    })
  }
  const merge: Record<string, boolean> = {...valuesCopy, ...others}
  return (
    Object.entries(merge)
      // filtering possible invalid keys
      .filter(([name, value]) => !!value && values.includes(name as Type))
      .map(([name]) => name as Type)
  )
}

const usedComponents = new Set<string>()

/**
 * Resolver for unplugin-vue-components
 *
 * Contains a hidden property `__usedComponents` (a `Set<string>`) with the list of used
 * components.
 * It may not be fully accurate. It can be used to get a list of stuff to trim down, like css
 * @example
 * ```ts
 * const bootstrapVueNextResolver = BootstrapVueNextResolver()
 * console.info(bootstrapVueNextResolver.__usedComponents)
 *
 * // ... blah blah blah, `plugins: [Components({resolvers: [bootstrapVueNextResolver]})]` ...
 * ```
 */
export const BootstrapVueNextResolver = Object.assign(
  ({
    aliases = {},
    components = true,
  }: Readonly<{
    components?: boolean | ConfigurationOption<ComponentType>
    aliases?: Record<string, ComponentType>
  }> = {}): ComponentResolver[] => {
    const selectedComponents = typeof components === 'boolean' ? {all: components} : components
    // <ComponentType, ImportPath>
    const compImports = parseActiveImports(selectedComponents, componentNames).reduce(
      (map, name) => {
        map.set(name, `${bvKey}${componentsWithExternalPath[name]}`)
        return map
      },
      new Map<string, string>()
    )

    return [
      {
        type: 'component',
        resolve(name) {
          const destination = compImports.get(name)
          const aliasDestination =
            aliases[name] === undefined ? undefined : compImports.get(aliases[name])
          if (aliasDestination) {
            const val = aliases[name]
            if (val !== undefined) {
              usedComponents.add(val)
            }
            return {
              name: val,
              from: aliasDestination,
            }
          }

          if (destination) {
            usedComponents.add(name)
            return {
              name,
              from: destination,
            }
          }
        },
      },
    ]
  },
  {
    __usedComponents: usedComponents,
  }
)
