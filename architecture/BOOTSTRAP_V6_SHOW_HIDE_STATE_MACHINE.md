# Bootstrap v6: show/hide state machine

Handoff for the orchestrating agent of the Bootstrap v6 work. It describes a problem, a goal and a proposed design. **Fitting it into the existing v6 plan (`architecture/BOOTSTRAP_V6_MIGRATION.md`, `architecture/BOOTSTRAP_V6_NEW_COMPONENTS.md`, `architecture/BOOTSTRAP_V6_OVERLAYS.md`) is the orchestrator's job**: sequencing, batch boundaries, which parts land with the Dialog/Drawer rewrite, and which questions go to the maintainer.

Written 2026-11-09 from a session that fixed show/hide bugs on `main`. Breaking changes are allowed: the maintainer said "as many or as few as required".

**Status: Decided** (2026-11-09). The orchestrator verified the v6 findings with tests, placed the work in the plan and routed the questions; see [Orchestration](#orchestration) and [Decisions](#decisions). Implementation has not started.

## Summary

- Show/hide components (Dialog/Modal, Drawer/Offcanvas, Toast, Popover/Tooltip, Collapse, Alert, Menu/Dropdown, Tabs) share one lifecycle composable. It has never been modelled as a state machine. Its state is spread across a dozen refs and timers, it is entered from about ten directions, and it emits synchronous events while half-updated. That produces an endless stream of edge-case bugs: one session found and fixed 19 of them, and every review round found more.
- v6's native `useShowHide` (on `bootstrap-v6-foundations`) already removes the worst parts: no `<Transition>`, one operation counter, a per-operation promise, and superseded operations resolve `false`. Some of the same bug classes are still there (see [What v6 still has](#what-the-v6-native-useshowhide-still-has)), and the orchestrator layer is still unchanged.
- **Goal:** make the lifecycle an explicit state machine with one owner of visibility. Do it once, as part of the v6 overlays work, because the native `<dialog>` rewrite already replaces the lifecycle code for BModal/BOffcanvas and the result type (`useDialog` Q4) is being redesigned anyway.
- **Proposal:** one internal machine (`createShowHideMachine`) behind `useShowHide`, with named states, a transition table, operation objects that own their trigger, promise and `AbortController`, and an "update state, then emit" rule. The orchestrator controller reads the machine instead of mirroring `modelValue` in its store.

## Background: what happened on `main`

Sources, so the orchestrator can mine them for test cases:

- bootstrap-vue-next/bootstrap-vue-next#3371: repeated hides during a modal's delay or fade emitted `ok`/`hide` twice and overwrote the `hidden` trigger.
- bootstrap-vue-next/bootstrap-vue-next#3372 (Copilot fix): a `hideInProgress` flag. Review found it could leave a modal impossible to close.
- VividLemon/bootstrap-vue-next#173 (branch `fix/show-hide-abort-signal-v2`, based on upstream `main` after 1.2.3): the alternative fix plus a public `AbortSignal` API, and five rounds of review fixes. All of it targets the **legacy** composable (`useShowHide.ts` on `main`, which is `useLegacyShowHide.ts` on v6), the orchestrator and BTooltip. 5,599 unit tests pass.
- bootstrap-vue-next/bootstrap-vue-next#3374 (head `VividLemon:main`, at 992d1da38): the upstream PR for the same work, squashed from #173 plus one review-fix commit. Its review added rows 20–26 below.

#173 is the most complete record of what goes wrong. Its tests (`useShowHide.spec.ts`, `orchestratorShared/index.spec.ts`, `useModal.spec.ts`) are effectively the edge-case catalog below. Port the cases, not the code: its code is still patches on the legacy design.

### Edge-case catalog (each one was a real bug)

Every row should become a row in the machine's test table.

| #   | Situation                                                                                        | Wrong behavior                                                                                         |
| --- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| 1   | `hide()` twice during the hide delay or leave                                                    | `ok`/`hide` emitted twice, `hidden` trigger overwritten (#3371)                                        |
| 2   | `show(); hide()` in the same frame                                                               | show's `requestAnimationFrame` reopened it after the hide; with #3372, it could never close again      |
| 3   | `hide()` while a show waits for its frame or `delay`                                             | no leave ran, so `isLeaving` stuck `true`, the backdrop stayed with `backdropFirst`, no `hidden`       |
| 4   | `show()` during a leave, then `hide()` before the show's frame                                   | `hidden` emitted twice, the second with the old trigger                                                |
| 5   | `@ok="modal.hide()"` (hide from inside a trigger listener)                                       | `hide` emitted twice                                                                                   |
| 6   | Listener hides while a show is pending, outer `hide()` continues                                 | outer `hide()` returned `undefined`                                                                    |
| 7   | `hidden` listener calls `show()`                                                                 | the new show's promise was resolved with the old hide's trigger                                        |
| 8   | Prevented hide (validation in `@ok`) while `show(true)` waits                                    | the show promise settled `'hide-prevented'`; the eventual real close was never reported                |
| 9   | Prevented hide                                                                                   | it also cancelled a pending delayed show                                                               |
| 10  | Second hide after a prevented hide                                                               | got the already-settled `'hide-prevented'` promise                                                     |
| 11  | `@hide` prevents, then calls `hide('cancel')`                                                    | nested call swallowed                                                                                  |
| 12  | Orchestrated item: component closes itself (Esc, close button, its own trigger, timeout)         | store `modelValue` still `true`, so `controller.show()` never reopened it                              |
| 13  | Orchestrated item shown again after a close                                                      | `show()` returned the first close's event at once (one promise per controller lifetime)                |
| 14  | Orchestrated item dismissed before it mounts                                                     | promise never settled (upstream fix `awaitDismissal`); synthesized event lost the trigger              |
| 15  | `show({signal})` where an `onShow` listener aborts during the show request                       | the abort's `hide()` was a no-op, then the show committed                                              |
| 16  | Already-aborted `show({signal})` on a component shown through its own `show()`                   | store said "hidden", so the modal stayed open                                                          |
| 17  | `destroy()` while the store is stale or a show is pending                                        | item removed mid-hide, `show()` promise pending forever                                                |
| 18  | Component wrapper drops arguments (BTooltip `hide: () => popover.hide()`)                        | trigger lost through the wrapper                                                                       |
| 19  | Disabled dropdown with an open menu (bootstrap-vue-next/bootstrap-vue-next#3373)                 | `disabled` only disables buttons; `show()`, `v-model` and injected `show` still open it                |
| 20  | Orchestrated item whose `onShow` prevents the show, then `destroy()`                             | `show()` waited forever and `destroy()` never removed the item                                         |
| 21  | `show-prevented` from another entry point while an accepted show is still pending                | must **not** settle the pending show's cycle (attribute the prevention to the request it answers)      |
| 22  | `resolveOnHide`, `await show()`, then `destroy()` right away                                     | the cycle was already settled on `hide`; `destroy()`'s new wait was never settled by `hidden`          |
| 23  | A modal and a toast created with the same `id`                                                   | the store sync looked the id up across all stores and updated the wrong item                           |
| 24  | Unmounted item: `show(); hide('cancel'); show()`                                                 | the second `show()` joined the first, already-dismissed cycle (cleared asynchronously)                 |
| 25  | Item not mounted yet; its mount-time `onShow` aborts the `show({signal})`                        | the abort's hide ran before the show committed, so the modal opened anyway                             |
| 26  | During a pending show, an `ok` listener hides (finishes at once) and a `hidden` listener reopens | the outer hide only yielded to a newer **hide**, so it cancelled the reopen and emitted `hidden` again |

## Root causes

1. **No named states.** The real lifecycle has six states. The code infers them from flag combinations (`showRef && !hideTimeout && !_Promise`), and every new flag multiplies the combinations nobody checked.
2. **Several sources of truth.** Legacy: `modelValue`, `showRef`, `renderRef`, `isVisible`, `isActive`, `isLeaving`, backdrop refs, both timeouts, `_Promise`, and in the orchestrator the store `modelValue`, `controller.ref` and `basePromise`. They are updated at different moments and drift apart (#12, #16, #17).
3. **Time is split across four async mechanisms** (rAF, `setTimeout` delays, `nextTick`, transition hooks), and nothing cancelled earlier steps (#2, #3, #4).
4. **Completion is owned by something outside the machine.** `hidden` waited for `<Transition>`'s `onAfterLeave`, which does not run when nothing was revealed, on unmount, or under a test stub (#3, #14, #17).
5. **Synchronous events fired mid-update.** `emit` runs listeners inside `hide()` while state is half-written, and listeners call `show`/`hide`/`preventDefault` (#5, #6, #7, #11).
6. **About ten entry points with different assumptions:** `v-model`, the `visible` and `show` props, exposed methods, the trigger registry, `bv-toggle`, Esc/backdrop, the orchestrator controller, and global `useModal().hide(id)`. A `noAction` flag exists only to stop them echoing each other.
7. **One promise slot for everything** (`_Promise` holds whichever show or hide made it last, and its meaning changes with `resolveOnHide`) (#8, #10).
8. **The orchestrator duplicates visibility.** The controller decides from the store's `modelValue`, which the component never wrote back (#12, #13, #16, #17).
9. **One composable shared by about eight components,** each with its own options (countdown `modelValue`, `lazy`, `backdropFirst`, temporary hide, delays).

## What the v6 native `useShowHide` still has

Read from `bootstrap-v6-foundations`, `packages/bootstrap-vue-next/src/composables/useShowHide.ts`.

Already fixed by its design: causes 3 and 4 (no rAF or `<Transition>`; completion is `useCssTransition().run()` resolving `true`/`false`), 7 (per-operation `pending` promise, superseded resolves `false`), most of 2 (`visible`, `isActive`, `instant`, `pending`). Native-path adopters: on `bootstrap-v6-foundations` only **BCollapse** (and `BAccordionItem` through it); `bootstrap-v6-feedback` (#167) moves **BAlert** and **BToast**; BPopover/BTooltip move in their batch. BModal, BOffcanvas, BDropdown, BPopover and (until #167 merges) BAlert/BToast are still on `useLegacyShowHide`.

Still open. Each item below was first found by reading the code; the [verification](#verification-on-bootstrap-v6-foundations) section has the test results.

- **Emit before settle (#7).** `apply()` emits `hidden`/`shown` and then calls `settle(...)`. A `hidden` listener that calls `show()` runs `start()`, which calls `settle(false)` on the still-pending hide, so the hide's promise resolves `false` instead of its trigger.
- **Reentrant hides (#5, #11).** `hide()` emits the trigger event and `hide` before `start()`. A listener that calls `hide()` starts its own operation, then the outer call continues and starts another one: `hide` is emitted twice, and the first operation is superseded. The `pending?.visible === false` guard only covers operations already started.
- **Prevented paths revert `modelValue` through `targetVisible()`** while a nested call may already have changed `pending`.
- **`noCloseOnBackdrop` / `noCloseOnEsc` still live in the core** (the overlays doc already plans to move them to Dialog/Drawer).
- **No cancellation signal** for async work started from listeners, and no `signal` on the controller (#173 added both on the legacy path).
- **Implicit states remain:** `visible`, `isActive`, `instant`, `pending` and `delayTimer` together encode the state. Simpler than legacy, but still inferred.
- **Orchestrator unchanged on the v6 branches:** `bootstrap-v6-foundations` has neither upstream's `awaitDismissal` (1.2.3) nor #3374's store sync and per-cycle promise, so #12–#17 and #20–#25 apply there.

### Verification on `bootstrap-v6-foundations`

Run on 2026-11-09 at `ba09b1407` with a throwaway spec that mounts a host component and calls `useShowHide` directly (no transition callback, so a transition finishes after `nextTick`). The spec was not committed. The machine PR adds these as table rows.

| Catalog row                                       | Result on v6 native `useShowHide`                                                                                                                                                                           |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #1 `hide()` twice during the hide delay           | **Fixed.** One `ok` / `hide` / `hidden`, and both calls resolve `'ok'`                                                                                                                                      |
| #2 / #3 `show(); hide()` during the show delay    | **Fixed.** The show resolves `false`, the hide resolves its trigger; `visible` and `isActive` end `false` and `hidden` fires once                                                                           |
| #4 `show()` during a hide delay, then `hide()`    | **Fixed.** Earlier calls resolve `false`, the last one resolves `'second'`, and `hidden` fires once with that trigger                                                                                       |
| #5 `@ok` listener calls `hide()`                  | **Bug.** Events are `ok`, `hide` (trigger `null`, the inner call), `hide` (`'ok'`), `hidden` (`'ok'`): `hide` is emitted twice and the inner call's operation is superseded                                 |
| #6 `@hide` listener calls `hide('inner')`         | **Bug.** `hide` is emitted for `'outer'` and for `'inner'`; the outer call supersedes the inner one, so `hidden` has `'outer'` and the inner promise resolves `false`                                       |
| #7 `@hidden` listener calls `show()`              | **Bug.** The hide's promise resolves `false` instead of `'close'`: `apply()` emits `hidden` before `settle()`, and the nested show's `start()` settles the hide as superseded                               |
| #11 `@hide` prevents, then calls `hide('cancel')` | **Bug.** The nested hide runs and the component closes (`hidden` with `'cancel'`), but the outer call then emits `hide-prevented` (`'ok'`) and resolves `'hide-prevented'`, which contradicts what happened |

The orchestrator rows (#12–#17, #20–#25) apply unchanged: `orchestratorShared` on the v6 branches has neither `awaitDismissal` nor any `signal` handling, nor #3374's fixes. #26 was not run against the native composable; it is the same nested-request pattern as #5 / #6, and S1's table covers it either way.

## Goal

1. One explicit state machine owns visibility for every show/hide component. Everything else (`v-model`, props, triggers, controller, native `<dialog>` events) only sends requests to it or reads it.
2. Every request in every state has one defined outcome: which events are emitted, what each promise resolves to, and what happens to in-flight work. The test suite is a table of exactly those cases.
3. Listeners always see consistent state, and a call made from inside a listener is just the next request.
4. Nothing waits on something that might not happen: every operation completes, is superseded, or is cancelled, and all three settle its promise.
5. The orchestrator stops keeping its own copy of visibility.
6. Async work tied to an open/close cycle can be cancelled (`AbortSignal`), in events and on the controller.

## Proposed design

This is a proposal for the orchestrator and the maintainer to adjust. Names are placeholders.

### States

```
hidden ─show→ showing ──transition done──→ shown
  ↑                                          │
  └──transition done── hiding ←─hide─────────┘
```

- `hidden`, `showing`, `shown`, `hiding`. A configured `delay` is a sub-phase of `showing`/`hiding` (`phase: 'delay' | 'transition'`), not a separate timer flag.
- `visible` (state class, `aria-expanded`, `modelValue`) = `showing | shown`. `isActive` (keep mounted) = anything but `hidden`. `instant` is a property of the operation, not global state.

### Requests and the transition table

Requests: `show(opts)`, `hide(trigger, opts)`, `toggle()`, `sync(visible)` (from `v-model`, the `visible`/`show` props, or a native `<dialog>` `close` that already happened), `dispose()` (unmount).

Each row is (state, request) → (cancelable events, new state, effect on the in-flight operation and promises). Sketch:

| State     | `show`                                                          | `hide`                                                                      | `dispose`                   |
| --------- | --------------------------------------------------------------- | --------------------------------------------------------------------------- | --------------------------- |
| `hidden`  | `show` event → `showing`                                        | no-op, resolve `''` (no events)                                             | –                           |
| `showing` | join the current operation's promise                            | `hide` event → supersede the show (resolve it `false`, abort it) → `hiding` | abort, settle `false`       |
| `shown`   | resolve `true`                                                  | `hide` event → `hiding`                                                     | settle per policy (Q below) |
| `hiding`  | `show` event → supersede the hide (resolve `false`) → `showing` | join the current hide; its trigger stays                                    | abort, settle `false`       |

Open choices to settle in the table, not in code: whether `hide` during `showing` with nothing revealed yet completes instantly (#3: the legacy fix emits `hidden` immediately; on the native path `useCssTransition` with zero running animations already resolves next frame); whether `show` during `hiding` reverses the running transition (v6 CSS can) or restarts it; what `dispose` emits.

### Operations

- Each `show`/`hide` that passes its cancelable events becomes an **operation object**: `{kind, trigger, value?, instant, controller: AbortController, promise, resolve}`.
- Starting an operation aborts the previous one. Its `delay` timer and `useCssTransition` wait listen on `controller.signal`, so a superseded operation can't run anything afterwards (#2, #4).
- An operation settles exactly once: completed (trigger / `true`), superseded (`false`), or disposed. That replaces `_Promise`, `leaveTrigger`, `hideInProgress`, `showRequested` and `basePromise`.
- `show(true)` / `resolveOnHide`: the caller gets a promise for the **cycle** (show → its eventual hide), not for an operation. Model a cycle object explicitly (#8, #13).

### Emit discipline

- Request phase (cancelable events): emit with the machine still in its old state. If a listener made **any** new request that committed (a hide, or a show started from that hide's `hidden`), the outer request yields to it: return the newer operation's promise, emit nothing more (#5, #6, #11, #26).
- Commit phase: update state first, then emit. Finish events (`shown`/`hidden`) are emitted after the operation is settled and removed, so a listener that calls `show()`/`hide()` starts a clean new operation (#7).

### Completion contract

- The component gives the machine a `transition(op)` that resolves `true` when finished and `false` when superseded (today's `useCssTransition().run()`).
- Native `<dialog>`: the browser can close it without the library (`<form method="dialog">`, a second Escape without user activation, Invoker Commands). The overlays doc already plans a `close` listener. Make that a `sync(false, {trigger, alreadyClosed: true})` request in the table, not a side path.

### Inputs that are not requests today

- `v-model` and the `visible`/`show` props become `sync` requests. The machine decides whether they emit cancelable events and whether a prevented request writes `modelValue` back. Today that is `noAction` plus `targetVisible()` reverts.
- `disabled` (Menu/Dropdown, #19): a guard on `show` at the machine level (and `hide` on disable). The menu shouldn't stay open behind an `inert` attribute.
- `noCloseOnBackdrop` / `noCloseOnEsc`: move out of the machine (the overlays plan already does this for Dialog/Drawer via `backdrop`/`keyboard`).

### Cancellation for users

#173 added these on the legacy path. Keep the semantics and move them onto the machine.

- `event.signal` on cancelable request events: aborted when the machine **commits** its next operation or the component unmounts. A refused request (static backdrop) doesn't abort it. Use: validate or save asynchronously in an `ok` handler that prevents the close. With Dialog Q3, `ok` fires from `ok()`, so this fits directly.
- `controller.show({signal})`: aborting requests `hide('abort')`; already aborted means it never shows and resolves with trigger `'abort'`. On the machine, the controller passes the signal into the cycle.
- Watch out: `BvTriggerableEvent` may change shape with Q4 (`DialogResult` replaces it as the _result_; events may keep it). Decide where `signal` lives.

### Orchestrator

- **One owner:** the controller reads the mounted component's machine state (through the exposed instance or the show/hide registry), not a copy in the store. #173 instead syncs the store from `update:modelValue` in `BOrchestrator`. That works, but it is still a mirror; prefer reading the source.
- Per-cycle results (#13); dismissal before mount (#14) settles with the trigger used; `destroy()` disposes through the machine (#17, #20, #22).
- A prevented show ends the cycle that requested it, and only that cycle (#20, #21). Attribute outcomes to requests (each request's own promise), not to events that any entry point can emit.
- Cycles are cleared at the moment they settle, never in a later continuation (#24).
- Cancellation must apply to a show that hasn't committed yet: an abort during the request or the mount-time show must still prevent or undo it (#15, #25). In the machine this is "abort while a request is in its cancelable phase = prevent it".
- Lookups by id are scoped to the item's own store or component kind (#23). Better still: the controller holds a direct handle to its machine, with no lookup at all.
- `DialogResult {trigger, ok, value?}` (overlays Q4) is built from the cycle's completion, not by mutating an event (`setEventOk` goes away, as already decided).
- Wrappers like BTooltip must forward all arguments (#18). A `defineExpose` helper that re-exports the machine API would prevent it.

## Breaking changes this implies (beyond those already decided for Dialog/Drawer)

For the maintainer and orchestrator to accept or trim:

- `useShowHide`'s return shape (state enum instead of or alongside `visible`/`isActive`/`instant`); exposed `show`/`hide`/`toggle` return values: superseded resolves `false` (already true on the native path); `resolveOnHide` replaced by an explicit cycle API.
- Event order guarantees documented ("state is committed before `shown`/`hidden`"; "a nested request replaces the outer one").
- `BvTriggerableEvent` gains `signal` (or the result/event split from Q4 decides).
- Controller `show({signal})`; possibly `controller.state` instead of `ref.visible`.
- `useLegacyShowHide` deleted once Dialog, Drawer and Menu move (already planned). None of #173's legacy-only fixes need porting if that happens first.

## Test strategy

- Write the transition table as data, and generate tests from it: state × request × listener behavior (none, prevents, nested `show`/`hide`, throws) → expected events, final state, every promise's result.
- Add the catalog rows above that the table does not cover by construction (#12–#19 are orchestrator/component level).
- Use fake timers plus the `useCssTransition` stub (happy-dom has no `getAnimations()`/`showModal()`, as `collapse.spec.ts` already handles). Add a real-transition test per component, since VTU's `<Transition>` stub hid #17.
- Headless Chromium checks for the native `<dialog>` paths (already in the overlays plan's verification list).

## Integration notes for the orchestrator

- **Natural home:** the overlays implementation split, step 1 ("Dialog core") and step 2 ("Orchestrator and `useDialog`") in `BOOTSTRAP_V6_OVERLAYS.md`. The machine is a foundations-level change, though: Collapse, Alert, Toast, Popover/Tooltip and Tabs are already on the native `useShowHide` and would move to it too. Options: (a) a foundations follow-up before Dialog core, (b) inside Dialog core with the other native adopters migrated in the same pass, (c) machine first behind the existing native `useShowHide` API so adopters don't change, then Dialog builds on it. (c) looks like the least churn, but it's the orchestrator's call.
- **#164 / foundations:** the "still open" items above are in code already under review. Decide whether to fix them there or let the machine replace them.
- **Upstream `main` → v6:** upstream 1.2.3's `awaitDismissal` and #173 (if merged) touch `orchestratorShared` and the legacy composable. If the machine replaces both, don't port them; keep their tests as catalog rows.
- **Menus (G2):** #19 (disabled dropdown) belongs to the Menu redesign.
- **Maintainer questions to route:** (1) `dispose` while shown: settle `false`, or emit `hide`/`hidden` with trigger `'dispose'`? (2) Does `show` during `hiding` reverse the transition or restart it? (3) Should `v-model` changes emit cancelable events (today: yes, with a write-back on prevent)? (4) Where does `signal` live once Q4 splits events from results? (5) Is `controller.state` public? All answered; see [Decisions](#decisions).
- Not decided here: file layout, names, whether the machine is a class or a composable. Batch boundaries are in [Orchestration](#orchestration).

## Orchestration

### Placement

The machine is its own stacked PR, **S1 "Show/hide machine"**, on `bootstrap-v6-foundations`. It lands after #164 settles and before G1 step 1 (Dialog core). This is option (c) above.

- `createShowHideMachine` is internal, and `useShowHide` keeps its options and return values. The read-only `state` ref is the one addition (D7). BCollapse (on foundations) and BAlert and BToast (on #167) don't change, apart from tests that pin the event order.
- #164 is not patched. Its native `useShowHide` keeps the bugs listed under [Verification](#verification-on-bootstrap-v6-foundations) until S1 replaces the code; S1 adds them as table rows (D2).
- If #167 merges first, S1 rebases onto it and runs BAlert and BToast specs as adopters too. Otherwise #167 rebases onto S1 and has nothing to change.

### Sequence

| Step | PR / batch                             | Show/hide work                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ---- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1   | Show/hide machine (new, after #164)    | Machine + transition table + generated tests; `useShowHide` delegates to it; operation objects with `AbortController`; emit discipline; `sync` requests for `v-model` / `visible` / `show`; `dispose`; `disabled` guard; `event.signal`; read-only `state`; `noCloseOnBackdrop` / `noCloseOnEsc` removed from `UseShowHideProps` (no native adopter sets them)                                                                    |
| —    | #167 feedback, BPopover/BTooltip batch | Adopt the native `useShowHide` as already planned; nothing machine-specific. BPopover/BTooltip forward all `hide` arguments (#18)                                                                                                                                                                                                                                                                                                 |
| G1.1 | Dialog core (`BDialog`)                | Native `<dialog>` `close` becomes `sync(false, {trigger, alreadyClosed: true})`; Escape / backdrop are checked in `useDialogBase` before `hide()`; the `transition` callback calls `showModal()` / `show()`                                                                                                                                                                                                                       |
| G1.2 | Orchestrator and `useDialog`           | The controller reads the machine through the show/hide registry instead of the store's `modelValue`; per-cycle results (`DialogResult`); dismissal before mount; `destroy()` → `dispose`; `controller.show({signal})`; `controller.state`; the controller holds a direct handle to its item's machine (no id lookup, #23). Covers #12–#17 and #20–#25. Upstream `awaitDismissal` and #173 / #3374 are not ported; their tests are |
| G1.3 | Drawer (`BDrawer`)                     | Same base as Dialog; nothing extra                                                                                                                                                                                                                                                                                                                                                                                                |
| G2   | Menu                                   | Adopts the native path with the `disabled` guard (#19)                                                                                                                                                                                                                                                                                                                                                                            |
| G1.4 | Cleanup                                | Delete `useLegacyShowHide` once BDropdown/Menu, BModal and BOffcanvas are gone                                                                                                                                                                                                                                                                                                                                                    |

### S1 scope and checks

- Files: `src/composables/useShowHide.ts` (delegates), a new internal `src/composables/showHideMachine.ts` (name open), `useShowHide.spec.ts` rewritten around the generated table, `BvTriggerableEvent` (`signal`), `ShowHideProps` / docs data for the removed `noCloseOn*` props and the new `state`, `architecture/ARIA_VISIBILITY.md` (event order guarantees).
- The table covers catalog rows #1–#11 and #26 by construction. #18 and #19 get component tests in their batches, and #12–#17 and #20–#25 get orchestrator tests in G1.2.
- Required checks from `BOOTSTRAP_V6_MIGRATION.md`, plus the BCollapse / BAccordion specs and (after #167) the BAlert / BToast specs unchanged except for event-order assertions.

## Decisions

Answered by the maintainer on 2026-11-09.

| #   | Question                                     | Decision                                                                                                                                                                                                                                    |
| --- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Placement                                    | **Own stacked PR (S1) before Dialog core,** behind the existing `useShowHide` API (option c)                                                                                                                                                |
| D2  | The verified bugs in #164                    | **Don't patch #164.** S1 replaces the code and adds the cases as tests                                                                                                                                                                      |
| D3  | `dispose` while shown or mid-transition (Q1) | **Settle silently.** No `hide` / `hidden` events; pending operation promises resolve `false`; an open cycle (`controller.show()`, `useDialog`) resolves with trigger `'dispose'`                                                            |
| D4  | `show` during `hiding` (Q2)                  | **Reverse.** Flip the state class back so the CSS transition runs back from where it is; the hide is superseded (resolves `false`)                                                                                                          |
| D5  | `v-model` changes (Q3)                       | **Keep today's behavior.** `v-model` and the `visible` / `show` props are `sync` requests that emit the cancelable events; a prevented change writes `modelValue` back. A native `<dialog>` `close` that already happened is not cancelable |
| D6  | Where `signal` lives (Q4)                    | **On the cancelable request events** (`event.signal` on `show` / `hide` / `ok`; `BvTriggerableEvent` stays the event type). `DialogResult` has no signal. `controller.show({signal})` is separate                                           |
| D7  | Public state (Q5)                            | **Public and read-only:** `state` (`'hidden' \| 'showing' \| 'shown' \| 'hiding'`) returned by `useShowHide` and on the orchestrator controller, next to `visible`                                                                          |
| D8  | `disabled` (#19)                             | **Guard in the machine.** While disabled, `show()` resolves `'show-prevented'` without events; turning `disabled` on while open hides with trigger `'disabled'`. Menu (G2) uses it                                                          |
