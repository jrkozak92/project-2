const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
  title: {type: String, required: true},
  content: String,
  type: String,
  img: {
    data: Buffer,
    contentType: String,
    path: String,
    converted: {type: Boolean, default: false}
  },
  comments: [
    {text: String,
    date: String}
  ]
})

const Post = mongoose.model('Post', postSchema)

module.exports = Post
// Add field for type - lost vs found vs made it home
// write style handlers for each
