const appStore = {
  namespaced: true,

  state: {
    // TODO h5测试数据
    // deviceUuid: '123456789',
    deviceUuid: '',
    receiveRecode: []
  },

  mutations: {
    _setDeviceUuid(state, payload) {
      state.deviceUuid = payload
    },

    _setReceiveRecode(state, payload) {
      state.receiveRecode = payload
    }
  },

  actions: {},
};

export default appStore;
