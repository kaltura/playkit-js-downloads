import {Download} from './download';

declare let __VERSION__: string;
declare let __NAME__: string;

const VERSION = __VERSION__;
const NAME = __NAME__;

export {Download as Plugin};
export {VERSION, NAME};

const pluginName = 'download';

KalturaPlayer.core.registerPlugin(pluginName, Download);
