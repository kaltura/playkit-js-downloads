import {DownloadConfig, DownloadMetadata} from '../types';

class DownloadService {
  constructor(private player: KalturaPlayerTypes.Player) {}

  private isPlatformSupported() {
    const userAgent = navigator.userAgent || '';
    return !(userAgent.includes('Tizen') || userAgent.includes('Web0S'));
  }

  private isEntrySupported() {
    return !(this.player.isLive() || this.player.getVideoElement().mediaKeys);
  }

  private isContentTypeSupported(response: Response) {
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      return !!(contentType && contentType.toLowerCase().includes('video'));
    }
    return false;
  }

  private getFilename(response: Response) {
    if (this.player.isImage()) {
      return this.player.sources?.metadata?.name || 'image';
    }
    const responseUrlSplit = response.url.split('/');
    return responseUrlSplit[responseUrlSplit.indexOf('fileName') + 1];
  }

  private getDownloadUrl(config: DownloadConfig) {
    const {flavorId, flavorParamId} = config;
    const {provider} = this.player;

    const playerConfig = this.player.config;
    const {session, sources} = playerConfig;

    if (!(session && session.ks && sources && sources.id && provider.partnerId && provider.env.cdnUrl)) {
      return '';
    }

    const {ks} = playerConfig.session;
    const {id} = playerConfig.sources;
    const {partnerId} = provider;
    const {cdnUrl} = provider.env;

    const partnerPart = `/p/${partnerId}`;
    const entryIdPart = `/entryId/${id}`;
    const flavorParamIdPart = flavorParamId !== null ? `/flavorParamId/${flavorParamId}` : '';
    const flavorIdPart = flavorId !== null ? `/flavorId/${flavorId}` : '';
    const ksPart = ks ? `/ks/${ks}` : '';
    const protocolPart = `/protocol/${location.protocol.split(':')[0]}`;

    return `${cdnUrl}${partnerPart}/playManifest${entryIdPart}${protocolPart}${ksPart}${flavorParamIdPart}${flavorIdPart}/format/download`;
  }

  async getDownloadMetadata(config: DownloadConfig): Promise<DownloadMetadata> {
    if (!(this.isPlatformSupported() && this.isEntrySupported())) {
      return null;
    }

    const requestUrl = this.getRequestUrl(config);
    if (!requestUrl) {
      return null;
    }

    try {
      const response = await fetch(requestUrl, {method: 'HEAD'});
      if (!response.ok) {
        return null;
      }

      const downloadUrl = response.url;

      const isContentTypeSupported = this.player.isImage() || this.isContentTypeSupported(response);
      const fileName = this.getFilename(response);

      if (isContentTypeSupported && fileName) {
        return {
          downloadUrl,
          fileName
        };
      }
    } catch (e: any) {
      // in case HEAD request failed for raw service (image use-case), retry to get the image download metadata using thumbnail service
      if (this.player.isImage()) {
        return await this.getImageDownloadMetadata();
      }
    }

    return null;
  }

  private async getImageDownloadMetadata(): Promise<DownloadMetadata> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const imageSource = this.player.config.sources.image;
    let requestUrl = imageSource && imageSource.length > 0 ? imageSource[0].url : '';
    if (!requestUrl) return null;
    if (!requestUrl.includes('/ks/')) {
      const ks = this.player.config.session.ks;
      requestUrl = ks ? `${requestUrl}/ks/${ks}` : requestUrl;
    }
    try {
      const response = await fetch(requestUrl);
      const blobImage = await response.blob();
      const href = URL.createObjectURL(blobImage);
      return {
        downloadUrl: href,
        fileName: this.player.sources?.metadata?.name || 'image'
      };
    } catch (e: any) {}
    return null;
  }

  private getRequestUrl(config: DownloadConfig): string {
    if (this.player.isImage()) {
      const requestUrl = this.player.sources.downloadUrl;
      if (!requestUrl) return '';
      const ks = this.player.config.session.ks;
      return ks ? `${requestUrl}/ks/${ks}` : requestUrl;
    }
    return this.getDownloadUrl(config);
  }

  downloadFile(downloadUrl: string, fileName: string) {
    const aElement = document.createElement('a');
    aElement.href = downloadUrl;
    aElement.hidden = true;
    aElement.download = fileName;
    aElement.rel = 'noopener noreferrer';
    aElement.click();
  }
}

export {DownloadService};
