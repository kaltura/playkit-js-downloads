import {KalturaAttachmentAsset, KalturaAttachmentAssetArgs} from './kaltura-attachment-asset';
const {BaseServiceResult} = KalturaPlayer.providers.ResponseTypes;

export class KalturaAttachmentAssetListResponse extends BaseServiceResult {
  totalCount?: number;
  data: Array<KalturaAttachmentAsset> = [];

  constructor(responseObj: any) {
    super(responseObj);
    if (!this.hasError) {
      this.totalCount = responseObj.totalCount;
      if (this.totalCount! > 0) {
        this.data = [];
        responseObj.objects.map((attachmentAsset: KalturaAttachmentAssetArgs) => this.data.push(new KalturaAttachmentAsset(attachmentAsset)));
      }
    }
  }
}
