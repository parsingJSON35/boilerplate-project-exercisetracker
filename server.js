const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const mongoose = require('mongoose')
mongoose.connect(`mongodb+srv://admin:admin@cluster0-yttqw.mongodb.net/test?retryWrites=true&w=majority`, {useNewUrlParser: true, useUnifiedTopology: true} )

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


var Schema = mongoose.Schema
var Model = mongoose.model
var ObjectId = Schema.Types.ObjectId



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
    type: Date,
    required: true
  },
  user_id: {
    type: ObjectId,
    ref: User,
    required: true,
  }
})

var Exercise = new Model('Exercise', exerciseSchema)

app.post('/api/exercise/new-user', (req, res) => {
  var user = new User({username: req.body.username})
  user.save().then(u => res.json(u)).catch(error => {
    console.error(error)
    res.send(error.errmsg)
  })
})

app.get('/api/exercise/users', (req, res) => {
  User.find().select('-__v').exec().then(users => res.json(users)).catch(error => {
    console.error(error)
    res.send(error.errmsg)
  })
})

app.post('/api/exercise/add', (req, res) => {
  var {userId, description, duration, date} = req.body

  var formattedDate = date ? new Date(date).toDateString() : new Date().toDateString()

  var exercise = new Exercise({
    description: description,
    duration: duration,
    date: formattedDate,
    user_id: userId
  })

  exercise.save().then(e => res.json(e)).catch(error => {
    console.error(error)
    res.send(error.errmsg)
  })
})

app.get('/api/exercise/log', (req, res) => {
  var {userId, from, to, limit } = req.query

  if(!userId) {res.send('Required query param for userId is missing.')}
  else {
    User.findById(userId).select('-__v').exec().then(user => {
      Exercise.find({user_id: user.id}).select('-__v -user_id -_id').exec()
        .then(exercises => res.json({
          _id: user.id,
          username: user.username,
          count: exercises.length,
          log: exercises
      }))
    })
  }
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
