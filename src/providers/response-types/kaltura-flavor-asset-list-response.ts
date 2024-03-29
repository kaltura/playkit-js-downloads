import {KalturaFlavorAsset} from './kaltura-flavor-asset';
const {BaseServiceResult} = KalturaPlayer.providers.ResponseTypes;

export class KalturaFlavorAssetListResponse extends BaseServiceResult {
  totalCount?: number;
  data: Array<KalturaFlavorAsset> = [];

  constructor(responseObj: any) {
    super(responseObj);
    if (!this.hasError) {
      this.totalCount = responseObj.totalCount;
      if (this.totalCount! > 0) {
        this.data = this.setDataWithoutDuplicates(responseObj.objects);
      }
    }
  }

  private setDataWithoutDuplicates(flavors: Array<any>): Array<KalturaFlavorAsset> {
    const data = [];
    // sort flavors by height and filter out flavors with height 0
    const sortedFlavors = flavors
      .sort((a: {height: number}, b: {height: number}) => {
        return a.height < b.height ? 1 : -1;
      })
      .filter(flavor => {
        return flavor.height > 0;
      });
    data.push(new KalturaFlavorAsset(sortedFlavors[0]));
    let previousFlavor = data[0];

    for (let i = 1; i < sortedFlavors.length; i++) {
      const currentFlavor = sortedFlavors[i];
      if (previousFlavor.height !== currentFlavor.height) {
        data.push(new KalturaFlavorAsset(currentFlavor));
      }
      previousFlavor = currentFlavor;
    }

    return data;
  }
}
