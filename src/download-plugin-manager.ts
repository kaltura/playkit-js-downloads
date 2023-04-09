import { DownloadService } from "services";
import { DownloadConfig, DownloadMetadata } from "types";

class DownloadPluginManager extends KalturaPlayer.core.FakeEventTarget {    
    private _showOverlay = false;
    private downloadService: any;
    private downloadMetadata: DownloadMetadata = null;
    private playOnClose = false;

    constructor(private player: KalturaPlayerTypes.Player, private config: DownloadConfig) {
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
            if (!this.player.paused) {
                this.player.pause();
                this.playOnClose = true;
            }
            this.dispatchEvent(new KalturaPlayer.core.FakeEvent("showoverlay"));
        } else {
            if (this.playOnClose) {
                this.player.play();
                this.playOnClose = false;
            }
            this.dispatchEvent(new KalturaPlayer.core.FakeEvent("hideoverlay"));
        }
    }

    get showOverlay() {
        return this._showOverlay;
    }
}

export {DownloadPluginManager};