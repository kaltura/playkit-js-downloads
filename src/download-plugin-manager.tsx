const {Icon} = KalturaPlayer.ui.components;

import {ToastSeverity} from '@playkit-js/common';
import {Download} from './download';
import {DOWNLOAD, ERROR} from './icons';
import {DownloadService} from './services';
import {DownloadMetadata} from './types';
import {DownloadInternalEvent} from './event';

class DownloadPluginManager extends KalturaPlayer.core.FakeEventTarget {
  private _showOverlay = false;
  private downloadService: any;
  private downloadMetadata: DownloadMetadata = null;
  private playOnClose = false;

  constructor(public downloadPlugin: Download) {
    super();
    this.downloadService = new DownloadService(downloadPlugin.player, downloadPlugin.logger);
  }

  async getDownloadMetadata(refresh = false): Promise<DownloadMetadata> {
    if (!this.downloadMetadata || refresh) {
      this.downloadMetadata = await this.downloadService.getDownloadMetadata(this.downloadPlugin.config);

      if (!this.downloadMetadata) {
        this.downloadPlugin.logger.debug('Failed to get download url headers');
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
    } catch (e: any) {
      this.downloadPlugin.logger.debug('Exception in pre-download hook');
    }

    this.downloadService.downloadFile(downloadUrl, fileName);
  }

  notifyDownloadStarted(title: string, text: string) {
    this.downloadPlugin.addToast({
      title,
      text,
      icon: <Icon id={`download-started-toast-icon`} path={DOWNLOAD} viewBox={`0 0 32 32`} />,
      severity: ToastSeverity.Success
    });
  }

  notifyDownloadFailed(title: string, text: string) {
    this.downloadPlugin.addToast({
      title,
      text,
      icon: <Icon id={`download-failed-toast-icon`} path={ERROR} viewBox={`0 0 16 16`} />,
      severity: ToastSeverity.Error
    });
  }

  set showOverlay(overlayVisible: boolean) {
    this._showOverlay = overlayVisible;

    if (this._showOverlay) {
      if (!this.downloadPlugin.player.paused) {
        this.downloadPlugin.player.pause();
        this.playOnClose = true;
      }
      this.dispatchEvent(new KalturaPlayer.core.FakeEvent(DownloadInternalEvent.SHOW_OVERLAY, {byKeyboard: this.downloadPlugin.triggeredByKeyboard}));
    } else {
      if (this.playOnClose) {
        this.downloadPlugin.player.play();
        this.playOnClose = false;
      }
      this.dispatchEvent(new KalturaPlayer.core.FakeEvent(DownloadInternalEvent.HIDE_OVERLAY));
    }
  }

  get showOverlay() {
    return this._showOverlay;
  }
}

export {DownloadPluginManager};
