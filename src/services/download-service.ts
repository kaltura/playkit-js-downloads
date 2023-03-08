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
    
    private async isUrlSupported(url: string): Promise<boolean> {
        try {
            const req = await fetch(url, { method: 'HEAD' });
            if (req.ok) {
                const headers = req.headers.get('content-type');
                return !!(headers && headers.toLowerCase().includes('video'));
            } 
        } catch(e) {}

        return false;
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
    
    async isDownloadSupported(config: DownloadConfig): Promise<boolean> {
        if (!(this.isPlatformSupported() || this.isEntrySupported())) {
            return false;
        }

        return this.isUrlSupported(this.getDownloadUrl(config));
    }
    
    async getFilename() {
        
    }
    
    async download() {
        
    }
}

export {DownloadService};