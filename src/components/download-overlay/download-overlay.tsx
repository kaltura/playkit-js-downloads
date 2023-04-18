import {Button, ButtonType, ButtonSize} from '@playkit-js/common';
import {DownloadPluginManager} from 'download-plugin-manager';

import {useState, useEffect} from 'preact/hooks';
import {EventType, DownloadMetadata} from 'types';

const {withEventManager} = KalturaPlayer.ui.Event;
const {Icon, IconType, PLAYER_SIZE} = KalturaPlayer.ui.components;
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
        closeLabel
      }: DownloadOverlayProps) => {
        const [isVisible, setIsVisible] = useState(false);
        const [fileName, setFileName] = useState('');

        useEffect(() => {
          eventManager?.listen(downloadPluginManager, EventType.SHOW_OVERLAY, () => {
            setIsVisible(true);

            downloadPluginManager.getDownloadMetadata().then((downloadMetadata: DownloadMetadata) => {
              if (downloadMetadata) {
                setFileName(downloadMetadata.fileName);
              }
            });
          });

          eventManager?.listen(downloadPluginManager, EventType.HIDE_OVERLAY, () => {
            setIsVisible(false);
          });
        }, []);

        return isVisible ? (
          <div className={styles.downloadOverlay}>
            <div className={styles.header}>{downloadsLabel}</div>
            <div className={styles.fileInfoList}>
              <div className={`${styles.fileInfo} ${sizeClass}`}>
                <div className={`${styles.iconContainer} ${styles.playIcon}`}>
                  <Icon id="download-file-play" type={IconType.Play} viewBox={`0 0 32 32`} />
                </div>
                <div className={styles.fileInfoTextContainer}>
                  <div className={styles.fileInfoText}>{fileName}</div>
                </div>
                <div className={`${styles.iconContainer} ${styles.downloadIcon}`}>
                  <div>
                    <Button
                      type={ButtonType.borderless}
                      size={ButtonSize.medium}
                      disabled={false}
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
                      }}
                      tooltip={{label: downloadLabel!}}
                      icon={'download'}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className={styles.closeButtonContainer}>
                <Button
                  type={ButtonType.borderless}
                  size={ButtonSize.medium}
                  disabled={false}
                  onClick={() => {
                    downloadPluginManager.showOverlay = false;
                  }}
                  tooltip={{label: closeLabel!}}
                  icon={'close'}
                />
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
