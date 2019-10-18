<template>
  <div v-if="me && me.name">
    <div v-if="$apollo.loading">Loading data...</div>
    <div v-if="detail">
      <RoleDetail :id="detail" @refreshList="refreshList" />
    </div>
    <div v-show="!detail">
      <h-table type="roles" :me="me" :column-defs="columnDefs" :query="query" ref="gridList" />
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag';
import { mapState } from 'vuex';

import RoleDetail from '@/components/RoleDetail';

export default {
  name: 'PageRole',
  components: { RoleDetail },
  head() {
    if (!this.detail) {
      return {
        title: 'Roles'
      };
    }
  },
  data: () => ({
    accountInfo: null,
    query: gql`
      query roles($skip: Int, $limit: Int) {
        me {
          time
          name
          privileges
          token {
            seq
            token
          }
        }
        roles(skip: $skip, limit: $limit) {
          total
          items {
            id
            code
            name
            description
          }
        }
      }
    `,
    columnDefs: [
      {
        field: 'id'
      },
      {
        field: 'code'
      },
      {
        field: 'name'
      },
      {
        field: 'description'
      }
    ]
  }),
  computed: {
    ...mapState(['me'])
  },
  mounted() {
    console.log('MOUNTED', this.$route.query.id);
    this.detail = this.$route.query.id;
  },
  watch: {
    $route(value) {
      this.detail = value.query.id;
    }
  },
  asyncData({ query }) {
    return {
      detail: query.id
    };
  },
  methods: {
    refreshList() {
      console.log('REFRESH-LIST');
      this.$refs.gridList.refreshList();
    }
  }
};
</script>
