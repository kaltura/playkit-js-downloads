import {h} from 'preact';
import {core, ui} from '@playkit-js/kaltura-player-js';

import {Download} from './download';
import {KalturaAttachmentAsset} from './providers';
import {DOWNLOAD, ERROR} from './icons';
import {DownloadService} from './services';
import {DownloadMetadata} from './types';
import {DownloadEvent} from './event';

const {Icon} = ui.components;
const {FakeEvent} = core;

class DownloadPluginManager extends core.FakeEventTarget {
  private _showOverlay = false;
  private downloadService: any;
  private downloadMetadata: DownloadMetadata = null;
  private playOnClose = false;

  constructor(public downloadPlugin: Download, public logger: any) {
    super();
    this.downloadService = new DownloadService(this.downloadPlugin.player, this.logger);
  }

  async getDownloadMetadata(refresh = false): Promise<DownloadMetadata> {
    if (!this.downloadMetadata || refresh) {
      this.downloadMetadata = await this.downloadService.getDownloadMetadata(this.downloadPlugin.config);

      if (!this.downloadMetadata) {
        this.logger.debug('Failed to get download url headers');
      } else {
        this.downloadMetadata.attachments = this.downloadMetadata.attachments.filter(
          (attachment: KalturaAttachmentAsset): boolean => !this.downloadPlugin.config.undisplayedAttachments.includes(attachment.objectType)
        );
      }
    }
    return this.downloadMetadata;
  }

  downloadFile(downloadUrl: string, fileName: string) {
    try {
      const {preDownloadHook} = this.downloadPlugin.config;
      if (typeof preDownloadHook === 'function') {
        preDownloadHook();
      }
    } catch (e) {
      this.logger.debug('Exception in pre-download hook');
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
