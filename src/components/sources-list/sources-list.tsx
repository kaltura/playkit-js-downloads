import {DownloadPluginManager} from '../../download-plugin-manager';
import {KalturaFlavorAsset} from '../../providers';
import {DownloadItem} from '../download-item';
import * as styles from './sources-list.scss';
import {DownloadConfig} from '../../types';
import {ExpandableContainer} from '../expandable-container';
import {ComponentChildren} from 'preact';
import {Icon as CommonIcon} from '@playkit-js/common/dist/icon';
import {assetType} from '../../consts/asset-type';
import {AssetsListProps} from '../../types/assets-list-props';
const {Icon, IconType} = KalturaPlayer.ui.components;

const {withText} = KalturaPlayer.ui.preacti18n;

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
        // TODO: replace with <CommonIcon name={'audio'} />;
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M10.5 4.5C10.5 3.67157 11.1716 3 12 3C12.8284 3 13.5 3.67157 13.5 4.5V19.5C13.5 20.3284 12.8284 21 12 21C11.1716 21 10.5 20.3284 10.5 19.5V4.5ZM4.5 9C4.5 8.17157 5.17157 7.5 6 7.5C6.82843 7.5 7.5 8.17157 7.5 9V15C7.5 15.8284 6.82843 16.5 6 16.5C5.17157 16.5 4.5 15.8284 4.5 15V9ZM18 7.5C17.1716 7.5 16.5 8.17157 16.5 9V15C16.5 15.8284 17.1716 16.5 18 16.5C18.8284 16.5 19.5 15.8284 19.5 15V9C19.5 8.17157 18.8284 7.5 18 7.5Z"
              fill="white"
            />
          </svg>
        );
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
