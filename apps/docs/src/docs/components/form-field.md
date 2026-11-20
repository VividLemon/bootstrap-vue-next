---
title: Form Field
description: 'The `BFormField` component is the easiest way to add some structure to forms. Its purpose is to pair form controls with a legend or label, and to provide help text and invalid/valid feedback text, as well as visual (color) contextual state feedback.'
---

<<< DEMO ./demo/FormFieldOverview.vue

## Label

Use the prop `label` to set the content of the generated `<legend>` or `<label>` element, or by
using the named slot `label`, You may optionally visually hide the label text while still making it
available to screen readers by setting the prop `label-visually-hidden`.

By default the label is placed inside a `<legend>`; when a label target is known (either via the
`label-for` prop, or auto-detected from a single child input — see
[Automatic Inheriting of id](#automatic-inheriting-of-id)), a `<label>` element with the `for`
attribute is rendered instead. See [Markup](#markup) for the root element.

If you provide an input `id` value to the `label-for` prop, the `id` must exist on the input
contained within the `BFormField`. When specifying the id, **do not** prepend it with `#`. The
`label-for` prop should only be used when you have a single form input inside the `BFormField`
component. Do not set the `label-for` prop when using `BFormRadioGroup`, `BFormCheckboxGroup`,
`BFormRadio`, `BFormCheckbox` or `BFormFile` components (or when placing multiple inputs in
the same form group) — these inputs include integrated label element(s) and the `<legend>`
element is more suitable. With `label-for` unset, auto-detection only claims `<label for>`
when there is exactly one slot input without its own integrated label, so these cases render
as `<fieldset>` + `<legend>`.

You can also apply additional attributes to the label via the `label-attrs` prop, such as responsive
padding and text alignment utility classes (`:label-attrs="{class: 'fw-bold'}"`). Its `class` and
`style` merge with the component's own label classes.

### Markup

`BFormField` renders Bootstrap v6's [Field](https://getbootstrap.com/docs/6.0/forms/field/) markup:

| Mode                                           | Root                                          | Label                                      |
| ---------------------------------------------- | --------------------------------------------- | ------------------------------------------ |
| Single control (`label-for`, or auto-detected) | `.form-field`                                 | `<label class="form-label" for>`           |
| Group (checks, radios, several inputs)         | `<fieldset class="form-group">`               | `<legend class="form-label">`              |
| Floating                                       | `<div class="form-field">` > `.form-floating` | `<label for>`                              |
| Horizontal                                     | grid row (`.row` + columns)                   | `.col-form-label` (`pt-0` on a `<legend>`) |

`.form-field` lays out the label, control, feedback and description as a grid with a consistent
gap; `.form-group` groups several fields under one legend. The root also has the library class
`b-form-field`.

The root is a `<div>` when `label-for` is set (or in floating mode) and a `<fieldset>` otherwise.
An auto-detected single control keeps the `<fieldset>` root (with the `.form-field` class and a
`<label for>`), because the target is only known after the control renders and replacing the root
element would remount it. Set `label-for` to get a `<div>` root.

::: info NOTE
Horizontal mode has no `.form-field`, so Bootstrap's native `:user-invalid` feedback for controls
inside a `BInputGroup` (`.form-field:has(.input-group .form-control:user-invalid)`) doesn't show
there. Prop-driven `state` still shows the feedback.
:::

### Automatic Inheriting of id

The `BFormField` component automatically inherits the id of its child input components, such as BFormInput and BFormTextarea. This functionality ensures that the label element's for attribute is correctly set to match the id of the input component, providing proper association between the label and the input field.

<<< DEMO ./demo/FormFieldId.vue#template{vue-html}

### Multiple inputs in one form field

When more than one input registers inside a `BFormField` (for example, a `BInputGroup` with
two `BFormInput`s), the label `for` association is ambiguous, so `BFormField` keeps the
label as a `<legend>` instead of auto-binding it to one input. Give each child input its own
accessible name via `aria-label` (or a visually hidden `<label>`).

<<< DEMO ./demo/FormFieldMultipleInputs.vue#template{vue-html}

### Horizontal layout

By default, the label appears above the input element(s), but you may optionally render horizontal
(label to the left of the input) at the various standard Bootstrap breakpoints.

The `label-cols` prop allows you to specify how many columns the label should occupy in the row.
The input will fill the rest of the row width. It takes a responsive object keyed by breakpoint
(`xs`, `sm`, `md`, `lg`, `xl`, `2xl`), where `xs` applies to all screen sizes and every other key
applies to that breakpoint and up. Each value must be a number from `1` to `12`, `true` to make the
label and input(s) each occupy an equal share of the row width (handy if you have custom Bootstrap
with an odd number of columns), or `'auto'` so that the label occupies only the width that is needed.

It is also possible to specify how many columns the content should occupy in the row via the
`content-cols` prop, which takes the same responsive object.

When using both, the `label-cols` and `content-cols` props, make sure that the total amount of
columns does not exceed `12`.

See the [Grid System](/docs/components/grid-system#how-it-works) docs for further information.

```vue-html
<BFormField :label-cols="{ xs: 12, sm: 4, lg: 3 }" :content-cols="{ sm: true, lg: 7 }">
<!-- label: col-12 sm:col-4 lg:col-3, content: sm:col lg:col-7 -->
```

<<< DEMO ./demo/FormFieldHorizontalLayout.vue#template{vue-html}

You can also set the label cols to `'auto'`.

### Label size

You can control the label text size match the size of your form input(s) via the optional
`label-size` prop. Values can be `'sm'` or `'lg'` for small or large label, respectively. Sizes work
for both horizontal and non-horizontal form groups.

<<< DEMO ./demo/FormFieldLabelSize.vue#template{vue-html}

### Label text alignment

The label text may also optionally be aligned `start`, `center` or `end` via the `label-align` prop.
It takes a responsive object keyed by breakpoint, and renders Bootstrap v6 prefix classes:
`:label-align="{ xs: 'center', md: 'end' }"` renders `text-center md:text-end`.

Alignment has no effect if the `label-visually-hidden` prop is set.

### Customizing wrapper elements in horizontal layout

When using horizontal layout (with `label-cols` or `content-cols` props), the label and content are wrapped in column elements. You can apply additional attributes, classes, or styles to these wrapper elements using the `label-wrapper-attrs` and `content-wrapper-attrs` props.

This is particularly useful when you need to override the default column widths with custom sizing:

<<< DEMO ./demo/FormFieldWrapperAttrsBasic.vue#template{vue-html}

**Important Notes:**

- These props **only apply in horizontal layout mode** (when `label-cols` or `content-cols` is set)
- `label-wrapper-attrs` applies to the column wrapper around the label element
- `content-wrapper-attrs` applies to the column wrapper around the content/input
- Use `label-attrs` if you need to style the `<label>` or `<legend>` element itself
- The `class` property in wrapper attrs will be merged with the Bootstrap column classes

**Common use case:** You need more precise control over column widths than Bootstrap's 12-column grid provides. For example, setting a label to exactly 120px wide using flexbox properties:

<<< DEMO ./demo/FormFieldWrapperAttrsCustom.vue{vue}

## Nested form fields

Feel free to nest `BFormField` components to produce advanced form layouts and semantic grouping
of related form controls:

<<< DEMO ./demo/FormFieldNested.vue#template{vue-html}

## Disabled form field

Setting the `disabled` prop disables the controls inside `BFormField`: a `<fieldset>` root gets
the `disabled` attribute (which disables every input inside it), and the library's form controls
read `disabled` from the field in every mode, including the `<div>` root.

## Validation state feedback

Bootstrap includes validation styles for `valid` and `invalid` states on most form controls.

Generally speaking, you'll want to use a particular state for specific types of feedback:

- `false` (denotes invalid state) is great for when there is a blocking or required field. A user
  must fill in this field properly to submit the form
- `true` (denotes valid state) is ideal for situations when you have per-field validation throughout
  a form and want to encourage a user through the rest of the fields
- `null` Displays no validation state (neither valid nor invalid)

To apply one of the contextual state icons on `BFormField`, set the `state` prop to `false` (for
invalid), `true` (for valid), or `null` (no validation state).

Bootstrap uses sibling CSS selectors of invalid or valid inputs to show the feedback text.
Some form controls (such as checkboxes, radios, and file inputs, or inputs inside input-groups) are
wrapped in additional markup that will no longer make the feedback text a sibling of the input, and
hence the feedback will not show. In these situations you will need to set the validity `state` on
the `BFormField` _as well as_ the input.

Feedback will also be shown when the parent `BForm` has the `validate` prop set and the user has
interacted with an input that fails (or, with `validate="valid"`, passes) native browser validation
constraints such as `required`. Refer to Bootstrap 6's
[Forms Validation](https://getbootstrap.com/docs/6.0/forms/validation/) documentation for
details on validation methods.

You should always provide content via the `invalid-feedback` prop (or slot) to aid users using
assistive technologies when setting a contextual `invalid` state.

### Automatic passing of state to child

For some elements the child input element will automatically receive the state of the form group. `:state="false"` on the `BFormField` will automatically give the appropriate class to the input element. Explicit sets of the `state` prop to the child element will override this.

<<< DEMO ./demo/FormFieldState.vue#template{vue-html}

### Invalid feedback

Show optional invalid state feedback text to provide textual state feedback (html supported) by
setting the prop `invalid-feedback` or using the named slot `invalid-feedback`.

Invalid feedback is rendered using the
[`BFormInvalidFeedback`](/docs/components/form#helper-components) form sub-component.

### Valid feedback

Show optional valid state feedback text to provide textual state feedback (html supported) by
setting the prop `valid-feedback` or using the named slot `valid-feedback`.

Valid feedback is rendered using the
[`BFormValidFeedback`](/docs/components/form#helper-components) form sub-component.

### Feedback style

By default, when visible, feedback (valid or invalid) will show as a block of text. You can change
the feedback so that it shows as a static tooltip when visible, by setting the prop `tooltip` to
`true`.

### Feedback limitations

::: Info NOTE
When using `BInputGroup`, `BFormFile`, `BFormRadioGroup`, `BFormRadio`,
`BFormCheckboxGroup` or `BFormCheckbox` inside a `BFormField`, setting an invalid (or
valid) `state` on the `input` alone will **not** trigger the invalid (or valid) feedback to show
(due to limitations with the Bootstrap validation CSS). To get around this, **you must also**
set the invalid/valid `state` on `BFormField`. Native browser validation will **not** trigger
the invalid feedback to show when using one of the above-mentioned form controls.
:::

## Floating labels

BFormField supports the [Floating labels](https://getbootstrap.com/docs/6.0/forms/floating-labels/) feature of Bootstrap.
As Bootstrap v6 requires, the label is rendered before the control inside the `.form-floating` wrapper.

You can make a floating label by setting the property `floating` to true and specify a placeholder on the `BFormInput`.

### Example

<<< DEMO ./demo/FormFieldFloatingLabels.vue

### Restrictions

Floating labels have a few restrictions.

- Floating labels do not work in horizontal layout. Horizontal layout precedes the `floating` property. Do not set the `content-cols` or `label-cols` properties if you want floating labels.
- The `BFormInput` must have a placeholder property set.

## Accessibility

When no label target is known (no `label-for`, and not auto-detected from a single child input),
`BFormField` renders a `<fieldset>` and places the label content inside its `<legend>` element. By nature of this markup,
the legend content is automatically associated to the containing input control(s).

It is **highly recommended** that you provide a unique `id` prop on your input element and set the
`label-for` prop to this Id, when you have only a single input in the `BFormField`.

When multiple form controls are placed inside `BFormField` (i.e. a series or radio or checkbox
inputs, or a series of related inputs), **do not set** the `label-for` prop, as a label can only be
associated with a single input. It is best to use the default rendered markup that produces a
`<fieldset>` + `<legend>` which will describe the group of inputs.

When placing multiple form controls inside a `BFormField` (and you are not nesting
`BFormField` components), it is recommended to give each control its own associated `label`
(which may be visually hidden using the `.visually-hidden` class) and set the labels `for` attribute to the
`id` of the associated input control. Alternatively, you can set the `aria-label` attribute on each
input control instead of using a `label`. For `BFormRadio` and `BFormCheckbox` (or the
group versions), you do not need to set individual labels, as the rendered markup for these types of
inputs already includes a `label` element.

When the `BFormField` has a `label-for` prop set, the `aria-describedby` attribute will be
auto-assigned to the input. When the form group has multiple form controls, make sure to set the
attribute to each control yourself by using the `ariaDescribedby` prop value from the optionally
scoped `default` slot.
