import { OVERLAY } from "icons/icons";

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
  closeText: 'overlay.downloads'
})(({onClick, closeText}: {onClick: () => void; closeText: string}) => {
  return (
    <div>
      <Tooltip label={closeText}>
        <button aria-label={closeText} tabIndex={0} className={`${KalturaPlayer.ui.style.controlButton}`} onClick={onClick}>
          <Icon id={`download-overlay-icon`} path={OVERLAY} viewBox={`0 0 32 32`} />
        </button>
      </Tooltip>
    </div>
  );
});

export {DownloadOverlayButton};