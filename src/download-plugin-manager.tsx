import {h} from 'preact';
import {KalturaAttachmentAsset} from './providers';

import {core, ui} from '@playkit-js/kaltura-player-js';
const {Icon} = ui.components;
const {FakeEvent} = core;

import {Download} from './download';
import {DOWNLOAD, ERROR} from './icons';
import {DownloadService} from './services';
import {DownloadMetadata} from './types';
import {DownloadEvent} from './event';

class DownloadPluginManager extends core.FakeEventTarget {
  private _showOverlay = false;
  private downloadService: any;
  private downloadMetadata: DownloadMetadata = null;
  private playOnClose = false;

  constructor(public downloadPlugin: Download) {
    super();
    // @ts-expect-error - Property 'player' is protected and only accessible within class 'BasePlugin' and its subclasses.
    this.downloadService = new DownloadService(downloadPlugin.player, downloadPlugin.logger);
  }

  async getDownloadMetadata(refresh = false): Promise<DownloadMetadata> {
    if (!this.downloadMetadata || refresh) {
      // @ts-expect-error - Property 'config' is protected and only accessible within class 'BasePlugin' and its subclasses.
      this.downloadMetadata = await this.downloadService.getDownloadMetadata(this.downloadPlugin.config);

      if (!this.downloadMetadata) {
        // @ts-expect-error - Property 'logger' is protected and only accessible within class 'BasePlugin' and its subclasses.
        this.downloadPlugin.logger.debug('Failed to get download url headers');
      } else {
        this.downloadMetadata.attachments = this.downloadMetadata.attachments.filter(
          // @ts-expect-error - Property 'config' is protected and only accessible within class 'BasePlugin' and its subclasses.
          (attachment: KalturaAttachmentAsset): boolean => !this.downloadPlugin.config.undisplayedAttachments.includes(attachment.objectType)
        );
      }
    }
    return this.downloadMetadata;
  }

  downloadFile(downloadUrl: string, fileName: string) {
    try {
      // @ts-expect-error - Property 'config' is protected and only accessible within class 'BasePlugin' and its subclasses.
      const {preDownloadHook} = this.downloadPlugin.config;
      if (typeof preDownloadHook === 'function') {
        preDownloadHook();
      }
    } catch (e) {
      // @ts-expect-error - Property 'logger' is protected and only accessible within class 'BasePlugin' and its subclasses.
      this.downloadPlugin.logger.debug('Exception in pre-download hook');
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
      // @ts-expect-error - Property 'player' is protected and only accessible within class 'BasePlugin' and its subclasses.
      document.getElementById(this.downloadPlugin.player.config.targetId as string)?.classList.add('download-overlay-active');
      // @ts-expect-error - Property 'player' is protected and only accessible within class 'BasePlugin' and its subclasses.
      if (!this.downloadPlugin.player.paused) {
        // @ts-expect-error - Property 'player' is protected and only accessible within class 'BasePlugin' and its subclasses.
        this.downloadPlugin.player.pause();
        this.playOnClose = true;
      }
      this.dispatchEvent(new FakeEvent(DownloadEvent.SHOW_OVERLAY, {byKeyboard: this.downloadPlugin.triggeredByKeyboard}));
    } else {
      // @ts-expect-error - Property 'player' is protected and only accessible within class 'BasePlugin' and its subclasses.
      document.getElementById(this.downloadPlugin.player.config.targetId as string)?.classList.remove('download-overlay-active');

      if (this.playOnClose) {
        // @ts-expect-error - Property 'player' is protected and only accessible within class 'BasePlugin' and its subclasses.
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
