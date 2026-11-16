<template>
  <div>
    <nav>
      <BLink
        id="home"
        to="/"
      >
        Home
      </BLink>
      <BLink
        id="about"
        to="/about"
        class="mine"
        data-x="1"
        prefetched-class="was-prefetched"
      >
        About
      </BLink>
      <BLink
        id="user"
        :to="{ name: 'users-id', params: { id: 7 } }"
        prefetched-class="was-prefetched"
      >
        User 7
      </BLink>
      <BLink
        id="interaction"
        to="/users/8"
        :prefetch-on="{ interaction: true, visibility: false }"
        prefetched-class="was-prefetched"
      >
        Prefetched on hover
      </BLink>
      <BLink
        id="no-prefetch"
        to="/users/9"
        :prefetch="false"
        prefetched-class="was-prefetched"
      >
        Never prefetched
      </BLink>
      <BLink
        id="external"
        to="https://example.com/"
      >
        External
      </BLink>
      <BLink
        id="blank"
        to="/about"
        target="_blank"
      >
        New tab
      </BLink>
      <BLink
        id="hash"
        to="#section"
      >
        Hash
      </BLink>
      <BLink
        id="href-only"
        href="/about"
      >
        href only
      </BLink>
      <BLink
        id="disabled"
        to="/about"
        disabled
      >
        Disabled
      </BLink>
      <BButton
        id="button"
        to="/about"
      >
        Button
      </BButton>
      <ul>
        <BNavItem
          to="/about"
          :link-attrs="{ id: 'nav-item' }"
        >
          Nav item
        </BNavItem>
      </ul>
    </nav>
    <NuxtPage />
    <div id="section">
      Section
    </div>
  </div>
</template>
