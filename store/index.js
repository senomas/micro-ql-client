export const state = () => {
  const token = process.server ? null : sessionStorage.getItem('token');
  return {
    me: null,
    popupError: null,
    tokenIssuedAt: 0,
    token
  };
};

export const mutations = {
  setMe(state, me) {
    state.me = me;
    if (me) {
      if (me.token && me.token.token) {
        const token = me.token.token;
        const iat = JSON.parse(atob(token.split('.')[1])).iat;
        if (iat > state.tokenIssuedAt) {
          console.log('SET-ME-TOKEN', { token, iat, oldIat: state.tokenIssuedAt });
          sessionStorage.setItem('token', me.token.token);
          state.tokenIssuedAt = iat;
          state.token = me.token.token;
        } else {
          console.log('IGNORE-ME-TOKEN', { token, iat, oldIat: state.tokenIssuedAt });
        }
      }
    } else {
      if (!process.server) {
        console.log('REMOVE-ME-TOKEN');
        sessionStorage.removeItem('token');
      }
      state.token = null;
    }
  },
  setPopupError(state, popupError) {
    state.popupError = popupError;
  },
  setToken(state, token) {
    console.log('SET-TOKEN', { token });
    state.token = token;
    if (token) {
      state.tokenIssuedAt = JSON.parse(atob(token.split('.')[1]));
      sessionStorage.setItem('token', token);
    } else {
      console.log('REMOVE-TOKEN');
      sessionStorage.removeItem('token');
      state.me = null;
    }
  }
};
