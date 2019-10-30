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
      fields: {
        type: Array,
        required: true
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
      },
      inputContainerClass: {
        type: String,
        required: false,
        default: "detail-input-container"
      }
    },
    data() {
      return {
        valid: true
      };
    },
    computed: {
      inputComponents() {
        return this.fields.map((v) => {
          let component;
          if (v.detail && v.detail.input) {
            component = v.detail.input;
          } else {
            component = 'DetailInputText';
          }
          return {
            ...v,
            component
          };
        });
      }
    },
    methods: {
      ...mapMutations(['setMe', 'setPopupError']),
      action(event) {
        this.$emit(event, this.data);
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
