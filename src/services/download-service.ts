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

  private isContentTypeSupported(response: Response, typeToCheck = 'video') {
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      return !!(contentType && contentType.toLowerCase().includes(typeToCheck));
    }
    return false;
  }

  private getFilename(response: Response) {
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

    const requestUrl = this.player.isImage() && this.player.sources.downloadUrl ? this.player.sources.downloadUrl : this.getDownloadUrl(config);
    if (!requestUrl) {
      return null;
    }

    try {
      const response = await fetch(requestUrl, {method: 'HEAD'});
      if (!response.ok) {
        return null;
      }

      const downloadUrl = response.url;

      const isContentTypeSupported = this.isContentTypeSupported(response, this.player.isImage() ? 'image' : 'video');
      const fileName = this.player.isImage() ? this.player.sources?.metadata?.name || 'Image' : this.getFilename(response);

      if (isContentTypeSupported && fileName) {
        return {
          downloadUrl,
          fileName
        };
      }
    } catch (e: any) {}

    return null;
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
