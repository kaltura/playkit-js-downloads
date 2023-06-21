// TODO add ts linting
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import {PLAYER_CONFIG} from '../e2e/mock-data';

let player;
let requestCount = 0;

// TODO use local ui conf

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
    progressive: [
      {
        mimetype: 'video/mp4',
        url: './media/video.mp4'
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
      player.ready().then(resolve);
    });
  });
};

describe('download plugin', () => {
  beforeEach(() => {
    cy.visit('index.html');
  });

  afterEach(() => {
    player = null;
    requestCount = 0;
  });

  describe('download capabilities', () => {
    beforeEach(() => {
      cy.intercept('**/playManifest/**', req => {
        ++requestCount;
        req.reply({
          fixture: 'video.mp4'
        });
      }).as('playManifest');
    });

    it('should be blocked for Tizen Smart TV', async () => {
      await loadPlayer();
      cy.stub(navigator, 'userAgent').returns('Tizen');
      setMedia();

      expect(requestCount).to.equal(0);
    });
    it('should be blocked for WebOS Smart TV', async () => {
      await loadPlayer();
      cy.stub(navigator, 'userAgent').returns('Web0S');
      setMedia();

      cy.wait(100);
      expect(requestCount).to.equal(0);
    });
    it('should be blocked for live', async () => {
      await loadPlayer();
      cy.stub(player, 'isLive').returns(true);
      setMedia();

      cy.wait(100);
      expect(requestCount).to.equal(0);
    });
    it('should be blocked for DRM', async () => {
      await loadPlayer();
      cy.stub(player, 'getVideoElement').returns({mediaKeys: {}});
      setMedia();

      cy.wait(100);
      expect(requestCount).to.equal(0);
    });
    it('should be blocked for image entry', async () => {
      await loadPlayer();
      cy.stub(player, 'isImage').returns(true);
      setMedia();

      cy.wait(100);
      expect(requestCount).to.equal(0);
    });
  });

  describe('download xhr call', () => {
    let requestUrl = '';

    beforeEach(() => {
      cy.intercept('**/playManifest/**', req => {
        ++requestCount;
        requestUrl = req.url;
        req.reply({
          fixture: 'video.mp4'
        });
      }).as('playManifest');
    });

    afterEach(() => {
      requestUrl = '';
    });

    describe('cdn url', () => {
      it('should use cdn url from config if cdn url is set', async () => {
        await loadPlayerAndSetMedia();
        expect(requestUrl.indexOf(PLAYER_CONFIG.provider.env.cdnUrl)).to.not.equal(-1);
      });
      it('should not make download xhr call if cdn url is not set', async () => {
        await loadPlayerAndSetMedia({provider: {env: {cdnUrl: ''}}});
        expect(requestCount).to.equal(0);
      });
    });
    describe('partner id', () => {
      it('should contain partner id from config if partner id is set', async () => {
        await loadPlayerAndSetMedia();
        expect(requestUrl.indexOf(`p/${PLAYER_CONFIG.provider.partnerId}`)).to.not.equal(-1);
      });
      it('should not make download call if partner id is not set', async () => {
        await loadPlayerAndSetMedia({provider: {env: {partnerId: ''}}});
        expect(requestCount).to.equal(0);
      });
    });
    describe('entry id', () => {
      it('should use current entry id', async () => {
        await loadPlayerAndSetMedia();
        expect(requestUrl.indexOf('entryId/1234')).to.not.equal(-1);
      });
    });
    describe('ks', () => {
      it('should contain ks from config if ks is set', async () => {
        await loadPlayerAndSetMedia();
        expect(requestUrl.indexOf(`ks/5678`)).to.not.equal(-1);
      });
      it('should not make download call if ks is not set', async () => {
        await loadPlayerAndSetMedia(null, {ks: ''});
        expect(requestCount).to.equal(0);
      });
    });
    describe('flavor id', () => {
      it('should use flavor id if it is set', async () => {
        await loadPlayerAndSetMedia({plugins: {uiManagers: {}, download: {flavorId: '1234'}}});
        expect(requestUrl.indexOf('flavorId')).to.not.equal(-1);
      });
      it('should not contain a flavor id if flavor id is not set', async () => {
        await loadPlayerAndSetMedia();
        expect(requestUrl.indexOf('flavorId')).to.equal(-1);
      });
    });
    describe('flavor param id', () => {
      it('should use flavor param id if it is set', async () => {
        await loadPlayerAndSetMedia({plugins: {uiManagers: {}, download: {flavorParamId: '1234'}}});
        expect(requestUrl.indexOf('flavorParamId/1234')).not.to.equal(-1);
      });
      it('should use default flavor param id if it is not set', async () => {
        await loadPlayerAndSetMedia();
        expect(requestUrl.indexOf('flavorParamId/0')).not.to.equal(-1);
      });
    });
  });

  describe('download overlay button', () => {
    it('should be visible by default', async () => {
      cy.intercept('**/playManifest/**', req => {
        req.reply({
          fixture: 'video.mp4'
        });
      });

      await loadPlayerAndSetMedia();
      player.pause();
      cy.get('[data-testid="download-overlay-button"]').should('be.visible');
    });
    it('should be hidden if content type is not video', async () => {
      cy.intercept('**/playManifest/**', req => {
        req.reply({
          headers: {
            'content-type': 'image/gif'
          },
          fixture: 'video.mp4'
        });
      });

      await loadPlayerAndSetMedia();
      player.pause();
      cy.get('[data-testid="download-overlay-button"]').should('not.exist');
    });
    it('should show overlay on click', {defaultCommandTimeout: 6000}, async () => {
      cy.intercept('**/playManifest/**', req => {
        req.reply({
          fixture: 'video.mp4'
        });
      });

      await loadPlayerAndSetMedia();
      player.pause();
      await new Promise(resolve => {
        setTimeout(() => {
          resolve();
        }, 5000);
      });

      cy.get('.playkit-upper-bar-icon').click({force: true});
      cy.get('[data-testid="download-overlay"]').should('be.visible');
    });
  });

  describe('download overlay', () => {
    describe('close button', () => {
      it('should hide overlay on click', () => {
        expect(0).to.equal(1);
      });
    });
    describe('download button', () => {
      it('should hide overlay on click', () => {
        expect(0).to.equal(1);
      });
      it('should start download on click', () => {
        expect(0).to.equal(1);
      });
    });
    describe('on download success', () => {
      it('should call pre-download hook', () => {
        expect(0).to.equal(1);
      });
      it('should show a success notification', () => {
        expect(0).to.equal(1);
      });
    });
    describe('on download failure', () => {
      it('should not call pre-download hook', () => {
        expect(0).to.equal(1);
      });
      it('should show a failure notification', () => {
        expect(0).to.equal(1);
      });
    });
  });
});
