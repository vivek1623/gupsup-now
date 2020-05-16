const socket = io()

const $chatForm = document.querySelector('form')
const $inputField = document.querySelector('input')
const $locationBtn = document.querySelector('#location-btn')
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error)
    location.href = '/'
  }
})

socket.on('roomData', ({ room, roomUsers }) => {
  console.log('data', room)
  const html = Mustache.render(sidebarTemplate, {
    room,
    users: roomUsers
  })
  $sidebar.innerHTML = html
})

socket.on('message', message => {
  const alignRight = message.username === username.trim().toLowerCase()
  const html = Mustache.render(messageTemplate, {
    messageClass: alignRight ? "message message-right" : "message",
    messageAvatarClass: alignRight ? "message-avatar message-avatar-right" : "message-avatar message-avatar-left",
    text: message.text,
    username: message.username,
    avatarLetter: message.username.charAt(0),
    createdAt: message.createdAt
  })
  $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('locationMessage', message => {
  const alignRight = message.username === username.trim().toLowerCase()
  const html = Mustache.render(locationTemplate, {
    messageClass: alignRight ? "message message-right" : "message",
    messageAvatarClass: alignRight ? "message-avatar message-avatar-right" : "message-avatar message-avatar-left",
    url: message.url,
    username: message.username,
    avatarLetter: message.username.charAt(0),
    createdAt: message.createdAt
  })
  $messages.insertAdjacentHTML('beforeend', html)
})

$chatForm.addEventListener('submit', event => {
  event.preventDefault()
  const message = event.target.elements.message.value
  if (message.trim().length > 0)
    socket.emit('sendMessage', message, res => {
      if (res)
        console.log(res)
    })
})

$inputField.addEventListener('focusin', () => {
  $locationBtn.style.display = 'none'
})

$inputField.addEventListener('focusout', () => {
  $locationBtn.style.display = 'block'
})

$locationBtn.addEventListener('click', () => {
  if (!navigator.geolocation)
    return alert('your browser does not support geolocation')

  $locationBtn.setAttribute('disabled', 'disabled')

  navigator.geolocation.getCurrentPosition(position => {
    socket.emit('sendLocation', {
      lat: position.coords.latitude,
      long: position.coords.longitude
    }, res => {
      $locationBtn.removeAttribute('disabled')
      console.log(res)
    })
  })
})

