const socket = io ()
const $messages = document.querySelector("#messages")
const $chatSidebar = document.querySelector("#sidebar")

//Template
const messageTemplate = document.querySelector("#message-template").innerHTML
const locationTemplate = document.querySelector("#location-template").innerHTML
const sidebarTemplate  = document.querySelector("#sidebar-template").innerHTML

const {username, room } = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll=()=>{
    const $newmessage = $messages.lastElementChild
    const newMessageStyles = getComputedStyle($newmessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newmessage.offsetHeight + newMessageMargin

    const visibleHeight = $messages.offsetHeight
    const containerHeight = $messages.scrollHeight
    const scrollOffset = $messages.scrollTop + visibleHeight

    if( containerHeight - newMessageHeight <= scrollOffset)
        $messages.scrollTop = $messages.scrollHeight

}
socket.on('message', (message)=>{
    const html = Mustache.render(messageTemplate, {message: message.text, username: message.username,
        createdAt: moment(message.createdAt).format("h:mm a")})
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (message)=>{
    const html = Mustache.render(locationTemplate, {locationURL: message.text, username: message.username, createdAt: moment(message.createdAt).format("h:mm a")})
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

const $submit = document.querySelector("#submit")
const $sendLocation = document.querySelector("#send-location")
const disableButtons=()=>{
    $submit.setAttribute('disabled', 'disabled')
    $sendLocation.setAttribute('disabled', 'disabled')
}

const enableButtons=()=>{
    $submit.removeAttribute('disabled')
    $sendLocation.removeAttribute('disabled')
}

document.querySelector('#message-form').addEventListener('submit', (e)=>{
    e.preventDefault()
    const $message = document.querySelector("#message")
    const message = $message.value
    disableButtons()
    socket.emit("sendMessage", message, (error)=>{ 
        enableButtons()
        if(error) 
            console.log(`${error}: ${message}`)
        else
            $message.value = ''
        })
})

document.querySelector('#send-location').addEventListener('click',(e)=>{
    e.preventDefault()
    if (navigator.geolocation){
        navigator.geolocation.getCurrentPosition((position)=>{
            disableButtons()
            socket.emit("sendLocation", {latitude: position.coords.latitude, longitude: position.coords.longitude}, (error)=>{
                enableButtons()
            })
        })
    }else { 
        alert("Location Sharing not avaible")
    }
})

socket.emit("join", {username, room}, (error)=>{ if(error) console.log(error)})

socket.on("roomData", ({room, users})=>{
    const html = Mustache.render(sidebarTemplate, {username, room, users})
    console.log("user list mod ", users)
    $chatSidebar.innerHTML = html

})