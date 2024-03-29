import {ToastManager, ToastSeverity, UpperBarManager} from '@playkit-js/ui-managers';

import {DownloadConfig, DownloadMetadata} from './types';
import {DownloadOverlayButton} from './components';
import {DOWNLOAD} from './icons';
import {DownloadOverlay} from './components/download-overlay';
import {DownloadPluginManager} from './download-plugin-manager';

import {OnClickEvent} from '@playkit-js/common';
import {ui} from '@playkit-js/kaltura-player-js';
import {DownloadEvent} from './event';

const {ReservedPresetNames} = ui;
const {Text} = ui.preacti18n;

const PRESETS = [ReservedPresetNames.Playback, ReservedPresetNames.Img];

class Download extends KalturaPlayer.core.BasePlugin {
  static defaultConfig: DownloadConfig = {
    flavorId: null,
    flavorParamId: '0', // source
    preDownloadHook: null,
    displayAttachments: true,
    displayFlavors: true,
    displayCaptions: true,
    displaySources: true
  };

  private iconId = -1;
  private defaultToastDuration = 5 * 1000;

  private componentDisposers: Array<typeof Function> = [];
  private downloadPluginManager: DownloadPluginManager;
  private _pluginButtonRef: HTMLButtonElement | null = null;
  public triggeredByKeyboard = false;

  constructor(name: string, player: KalturaPlayerTypes.Player, config: DownloadConfig) {
    super(name, player, config);
    this.downloadPluginManager = new DownloadPluginManager(this);
    this._addBindings();
  }

  static isValid(): boolean {
    return true;
  }

  private get upperBarManager(): UpperBarManager {
    return (this.player.getService('upperBarManager') as UpperBarManager) || {};
  }

  private get toastManager(): ToastManager {
    return (this.player.getService('toastManager') as ToastManager) || {};
  }

  addToast({title, text, icon, severity}: {title: string; text: string; icon: any; severity: ToastSeverity}) {
    this.toastManager.add({
      title,
      text,
      icon,
      severity,
      duration: this.defaultToastDuration,
      onClick: () => null
    });
  }

  private _setPluginButtonRef = (ref: HTMLButtonElement) => {
    this._pluginButtonRef = ref;
  };

  private _handleClick = (event: OnClickEvent, byKeyboard: boolean) => {
    this.triggeredByKeyboard = byKeyboard;
    this.downloadPluginManager.showOverlay = !this.downloadPluginManager.showOverlay;
  };

  private _focusPluginButton = () => {
    setTimeout(() => {
      this._pluginButtonRef?.focus();
    });
  };

  private injectOverlayComponents(downloadMetadata: DownloadMetadata) {
    if (this.iconId > 0) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.iconId = this.upperBarManager.add({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      ariaLabel: (<Text id="download.download">Download</Text>) as never,
      displayName: 'Download',
      order: 40,
      svgIcon: {
        path: DOWNLOAD
      },
      onClick: this._handleClick as any,
      component: () => {
        return <DownloadOverlayButton setRef={this._setPluginButtonRef} />;
      },
      presets: PRESETS
    }) as number;

    this.componentDisposers.push(
      this.player.ui.addComponent({
        label: 'kaltura-download-overlay',
        presets: PRESETS,
        area: 'GuiArea',
        get: () => {
          return (
            <DownloadOverlay
              downloadPluginManager={this.downloadPluginManager}
              setFocus={this._focusPluginButton}
              downloadMetadata={downloadMetadata}
            />
          );
        }
      })
    );
  }

  private shouldInjectUI(downloadMetadata: DownloadMetadata): boolean {
    if (!downloadMetadata) return false;
    const {flavors, captions, attachments, imageDownloadUrl} = downloadMetadata;
    const {displayCaptions, displayAttachments, displaySources} = this.downloadPluginManager.downloadPlugin.config;
    return (
      (displaySources && (flavors.length || imageDownloadUrl)) || (displayCaptions && captions.length) || (displayAttachments && attachments.length)
    );
  }

  async loadMedia() {
    await this.ready;

    this.downloadPluginManager.showOverlay = false;
    const downloadMetadata = await this.downloadPluginManager.getDownloadMetadata(true);

    if (this.shouldInjectUI(downloadMetadata)) {
      this.logger.debug('Download is supported for current entry');
      this.injectOverlayComponents(downloadMetadata);
    }
  }

  _addBindings() {
    this.eventManager.listen(this.downloadPluginManager, DownloadEvent.SHOW_OVERLAY, e => this.dispatchEvent(DownloadEvent.SHOW_OVERLAY, e.payload));
    this.eventManager?.listen(this.downloadPluginManager, DownloadEvent.HIDE_OVERLAY, e => this.dispatchEvent(DownloadEvent.HIDE_OVERLAY, e.payload));
  }

  reset() {
    this.upperBarManager?.remove(this.iconId);
    this.iconId = -1;
    this._pluginButtonRef = null;
    this.triggeredByKeyboard = false;

    for (const componentDisposer of this.componentDisposers) {
      componentDisposer();
    }
    this.componentDisposers = [];
  }
}

export {Download};
