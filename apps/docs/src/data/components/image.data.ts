import {type ComponentReference, StyleKind} from '../../types'
import {imageProps} from '../../utils'

export default {
  load: (): ComponentReference[] => [
    {
      component: 'BImg',
      styleSpec: {kind: StyleKind.BsvnClass},
      sourcePath: '/BImg/BImg.vue',
      props: {
        '': imageProps,
      },
      emits: [
        {
          event: 'load',
          description: 'Fired when the image has finished loading',
          args: [
            {
              arg: 'load',
              type: 'Event',
              description: 'The native load event',
            },
          ],
        },
      ],
      slots: [],
    },
  ],
}
