import {DownloadPluginManager} from '../../download-plugin-manager';
import {KalturaFlavorAsset} from '../../providers';
import {DownloadItem} from '../download-item';
import * as styles from './sources-list.scss';
import {DownloadConfig} from '../../types';
import {ExpandableContainer} from '../expandable-container';
import {ComponentChildren} from 'preact';
import {Icon as CommonIcon} from '@playkit-js/common/dist/icon';
const {Icon, IconType} = KalturaPlayer.ui.components;

const {withText} = KalturaPlayer.ui.preacti18n;

interface SourcesListProps {
  flavors: Array<KalturaFlavorAsset>;
  imageUrl: string;
  downloadPluginManager: DownloadPluginManager;
  downloadConfig: DownloadConfig;
  fileName: string;
  displayFlavors: boolean;
  moreFlavorsLabel?: string;
  lessFlavorsLabel?: string;
  sourceLabel?: string;
}

const HeightResolution = {
  HD: 1080,
  UHD_4K: 2160
};

const RESOLUTION_4K = '4K';
const RESOLUTION_HD = 'HD';

export const SourcesList = withText({
  moreFlavorsLabel: 'download.more_flavors_label',
  lessFlavorsLabel: 'download.less_flavors_label',
  sourceLabel: 'download.source_label'
})(
  ({
    flavors,
    imageUrl,
    downloadPluginManager,
    downloadConfig,
    fileName,
    displayFlavors,
    moreFlavorsLabel,
    lessFlavorsLabel,
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
            return flavor.flavorParamsId === 0 || flavor.isOriginal;
          });
        }
        if (!defaultFlavor) {
          defaultFlavor = flavors[0];
        }
      }
    };

    _setDefaultFlavor();

    const _buildSourceDescription = (flavor: KalturaFlavorAsset): string => {
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

    const _getPlayIcon = (): ComponentChildren => {
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
      isDefault = false
    ) => {
      return (
        <DownloadItem
          downloadPluginManager={downloadPluginManager}
          key={key}
          fileName={fileName}
          description={description}
          downloadUrl={downloadUrl}
          iconFileType={icon}
          isDefault={isDefault}
        />
      );
    };

    const _renderFlavor = (flavor: KalturaFlavorAsset, isDefault = false) => {
      return _renderDownloadItem(
        flavor.id,
        `${fileName}.${flavor.fileExt}`,
        _buildSourceDescription(flavor),
        flavor.downloadUrl,
        _getPlayIcon(),
        isDefault
      );
    };

    const _renderFlavors = (flavors: Array<KalturaFlavorAsset>) => {
      return flavors.map((flavor: KalturaFlavorAsset) => {
        if (flavor.id !== defaultFlavor?.id) {
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
            showMoreLabel={moreFlavorsLabel!}
            showLessLabel={lessFlavorsLabel!}
          />
        );
      }
      return _renderFlavor(defaultFlavor!);
    };

    return (
      <div className={styles.sourcesContainer} data-testid={'download-overlay-sources-container'}>
        {flavors.length > 0 ? _renderExpandableFlavors() : _renderDownloadItem('1', fileName, '', imageUrl, _getImageIcon(), true)}
      </div>
    );
  }
);
