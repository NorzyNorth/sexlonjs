import webpack from 'webpack';
import { BuildOptions } from './types/config';
import { buildCssLoader } from './loaders/buildCssLoader';
import { buildBabelLoader } from './loaders/buildBabelLoader';

export function buildLoaders(options: BuildOptions): webpack.RuleSetRule[] {
  const { isDev } = options;

  const fileLoader = {
    test: /\.(png|jpe?g|gif|woff2|woff)$/i,
    use: [
      {
        loader: 'file-loader',
      },
    ],
  };

  const cssLoaders = buildCssLoader(isDev);

  // const codeBabelLoader = buildBabelLoader({ ...options, isTsx: false });
  // const tsxCodeBabelLoader = buildBabelLoader({ ...options, isTsx: true });

  const tsLoader = {
    test: /\.tsx?$/,
    use: 'ts-loader',
    exclude: /node_modules/,
  };

  return [
    fileLoader,
    // codeBabelLoader,
    // tsxCodeBabelLoader,
    tsLoader,
    cssLoaders,
  ];
}