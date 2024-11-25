import {KalturaPlayer, core} from '@playkit-js/kaltura-player-js';
import {DownloadMetadata} from '../types';
import {AttachmentsLoader, CaptionsLoader, DownloadUrlLoader, FlavorsLoader} from '../providers';

class DownloadService {
  constructor(private player: KalturaPlayer, private logger: any, private _eventManager: core.EventManager) {}

  private async getDualScreenPlayers() {
    const dualScreenService = this.player.getService('dualScreen');
    if (!dualScreenService) {
      return Promise.resolve(null);
    }
    return dualScreenService.ready.then(() => dualScreenService.getDualScreenPlayers('video'));
  }

  private isPlatformSupported() {
    const userAgent = navigator.userAgent || '';
    return !(userAgent.includes('Tizen') || userAgent.includes('Web0S'));
  }

  private isEntrySupported() {
    return !(this.player.isLive() || this.player.getVideoElement()?.mediaKeys);
  }

  private getFilename(metadata: DownloadMetadata) {
    if (metadata?.fileName) {
      return metadata.fileName;
    }
    const responseUrlSplit = metadata!.flavors[0].downloadUrl.split('/');
    return responseUrlSplit[responseUrlSplit.indexOf('fileName') + 1];
  }

  async getDownloadMetadatas(): Promise<DownloadMetadata[]> {
    if (!(this.isPlatformSupported() && this.isEntrySupported())) {
      return [null];
    }
    const entries: {id: string; name: string | undefined}[] = [
      {
        id: this.player.config.sources.id!,
        name: this.player.isImage() ? 'image' : this.player.sources.metadata?.name
      }
    ];
    const dualScreenPlayers = await this.getDualScreenPlayers();
    if (dualScreenPlayers) {
      // wait till all dual-screen players are load a media
      await Promise.all(
        dualScreenPlayers.map(({player}: {player: KalturaPlayer}) => {
          return new Promise<void>(resolve => {
            this._eventManager.listenOnce(player, core.EventType.MEDIA_LOADED, () => {
              const entryId = player.config.sources.id;
              if (entryId && !entries.find(entry => entry.id === entryId)) {
                entries.push({
                  id: entryId,
                  name: player.sources.metadata?.name!
                });
              }
              resolve();
            });
          });
        })
      );
    }

    return Promise.all(
      entries.map(async entry => {
        const metadata: DownloadMetadata = {
          fileName: entry.name || '',
          captions: [],
          flavors: [],
          attachments: [],
          imageDownloadUrl: ''
        };

        const assets = await this.getKalturaAssets(entry.id);
        Object.assign(metadata, assets);
        metadata!.imageDownloadUrl = await this.handleImageDownload();

        if (metadata?.flavors.length || metadata?.captions.length || metadata?.attachments.length) {
          const downloadUrls: Map<string, string> = await this.getDownloadUrls(metadata);

          // assign the download urls to the assets by id
          metadata.flavors = this.setDownloadUrls(metadata?.flavors, downloadUrls);
          metadata.captions = this.setDownloadUrls(metadata?.captions, downloadUrls);
          metadata.attachments = this.setDownloadUrls(metadata?.attachments, downloadUrls);
        }

        metadata!.fileName = this.getFilename(metadata);
        return metadata;
      })
    );
  }

  private setDownloadUrls(assets: any[], downloadUrls: Map<string, string>): any[] {
    return assets.map(asset => {
      return {
        ...asset,
        downloadUrl: downloadUrls.get(asset.id)!
      };
    });
  }

  private async getDownloadUrls(metadata: DownloadMetadata): Promise<Map<string, string>> {
    const ks = this.player.config.session?.ks || '';
    let urls = new Map<string, string>();

    const data = await this.player.provider.doRequest(
      // @ts-expect-error - Type 'typeof DownloadUrlLoader' is missing the following properties from type 'ILoader': requests, response, isValid
      [{loader: DownloadUrlLoader, params: {flavors: metadata?.flavors, captions: metadata?.captions, attachments: metadata?.attachments}}],
      ks,
      false
    );
    if (data && data.has(DownloadUrlLoader.id)) {
      const urlsLoader = data.get(DownloadUrlLoader.id);
      urls = urlsLoader?.response?.urls;
    }

    return urls;
  }

  private async handleImageDownload(): Promise<string> {
    if (!this.player.isImage()) return '';
    // @ts-expect-error - Property 'downloadUrl' does not exist on type 'PKSourcesConfigObject'.
    let imageRequestUrl = this.player.sources.downloadUrl;
    if (!imageRequestUrl) {
      return await this.getImageDownloadMetadata();
    }
    if (!imageRequestUrl.includes('/ks/')) {
      const ks = this.player.config.session?.ks;
      imageRequestUrl = ks ? `${imageRequestUrl}/ks/${ks}` : imageRequestUrl;
    }
    try {
      const response = await fetch(imageRequestUrl, {method: 'HEAD'});
      return response.url;
    } catch (e: any) {
      this.logger.warn('Failed to get image file from url: ', imageRequestUrl);
      // in case HEAD request failed for raw service, retry to get the image download metadata using thumbnail service
      return await this.getImageDownloadMetadata();
    }
  }

  private async getKalturaAssets(entryId: string): Promise<object> {
    const ks = this.player.config.session?.ks || '';

    const data: Map<string, any> = await this.player.provider.doRequest(
      [
        // @ts-expect-error - Type 'typeof CaptionsLoader' is missing the following properties from type 'ILoader': requests, response, isValid
        {loader: CaptionsLoader, params: {entryId}},
        // @ts-expect-error - Type 'typeof FlavorsLoader' is missing the following properties from type 'ILoader': requests, response, isValid
        {loader: FlavorsLoader, params: {entryId}},
        // @ts-expect-error - Type 'typeof AttachmentsLoader' is missing the following properties from type 'ILoader': requests, response, isValid
        {loader: AttachmentsLoader, params: {entryId}}
      ],
      ks
    );

    return this.parseDataFromResponse(data);
  }

  private parseDataFromResponse(data: Map<string, any>): object {
    const kalturaAssets = {
      captions: [],
      flavors: [],
      attachments: []
    };

    if (data) {
      if (data.has(CaptionsLoader.id)) {
        const captionsLoader = data.get(CaptionsLoader.id);
        kalturaAssets.captions = captionsLoader?.response?.captions;
      }
      if (data.has(FlavorsLoader.id)) {
        const flavorsLoader = data.get(FlavorsLoader.id);
        kalturaAssets.flavors = flavorsLoader?.response?.flavors;
      }
      if (data.has(AttachmentsLoader.id)) {
        const attachmentsLoader = data.get(AttachmentsLoader.id);
        kalturaAssets.attachments = attachmentsLoader?.response?.attachments;
      }
    }

    return kalturaAssets;
  }

  private async getImageDownloadMetadata(): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const imageSource = this.player.config.sources.image;
    let requestUrl = imageSource && imageSource.length > 0 ? imageSource[0].url : '';
    if (!requestUrl) return '';
    if (!requestUrl.includes('/ks/')) {
      const ks = this.player.config.session!.ks;
      requestUrl = ks ? `${requestUrl}/ks/${ks}` : requestUrl;
    }
    try {
      const response = await fetch(requestUrl);
      const blobImage = await response.blob();
      return URL.createObjectURL(blobImage);
    } catch (e: any) {
      this.logger.warn('Failed to get image from url: ', requestUrl);
    }
    return '';
  }

  private async _getDownloadUrl(downloadUrl: string): Promise<string> {
    if (downloadUrl.includes('caption_captionAsset')) {
      try {
        const response = await fetch(downloadUrl);
        const blobCaption = await response.blob();
        return URL.createObjectURL(blobCaption);
      } catch (e: any) {
        this.logger.warn('Failed to get captions from url while trying to download captions: ', downloadUrl);
      }
    }
    return downloadUrl;
  }

  async downloadFile(downloadUrl: string, fileName: string): Promise<void> {
    const aElement = document.createElement('a');
    aElement.href = await this._getDownloadUrl(downloadUrl);
    aElement.hidden = true;
    aElement.download = fileName;
    aElement.rel = 'noopener noreferrer';
    aElement.click();
  }
}

export {DownloadService};
