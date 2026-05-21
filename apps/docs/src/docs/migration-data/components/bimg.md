---
id: bimg
title: BImg Migration
category: components
components:
  - BImg
  - BImgLazy
  - BCardImgLazy
match:
  - BImg
  - BImgLazy
  - BCardImgLazy
  - <BImg>
tags:
  - migration
  - components
  - bimg
safeRewrite: false
migrationType: component-migration
introducedIn: bootstrap-vue-next
manualReviewRequired: true
related:
  - rounded-radius-element
confidence: high
---

# BImg Migration

## Summary

Migration notes for BImg from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BImg
- BImgLazy
- BCardImgLazy

## Breaking Change

See the [Rounding](/docs/migration-data/props/rounded-radius-element) section.

Lazy loading is now achieved through the native `loading` attribute rather than a separate component.

<DeprecatedFeature :reason="DeprecationReason.BOOTSTRAP_NATIVE" what="`BImgLazy` and `BCardImgLazy` components" :plural="true">
  Use the native <code>loading="lazy"</code> attribute on <code>&lt;BImg&gt;</code> and <code>&lt;BCardImg&gt;</code> instead.
</DeprecatedFeature>

## Migration Notes

- Extracted from the canonical BootstrapVue → BootstrapVueNext migration guide.
- Review related migrations for shared prop, event, and slot changes.

## Safe Automatic Rewrite

No. This entry includes behavioral or structural changes and should be reviewed manually before applying automated transforms.

## Related Migrations

- [rounded-radius-element](/docs/migration-data/props/rounded-radius-element)

<script setup lang="ts">
import {DeprecationReason} from '../../types/deprecation'
</script>
