const express = require('express')
const app = express()
const server = require('http').Server(app)
const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
const io = require('socket.io')(server)
const port = 8001;

app.io = io;

let namespaces = {}

app.get('/', (req, res) => res.json({response:'Hello get!'}))

app.post('/', (req, res) => res.json({response:'Hello post!'}))

app.get('/game/:channel', (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    const { channel } = req.params
    if(namespaces.hasOwnProperty(channel)){
        res.status(200).json({'game':namespaces[channel].game})
    }
    else{
        namespaces[channel] = {
            'socket':io.of(`/${channel}`)
        }
        res.status(404).json({response:`No game found in channel: ${channel}`})
    }
})

app.post('/trivia', (req, res) => {
    console.log('trivia start')
    try{
        const { category, channel } = req.body;
        if(!namespaces.hasOwnProperty(channel)){
            namespaces[channel] = {
                'socket':io.of(`/${channel}`),
                'game':{
                    'type':'Trivia',
                    'category':category,
                    'question':''
                }
            }
        }
        else{
            namespaces[channel].game = {
                'type':'Trivia',
                'category':category,
                'question':''
            }
        }

        namespaces[channel].socket.emit('triviaStart', namespaces[channel].game)
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
        const { channel, question } = req.body
        console.log(req.body)
        if(!namespaces.hasOwnProperty(channel)){
            namespaces[channel] = {
                'socket':io.of(`/${channel}`),
                'game':{
                    'type':'Trivia',
                    'question':question
                }
            }
        }
        else{
            namespaces[channel].game.question = question
        }

        namespaces[channel].socket.emit('triviaQuestion', question)
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