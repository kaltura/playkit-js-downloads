import {h} from 'preact';
import {DownloadPluginManager} from '../../download-plugin-manager';
import {useState, useEffect} from 'preact/hooks';
import {DownloadMetadata} from '../../types';
import {ui} from '@playkit-js/kaltura-player-js';

import {OverlayPortal} from '@playkit-js/common/dist/hoc/overlay-portal';
import {FocusTrap} from '@playkit-js/common/dist/components/focus-trap';
const {Overlay} = ui.Components;

const {bindActions} = ui.utils;

const overlayActions = ui.reducers.overlay.actions;

const {withEventManager} = ui.Event;
const {connect} = ui.redux;

const {withText} = ui.preacti18n;

import * as styles from './download-overlay.scss';
import {SourcesList} from '../sources-list';
import {CaptionsList} from '../captions-list';
import {AttachmentsList} from '../attachments-list';
import {DownloadEvent} from '../../event';
import {AssetsListProps} from '../../types/assets-list-props';

interface DownloadOverlayProps extends AssetsListProps {
  downloadPluginManager: DownloadPluginManager;
  eventManager: any;
  downloadsLabel?: string;
  mainStream?: string;
  additionalStreams?: string;
  captionsLabel?: string;
  closeLabel?: string;
  setFocus: () => void;
  downloadMetadatas: DownloadMetadata[];
  updateOverlay: (isOpen: boolean) => void;
}

const DownloadOverlay = withText({
  downloadsLabel: 'download.downloads',
  closeLabel: 'overlay.close',
  mainStream: 'download.main_stream',
  additionalStreams: 'download.additional_streams',
  captionsLabel: 'download.captions'
})(
  connect(
    null,
    bindActions(overlayActions)
  )(
    withEventManager(
      ({
        downloadPluginManager,
        eventManager,
        downloadsLabel,
        mainStream,
        additionalStreams,
        captionsLabel,
        downloadMetadatas,
        updateOverlay
      }: DownloadOverlayProps) => {
        const [isVisible, setIsVisible] = useState(false);
        const mainSourceMetadata = downloadMetadatas[0];
        const downloadConfig = downloadPluginManager.config;
        useEffect(() => {
          eventManager?.listen(downloadPluginManager, DownloadEvent.SHOW_OVERLAY, () => {
            setIsVisible(true);
          });

          eventManager?.listen(downloadPluginManager, DownloadEvent.HIDE_OVERLAY, () => {
            setIsVisible(false);
          });
        }, []);

        const getTitle = (index: number) => {
          if (index < 1) {
            return mainStream;
          }
          if (index > 1) {
            return '';
          }
          return additionalStreams;
        };

        const renderSources = () => {
          return downloadMetadatas
            .filter(downloadMetadata => getShouldRenderSources(downloadMetadata))
            .map((downloadMetadata, index) => {
              return (
                <SourcesList
                  key={index}
                  files={downloadMetadata!.flavors}
                  imageUrl={downloadMetadata!.imageDownloadUrl}
                  downloadPluginManager={downloadPluginManager}
                  downloadConfig={downloadConfig}
                  fileName={downloadMetadata!.fileName}
                  displayFlavors={downloadConfig.displayFlavors}
                  title={getTitle(index)}
                />
              );
            });
        };

        const renderCaptions = () => {
          return (
            <CaptionsList
              files={mainSourceMetadata!.captions}
              downloadPluginManager={downloadPluginManager}
              fileName={mainSourceMetadata!.fileName}
              shouldFocus={!shouldRenderSources}
              title={captionsLabel}
            />
          );
        };

        const renderAttachments = () => {
          return (
            <AttachmentsList
              files={mainSourceMetadata!.attachments}
              downloadPluginManager={downloadPluginManager}
              shouldFocus={!shouldRenderSources && !shouldRenderCaptions}
            />
          );
        };

        const getShouldRenderSources = (sourceMetadata: DownloadMetadata) => {
          return sourceMetadata!.flavors.length || sourceMetadata!.imageDownloadUrl;
        };

        const shouldRenderSources = downloadConfig.displaySources && getShouldRenderSources(mainSourceMetadata);
        const shouldRenderCaptions = downloadConfig.displayCaptions && mainSourceMetadata!.captions.length;
        const shouldRenderAttachments = downloadConfig.displayAttachments && mainSourceMetadata!.attachments.length;

        return isVisible ? (
          <OverlayPortal>
            <FocusTrap active>
              <Overlay
                open
                onClose={() => {
                  updateOverlay(false);
                  downloadPluginManager.setShowOverlay(false);
                }}
                type="playkit-download">
                <div data-testid="download-overlay" className={styles.downloadOverlay}>
                  <h2 className={styles.header}>{downloadsLabel}</h2>
                  <div className={styles.fileInfoList}>
                    {shouldRenderSources || shouldRenderCaptions ? (
                      <div className={styles.sourcesCaptionsContainer}>
                        {shouldRenderSources && renderSources()}
                        {shouldRenderCaptions && renderCaptions()}
                      </div>
                    ) : null}
                    {shouldRenderAttachments && renderAttachments()}
                  </div>
                </div>
              </Overlay>
            </FocusTrap>
          </OverlayPortal>
        ) : null;
      }
    )
  )
);

export {DownloadOverlay};
