const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')

const { generateTextMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, getUser, removeUser, getUsersByRoom } = require('./utils/users')
const { SOCKET_EVENTS, DEFAULT_SENDER } = require('./config/constants')

//to socket.io with express we need some different type of  refactoring
//we need to create server using http and express

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 1623

const publicDirPath = path.join(__dirname, '../public')

app.use(express.static(publicDirPath))

io.on(SOCKET_EVENTS.CONNECTION, socket => {
  socket.on(SOCKET_EVENTS.JOIN, (options, callback) => {
    const { error, user } = addUser({ ...options, id: socket.id })
    if (error)
      return callback(error)
    if (user) {
      socket.join(user.room)
      socket.emit(SOCKET_EVENTS.MESSAGE, generateTextMessage(`Hey ${user.username}, Welcome to gupsup now`, DEFAULT_SENDER))
      socket.broadcast.to(user.room).emit(SOCKET_EVENTS.MESSAGE, generateTextMessage(`${user.username} has joined`, DEFAULT_SENDER))
      io.to(user.room).emit(SOCKET_EVENTS.ROOM_DATA, {
        room: user.room,
        roomUsers: getUsersByRoom(user.room)
      })
    }
  })

  socket.on(SOCKET_EVENTS.SEND_MESSAGE, (message, callback) => {
    const filter = new Filter()
    if (filter.isProfane(message))
      return callback('bad word is not allowed')
    const user = getUser(socket.id)
    if (user) {
      io.to(user.room).emit(SOCKET_EVENTS.MESSAGE, generateTextMessage(message, user.username))
      callback('Message delivered!')
    }
  })

  socket.on(SOCKET_EVENTS.SEND_LOCATION, (location, callback) => {
    const user = getUser(socket.id)
    if (user) {
      const url = `https://google.com/maps?q=${location.lat},${location.long}`
      const locationMessage = generateLocationMessage(url, user.username)
      io.to(user.room).emit(SOCKET_EVENTS.LOCATION_MESSAGE, locationMessage)
      callback('location delivered successfully')
    }
  })

  socket.on(SOCKET_EVENTS.DISCONNECT, () => {
    const user = removeUser(socket.id)
    if (user) {
      io.to(user.room).emit(SOCKET_EVENTS.MESSAGE, generateTextMessage(`${user.username} left the chatroom`, DEFAULT_SENDER))
      io.to(user.room).emit(SOCKET_EVENTS.ROOM_DATA, {
        room: user.room,
        roomUsers: getUsersByRoom(user.room)
      })
    }
  })
})




server.listen(port, () => {
  console.log(`server is up on port ${port}`)
})