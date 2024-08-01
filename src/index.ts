import {Download} from './download';
import {registerPlugin} from '@playkit-js/kaltura-player-js';

declare let __VERSION__: string;
declare let __NAME__: string;

const VERSION = __VERSION__;
const NAME = __NAME__;

export {Download as Plugin};
export {VERSION, NAME};

export const pluginName = 'download';
export {DownloadEvent} from './event';

registerPlugin(pluginName, Download);
