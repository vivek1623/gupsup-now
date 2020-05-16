const SOCKET_EVENTS = {
  CONNECTION: 'connection',
  JOIN: 'join',
  MESSAGE: 'message',
  LOCATION_MESSAGE: 'locationMessage',
  SEND_MESSAGE: 'sendMessage',
  SEND_LOCATION: 'sendLocation',
  ROOM_DATA: 'roomData',
  DISCONNECT: 'disconnect'
}

const DEFAULT_SENDER = "GupSup"

module.exports = {
  SOCKET_EVENTS,
  DEFAULT_SENDER,
}