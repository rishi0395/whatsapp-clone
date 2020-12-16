// importing 1st step
const express = require('express');
const mongoose = require('mongoose');
var Pusher = require('pusher');
const env = require('dotenv');
const Messages = require('./dbMessages');
const cors = require('cors');

// app-config 2nd step
const app = express();
env.config();

const {
  MONGO_DB_USER,
  MONGO_DB_PASSWORD,
  MONGO_DB_DATABASE,
  MONGO_DB_KEY,
  PORT
} = process.env;

var pusher = new Pusher({
  appId: '1088246',
  key: 'faec771a0ed764f86418',
  secret: '8c794dcde6e8b313dd33',
  cluster: 'ap2',
  encrypted: true
});

// middleware 6th step
app.use(express.json());

app.use(cors());

/** replaced with cors */
// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Headers', '*');
//   next();
// });

// DB config 5th step

const connectionURL = `mongodb+srv://${MONGO_DB_USER}:${MONGO_DB_PASSWORD}@cluster0.${MONGO_DB_KEY}.mongodb.net/${MONGO_DB_DATABASE}?retryWrites=true&w=majority`;
mongoose.connect(connectionURL, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// ???

const db = mongoose.connection;

db.once('open', () => {
  console.log('db is connected');

  const msgCollection = db.collection('messagecontents');
  const changeStream = msgCollection.watch();

  changeStream.on('change', (change) => {
    console.log(change);
    if (change.operationType === 'insert') {
      const messageDetails = change.fullDocument;
      pusher.trigger('messages', 'inserted', {
        name: messageDetails.name,
        message: messageDetails.message,
        timeStamp: messageDetails.timeStamp,
        received: messageDetails.received
      });
    } else {
      console.log('Error triggering Pusher');
    }
  });
});

// api-routes 3rd step
app.get('/', (req, res) => res.status(200).send('hello world'));

app.get('/messages/sync', (req, res) => {
  const dbMessage = req.body;
  Messages.find(dbMessage, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

app.post('/messages/new', (req, res) => {
  const dbMessage = req.body;
  Messages.create(dbMessage, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

// listen 4th step
app.listen(PORT, () => console.log(`listening on localhost:${PORT}`));
