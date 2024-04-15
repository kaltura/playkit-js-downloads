import {Button, ButtonType, ButtonSize, A11yWrapper, OnClickEvent} from '@playkit-js/common';
import {DownloadPluginManager} from '../../download-plugin-manager';
import {createRef} from 'preact';
import {useState, useEffect} from 'preact/hooks';
import {DownloadMetadata} from '../../types';
import {ui} from '@playkit-js/kaltura-player-js';
// @ts-ignore
const {bindActions} = ui.utils;
// @ts-ignore
const overlayActions = ui.reducers.overlay.actions;

const {withEventManager} = KalturaPlayer.ui.Event;
const {PLAYER_SIZE} = KalturaPlayer.ui.components;
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
  sizeClass?: string;
  downloadsLabel?: string;
  closeLabel?: string;
  setFocus: () => void;
  downloadMetadata: DownloadMetadata;
  updateOverlay: (isOpen: boolean) => void;
}

const mapStateToProps = (state: any) => {
  const {
    shell: {playerSize}
  } = state;
  let sizeClass = '';

  switch (playerSize) {
    case PLAYER_SIZE.EXTRA_LARGE:
    case PLAYER_SIZE.LARGE: {
      sizeClass = styles.large;
      break;
    }
    case PLAYER_SIZE.MEDIUM: {
      sizeClass = styles.medium;
      break;
    }
    case PLAYER_SIZE.SMALL:
    case PLAYER_SIZE.EXTRA_SMALL: {
      sizeClass = styles.small;
      break;
    }
    default: {
      break;
    }
  }

  return {
    sizeClass
  };
};

const DownloadOverlay = withText({
  downloadsLabel: 'download.downloads',
  closeLabel: 'overlay.close'
})(
  connect(
    mapStateToProps,
    bindActions(overlayActions)
  )(
    withEventManager(
      ({
        downloadPluginManager,
        eventManager,
        sizeClass,
        downloadsLabel,
        closeLabel,
        setFocus,
        downloadMetadata,
        updateOverlay
      }: DownloadOverlayProps) => {
        const [isVisible, setIsVisible] = useState(false);
        const closeButtonRef = createRef<HTMLButtonElement>();
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
          <div data-testid="download-overlay" className={styles.downloadOverlay}>
            <div className={`${styles.header} ${sizeClass}`}>{downloadsLabel}</div>
            <div className={`${styles.fileInfoList} ${sizeClass}`}>
              {shouldRenderSources || shouldRenderCaptions ? (
                <div className={styles.sourcesCaptionsContainer}>
                  {shouldRenderSources && renderSources()}
                  {shouldRenderCaptions && renderCaptions()}
                </div>
              ) : undefined}
              {shouldRenderAttachments && renderAttachments()}
            </div>
            <div>
              <div data-testid="download-overlay-close-button" className={`${styles.closeButtonContainer} ${sizeClass}`}>
                <A11yWrapper
                  onClick={(e: OnClickEvent, byKeyboard: boolean) => {
                    updateOverlay(false);
                    downloadPluginManager.showOverlay = false;
                    if (byKeyboard) {
                      setFocus();
                    }
                  }}>
                  <Button
                    type={ButtonType.borderless}
                    size={ButtonSize.medium}
                    tooltip={{label: closeLabel!}}
                    ariaLabel={closeLabel}
                    icon={'close'}
                    setRef={ref => {
                      closeButtonRef.current = ref;
                    }}
                  />
                </A11yWrapper>
              </div>
            </div>
          </div>
        ) : (
          <div />
        );
      }
    )
  )
);

export {DownloadOverlay};
