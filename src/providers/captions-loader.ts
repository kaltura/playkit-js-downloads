import ILoader = KalturaPlayerTypes.ILoader;
import {KalturaCaptionAssetListResponse, KalturaCaptionAsset} from './response-types';
const {RequestBuilder} = KalturaPlayer.providers;

interface CaptionsLoaderParams {
  entryId: string;
}

interface CaptionsResponse {
  captions: Array<KalturaCaptionAsset>;
}

export class CaptionsLoader implements ILoader {
  _entryId: string;
  _requests: (typeof RequestBuilder)[] = [];
  _response: CaptionsResponse = {
    captions: []
  };

  static get id(): string {
    return 'captions';
  }

  constructor({entryId}: CaptionsLoaderParams) {
    this._entryId = entryId;

    const headers: Map<string, string> = new Map();

    const captionsListRequest = new RequestBuilder(headers);
    captionsListRequest.service = 'caption_captionAsset';
    captionsListRequest.action = 'list';
    captionsListRequest.params = {
      filter: {
        entryIdEqual: this._entryId,
        objectType: 'KalturaCaptionAssetFilter'
      }
    };
    this.requests.push(captionsListRequest);
  }

  set requests(requests: any[]) {
    this._requests = requests;
  }

  get requests(): any[] {
    return this._requests;
  }

  set response(response: any) {
    const captionAssetListRequestResponse = new KalturaCaptionAssetListResponse(response[0]?.data);
    if (captionAssetListRequestResponse.totalCount) {
      this._response.captions = captionAssetListRequestResponse?.data;
    }
  }

  get response(): any {
    return this._response;
  }

  isValid(): boolean {
    return Boolean(this._entryId);
  }
}
