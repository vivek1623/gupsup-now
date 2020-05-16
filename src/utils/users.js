const users = []

//id id socketID

const addUser = ({ id, username, room }) => {
  if (!id || !username || !room)
    return { error: 'Enter valid username and room' }

  username = username.trim().toLowerCase()
  room = room.trim().toLowerCase()

  const index = users.findIndex(user => user.username === username && user.room === room)
  if (index !== -1)
    return { error: 'User name already in use. please choose another..' }

  const user = { id, username, room }
  users.push(user)
  return { user }
}

const removeUser = id => {
  const index = users.findIndex(user => user.id === id)
  if (index !== -1)
    return users.splice(index, 1)[0]
}

const getUser = id => users.find(user => user.id === id)

const getUsersByRoom = room => users.filter(user => user.room === room)

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersByRoom
}