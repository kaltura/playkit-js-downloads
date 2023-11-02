import {mockKalturaBe, setMedia, loadPlayerAndSetMedia, loadPlayer} from './utils/env';

describe('download plugin', () => {
  describe('download overlay button', () => {
    it('should not exist for live media', () => {
      mockKalturaBe();
      loadPlayer().then(player => {
        cy.stub(player, 'isLive').returns(true);
        setMedia(player);
        cy.get('.playkit-pre-playback-play-button').should('exist').click({force: true});
        cy.get('[data-testid="download-overlay-button"]').should('not.exist');
      });
    });
    it('should not exist for DRM media', () => {
      mockKalturaBe();
      loadPlayer().then(player => {
        cy.stub(player, 'getVideoElement').returns({mediaKeys: {}});
        setMedia(player);
        cy.get('.playkit-pre-playback-play-button').should('exist').click({force: true});
        cy.get('[data-testid="download-overlay-button"]').should('not.exist');
      });
    });
    it('should be visible for non-DRM vod', () => {
      mockKalturaBe();
      loadPlayerAndSetMedia().then(() => {
        cy.get('.playkit-pre-playback-play-button').should('exist').click({force: true});
        cy.get('[data-testid="download-overlay-button"]').should('exist');
      });
    });
    it('should show overlay on click', () => {
      mockKalturaBe();
      loadPlayerAndSetMedia().then(() => {
        cy.get('.playkit-pre-playback-play-button').should('exist').click({force: true});
        cy.get('[data-testid="download-overlay"]').should('not.exist');
        cy.get('[data-testid="download-overlay-button"]').click({force: true});
        cy.get('[data-testid="download-overlay"]').should('exist');
      });
    });
    it('should be visible for image entry', () => {
      cy.intercept('GET', '**/fixture/ocean.jpeg/**', {fixture: 'ocean.jpeg'});
      mockKalturaBe('base-entry.json', 'kaltura-assets-image-entry.json');
      const imageSourcesConfig = {
        id: '1234',
        downloadUrl: 'https://cfvod.kaltura.com/p/3188353/sp/318835300/raw/entry_id/1_vznuyyho/version/100001',
        image: [
          {
            mimetype: 'image/jpeg',
            url: './fixture/ocean.jpeg'
          }
        ]
      };
      loadPlayer().then(player => {
        setMedia(player, {ks: '5678'}, imageSourcesConfig);
        cy.get('[data-testid="download-overlay-button"]').should('exist');
      });
    });
  });

  describe('image entry', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/fixture/ocean.jpeg/**', {fixture: 'ocean.jpeg'});
    });

    it('should make HEAD for the image download url', done => {
      mockKalturaBe('base-entry.json', 'kaltura-assets-image-entry.json');
      const imageSourcesConfig = {
        id: '1234',
        downloadUrl: 'https://cfvod.kaltura.com/p/3188353/sp/318835300/raw/entry_id/1_vznuyyho/version/100001',
        image: [
          {
            mimetype: 'image/jpeg',
            url: './fixture/ocean.jpeg'
          }
        ]
      };

      let requestCount = 0;
      cy.intercept('**/raw/**', () => {
        ++requestCount;
      });

      loadPlayer().then(player => {
        setMedia(player, {ks: '5678'}, imageSourcesConfig);
        cy.get('[data-testid="download-overlay-button"]')
          .should('exist')
          .then(() => {
            expect(requestCount).to.equal(1);
            done();
          });
      });
    });
    it('should fallback to thumbnail service request', done => {
      mockKalturaBe('base-entry.json', 'kaltura-assets-image-entry.json');
      const imageSourcesConfig = {
        id: '1234',
        image: [
          {
            mimetype: 'image/jpeg',
            url: './fixture/ocean.jpeg'
          }
        ]
      };

      let requestCount = 0;
      cy.intercept('**/ks/5678*', () => {
        ++requestCount;
      });

      loadPlayer().then(player => {
        setMedia(player, {ks: '5678'}, imageSourcesConfig);
        cy.get('[data-testid="download-overlay-button"]')
          .should('exist')
          .then(() => {
            expect(requestCount).to.equal(1);
            done();
          });
      });
    });
  });

  describe('download overlay', () => {
    describe('download overlay configuration', () => {
      it('should display all kinds of assets', () => {
        mockKalturaBe();
        loadPlayerAndSetMedia().then(() => {
          cy.get('.playkit-pre-playback-play-button').should('exist').click({force: true});
          // cy.get('.playkit-pre-playback-play-button').should('exist');
          // player!.play();
          // cy.get('.playkit-spinner').should('not.exist');
          cy.get('[data-testid="download-overlay-button"]').should('exist').click({force: true});
          cy.get('[data-testid="download-overlay"]').should('exist');
          cy.get('[data-testid="download-overlay-sources-container"]').should('exist');
          cy.get('[data-testid="download-overlay-captions-container"]').should('exist');
          cy.get('[data-testid="download-overlay-attachments-container"]').should('exist');
        });
      });
      it('should not display flavor assets', () => {
        mockKalturaBe();
        loadPlayerAndSetMedia({displayFlavors: false}).then(() => {
          cy.get('.playkit-pre-playback-play-button').should('exist').click({force: true});
          // cy.get('.playkit-spinner').should('not.exist');
          cy.get('[data-testid="download-overlay-button"]').should('exist').click({force: true});
          cy.get('[data-testid="download-overlay"]').should('exist');
          cy.get('[data-testid="download-overlay-sources-container"]').should('exist').children().should('have.length', 1);
        });
      });
      it('should not display captions assets', () => {
        mockKalturaBe();
        loadPlayerAndSetMedia({displayCaptions: false}).then(() => {
          cy.get('.playkit-pre-playback-play-button').should('exist').click({force: true});
          // cy.get('.playkit-spinner').should('not.exist');
          cy.get('[data-testid="download-overlay-button"]').should('exist').click({force: true});
          cy.get('[data-testid="download-overlay"]').should('exist');
          cy.get('[data-testid="download-overlay-captions-container"]').should('not.exist');
        });
      });
      it('should not display attachments assets', () => {
        mockKalturaBe();
        loadPlayerAndSetMedia({displayAttachments: false}).then(() => {
          cy.get('.playkit-pre-playback-play-button').should('exist').click({force: true});
          // cy.get('.playkit-spinner').should('not.exist');
          cy.get('[data-testid="download-overlay-button"]').should('exist').click({force: true});
          cy.get('[data-testid="download-overlay"]').should('exist');
          cy.get('[data-testid="download-overlay-attachments-container"]').should('not.exist');
        });
      });
    });
    describe('expandable container', () => {
      it('should expand sources container and show more flavors', () => {
        const sourcesContainerSelector = '[data-testid="download-overlay-sources-container"]';
        mockKalturaBe();
        loadPlayerAndSetMedia().then(() => {
          cy.get('.playkit-pre-playback-play-button').should('exist').click({force: true});
          // cy.get('.playkit-spinner').should('not.exist');
          cy.get('[data-testid="download-overlay-button"]').should('exist').click({force: true});
          cy.get('[data-testid="download-overlay"]').should('exist');
          cy.get(sourcesContainerSelector).should('exist').children().should('have.length', 2);
          cy.get(sourcesContainerSelector).children().last().should('have.text', 'More flavors').click({force: true});
          cy.get(sourcesContainerSelector).children().should('have.length', 7);
          cy.get(sourcesContainerSelector).children().last().should('have.text', 'Less flavors').click({force: true});
          cy.get(sourcesContainerSelector).children().should('have.length', 2);
        });
      });
      it('should expand captions container and show more captions', () => {
        const captionsContainerSelector = '[data-testid="download-overlay-captions-container"]';
        mockKalturaBe();
        loadPlayerAndSetMedia().then(() => {
          cy.get('.playkit-pre-playback-play-button').should('exist').click({force: true});
          // cy.get('.playkit-spinner').should('not.exist');
          cy.get('[data-testid="download-overlay-button"]').should('exist').click({force: true});
          cy.get('[data-testid="download-overlay"]').should('exist');
          cy.get(captionsContainerSelector).should('exist').children().should('have.length', 2);
          cy.get(captionsContainerSelector).children().last().should('have.text', 'More captions').click({force: true});
          cy.get(captionsContainerSelector).children().should('have.length', 4);
          cy.get(captionsContainerSelector).children().last().should('have.text', 'Less captions').click({force: true});
          cy.get(captionsContainerSelector).children().should('have.length', 2);
        });
      });
    });
    describe('close button', () => {
      it('should hide overlay on click', () => {
        mockKalturaBe();
        loadPlayerAndSetMedia().then(() => {
          cy.get('.playkit-pre-playback-play-button').should('exist').click({force: true});
          // cy.get('.playkit-spinner').should('not.exist');
          cy.get('[data-testid="download-overlay"]').should('not.exist');
          cy.get('[data-testid="download-overlay-button"]').click({force: true});
          cy.get('[data-testid="download-overlay"]').should('exist');
          cy.get('[data-testid="download-overlay-close-button"]')
            .should('exist')
            .within(() => {
              cy.get('button').should('exist').click({force: true});
            });
          cy.get('[data-testid="download-overlay"]').should('not.exist');
        });
      });
    });
    describe('entry with a single source flavor', () => {
      it('should display only the available source', () => {
        const sourcesContainerSelector = '[data-testid="download-overlay-sources-container"]';
        mockKalturaBe('', 'kaltura-assets-only-source-file.json');
        loadPlayerAndSetMedia().then(() => {
          cy.get('.playkit-pre-playback-play-button').should('exist').click({force: true});
          // cy.get('.playkit-spinner').should('not.exist');
          cy.get('[data-testid="download-overlay-button"]').should('exist').click({force: true});
          cy.get('[data-testid="download-overlay"]').should('exist');
          cy.get(sourcesContainerSelector).should('exist').children().should('have.length', 1);
        });
      });
    });
    describe('download item - download button', () => {
      it('should start download on click', done => {
        mockKalturaBe();
        loadPlayerAndSetMedia().then(() => {
          cy.get('.playkit-pre-playback-play-button').should('exist').click({force: true});
          cy.get('[data-testid="download-overlay"]').should('not.exist');
          cy.get('[data-testid="download-overlay-button"]').click({force: true});
          cy.get('[data-testid="download-overlay"]').should('exist');
          cy.get('[data-testid="download-overlay-sources-container"]')
            .should('exist')
            .within(() => {
              // eslint-disable-next-line cypress/unsafe-to-chain-command
              cy.get('[data-testid="download-item-download-button"]')
                .should('exist')
                .click({force: true})
                .then(() => {
                  const downloadsFolder = Cypress.config('downloadsFolder');
                  const downloadPath = `${downloadsFolder}/download.mp4`;
                  cy.readFile(downloadPath);
                  done();
                });
            });
        });
      });
      describe('pre-download hook', () => {
        it('should handle error in pre-download hook', done => {
          mockKalturaBe();

          const preDownloadHook = () => {
            throw Error();
          };

          loadPlayerAndSetMedia({preDownloadHook}).then(() => {
            cy.get('.playkit-pre-playback-play-button').should('exist').click({force: true});
            cy.get('[data-testid="download-overlay"]').should('not.exist');
            cy.get('[data-testid="download-overlay-button"]').click({force: true});
            cy.get('[data-testid="download-overlay"]').should('exist');
            cy.get('[data-testid="download-overlay-sources-container"]')
              .should('exist')
              .within(() => {
                // eslint-disable-next-line cypress/unsafe-to-chain-command
                cy.get('[data-testid="download-item-download-button"]')
                  .should('exist')
                  .click({force: true})
                  .then(() => {
                    const downloadsFolder = Cypress.config('downloadsFolder');
                    const downloadPath = `${downloadsFolder}/download.mp4`;
                    cy.readFile(downloadPath);
                    done();
                  });
              });
          });
        });
        it('should call pre-download hook', done => {
          mockKalturaBe();
          let count = 0;

          const preDownloadHook = () => {
            ++count;
          };

          loadPlayerAndSetMedia({preDownloadHook}).then(() => {
            cy.get('.playkit-pre-playback-play-button').should('exist').click({force: true});
            cy.get('[data-testid="download-overlay"]').should('not.exist');
            cy.get('[data-testid="download-overlay-button"]').click({force: true});
            cy.get('[data-testid="download-overlay"]').should('exist');
            cy.get('[data-testid="download-overlay-sources-container"]')
              .should('exist')
              .within(() => {
                // eslint-disable-next-line cypress/unsafe-to-chain-command
                cy.get('[data-testid="download-item-download-button"]')
                  .should('exist')
                  .click({force: true})
                  .then(() => {
                    expect(count).to.equal(1);
                    done();
                  });
              });
          });
        });
      });
    });
  });
});
