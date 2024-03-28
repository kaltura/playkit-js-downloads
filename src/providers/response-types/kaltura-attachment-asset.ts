export interface KalturaAttachmentAssetArgs {
  id: string;
  filename: string;
  fileExt: string;
  title: string;
  objectType: string;
  size: number;
  version: number;
  tags: string;
  status: number;
  format: string;
  createdAt: number;
  updatedAt: number;
}

export class KalturaAttachmentAsset {
  id: string;
  fileName: string;
  fileExt: string;
  downloadUrl: string;
  title: string;
  objectType: string;

  constructor(attachmentAsset: KalturaAttachmentAssetArgs) {
    this.id = attachmentAsset.id;
    this.fileName = attachmentAsset.filename;
    this.fileExt = attachmentAsset.fileExt;
    this.downloadUrl = '';
    this.title = attachmentAsset.title;
    this.objectType = attachmentAsset.objectType;
  }
}
