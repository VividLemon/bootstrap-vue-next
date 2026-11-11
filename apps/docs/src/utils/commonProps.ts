import type { PropReference } from '../types'

const commonProps = () =>
  ({
    active: {
      type: 'boolean',
      default: false,
      description:
        'When set to `true`, places the component in the active state with active styling',
    },
    activeClass: {
      type: 'ClassValue',
      default: 'active',
      description:
        "Configure the active CSS class applied when the link is active. Typically you will want to set this to class name 'active'",
    },
    alt: {
      type: 'string',
      default: 'undefined',
      description: 'Value to set for the `alt` attribute',
    },
    ariaControls: {
      type: 'AriaInvalid',
      default: undefined,
      description:
        'If this component controls another component or element, set this to the ID of the controlled component or element',
    },
    ariaDescribedby: {
      type: 'string',
      default: undefined,
      description:
        'The ID of the element that provides a description for this component. Used as the value for the `aria-describedby` attribute',
    },
    ariaInvalid: {
      type: 'AriaInvalid',
      default: undefined,
      description:
        'Sets the `aria-invalid` attribute value on the wrapper element. When not provided, the `state` prop will control the attribute',
    },
    autoClose: {
      type: "boolean | 'inside' | 'outside'",
      default: true,
      description:
        'Controls the automatic closing of the component when clicking. See above for details.',
    },
    autocomplete: {
      type: 'string',
      default: 'false',
      description: "Sets the 'autocomplete' attribute value on the form control",
    },
    ariaLabel: {
      type: 'string',
      default: undefined,
      description: 'Sets the value of `aria-label` attribute on the rendered element',
    },
    ariaLive: {
      type: 'string',
      default: undefined,
      description:
        "When the rendered element is an `aria-live` region (for screen reader users), set to either 'polite' or 'assertive'",
    },
    ariaLabelledby: {
      type: 'string',
      default: undefined,
      description:
        'The ID of the element that provides a label for this component. Used as the value for the `aria-labelledby` attribute',
    },
    autofocus: {
      type: 'boolean',
      default: false,
      description:
        'When set to `true`, attempts to auto-focus the control when it is mounted, or re-activated when in a keep-alive. Does not set the `autofocus` attribute on the control',
    },
    body: {
      type: 'string',
      default: undefined,
      description: 'The text content of the body',
    },
    bodyAttrs: {
      type: 'Readonly<AttrsValue>',
      default: undefined,
      description: 'Attributes to be applied to the body of the component',
    },
    bodyClass: {
      type: 'ClassValue',
      default: undefined,
      description: 'CSS class (or classes) to apply to the body',
    },
    bodyTag: {
      type: 'string',
      default: 'div',
      description: 'Specify the HTML tag to render instead of the default tag for the body',
    },
    color: {
      type: 'ColorExtendables | null',
      default: undefined,
      description:
        "Colors the component with one object: `theme` renders `theme-*`, `bg` renders `bg-*` and `fg` renders `fg-*`. Keys left out (or `undefined`) keep the component's default; `null` clears it. See [Color variants](/docs/reference/color-variants)",
    },
    debounce: {
      type: 'Numberish',
      default: '0',
      description:
        "When set to a number of milliseconds greater than zero, will debounce the user input. Has no effect if prop 'lazy' is set",
    },
    debounceMaxWait: {
      type: 'Numberish',
      default: 'NaN',
      description: "The maximum time in milliseconds allowed to be delayed before it''s invoked",
    },
    disabled: {
      type: 'boolean',
      default: false,
      description:
        "When set to `true`, disables the component's functionality and places it in a disabled state",
    },
    disabledField: {
      type: 'string',
      default: 'disabled',
      description: 'Field name in the `options` array that should be used for the disabled state',
    },
    floating: {
      type: 'boolean',
      default: false,
      description:
        'When set, renders a single control form with a floating label. This only works for forms where the immediate children are a label and one of the supported controls. See above for details.',
    },
    footer: {
      type: 'string',
      default: undefined,
      description: 'Text content to place in the footer',
    },
    footerClass: {
      type: 'ClassValue',
      default: undefined,
      description: 'CSS class (or classes) to apply to the footer',
    },
    footerTag: {
      type: 'string',
      default: 'div',
      description: 'Specify the HTML tag to render instead of the default tag for the footer',
    },
    form: {
      type: 'string',
      default: undefined,
      description:
        'ID of the form that the form control belongs to. Sets the `form` attribute on the control',
    },
    formatter: {
      type: '(val: string, evt: Event) => string',
      default: 'undefined',
      description: 'Reference to a function for formatting the input',
    },
    header: {
      type: 'string',
      default: undefined,
      description: 'Text content to place in the header',
    },
    headerClass: {
      type: 'ClassValue',
      default: undefined,
      description: 'CSS class (or classes) to apply to the header',
    },
    headerTag: {
      type: 'string',
      default: 'div',
      description: 'Specify the HTML tag to render instead of the default tag for the header',
    },
    id: {
      type: 'string',
      default: undefined,
      description:
        'Used to set the `id` attribute on the rendered content, and used as the base to generate any additional element IDs as needed',
    },
    lazyFormatter: {
      type: 'boolean',
      default: 'false',
      description:
        'When set, the input is formatted on blur instead of each keystroke (if there is a formatter specified)',
    },
    linkClass: {
      type: 'ClassValue',
      default: undefined,
      description: 'Class or classes to apply to the inner link element',
    },
    list: {
      type: 'string',
      default: 'undefined',
      description: 'The ID of the associated datalist element or component',
    },
    name: {
      type: 'string',
      default: undefined,
      description: 'Sets the value of the `name` attribute on the form control',
    },
    noBackdrop: {
      type: 'boolean',
      default: false,
      description: 'Disables rendering of the backdrop',
    },
    noEllipsis: {
      type: 'boolean',
      default: false,
      description: 'Do not show ellipsis buttons',
    },
    noGotoEndButtons: {
      type: 'boolean',
      default: false,
      description: 'Hides the go to first and go to last page buttons',
    },
    noHeader: {
      type: 'boolean',
      default: false,
      description: 'Disables rendering of the  header',
    },
    noHeaderClose: {
      type: 'boolean',
      default: false,
      description: 'Disables rendering of the header close button',
    },
    noHoverPause: {
      type: 'boolean',
      default: false,
      description: 'When set to true, disables pausing the timer on hover behavior',
    },
    noResumeOnHoverLeave: {
      type: 'boolean',
      default: false,
      description:
        'When set to true, the timer will not resume when the mouse leaves the element. It will need to be manually resumed',
    },
    novalidate: {
      type: 'boolean',
      default: false,
      description: 'When set, disables browser native HTML5 validation on controls in the form',
    },
    options: {
      type: 'readonly CheckboxOptionRaw[]',
      default: '() => []',
      description: 'Array of items to render in the component',
    },
    plain: {
      type: 'boolean',
      default: false,
      description: 'Render the form control in plain mode, rather than custom styled mode',
    },
    placeholder: {
      type: 'string',
      default: "''",
      description: 'Sets the `placeholder` attribute value on the form control',
    },
    plaintext: {
      type: 'boolean',
      default: 'false',
      description:
        'Set the form control as readonly and renders the control to look like plain text (no borders)',
    },
    required: {
      type: 'boolean',
      default: undefined,
      description: 'Adds the `required` attribute to the form control',
    },
    readonly: {
      type: 'boolean',
      default: 'false',
      description: 'Sets the `readonly` attribute on the form control',
    },
    role: {
      type: 'string',
      default: undefined,
      description: 'Sets the ARIA attribute `role` to a specific value',
    },
    rounded: {
      type: 'boolean | RadiusElement',
      default: 'false',
      description:
        'Specifies the type of rounding to apply to the component or its children. The `square` prop takes precedence. Use `rounded-sides` to round individual sides. Refer to the documentation for details',
    },
    roundedSides: {
      type: 'RadiusSides',
      default: undefined,
      description:
        'Per-side rounding: `top`, `bottom`, `start` and `end` keys each take the same values as `rounded` and render `rounded-<side>-*` classes, for example `:rounded-sides="{ top: \'lg\' }"`',
    },
    size: {
      type: 'Size',
      default: undefined,
      description: "Set the size of the component's appearance. 'sm' or 'lg'",
    },
    src: {
      type: 'string',
      default: undefined,
      description: 'URL to set for the `src` attribute',
    },
    state: {
      type: 'ValidationState',
      default: undefined,
      description:
        'Controls the validation state appearance of the component. `true` for valid, `false` for invalid, or `null` for no validation state',
    },
    subtitle: {
      type: 'string',
      default: undefined,
      description: 'Text content to place in the subtitle',
    },
    subtitleTag: {
      type: 'string',
      default: 'h6',
      description: 'Specify the HTML tag to render instead of the default tag for the subtitle',
    },
    subtitleColor: {
      type: "Pick<ColorExtendables, 'fg'>",
      default: undefined,
      description:
        'Color object for the subtitle text: the `fg` key renders an `fg-*` class. When `fg` is not set the subtitle uses `fg-2`',
    },
    tag: {
      type: 'string',
      default: 'div',
      description: 'Specify the HTML tag to render instead of the default tag',
    },
    textField: {
      type: 'string',
      default: 'text',
      description: 'Field name in the `options` array that should be used for the text label',
    },
    title: {
      type: 'string',
      default: undefined,
      description: 'Text content to place in the title',
    },
    titleClass: {
      type: 'ClassValue',
      default: undefined,
      description: 'CSS class (or classes) to apply to the title',
    },
    titleTag: {
      type: 'string',
      default: 'h4',
      description: 'Specify the HTML tag to render instead of the default tag for the title',
    },
    tooltip: {
      type: 'boolean',
      default: false,
      description: 'Renders the feedback text in a rudimentary tooltip style',
    },
    validated: {
      type: 'boolean',
      default: false,
      description:
        "When set, adds the Bootstrap class 'was-validated' on the form, triggering the native browser validation states",
    },
    valueField: {
      type: 'string',
      default: 'value',
      description: 'Field name in the `options` array that should be used for the value',
    },
    variant: {
      type: 'ButtonVariant | null',
      default: 'solid',
      description:
        "Sets the button style: 'solid', 'outline', 'subtle', 'text' or 'link'. Combine with `theme` to set the color",
    },
    wrapperAttrs: {
      type: 'Readonly<AttrsValue>',
      default: undefined,
      description: 'Attributes to be applied to the wrapper element',
    },
    wrapperClass: {
      type: 'ClassValue',
      default: undefined,
      description: 'CSS class (or classes) to add to the wrapper element',
    },
    closeClass: {
      type: 'ClassValue',
      default: undefined,
      description: 'CSS class (or classes) to apply to the close button',
    },
    closeContent: {
      type: 'string',
      default: undefined,
      description: 'Sets the text for the close button. The `close` slot takes precedence',
    },
    closeLabel: {
      type: 'string',
      default: 'Close',
      description: 'Sets the `aria-label` attribute for the close button',
    },
    closeVariant: {
      type: 'ButtonVariant | null',
      default: 'solid',
      description: 'Sets the button style (variant) for the close button',
    },
    interval: {
      type: 'number | "requestAnimationFrame"',
      default: 'requestAnimationFrame',
      description: 'Sets the interval for refreshing the countdown timer',
    },
    isStatus: {
      type: 'boolean',
      default: false,
      description:
        'When set to `true`, sets `aria-live="polite"` and `role="status"`; otherwise, `aria-live="assertive"` and `role="alert"`',
    },
    placement: {
      type: 'Placement',
      default: 'bottom-start',
      description: 'Placement of a floating element',
    },
    progressProps: {
      type: "Omit<BProgressBarProps, 'label' | 'max' | 'value'>",
      default: undefined,
      description: 'Configures the progress bar. No progress bar is shown if undefined',
    },
    showOnPause: {
      type: 'boolean',
      default: true,
      description: 'Keeps the component visible when paused',
    },
    addButtonColor: {
      type: 'ColorExtendables',
      default: undefined,
      description:
        'Color object for the add-tag button: `theme`, `bg`, `fg` keys render `theme-*`, `bg-*`, `fg-*` classes. See [Prefixed color objects](/docs/reference/color-variants#prefixed-color-objects)',
    },
    bodyColor: {
      type: 'ColorExtendables',
      default: undefined,
      description:
        'Color object for the body: `theme`, `bg`, `fg` keys render `theme-*`, `bg-*`, `fg-*` classes. See [Prefixed color objects](/docs/reference/color-variants#prefixed-color-objects)',
    },
    buttonColor: {
      type: 'ColorExtendables',
      default: undefined,
      description:
        'Color object for the button: `theme`, `bg`, `fg` keys render `theme-*`, `bg-*`, `fg-*` classes. See [Prefixed color objects](/docs/reference/color-variants#prefixed-color-objects)',
    },
    cancelColor: {
      type: 'ColorExtendables',
      default: undefined,
      description:
        'Color object for the cancel button: `theme`, `bg`, `fg` keys render `theme-*`, `bg-*`, `fg-*` classes. See [Prefixed color objects](/docs/reference/color-variants#prefixed-color-objects)',
    },
    closeColor: {
      type: 'ColorExtendables',
      default: undefined,
      description:
        'Color object for the close button: `theme`, `bg`, `fg` keys render `theme-*`, `bg-*`, `fg-*` classes. See [Prefixed color objects](/docs/reference/color-variants#prefixed-color-objects)',
    },
    footColor: {
      type: 'ColorExtendables',
      default: undefined,
      description:
        'Color object for the table footer: `theme`, `bg`, `fg` keys render `theme-*`, `bg-*`, `fg-*` classes. Each key falls back to `headColor`. See [Prefixed color objects](/docs/reference/color-variants#prefixed-color-objects)',
    },
    footRowColor: {
      type: 'ColorExtendables',
      default: undefined,
      description:
        'Color object for the footer row: `theme`, `bg`, `fg` keys render `theme-*`, `bg-*`, `fg-*` classes. Each key falls back to `headRowColor`. See [Prefixed color objects](/docs/reference/color-variants#prefixed-color-objects)',
    },
    footerColor: {
      type: 'ColorExtendables',
      default: undefined,
      description:
        'Color object for the footer: `theme`, `bg`, `fg` keys render `theme-*`, `bg-*`, `fg-*` classes. See [Prefixed color objects](/docs/reference/color-variants#prefixed-color-objects)',
    },
    headColor: {
      type: 'ColorExtendables',
      default: undefined,
      description:
        'Color object for the table header: `theme`, `bg`, `fg` keys render `theme-*`, `bg-*`, `fg-*` classes. See [Prefixed color objects](/docs/reference/color-variants#prefixed-color-objects)',
    },
    headRowColor: {
      type: 'ColorExtendables',
      default: undefined,
      description:
        'Color object for the header row: `theme`, `bg`, `fg` keys render `theme-*`, `bg-*`, `fg-*` classes. See [Prefixed color objects](/docs/reference/color-variants#prefixed-color-objects)',
    },
    headerColor: {
      type: 'ColorExtendables',
      default: undefined,
      description:
        'Color object for the header: `theme`, `bg`, `fg` keys render `theme-*`, `bg-*`, `fg-*` classes. See [Prefixed color objects](/docs/reference/color-variants#prefixed-color-objects)',
    },
    headerCloseColor: {
      type: 'ColorExtendables',
      default: undefined,
      description:
        'Color object for the header close button: `theme`, `bg`, `fg` keys render `theme-*`, `bg-*`, `fg-*` classes. See [Prefixed color objects](/docs/reference/color-variants#prefixed-color-objects)',
    },
    okColor: {
      type: 'ColorExtendables',
      default: undefined,
      description:
        'Color object for the confirmation button: `theme`, `bg`, `fg` keys render `theme-*`, `bg-*`, `fg-*` classes. See [Prefixed color objects](/docs/reference/color-variants#prefixed-color-objects)',
    },
    selectionColor: {
      type: 'ColorExtendables',
      default: undefined,
      description:
        'Color object for selected table rows: `theme`, `bg`, `fg` keys render `theme-*`, `bg-*`, `fg-*` classes. See [Prefixed color objects](/docs/reference/color-variants#prefixed-color-objects)',
    },
    splitColor: {
      type: 'ColorExtendables',
      default: undefined,
      description:
        'Color object for the split dropdown button: `theme`, `bg`, `fg` keys render `theme-*`, `bg-*`, `fg-*` classes. Each key falls back to the root `theme`, `bg` or `fg` prop. See [Prefixed color objects](/docs/reference/color-variants#prefixed-color-objects)',
    },
    tagColor: {
      type: 'ColorExtendables',
      default: undefined,
      description:
        'Color object for form tags: `theme`, `bg`, `fg` keys render `theme-*`, `bg-*`, `fg-*` classes. See [Prefixed color objects](/docs/reference/color-variants#prefixed-color-objects)',
    },
  }) as const

const singletonProps = Object.freeze(commonProps())

export const buildCommonProps = (
  obj?: Partial<Record<keyof typeof singletonProps, Partial<PropReference>>>,
): Readonly<typeof singletonProps> => {
  if (!obj) return singletonProps

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const myObject = commonProps() as Record<string, any>

  // Merge the provided object into the common props
  Object.entries(obj).forEach(([key, value]) => {
    myObject[key] = {
      ...myObject[key],
      ...value,
    }
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return Object.freeze(myObject as any)
}

export const commonEmits = {
  cancel: {},
  ok: {},
}

/** `color` prop of components that also accept a border color */
export const colorBorderProp = {
  color: {
    type: 'ColorBorderExtendables | null',
    description:
      "Colors the component with one object: `theme` renders `theme-*`, `bg` renders `bg-*`, `fg` renders `fg-*` and `border` renders `border-*`. Keys left out (or `undefined`) keep the component's default; `null` clears it. See [Color variants](/docs/reference/color-variants)",
  },
}
