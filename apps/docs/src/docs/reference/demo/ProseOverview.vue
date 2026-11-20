<template>
  <!-- #region template -->
  <article class="prose">
    <h2>Release notes</h2>
    <p>
      Content inside <code>.prose</code> gets readable typography and spacing without classes on
      each element, which suits Markdown or CMS output.
    </p>
    <ul>
      <li>Headings, lists and paragraphs are spaced evenly</li>
      <li>Links without classes are styled</li>
    </ul>
    <blockquote>
      <p>Blockquotes and tables without classes are styled too.</p>
    </blockquote>
    <div class="not-prose">
      <BCard title="Not prose">
        <BCardText> <code>.not-prose</code> opts this card out of the prose styles. </BCardText>
      </BCard>
    </div>
  </article>
  <!-- #endregion template -->
</template>
