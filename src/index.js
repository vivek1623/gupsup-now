const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')

const { generateTextMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, getUser, removeUser, getUsersByRoom } = require('./utils/users')

//to socket.io with express we need some different type of  refactoring
//we needd to create server using http and express

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 1623

const publicDirPath = path.join(__dirname, '../public')

app.use(express.static(publicDirPath))

io.on('connection', socket => {
  socket.on('join', (options, callback) => {
    const { error, user } = addUser({ ...options, id: socket.id })
    if (error)
      return callback(error)
    if (user) {
      socket.join(user.room)
      socket.emit('message', generateTextMessage(`Hey ${user.username}, Welcome to chat app`, 'Admin'))
      socket.broadcast.to(user.room).emit('message', generateTextMessage(`${user.username} has joined`, 'Admin'))
      io.to(user.room).emit('roomData', {
        room: user.room,
        roomUsers: getUsersByRoom(user.room)
      })
    }
  })

  socket.on('sendMessage', (message, callback) => {
    const filter = new Filter()
    if (filter.isProfane(message))
      return callback('bad word is not allowed')
    const user = getUser(socket.id)
    if (user) {
      io.to(user.room).emit('message', generateTextMessage(message, user.username))
      callback('Message delivered!')
    }
  })

  socket.on('sendLocation', (location, callback) => {
    const url = `https://google.com/maps?q=${location.lat},${location.long}`
    io.emit('locationMessage', generateLocationMessage(url, 'user'))
    callback('location delivered successfully')
  })

  socket.on('disconnect', () => {
    const user = removeUser(socket.id)
    if (user) {
      io.to(user.room).emit('message', generateTextMessage(`${user.username} left the chatroom`, 'Admin'))
      io.to(user.room).emit('roomData', {
        room: user.room,
        roomUsers: getUsersByRoom(user.room)
      })
    }
  })
})




server.listen(port, () => {
  console.log(`server is up on port ${port}`)
})