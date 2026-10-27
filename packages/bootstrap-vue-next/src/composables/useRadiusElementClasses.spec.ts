import {describe, expect, it} from 'vitest'
import {ref} from 'vue'
import {useRadiusElementClasses} from './useRadiusElementClasses'

describe('useRadiusElementClasses', () => {
  it.each([
    {rounded: true, className: 'rounded', description: 'true'},
    {rounded: 'circle', className: 'rounded-circle', description: 'circle'},
    {rounded: 'pill', className: 'rounded-pill', description: 'pill'},
    {rounded: 'none', className: 'rounded-0', description: 'none'},
    {rounded: 'sm', className: 'rounded-1', description: 'sm'},
    {rounded: 'lg', className: 'rounded-5', description: 'lg'},
    {rounded: '3', className: 'rounded-3', description: 'numeric value'},
  ])('returns $className when rounded is $description', ({rounded, className}) => {
    const {classes} = useRadiusElementClasses({rounded})
    expect(classes.value[className]).toBe(true)
  })

  it.each([
    {prop: 'roundedTop', rounded: true, className: 'rounded-top'},
    {prop: 'roundedBottom', rounded: 'circle', className: 'rounded-bottom-circle'},
    {prop: 'roundedStart', rounded: 'pill', className: 'rounded-start-pill'},
    {prop: 'roundedEnd', rounded: 'lg', className: 'rounded-end-5'},
  ])('returns $className for $prop', ({prop, rounded, className}) => {
    const {classes} = useRadiusElementClasses({[prop]: rounded})
    expect(classes.value[className]).toBe(true)
  })

  it('returns all false when no rounded props set', () => {
    const {classes} = useRadiusElementClasses({})
    const values = Object.values(classes.value)
    expect(values.every((v) => v === false)).toBe(true)
  })

  it('is reactive to ref changes', () => {
    const props = ref<{rounded?: boolean | string}>({rounded: true})
    const {classes} = useRadiusElementClasses(props)
    expect(classes.value['rounded']).toBe(true)

    props.value = {rounded: 'circle'}
    expect(classes.value['rounded-circle']).toBe(true)
  })
})
