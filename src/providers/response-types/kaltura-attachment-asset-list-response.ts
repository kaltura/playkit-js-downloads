import {providers} from '@playkit-js/kaltura-player-js';
const {BaseServiceResult} = providers.ResponseTypes;
import {KalturaAttachmentAsset, KalturaAttachmentAssetArgs} from './kaltura-attachment-asset';

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
