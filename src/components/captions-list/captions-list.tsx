import {DownloadPluginManager} from '../../download-plugin-manager';
import {KalturaCaptionAsset} from '../../providers';
import {DownloadItem} from '../download-item';
import * as styles from './captions-list.scss';
import {ExpandableContainer} from '../expandable-container';
import {Icon as CommonIcon} from '@playkit-js/common/dist/icon';

const {withText} = KalturaPlayer.ui.preacti18n;

interface CaptionsListProps {
  captions: Array<KalturaCaptionAsset>;
  downloadPluginManager: DownloadPluginManager;
  fileName: string;
  moreCaptionsLabel?: string;
  lessCaptionsLabel?: string;
}

export const CaptionsList = withText({
  moreCaptionsLabel: 'download.more_captions_label',
  lessCaptionsLabel: 'download.less_captions_label'
})(({captions, downloadPluginManager, fileName, moreCaptionsLabel, lessCaptionsLabel}: CaptionsListProps) => {
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

  const _renderDownloadItem = (key: string, fileName: string, languageLabel: string, downloadUrl: string) => {
    return (
      <DownloadItem
        downloadPluginManager={downloadPluginManager}
        key={key}
        fileName={fileName}
        description={languageLabel}
        downloadUrl={downloadUrl}
        assetType={"Captions"}
        iconFileType={<CommonIcon name={'closedCaptions'} />}
      />
    );
  };

  const _renderCaption = (caption: KalturaCaptionAsset) => {
    return _renderDownloadItem(caption.id, _buildFileName(caption), caption.label, caption.downloadUrl);
  };

  const _renderCaptions = (captions: Array<KalturaCaptionAsset>) => {
    return captions.map((caption: KalturaCaptionAsset) => {
      if (!caption.isDefault || caption.id !== defaultCaptions?.id) {
        return _renderCaption(caption);
      }
    });
  };

  const _renderExpandableCaptions = () => {
    return (
      <ExpandableContainer
        defaultItem={_renderCaption(defaultCaptions!)}
        restOfItems={_renderCaptions(captions)}
        showMoreLabel={moreCaptionsLabel!}
        showLessLabel={lessCaptionsLabel!}
      />
    );
  };

  return (
    <div className={styles.captionsContainer} data-testid={'download-overlay-captions-container'}>
      {captions.length > 1 ? _renderExpandableCaptions() : _renderCaption(defaultCaptions!)}
    </div>
  );
});
