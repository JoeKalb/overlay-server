const express = require('express')
const app = express()
const server = require('http').Server(app)
const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
const io = require('socket.io')(server)
const port = 8001;

app.io = io;

app.get('/', (req, res) => res.json({response:'Hello get!'}))

app.post('/', (req, res) => res.json({response:'Hello post!'}))

app.post('/trivia/question', (req,res) => {
    try{
        console.log(req.body)
        app.io.emit('question', req.body)
        res.status(200).json(`Trivia Received\nChannel: ${req.body.channel}`)
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