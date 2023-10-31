import ILoader = KalturaPlayerTypes.ILoader;
import {KalturaAttachmentAssetListResponse, KalturaAttachmentAsset} from './response-types';
const {RequestBuilder} = KalturaPlayer.providers;

interface AttachmentsLoaderParams {
  entryId: string;
}

interface AttachmentsResponse {
  attachments: Array<KalturaAttachmentAsset>;
}

export class AttachmentsLoader implements ILoader {
  _entryId: string;
  _requests: (typeof RequestBuilder)[] = [];
  _response: AttachmentsResponse = {
    attachments: []
  };

  static get id(): string {
    return 'attachments';
  }

  constructor({entryId}: AttachmentsLoaderParams) {
    this._entryId = entryId;

    const headers: Map<string, string> = new Map();

    const attachmentsListRequest = new RequestBuilder(headers);
    attachmentsListRequest.service = 'attachment_attachmentAsset';
    attachmentsListRequest.action = 'list';
    attachmentsListRequest.params = {
      filter: {
        entryIdEqual: this._entryId,
        objectType: 'KalturaAttachmentAssetFilter'
      }
    };
    this.requests.push(attachmentsListRequest);
  }

  set requests(requests: any[]) {
    this._requests = requests;
  }

  get requests(): any[] {
    return this._requests;
  }

  set response(response: any) {
    const attachmentAssetListRequestResponse = new KalturaAttachmentAssetListResponse(response[0]?.data);
    if (attachmentAssetListRequestResponse.totalCount) {
      this._response.attachments = attachmentAssetListRequestResponse?.data;
    }
  }

  get response(): any {
    return this._response;
  }

  isValid(): boolean {
    return Boolean(this._entryId);
  }
}
