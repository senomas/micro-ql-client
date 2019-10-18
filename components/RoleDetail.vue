<template>
  <div v-if="detail">
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-container>
        <v-text-field v-model="detail.id" :disabled="progress" label="id" readonly></v-text-field>
        <v-text-field v-model="detail.code" :disabled="progress" label="code" required></v-text-field>
        <v-text-field v-model="detail.name" :disabled="progress" label="name" required></v-text-field>
        <v-text-field
          v-model="detail.description"
          :disabled="progress"
          label="description"
          required
        ></v-text-field>
        <v-row>
          <v-spacer />
          <h-btt
            :disabled="!valid || progress"
            :progress="progress && progressType === 'reset'"
            @click="reset"
          >Reset</h-btt>
          <h-btt
            :disabled="!valid || progress"
            :progress="progress && progressType === 'save'"
            @click="save"
          >Save</h-btt>
          <v-btn :disabled="progress" @click="back">Back</v-btn>
        </v-row>
      </v-container>
    </v-form>
  </div>
</template>

<script>
import gql from 'graphql-tag';
import { mapMutations } from 'vuex';
import * as cloneDeep from 'clone-deep';
import { handleGraphqlError } from '../lib';

export default {
  name: 'RoleDetail',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  apollo: {
    roleDetail: {
      manual: true,
      query: gql`
        query getRole($id: ID!) {
          me {
            time
            name
            privileges
            token {
              seq
              token
            }
          }
          role(id: $id) {
            id
            code
            name
            description
            privileges
          }
        }
      `,
      variables() {
        return {
          id: this.id
        };
      },
      result(res) {
        console.log('ROLE-DETAIL-RESULT', { id: this.id, res });
        if (res.error) {
          if (!handleGraphqlError(this, res.error)) {
            this.setPopupError({
              code: 'UnknownError'
            });
          }
        } else if (res.data) {
          if (res.data.me) {
            this.setMe(res.data.me);
          }
          if (res.data.role) {
            this.detail = cloneDeep(res.data.role);
          } else {
            this.setPopupError({
              code: 'EntityNotFound',
              action: () => {
                this.$router.replace('/role');
                this.$emit('refreshList');
              }
            });
          }
        }
      }
    }
  },
  head() {
    if (this.detail) {
      return {
        title: `Role - ${this.detail.name}`
      };
    }
  },
  data() {
    return {
      valid: true,
      progress: false,
      progressType: null,
      detail: null
    };
  },
  methods: {
    ...mapMutations(['setMe', 'setPopupError']),
    async reset() {
      try {
        this.progress = true;
        this.progressType = 'reset';
        await this.$apollo.queries.roleDetail.refetch();
      } catch (err) {
        if (!handleGraphqlError(this, err)) {
          console.log('resetError', { err });
        }
      } finally {
        this.progress = true;
      }
    },
    async save() {
      try {
        this.progress = true;
        this.progressType = 'save';
        this.$apollo.queries.roleDetail.skip = true;
        console.log('SAVE', { data: this.detail });
        await this.$apollo.provider.clients.defaultClient.resetStore();
        const res = await this.$apollo.mutate({
          mutation: gql`
            mutation updateRoles(
              $id: ID!
              $code: String
              $name: String
              $description: String
            ) {
              updateRoles(
                filter: { id: $id }
                data: { code: $code, name: $name, description: $description }
              ) {
                matched
                modified
              }
            }
          `,
          variables: this.detail
        });
        console.log('RES', { res });
        if (res.data.updateRoles.matched === 1) {
          this.$router.go(-1);
          this.$emit('refreshList');
        } else {
          this.setPopupError({
            code: 'UpdateObjectNotFound'
          });
        }
      } catch (err) {
        if (!handleGraphqlError(this, err)) {
          console.log('saveError', { err });
        }
      } finally {
        this.progress = true;
        this.$apollo.queries.roleDetail.skip = false;
      }
    },
    back() {
      this.$router.go(-1);
    }
  }
};
</script>
