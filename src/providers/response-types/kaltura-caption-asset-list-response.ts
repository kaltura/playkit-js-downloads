import {KalturaCaptionAsset, KalturaCaptionAssetArgs} from './kaltura-caption-asset';
const {BaseServiceResult} = KalturaPlayer.providers.ResponseTypes;

export class KalturaCaptionAssetListResponse extends BaseServiceResult {
  totalCount?: number;
  data: Array<KalturaCaptionAsset> = [];

  constructor(responseObj: any) {
    super(responseObj);
    if (!this.hasError) {
      this.totalCount = responseObj.totalCount;
      if (this.totalCount! > 0) {
        this.data = [];
        responseObj.objects.map((captionAsset: KalturaCaptionAssetArgs) => this.data.push(new KalturaCaptionAsset(captionAsset)));
      }
    }
  }
}
