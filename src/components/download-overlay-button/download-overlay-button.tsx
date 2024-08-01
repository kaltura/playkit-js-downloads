import {h} from 'preact';
import {DOWNLOAD} from '../../icons';
import {ui} from '@playkit-js/kaltura-player-js';

const {withText} = ui.preacti18n;
const {Icon, Tooltip} = ui.components;

/**
 * Button to toggle download overlay visibility.
 *
 * @param {object} props Component props.
 * @param {Function} props.onClick onClick event handler.
 * @param {string} props.downloadLabel Button label.
 */
const DownloadOverlayButton = withText({
  downloadLabel: 'download.download'
})(({downloadLabel, setRef}: {setRef: (ref: HTMLButtonElement | null) => void; downloadLabel: string}) => {
  return (
    <div data-testid="download-overlay-button">
      <Tooltip label={downloadLabel}>
        <button type="button" aria-label={downloadLabel} tabIndex={0} className={`${ui.style.upperBarIcon}`} ref={setRef}>
          <Icon id={`download-overlay-icon`} path={DOWNLOAD} viewBox={`0 0 32 32`} hidden="true" />
        </button>
      </Tooltip>
    </div>
  );
});

export {DownloadOverlayButton};
