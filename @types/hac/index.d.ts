declare interface Window {
  insights?:{
    chrome?: {
      init?: Function,
      identifyApp?: Function,
      on?: Function,
      appAction?: Function
    }
  }
  SERVER_FLAGS: any;
  store: any;
  windowError: any;
  loadPluginEntry: any;
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any;
}

declare const __webpack_init_sharing__: Function;
