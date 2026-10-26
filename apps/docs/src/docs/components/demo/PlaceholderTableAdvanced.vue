<template>
  <BPlaceholderTable
    columns="3"
    rows="2"
    show-footer
    footer-theme="info"
    header-size="lg"
    footer-size="xs"
    footer-columns="1"
    header-columns="4"
  >
    <template #default>
      <tbody>
        <tr>
          <td>
            <BPlaceholder size="lg" bg="secondary" />
            <BPlaceholder size="sm" bg="secondary" />
            <BPlaceholder size="xs" bg="secondary" />
          </td>
          <td>
            <BPlaceholder bg="warning" />
            <BPlaceholder animation="wave" bg="warning" />
          </td>
          <td>
            <BPlaceholder animation="glow" bg="danger" />
          </td>
        </tr>
      </tbody>
    </template>
  </BPlaceholderTable>
</template>
