import { mapMutations } from 'vuex';

function mixin() {
  const data = {
    name: 'Detail',
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
        this.$emit('save', this.data);
      },
      create() {
        this.$emit('create', this.data);
      },
      deleteEntry() {
        this.$emit('delete', this.data);
      },
      back() {
        this.$router.replace({
          path: this.$route.path
        });
      }
    }
  };
  return data;
}

export default mixin;
