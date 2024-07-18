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

const PRESETS = [ReservedPresetNames.Playback, ReservedPresetNames.Img, ReservedPresetNames.MiniAudioUI];

class Download extends KalturaPlayer.core.BasePlugin {
  public displayName = 'Download';
  public svgIcon = {path: DOWNLOAD, viewBox: '0 0 32 32'};
  static defaultConfig: DownloadConfig = {
    flavorId: null,
    flavorParamId: '0', // source
    preDownloadHook: null,
    displayAttachments: true,
    displayFlavors: true,
    displayCaptions: true,
    displaySources: true,
    undisplayedAttachments: ['KalturaTranscriptAsset']
  };

  private iconId = -1;
  private audioPlayerIconId = -1;
  private defaultToastDuration = 5 * 1000;

  private componentDisposers: Array<typeof Function> = [];
  private downloadPluginManager: DownloadPluginManager;
  private _pluginButtonRef: HTMLButtonElement | null = null;
  public triggeredByKeyboard = false;
  private store: any;

  constructor(name: string, player: KalturaPlayerTypes.Player, config: DownloadConfig) {
    super(name, player, config);
    this.downloadPluginManager = new DownloadPluginManager(this);
    this._addBindings();
    this.store = ui.redux.useStore();
  }

  static isValid(): boolean {
    return true;
  }

  private get upperBarManager(): UpperBarManager {
    return this.player.getService('upperBarManager') as UpperBarManager;
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

  public open(): void {
    this.showOverlay();
  }

  private showOverlay(): void {
    this.downloadPluginManager.setShowOverlay(true);
  }

  private _setPluginButtonRef = (ref: HTMLButtonElement) => {
    this._pluginButtonRef = ref;
  };

  private _handleClick = (event: OnClickEvent, byKeyboard: boolean) => {
    this.triggeredByKeyboard = byKeyboard;
    this.downloadPluginManager.setShowOverlay(!this.downloadPluginManager.showOverlay);
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

    if (this.store.getState().shell['activePresetName'] !== ReservedPresetNames.MiniAudioUI) {
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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        presets: PRESETS.filter(presetName => presetName !== ReservedPresetNames.MiniAudioUI)
      }) as number;
    } else {
      const {displayName, svgIcon} = this;
      // @ts-ignore
      this.audioPlayerIconId = this.player.getService('AudioPluginsManager').add({displayName, svgIcon, onClick: (e) => this.open(e)});
    }

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

  public isEntrySupported(downloadMetadata: DownloadMetadata): boolean {
    if (!downloadMetadata) return false;
    const {flavors, captions, attachments, imageDownloadUrl} = downloadMetadata;
    const {displayCaptions, displayAttachments, displaySources} = this.downloadPluginManager.downloadPlugin.config;
    return (
      (displaySources && (flavors.length || imageDownloadUrl)) || (displayCaptions && captions.length) || (displayAttachments && attachments.length)
    );
  }

  async loadMedia() {
    await this.ready;

    this.downloadPluginManager.setShowOverlay(false, false);
    const downloadMetadata = await this.downloadPluginManager.getDownloadMetadata(true);

    if (this.isEntrySupported(downloadMetadata)) {
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
    // @ts-ignore
    this.player.getService('AudioPluginsManager').remove(this.audioPlayerIconId);
    this.iconId = -1;
    this.audioPlayerIconId = -1;
    this._pluginButtonRef = null;
    this.triggeredByKeyboard = false;

    for (const componentDisposer of this.componentDisposers) {
      componentDisposer();
    }
    this.componentDisposers = [];
  }
}

export {Download};
