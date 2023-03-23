import { DownloadConfig, DownloadMetadata } from "types";

class DownloadService {
    constructor(private player: KalturaPlayerTypes.Player) {
    }
    
    private isPlatformSupported() {
        const userAgent = navigator.userAgent || '';
        return !(userAgent.includes('Tizen') || userAgent.includes('Web0S'));
    }
    
    private isEntrySupported() {
        //TODO update player signature
        //@ts-ignore
        return !(this.player.isLive() || this.player.getVideoElement().mediaKeys || this.player.isImage());
    }

    private isContentTypeSupported(response: Response) {
        if (response.ok) {
            const contentType = response.headers.get('content-type');
            return !!(contentType && contentType.toLowerCase().includes('video'));
        }
        return false;
    }

    private getFilename(response: Response) {
        const responseUrlSplit = response.url.split("/");
        return responseUrlSplit[responseUrlSplit.indexOf("fileName") + 1];
    }
    
    private getDownloadUrl(config: DownloadConfig) {
        const {flavorId, flavorParamId} = config;
        const {provider: {partnerId, env: {cdnUrl}}} = this.player;
        const {session: {ks}, sources: {id}} = this.player.config;
        
        const partnerPart = `/p/${partnerId}`;
        const entryIdPart = `/entryId/${id}`;
        const flavorParamIdPart = flavorParamId !== null ? `/flavorParamId/${flavorParamId}` : '';
        const flavorIdPart = flavorId !== null ? `/flavorId/${flavorId}` : '';
        const ksPart = ks ? `/ks/${ks}` : '';
        const protocolPart = `/protocol/${location.protocol.split(":")[0]}`;
        
        return `${cdnUrl}${partnerPart}/playManifest${entryIdPart}${protocolPart}${ksPart}${flavorParamIdPart}${flavorIdPart}/format/download`;
    }
    
    async getDownloadMetadata(config: DownloadConfig): Promise<DownloadMetadata> {
        if (!(this.isPlatformSupported() || this.isEntrySupported())) {
            return null;
        }

        const requestUrl = this.getDownloadUrl(config);
        const response = await fetch(requestUrl, { method: 'HEAD' });
        const downloadUrl = response.url;

        const isContentTypeSupported = this.isContentTypeSupported(response);
        const fileName = this.getFilename(response);

        if (!(isContentTypeSupported && fileName)) {
            return null;
        }

        return {
            downloadUrl,
            fileName
        };
    }
    
    async downloadFile(downloadUrl: string) {
        const aElement = document.createElement('a');
        aElement.href = downloadUrl;
        aElement.setAttribute('target', '_blank');
        aElement.click();
    }
}

export {DownloadService};