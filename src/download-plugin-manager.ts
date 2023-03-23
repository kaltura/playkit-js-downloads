import { DownloadService } from "services";
import { DownloadConfig, DownloadMetadata } from "types";

class DownloadPluginManager extends KalturaPlayer.core.FakeEventTarget {    
    private _showOverlay: boolean = false;
    private downloadService: any;
    private downloadMetadata: DownloadMetadata = null;

    constructor(player: KalturaPlayerTypes.Player, private config: DownloadConfig) {
        super();
        this.downloadService = new DownloadService(player);
    }

    async getDownloadMetadata(refresh: boolean = false): Promise<DownloadMetadata> {
        if (!this.downloadMetadata || refresh) {
            this.downloadMetadata = this.downloadService.getDownloadMetadata(this.config);
        }
        return this.downloadMetadata;
    }

    set showOverlay(overlayVisible: boolean) {
        this._showOverlay = overlayVisible;

        if (this._showOverlay) {
            this.dispatchEvent(new KalturaPlayer.core.FakeEvent("showoverlay"));
        } else {
            this.dispatchEvent(new KalturaPlayer.core.FakeEvent("hideoverlay"));
        }
    }

    get showOverlay() {
        return this._showOverlay;
    }
}

export {DownloadPluginManager};