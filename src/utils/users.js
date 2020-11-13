const e = require("express")

const users = []

const addUser = ({id, username, room}) => {
// clean the data
  username = username.trim().toLowerCase()
  room = room.trim().toLowerCase()

  if (!username || !room) return {error: "Username and room are required"}
   // Check for existing user
  const  existingUser = users.find((e)=> e.room == room && e.username == username)
  if(existingUser) return {error: "Username is already taken up in the room"}

  const user = {id, username, room}
  users.push(user)
  return {user}
}

const removeUser = (id) => {
    const  index = users.findIndex((e)=> e.id == id)
    if(index != -1)
        return users.splice(index, 1)[0]
    return {error: "Username is not found"}
}

const getUser = (id) => {
    return users.find((e)=> e.id == id)
}

const getUsersInRoom = (room)=>{
    
    return users.filter(e=> e.room == room).map(x => x.username)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}