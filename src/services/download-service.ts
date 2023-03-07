import { DownloadConfig } from "types";

class DownloadService {
    constructor(private player: KalturaPlayerTypes.Player) {
    }
    
    private isPlatformSupported() {
        const userAgent = navigator.userAgent || '';
        return !(userAgent.includes('Tizen') || userAgent.includes('Web0S'));
    }
    
    private isEntrySupported() {
        return !(this.player.isLive() || this.player.getVideoElement().mediaKeys);
    }
    
    private async isUrlSupported(url: string) {
        try {
            const req = await fetch(url, { method: 'HEAD' });
            if (req.ok) {
                const headers = req.headers.get('content-type');
                if (headers && headers.toLowerCase().includes('video')) {
                    return true;
                } else {
                    //throw a player error instead... and maybe log error to analytics?
                    throw new Error(`Download failed: Invalid content-type header: ${headers}`);
                }
            } else {
                //throw a player error instead... and maybe log error to analytics?
                throw new Error(`Download failed: Invalid response: ${req.status} ${req.statusText}`);
            }
        } finally {
            return false;
        }
    }
    
    private getDownloadUrl(config: DownloadConfig) {
        const {flavorId, flavorParamId} = config;
        const {provider: {partnerId, env: {serviceUrl}}} = this.player;
        const {session: {ks}, sources: {id}} = this.player.config;
        
        const partnerPart = `/p/${partnerId}`;
        const entryIdPart = `/entryId/${id}`;
        const flavorParamIdPart = flavorParamId !== null ? `/flavorParamId/${flavorParamId}` : '';
        const flavorIdPart = flavorId !== null ? `/flavorId/${flavorId}` : '';
        const ksPart = ks ? `/ks/${ks}` : '';
        const protocolPart = `/protocol/${location.protocol.split(":")[0]}`;
        
        return `${serviceUrl}${partnerPart}/playManifest${entryIdPart}${protocolPart}${ksPart}${flavorParamIdPart}${flavorIdPart}/format/download`;
    }
    
    async isDownloadSupported(config: DownloadConfig): Promise<boolean> {
        return Promise.resolve(this.isPlatformSupported() && this.isEntrySupported() && this.isUrlSupported(this.getDownloadUrl(config)));
    }
    
    async getFilename() {
        
    }
    
    async download() {
        
    }
}

export {DownloadService};