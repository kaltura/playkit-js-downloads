import {A11yWrapper} from '@playkit-js/common';
import * as styles from './download-item.scss';
import {Icon as CommonIcon} from '@playkit-js/common/dist/icon';
import {DownloadPluginManager} from '../../download-plugin-manager';
import {ComponentChildren} from 'preact';
import {useEffect, useRef} from 'preact/hooks';
const {withEventManager} = KalturaPlayer.ui.Event;
const {withText} = KalturaPlayer.ui.preacti18n;

interface DownloadItemProps {
  downloadPluginManager: DownloadPluginManager;
  key: string;
  downloadLabel?: string;
  downloadStartedLabel?: string;
  downloadFailedLabel?: string;
  downloadButtonLabel?: string;
  fileName: string;
  description?: string;
  downloadUrl: string;
  iconFileType: ComponentChildren;
  isDefault?: boolean;
}

export const DownloadItem = withText({
  downloadLabel: 'download.download',
  downloadStartedLabel: 'download.download_has_started',
  downloadFailedLabel: 'download.download_has_failed',
  downloadButtonLabel: 'download.download_button_label'
})(
  withEventManager(
    ({
      key,
      downloadLabel,
      downloadStartedLabel,
      downloadFailedLabel,
      downloadPluginManager,
      downloadButtonLabel,
      fileName,
      description,
      downloadUrl,
      iconFileType,
      isDefault
    }: DownloadItemProps) => {
      const downloadItemRef = useRef<HTMLDivElement>(null);

      useEffect(() => {
        if (isDefault) {
          downloadItemRef.current?.focus();
        }
      }, []);

      return (
        <A11yWrapper
          onClick={() => {
            if (downloadUrl) {
              downloadPluginManager.downloadFile(downloadUrl, fileName);
              downloadPluginManager.notifyDownloadStarted(downloadLabel!, downloadStartedLabel!);
            } else {
              downloadPluginManager.notifyDownloadFailed(downloadLabel!, downloadFailedLabel!);
            }
          }}>
          <div
            key={key}
            data-testid="download-item-download-button"
            className={styles.fileInfo}
            tabIndex={0}
            aria-label={downloadButtonLabel}
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
