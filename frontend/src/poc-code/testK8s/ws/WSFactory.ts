import type {
  EventHandlers,
  EventHandlerTypes,
  CloseHandler,
  MessageHandler,
  BulkMessageHandler,
  MessageDataType,
  DestroyHandler,
  OpenHandler,
  ErrorHandler,
} from './types';
import { applyConfigSubProtocols, applyConfigHost, createURL } from './ws-utils';

export type WSOptions = {
  /**
   * The path to the resource you wish to watch.
   */
  path: string;
  /**
   * Overridable ws host url for Plugins. Normally set by the application.
   */
  host?: string;
  /**
   * Overridable ws sub protocols for Plugins. Normally set by the application.
   * Is ignored if `host` is not set.
   */
  subProtocols?: string[];
  // TODO: document
  reconnect?: boolean;
  jsonParse?: boolean;
  bufferMax?: number;
  bufferFlushInterval?: number;
  timeout?: number;
};

/**
 * @class WebSocket factory and utility wrapper.
 */
export class WSFactory {
  private readonly handlers: EventHandlers;

  private readonly flushCanceler: ReturnType<typeof setInterval>;

  private readonly bufferMax: number;

  private paused = false;

  private state = '';

  private messageBuffer: MessageDataType[] = [];

  private connectionAttempt: ReturnType<typeof setTimeout>;

  private ws: WebSocket | null = null;

  /**
   * @param id - unique id for the WebSocket.
   * @param options - websocket options to initate the WebSocket with.
   */
  constructor(private readonly id: string, private readonly options: WSOptions) {
    this.bufferMax = options.bufferMax || 0;
    this.handlers = {
      open: [],
      close: [],
      error: [],
      message: [],
      destroy: [],
      bulkMessage: [],
    };
    this.connect();

    if (this.bufferMax) {
      this.flushCanceler = setInterval(
        this.flushMessageBuffer.bind(this),
        this.options.bufferFlushInterval || 500,
      );
    }
  }

  private reconnect() {
    if (this.connectionAttempt || this.state === 'destroyed') {
      return;
    }

    let delay = 1000;

    const attempt = () => {
      if (!this.options.reconnect || this.state === 'open') {
        clearTimeout(this.connectionAttempt);
        this.connectionAttempt = null;
        return;
      }
      if (this.options.timeout && delay > this.options.timeout) {
        clearTimeout(this.connectionAttempt);
        this.connectionAttempt = null;
        this.destroy();
        return;
      }

      this.connect();
      delay = Math.round(Math.min(1.5 * delay, 60000));
      this.connectionAttempt = setTimeout(attempt, delay);
      // eslint-disable-next-line no-console
      console.log(`attempting reconnect in ${delay / 1000} seconds...`);
    };

    this.connectionAttempt = setTimeout(attempt, delay);
  }

  private connect() {
    this.state = 'init';
    this.messageBuffer = [];

    const url = createURL(applyConfigHost(this.options.host), this.options.path);
    const subProtocols = applyConfigSubProtocols(
      this.options.host ? this.options.subProtocols : undefined,
    );
    try {
      this.ws = new WebSocket(url, subProtocols);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error creating websocket:', e);
      this.reconnect();
      return;
    }

    this.ws.onopen = () => {
      // eslint-disable-next-line no-console
      console.log(`websocket open: ${this.id}`);
      this.state = 'open';
      this.triggerEvent('open', undefined);
      if (this.connectionAttempt) {
        clearTimeout(this.connectionAttempt);
        this.connectionAttempt = null;
      }
    };
    this.ws.onclose = (evt) => {
      // eslint-disable-next-line no-console
      console.log(`websocket closed: ${this.id}`, evt);
      this.state = 'closed';
      this.triggerEvent('close', evt);
      this.reconnect();
    };
    this.ws.onerror = (evt) => {
      // eslint-disable-next-line no-console
      console.log(`websocket error: ${this.id}`);
      this.state = 'error';
      this.triggerEvent('error', evt);
    };
    this.ws.onmessage = (evt) => {
      const msg = this.options?.jsonParse ? JSON.parse(evt.data) : evt.data;
      // In some browsers, onmessage can fire after onclose/error. Don't update state to be incorrect.
      if (this.state !== 'destroyed' && this.state !== 'closed') {
        this.state = 'open';
      }
      this.triggerEvent('message', msg);
    };
  }

  /**
   * Invoke all registered handler callbacks for a given data.
   */
  private invokeHandlers(type: EventHandlerTypes, data?: unknown) {
    const handlers = this.handlers[type];
    if (!handlers) {
      return;
    }
    handlers.forEach((h) => {
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        h(data); // typescript is having an issue with passing the data, muting for now
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('WS handling failed:', e);
      }
    });
  }

  /**
   * Triggers event to be buffered or invoked depending on config.
   */
  private triggerEvent(type: EventHandlerTypes, data?: unknown) {
    if (this.state === 'destroyed') {
      return;
    }

    const isMessageEvent = (t: string, e: unknown): e is MessageDataType => {
      return t === 'message' && !!e;
    };

    // Only buffer "message" events, so "error" and "close" etc can pass thru.
    if (this.bufferMax && isMessageEvent(type, data)) {
      this.messageBuffer.push(data);

      if (this.messageBuffer.length > this.bufferMax) {
        this.messageBuffer.shift();
      }

      return;
    }

    this.invokeHandlers(type, data);
  }

  onMessage(fn: MessageHandler): WSFactory {
    if (this.state === 'destroyed') {
      return this;
    }
    this.handlers.message.push(fn);
    return this;
  }

  onBulkMessage(fn: BulkMessageHandler): WSFactory {
    if (this.state === 'destroyed') {
      return this;
    }
    this.handlers.bulkMessage.push(fn);
    return this;
  }

  onError(fn: ErrorHandler): WSFactory {
    if (this.state === 'destroyed') {
      return this;
    }
    this.handlers.error.push(fn);
    return this;
  }

  onOpen(fn: OpenHandler): WSFactory {
    if (this.state === 'destroyed') {
      return this;
    }
    this.handlers.open.push(fn);
    return this;
  }

  onClose(fn: CloseHandler): WSFactory {
    if (this.state === 'destroyed') {
      return this;
    }
    this.handlers.close.push(fn);
    return this;
  }

  onDestroy(fn: DestroyHandler): WSFactory {
    if (this.state === 'destroyed') {
      return this;
    }
    this.handlers.destroy.push(fn);
    return this;
  }

  flushMessageBuffer() {
    if (this.paused) {
      return;
    }

    if (!this.messageBuffer.length) {
      return;
    }

    if (this.handlers.bulkMessage.length) {
      this.invokeHandlers('bulkMessage', this.messageBuffer);
    } else {
      this.messageBuffer.forEach((e) => this.invokeHandlers('message', e));
    }

    this.messageBuffer = [];
  }

  /**
   *  Pausing prevents any buffer flushing until unpaused.
   */
  pause() {
    this.paused = true;
  }

  unpause() {
    this.paused = false;
    this.flushMessageBuffer();
  }

  isPaused() {
    return this.paused;
  }

  getState() {
    return this.state;
  }

  bufferSize() {
    return this.messageBuffer.length;
  }

  destroy() {
    // eslint-disable-next-line no-console
    console.log(`destroying websocket: ${this.id}`);
    if (this.state === 'destroyed') {
      return;
    }

    try {
      if (this.ws) {
        this.ws.close();
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error while close WS socket', e);
    }

    clearInterval(this.flushCanceler);
    clearTimeout(this.connectionAttempt);

    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;
      this.ws = null;
    }

    try {
      this.triggerEvent('destroy');
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error while trigger destroy event for WS socket', e);
    }

    this.state = 'destroyed';

    this.messageBuffer = [];
  }

  send(data: Parameters<typeof WebSocket.prototype.send>[0]) {
    this.ws?.send(data);
  }
}
