interface DownloadConfig {
  flavorId: string | null;
  flavorParamId: string | null;
  preDownloadHook: (() => void) | null;
  displayAttachments: boolean;
  displayFlavors: boolean;
  displayCaptions: boolean;
  displaySources: boolean;
  undisplayedAttachments: string[]
}

export {DownloadConfig};
