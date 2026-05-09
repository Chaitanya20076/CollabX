import { EventEmitter } from "events";

export const realtimeBus = new EventEmitter();

export const publishRealtimeEvent = (event, payload) => {
  realtimeBus.emit(event, payload);
};
