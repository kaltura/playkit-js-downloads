import {DownloadPluginManager} from '../../download-plugin-manager';
import {KalturaFlavorAsset} from '../../providers';
import {DownloadItem} from '../download-item';
import * as styles from './sources-list.scss';
import {DownloadConfig} from '../../types';
import {ExpandableContainer} from '../expandable-container';
import {ComponentChildren} from 'preact';
import {Icon as CommonIcon} from '@playkit-js/common/dist/icon';
import {assetType} from '../../consts/asset-type';
const {Icon, IconType} = KalturaPlayer.ui.components;

const {withText} = KalturaPlayer.ui.preacti18n;

interface SourcesListProps {
  flavors: Array<KalturaFlavorAsset>;
  imageUrl: string;
  downloadPluginManager: DownloadPluginManager;
  downloadConfig: DownloadConfig;
  fileName: string;
  displayFlavors: boolean;
  selectQualityLabel?: string;
  downloadVideoButtonLabel?: string;
  hideLabel?: string;
  sourceLabel?: string;
}

const HeightResolution = {
  HD: 1080,
  UHD_4K: 2160
};

const RESOLUTION_4K = '4K';
const RESOLUTION_HD = 'HD';

export const SourcesList = withText({
  selectQualityLabel: 'download.select_quality_label',
  hideLabel: 'download.hide_label',
  sourceLabel: 'download.source_label',
  downloadVideoButtonLabel: 'download.download_button_label_video'
})(
  ({
    flavors,
    imageUrl,
    downloadPluginManager,
    downloadConfig,
    fileName,
    displayFlavors,
    selectQualityLabel,
    downloadVideoButtonLabel,
    hideLabel,
    sourceLabel
  }: SourcesListProps) => {
    let defaultFlavor: KalturaFlavorAsset | undefined;

    const _setDefaultFlavor = () => {
      if (flavors.length > 0) {
        const {flavorId, flavorParamId} = downloadConfig;
        defaultFlavor = flavors.find(flavor => {
          return flavor.id === flavorId || flavor.flavorParamsId.toString() === flavorParamId;
        });
        if (!defaultFlavor) {
          flavors.find(flavor => {
            return flavor.isOriginal || flavor.flavorParamsId === 0;
          });
        }
        if (!defaultFlavor) {
          defaultFlavor = flavors[0];
        }
      }
    };

    _setDefaultFlavor();

    const _buildSourceDescription = (flavor: KalturaFlavorAsset): string => {
      // flavor.height - 0 = audio file
      if (flavor.height === 0) {
        return flavor.language !== 'Undefined' ? flavor.language : '';
      }
      let flavorDescription = `${flavor.height}p`;
      if (flavor.height >= HeightResolution.UHD_4K) {
        flavorDescription += ` ${RESOLUTION_4K}`;
      } else if (flavor.height >= HeightResolution.HD) {
        flavorDescription += ` ${RESOLUTION_HD}`;
      }
      if (flavor.isOriginal || flavor.flavorParamsId === 0) {
        return `${sourceLabel} (${flavorDescription})`;
      }
      return flavorDescription;
    };

    const _getPlayIcon = (flavor: KalturaFlavorAsset): ComponentChildren => {
      return <Icon id="download-file-play" type={flavor.height > 0 ? IconType.Play : IconType.Audio} viewBox={`0 0 32 32`} />;
    };

    const _getImageIcon = (): ComponentChildren => {
      return <CommonIcon name={'image'} />;
    };

    const _renderDownloadItem = (
      key: string,
      fileName: string,
      description: string,
      downloadUrl: string,
      icon: ComponentChildren,
      isDefault = false,
      downloadVideoButtonLabel: string
    ) => {
      return (
        <DownloadItem
          downloadPluginManager={downloadPluginManager}
          key={key}
          fileName={fileName}
          description={description}
          downloadUrl={downloadUrl}
          iconFileType={icon}
          assetType={assetType.Media}
          isDefault={isDefault}
          downloadButtonLabel={downloadVideoButtonLabel}
        />
      );
    };

    const _renderFlavor = (flavor: KalturaFlavorAsset, isDefault = false) => {
      return _renderDownloadItem(
        flavor.id,
        `${fileName}.${flavor.fileExt}`,
        _buildSourceDescription(flavor),
        flavor.downloadUrl,
        _getPlayIcon(flavor),
        isDefault,
        downloadVideoButtonLabel!
      );
    };

    const _renderFlavors = (flavors: Array<KalturaFlavorAsset>) => {
      return flavors.map((flavor: KalturaFlavorAsset) => {
        if (flavor.height > 0 && flavor.downloadUrl && flavor.id !== defaultFlavor?.id) {
          return _renderFlavor(flavor);
        }
      });
    };

    const _renderExpandableFlavors = () => {
      if (flavors.length > 1 && displayFlavors) {
        return (
          <ExpandableContainer
            defaultItem={_renderFlavor(defaultFlavor!, true)}
            restOfItems={_renderFlavors(flavors)}
            showMoreLabel={selectQualityLabel!}
            showLessLabel={hideLabel!}
          />
        );
      }
      return _renderFlavor(defaultFlavor!);
    };

    const _renderSources = () => {
      if (imageUrl) {
        return _renderDownloadItem('1', fileName, '', imageUrl, _getImageIcon(), true, downloadVideoButtonLabel!);
      } else if (flavors.length > 0) {
        return _renderExpandableFlavors();
      }
      return undefined;
    };

    return (
      <div className={styles.sourcesContainer} data-testid={'download-overlay-sources-container'}>
        {_renderSources()}
      </div>
    );
  }
);
