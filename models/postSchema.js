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
  ],
  markers: [
    {
      coords: {lat: {type:Number, required:true}, lng: {type:Number, required:true}}
    }
  ]
})

const Post = mongoose.model('Post', postSchema)

module.exports = Post
// Add field for type - lost vs found vs made it home
// write style handlers for each
