interface DownloadConfig {
  flavorId: string | null;
  flavorParamId: string | null;
  preDownloadHook: (() => void) | null;
  displayAttachments: boolean;
  displayFlavors: boolean;
  displayCaptions: boolean;
}

export {DownloadConfig};
