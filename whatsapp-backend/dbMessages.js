const mongoose = require('mongoose');

const whatsAppSchema = mongoose.Schema({
  message: String,
  name: String,
  timeStamp: String,
  received: Boolean
});

//
module.exports = mongoose.model('messagecontents', whatsAppSchema);
