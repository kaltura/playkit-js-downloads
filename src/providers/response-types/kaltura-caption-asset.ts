export interface KalturaCaptionAssetArgs {
  language: string;
  languageCode: string;
  isDefault: boolean;
  label: string;
  id: string;
  fileExt: string;
}

export class KalturaCaptionAsset {
  language: string;
  languageCode: string;
  isDefault: boolean;
  label: string;
  id: string;
  fileExt: string;
  downloadUrl: string;

  constructor(captionAsset: KalturaCaptionAssetArgs) {
    this.id = captionAsset.id;
    this.language = captionAsset.language;
    this.languageCode = captionAsset.languageCode;
    this.isDefault = captionAsset.isDefault;
    this.label = captionAsset.label;
    this.fileExt = captionAsset.fileExt;
    this.downloadUrl = '';
  }
}
