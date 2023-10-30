import {KalturaAttachmentAsset, KalturaCaptionAsset, KalturaFlavorAsset} from '../providers';

type DownloadMetadataType = {
  fileName: string;
  captions: Array<KalturaCaptionAsset>;
  flavors: Array<KalturaFlavorAsset>;
  attachments: Array<KalturaAttachmentAsset>;
  imageDownloadUrl: string;
};

type DownloadMetadata = DownloadMetadataType | null;

export {DownloadMetadata};
