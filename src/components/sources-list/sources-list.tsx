import {h, ComponentChildren} from 'preact';
import {DownloadPluginManager} from '../../download-plugin-manager';
import {KalturaFlavorAsset} from '../../providers';
import {DownloadItem} from '../download-item';
import * as styles from './sources-list.scss';
import {DownloadConfig} from '../../types';
import {ExpandableContainer} from '../expandable-container';
import {Icon as CommonIcon} from '@playkit-js/common/dist/icon';
import {assetType} from '../../consts/asset-type';
import {AssetsListProps} from '../../types/assets-list-props';
import {ui} from '@playkit-js/kaltura-player-js';

const {Icon, IconType} = ui.components;
const {withText} = ui.preacti18n;

interface SourcesListProps extends AssetsListProps {
  files: KalturaFlavorAsset[];
  imageUrl: string;
  downloadPluginManager: DownloadPluginManager;
  downloadConfig: DownloadConfig;
  fileName: string;
  displayFlavors: boolean;
  selectQualityLabel?: string;
  ariaLabel?: string;
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
  ariaLabel: 'download.download_button_label_video'
})(
  ({
    files,
    imageUrl,
    downloadPluginManager,
    downloadConfig,
    fileName,
    displayFlavors,
    selectQualityLabel,
    ariaLabel,
    hideLabel,
    sourceLabel
  }: SourcesListProps) => {
    const flavors = files;
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
      if (flavor.isAudio) {
        return flavor.language && flavor.language !== 'Undefined' ? flavor.language : '';
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
      if (flavor.isAudio) {
        return <CommonIcon name="audio" />;
      }
      return <Icon id="download-file-play" type={IconType.Play} viewBox={`0 0 32 32`} />;
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
      ariaLabel: string
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
          ariaLabel={ariaLabel}
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
        ariaLabel!
      );
    };

    const _renderFlavors = (flavors: Array<KalturaFlavorAsset>) => {
      return flavors.reduce((acc: Array<ComponentChildren>, curr: KalturaFlavorAsset) => {
        if (curr.downloadUrl && curr.id !== defaultFlavor?.id) {
          return [...acc, _renderFlavor(curr)];
        }
        return acc;
      }, []);
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
        return _renderDownloadItem('1', fileName, '', imageUrl, _getImageIcon(), true, ariaLabel!);
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
