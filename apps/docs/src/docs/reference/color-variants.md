---
title: Color Themes
description: >
  Bootstrap v6 colors are driven by theme classes (`.theme-*`) plus `bg`, `fg` and `border` utilities.
  Learn how BootstrapVueNext's `theme`, `bg`, `fg` and `border` props (and the button `variant` style) map to those classes.
---

Bootstrap v6 replaced v5's per-component color classes (`.btn-primary`, `.alert-danger`, `.text-bg-success`, `.list-group-item-info`, ...)
with a single **theme** concept. A `.theme-<name>` class sets a handful of CSS variables (such as `--theme-bg` and `--theme-fg`)
and components that read those variables are colored automatically. BootstrapVueNext exposes this through four kinds of props.

| Prop                                                | Purpose                         | Rendered class   |
| --------------------------------------------------- | ------------------------------- | ---------------- |
| `theme`                                             | Colors the component by a theme | `theme-<theme>`  |
| `bg`                                                | Background color                | `bg-<value>`     |
| `fg`                                                | Foreground (text) color         | `fg-<value>`     |
| `border`                                            | Border color                    | `border-<value>` |
| `variant` on buttons (and `*-variant` button props) | Button style                    | `btn-<variant>`  |

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

The v5 `light` and `dark` colors no longer exist. Use `secondary` or `inverse`, or a neutral layer value (see below) such as `bg="1"` and `fg="body"`.

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
`BTable` (and its rows and cells), checks, radios and switches, and menus read the theme variables, so a `theme` prop alone is enough.

Components whose styles do not read the theme variables (for example `BOverlay`, tooltips, popovers and `BSpinner`) are colored
through the `bg` and `fg` values instead (the spinner `theme` becomes `fg-<theme>`).

## Background, foreground and border values

The `bg`, `fg` and `border` props accept a theme name or a more specific value. A leading prefix is part of the value, not a separate prop.

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

| v5 prop and value                  | New prop and value  |
| ---------------------------------- | ------------------- |
| `variant="primary"` (non-button)   | `theme="primary"`   |
| `bg-variant="primary-subtle"`      | `bg="subtle-primary"` |
| `text-variant="danger-emphasis"`   | `fg="emphasis-danger"` |
| `text-variant="body-secondary"`    | `fg="2"`            |
| `text-variant="body"`              | `fg="body"`         |
| `border-variant="primary-subtle"`  | `border="subtle-primary"` |
| `text-variant="white-50"` / `black-50` | removed, use `fg="white"` / `fg="black"` with an opacity utility |

## Combining values

`theme`, `bg`, `fg` and `border` (and the same keys inside [prefixed color objects](#prefixed-color-objects) such as `headerColor` or `buttonColor`) accept a single value or an array of values.
Each value renders its own class, which allows stacking opacity utilities and theme modifiers.
A single string works exactly as before.

<<< DEMO ./demo/ColorArrays.vue#template{vue-html}

The `theme` prop also accepts the theme modifiers `contrast`, `subtle`, `muted`, `border` and `reset` (type `ThemeProp`). In an array, put the theme color first, followed by modifiers. Arrays stored in a variable need `as const` or a `ThemeProp` annotation. The `underlineTheme` prop and the spinner `theme` (including `spinnerColor.theme`) accept a single theme only.

## Prefixed color objects

The root `theme`, `bg`, `fg` and `border` props color the component itself. A component part, such as a card header or a modal
OK button, is colored with a single `<part>Color` object prop instead of separate `<part>Theme` / `<part>Bg` / `<part>Fg` props.
The object takes the keys `theme`, `bg` and `fg` (type `ColorExtendables`), plus `border` where the part supports a border color
(type `ColorBorderExtendables`).

```vue-html
<BCard
  :header-color="{ theme: 'primary', bg: 'subtle-primary', border: 'primary' }"
  :body-color="{ fg: '2' }"
/>
<BModal :ok-color="{ theme: 'success' }" :cancel-color="{ theme: 'danger', fg: 'white' }" />
<BTable :head-color="{ theme: 'inverse' }" :selection-color="{ bg: 'subtle-primary' }" />
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
| `BOffcanvas`                                  | `header-close-color`                                                           |
| `BOverlay`                                    | `spinner-color`                                                                |
| `BPlaceholderCard`, `BPlaceholderTable`       | `header-color`, `footer-color`                                                 |
| `BTable`, `BTableLite`                        | `head-color`, `head-row-color`, `foot-color`, `foot-row-color`, `selection-color` (`BTable` only) |

`underlineTheme` on links stays a flat prop, and `*-variant` props such as `ok-variant` or `button-variant` select a button
style, not a color, so they also stay separate.

### Defaults are merged per key

Some parts have a built-in default, for example `ok-color` defaults to `{ theme: 'primary' }` and `close-color`,
`cancel-color`, `button-color`, `tag-color`, `add-button-color` and `header-close-color` default to `{ theme: 'secondary' }`.
The object you pass is merged with that default key by key:

- A key you leave out, or set to `undefined`, keeps the default: `:ok-color="{ fg: 'white' }"` renders `theme-primary fg-white`.
- A key set to `null` removes the default: `:ok-color="{ theme: null }"` renders no theme class.

Where a part falls back to another one (the table `foot-color` falls back to `head-color`, `foot-row-color` to `head-row-color`,
and the dropdown `split-color` to the root `theme`, `bg` and `fg`), the fallback is also applied key by key.

### Global defaults with `BApp`

Color objects can be set as [`BApp` defaults](/docs/components/app) like any other prop, but `BApp` does **not** deep-merge
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

## Prop interactions

The `bg` and `fg` props take precedence over the `theme` prop. It is more
straightforward to set **either** `theme` **or** `bg` and `fg`, but not a
combination of `theme` with the other two. But the more specific props effectively override
the foreground or background portion of the `theme` prop, so an alternative is to use the `theme`
prop and then override `fg` or `bg` as needed.

<<< DEMO ./demo/VariantInteractions.vue#template{vue-html}

## Component specific notes

### Buttons

Buttons separate **style** from **color**:

- `variant` is the style: `solid` (default), `outline`, `subtle`, `text` or `link`. It renders `.btn-<variant>`.
- `BButton`'s `styled` prop independently applies the `.btn-styled` modifier.
- `theme` is the color. It renders `.theme-<theme>`.

For example `<BButton variant="outline" theme="danger">` renders `.btn.btn-outline.theme-danger`
(v5 `.btn-outline-danger`), and `<BButton variant="link" theme="info">` renders a link-styled info button.
Components that render a button for you expose the same pair as a style prop plus a [color object](#prefixed-color-objects), for example
`ok-variant` / `ok-color`, `cancel-variant` / `cancel-color`, `button-variant` / `button-color`, `split-variant` / `split-color` and
`close-variant` / `close-color`.

### Alerts, badges, list groups, progress, toasts

Use `theme`. This replaces `.alert-<x>`, `.badge`/`.text-bg-<x>`, `.list-group-item-<x>`, progress `.bg-<x>` and toast variants with `.theme-<x>`.

### Tables

Use `theme` on tables, columns (field `theme`), and the helper components `BThead`, `BTfoot`, `BTr`, `BTd` and `BTh`.
Per-item overrides use the item properties `_rowTheme` and `_cellThemes`. All map to `.theme-<theme>` (replacing `.table-<x>`).
Table-level props are `theme` and the color objects `head-color`, `head-row-color`, `foot-color`, `foot-row-color` and `selection-color`.
The `dark` prop has been removed (v6 removed `.table-dark`). Use the [`v-b-color-mode`](/docs/directives/BColorMode) directive or the [`useColorMode`](/docs/composables/useColorMode) composable to place a table in dark mode.

### Links

`BLink` uses `theme` (`.theme-<theme>`, since v6 anchors read `--theme-fg`). The underline color uses `underline-theme` (`.underline-<theme>`).
The v5 `link-<color>` classes no longer exist.

### Overlay and spinner

`BOverlay` uses `bg` for the backdrop color and the `spinner-color` object for its spinner. `BSpinner` uses `theme` to render `.fg-<theme>`.

## Using classes directly

You may also use the underlying class names directly on elements (and some components) via the standard HTML `class="..."` attribute,
for example `class="theme-danger"`, `class="bg-subtle-primary fg-emphasis-primary"` or `class="border border-muted"`.

## Creating custom themes

Add your own theme in Sass or CSS by following Bootstrap v6's theme conventions: define the `.theme-<name>` class
(plus matching `bg-`, `fg-` and `border-` utilities if you intend to use them with `bg`, `fg` and `border` props).
Every component that reads the theme variables will then support it.

To make TypeScript accept the new name in `theme` props, augment the `ThemeColors` interface. See
[Registering custom themes](/docs/components/button#custom-themes) for the full example.

<style lang="scss">
.bg-body-tertiary [class^="border"] {
  display: inline-block;
  width: 5rem;
  height: 5rem;
  margin: .25rem;
}
</style>
