import {h} from 'preact';
import {DownloadPluginManager} from '../../download-plugin-manager';
import {KalturaCaptionAsset} from '../../providers';
import {DownloadItem} from '../download-item';
import * as styles from './captions-list.scss';
import {ExpandableContainer} from '../expandable-container';
import {Icon as CommonIcon} from '@playkit-js/common/dist/icon';
import {assetType} from '../../consts/asset-type';
import {AssetsListProps} from '../../types/assets-list-props';
import {ui} from '@playkit-js/kaltura-player-js';

const {withText} = ui.preacti18n;

interface CaptionsListProps extends AssetsListProps {
  files: KalturaCaptionAsset[];
  downloadPluginManager: DownloadPluginManager;
  shouldFocus: boolean;
  fileName: string;
  moreCaptionsLabel?: string;
  lessCaptionsLabel?: string;
  ariaLabel?: string;
  title?: string;
}

export const CaptionsList = withText({
  moreCaptionsLabel: 'download.more_captions_label',
  lessCaptionsLabel: 'download.less_captions_label',
  ariaLabel: 'download.download_button_label_captions'
})(({files, downloadPluginManager, shouldFocus, fileName, moreCaptionsLabel, lessCaptionsLabel, ariaLabel, title}: CaptionsListProps) => {
  const captions: KalturaCaptionAsset[] = files;
  let defaultCaptions: KalturaCaptionAsset | undefined;

  const _setDefaultCaption = () => {
    if (captions.length > 0) {
      defaultCaptions = captions.find(captions => captions.isDefault);
      if (!defaultCaptions) {
        defaultCaptions = captions[0];
      }
    }
  };

  _setDefaultCaption();

  const _buildFileName = (caption: KalturaCaptionAsset) => {
    return `${fileName}.${caption.fileExt}`;
  };

  const _renderDownloadItem = (
    key: string,
    fileName: string,
    languageLabel: string,
    downloadUrl: string,
    ariaLabel: string,
    shouldFocusItem: boolean
  ) => {
    return (
      <DownloadItem
        downloadPluginManager={downloadPluginManager}
        key={key}
        fileName={fileName}
        description={languageLabel}
        downloadUrl={downloadUrl}
        assetType={assetType.Captions}
        iconFileType={<CommonIcon name={'closedCaptions'} />}
        ariaLabel={ariaLabel}
        shouldFocus={shouldFocusItem}
      />
    );
  };

  const _renderCaption = (caption: KalturaCaptionAsset, firstItemInList?: boolean) => {
    const shouldFocusItem = !!(shouldFocus && firstItemInList);
    return _renderDownloadItem(caption.id, _buildFileName(caption), caption.label, caption.downloadUrl, ariaLabel!, shouldFocusItem);
  };

  const _renderCaptions = (captions: Array<KalturaCaptionAsset>) => {
    return captions.map((caption: KalturaCaptionAsset) => {
      if (!caption.isDefault && caption.id !== defaultCaptions?.id && caption.downloadUrl) {
        return _renderCaption(caption);
      }
    });
  };

  const _renderExpandableCaptions = () => {
    return (
      <ExpandableContainer
        defaultItem={_renderCaption(defaultCaptions!, true)}
        restOfItems={_renderCaptions(captions)}
        showMoreLabel={moreCaptionsLabel!}
        showLessLabel={lessCaptionsLabel!}
      />
    );
  };

  return (
    <div className={styles.captionsContainer} data-testid={'download-overlay-captions-container'}>
      {title ? <div className={styles.captionsLabel}>{title}</div> : null}
      {captions.length > 1 ? _renderExpandableCaptions() : _renderCaption(defaultCaptions!, true)}
    </div>
  );
});
