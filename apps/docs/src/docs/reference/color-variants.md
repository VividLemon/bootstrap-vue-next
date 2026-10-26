---
title: Color Themes
description: >
  Bootstrap v6 colors are driven by theme classes (`.theme-*`) plus `bg`, `fg` and `border` utilities.
  Learn how BootstrapVueNext's `theme`, `bg`, `fg` and `border` props (and the button `variant` style) map to those classes.
---

Bootstrap v6 replaced v5's per-component color classes (`.btn-primary`, `.alert-danger`, `.text-bg-success`, `.list-group-item-info`, ...)
with a single **theme** concept. A `.theme-<name>` class sets a handful of CSS variables (such as `--theme-bg` and `--theme-fg`)
and components that read those variables are colored automatically. BootstrapVueNext exposes this through four kinds of props.

| Prop                                          | Purpose                          | Rendered class   |
| --------------------------------------------- | -------------------------------- | ---------------- |
| `theme` (and `*-theme`, e.g. `header-theme`)  | Colors the component by a theme  | `theme-<theme>`  |
| `bg` (and `*-bg`, e.g. `body-bg`)             | Background color                 | `bg-<value>`     |
| `fg` (and `*-fg`, e.g. `footer-fg`)           | Foreground (text) color          | `fg-<value>`     |
| `border` (and `*-border`, e.g. `header-border`) | Border color                   | `border-<value>` |
| `variant` on buttons (and `*-variant` button props) | Button style               | `btn-<variant>`  |

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
Components that render a button for you expose the same pair, for example `ok-variant` / `ok-theme`,
`cancel-variant` / `cancel-theme`, `button-variant` / `button-theme`, `split-variant` / `split-theme` and `close-variant` / `close-theme`.

### Alerts, badges, list groups, progress, toasts

Use `theme`. This replaces `.alert-<x>`, `.badge`/`.text-bg-<x>`, `.list-group-item-<x>`, progress `.bg-<x>` and toast variants with `.theme-<x>`.

### Tables

Use `theme` on tables, columns (field `theme`), and the helper components `BThead`, `BTfoot`, `BTr`, `BTd` and `BTh`.
Per-item overrides use the item properties `_rowTheme` and `_cellThemes`. All map to `.theme-<theme>` (replacing `.table-<x>`).
Table-level props are `theme`, `head-theme`, `head-row-theme`, `foot-theme`, `foot-row-theme` and `selection-theme`.
The `dark` prop still adds `.table-dark`.

### Links

`BLink` uses `theme` (`.theme-<theme>`, since v6 anchors read `--theme-fg`). The underline color uses `underline-theme` (`.underline-<theme>`).
The v5 `link-<color>` classes no longer exist.

### Overlay and spinner

`BOverlay` uses `bg` for the backdrop color and `spinner-theme` for its spinner. `BSpinner` uses `theme` to render `.fg-<theme>`.

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
