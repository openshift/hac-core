export type AnyObject = Record<string, unknown>;

type GenericHandler<T = unknown> = (data: T) => void;
export type OpenHandler = GenericHandler<undefined>; // nothing is sent
export type CloseHandler = GenericHandler<CloseEvent>;
export type ErrorHandler = GenericHandler<Event>;
/**
 * The WebSocket can send JSON that is parsed, or we just send it through as-is
 */
export type MessageDataType = AnyObject | string;
export type MessageHandler = GenericHandler<MessageDataType>;
export type DestroyHandler = GenericHandler<undefined>;
export type BulkMessageHandler = GenericHandler<MessageDataType>;

export type EventHandlers = {
  open: OpenHandler[];
  close: CloseHandler[];
  error: ErrorHandler[];
  message: MessageHandler[];
  destroy: DestroyHandler[];
  bulkMessage: BulkMessageHandler[];
};

export type EventHandlerTypes = keyof EventHandlers;
export type EventHandlerFunctions = EventHandlers[keyof EventHandlers];
