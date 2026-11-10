<template>
  <BPlaceholderTable
    columns="3"
    rows="2"
    show-footer
    :footer-color="{ theme: 'info' }"
    header-size="lg"
    footer-size="xs"
    footer-columns="1"
    header-columns="4"
  >
    <template #default>
      <tbody>
        <tr>
          <td>
            <BPlaceholder size="lg" :color="{ bg: 'secondary' }" />
            <BPlaceholder size="sm" :color="{ bg: 'secondary' }" />
            <BPlaceholder size="xs" :color="{ bg: 'secondary' }" />
          </td>
          <td>
            <BPlaceholder :color="{ bg: 'warning' }" />
            <BPlaceholder animation="wave" :color="{ bg: 'warning' }" />
          </td>
          <td>
            <BPlaceholder animation="glow" :color="{ bg: 'danger' }" />
          </td>
        </tr>
      </tbody>
    </template>
  </BPlaceholderTable>
</template>
