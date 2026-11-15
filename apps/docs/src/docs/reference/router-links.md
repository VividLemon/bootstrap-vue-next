---
title: Router Links
description: >
  Several BootstrapVue components support rendering RouterLink components compatible with Vue Router and Nuxt.js.
  For more information, see the official Vue Router docs and official Nuxt.js docs.
---

## How `BLink` picks a router

`BLink` works with vue-router, Nuxt and VitePress, and without any router, with no configuration. For a link with a `to` prop it looks for a globally registered router component and renders through it:

| Environment | What renders the link | Notes |
| --- | --- | --- |
| vue-router | `RouterLink` in `custom` mode | Registered by `app.use(router)`. `href`, navigation and the active state come from the router |
| Nuxt | `NuxtLink` in `custom` mode | The BootstrapVueNext Nuxt module registers `NuxtLink` globally and sets `router-component-name`. `BLink` triggers NuxtLink's prefetching itself (see [below](#nuxt-js-specific-router-link-props)) |
| VitePress | a plain `<a href>` | VitePress has no link component: its router handles clicks on any same-origin `<a href>`. Wrap paths in `withBase()` yourself when the site has a `base` |
| No router | a plain `<a href>` | `to` is used as the `href`. A named route cannot be resolved and renders `#` |

In every case the result is a single `<a>` element, so classes, attributes, listeners and directives on `BLink` (and on components that render it, such as `BButton` or `BNavItem`) land on that anchor.

A plain `<a href>` is also what you get, with any router, for links that are not routes: `href` without `to`, a `to` that is a full URL (`https://…`, `mailto:…`), and disabled links. In Nuxt this also applies to links with a `target` and to hash-only links such as `to="#section"`.

To render links through another component, register it globally and pass its name (or the component itself) as `router-component-name`. It receives `to` and `replace`, plus the link's attributes, and renders itself.

## Common router link props

In the following sections, we are using the `BLink` component to render router links. `BLink` is the building block of most of BootstrapVue's actionable components. You could use any other component that supports link generation such as `BLink`, `BButton`, `BAvatar`, `BBreadcrumbItem`, `BListGroupItem`, `BNavItem`, `BDropdownItem`, and `BPaginationNav`. Note that not all props are available on all components. Refer to the respective component documentation for details.

### `to`

- type: `string | Location`
- required to generate a `RouterLink`

Denotes the target route of the link. When clicked, the value of the `to` prop will be passed to `router.push()` internally, so the value can be either a string or a location descriptor object.

<HighlightCard>

```vue
<!-- Literal string -->
<BLink to="home">Home</BLink>

<!-- Renders to -->
<a href="home">Home</a>

<!-- JavaScript expression using `v-bind` -->
<BLink v-bind:to="'home'">Home</BLink>

<!-- Omitting `v-bind` is fine, just as binding any other prop -->
<BLink :to="'home'">Home</BLink>

<!-- Same as above -->
<BLink :to="{path: 'home'}">Home</BLink>

<!-- Named route -->
<BLink :to="{name: 'user', params: {userId: 123}}">User</BLink>

<!-- With query, resulting in `/register?plan=private` -->
<BLink :to="{path: 'register', query: {plan: 'private'}}">Register</BLink>

<!-- Render a non-router link by omitting `to` and specifying an `href` -->
<BLink href="/home">Home</BLink>
```

</HighlightCard>

### `replace`

- type: `boolean`
- default: `false`

Setting replace prop will call `router.replace()` instead of `router.push()` when clicked, so the navigation will not leave a history record.

<HighlightCard>

```vue
<BLink :to="{path: '/abc'}" replace />
```

</HighlightCard>

### `active-class`

- type: `string`
- default: `router-link-active` (`nuxt-link-active` when using Nuxt.js)

Configure the active CSS class applied when the link is active. Note the default value can also be configured globally via the `linkActiveClass` [router constructor option](https://router.vuejs.org/api/#linkactiveclass).

With components that support router links (have a `to` prop), you will want to set this to the class `active` (or a space separated string that includes 'active') to apply Bootstrap's `active` styling on the component when the current route matches the `to` prop.

### `exact`

- type: `boolean`
- default: `false`

The default active class matching behavior is inclusive match. For example, `<BLink to="/a">` will get this class applied as long as the current path starts with `/a/` or is `/a`.

One consequence of this is that `<BLink to="/">` will be active for every route! To force the link into "exact match mode", use the `exact` prop:

<HighlightCard>

```vue
<!-- This link will only be active at `/` -->
<BLink to="/" exact />
```

</HighlightCard>

### `exact-active-class`

- type: `string`
- default: `router-link-exact-active` (`nuxt-link-exact-active` when using Nuxt.js)
- availability: Vue Router 2.5.0+

Configure the active CSS class applied when the link is active with exact match. Note the default value can also be configured globally via the `linkExactActiveClass` [router constructor option](https://router.vuejs.org/api/#linkexactactiveclass).

With components that support router links (have a `to` prop), you will want to set this to the class `active` (or a space separated string that includes `active`) to apply Bootstrap's active styling on the component when the current route matches the `to` prop.

### `exact-path`

- type: `boolean`
- default: `false`
- availability: Vue Router 3.5.0+

Allows matching only using the `path` section of the url, effectively ignoring the `query` and the `hash` sections.

<HighlightCard>

```vue
<!-- this link will also be active at `/search?page=2` or `/search#filters` -->
<RouterLink to="/search" exact-path> </RouterLink>
```

</HighlightCard>

### `exact-path-active-class`

- type: `string`
- default: `router-link-exact-path-active`
- availability: Vue Router 2.5.0+

Configure the active CSS class applied when the link is active with exact path match. Note the default value can also be configured globally via the `linkExactActiveClass` [router constructor option](https://router.vuejs.org/api/#linkexactactiveclass).

With components that support router links (have a `to` prop), you will want to set this to the class `active` (or a space separated string that includes `active`) to apply Bootstrap's active styling on the component when the current route matches the `to` prop.

## Nuxt.js-specific router link props

When BootstrapVueNext detects that your app is running under [Nuxt.js](https://nuxt.com), it will render a [`NuxtLink`](https://nuxt.com/docs/api/components/nuxt-link#nuxtlink) sub component instead of a `RouterLink`. `NuxtLink` supports all of the above router link props, plus the following additional Nuxt.js specific props.

`BLink` renders `NuxtLink` in `custom` mode, where `NuxtLink` leaves prefetching to the component that uses it. `BLink` does that for you: it prefetches when the link scrolls into view or, with `prefetch-on`, when it is hovered or focused, honouring `prefetch`, `no-prefetch`, `prefetch-on` and your Nuxt defaults, and it adds `prefetched-class` once the link was prefetched.

### `prefetch`

- type: `boolean`
- default: `null`
- availability: Nuxt.js 3+

To improve the responsiveness of your Nuxt.js applications, when the link will be displayed within the viewport, Nuxt.js will automatically prefetch the code splitted page. Setting `prefetch` to `true` or `false` will overwrite the default value of `router.prefetchLinks` configured in the `nuxt.config.js` configuration file.

### `no-prefetch`

- type: `boolean`
- default: `true`
- availability: Nuxt.js 3+

To improve the responsiveness of your Nuxt.js applications, when the link will be displayed within the viewport, Nuxt.js will automatically prefetch the code splitted page. Setting `no-prefetch` will disabled this feature for the specific link.

<HighlightCard>

```vue
router: { prefetchLinks: false }
```

</HighlightCard>
