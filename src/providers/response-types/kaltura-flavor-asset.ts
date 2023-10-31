export interface KalturaFlavorAssetArgs {
  id: string;
  fileExt: string;
  flavorParamsId: number;
  isOriginal: boolean;
  height: number;
}

export class KalturaFlavorAsset {
  id: string;
  fileExt: string;
  flavorParamsId: number;
  isOriginal: boolean;
  downloadUrl: string;
  height: number;

  constructor(flavorAsset: KalturaFlavorAssetArgs) {
    this.id = flavorAsset.id;
    this.fileExt = flavorAsset.fileExt;
    this.flavorParamsId = flavorAsset.flavorParamsId;
    this.isOriginal = flavorAsset.isOriginal;
    this.downloadUrl = '';
    this.height = flavorAsset.height;
  }
}
