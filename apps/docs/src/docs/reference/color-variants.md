---
title: Color Themes
description: >
  Bootstrap v6 colors are driven by theme classes (`.theme-*`) plus `bg`, `fg` and `border` utilities.
  Learn how BootstrapVueNext's `color` prop (`theme`, `bg`, `fg` and `border` keys) and the button `variant` style map to those classes.
---

Bootstrap v6 replaced v5's per-component color classes (`.btn-primary`, `.alert-danger`, `.text-bg-success`, `.list-group-item-info`, ...)
with a single **theme** concept. A `.theme-<name>` class sets a handful of CSS variables (such as `--theme-bg` and `--theme-fg`)
and components that read those variables are colored automatically. BootstrapVueNext exposes this through one `color` object
prop per component, whose keys map to those classes.

| `color` key                       | Purpose                         | Rendered class     |
| --------------------------------- | ------------------------------- | ------------------ |
| `theme`                           | Colors the component by a theme | `theme-<theme>`    |
| `bg`                              | Background color                | `bg-<value>`       |
| `fg`                              | Foreground (text) color         | `fg-<value>`       |
| `border` (components with a border) | Border color                  | `border-<value>`   |

```vue-html
<BBadge :color="{ theme: 'success' }">Success</BBadge>
<BCard :color="{ bg: 'subtle-primary', border: 'primary' }" />
```

Button style is separate from color: `variant` on buttons (and `*-variant` button props) renders `btn-<variant>`.

Parts of a component (a card header, a modal OK button, a table head, ...) take the same keys through one
[prefixed color object](#prefixed-color-objects) per part, for example `header-color` or `ok-color`.

## Themes

The built-in themes (type `ThemeColor`) are:

- `primary`
- `accent`
- `success`
- `danger`
- `warning`
- `info`
- `inverse`
- `secondary`

The v5 `light` and `dark` colors no longer exist. Use `secondary` or `inverse`, or a neutral layer value (see below) such as `:color="{ bg: '1', fg: 'body' }"`.

<BCard class="bg-body-tertiary">
  <div class="d-flex flex-wrap gap-2">
    <span class="theme-primary badge">primary</span>
    <span class="theme-accent badge">accent</span>
    <span class="theme-success badge">success</span>
    <span class="theme-danger badge">danger</span>
    <span class="theme-warning badge">warning</span>
    <span class="theme-info badge">info</span>
    <span class="theme-inverse badge">inverse</span>
    <span class="theme-secondary badge">secondary</span>
  </div>
</BCard>

Components such as `BAlert`, `BBadge`, `BAvatar`, `BButton`, `BCard`, `BListGroupItem`, `BNav`, `BNavbar`, `BPagination`, `BProgress`, `BToast`,
`BTable` (and its rows and cells), checks, radios and switches, and menus read the theme variables, so a `theme` key alone is enough.

Components whose styles do not read the theme variables (for example `BOverlay`, tooltips, popovers and `BSpinner`) are colored
through the `bg` and `fg` keys instead (the spinner `theme` becomes `fg-<theme>`).

## Background, foreground and border values

The `bg`, `fg` and `border` keys accept a theme name or a more specific value. A leading prefix is part of the value, not a separate key.

### Background (`bg`)

Renders `.bg-<value>`. Values are one of:

- Any theme (`primary`, `danger`, ...)
- `subtle-<theme>` (e.g. `subtle-primary`)
- `muted-<theme>` (e.g. `muted-primary`)
- Neutral layers: `body`, `1`, `2`, `3`, `4`, `fg`, `white`, `black`, `transparent`

### Foreground (`fg`)

Renders `.fg-<value>`. Values are one of:

- Any theme (`primary`, `danger`, ...)
- `emphasis-<theme>` (e.g. `emphasis-danger`)
- `contrast-<theme>` (e.g. `contrast-primary`, readable text on top of `bg="primary"`)
- Neutral layers: `body`, `1`, `2`, `3`, `4`, `bg`, `white`, `black`, `reset`

### Border (`border`)

Renders `.border-<value>`. Values are one of:

- Any theme (`primary`, `danger`, ...)
- `subtle-<theme>` (e.g. `subtle-primary`)
- `bg`, `body`, `muted`, `subtle`, `emphasized`, `white`, `black`

### Migrating from v5 values

| v5 prop and value                      | New prop and value                       |
| -------------------------------------- | ---------------------------------------- |
| `variant="primary"` (non-button)       | `:color="{ theme: 'primary' }"`          |
| `bg-variant="primary-subtle"`          | `:color="{ bg: 'subtle-primary' }"`      |
| `text-variant="danger-emphasis"`       | `:color="{ fg: 'emphasis-danger' }"`     |
| `text-variant="body-secondary"`        | `:color="{ fg: '2' }"`                   |
| `text-variant="body"`                  | `:color="{ fg: 'body' }"`                |
| `border-variant="primary-subtle"`      | `:color="{ border: 'subtle-primary' }"`  |
| `text-variant="white-50"` / `black-50` | removed, use `fg: 'white'` / `fg: 'black'` with an opacity utility |

## Combining values

The `theme`, `bg`, `fg` and `border` keys (of `color` and of [prefixed color objects](#prefixed-color-objects) such as `headerColor` or `buttonColor`) accept a single value or an array of values.
Each value renders its own class, which allows stacking opacity utilities and theme modifiers.
A single string works exactly as before.

<<< DEMO ./demo/ColorArrays.vue#template{vue-html}

The `theme` key also accepts the theme modifiers `contrast`, `subtle`, `muted`, `border` and `reset` (type `ThemeProp`). In an array, put the theme color first, followed by modifiers. Arrays stored in a variable need `as const` or a `ThemeProp` annotation. The link `underline.color` and the spinner `theme` (including `spinner.color.theme`) accept a single theme only.

## Prefixed color objects

The `color` prop colors the component itself. A component part, such as a card header or a modal OK button, is colored
the same way with its own `<part>Color` object prop. Both take the keys `theme`, `bg` and `fg` (type `ColorExtendables`), plus
`border` where the component or part supports a border color (type `ColorBorderExtendables`).

```vue-html
<BCard
  :header-color="{ theme: 'primary', bg: 'subtle-primary', border: 'primary' }"
  :body-color="{ fg: '2' }"
/>
<BModal :ok-color="{ theme: 'success' }" :cancel-color="{ theme: 'danger', fg: 'white' }" />
<BTable :thead="{ color: { theme: 'inverse' } }" :selection-color="{ bg: 'subtle-primary' }" />
```

| Component                                     | Color object props                                                             |
| --------------------------------------------- | ------------------------------------------------------------------------------ |
| `BAlert`, `BToast`                            | `close-color`                                                                  |
| `BAvatar`                                     | `badge-color`                                                                  |
| `BCard`                                       | `header-color`, `body-color`, `footer-color` (with `border`), `subtitle-color` (`fg` only) |
| `BCardBody`                                   | `subtitle-color` (`fg` only)                                                   |
| `BDropdown`, `BNavItemDropdown`               | `split-color`                                                                  |
| `BDropdownGroup`                              | `header-color`                                                                 |
| `BFormCheckbox`, `BFormRadio` and their groups | `button-color`                                                                |
| `BFormTags`                                   | `tag-color`, `add-button-color`                                                |
| `BModal`                                      | `header-color`, `footer-color` (with `border`), `body-color`, `header-close-color`, `ok-color`, `cancel-color` |
| `BOffcanvas`                                  | `header-close.color`                                                           |
| `BOverlay`                                    | `spinner.color`                                                                |
| `BPlaceholderCard`, `BPlaceholderTable`       | `header-color`, `footer-color`                                                 |
| `BTable`, `BTableLite`                        | `thead.color`, `thead.rowColor`, `tfoot.color`, `tfoot.rowColor`, `selection-color` (`BTable` only) |

`*-variant` props such as `ok-variant` or `button-variant` select a button style, not a color, so they stay separate.

### Defaults are merged per key

Some components and parts have a built-in default. For example `BButton`, `BBadge` and `BAvatar` default to
`:color="{ theme: 'secondary' }"`, `BAlert` to `{ theme: 'info' }`, `ok-color` to `{ theme: 'primary' }`, and `close-color`,
`cancel-color`, `button-color`, `tag-color`, `add-button-color`, and the BModal `header-close-color` and BOffcanvas `header-close.color`, default to `{ theme: 'secondary' }`.
The object you pass is merged with that default key by key:

- A key you leave out, or set to `undefined`, keeps the default: `:ok-color="{ fg: 'white' }"` renders `theme-primary fg-white`.
- A key set to `null` removes the default: `:ok-color="{ theme: null }"` renders no theme class.

Where a part falls back to another one (the table `tfoot` keys fall back to the `thead` keys,
and the dropdown `split-color` to the dropdown's `color`), the fallback is also applied key by key.

### Global defaults with `BApp`

Color objects, `color` included, can be set as [`BApp` defaults](/docs/components/app) like any other prop, but `BApp` does **not** deep-merge
a default object with the object passed on the component:

- When the component does not receive the prop, the `BApp` default object is used, and it is merged per key with the
  component's built-in default as described above.
- When the component receives the prop, that object replaces the `BApp` default entirely. Keys set only in the `BApp`
  default are not kept.

```vue-html
<BApp :defaults="{ BModal: { okColor: { bg: 'subtle-primary' } } }">
  <!-- theme-primary bg-subtle-primary: BApp default + built-in theme -->
  <BModal />
  <!-- theme-primary fg-white: the prop replaces the BApp default, the built-in theme still applies -->
  <BModal :ok-color="{ fg: 'white' }" />
</BApp>
```

Nested `BApp` components replace the outer defaults unless `merge-defaults` is set. With `merge-defaults` set to `true` the
inner and outer default objects are deep-merged, so `{ BModal: { okColor: { theme: 'success' } } }` inside
`{ BModal: { okColor: { fg: 'white' } } }` results in `{ theme: 'success', fg: 'white' }`.

## Key interactions

The `bg` and `fg` keys take precedence over the `theme` key. It is more
straightforward to set **either** `theme` **or** `bg` and `fg`, but not a
combination of `theme` with the other two. But the more specific keys effectively override
the foreground or background portion of the theme, so an alternative is to set `theme`
and then override `fg` or `bg` as needed.

<<< DEMO ./demo/VariantInteractions.vue#template{vue-html}

## Component specific notes

### Buttons

Buttons separate **style** from **color**:

- `variant` is the style: `solid` (default), `outline`, `subtle`, `text` or `link`. It renders `.btn-<variant>`.
- `BButton`'s `styled` prop independently applies the `.btn-styled` modifier.
- The `color` prop's `theme` key is the color. It renders `.theme-<theme>`.

For example `<BButton variant="outline" :color="{ theme: 'danger' }">` renders `.btn.btn-outline.theme-danger`
(v5 `.btn-outline-danger`), and `<BButton variant="link" :color="{ theme: 'info' }">` renders a link-styled info button.
Components that render a button for you expose the same pair as a style prop plus a [color object](#prefixed-color-objects), for example
`ok-variant` / `ok-color`, `cancel-variant` / `cancel-color`, `button-variant` / `button-color`, `split-variant` / `split-color` and
`close-variant` / `close-color`.

### Alerts, badges, list groups, progress, toasts

Use the `color` prop's `theme` key. This replaces `.alert-<x>`, `.badge`/`.text-bg-<x>`, `.list-group-item-<x>`, progress `.bg-<x>` and toast variants with `.theme-<x>`.

### Tables

Use `color` on tables, on columns (the field's `color`), and on the helper components `BThead`, `BTfoot`, `BTr`, `BTd` and `BTh`.
Per-item overrides use the item properties `_rowColor` and `_cellColors`. Their `theme` maps to `.theme-<theme>` (replacing `.table-<x>`).
Table-level props are `color`, the `thead` and `tfoot` sections (with `color` and `rowColor` keys) and `selection-color`.
The `dark` prop has been removed (v6 removed `.table-dark`). Use the [`v-b-color-mode`](/docs/directives/BColorMode) directive or the [`useColorMode`](/docs/composables/useColorMode) composable to place a table in dark mode.

### Links

`BLink` uses the `color` prop's `theme` key (`.theme-<theme>`, since v6 anchors read `--theme-fg`). The underline color is set with the separate `underline` prop's `color` key (`.underline-<theme>`).
The v5 `link-<color>` classes no longer exist.

### Overlay and spinner

`BOverlay` uses `color.bg` for the backdrop color (or `bg-css` for a raw CSS color) and the `spinner` prop's `color` object for its spinner. `BSpinner` uses `color.theme` to render `.fg-<theme>`.

## Using classes directly

You may also use the underlying class names directly on elements (and some components) via the standard HTML `class="..."` attribute,
for example `class="theme-danger"`, `class="bg-subtle-primary fg-emphasis-primary"` or `class="border border-muted"`.

## Creating custom themes

Add your own theme in Sass or CSS by following Bootstrap v6's theme conventions: define the `.theme-<name>` class
(plus matching `bg-`, `fg-` and `border-` utilities if you intend to use them with the `bg`, `fg` and `border` keys).
Every component that reads the theme variables will then support it.

To make TypeScript accept the new name in `theme` keys, augment the `ThemeColors` interface. See
[Registering custom themes](/docs/components/button#custom-themes) for the full example.

<style lang="scss">
.bg-body-tertiary [class^="border"] {
  display: inline-block;
  width: 5rem;
  height: 5rem;
  margin: .25rem;
}
</style>
