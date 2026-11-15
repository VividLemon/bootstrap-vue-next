---
id: baccordion
components:
- BAccordion
- BAccordionItem
- BCollapse
safeRewrite: false
manualReviewRequired: true
confidence: high
match:
- BAccordion
- BAccordionItem
- BCollapse
- accordion
- visible
- v-model
---

# BAccordion Migration

## Summary

BootstrapVue did not ship a first-class accordion component, so accordion migrations usually start from `BCollapse`-based patterns rather than a direct `BAccordion` replacement.

## Affected APIs

- BAccordion
- BAccordionItem
- BCollapse

## Breaking Change

BootstrapVueNext provides dedicated `BAccordion` and `BAccordionItem` components for accordion behavior.

In BootstrapVue, similar UIs were commonly built with `BCollapse` plus the `accordion` prop. When migrating those patterns, map the grouped `BCollapse` instances to `BAccordion`/`BAccordionItem` and then review the surrounding behavior, as accordions are common but not identical to the older collapse-based implementation.

See [BCollapse](../components/bcollapse.md) and [Show and Hide](../patterns/show-hide.md) for the underlying visibility changes.

## Migration Notes
- Review related migrations for shared prop, event, and slot changes.

## Safe Automatic Rewrite

No. Accordion migrations often begin as a mechanical `BCollapse` to `BAccordion` mapping, but the surrounding structure and behavior should still be reviewed.

## Related Migrations

- [bcollapse](../components/bcollapse.md)
- [show-hide](../patterns/show-hide.md)
