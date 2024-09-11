export enum FlavorsStatus {
  ACTIVE = 2
}

export interface KalturaFlavorAssetArgs {
  id: string;
  fileExt: string;
  flavorParamsId: number;
  isOriginal: boolean;
  height: number;
  isAudio: boolean;
  language: string;
}

export class KalturaFlavorAsset {
  id: string;
  fileExt: string;
  flavorParamsId: number;
  isOriginal: boolean;
  downloadUrl: string;
  height: number;
  isAudio: boolean;
  language: string;

  constructor(flavorAsset: KalturaFlavorAssetArgs) {
    this.id = flavorAsset.id;
    this.fileExt = flavorAsset.fileExt;
    this.flavorParamsId = flavorAsset.flavorParamsId;
    this.isOriginal = flavorAsset.isOriginal;
    this.downloadUrl = '';
    this.height = flavorAsset.height;
    this.isAudio = flavorAsset.isAudio;
    this.language = flavorAsset.isAudio ? flavorAsset.language : '';
  }
}
