const generateTextMessage = (text, username) => {
  return {
    username,
    text,
    createdAt: new Date().toLocaleTimeString('en-US', { hour12: true })
  }
}

const generateLocationMessage = (url, username) => {
  return {
    username,
    url,
    createdAt: new Date().toLocaleTimeString('en-US', { hour12: true })
  }
}

module.exports = {
  generateTextMessage,
  generateLocationMessage
}
