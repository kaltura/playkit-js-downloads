export interface KalturaFlavorAssetArgs {
  id: string;
  fileExt: string;
  flavorParamsId: number;
  isOriginal: boolean;
  height: number;
  language: string;
}

export class KalturaFlavorAsset {
  id: string;
  fileExt: string;
  flavorParamsId: number;
  isOriginal: boolean;
  downloadUrl: string;
  height: number;
  language: string;

  constructor(flavorAsset: KalturaFlavorAssetArgs) {
    this.id = flavorAsset.id;
    this.fileExt = flavorAsset.fileExt;
    this.flavorParamsId = flavorAsset.flavorParamsId;
    this.isOriginal = flavorAsset.isOriginal;
    this.downloadUrl = '';
    this.height = flavorAsset.height;
    this.language = flavorAsset.language;
  }
}
