import {KalturaFlavorAsset, FlavorsStatus} from './kaltura-flavor-asset';
const {BaseServiceResult} = KalturaPlayer.providers.ResponseTypes;

export class KalturaFlavorAssetListResponse extends BaseServiceResult {
  totalCount?: number;
  data: Array<KalturaFlavorAsset> = [];

  constructor(responseObj: any) {
    super(responseObj);
    if (!this.hasError) {
      this.totalCount = responseObj.totalCount;
      if (this.totalCount! > 0) {
        this.data = this._setData(responseObj.objects);
      }
    }
  }

  private _sortFlavors = (flavors: Array<any>) => {
    const sortedFlavors = flavors.sort((a: {height: number}, b: {height: number}) => {
      return b.height - a.height;
    });
    return sortedFlavors;
  };

  private _filterUniqueFlavors = (flavors: Array<any>) => {
    const flavorsMap = new Map();
    flavors.forEach(flavor => {
      if (flavor.status === FlavorsStatus.ACTIVE) {
        flavorsMap.set(flavor.uniqKey, flavor);
      }
    });
    return Array.from(flavorsMap.values());
  };

  private _updateFlavors = (flavors: Array<any>) => {
    const updatedFlavors = flavors.map((flavor: any) => {
      return {
        ...flavor,
        uniqKey: `${flavor.height}_${flavor.width}_${flavor.language}_${flavor.frameRate}`,
        isAudio: flavor.height === 0 && flavor.width === 0 && flavor.frameRate === 0
      };
    });
    return updatedFlavors;
  };

  private _setData(flavors: Array<any>): Array<KalturaFlavorAsset> {
    const flavorAssets = this._filterUniqueFlavors(this._sortFlavors(this._updateFlavors(flavors))).map(flavor => {
      return new KalturaFlavorAsset(flavor);
    });
    return flavorAssets;
  }
}
