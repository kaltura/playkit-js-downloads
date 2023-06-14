const PLAYER_CONFIG = {
  targetId: 'player-placeholder',
  provider: {
    partnerId: -1,
    env: {
      cdnUrl: 'http://mock-cdn',
      serviceUrl: 'http://mock-api'
    }
  },
  plugins: {
    kava: {
      disable: true
    },
    uiManagers: {},
    download: {}
  },
  playback: {
    autoplay: true,
    muted: true
  }
};

export {PLAYER_CONFIG};
