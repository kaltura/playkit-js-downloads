import {ILoader} from '@playkit-js/playkit-js-providers/types';
import {RequestBuilder} from '@playkit-js/playkit-js-providers/ovp-provider';
import {KalturaFlavorAssetListResponse, KalturaFlavorAsset} from './response-types';

interface FlavorsLoaderParams {
  entryId: string;
}

interface FlavorsResponse {
  flavors: Array<KalturaFlavorAsset>;
}

export class FlavorsLoader implements ILoader {
  _entryId: string;
  _requests: (RequestBuilder)[] = [];
  _response: FlavorsResponse = {
    flavors: []
  };

  static get id(): string {
    return 'flavors';
  }

  constructor({entryId}: FlavorsLoaderParams) {
    this._entryId = entryId;

    const headers: Map<string, string> = new Map();

    const flavorsListRequest = new RequestBuilder(headers);
    flavorsListRequest.service = 'flavorasset';
    flavorsListRequest.action = 'list';
    flavorsListRequest.params = {
      filter: {
        entryIdEqual: this._entryId,
        objectType: 'KalturaFlavorAssetFilter'
      }
    };
    this.requests.push(flavorsListRequest);
  }

  set requests(requests: any[]) {
    this._requests = requests;
  }

  get requests(): any[] {
    return this._requests;
  }

  set response(response: any) {
    const flavorAssetListRequestResponse = new KalturaFlavorAssetListResponse(response[0]?.data);
    if (flavorAssetListRequestResponse.totalCount) {
      this._response.flavors = flavorAssetListRequestResponse?.data;
    }
  }

  get response(): any {
    return this._response;
  }

  isValid(): boolean {
    return Boolean(this._entryId);
  }
}
