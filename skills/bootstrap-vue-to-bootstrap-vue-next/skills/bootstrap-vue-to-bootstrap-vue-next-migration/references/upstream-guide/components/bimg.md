---
id: bimg
components:
- BImg
- BImgLazy
- BCardImgLazy
safeRewrite: true
manualReviewRequired: false
confidence: high
match:
- BImg
- BImgLazy
- BCardImgLazy
- <BImg>
---

# BImg Migration

## Summary

Migration notes for BImg from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BImg
- BImgLazy
- BCardImgLazy

## Breaking Change

See the [Rounding](../props/rounded-radius-element.md) section.

Lazy loading is now achieved through the native `loading` attribute rather than a separate component.

> **Deprecated / not supported** — `BImgLazy` and `BCardImgLazy` components (achievable using Bootstrap classes natively).

Use the native <code>loading="lazy"</code> attribute on <code>&lt;BImg&gt;</code> and <code>&lt;BCardImg&gt;</code> instead.

## Migration Notes
- Review related migrations for shared prop, event, and slot changes.

## Safe Automatic Rewrite

Yes. This entry is mostly mechanical and can usually be rewritten automatically when the surrounding code matches the documented patterns.

## Related Migrations

- [rounded-radius-element](../props/rounded-radius-element.md)

<script setup lang="ts">
import {DeprecationReason} from '../../../types/deprecation'
</script>
