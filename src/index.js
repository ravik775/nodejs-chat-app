const adminUser = "admin"
const express  = require("express")
const path = require("path")
const port =  process.env.PORT
const http = require("http")
const app = express()
const Filter = require("bad-words")
const socketio = require("socket.io")
const {generateMessage} = require("./utils/messages")
const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
} = require("./utils/users")

const server = http.createServer(app)
const io = socketio(server)

const publicDirectory = path.join(__dirname, "../public")

let count = 0

app.use(express.static(publicDirectory))

app.get('/',  (req, res)=>{
    res.send("Connected to chat app")
})

io.on('connection', (socket)=>{
    
    //socket.broadcast.emit("message", generateMessage("New user login")) //all except to current connection

    socket.on("join", (options, callback) =>{
        //io.to.emit,socket.to.emit
        const {error, user} = addUser({...options, id: socket.id})
        if(!error){
            socket.join(user.room)
            socket.emit("message", generateMessage(adminUser, "Welcome to the site."))
            socket.to(user.room).broadcast.emit("message", generateMessage(adminUser, `${user.username} had joined.`))
            io.to(user.room).emit("roomData", { room: user.room, users: getUsersInRoom(user.room)  })
        }
        callback(error)
    })

    socket.on("sendMessage", (message, cb)=>{
       const filter = new Filter()
       if(filter.isProfane(message))
            cb('Profanity not allowed')
       else{
            const user = getUser(socket.id)
            if(message && user)
                io.to(user.room).emit("message", generateMessage(user.username, message ))

            cb()
        }
       
    })

    socket.on("disconnect", (message)=>{
        const user = removeUser( socket.id)
        if (user)
        {
            io.to(user.room).emit("message", generateMessage(adminUser, `${user.username} had left`))
            io.to(user.room).emit("roomData", { room: user.room, users: getUsersInRoom(user.room)  })
        }
     })

     socket.on("sendLocation", ({longitude, latitude}, callback)=>{
        const user = removeUser( socket.id)
        if (user)
        {
            io.to(user.room).emit("locationMessage", generateMessage(user.username, `https://www.google.com/maps?q=${latitude},${longitude}`))
            callback()git@github.com:ravik775/nodejs-chat-app.git
        } 
     })
})

server .listen(port, ()=>{
    console.log(`Server is listening to port ${port}`)
})