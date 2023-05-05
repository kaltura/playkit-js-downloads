# PlayKit JS Download - Download plugin for the [PlayKit JS Player]

[![Build Status](https://github.com/kaltura/playkit-js-downloads/actions/workflows/run_canary_full_flow.yaml/badge.svg)](https://github.com/kaltura/playkit-js-downloads/actions/workflows/run_canary_full_flow.yaml)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![](https://img.shields.io/npm/v/@playkit-js/playkit-js-downloads/latest.svg)](https://www.npmjs.com/package/@playkit-js/playkit-js-downloads)
[![](https://img.shields.io/npm/v/@playkit-js/playkit-js-downloads/canary.svg)](https://www.npmjs.com/package/@playkit-js/playkit-js-downloads/v/canary)

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
git clone https://github.com/kaltura/playkit-js-download.git
cd playkit-js-download
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
<script type="text/javascript" src="/PATH/TO/FILE/playkit-download.js"></script>
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
