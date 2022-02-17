//___________________
//Dependencies
//___________________
const express = require('express');
const methodOverride  = require('method-override');
const mongoose = require ('mongoose');
const app = express ();
const db = mongoose.connection;
require('dotenv').config()
const Task = require('./models/taskSchema.js')
const Share = require('./models/shareSchema.js')
const Post = require('./models/postSchema.js')
const { promisify } = require('util')
const convert = require('heic-convert')

//Node Modules
const fs = require('fs')
const path = require('path')

//Image Handler Package: Multer
const multer = require('multer')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/uploads')
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now())
  }
})

const upload = multer({storage: storage})

//___________________
//Port
//___________________
// Allow use of Heroku's port or your own local port, depending on the environment
const PORT = process.env.PORT || 3003;

//___________________
//Database
//___________________
// How to connect to the database either via heroku or locally
const MONGODB_URI = process.env.MONGODB_URI;

// Connect to Mongo &
// Fix Depreciation Warnings from Mongoose
// May or may not need these depending on your Mongoose version
mongoose.connect(MONGODB_URI);

// Error / success
db.on('error', (err) => console.log(err.message + ' is Mongod not running?'));
db.on('connected', () => console.log('mongo connected: ', MONGODB_URI));
db.on('disconnected', () => console.log('mongo disconnected'));

//___________________
//Middleware
//___________________

//use public folder for static assets
app.use(express.static('public'));

// populates req.body with parsed info from forms - if no data from forms will return an empty object {}
app.use(express.urlencoded({ extended: false }));// extended: false - does not allow nested objects in query strings
app.use(express.json());// returns middleware that only parses JSON - may or may not need it depending on your project

//use method override
app.use(methodOverride('_method'));// allow POST, PUT and DELETE from a form


//___________________
// Routes
//___________________
//localhost:3000
app.get('/' , (req, res) => {
  res.redirect('/tracker');
});
//___________________
//  Tracker
//___________________

//Index: /tracker/
app.get('/tracker', (req, res) => {
  Task.find({}, (err, tasks) => {
    res.render('./tracker/index.ejs',
      {
        title: 'Tracker | Home',
        tasks: tasks
      })
  })

})

//New: /tracker/new
app.get('/tracker/new', (req, res) => {
  res.render('./tracker/new.ejs',
    {
      title: 'Tracker | Add'
    })
})

//Create: /tracker
app.post('/tracker', (req, res) => {
  Task.create(req.body, (err, task) => {
    console.log(task)
    res.redirect('/tracker')
  })
})

//Show: /tracker/:id
app.get('/tracker/:id', (req, res) => {
  Task.findById(req.params.id, (err, task) => {
    res.render('./tracker/show.ejs',
      {
        title: 'Tracker | Item',
        task: task
      })
    })
  }
)

//Edit: /tracker/:id/edit
app.get('/tracker/:id/edit', (req, res) => {
  Task.findById(req.params.id, (err, task) => {
    res.render('./tracker/edit.ejs',
      {
        title: 'Tracker | Edit',
        task: task
      })
    })
  }
)

//Update: /tracker/:id
app.put('/tracker/:id', (req, res) => {
  if (req.body.status === "on"){
    req.body.status = true
  } else {
    req.body.status = false
  }
  // res.send(req.body)
  Task.findByIdAndUpdate(req.params.id, req.body, {new:true}, (err, update) => {
    console.log(update)
    res.redirect('/tracker')
  })
})

//Delete: /tracker/:id
app.delete('/tracker/:id', (req, res) => {
  Task.findByIdAndRemove(req.params.id, (err, removedTask) => {
    console.log(removedTask)
    res.redirect('/tracker')
  })
})

//___________________
//  Share
//___________________

//Index: /share/
app.get('/share', (req, res) => {
  Share.find({}, (err, shares) => {
    res.render('./share/index.ejs',
      {
        title: 'Share | Home',
        shares: shares
      })
  })
})

//New: /share/new
app.get('/share/new', (req, res) => {
  res.render('./share/new.ejs',
    {
      title: 'Share | Add',
      tasks: undefined
    })
})

//New from Tracker
app.get('/tracker/:id/share', (req, res) => {
  Task.findById(req.params.id, (err, task) => {
    res.render('./share/new.ejs',{
      title: 'Share | Add',
      task: task
    })
  })
})
// Got Image handling here: https://www.geeksforgeeks.org/upload-and-retrieve-image-on-mongodb-using-mongoose/
// Got HEIC handling here: https://www.npmjs.com/package/heic-convert
//Create: /share
app.post('/share', upload.single('img'), (req, res, next) => {
  let shareObj = {
    title: req.body.title,
    content: req.body.content
  }
  if (req.file) {
    shareObj.img = {data: undefined, contentType: '', path: '', converted: undefined}
    if (req.file.mimetype === 'image/heic'){
      //run convert on data and update mimetype
      (async () => {
        const inputBuffer = await promisify(fs.readFile)(path.join('./public/uploads/' + req.file.filename))
        const outputBuffer = await convert({
          buffer: inputBuffer,
          format: 'PNG'
        })

        await promisify(fs.writeFile)(shareObj.img.path + '.png', outputBuffer)
        fs.unlink(shareObj.img.path, () => {})
      })()
      shareObj.img.converted = true
      shareObj.img.path = req.file.path
      shareObj.img.contentType = 'image/png'
    } else {
      shareObj.img = {
        data: fs.readFileSync(path.join('./public/uploads/' + req.file.filename)),
        contentType: req.file.mimetype,
        path: req.file.path
      }
    }
  }

  Share.create(shareObj, (err, share) => {
    res.redirect('/share')
  })
})

//Show: /share/:id
app.get('/share/:id', (req, res) => {
  Share.findById(req.params.id, (err, share) => {
    res.render('./share/show.ejs',
      {
        title: 'Share | Item',
        share: share
      })
    })
  }
)

//Edit: /share/:id/edit
app.get('/share/:id/edit', (req, res) => {
  Share.findById(req.params.id, (err, share) => {
    res.render('./share/edit.ejs',
      {
        title: 'Share | Edit',
        share: share
      })
    })
  }
)

//Update: /share/:id
app.put('/share/:id', upload.single('img'), (req, res) => {
  let shareObj = {
    title: req.body.title,
    content: req.body.content
  }
  let imgMod = false
  if (req.file) {
    imgMod = true
    shareObj.img = {data: undefined, contentType: '', path: '', converted: undefined}
    if (req.file.mimetype === 'image/heic'){
      //run convert on data and update mimeShare
      (async () => {
        const inputBuffer = await promisify(fs.readFile)(path.join('./public/uploads/' + req.file.filename))
        const outputBuffer = await convert({
          buffer: inputBuffer,
          format: 'PNG'
        })

        await promisify(fs.writeFile)(shareObj.img.path + '.png', outputBuffer)
        fs.unlink(shareObj.img.path, () => {})
      })()
      shareObj.img.converted = true
      shareObj.img.contentType = 'image/png'
      shareObj.img.path = req.file.path
    } else {
      shareObj.img = {
        data: fs.readFileSync(path.join('./public/uploads/' + req.file.filename)),
        contentType: req.file.mimetype,
        path: req.file.path,
        converted:false
      }
    }
  }
  // This handles all cases except removing an image and converting to text-only
  // could handle this with another check box or something
  Share.findByIdAndUpdate(req.params.id, shareObj, {new:false}, (err, update) => {
    if (imgMod) {
      if (update.img.converted === true) {
        fs.unlink(update.img.path + '.png', () => {
          res.redirect('/share')
        })
      } else {
        fs.unlink(update.img.path, () => {
          res.redirect('/share')
        })
      }
    } else {
      res.redirect('/share')
    }
  })
})

//Delete: /share/:id
app.delete('/share/:id', (req, res) => {
  Share.findByIdAndRemove(req.params.id, (err, removedShare) => {
    console.log(removedShare)
    if (removedShare.img.converted === true){
      fs.unlink(removedShare.img.path + '.png', () => {
        res.redirect('/share')
      })
    } else if (removedShare.img.path !== undefined){
      fs.unlink(removedShare.img.path, () => {
        res.redirect('/share')
      })
    } else {
      res.redirect('/share')
    }
  })
})

//___________________
//  Help
//___________________

//Index: /help/
app.get('/help', (req, res) => {
  Post.find({}, (err, posts) => {
    res.render('./help/index.ejs',
      {
        title: 'Lost & Found | Home',
        posts: posts
      })
  })
})

app.get('/help/map', (req, res) => {
  Post.find({}, (err, posts) => {
    res.render('./help/map.ejs',
      {
        title: 'Lost & Found | Map',
        posts: posts
      })
  })
})

//New: /help/new takes you to map to select coords
app.get('/help/new', (req, res) => {
  res.render('./help/new-map.ejs',
    {
      title: 'Lost & Found | Add Location'
    })
})

//Still New: /help/new opens new form page and brings coords with it
app.post('/help/new', (req, res) => {
  res.render('./help/new.ejs',
    {
      title: 'Lost & Found | Add Info',
      coords: req.body.coords
    })
})


// Got Image handling here: https://www.geeksforgeeks.org/upload-and-retrieve-image-on-mongodb-using-mongoose/
// Got HEIC handling here: https://www.npmjs.com/package/heic-convert
//Create: /help
app.post('/help', upload.single('img'), (req, res, next) => {
  const coordsArray = req.body.coords.split(', ')
  coordsArray[0] = coordsArray[0].slice(1)
  coordsArray[1] = coordsArray[1].slice(0,-1)
  const lat = Number(coordsArray.slice(0,1))
  const lng = Number(coordsArray.slice(-1))
  req.body.coords = {lat, lng}

  const shareObj = {
    title: req.body.title,
    content: req.body.content,
    type: req.body.type,
    markers: [
      {coords: req.body.coords, note: 'First seen here'}
    ]
  }
  if (req.file) {
    shareObj.img = {data: undefined, contentType: '', path: '', converted: undefined}
    if (req.file.mimetype === 'image/heic'){
      //run convert on data and update mimeShare
      (async () => {
        const inputBuffer = await promisify(fs.readFile)(path.join('./public/uploads/' + req.file.filename))
        var outputBuffer = await convert({
          buffer: inputBuffer,
          format: 'PNG'
        })

        await promisify(fs.writeFile)(req.file.path + '.png', outputBuffer)
        fs.unlink(req.file.path, () => {})
      })()
      shareObj.img.contentType = 'image/png'
      shareObj.img.path = req.file.path
      shareObj.img.converted = true

    } else {
      shareObj.img = {
        data: fs.readFileSync(path.join('./public/uploads/' + req.file.filename)),
        contentType: req.file.mimetype,
        path: req.file.path
      }
    }
  }
  Post.create(shareObj, (err, post) => {
    res.redirect('/help')
  })
})

//Show: /help/:id
app.get('/help/:id', (req, res) => {
  Post.findById(req.params.id, (err, post) => {
    res.render('./help/show.ejs',
      {
        title: 'Lost & Found | Post',
        post: post
      })
    })
  }
)

//Edit: /help/:id/edit
app.get('/help/:id/edit', (req, res) => {
  Post.findById(req.params.id, (err, post) => {
    res.render('./help/edit.ejs',
      {
        title: 'Lost & Found | Edit',
        post: post
      })
    })
  }
)

//Comment: /help/:id/comment
app.get('/help/:id/comment', (req, res) => {
  Post.findById(req.params.id, (err, post) => {
    res.render('./help/comment.ejs',
      {
        title: 'Lost & Found | Comment',
        post: post
      })
  })
})
 //Add new comment:
 //Found help here: https://stackoverflow.com/questions/33049707/push-items-into-mongo-array-via-mongoose#:~:text=Use%20%24push%20to%20update%20document,new%20value%20inside%20an%20array.&text=Another%20way%20to%20push%20items,to%20be%20pushed%20into%20array.
app.put('/help/:id/addComment', (req, res) => {
  let now = new Date(Date.now());
  now = now.toString().slice(0,-36)
  let newComment = {$push: {comments: {text: req.body.newComment, date:now}}}
  // res.send(req.body)
  Post.findByIdAndUpdate(req.params.id, newComment, (err, post) => {
    res.redirect('/help/' + post.id)
  })
})

app.get('/help/:id/sightings', (req, res) => {
  Post.findById(req.params.id, (err, post) => {
    res.render('./help/add-map.ejs',
      {
        title: ' Lost & Found | Sightings',
        post: post
      })
  })
})

app.put('/help/:id/sightings', (req, res) => {
  const coordsArray = req.body.coords.split(', ')
  coordsArray[0] = coordsArray[0].slice(1)
  coordsArray[1] = coordsArray[1].slice(0,-1)
  const lat = Number(coordsArray.slice(0,1))
  const lng = Number(coordsArray.slice(-1))
  req.body.coords = {lat, lng}
  let newSighting = {$push: {markers: {coords: req.body.coords, note: req.body.note}}}
  Post.findByIdAndUpdate(req.params.id, newSighting, (err, update) => {
    res.redirect('/help/' + req.params.id)
  })
})

//Update: /help/:id
app.put('/help/:id', upload.single('img'), (req, res) => {
  let shareObj = {
    title: req.body.title,
    content: req.body.content,
    type: req.body.type
  }
  let imgMod = false
  if (req.file) {
    imgMod = true
    shareObj.img = {data: undefined, contentType: '', path: '', converted: undefined}
    if (req.file.mimetype === 'image/heic'){
      //run convert on data and update mimetype
      (async () => {
        const inputBuffer = await promisify(fs.readFile)(path.join('./public/uploads/' + req.file.filename))
        const outputBuffer = await convert({
          buffer: inputBuffer,
          format: 'PNG'
        })

        await promisify(fs.writeFile)(shareObj.img.path + '.png', outputBuffer)
        fs.unlink(shareObj.img.path, () => {})
      })()
      shareObj.img.converted = true
      shareObj.img.path = req.file.path
      shareObj.img.contentType = 'image/png'
    } else {
      shareObj.img = {
        data: fs.readFileSync(path.join('./public/uploads/' + req.file.filename)),
        contentType: req.file.mimetype,
        path: req.file.path,
        converted:false
      }
    }
  }
  // This handles all cases except removing an image and converting to text-only
  // could handle this with another check box or something
  Post.findByIdAndUpdate(req.params.id, shareObj, {new:false}, (err, update) => {
    if (imgMod) {
      if (update.img.converted === true) {
        fs.unlink(update.img.path + '.png', () => {
          res.redirect('/help')
        })
      } else {
        fs.unlink(update.img.path, () => {
          res.redirect('/help')
        })
      }
    } else {
      res.redirect('/help')
    }

  })
})

//Delete: /help/:id
app.delete('/help/:id', (req, res) => {
  Post.findByIdAndRemove(req.params.id, (err, removedPost) => {
    console.log(removedPost)
    if (removedPost.img.converted === true){
      fs.unlink(removedPost.img.path + '.png', () => {
        res.redirect('/help')
      })
    } else if (removedPost.img.path !== undefined){
      fs.unlink(removedPost.img.path, () => {
        res.redirect('/help')
      })
    } else {
      res.redirect('/help')
    }
  })
})

//Delete Comment: /help/:id/comment/:id
app.delete('/help/:id/comment/:commentId', (req, res) => {
  Post.findById(req.params.id, (err, post) => {
    async function removeComment(){
      post.comments.id(req.params.commentId).remove()
      await post.save({w: 1, j: true})
      res.redirect('/help/' + req.params.id)
    }
    removeComment()
  })
})

//___________________
//Listener
//___________________
app.listen(PORT, () => console.log( 'Listening on port:', PORT));
