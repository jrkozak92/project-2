const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
  name: {type: String, required: true},
  status: {type: Boolean, default: false},
  notes: String
  //You can do more, but definitely don't need to. come back and change this if you want, just remember to drop the collection before adding first data post-change
}, {timestamps:true})

const Task = mongoose.model('Task', taskSchema)

module.exports = Task
