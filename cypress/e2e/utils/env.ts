export const loadPlayer = (pluginConf = {}, playbackConf: Record<string, any> = {}) => {
  cy.visit('index.html');
  return cy.window().then(win => {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const kalturaPlayer = win.KalturaPlayer.setup({
        targetId: 'player-placeholder',
        provider: {
          partnerId: -1,
          // ks: '5678',
          env: {
            cdnUrl: 'http://mock-cdn',
            serviceUrl: 'http://mock-api'
          }
        },
        sources: {
          metadata: {
            name: 'download'
          }
        },
        plugins: {
          kava: {
            disable: true
          },
          download: pluginConf,
          uiManagers: {}
        },
        ui: {
          translations: {
            en: {
              download: {
                downloads: 'Downloads',
                download: 'Download',
                select_quality_label: 'More flavors',
                hide_label: 'Less flavors',
                source_label: 'Source',
                more_captions_label: 'More captions',
                less_captions_label: 'Less captions',
                attachments_label: 'Attachments'
              }
            }
          }
        },
        playback: {muted: true, autoplay: true, ...playbackConf}
      });
      return Promise.resolve(kalturaPlayer);
    } catch (e: any) {
      return Promise.reject(e.message);
    }
  });
};

const defaultSource: any = {
  id: '1234',
  progressive: [
    {
      mimetype: 'video/mp4',
      url: './media/video.mp4'
    }
  ]
};

export const setMedia = (player: any, sessionConfig = {ks: '5678'}, sourcesConfig = defaultSource) => {
  player?.setMedia({
    session: sessionConfig,
    sources: sourcesConfig
  });
};

export const loadPlayerAndSetMedia = (
  pluginConf = {},
  playbackConf: Record<string, any> = {},
  sessionConfig?: any,
  sourcesConfig?: any
): Promise<any> => {
  return new Promise(resolve => {
    loadPlayer(pluginConf, playbackConf).then(kalturaPlayer => {
      setMedia(kalturaPlayer, sessionConfig, sourcesConfig);
      if (playbackConf.autoplay) {
        kalturaPlayer.ready().then(() => resolve(kalturaPlayer));
      }
      resolve(kalturaPlayer);
    });
  });
};

const checkRequest = (reqBody: any, service: string, action: string) => {
  return reqBody?.service === service && reqBody?.action === action;
};

export const mockKalturaBe = (
  entryFixture = 'base-entry.json',
  assetsFixture = 'kaltura-assets.json',
  downloadUrlsFixture = 'download-urls.json'
) => {
  cy.intercept('http://mock-api/service/multirequest', req => {
    if (checkRequest(req.body[1], 'baseEntry', 'list')) {
      return req.reply({fixture: entryFixture});
    }
    if (checkRequest(req.body[1], 'caption_captionAsset', 'list')) {
      return req.reply({fixture: assetsFixture});
    }
    if (checkRequest(req.body[1], 'caption_captionAsset', 'getUrl')) {
      return req.reply({fixture: downloadUrlsFixture});
    }
    if (checkRequest(req.body[1], 'flavorasset', 'getUrl')) {
      return req.reply({fixture: 'single-flavor-download-url.json'});
    }
  });
};
