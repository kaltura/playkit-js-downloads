import {h, ComponentChildren} from 'preact';
import {A11yWrapper} from '@playkit-js/common';
import * as styles from './download-item.scss';
import {Icon as CommonIcon} from '@playkit-js/common/dist/icon';
import {DownloadPluginManager} from '../../download-plugin-manager';
import {useEffect, useRef} from 'preact/hooks';
import {core, KalturaPlayer, ui} from '@playkit-js/kaltura-player-js';
import {DownloadEvent} from '../../event';

const {withText} = ui.preacti18n;
const {FakeEvent} = core;
const {withPlayer} = ui.Components;

interface DownloadItemProps {
  downloadPluginManager: DownloadPluginManager;
  key: string;
  downloadLabel?: string;
  downloadStartedLabel?: string;
  downloadFailedLabel?: string;
  ariaLabel: string;
  fileName: string;
  assetType: string;
  description?: string;
  downloadUrl: string;
  iconFileType: ComponentChildren;
  isDefault?: boolean;
  player: KalturaPlayer;
  shouldFocus?: boolean;
}

export const DownloadItem = withText({
  downloadLabel: 'download.download',
  downloadStartedLabel: 'download.download_has_started',
  downloadFailedLabel: 'download.download_has_failed'
})(
  withPlayer(
    ({
      key,
      downloadLabel,
      downloadStartedLabel,
      downloadFailedLabel,
      downloadPluginManager,
      ariaLabel,
      fileName,
      assetType,
      description,
      downloadUrl,
      iconFileType,
      isDefault,
      player,
      shouldFocus
    }: DownloadItemProps) => {
      const downloadItemRef = useRef<HTMLDivElement>(null);

      useEffect(() => {
        if (isDefault || shouldFocus) {
          downloadItemRef.current?.focus();
        }
      }, []);

      return (
        <A11yWrapper
          onClick={() => {
            if (downloadUrl) {
              downloadPluginManager.downloadFile(downloadUrl, fileName);
              downloadPluginManager.notifyDownloadStarted(downloadLabel!, downloadStartedLabel!);

              const fileType = fileName.match(/\.(.*?)$/)![1];
              player.dispatchEvent(new FakeEvent(DownloadEvent.DOWNLOAD_ITEM_CLICKED, {fileType, description, assetType}));
            } else {
              downloadPluginManager.notifyDownloadFailed(downloadLabel!, downloadFailedLabel!);
            }
          }}>
          <div
            key={key}
            data-testid="download-item-download-button"
            className={styles.fileInfo}
            tabIndex={0}
            aria-label={`${ariaLabel} ${fileName} ${description || ''}`}
            ref={downloadItemRef}>
            <div className={`${styles.iconContainer} ${styles.fileIcon}`}>{iconFileType}</div>
            <div className={styles.fileInfoTextContainer}>
              <div className={styles.fileInfoText}>{fileName}</div>
              {description && <div className={styles.fileDescriptionText}>{description}</div>}
            </div>
            <div className={`${styles.iconContainer} ${styles.downloadIcon}`}>
              <CommonIcon name={'download'} />
            </div>
          </div>
        </A11yWrapper>
      );
    }
  )
);
