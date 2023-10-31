import {Button, ButtonType, ButtonSize, A11yWrapper, OnClickEvent} from '@playkit-js/common';
import {DownloadPluginManager} from '../../download-plugin-manager';
import {createRef} from 'preact';
import {useState, useEffect} from 'preact/hooks';
import {EventType, DownloadMetadata} from '../../types';

const {withEventManager} = KalturaPlayer.ui.Event;
const {PLAYER_SIZE} = KalturaPlayer.ui.components;
const {connect} = KalturaPlayer.ui.redux;

const {withText} = KalturaPlayer.ui.preacti18n;

import * as styles from './download-overlay.scss';
import {SourcesList} from '../sources-list';
import {CaptionsList} from '../captions-list';
import {AttachmentsList} from '../attachments-list';

interface DownloadOverlayProps {
  downloadPluginManager: DownloadPluginManager;
  eventManager: any;
  sizeClass?: string;
  downloadsLabel?: string;
  closeLabel?: string;
  setFocus: () => void;
  downloadMetadata: DownloadMetadata;
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
  connect(mapStateToProps)(
    withEventManager(
      ({downloadPluginManager, eventManager, sizeClass, downloadsLabel, closeLabel, setFocus, downloadMetadata}: DownloadOverlayProps) => {
        const [isVisible, setIsVisible] = useState(false);
        const closeButtonRef = createRef<HTMLButtonElement>();
        const downloadConfig = downloadPluginManager.downloadPlugin.config;
        useEffect(() => {
          eventManager?.listen(downloadPluginManager, EventType.SHOW_OVERLAY, () => {
            setIsVisible(true);
          });

          eventManager?.listen(downloadPluginManager, EventType.HIDE_OVERLAY, () => {
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

        return isVisible ? (
          <div data-testid="download-overlay" className={styles.downloadOverlay}>
            <div className={`${styles.header} ${sizeClass}`}>{downloadsLabel}</div>
            <div className={`${styles.fileInfoList} ${sizeClass}`}>
              <div className={styles.sourcesCaptionsContainer}>
                {renderSources()}
                {downloadConfig.displayCaptions && downloadMetadata!.captions.length > 0 && renderCaptions()}
              </div>
              {downloadConfig.displayAttachments && downloadMetadata!.attachments.length > 0 && renderAttachments()}
            </div>
            <div>
              <div data-testid="download-overlay-close-button" className={styles.closeButtonContainer}>
                <A11yWrapper
                  onClick={(e: OnClickEvent, byKeyboard: boolean) => {
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
