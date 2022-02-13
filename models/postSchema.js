const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
  title: {type: String, required: true},
  content: String,
  img: {
    data: Buffer,
    contentType: String,
    path: String,
    converted: {type: Boolean, default: false}
  },
  comments: [
    {text: String,
    date: Date}
  ]
})

const Post = mongoose.model('Post', postSchema)

module.exports = Post
