---
id: btime
title: BTime Migration
description: 'Migration notes for BTime from BootstrapVue to BootstrapVueNext BTimeField.'
category: components
components:
  - BTime
  - BTimeField
match:
  - BTime
  - <BTime>
tags:
  - migration
  - components
  - btime
safeRewrite: false
migrationType: component-migration
introducedIn: bootstrap-vue-next
manualReviewRequired: true
confidence: medium
---

# BTime Migration

## Summary

`BTime` (a display-only "live clock" / time-selection widget) has been replaced by `BTimeField`, a segmented time input built on Reka UI's `TimeField` primitive. The value type, prop names, and rendering model all changed.

## Affected APIs

- BTime

## Breaking Change

- **Component renamed**: `BTime` → `BTimeField`.
- **Value type changed**: BootstrapVue's `BTime` emitted/accepted a formatted **string** (e.g. `'14:20:18'`) via `value`/`context` events. `BTimeField`'s `v-model` is a `Time | null` object from `@internationalized/date` (a peer dependency of `bootstrap-vue-next` via Reka UI), not a string.
- **Rendering model changed**: `BTime` rendered a self-contained, always-visible analog/digital display with its own internal ticking clock and "Now"/"Reset" buttons. `BTimeField` is a segmented input (separate hour/minute/second/AM-PM fields) intended for capturing a user-entered time value — it does not render a live clock, and has no built-in "now" or "reset" controls.
- **Prop renames / removals**:
  - `hour12` (boolean) → `hour-cycle` (`12 | 24`)
  - `locale` is still supported, with the same meaning
  - `show-seconds` → use `granularity="second"` instead
  - `hide-header`, `no-close-button`, `now-button`, `reset-button`, `label-now-button`, `label-no-time-selected`, `label-selected`, and other BootstrapVue-only display/control props have no equivalent — `BTimeField` renders only the segmented input
  - `min`/`max` (string) → `min-value`/`max-value` (`Time` instance)
- **No built-in floating menu**: BootstrapVue's `BTime` was always rendered inline (not in a dropdown), so this particular aspect does not change. See the [`BFormTimepicker` migration guide](/docs/migration-data/components/bformtimepicker) for the dropdown-related breaking change that applies to the picker component.

## Migration Notes

- Replace `<BTime v-model="stringValue" />` with `<BTimeField v-model="timeValue" />`, where `timeValue` is a `Time | null` ref instead of a string ref.
- To convert an existing string time (`'HH:mm:ss'`) to a `Time` instance, parse it manually, e.g. `new Time(...str.split(':').map(Number))`.
- To convert a `Time` back to a string for submission (e.g. a hidden form field), use `.toString()` on the `Time` instance.
- If you relied on `BTime`'s live-updating clock display, `BTimeField` does not provide this — consider a plain `setInterval`-driven display alongside the field, or keep using `BTime`-style formatting utilities independently of this component.
- See the [`BTimeField` documentation](/docs/components/time-field) for full prop/event/slot reference and usage examples.

## Safe Automatic Rewrite

No. The value type change (string → `Time` object) and the removal of live-clock/now/reset controls require manual review of every usage site.

## Related Migrations

- [bformtimepicker](/docs/migration-data/components/bformtimepicker)
