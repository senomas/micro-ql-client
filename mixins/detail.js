import { mapMutations } from 'vuex';

function mixin() {
  const data = {
    name: "Detail",
    props: {
      type: {
        type: String,
        required: false,
        default: 'edit'
      },
      data: {
        type: Object,
        required: true
      },
      progress: {
        type: Boolean,
        required: true
      },
      progressType: {
        type: String,
        required: false,
        default: null
      }
    },
    data() {
      return {
        valid: true
      };
    },
    methods: {
      ...mapMutations(['setMe', 'setPopupError']),
      reset() {
        this.$emit('reset');
      },
      save() {
        // try {
        //   this.progress = true;
        //   this.progressType = 'save';
        //   console.log('SAVE', { data: this.detail });
        //   await this.$apollo.provider.clients.defaultClient.resetStore();
        //   const res = await this.$apollo.mutate({
        //     mutation: mutationUpdate,
        //     variables: this.detail
        //   });
        //   console.log('RES', { res });
        //   if (res.data[`update${modulePluralsCapitalize}`].matched === 1) {
        //     this.$router.go(-1);
        //     this.$emit('update', { update: [this.detail] });
        //   } else {
        //     this.setPopupError({
        //       code: 'UpdateObjectNotFound'
        //     });
        //   }
        // } catch (err) {
        //   if (!handleGraphqlError(this, err)) {
        //     console.log('saveError', { err });
        //   }
        // } finally {
        //   this.progress = true;
        // }
        console.log("FIXME SAVE");
      },
      create() {
        console.log("FIXME CREATE");
      },
      back() {
        this.$router.go(-1);
      }
    }
  };
  return data;
}

export default mixin;
