import {h} from 'preact';
import {DownloadPluginManager} from '../../download-plugin-manager';
import {DownloadItem} from '../download-item';
import * as styles from './summary-chapters-list.scss';
import {assetType} from '../../consts/asset-type';
import {AssetsListProps} from '../../types/assets-list-props';
import {Icon as CommonIcon} from '@playkit-js/common/dist/icon';

import {ui} from '@playkit-js/kaltura-player-js';

const {withText} = ui.preacti18n;

interface SummaryChaptersListProps extends AssetsListProps {
  downloadPluginManager: DownloadPluginManager;
  shouldFocus: boolean;
  fileName: string;
  title?: string;
  ariaLabel?: string;
}

export const SummaryChaptersList = withText({
  title: 'download.summary_chapters_label',
  ariaLabel: 'download.download_button_label_summary_chapters'
})(({downloadPluginManager, shouldFocus, fileName, title, ariaLabel}: SummaryChaptersListProps) => {
  return (
    <div className={styles.summaryChaptersContainer}>
      <div className={styles.summaryChaptersLabel}>{title}</div>
      <DownloadItem
        downloadPluginManager={downloadPluginManager}
        fileName={`${fileName}.pdf`}
        downloadUrl={''}
        assetType={assetType.SummaryAndChapters}
        iconFileType={<CommonIcon name="pdf" />}
        ariaLabel={ariaLabel}
        shouldFocus={shouldFocus}
      />
    </div>
  );
});
