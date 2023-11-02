# PlayKit JS Download - Download plugin for the [PlayKit JS Player]

[![Build Status](https://github.com/kaltura/playkit-js-downloads/actions/workflows/run_canary.yaml/badge.svg)](https://github.com/kaltura/playkit-js-downloads/actions/workflows/run_canary.yaml)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![](https://img.shields.io/npm/v/@playkit-js/playkit-js-downloads/latest.svg)](https://www.npmjs.com/package/@playkit-js/playkit-js-downloads)
[![](https://img.shields.io/npm/v/@playkit-js/playkit-js-downloads/canary.svg)](https://www.npmjs.com/package/@playkit-js/playkit-js-downloads/v/canary)

This plugin enables video, image and files download for a media entry which is hosted by Kaltura.
The plugin has the following configuration parameters:
- **flavorId** - A specific video flavor of a specific entry. You can use KMC to view the flavor ids for a specific entry. 
- **flavorParamId** - The type of flavor to be downloaded. The available flavor types for an environment can be fetched using the [getFlavorAssetsWithParams] API.
- **preDownloadHook** - A callback function to be called after a user has clicked the download button and before the download starts.
- **displayFlavors** - A flag indicating whether to display flavors to download. optional- default is true. if set to false then only the configured/default source will be available for download.
- **displayCaptions** - A flag indicating whether to display captions of the media to download. optional- default is true. 
- **displayAttachments** - A flag indicating whether to display attachments of the media to download. optional- default is true.


[getFlavorAssetsWithParams]: https://developer.kaltura.com/api-docs/service/flavorAsset/action/getFlavorAssetsWithParams

You can see the available flavor ids for an entry in KMC, and their matching 
If no flavor is selected, a default flavor would be downloaded.

PlayKit JS Download is written in [ECMAScript6], statically analysed using [Typescript] and transpiled in ECMAScript5 using [Babel].

[typescript]: https://www.typescriptlang.org/
[ecmascript6]: https://github.com/ericdouglas/ES6-Learning#articles--tutorials
[babel]: https://babeljs.io

## Getting Started

### Prerequisites

The plugin requires [Kaltura Player] and [playkit-ui-managers] to be loaded first.

[kaltura player]: https://github.com/kaltura/kaltura-player-js
[playkit-ui-managers]: https://github.com/kaltura/playkit-js-ui-managers

### Installing

First, clone and run [yarn] to install dependencies:

[yarn]: https://yarnpkg.com/lang/en/

```
git clone https://github.com/kaltura/playkit-js-downloads.git
cd playkit-js-downloads
yarn install
```

### Building

Then, build the plugin

```javascript
yarn run build
```

### Embed the library in your test page

Finally, add the bundle as a script tag in your page, and initialize the player

```html
<!--Kaltura player-->
<script type="text/javascript" src="/PATH/TO/FILE/kaltura-player.js"></script>
<!--Playkit ui managers plugin -->
<script type="text/javascript" src="/PATH/TO/FILE/playkit-ui-manager.js"></script>
<!--PlayKit download plugin-->
<script type="text/javascript" src="/PATH/TO/FILE/playkit-downloads.js"></script>
<div id="player-placeholder" style="height:360px; width:640px">
  <script type="text/javascript">
    var playerContainer = document.querySelector("#player-placeholder");
    var config = {
     ...
     targetId: 'player-placeholder',
     plugins: {
       uiManagers: {},
       download: {
        flavorParamId: null, // id of the flavor type to be downloaded. optional.
        flavorId: null, // id of the specific flavor type for a specific entry. optional.
        preDownloadHook: null // function to be called before download is initiated. optional.
       }
     },
     ui: {
      translations: { // for local development
        en: {
          download: {
            download: "Download",
            downloads: "Downloads",
            "download_has_started": "Download has started",
            "download_has_failed": "Download has failed"
          }
        }
      }
    }
     ...
    };
    var player = KalturaPlayer.setup(config);
    player.loadMedia(...);
  </script>
</div>
```

#### Configuation Example

* You may enable the download plugin just by adding it without any specific plugin config to the plugins config section or also add your own preferred config

```
plugins: {
  download: {}
}
```

```
plugins: {
  download: {
    flavorParamId: null, // id of the flavor type to be downloaded. optional.
    flavorId: null, // id of the specific flavor type for a specific entry. optional.
    preDownloadHook: null, // function to be called before download is initiated. optional.
    displayFlavors: boolean, // a flag indicating whether to display flavors to download. optional. default is true.
    displayCaptions: boolean, // a flag indicating whether to display captions to download. optional. default is true.
    displayAttachments: boolean // a flag indicating whether to display attachments to download. optional. default is true.
  }
}
```

### And coding style tests

We use ESLint [recommended set](http://eslint.org/docs/rules/) with some additions for enforcing [Flow] types and other rules.

See [ESLint config](.eslintrc.json) for full configuration.

We also use [.editorconfig](.editorconfig) to maintain consistent coding styles and settings, please make sure you comply with the styling.

## Compatibility

TBD

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/kaltura/playkit-js-download/tags).

## License

This project is licensed under the AGPL-3.0 License - see the [LICENSE.md](LICENSE.md) file for details
