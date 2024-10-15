import {h, ComponentChildren} from 'preact';
import {DownloadPluginManager} from '../../download-plugin-manager';
import {KalturaAttachmentAsset} from '../../providers';
import {DownloadItem} from '../download-item';
import * as styles from './attachments-list.scss';
import {getIconByFileExt} from '@playkit-js/common/dist/icon/icon-utils';
import {assetType} from '../../consts/asset-type';
import {AssetsListProps} from '../../types/assets-list-props';

import {ui} from '@playkit-js/kaltura-player-js';

const {withText} = ui.preacti18n;

interface AttachmentsListProps extends AssetsListProps {
  files: KalturaAttachmentAsset[];
  downloadPluginManager: DownloadPluginManager;
  shouldFocus: boolean;
  title?: string;
  ariaLabel?: string;
}

export const AttachmentsList = withText({
  title: 'download.attachments_label',
  ariaLabel: 'download.download_button_label_attachment'
})(({files, downloadPluginManager, shouldFocus, title, ariaLabel}: AttachmentsListProps) => {
  const _buildFileName = (attachment: KalturaAttachmentAsset) => {
    return attachment.title || attachment.fileName;
  };

  const _renderDownloadItem = (key: string, fileName: string, downloadUrl: string, icon: ComponentChildren, ariaLabel: string) => {
    return (
      <DownloadItem
        downloadPluginManager={downloadPluginManager}
        key={key}
        fileName={fileName}
        downloadUrl={downloadUrl}
        assetType={assetType.Attachments}
        iconFileType={icon}
        ariaLabel={ariaLabel}
        shouldFocus={shouldFocus}
      />
    );
  };

  const _renderAttachments = (attachments: Array<KalturaAttachmentAsset>) => {
    return attachments.map((attachment: KalturaAttachmentAsset) => {
      return _renderDownloadItem(attachment.id, _buildFileName(attachment), attachment.downloadUrl, getIconByFileExt(attachment.fileExt), ariaLabel!);
    });
  };

  return (
    <div className={styles.attachmentsContainer} data-testid={'download-overlay-attachments-container'}>
      <div className={styles.attachmentsLabel}>{title}</div>
      {_renderAttachments(files)}
    </div>
  );
});
