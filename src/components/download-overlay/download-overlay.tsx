import {Button, OnClickEvent, OnClick, ButtonType, ButtonSize} from '@playkit-js/common';
import { DownloadPluginManager } from 'download-plugin-manager';

import {useState, useEffect} from 'preact/hooks';
import { DownloadMetadata } from 'types';
const {withEventManager} = KalturaPlayer.ui.Event;

const {Icon, IconType} = KalturaPlayer.ui.components;

import * as styles from './download-overlay.scss';

interface DownloadOverlayProps {
    downloadPluginManager: DownloadPluginManager;
    eventManager: any;
}

const downloadFile = (downloadUrl: string) => {
    const aElement = document.createElement('a');
    aElement.href = downloadUrl;
    aElement.setAttribute('target', '_blank');
    aElement.click();
}

const DownloadOverlay = withEventManager(({downloadPluginManager, eventManager} : DownloadOverlayProps) => {
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

    return isVisible ? (
        <div className={styles.downloadOverlay}>
            <div className={styles.header}>Downloads</div>
            <div className={styles.fileInfoList}>
                <div className={styles.fileInfo}>
                    <div className={`${styles.iconContainer} ${styles.playIconContainer}`}>
                        <Icon id="download-file-play" type={IconType.Play} viewBox={`0 0 32 32`}></Icon>
                    </div>
                    <div className={styles.fileInfoTextContainer}>
                        <div className={styles.fileInfoText}>
                            AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
                        </div>
                    </div>
                    <div className={styles.iconContainer}>
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
});

export {DownloadOverlay};