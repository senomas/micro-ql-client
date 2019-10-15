export const state = () => ({
  secretKey: null,
  seq: 0,
  token: null,
  refresh: null,
  iat: null,
  exp: null,
  name: '',
  privileges: []
});

export const mutations = {
  set(state, value) {
    state.secretKey = value.secretKey;
    state.seq = value.seq || 0;
    state.token = value.token;
    state.refresh = value.refresh;
    state.iat = value.iat;
    state.exp = value.exp;
    state.name = value.name || '';
    state.privileges = value.privileges || [];
  },
  clear(state) {
    state.secretKey = null;
    state.seq = 0;
    state.token = null;
    state.refresh = null;
    state.iat = null;
    state.exp = null;
    state.name = '';
    state.privileges = [];
  }
};
