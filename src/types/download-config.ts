interface DownloadConfig {
  flavorId: string | null;
  flavorParamId: string | null;
  preDownloadHook: (() => void) | null;
}

export {DownloadConfig};
