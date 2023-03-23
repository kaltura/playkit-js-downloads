import {ui} from 'kaltura-player-js';
import {UpperBarManager} from '@playkit-js/ui-managers';

import { DownloadConfig } from "types";
import { DownloadOverlayButton } from 'components';
import { OVERLAY } from 'icons/icons';
import { DownloadService } from 'services';
import { DownloadOverlay } from 'components/download-overlay';
import { DownloadPluginManager } from 'download-plugin-manager';

const PRESETS = ['Playback'];

class Download extends KalturaPlayer.core.BasePlugin {
  static defaultConfig: DownloadConfig = {
    flavorId: null,
    flavorParamId: null,
    preDownloadHook: null
  }
  
  private iconId = -1;
  
  private componentDisposers: Array<typeof Function> = [];
  private downloadPluginManager: DownloadPluginManager;
  
  constructor(name: string, player: KalturaPlayerTypes.Player, config: DownloadConfig) {
    super(name, player, config);
    this.downloadPluginManager = new DownloadPluginManager(player, this.config);
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
        this.downloadPluginManager.showOverlay = !this.downloadPluginManager.showOverlay;
      },
      component: () => {
        return <DownloadOverlayButton />;
      }
    }) as number;
    
    this.componentDisposers.push(
      this.player.ui.addComponent({
        label: 'kaltura-download-overlay',
        presets: PRESETS,
        area: 'GuiArea',
        get: () => {
          return <DownloadOverlay downloadPluginManager={this.downloadPluginManager}/>;
        }
      }));
    }
    
    async loadMedia() {
      await this.ready;

      const downloadMetadata = await this.downloadPluginManager.getDownloadMetadata();
      
      if (downloadMetadata) {
        this.injectUIComponents();
      }
    }
    
    reset() {
      this.iconId = -1;
      
      for (const componentDisposer of this.componentDisposers) {
        componentDisposer();
      }
      this.componentDisposers = [];
    }
  }
  
  export {Download};