import {describe, expect, it} from 'vitest'
import {ref} from 'vue'
import {useAlignment} from './useAlignment'

describe('useAlignment', () => {
  it.each([
    {align: undefined, className: ''},
    {align: 'start', className: 'justify-content-start'},
    {align: 'center', className: 'justify-content-center'},
    {align: 'end', className: 'justify-content-end'},
    {align: 'between', className: 'justify-content-between'},
    {align: 'around', className: 'justify-content-around'},
    {align: 'evenly', className: 'justify-content-evenly'},
  ])('returns $className for align=$align', ({align, className}) => {
    const {alignment} = useAlignment(align)
    expect(alignment.value).toBe(className)
  })

  it('is reactive to ref changes', () => {
    const align = ref<'start' | 'center' | undefined>('start')
    const {alignment} = useAlignment(align)

    expect(alignment.value).toBe('justify-content-start')

    align.value = 'center'
    expect(alignment.value).toBe('justify-content-center')

    align.value = undefined
    expect(alignment.value).toBe('')
  })
})
