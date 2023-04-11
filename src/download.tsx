import {ui} from 'kaltura-player-js';
import {UpperBarManager} from '@playkit-js/ui-managers';

import {DownloadConfig} from 'types';
import {DownloadOverlayButton} from 'components';
import {DOWNLOAD} from 'icons';
import {DownloadOverlay} from 'components/download-overlay';
import {DownloadPluginManager} from 'download-plugin-manager';

import {ContribServices} from '@playkit-js/common/dist/ui-common/contrib-services';
import {ToastSeverity} from '@playkit-js/common';

const PRESETS = ['Playback'];

class Download extends KalturaPlayer.core.BasePlugin {
  static defaultConfig: DownloadConfig = {
    flavorId: null,
    flavorParamId: '0', // source
    preDownloadHook: null
  };

  private iconId = -1;
  private defaultToastDuration = 5 * 1000;

  private componentDisposers: Array<typeof Function> = [];
  private downloadPluginManager: DownloadPluginManager;
  private contribServices: ContribServices;

  constructor(name: string, player: KalturaPlayerTypes.Player, config: DownloadConfig) {
    super(name, player, config);
    this.downloadPluginManager = new DownloadPluginManager(this);
    this.contribServices = ContribServices.get({kalturaPlayer: player});
  }

  static isValid(): boolean {
    return true;
  }

  private get upperBarManager(): UpperBarManager {
    return (this.player.getService('upperBarManager') as UpperBarManager) || {};
  }

  addToast({title, text, icon, severity}: {title: string; text: string; icon: any; severity: ToastSeverity}) {
    this.contribServices?.toastManager?.add({
      title,
      text,
      icon,
      severity,
      duration: this.defaultToastDuration,
      onClick: () => null
    });
  }

  getUIComponents(): any[] {
    return this.contribServices.register();
  }

  private injectOverlayComponents() {
    this.iconId = this.upperBarManager.add({
      label: 'Download',
      svgIcon: {
        viewBox: '0 0 32 32',
        path: DOWNLOAD
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
          return <DownloadOverlay downloadPluginManager={this.downloadPluginManager} />;
        }
      })
    );
  }

  async loadMedia() {
    await this.ready;

    this.downloadPluginManager.showOverlay = false;
    const downloadMetadata = await this.downloadPluginManager.getDownloadMetadata(true);

    if (downloadMetadata) {
      this.logger.debug('Download is supported for current entry');
      this.injectOverlayComponents();
    }
  }

  reset() {
    this.upperBarManager?.remove(this.iconId);
    this.iconId = -1;

    for (const componentDisposer of this.componentDisposers) {
      componentDisposer();
    }
    this.componentDisposers = [];
  }
}

export {Download};
