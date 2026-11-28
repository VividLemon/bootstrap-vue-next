---
title: Carousel
description: >
  A slideshow for cycling through images, text or custom markup, built on Bootstrap v6's
  scroll-snap carousel with optional controls, indicators, autoplay and multi-item layouts.
---

## Basic usage

`BCarousel` renders Bootstrap v6's scroll-snap carousel: `.carousel-inner` is a horizontal scroller
that the browser owns (swiping, dragging, momentum, keyboard scrolling) and each `BCarouselSlide` is
a `.carousel-item` snap point. `controls`, `indicators` and `play-pause` render one bar below the
slides.

<<< DEMO ./demo/CarouselBasic.vue#template{vue-html}

### Slide content

A slide renders whatever is in its default slot. `img-src`, `img-srcset` and `img-alt` add an
`<img class="d-block w-100">` (through [`BImg`](/docs/components/image)); the `img` slot replaces it.
Captions are plain content in the default slot. Carousels don't normalize slide dimensions, so give
images the same aspect ratio.

<<< DEMO ./demo/CarouselResponsiveImages.vue#template{vue-html}

### Indicators

`indicators` renders one button per slide. The active one is wider and, while autoplay runs, fills
like a progress bar over the slide's interval. Labels are 1-based (`Slide 1`).

<<< DEMO ./demo/CarouselIndicators.vue#template{vue-html}

### Overlay

`overlay` places the control bar over the slides (`.carousel-overlay-controls`) with subtle buttons.

<<< DEMO ./demo/CarouselOverlay.vue#template{vue-html}

### Crossfade

`fade` stacks the slides and crossfades the active one (`.carousel-fade`). Non-active slides are
hidden and not focusable.

<<< DEMO ./demo/CarouselCrossfade.vue#template{vue-html}

## Ends

`ends` decides what happens past the first or last slide:

- `'loop'` (default) continues seamlessly through a temporary copy of the destination slide. It only
  applies to single-slide layouts without peek, `center` or `auto`, and not with reduced motion or
  `no-transition`; otherwise it behaves like `'wrap'`.
- `'wrap'` jumps to the other end.
- `'stop'` stops at the ends and disables the prev / next control there.

<<< DEMO ./demo/CarouselEnds.vue

## Layouts

### Multiple items and peek

Set Bootstrap's CSS variables on the carousel: `--bs-carousel-items` (slides per view),
`--bs-carousel-items-gap` and `--bs-carousel-items-peek` (a sliver of the neighbours).

<<< DEMO ./demo/CarouselMultiItem.vue#template{vue-html}

### Centered

`center` snaps slides to the center (`.carousel-center`).

<<< DEMO ./demo/CarouselCenter.vue#template{vue-html}

### Variable width

`auto` lets each slide keep its own width (`.carousel-auto`).

<<< DEMO ./demo/CarouselAuto.vue#template{vue-html}

## Autoplay

`autoplay` advances the slides every `interval` milliseconds (default `5000`). It pauses while the
pointer is over the carousel (set `:pause="false"` to keep playing), skips ticks while the page or
the carousel is hidden, and stops for good once the user interacts: a control, an indicator, the
keyboard, or touching the slides. Autoplay is required to be pausable (WCAG 2.2.2), so use
`play-pause` with it; it renders a play/pause button labelled with `play-label` / `pause-label`.

<<< DEMO ./demo/CarouselAutoplay.vue#template{vue-html}

### Interval per slide

`interval` on a `BCarouselSlide` overrides the carousel interval for that slide.

<<< DEMO ./demo/CarouselInterval.vue#template{vue-html}

## Usage with v-model

`v-model` is the index of the active slide. It updates once a slide settles, including when the user
scrolls or swipes. Setting it navigates to that slide; the initial value is rendered as `.active` on
the server and scrolled to on mount without animation.

<<< DEMO ./demo/CarouselModel.vue

## Events

`slide` fires before the carousel navigates and can be canceled with `preventDefault()`; a canceled
change caused by `v-model` reverts the model. `slid` fires when the slide has settled. Both receive a
`BvCarouselEvent` with `from`, `to`, `direction` and `relatedTarget`. `slide` is only emitted for
navigation the carousel starts (controls, indicators, keyboard, autoplay, `to()`, `v-model`), not for
free scrolling; a multi-slide scroll can emit intermediate `slid` events.

<<< DEMO ./demo/CarouselEvents.vue

## Custom controls

The `controls` slot replaces the control bar. It receives `prev`, `next`, `to`, `cycle`, `pause`,
`togglePlay`, `playing`, `index`, `count`, `canPrev` and `canNext`.

<<< DEMO ./demo/CarouselCustomControls.vue#template{vue-html}

## Exposed methods

Through a template ref: `next()`, `prev()`, `to(index)`, `cycle()`, `pause()`, `nextWhenVisible()` and
the readonly `playing` ref.

<<< DEMO ./demo/CarouselMethods.vue

## Accessibility

- Arrow keys navigate when the carousel has focus (unless `:keyboard="false"`), mirrored in RTL;
  they are ignored in inputs and textareas.
- The slide scroller is focusable so keyboard users can scroll it.
- Controls have visually hidden labels (`controls-prev-text`, `controls-next-text`) and indicators
  have `aria-label`s (`indicators-button-label`, `label-indicators`).
- With `prefers-reduced-motion`, scrolling is instant, `'loop'` falls back to `'wrap'` and the
  indicator does not fill.
- The markup matches Bootstrap; it adds no carousel `role` or live region. Add a label to the
  carousel (for example `aria-label`) if it needs one.

## Internationalization

<Internationalization />
