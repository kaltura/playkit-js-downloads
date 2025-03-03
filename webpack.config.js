const webpack = require('webpack');
const path = require('path');
const packageData = require('./package.json');
const {insertStylesWithNonce} = require('@playkit-js/webpack-common');

const plugins = [
  new webpack.DefinePlugin({
    __VERSION__: JSON.stringify(packageData.version),
    __NAME__: JSON.stringify(packageData.name)
  })
];

module.exports = {
  target: 'web',
  context: `${__dirname}/src`,
  entry: {
    'playkit-downloads': './index.ts'
  },
  output: {
    path: `${__dirname}/dist`,
    filename: '[name].js',
    library: {
      name: ['KalturaPlayer', 'plugins', 'download'],
      umdNamedDefine: true,
      type: 'umd'
    },
    clean: true
  },
  devtool: 'source-map',
  plugins,
  module: {
    rules: [
      {
        test: /\.(tsx?|js)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  bugfixes: true
                }
              ],
              ['@babel/preset-typescript', {jsxPragma: 'h', jsxPragmaFrag: 'Fragment'}]
            ],
            plugins: [
              ['@babel/plugin-transform-runtime'],
              ['@babel/plugin-proposal-decorators', {legacy: true}],
              ['@babel/plugin-transform-react-jsx', {pragma: 'h', pragmaFrag: 'Fragment'}]
            ]
          }
        }
      },
      {
        test: /\.scss/,
        use: [
          {
            loader: 'style-loader',
            options: {
              attributes: {id: `${packageData.name}`},
              injectType: 'singletonStyleTag',
              insert: insertStylesWithNonce
            }
          },
          {
            loader: 'css-loader',
            options: {
              esModule: true,
              modules: {
                localIdentName: '[name]__[local]___[hash:base64:5]',
                namedExport: true
              }
            }
          },
          {
            loader: 'sass-loader'
          }
        ]
      }
    ]
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'demo')
    },
    client: {
      progress: true
    }
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  externals: {
    '@playkit-js/kaltura-player-js': 'root KalturaPlayer',
    '@playkit-js/playkit-js-ui': 'root KalturaPlayer.ui',
    '@playkit-js/playkit-js': 'root KalturaPlayer.core',
    preact: 'root KalturaPlayer.ui.preact',
    'preact-i18n': 'root KalturaPlayer.ui.preacti18n',
    'preact/hooks': 'root KalturaPlayer.ui.preactHooks'
  }
};
