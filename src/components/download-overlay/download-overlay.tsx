import {DownloadPluginManager} from '../../download-plugin-manager';
import {useState, useEffect} from 'preact/hooks';
import {DownloadMetadata} from '../../types';
import {ui} from '@playkit-js/kaltura-player-js';

import {OverlayPortal} from '@playkit-js/common/dist/hoc/overlay-portal';
const {Overlay} = ui.Components;

const {bindActions} = ui.utils;

const overlayActions = ui.reducers.overlay.actions;

const {withEventManager} = KalturaPlayer.ui.Event;
const {connect} = KalturaPlayer.ui.redux;

const {withText} = KalturaPlayer.ui.preacti18n;

import * as styles from './download-overlay.scss';
import {SourcesList} from '../sources-list';
import {CaptionsList} from '../captions-list';
import {AttachmentsList} from '../attachments-list';
import {DownloadEvent} from '../../event';

interface DownloadOverlayProps {
  downloadPluginManager: DownloadPluginManager;
  eventManager: any;
  downloadsLabel?: string;
  closeLabel?: string;
  setFocus: () => void;
  downloadMetadata: DownloadMetadata;
  updateOverlay: (isOpen: boolean) => void;
}

const DownloadOverlay = withText({
  downloadsLabel: 'download.downloads',
  closeLabel: 'overlay.close'
})(
  connect(
    null,
    bindActions(overlayActions)
  )(
    withEventManager(({downloadPluginManager, eventManager, downloadsLabel, downloadMetadata, updateOverlay}: DownloadOverlayProps) => {
      const [isVisible, setIsVisible] = useState(false);
      const downloadConfig = downloadPluginManager.downloadPlugin.config;
      useEffect(() => {
        eventManager?.listen(downloadPluginManager, DownloadEvent.SHOW_OVERLAY, () => {
          setIsVisible(true);
        });

        eventManager?.listen(downloadPluginManager, DownloadEvent.HIDE_OVERLAY, () => {
          setIsVisible(false);
        });
      }, []);

      const renderSources = () => {
        return (
          <SourcesList
            flavors={downloadMetadata!.flavors}
            imageUrl={downloadMetadata!.imageDownloadUrl}
            downloadPluginManager={downloadPluginManager}
            downloadConfig={downloadConfig}
            fileName={downloadMetadata!.fileName}
            displayFlavors={downloadConfig.displayFlavors}
          />
        );
      };

      const renderCaptions = () => {
        return (
          <CaptionsList captions={downloadMetadata!.captions} downloadPluginManager={downloadPluginManager} fileName={downloadMetadata!.fileName} />
        );
      };

      const renderAttachments = () => {
        return <AttachmentsList attachments={downloadMetadata!.attachments} downloadPluginManager={downloadPluginManager} />;
      };

      const shouldRenderSources = downloadConfig.displaySources && (downloadMetadata!.flavors.length || downloadMetadata!.imageDownloadUrl);
      const shouldRenderCaptions = downloadConfig.displayCaptions && downloadMetadata!.captions.length;
      const shouldRenderAttachments = downloadConfig.displayAttachments && downloadMetadata!.attachments.length;

      return isVisible ? (
        <OverlayPortal>
          {/*@ts-expect-error - TS2786: Overlay cannot be used as a JSX component. */}
          <Overlay
            open
            onClose={() => {
              updateOverlay(false);
              downloadPluginManager.setShowOverlay(false);
            }}
            type="playkit-download">
            <div data-testid="download-overlay" className={styles.downloadOverlay}>
              <div className={styles.header}>{downloadsLabel}</div>
              <div className={styles.fileInfoList}>
                {shouldRenderSources || shouldRenderCaptions ? (
                  <div className={styles.sourcesCaptionsContainer}>
                    {shouldRenderSources && renderSources()}
                    {shouldRenderCaptions && renderCaptions()}
                  </div>
                ) : undefined}
                {shouldRenderAttachments && renderAttachments()}
              </div>
            </div>
          </Overlay>
        </OverlayPortal>
      ) : null;
    })
  )
);

export {DownloadOverlay};
