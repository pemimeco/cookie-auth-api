const express = require('express')
const path = require('path')
const morgan = require('morgan')
const cors = require('cors')
const cookieParser = require('cookie-parser')

//initializations
const app = express()
require('./connection') //conexion a la bd 


//settings
app.set('port', process.env.PORT || 8000)

//middlewares
app.use(cookieParser())
app.use(cors({//exchange cookies
    credentials: true,
    origin: ['http://localhost:3000']
}))
app.use(morgan('dev'))
app.use(express.json())

//routes
app.use('/', require('./routes'))
// app.use('/photos', express.static(__dirname + '/photos'))

//starting the server
app.listen(app.get('port'), () => {
    console.log('Server on port', app.get('port'))
})