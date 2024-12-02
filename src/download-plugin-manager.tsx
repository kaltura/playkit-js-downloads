import {h} from 'preact';
import {core, ui} from '@playkit-js/kaltura-player-js';

import {Download} from './download';
import {KalturaAttachmentAsset} from './providers';
import {DOWNLOAD, ERROR} from './icons';
import {DownloadService} from './services';
import {DownloadConfig, DownloadMetadata} from './types';
import {DownloadEvent} from './event';

const {Icon} = ui.components;
const {FakeEvent} = core;

class DownloadPluginManager extends core.FakeEventTarget {
  private _showOverlay = false;
  private downloadService: DownloadService;
  private downloadMetadatas: DownloadMetadata[] = [null];
  private playOnClose = false;

  constructor(public downloadPlugin: Download, private _config: DownloadConfig, private _logger: any, private _eventManager: core.EventManager) {
    super();
    this.downloadService = new DownloadService(this.downloadPlugin.player, this._logger, this._eventManager);
  }

  get config(): DownloadConfig {
    return this._config;
  }

  isMetadataEmpty(metadata: DownloadMetadata): boolean {
    return metadata === null;
  }

  isMetadatasEmpty(): boolean {
    return this.downloadMetadatas.every(this.isMetadataEmpty);
  }

  async getDownloadMetadatas(refresh = false): Promise<DownloadMetadata[]> {
    if (this.isMetadatasEmpty() || refresh) {
      this.downloadMetadatas = await this.downloadService.getDownloadMetadatas();

      if (this.isMetadatasEmpty()) {
        this._logger.debug('Failed to get download url headers');
      } else {
        this.downloadMetadatas
          .filter(downloadMetadata => !this.isMetadataEmpty(downloadMetadata))
          .forEach(downloadMetadata => {
            downloadMetadata!.attachments = downloadMetadata!.attachments.filter(
              (attachment: KalturaAttachmentAsset): boolean => !this.config.undisplayedAttachments.includes(attachment.objectType)
            );
          });
      }
    }
    return this.downloadMetadatas;
  }

  downloadFile(downloadUrl: string, fileName: string) {
    try {
      const {preDownloadHook} = this.config;
      if (typeof preDownloadHook === 'function') {
        preDownloadHook();
      }
    } catch (e) {
      this._logger.debug('Exception in pre-download hook');
    }

    this.downloadService.downloadFile(downloadUrl, fileName);
  }

  notifyDownloadStarted(title: string, text: string) {
    this.downloadPlugin.addToast({
      title,
      text,
      icon: <Icon id={`download-started-toast-icon`} path={DOWNLOAD} viewBox={`0 0 32 32`} />,
      severity: 'Success'
    });
  }

  notifyDownloadFailed(title: string, text: string) {
    this.downloadPlugin.addToast({
      title,
      text,
      icon: <Icon id={`download-failed-toast-icon`} path={ERROR} viewBox={`0 0 16 16`} />,
      severity: 'Error'
    });
  }

  setShowOverlay(overlayVisible: boolean, byUserInteraction = true): void {
    this._showOverlay = overlayVisible;

    if (this._showOverlay) {
      document.getElementById(this.downloadPlugin.player.config.targetId as string)?.classList.add('download-overlay-active');
      if (!this.downloadPlugin.player.paused) {
        this.downloadPlugin.player.pause();
        this.playOnClose = true;
      }
      this.dispatchEvent(new FakeEvent(DownloadEvent.SHOW_OVERLAY, {byKeyboard: this.downloadPlugin.triggeredByKeyboard}));
    } else {
      document.getElementById(this.downloadPlugin.player.config.targetId as string)?.classList.remove('download-overlay-active');

      if (this.playOnClose) {
        this.downloadPlugin.player.play();
        this.playOnClose = false;
      }
      if (byUserInteraction) {
        this.dispatchEvent(new FakeEvent(DownloadEvent.HIDE_OVERLAY));
      }
    }
  }

  get showOverlay() {
    return this._showOverlay;
  }
}

export {DownloadPluginManager};
