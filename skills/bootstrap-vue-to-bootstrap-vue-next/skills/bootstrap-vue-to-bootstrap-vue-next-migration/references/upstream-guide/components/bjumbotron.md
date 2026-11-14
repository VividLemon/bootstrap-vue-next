---
id: bjumbotron
components:
- BJumbotron
safeRewrite: true
manualReviewRequired: false
confidence: high
match:
- BJumbotron
- <BJumbotron>
---

# BJumbotron Migration

## Summary

Migration notes for BJumbotron from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BJumbotron

## Breaking Change

> **Deprecated / not supported** — `BJumbotron` component (deprecated by Bootstrap).

Bootstrap removed the Jumbotron component in Bootstrap 5, but the same presentation can be recreated using
  utility classes if needed.

Note that Bootstrap has deprecated their Jumbotron component, but it can be replicated using
utility classes. See their [migration guide](https://getbootstrap.com/docs/5.3/migration/#jumbotron)
for details.

## Migration Notes

## Safe Automatic Rewrite

Yes. This entry is mostly mechanical and can usually be rewritten automatically when the surrounding code matches the documented patterns.

## Related Migrations

- None

<script setup lang="ts">
import {DeprecationReason} from '../../../types/deprecation'
</script>
