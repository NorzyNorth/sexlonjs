import HtmlWebpackPlugin from 'html-webpack-plugin';
import webpack from 'webpack';
// import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CircularDependencyPlugin from 'circular-dependency-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import CopyPlugin from 'copy-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import { BuildOptions } from './types/config';
import path from 'path';

export function buildPlugins({
  paths, isDev, apiUrl, project, wsport, wshost,
}: BuildOptions): webpack.WebpackPluginInstance[] {
  const plugins = [
    new HtmlWebpackPlugin({
      template: paths.html,
    }),
    new webpack.ProgressPlugin(),
    new webpack.DefinePlugin({
      __IS_DEV__: JSON.stringify(isDev),
      __API_URL__: JSON.stringify(apiUrl),
      __PROJECT__: JSON.stringify(project),
      __WS_PORT__: JSON.stringify(wsport),
      __WS_HOST__: JSON.stringify(wshost),
    }),
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        diagnosticOptions: {
          semantic: true,
          syntactic: true,
        },
        mode: 'write-references',
      },
    }),
  ];

  if (isDev) {
    plugins.push(new webpack.HotModuleReplacementPlugin());
    plugins.push(new BundleAnalyzerPlugin({
      openAnalyzer: false,
    }));
    plugins.push(new CircularDependencyPlugin({
      exclude: /node_modules/,
      failOnError: true,
    }));
  } else {
    // plugins.push(
    //   new MiniCssExtractPlugin({
    //     filename: 'css/[name].[contenthash:5].css',
    //     chunkFilename: 'css/[name].[contenthash:5].css',
    //   }),
    // );
    plugins.push(
      new CopyPlugin({
        patterns: [
          { from: paths.models, to: paths.buildModels },
          { from: paths.textures, to: paths.buildTextures },
        ],
      }),
    );
  }

  return plugins;
}