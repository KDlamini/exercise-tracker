const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.connect(process.env.BD_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const exerciseSchema = new Schema({
  date: String,
  duration: {type: Number, required: true},
  description: {type: String, required: true}
})

const User = mongoose.model('User', new Schema({
  username: {type: String, required: true},
  log: [exerciseSchema]
}));

const Exercise = mongoose.model('Exercise', exerciseSchema)

app.post('/api/exercise/new-user', (req, res) => {
  let username =  req.body.username;

  User.findOne({username: username}, (error, result) => {
    if(error) {
      console.log(error);
    }
    else if (result == null) {
      let newUser = new User({
        username: username
      });
    
      newUser.save((error, doc) => {
        if(error) {
          console.log(error);
        } else {
          console.log("Successfuly inserted document!")
          res.json({
            username: doc.username,
            _id: doc._id
          })
        }
      });
    } else {
      // res.json(result);
      res.send('Username already taken');
    }
  });

});

app.post('/api/exercise/add', (req, res) => {
  let inputData = req.body;
  let inputDate = inputData.date ? new Date(inputData.date): new Date();

  if(inputData.duration < 1) {
    res.send('duration too short');
  }

  let addExercise = new Exercise({
    date: inputDate.toDateString(),
    duration: parseInt(inputData.duration),
    description: inputData.description
  })
  
  User.findByIdAndUpdate(
    inputData.userId,
    {$push: {log: addExercise}},
    {new: true},
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.json({
          _id: result._id,
          username: result.username,
          date: addExercise.date,
          duration: addExercise.duration,
          description: addExercise.description
        });
      }
    });
});

app.get('/api/exercise/users', (req, res) => {

  User.find({}, (error, users) => {
    if(!error) {
      res.json(users);
    }
  })
})

app.get('/api/exercise/log', (req, res) => {

  User.findById(req.query.userId, (error, result) => {
    if(!error) {
      let newDoc = {
        _id: result._id,
        username: result.username,
        count: result.log.length,
        log: result.log
      }

      if(req.query.from || req.query.to) {
        let fromDate = new Date(0)
        let toDate = new Date()

        if(req.query.from) {
          fromDate = new Date(req.query.from)
        }

        if(req.query.to) {
          toDate = new Date(req.query.to)
        }

        newDoc.log = newDoc.log.filter(exercise => {
          let unix = new Date(exercise.date).getTime()

          return unix >= fromDate.getTime() && unix <= toDate.getTime()
        })

        newDoc.count = newDoc.log.length
      }

      if(req.query.limit) {
        newDoc.log = newDoc.log.slice(0, req.query.limit);
        newDoc.count = newDoc.log.length
      }

      res.json(newDoc);
    }
  });
});

const listener = app.listen(process.env.PORT || 6500, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
