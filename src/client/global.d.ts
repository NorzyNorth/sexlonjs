declare const __IS_DEV__: boolean;
declare const __API_URL__: string;
declare const __PROJECT__: 'frontend';
declare const __WS_PORT__: number;
declare const __WS_HOST__: string;

declare module '*.scss' {
  interface IClassNames {
    [className: string]: string;
  }
  const classNames: IClassNames;
  export = classNames;
}