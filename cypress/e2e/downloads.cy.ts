import {PLAYER_CONFIG} from '../e2e/mock-data';

interface KalturaPlayer {
  setup: (config: any) => Player;
}

interface Player {
  setMedia: (arg0: {session: {ks: string}; sources: {id: string; progressive: {mimetype: string; url: string}[]}}) => void;
  isLive: () => boolean;
  getVideoElement: () => {mediaKeys: any};
  ready: () => any;
}

interface Window {
  KalturaPlayer: KalturaPlayer;
}

let player: Player | null;
let requestCount = 0;

// TODO use local ui conf

const loadPlayer = (playerConfig?: any): Promise<void> => {
  return new Promise(resolve => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    cy.visit('index.html').then((win: Window) => {
      if (playerConfig) {
        player = win.KalturaPlayer.setup({...PLAYER_CONFIG, ...playerConfig});
      } else {
        player = win.KalturaPlayer.setup(PLAYER_CONFIG);
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
  player?.setMedia({
    session: sessionConfig,
    sources: sourcesConfig
  });
};

const loadPlayerAndSetMedia = (playerConfig?: any, sessionConfig?: any, sourcesConfig?: any): Promise<void> => {
  return new Promise(resolve => {
    loadPlayer(playerConfig)
      .then(() => {
        setMedia(sessionConfig, sourcesConfig);
        return player?.ready();
      })
      .then(resolve);
  });
};

describe('download plugin', () => {
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

    it('should be blocked for live', () => {
      return loadPlayer().then(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        cy.stub(player, 'isLive').returns(true);
        setMedia();
        expect(requestCount).to.equal(0);
      });
    });
    it('should be blocked for DRM', () => {
      return loadPlayer()
        .then(() => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          cy.stub(player, 'getVideoElement').returns({mediaKeys: {}});
          setMedia();
          return player?.ready();
        })
        .then(() => {
          expect(requestCount).to.equal(0);
        });
    });
    it('should be blocked for image entry', () => {
      return loadPlayer()
        .then(() => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          cy.stub(player, 'isImage').returns(true);
          setMedia();
          return player?.ready();
        })
        .then(() => {
          expect(requestCount).to.equal(0);
        });
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
    describe('if content type is not video', () => {
      beforeEach(() => {
        cy.intercept('**/playManifest/**', {
          headers: {
            'content-type': 'image/gif'
          },
          fixture: 'video.mp4'
        });
      });

      it('should be hidden', () => {
        loadPlayerAndSetMedia().then(() => {
          cy.get('[data-testid="download-overlay-button"]').should('not.exist');
        });
      });
    });

    describe('if content type is video', () => {
      beforeEach(() => {
        cy.intercept('**/playManifest/**', {fixture: 'video.mp4'});
      });

      it('should be visible', () => {
        loadPlayerAndSetMedia().then(() => {
          cy.get('[data-testid="download-overlay-button"]').should('exist');
        });
      });

      it('should show overlay on click', () => {
        loadPlayerAndSetMedia().then(() => {
          cy.get('[data-testid="download-overlay"]').should('not.exist');
          cy.get('[data-testid="download-overlay-button"]').click({force: true});
          cy.get('[data-testid="download-overlay"]').should('exist');
        });
      });
    });

    it('should show overlay on click', () => {
      loadPlayerAndSetMedia().then(() => {
        cy.get('[data-testid="download-overlay"]').should('not.exist');
        cy.get('[data-testid="download-overlay-button"]').click({force: true});
        cy.get('[data-testid="download-overlay"]').should('exist');
      });
    });
  });

  describe('download overlay', () => {
    describe('close button', () => {
      beforeEach(() => {
        cy.intercept('**/playManifest/**', {fixture: 'video.mp4'});
      });

      it('should hide overlay on click', () => {
        loadPlayerAndSetMedia().then(() => {
          cy.get('[data-testid="download-overlay"]').should('not.exist');
          cy.get('[data-testid="download-overlay-button"]').click({force: true});
          cy.get('[data-testid="download-overlay"]').should('exist');
          cy.get('[data-testid="download-overlay-close-button"] button').should('exist').click({force: true});
          cy.get('[data-testid="download-overlay"]').should('not.exist');
        });
      });
    });

    describe('download button', () => {
      beforeEach(() => {
        cy.intercept('**/playManifest/**', {fixture: 'video.mp4'}).as('playManifest');
      });

      it('should hide overlay on click', () => {
        loadPlayerAndSetMedia().then(() => {
          cy.get('[data-testid="download-overlay"]').should('not.exist');
          cy.get('[data-testid="download-overlay-button"]').click({force: true});
          cy.get('[data-testid="download-overlay"]').should('exist');
          cy.get('[data-testid="download-overlay-download-button"] button').should('exist').click({force: true});
          cy.get('[data-testid="download-overlay"]').should('not.exist');
        });
      });

      it('should start download on click', () => {
        // cy.wrap(
        loadPlayerAndSetMedia().then(() => {
          cy.get('[data-testid="download-overlay"]').should('not.exist');
          cy.get('[data-testid="download-overlay-button"]').click({force: true});
          cy.get('[data-testid="download-overlay"]').should('exist');
          cy.get('[data-testid="download-overlay-download-button"] button').should('exist').click({force: true});

          setTimeout(() => {
            const downloadsFolder = Cypress.config('downloadsFolder');
            const downloadPath = `${downloadsFolder}/download.mp4`;
            cy.readFile(downloadPath);
          }, 5000);
        });
      });

      it('should call pre-download hook', () => {
        let count = 0;

        const preDownloadHook = () => {
          ++count;
        };
        const pluginConfig = {
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          download: {preDownloadHook},
          uiManagers: {}
        };

        const promise = new Promise(resolve => {
          cy.wrap(loadPlayerAndSetMedia({plugins: pluginConfig})).then(() => {
            cy.get('[data-testid="download-overlay"]').should('not.exist');
            cy.get('[data-testid="download-overlay-button"]').click({force: true});
            cy.get('[data-testid="download-overlay"]').should('exist');
            cy.get('[data-testid="download-overlay-download-button"] button').should('exist').click({force: true});

            setTimeout(() => {
              resolve(count);
            }, 5000);
          });
        });

        cy.wrap(promise).should('eq', 1);
      });

      it('should handle error in pre-download hook', () => {
        const preDownloadHook = () => {
          throw Error();
        };
        const pluginConfig = {
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          download: {preDownloadHook},
          uiManagers: {}
        };

        loadPlayerAndSetMedia({plugins: pluginConfig}).then(() => {
          cy.get('[data-testid="download-overlay"]').should('not.exist');
          cy.get('[data-testid="download-overlay-button"]').click({force: true});
          cy.get('[data-testid="download-overlay"]').should('exist');
          cy.get('[data-testid="download-overlay-download-button"] button').should('exist').click({force: true});

          setTimeout(() => {
            const downloadsFolder = Cypress.config('downloadsFolder');
            const downloadPath = `${downloadsFolder}/download.mp4`;
            cy.readFile(downloadPath);
          }, 5000);
        });
      });

      it('should not call pre-download hook on download failure', () => {
        let count = 0;

        const preDownloadHook = () => {
          ++count;
        };

        const pluginConfig = {
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          download: {preDownloadHook},
          uiManagers: {}
        };

        const promise = new Promise(resolve => {
          cy.wrap(loadPlayerAndSetMedia({plugins: pluginConfig})).then(() => {
            cy.get('[data-testid="download-overlay"]').should('not.exist');
            cy.get('[data-testid="download-overlay-button"]').click({force: true});
            cy.get('[data-testid="download-overlay"]').should('exist');

            cy.intercept('**/playManifest/**', {
              headers: {
                'content-type': 'image/gif'
              },
              fixture: 'video.mp4'
            });

            cy.get('[data-testid="download-overlay-download-button"] button').should('exist').click({force: true});

            setTimeout(() => {
              resolve(count);
            }, 2000);
          });
        });

        cy.wrap(promise).should('eq', 0);
      });
    });
  });
});
