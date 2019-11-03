const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const mongoose = require('mongoose')
mongoose.connect(process.env.MONGO, {useNewUrlParser: true, useUnifiedTopology: true} )

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


var Schema = mongoose.Schema
var Model = mongoose.model
var ObjectId = mongoose.Schema.Types.ObjectId

///////////////////////////// USER SCHEMA //////////////////////////////////////
var userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
})

var User = new Model('User', userSchema)

///////////////////////////// EXERCISE SCHEMA //////////////////////////////////
var exerciseSchema = new Schema({
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  userId: {
    type: ObjectId,
    required: true
  }
})

var Exercise = new Model('Exercise', exerciseSchema)

app.post('/api/exercise/new-user', (req, res) => {
  var user = new User({username: req.body.username})
  user.save()
  res.json(user)
})

app.get('/api/exercise/users', (req, res) => {
  User.find((err, users) => {
    if(err) { return error }
    res.json(users)
  })
})


// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
