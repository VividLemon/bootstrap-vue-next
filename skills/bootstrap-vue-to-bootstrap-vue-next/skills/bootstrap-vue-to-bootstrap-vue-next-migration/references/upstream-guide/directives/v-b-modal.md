---
id: v-b-modal
components: []
safeRewrite: true
manualReviewRequired: false
confidence: high
match:
- Modal
- v-b-modal
- v-b-toggle
- not-collapsed
- this.$bvModal.show(id)
---

# v-b-modal Migration

## Summary

Migration notes for v-b-modal from BootstrapVue to BootstrapVueNext.

## Affected APIs

- None explicitly listed

## Breaking Change

### Relationship with v-b-toggle

In BSVN, `v-b-modal` is an alias for `v-b-toggle`:

- Both directives work identically
- `v-b-modal` is semantically clearer when working with modals
- `v-b-toggle` works with modals, collapse, and offcanvas
- Use whichever makes your code more readable

```vue-html
<!-- BSV: Only v-b-modal worked with modals -->
<BButton v-b-modal.my-modal>Show Modal</BButton>
```

```vue-html
<!-- BSVN: Both work identically - choose based on semantics -->
<BButton v-b-modal.my-modal>Show Modal</BButton>
<BButton v-b-toggle.my-modal>Show Modal</BButton>
```

### New Features in BSVN

**Array value support:**

```vue-html
<!-- BSVN allows arrays (BSV required space-separated strings) -->
<BButton v-b-modal="['modal-1', 'modal-2']">Show Multiple</BButton>
```

**CSS class tracking:**

BSVN adds `collapsed`/`not-collapsed` classes to trigger elements based on modal state, allowing for conditional styling.

**Migration from BSV `this.$bvModal.show(id)`:**

BSV's `this.$bvModal.show(id)` has been replaced with multiple approaches. See the [BModal directive documentation](https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/directives/BModal#comparison-with-other-approaches) for detailed migration examples.

## Migration Notes

## Safe Automatic Rewrite

Yes. This entry is mostly mechanical and can usually be rewritten automatically when the surrounding code matches the documented patterns.

## Related Migrations

- None
