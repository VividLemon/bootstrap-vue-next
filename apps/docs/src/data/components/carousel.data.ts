import type {
  BCarouselEmits,
  BCarouselProps,
  BCarouselSlideProps,
  BCarouselSlideSlots,
  BCarouselSlots,
} from 'bootstrap-vue-next'
import {
  type ComponentReference,
  type EmitRecord,
  type ExposedRecord,
  type PropRecord,
  type SlotRecord,
  StyleKind,
} from '../../types'
import { pick } from '../../utils/objectUtils'
import { buildCommonProps } from '../../utils/commonProps'

const navArgs = {
  value: {
    type: 'BvCarouselEvent',
    description:
      'The slide `direction`, `from` and `to` indices, and the target slide as `relatedTarget`',
  },
}

export default {
  load: (): ComponentReference => ({
    BCarousel: {
      styleSpec: { kind: StyleKind.OverrideClass, value: '.carousel' },
      props: {
        ...pick(buildCommonProps(), ['id']),
        auto: {
          type: 'boolean',
          default: false,
          description: 'Slides keep their own width (`.carousel-auto`)',
        },
        autoplay: {
          type: 'boolean',
          default: false,
          description:
            'Advances the slides every `interval`. Stops for good once the user interacts with the carousel. Use with `play-pause` (WCAG 2.2.2)',
        },
        center: {
          type: 'boolean',
          default: false,
          description: 'Snaps slides to the center (`.carousel-center`)',
        },
        controls: {
          type: 'boolean',
          default: false,
          description: 'Renders the previous and next buttons in the control bar',
        },
        controlsNextText: {
          type: 'string',
          default: 'Next',
          description: 'Visually hidden label of the next button',
        },
        controlsPrevText: {
          type: 'string',
          default: 'Previous',
          description: 'Visually hidden label of the previous button',
        },
        ends: {
          type: 'CarouselEnds',
          default: 'loop',
          description:
            "Behavior past the first or last slide: `'loop'` continues seamlessly (falls back to `'wrap'` where it can't), `'wrap'` jumps to the other end, `'stop'` stops and disables the prev / next button",
        },
        fade: {
          type: 'boolean',
          default: false,
          description: 'Crossfades slides instead of scrolling (`.carousel-fade`)',
        },
        indicators: {
          type: 'boolean',
          default: false,
          description: 'Renders one indicator button per slide in the control bar',
        },
        indicatorsButtonLabel: {
          type: 'string',
          default: 'Slide',
          description: 'Prefix of the indicator labels, followed by the 1-based slide number',
        },
        interval: {
          type: 'number',
          default: 5000,
          description:
            'Autoplay delay in milliseconds. A slide `interval` overrides it for that slide',
        },
        keyboard: {
          type: 'boolean',
          default: true,
          description: 'Navigates with the left and right arrow keys (mirrored in RTL)',
        },
        labelIndicators: {
          type: 'string',
          default: 'Select a slide to display',
          description: '`aria-label` of the indicator group',
        },
        modelValue: {
          type: 'number',
          default: 0,
          description:
            'Index of the active slide. Updates when a slide settles (also on user scrolling); setting it navigates',
        },
        noTransition: {
          type: 'boolean',
          default: false,
          description:
            "Scrolls instantly and sets `--bs-carousel-fade-duration: 0s`. `ends: 'loop'` behaves like `'wrap'`",
        },
        overlay: {
          type: 'boolean',
          default: false,
          description:
            'Places the control bar over the slides (`.carousel-overlay`, `.carousel-overlay-controls`) with subtle buttons',
        },
        pause: {
          type: "'hover' | false",
          default: 'hover',
          description: 'Pauses autoplay while the pointer is over the carousel',
        },
        pauseLabel: {
          type: 'string',
          default: 'Pause',
          description: 'Label of the play/pause button while playing',
        },
        playLabel: {
          type: 'string',
          default: 'Play',
          description: 'Label of the play/pause button while paused',
        },
        playPause: {
          type: 'boolean',
          default: false,
          description:
            'Renders a play/pause button (`.carousel-control-play-pause`) in the control bar',
        },
      } satisfies PropRecord<keyof BCarouselProps>,
      emits: {
        'update:model-value': {
          description: 'Emitted when the active slide changes',
          args: {
            value: {
              description: 'Index of the active slide',
              type: 'number',
            },
          },
        },
        slide: {
          description:
            'Fired before the carousel navigates; call `preventDefault()` to cancel. Not fired for free scrolling by the user',
          args: navArgs,
        },
        slid: {
          description:
            'Fired when the slide has settled. A multi-slide scroll can fire intermediate `slid` events',
          args: navArgs,
        },
      } satisfies EmitRecord<keyof BCarouselEmits | 'update:model-value'>,
      slots: {
        default: {
          description: 'The `BCarouselSlide` components',
        },
        controls: {
          description: 'Replaces the control bar (indicators, play/pause, prev/next)',
          scope: {
            prev: { type: '() => void', description: 'Goes to the previous slide' },
            next: { type: '() => void', description: 'Goes to the next slide' },
            to: { type: '(index: number) => void', description: 'Goes to a slide' },
            cycle: { type: '() => void', description: 'Starts autoplay' },
            pause: { type: '() => void', description: 'Pauses autoplay' },
            togglePlay: { type: '() => void', description: 'Toggles autoplay' },
            playing: { type: 'boolean', description: 'Whether autoplay is on' },
            index: { type: 'number', description: 'Index of the active slide' },
            count: { type: 'number', description: 'Number of slides' },
            canPrev: {
              type: 'boolean',
              description: "`false` at the start with `ends: 'stop'`",
            },
            canNext: { type: 'boolean', description: "`false` at the end with `ends: 'stop'`" },
          },
        },
      } satisfies SlotRecord<keyof BCarouselSlots>,
      exposed: {
        next: { type: '() => void', description: 'Goes to the next slide' },
        prev: { type: '() => void', description: 'Goes to the previous slide' },
        to: { type: '(index: number) => void', description: 'Goes to the slide at `index`' },
        cycle: { type: '() => void', description: 'Starts autoplay' },
        pause: {
          type: '() => void',
          description: 'Pauses autoplay (it resumes after a hover if it was playing)',
        },
        nextWhenVisible: {
          type: '() => void',
          description: 'Goes to the next slide only when the page and the carousel are visible',
        },
        playing: { type: 'Readonly<Ref<boolean>>', description: 'Whether autoplay is on' },
      } satisfies ExposedRecord,
    },
    BCarouselSlide: {
      styleSpec: { kind: StyleKind.OverrideClass, value: '.carousel-item' },
      props: {
        ...pick(buildCommonProps(), ['id']),
        imgAlt: {
          type: 'string',
          default: undefined,
          description: 'Alt text of the slide image',
        },
        imgSrc: {
          type: 'string',
          default: undefined,
          description: 'URL of an `<img class="d-block w-100">` rendered in the slide',
        },
        imgSrcset: {
          type: 'string | readonly string[]',
          default: undefined,
          description: 'Candidate image sources (`srcset`) of the slide image',
        },
        interval: {
          type: 'number',
          default: undefined,
          description: 'Autoplay delay of this slide in milliseconds (`data-bs-interval`)',
        },
      } satisfies PropRecord<keyof BCarouselSlideProps>,
      emits: {},
      slots: {
        default: {
          description: 'Content of the slide, including any caption',
        },
        img: {
          description: 'Replaces the image rendered by `img-src`',
        },
      } satisfies SlotRecord<keyof BCarouselSlideSlots>,
    },
  }),
}
