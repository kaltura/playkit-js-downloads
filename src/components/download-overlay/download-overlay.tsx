import {Button, ButtonType, ButtonSize, A11yWrapper, OnClickEvent} from '@playkit-js/common';
import {Icon as CommonIcon} from '@playkit-js/common/dist/icon';
import {DownloadPluginManager} from 'download-plugin-manager';
import {createRef} from 'preact';
import {useState, useEffect, useRef} from 'preact/hooks';
import {EventType, DownloadMetadata} from 'types';

const {withEventManager} = KalturaPlayer.ui.Event;
const {Icon, IconType, Tooltip, PLAYER_SIZE} = KalturaPlayer.ui.components;
const {connect} = KalturaPlayer.ui.redux;

const {withText} = KalturaPlayer.ui.preacti18n;

import * as styles from './download-overlay.scss';

interface DownloadOverlayProps {
  downloadPluginManager: DownloadPluginManager;
  eventManager: any;
  sizeClass?: string;
  downloadLabel?: string;
  downloadsLabel?: string;
  downloadStartedLabel?: string;
  downloadFailedLabel?: string;
  closeLabel?: string;
  setFocus: () => void;
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
  downloadLabel: 'download.download',
  downloadsLabel: 'download.downloads',
  downloadStartedLabel: 'download.download_has_started',
  downloadFailedLabel: 'download.download_has_failed',
  closeLabel: 'overlay.close'
})(
  connect(mapStateToProps)(
    withEventManager(
      ({
        downloadPluginManager,
        eventManager,
        sizeClass,
        downloadLabel,
        downloadsLabel,
        downloadStartedLabel,
        downloadFailedLabel,
        closeLabel,
        setFocus
      }: DownloadOverlayProps) => {
        const [isVisible, setIsVisible] = useState(false);
        const [fileName, setFileName] = useState('');
        const downloadRef = createRef<HTMLDivElement>();
        const closeButtonRef = createRef<HTMLButtonElement>();
        const byKeyboard = useRef(false);
        useEffect(() => {
          eventManager?.listen(downloadPluginManager, EventType.SHOW_OVERLAY, ({payload}: {payload: {byKeyboard: boolean}}) => {
            setIsVisible(true);

            downloadPluginManager.getDownloadMetadata().then((downloadMetadata: DownloadMetadata) => {
              if (downloadMetadata) {
                setFileName(downloadMetadata.fileName);
              }
            });
            byKeyboard.current = payload.byKeyboard;
          });

          eventManager?.listen(downloadPluginManager, EventType.HIDE_OVERLAY, () => {
            setIsVisible(false);
          });
        }, []);

        useEffect(() => {
          if (isVisible && byKeyboard.current) {
            downloadRef.current?.focus();
          }
        }, [isVisible]);

        return isVisible ? (
          <div className={styles.downloadOverlay}>
            <div className={styles.header}>{downloadsLabel}</div>
            <div className={styles.fileInfoList}>
              <Tooltip label={downloadLabel!}>
                <A11yWrapper
                  onClick={() => {
                    downloadPluginManager.getDownloadMetadata(true).then((downloadMetadata: DownloadMetadata) => {
                      if (downloadMetadata) {
                        downloadPluginManager.downloadFile();
                        downloadPluginManager.notifyDownloadStarted(downloadLabel!, downloadStartedLabel!);
                      } else {
                        downloadPluginManager.notifyDownloadFailed(downloadLabel!, downloadFailedLabel!);
                      }
                      downloadPluginManager.showOverlay = false;
                    });
                  }}>
                  <div
                    className={`${styles.fileInfo} ${sizeClass}`}
                    tabIndex={0}
                    ref={downloadRef}
                    onBlur={() => {
                      if (isVisible) {
                        closeButtonRef.current?.focus();
                      }
                    }}>
                    <div className={`${styles.iconContainer} ${styles.playIcon}`}>
                      <Icon id="download-file-play" type={IconType.Play} viewBox={`0 0 32 32`} />
                    </div>
                    <div className={styles.fileInfoTextContainer}>
                      <div className={styles.fileInfoText}>{fileName}</div>
                    </div>
                    <div className={`${styles.iconContainer} ${styles.downloadIcon}`}>
                      <CommonIcon name={'download'} />
                    </div>
                  </div>
                </A11yWrapper>
              </Tooltip>
            </div>
            <div>
              <div className={styles.closeButtonContainer}>
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
                    icon={'close'}
                    setRef={ref => {
                      closeButtonRef.current = ref;
                    }}
                    onBlur={() => {
                      if (isVisible) {
                        downloadRef.current?.focus();
                      }
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
