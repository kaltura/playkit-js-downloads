// TODO add ts linting
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import {PLAYER_CONFIG} from '../e2e/mock-data';

let player;
let requestCount = 0;

const loadPlayer = playerConfig => {
  return new Promise(resolve => {
    cy.window().then(w => {
      if (playerConfig) {
        player = w.KalturaPlayer.setup({...PLAYER_CONFIG, ...playerConfig});
      } else {
        player = w.KalturaPlayer.setup(PLAYER_CONFIG);
      }

      resolve();
    });
  });
};

const setMedia = (
  sessionConfig = {ks: '5678'},
  sourcesConfig = {
    id: '1234',
    hls: [
      {
        mimetype: 'application/x-mpegURL',
        url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
      }
    ]
  }
) => {
  player.setMedia({
    session: sessionConfig,
    sources: sourcesConfig
  });
};

const loadPlayerAndSetMedia = (playerConfig, sessionConfig, sourcesConfig) => {
  return new Promise(resolve => {
    loadPlayer(playerConfig).then(() => {
      setMedia(sessionConfig, sourcesConfig);
      resolve();
    });
  });
};

describe('download plugin', () => {
  beforeEach(() => {
    cy.intercept('**/playManifest/**', req => {
      ++requestCount;
      req.reply({fixture: 'video.mp4'});
    }).as('playManifest');

    cy.visit('index.html');
  });

  afterEach(() => {
    player = null;
    requestCount = 0;
  });

  describe('download capabilities', () => {
    it('should be hidden for Tizen Smart TV', async () => {
      await loadPlayer();
      cy.stub(navigator, 'userAgent').returns('Tizen');
      setMedia();

      cy.wait(100);
      expect(requestCount).to.equal(0);
    });
    it('should be hidden for WebOS Smart TV', async () => {
      await loadPlayer();
      cy.stub(navigator, 'userAgent').returns('Web0S');
      setMedia();

      cy.wait(100);
      expect(requestCount).to.equal(0);
    });
    it('should be hidden for live', async () => {
      await loadPlayer();
      cy.stub(player, 'isLive').returns(true);
      setMedia();

      cy.wait(100);
      expect(requestCount).to.equal(0);
    });
    it('should be hidden for DRM', async () => {
      await loadPlayer();
      cy.stub(player, 'getVideoElement').returns({mediaKeys: {}});
      setMedia();

      cy.wait(100);
      expect(requestCount).to.equal(0);
    });
    it('should be hidden for image entry', async () => {
      await loadPlayer();
      cy.stub(player, 'isImage').returns(true);
      setMedia();

      cy.wait(100);
      expect(requestCount).to.equal(0);
    });
  });

  describe('download xhr call', () => {
    describe('cdn url', () => {
      it('should not make download xhr call if cdn url is not set', async () => {
        await loadPlayerAndSetMedia({provider: {env: {cdnUrl: ''}}});
        expect(requestCount).to.equal(0);
      });
      it('should use cdn url from config if cdn url is set', async () => {
        await loadPlayerAndSetMedia();
        cy.wait(100);
        return cy.wait('@playManifest').then(({request}) => {
          expect(request.url.indexOf(PLAYER_CONFIG.provider.env.cdnUrl)).to.not.equal(-1);
        });
      });
    });
    describe('partner id', () => {
      it('should not make download call if partner id is not set', async () => {
        await loadPlayerAndSetMedia({provider: {env: {partnerId: ''}}});
        expect(requestCount).to.equal(0);
      });
      it('should contain partner id from config if partner id is set', async () => {
        await loadPlayerAndSetMedia();
        cy.wait(100);
        return cy.wait('@playManifest').then(({request}) => {
          expect(request.url.indexOf(`p/${PLAYER_CONFIG.provider.partnerId}`)).to.not.equal(-1);
        });
      });
    });
    describe('entry id', () => {
      it('should contain current entry id', async () => {
        await loadPlayerAndSetMedia();
        cy.wait(100);
        return cy.wait('@playManifest').then(({request}) => {
          expect(request.url.indexOf('entryId/1234')).to.not.equal(-1);
        });
      });
    });
    describe('ks', () => {
      it('should not make download call if ks is not set', async () => {
        await loadPlayerAndSetMedia();
        expect(requestCount).to.equal(0);
      });
      it('should contain ks from config if ks is set', async () => {
        await loadPlayerAndSetMedia();

        cy.wait(100);
        return cy.wait('@playManifest').then(({request}) => {
          expect(request.url.indexOf(`ks/5678`)).to.not.equal(-1);
        });
      });
    });
    describe('flavor id', () => {
      it('should use flavor id if it is set', async () => {
        await loadPlayerAndSetMedia({plugins: {uiManagers: {}, download: {flavorId: '1234'}}});

        cy.wait(100);
        return cy.wait('@playManifest').then(({request}) => {
          expect(request.url.indexOf('flavorId')).to.not.equal(-1);
        });
      });
      it('should not contain a flavor id if flavor id is not set', async () => {
        await loadPlayerAndSetMedia();

        cy.wait(100);
        return cy.wait('@playManifest').then(({request}) => {
          expect(request.url.indexOf('flavorId')).to.equal(-1);
        });
      });
    });
    describe('flavor param id', () => {
      it('should use flavor param id if it is set', async () => {
        await loadPlayerAndSetMedia({plugins: {uiManagers: {}, download: {flavorParamId: '1234'}}});

        cy.wait(100);
        return cy.wait('@playManifest').then(a => {
          expect(a.request.url.indexOf('flavorParamId/1234')).not.to.equal(-1);
        });
      });
      it('should use default flavor param id if it is not set', async () => {
        await loadPlayerAndSetMedia();

        cy.wait(100);
        return cy.wait('@playManifest').then(a => {
          expect(a.request.url.indexOf('flavorParamId/0')).not.to.equal(-1);
        });
      });
    });
  });
});
//describe("download overlay icon");
//describe("on media loaded", () => {
//it('should be visible by default', () => {});
//it('should be hidden if content type is not video', () => {});
//});
// describe('on media changed', () => {
//it('should be visible by default', () => {});
//it('should be hidden if content type is not video', () => {});
//   it('should be enabled even if it was disabled for previous entry');
//   it('should be disabled even if it was enabled for previous entry');
// });

// describe('download icon', () => {
//   describe('on click', () => {
//     describe('on download success', () => {
//       it('should hide the downloads overlay');

//       describe('pre-download hook', () => {
//         it('should call pre-download hook if it is set');
//         it('should handle error in pre-download hook');
//       });

//       describe('downloaded file', () => {
//         it('should download a specific flavor');
//       });

//       it('should show a success notification');
//     });

//     describe('on download failure', () => {
//       it('should hide the downloads overlay');
//       it('should show an error notification');
//     });
//   });
// });
