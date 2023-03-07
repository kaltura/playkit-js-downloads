import {ui} from 'kaltura-player-js';
import {UpperBarManager} from '@playkit-js/ui-managers';

import { DownloadConfig } from "types";
import { DownloadOverlayButton } from 'components';
import { OVERLAY } from 'icons/icons';
import { DownloadService } from 'services';

class Download extends KalturaPlayer.core.BasePlugin {
  static defaultConfig: DownloadConfig = {
    flavorId: null,
    flavorParamId: null,
    preDownloadHook: null
  }
  
  private iconId = -1;
  private downloadService: DownloadService;
  
  constructor(name: string, player: KalturaPlayerTypes.Player, config: DownloadConfig) {
    super(name, player, config);
    this.downloadService = new DownloadService(player)
  }
  
  static isValid(): boolean {
    return true;
  }
  
  private get upperBarManager(): UpperBarManager {
    return (this.player.getService('upperBarManager') as UpperBarManager) || {};
  }
  
  private injectUIComponents() {
    this.iconId = this.upperBarManager.add({
      label: 'Download',
      svgIcon: {
        viewBox: '0 0 32 32',
        path: OVERLAY
      },
      onClick: () => {
      },
      component: () => {
        return <DownloadOverlayButton />;
      }
    }) as number;
  }
  
  async loadMedia() {
    await this.ready;
    
    const canDownload = await this.downloadService.isDownloadSupported(this.config);
    if (canDownload) {
      this.injectUIComponents();
    }
  }
  
  reset() {
    this.iconId = -1;
  }
}

export {Download};