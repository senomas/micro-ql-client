import { mapMutations, mapState } from 'vuex';
import { logout } from '../lib';

function mixin({ breadcrumbs }) {
  const data = {
    data: () => ({
      breadcrumbs: breadcrumbs || []
    }),
    computed: {
      ...mapState(['me'])
    },
    methods: {
      ...mapMutations(['setMe', 'setPopupError']),
      async toolbarAction(value) {
        console.log('toolbarAction', { value });
        if (value === 'logout') {
          try {
            const res = await logout(this);
            console.log('LOGOUT', { res });
          } catch (err) {
            console.log('LOGOUT', { err });
          }
          this.setMe(null);
        }
      }
    }
  };
  return data;
}

export default mixin;
