declare interface Window {
  SERVER_FLAGS: any;
  store: any;
  windowError: any;
  loadPluginEntry: any;
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any;
  __load_plugin_entry__: any;
}

declare const K8S_TARGET_URL: string;
declare const K8S_WS_TARGET_URL: string;

declare const __webpack_init_sharing__: Function;

// fix implicit any errors for modules without typings
declare module "@redhat-cloud-services/frontend-components-notifications/NotificationPortal";
declare module "@redhat-cloud-services/frontend-components-notifications/redux";
declare module "@redhat-cloud-services/frontend-components-notifications/notificationsMiddleware";
