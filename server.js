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
      title: 'Share | Add'
    })
})
// Got Image handling here: https://www.geeksforgeeks.org/upload-and-retrieve-image-on-mongodb-using-mongoose/
//Create: /share
app.post('/share', upload.single('img'), (req, res, next) => {
  let shareObj = {
    title: req.body.title,
    content: req.body.content,
    img: {
      data: fs.readFileSync(path.join('./public/uploads/' + req.file.filename)),
      contentType: 'image/png'
    }
  }
  console.log('Share Object: ', shareObj);
  Share.create(shareObj, (err, share) => {
    console.log(share)
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
app.put('/share/:id', (req, res) => {
  Share.findByIdAndUpdate(req.params.id, req.body, {new:true}, (err, update) => {
    console.log(update)
    res.redirect('/share')
  })
})

//Delete: /share/:id
app.delete('/share/:id', (req, res) => {
  // Share.findByIdAndRemove(req.params.id, (err, removedShare) => {
  //   console.log(removedShare)
  //   res.redirect('/share')
  // })
})



//___________________
//Listener
//___________________
app.listen(PORT, () => console.log( 'Listening on port:', PORT));
