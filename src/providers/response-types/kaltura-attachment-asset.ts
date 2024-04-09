export interface KalturaAttachmentAssetArgs {
  id: string;
  filename: string;
  fileExt: string;
  title: string;
}

export class KalturaAttachmentAsset {
  id: string;
  fileName: string;
  fileExt: string;
  downloadUrl: string;
  title: string;

  constructor(attachmentAsset: KalturaAttachmentAssetArgs) {
    this.id = attachmentAsset.id;
    this.fileName = attachmentAsset.filename;
    this.fileExt = attachmentAsset.fileExt;
    this.downloadUrl = '';
    this.title = attachmentAsset.title;
  }
}
