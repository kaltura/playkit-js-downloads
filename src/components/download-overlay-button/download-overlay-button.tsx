import {DOWNLOAD} from 'icons';

const {withText} = KalturaPlayer.ui.preacti18n;
const {Icon, Tooltip} = KalturaPlayer.ui.components;

/**
 * Button to toggle off related list visibility.
 *
 * @param {object} props Component props.
 * @param {Function} props.onClick onClick event handler.
 * @param {string} props.closeText Button label.
 */
const DownloadOverlayButton = withText({
  downloadLabel: 'download.downloads'
})(({onClick, downloadLabel}: {onClick: () => void; downloadLabel: string}) => {
  return (
    <div>
      <Tooltip label={downloadLabel}>
        <button aria-label={downloadLabel} tabIndex={0} className={`${KalturaPlayer.ui.style.controlButton}`} onClick={onClick}>
          <Icon id={`download-overlay-icon`} path={DOWNLOAD} viewBox={`0 0 32 32`} />
        </button>
      </Tooltip>
    </div>
  );
});

export {DownloadOverlayButton};
