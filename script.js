let uluru, map, marker
let ws
let players = {}
let nick

function initMap() {
    uluru = { lat: -25.363, lng: 131.044 };
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 8,
        center: uluru,
        keyboardShortcuts: false
    });
    
    marker = new google.maps.Marker({
        position: uluru,
        map: map,
        animation: google.maps.Animation.DROP
    });
    nick = Date.now()
    getLocalization()
    startWebSocket()
    addKeyboardEvents()
    addSendEvent()
}

function addKeyboardEvents() {
    window.addEventListener('keydown', poruszMarkerem)
}
function addSendEvent(){
    let sendMessage1 = document.querySelector('.submit')
    sendMessage1.addEventListener('click', sendMessage)
}
function poruszMarkerem(ev) {
    let lat = marker.getPosition().lat()
    let lng = marker.getPosition().lng()

    switch (ev.code) {
        case 'ArrowUp':
            lat += 0.1
            break;
        case 'ArrowDown':
            lat -= 0.1
            break;
        case 'ArrowLeft':
            lng -= 0.1
            break;
        case 'ArrowRight':
            lng += 0.1
            break;
    }
    let position = {
        lat,
        lng
    }
    let wsData = {
        lat: lat,
        lng: lng,
        id: nick
    }
    marker.setPosition(position)
    ws.send(JSON.stringify(wsData))
}
function startWebSocket() {
    let url = 'ws:/localhost:8080'
    ws = new WebSocket(url)
    ws.addEventListener('open', onWSOpen)
    ws.addEventListener('message', onWSMessage)
}

function onWSOpen(data) {
    console.log(data)
}

function sendMessage(){
    let msg = document.querySelector('.text')
    let nickMsg = document.querySelector('.name').value
    let userNick
    if(nickMsg != null && nickMsg != ""){
        userNick = nickMsg
    }
    else{
        userNick = nick
    }
    let message={
        msg: msg.value,
        nick: userNick
    }
    ws.send(JSON.stringify(message))
    console.log('wiadomoscWyslana')
    msg.value = ""
}
function getMessage(e){
    let data = JSON.parse(e.data)
    let messageText = data["msg"]
    let user = data["nick"]
    let li = document.createElement('li')
    li.classList.add("wiadomosc")
    li.innerHTML = "User: " + user + " || Message:  " + messageText
    let chat = document.querySelector('.messages')
    chat.appendChild(li)
    console.log('wiadomoscOdebrana')
}
function onWSMessage(e) {
    let data = JSON.parse(e.data)
    //console.log(JSON.parse(e.data))

    if(data["msg"] != null){
        getMessage(e)
    }
    else{
        
    if (!players['user' + data.id]) {
        players['user' + data.id] = new google.maps.Marker({
            position: { lat: data.lat, lng: data.lng },
            map: map,
            animation: google.maps.Animation.DROP
        })
        
    } 
    else{
        players['user' + data.id].setPosition({
            lat: data.lat,
            lng: data.lng
        })
        console.log(JSON.parse(e.data))
    }
    }

   
}

function getLocalization() {
    navigator.geolocation.getCurrentPosition(geoOk, geoFail)

}

function geoOk(data) {
    let coords = {
        lat: data.coords.latitude,
        lng: data.coords.longitude
    }
    map.setCenter(coords)
    marker.setPosition(coords)
}

function geoFail(err) {
    console.log(err)
}


