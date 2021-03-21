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
app.use(express.urlencoded())
app.use(express.json())

const User = mongoose.model('User', new Schema({
  username: String,
  date: Date,
  duration: Number,
  description: String
}));

app.post('/api/exercise/new-user', (req, res) => {
  let username =  req.body.username;

  // User.deleteMany({username: username}, (error, result) => {
  //   if(error) {
  //     console.log(error);
  //   } else {
  //     res.json(result);
  //   }
  // })

  User.findOne({username: username}, (error, result) => {
    if(error) {
      console.log(error);
    }
    else if (result == null) {
      let newUser = new User({
        username: username,
        date: "",
        duration: 0,
        description: ""
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
      res.json(result);
      // res.send('Username already taken');
    }
  });

});

app.post('/api/exercise/add', (req, res) => {
  let inputData = req.body;
  let inputDate = new Date(inputData.date)

  if(inputData.duration < 1) {
    res.send('duration too short');
  }
  
  User.findById(inputData.userId)
      .select('-__v')
      .exec((err, result) => {
        if (err) {
          console.log(err);
        }
        result.date = inputDate;
        result.duration = Number(inputData.duration);
        result.description = inputData.description;

        result.save((error, doc) => {
          if(error) {
            console.log(error);
          } else {
            res.json(doc);
          }
        });
    });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
