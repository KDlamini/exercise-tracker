const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.connect(process.env.BD_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
});

app.use(cors())
app.use(express.urlencoded())
app.use(express.json)
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const User = mongoose.model('User', new Schema({
  username: String,
  date: Date,
  duration: Number,
  description: String
}));

app.post('/api/exercise/new-user', (req, res) => {
  console.log(req.body);

  // let newUser = new User({
  // });

});

app.post('/api/exercise/add', (req, res) => {

});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
