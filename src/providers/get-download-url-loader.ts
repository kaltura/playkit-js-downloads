import {KalturaAttachmentAsset, KalturaCaptionAsset, KalturaFlavorAsset} from './response-types';
import {ILoader} from '@playkit-js/playkit-js-providers/types';
import {RequestBuilder} from '@playkit-js/playkit-js-providers/ovp-provider';


interface DownloadUrlLoaderParams {
  flavors: Array<KalturaFlavorAsset>;
  captions: Array<KalturaCaptionAsset>;
  attachments: Array<KalturaAttachmentAsset>;
}

interface DownloadUrlResponse {
  urls: Map<string, string>;
}

export class DownloadUrlLoader implements ILoader {
  _flavors: Array<KalturaFlavorAsset>;
  _captions: Array<KalturaCaptionAsset>;
  _attachments: Array<KalturaAttachmentAsset>;
  _requests: (RequestBuilder)[] = [];
  _response: DownloadUrlResponse = {
    urls: new Map()
  };

  static get id(): string {
    return 'downloadUrls';
  }

  constructor({flavors, captions, attachments}: DownloadUrlLoaderParams) {
    this._flavors = flavors;
    this._captions = captions;
    this._attachments = attachments;
    this.addRequest(flavors, 'flavorasset', 'getUrl');
    this.addRequest(attachments, 'attachment_attachmentAsset', 'getUrl');
    this.addRequest(captions, 'caption_captionAsset', 'getUrl');
  }

  addRequest(items: any[], service: string, action: string): void {
    const headers: Map<string, string> = new Map();
    items.forEach((item: {id: string}) => {
      const itemsDownloadUrlRequest = new RequestBuilder(headers);
      itemsDownloadUrlRequest.service = service;
      itemsDownloadUrlRequest.action = action;
      itemsDownloadUrlRequest.params = {id: item.id};
      this.requests.push(itemsDownloadUrlRequest);
    });
  }

  set requests(requests: any[]) {
    this._requests = requests;
  }

  get requests(): any[] {
    return this._requests;
  }

  set response(response: any) {
    const urls: Map<string, string> = new Map();
    for (let index = 0; index < this._requests.length; index++) {
      if (this._requests[index].service === 'caption_captionAsset') {
        // eslint-disable-next-line  no-useless-escape
        const id = response[index]?.data.match(/captionAssetId\/([^\/]+)/)[1];
        urls.set(id, response[index]?.data);
      } else {
        urls.set(this._requests[index].params.id, response[index]?.data);
      }
    }
    this._response.urls = urls;
  }

  get response(): any {
    return this._response;
  }

  isValid(): boolean {
    return true;
  }
}
