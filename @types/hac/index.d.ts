declare interface Window {
  insights?:{
    chrome?: {
      init?: Function,
      identifyApp?: Function,
      on?: Function,
      appAction?: Function
    }
  }
}

declare const __webpack_init_sharing__: Function;
