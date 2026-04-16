---
description: 'A sequence of one-character alphanumeric inputs for capturing OTP codes, PINs, and verification codes.'
---

<<< DEMO ./demo/OtpInputOverview.vue

## Number of inputs

Use the `length` prop to specify the number of input fields to render. The default is `5`.

<<< DEMO ./demo/OtpInputLength.vue#template{vue-html}

## Numeric mode

Set the `type` prop to `'number'` to restrict input to numeric values only.

<<< DEMO ./demo/OtpInputNumeric.vue

## OTP mode

Set the `otp` prop to enable OTP auto-detection on mobile devices. This enables the `autocomplete="one-time-code"` attribute, allowing mobile devices to suggest OTP codes from messages or clipboard.

<<< DEMO ./demo/OtpInputOtp.vue

## Masked input

Set the `mask` prop to treat the OTP inputs as password fields, hiding the entered characters.

<<< DEMO ./demo/OtpInputMask.vue

## Placeholder

Use the `placeholder` prop to set a placeholder character displayed in empty input fields.

<<< DEMO ./demo/OtpInputPlaceholder.vue

## Complete event

The `complete` event is emitted when all input fields have been filled. This is useful for automatically submitting the form or triggering validation.

<<< DEMO ./demo/OtpInputComplete.vue

## Control sizing

Set heights using the `size` prop to `sm` or `lg` for small or large respectively.

<<< DEMO ./demo/OtpInputSize.vue#template{vue-html}

## Contextual states

Use the `state` prop to apply contextual validation styling. Set to `true` for valid, `false` for invalid, or `null` for no validation state.

<<< DEMO ./demo/OtpInputState.vue#template{vue-html}

## Disabled state

Set the `disabled` prop to prevent user interaction with the OTP input.

<<< DEMO ./demo/OtpInputDisabled.vue#template{vue-html}

## Clipboard paste support

`BOtpInput` supports pasting from the clipboard. When the user pastes content, the characters are distributed across the input fields starting from the first field if the pasted content length matches or exceeds the number of inputs, or from the currently focused input otherwise.

## Accessibility

### Keyboard interactions

| Key              | Description                                                                                                                                                                                                     |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ArrowLeft`      | Focus on the previous input                                                                                                                                                                                     |
| `ArrowRight`     | Focus on the next input                                                                                                                                                                                         |
| `Home`           | Focus on the first input                                                                                                                                                                                        |
| `End`            | Focus on the last input                                                                                                                                                                                         |
| `Backspace`      | Deletes the value of the current input. If the input is empty, moves to the previous input and deletes that value as well                                                                                       |
| `Delete`         | Deletes the value of the current input                                                                                                                                                                          |
| `Ctrl` + `V`     | Pastes the contents of the clipboard into the OTP input. If the number of characters in the clipboard equals or exceeds the number of inputs, the contents are pasted from the first input. Otherwise, the contents are pasted from the current input onwards |
