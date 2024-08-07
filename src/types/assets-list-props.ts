import {KalturaAttachmentAsset, KalturaCaptionAsset, KalturaFlavorAsset} from '../providers';
import {DownloadPluginManager} from '../download-plugin-manager';

export interface AssetsListProps {
  files: (KalturaFlavorAsset | KalturaCaptionAsset | KalturaAttachmentAsset)[];
  downloadPluginManager: DownloadPluginManager;
  title?: string;
  ariaLabel?: string;
}
