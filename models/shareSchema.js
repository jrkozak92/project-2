const mongoose = require('mongoose')

const shareSchema = new mongoose.Schema({
  title: {type: String, required: true},
  content: String,
  img: {
    data: Buffer,
    contentType: String,
    path: String
  },
  comments: [
    {text: String,
    date: Date}
  ]
})

const Share = mongoose.model('Share', shareSchema)

module.exports = Share
