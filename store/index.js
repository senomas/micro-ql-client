export const state = () => {
  const token = sessionStorage.getItem('token');
  return {
    me: null,
    popupError: null,
    token
  };
};

export const mutations = {
  setMe(state, me) {
    state.me = me;
    if (me) {
      if (me.token && me.token.token) {
        sessionStorage.setItem('token', me.token.token);
        state.token = me.token.token;
      }
    } else {
      sessionStorage.removeItem('token');
      state.token = null;
    }
  },
  setPopupError(state, popupError) {
    state.popupError = popupError;
  },
  setToken(state, token) {
    state.token = token;
    if (token) {
      sessionStorage.setItem('token', token);
    } else {
      sessionStorage.removeItem('token');
      state.me = null;
    }
  }
};
