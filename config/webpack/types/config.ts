export type BuildMode = 'development' | 'production';

export interface BuildPaths {
  entry: string,
  build: string,
  html: string,
  src: string,
  models: string,
  textures: string,
  buildModels: string,
  buildTextures: string,
}

export interface BuildOptions {
  mode: BuildMode,
  paths: BuildPaths,
  isDev: boolean,
  port: number,
  apiUrl: string,
  project: 'frontend',
  wsport: number,
  wshost: string,
}

export interface BuildEnv {
  mode: BuildMode,
  port: number,
  apiUrl: string,
  wsport: number,
  wshost: string,
}