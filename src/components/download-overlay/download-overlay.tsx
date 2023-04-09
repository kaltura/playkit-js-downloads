import {Button, ButtonType, ButtonSize} from '@playkit-js/common';
import { DownloadPluginManager } from 'download-plugin-manager';

import {useState, useEffect} from 'preact/hooks';
import { DownloadMetadata } from 'types';

const {withEventManager} = KalturaPlayer.ui.Event;
const {Icon, IconType, PLAYER_SIZE} = KalturaPlayer.ui.components;
const {connect} = KalturaPlayer.ui.redux;

import * as styles from './download-overlay.scss';

interface DownloadOverlayProps {
    downloadPluginManager: DownloadPluginManager;
    eventManager: any;
    sizeClass?: string;
}

const mapStateToProps = (state: any) => {
    const {shell: {playerSize}} = state;
    let sizeClass = "";

    switch(playerSize) {
        case PLAYER_SIZE.EXTRA_LARGE:
        case PLAYER_SIZE.LARGE: {
            sizeClass = styles.large;
            break;
        } case PLAYER_SIZE.MEDIUM: {
            sizeClass = styles.medium;
            break;
        }
        case PLAYER_SIZE.SMALL:
        case PLAYER_SIZE.EXTRA_SMALL: {
            sizeClass = styles.small;
            break;
        } default: {
            break;
        }
    }

    return {
      sizeClass
    };
  };

const downloadFile = (downloadUrl: string) => {
    const aElement = document.createElement('a');
    aElement.href = downloadUrl;
    aElement.setAttribute('target', '_blank');
    aElement.click();
}

const DownloadOverlay = connect(mapStateToProps)(withEventManager(({downloadPluginManager, eventManager, sizeClass} : DownloadOverlayProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const [fileName, setFileName] = useState("");
    const [downloadUrl, setDownloadUrl] = useState("");

    useEffect(() => {
        eventManager?.listen(downloadPluginManager, "showoverlay", () => {
          setIsVisible(true);

          downloadPluginManager.getDownloadMetadata().then((downloadMetadata : DownloadMetadata) => {
            if (downloadMetadata) {
                setFileName(downloadMetadata.fileName);
                setDownloadUrl(downloadMetadata.downloadUrl);
            }
          });
        });

        eventManager?.listen(downloadPluginManager, "hideoverlay", () => {
            setIsVisible(false);
        });
      }, []);

    const TEMP_TEXT = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.";

    return isVisible ? (
        <div className={styles.downloadOverlay}>
            <div className={styles.header}>Downloads</div>
            <div className={styles.fileInfoList}>
                <div className={`${styles.fileInfo} ${sizeClass}`}>
                    <div className={`${styles.iconContainer} ${styles.playIcon}`}>
                        <Icon id="download-file-play" type={IconType.Play} viewBox={`0 0 32 32`}></Icon>
                    </div>
                    <div className={styles.fileInfoTextContainer}>
                        <div className={styles.fileInfoText}>
                            {TEMP_TEXT}
                        </div>
                    </div>
                    <div className={`${styles.iconContainer} ${styles.downloadIcon}`}>
                        <div>
                            <Button
                                type={ButtonType.borderless}
                                size={ButtonSize.medium}
                                disabled={false}
                                onClick={() => downloadFile(downloadUrl)}
                                tooltip={{label: 'Download', type: "bottom"}}
                                icon={'download'}>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <div>

            <div className={styles.closeButtonContainer}>
                <Button
                    type={ButtonType.borderless}
                    size={ButtonSize.medium}
                    disabled={false}
                    onClick={() => {
                        setIsVisible(false);
                        downloadPluginManager.showOverlay = false;
                    }}
                    tooltip={{label: 'Close'}}
                    icon={'close'}>
                </Button>
            </div>
            </div>
        </div>
        ) : <div></div>
}));

export {DownloadOverlay};