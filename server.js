const express = require('express')
const app = express()
const server = require('http').Server(app)
const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
const io = require('socket.io')(server)
const port = 8001;

app.io = io;

const namespaces = {}

app.get('/', (req, res) => res.json({response:'Hello get!'}))

app.post('/', (req, res) => res.json({response:'Hello post!'}))

app.post('/trivia', (req, res) => {
    console.log('trivia start')
    try{
        let channel = req.body.channel;
        if(!namespaces.hasOwnProperty(channel))
            namespaces[channel] = io.of(`/${channel}`)

        namespaces[channel].emit('triviaStart', req.body)
        res.status(200).json({
            'info':req.body
        })
    }
    catch(err){
        console.log(err)
        res.status(404).json({"Error":err})
    }
})

app.post('/trivia/question', (req,res) => {
    try{
        let channel = req.body.channel
        console.log(req.body)
        if(!namespaces.hasOwnProperty(channel)){
            namespaces[channel] = io.of(`/${channel}`)
        }
        namespaces[channel].emit('triviaQuestion', req.body)
        res.status(200).json(`Trivia Received\nChannel: ${channel}`)
    }
    catch(err){
        console.log(err)
        res.status(404).json({'Error':err})
    }
})

server.listen(port, () => console.log(`Example app listening on port ${port}!`))

io.on('connection', (socket) => {
    console.log('user connected')
    socket.emit('news', {hello: 'world'})
    socket.on('other event', (data) => {
        console.log(data)
    })

    socket.on('disconnect', () => {
        console.log('User disconnected')
    })
})