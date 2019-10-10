<template>
  <div>{{ info }}</div>
</template>

<script>
import gql from 'graphql-tag'

export default {
  apollo: {
    info: gql`query accountInfo {
      host
      time
    }`
  }
}
</script>
