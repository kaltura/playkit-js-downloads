import {h} from 'preact';
import {ToastManager, ToastSeverity, UpperBarManager} from '@playkit-js/ui-managers';
import {BasePlugin, KalturaPlayer, ui} from '@playkit-js/kaltura-player-js';
import {FakeEvent} from '@playkit-js/playkit-js';
import {OnClickEvent} from '@playkit-js/common';

import {DownloadConfig, DownloadMetadata} from './types';
import {DownloadOverlayButton, DownloadOverlay} from './components';
import {DOWNLOAD} from './icons';
import {DownloadPluginManager} from './download-plugin-manager';
import {DownloadEvent} from './event';

const {ReservedPresetNames} = ui;
const {Text} = ui.preacti18n;

const PRESETS = [ReservedPresetNames.Playback, ReservedPresetNames.Img, ReservedPresetNames.MiniAudioUI];

class Download extends BasePlugin {
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

  private componentDisposers: Array<() => void> = [];
  private downloadPluginManager: DownloadPluginManager;
  private _pluginButtonRef: HTMLButtonElement | null = null;
  public triggeredByKeyboard = false;
  private store: any;

  constructor(name: string, public player: KalturaPlayer, config: DownloadConfig) {
    super(name, player, config);
    this.downloadPluginManager = new DownloadPluginManager(this, this.config, this.logger, this.eventManager);
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

  private get audioPluginsManager(): {remove: (id: number) => null; add: (obj: object) => number} | null {
    return (this.player.getService('AudioPluginsManager') as {remove: () => null; add: (obj: object) => number}) || null;
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

  private injectOverlayComponents(downloadMetadatas: DownloadMetadata[]) {
    if (this.iconId > 0) {
      return;
    }

    if (this.store.getState().shell['activePresetName'] !== ReservedPresetNames.MiniAudioUI) {
      this.iconId = this.upperBarManager.add({
        ariaLabel: (<Text id="download.download">Download</Text>) as never,
        displayName: 'Download',
        order: 40,
        svgIcon: {
          path: DOWNLOAD
        },
        onClick: this._handleClick as any,
        component: () => {
          return (<DownloadOverlayButton setRef={this._setPluginButtonRef} />) as any;
        },
        presets: PRESETS.filter(presetName => presetName !== ReservedPresetNames.MiniAudioUI)
      }) as number;
    } else {
      const {displayName, svgIcon} = this;
      if (this.audioPluginsManager) {
        this.audioPlayerIconId = this.audioPluginsManager.add({displayName, svgIcon, onClick: () => this.open()});
      }
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
              downloadMetadatas={downloadMetadatas}
            />
          );
        }
      })
    );
  }

  public isEntrySupported(downloadMetadata: DownloadMetadata): boolean {
    if (!downloadMetadata) {
      return false;
    }
    const {flavors, captions, attachments, imageDownloadUrl} = downloadMetadata;
    const {displayCaptions, displayAttachments, displaySources} = this.downloadPluginManager.downloadPlugin.config;
    return (
      (displaySources && (flavors.length > 0 || Boolean(imageDownloadUrl))) ||
      (displayCaptions && captions.length > 0) ||
      (displayAttachments && attachments.length > 0)
    );
  }

  async loadMedia() {
    await this.ready;

    this.downloadPluginManager.setShowOverlay(false, false);
    const downloadMetadatas = await this.downloadPluginManager.getDownloadMetadatas(true);
    const filteredMetadatas = downloadMetadatas.filter(downloadMetadata => {
      const isEntrySupported = this.isEntrySupported(downloadMetadata);
      if (!isEntrySupported) {
        this.logger.debug('Download not supported for current metadata', downloadMetadata);
      }
      return isEntrySupported;
    });
    if (filteredMetadatas.length) {
      this.logger.debug('Download is supported for current entry');
      this.injectOverlayComponents(filteredMetadatas);
    }
  }

  _addBindings() {
    this.eventManager.listen(this.downloadPluginManager, DownloadEvent.SHOW_OVERLAY, (e: FakeEvent) =>
      this.dispatchEvent(DownloadEvent.SHOW_OVERLAY, e.payload)
    );
    this.eventManager?.listen(this.downloadPluginManager, DownloadEvent.HIDE_OVERLAY, (e: FakeEvent) =>
      this.dispatchEvent(DownloadEvent.HIDE_OVERLAY, e.payload)
    );
  }

  reset() {
    this.upperBarManager?.remove(this.iconId);
    this.audioPluginsManager?.remove(this.audioPlayerIconId);
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
