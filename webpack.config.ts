import path from 'path';
import webpack from 'webpack';
import { buildWebpackConfig } from './config/webpack/buildWebpackConfig';
import { BuildEnv, BuildMode, BuildPaths } from './config/webpack/types/config';

function getApiUrl(mode: BuildMode, apiUrl?: string) {
  if (apiUrl) {
    return apiUrl;
  }
  if (mode === 'production') {
    return '/api';
  }

  return 'http://localhost:8000';
}

export default (env: BuildEnv) => {
  const paths: BuildPaths = {
    entry: path.resolve(__dirname, 'src', 'client', 'index.ts'),
    build: path.resolve(__dirname, 'dist', 'client'),
    html: path.resolve(__dirname, 'public', 'index.html'),
    src: path.resolve(__dirname, 'src'),
    models: path.resolve(__dirname, 'public', 'models'),
    textures: path.resolve(__dirname, 'public', 'textures'),
    buildModels: path.resolve(__dirname, 'dist', 'client', 'models'),
    buildTextures: path.resolve(__dirname, 'dist', 'client', 'textures'),
  };

  const mode: BuildMode = env?.mode || 'development';
  const PORT = env?.port || 3000;
  const isDev = mode === 'development';
  const apiUrl = getApiUrl(mode, env?.apiUrl);
  const wsport = env?.wsport || 2567; // web socket port
  const wshost = env?.wshost || 'localhost';

  const config: webpack.Configuration = buildWebpackConfig({
    mode,
    paths,
    isDev,
    port: PORT,
    apiUrl,
    project: 'frontend',
    wsport,
    wshost,
  });

  return config;
};
