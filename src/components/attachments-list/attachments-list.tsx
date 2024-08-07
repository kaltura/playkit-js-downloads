import {DownloadPluginManager} from '../../download-plugin-manager';
import {KalturaAttachmentAsset} from '../../providers';
import {DownloadItem} from '../download-item';
import * as styles from './attachments-list.scss';
import {ComponentChildren} from 'preact';
import {getIconByFileExt} from '@playkit-js/common/dist/icon/icon-utils';
import {assetType} from '../../consts/asset-type';

const {withText} = KalturaPlayer.ui.preacti18n;

interface AttachmentsListProps {
  attachments: Array<KalturaAttachmentAsset>;
  downloadPluginManager: DownloadPluginManager;
  attachmentsLabel?: string;
  downloadAttachmentsButtonLabel?: string;
}

export const AttachmentsList = withText({
  attachmentsLabel: 'download.attachments_label',
  downloadAttachmentsButtonLabel: 'download.download_button_label_attachment'
})(({attachments, downloadPluginManager, attachmentsLabel, downloadAttachmentsButtonLabel}: AttachmentsListProps) => {
  const _buildFileName = (attachment: KalturaAttachmentAsset) => {
    return attachment.title || attachment.fileName;
  };

  const _renderDownloadItem = (key: string, fileName: string, downloadUrl: string, icon: ComponentChildren, downloadAttachmentsButtonLabel: string) => {
    return (
      <DownloadItem
        downloadPluginManager={downloadPluginManager}
        key={key}
        fileName={fileName}
        downloadUrl={downloadUrl}
        assetType={assetType.Attachments}
        iconFileType={icon}
        downloadButtonLabel={downloadAttachmentsButtonLabel}
      />
    );
  };

  const _renderAttachments = (attachments: Array<KalturaAttachmentAsset>) => {
    return attachments.map((attachment: KalturaAttachmentAsset) => {
      return _renderDownloadItem(attachment.id, _buildFileName(attachment), attachment.downloadUrl, getIconByFileExt(attachment.fileExt), downloadAttachmentsButtonLabel!);
    });
  };

  return (
    <div className={styles.attachmentsContainer} data-testid={'download-overlay-attachments-container'}>
      <div className={styles.attachmentsLabel}>{attachmentsLabel}</div>
      {_renderAttachments(attachments)}
    </div>
  );
});
