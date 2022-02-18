# Pet Tracker

## Live App 
https://stark-beach-27454.herokuapp.com/tracker

## Technologies
### Basic Server Stuff
Express, Mongoose, dotenv, and methodOverride were all used for basic server & database management

## Heroku and MongoDB Atlas
Cloud based deployment was achieved using Heroku for hosting and MongoDB's Atlas Cloud Database hosting for a persistent database.

### Multer
fs, path, Multer

Multer is an NPM package that creates a file object on a given request body when an image is passed in a form field. This allows you to convert the image file into raw image data, which allows it to be stored in MongoDB as a buffer when used with fs and path in Node and retrieved as needed on demand with no actual file-storage necessary on the file structure.

### HEIC-Convert
util, heic-convert, fs, path

heic-convert is an NPM package that converts the HEIC filetype to PNG or JPG, and uses Node's util, fs, and path packages to manage promises and file management. I attempted to use this package with HEIC images directly off MacBook's Photos app, but the storage requirements overfill Heroku and cause a server crash. Fortunately, iPhones automatically convert HEIC images to JPG when uploading, so the only issue arises in the exact use case I meant it to handle, which is something that would need more attention for production.

## Approach
MVC controlled, Mobile first designed, relied on bootstrap for responsiveness, simple design wireframed beforehand with full week schedule estimated day 1.
Worked simplest to most complex. The point of the assignment was to create a RESTful CRUD app, and Tracker was the most straightforward starting point, so I built out a very bare-bones version including all RESTful routes before moving on to Share. Share & Lost & Found were very similar in functionality, with the exception of Google Maps, and were more or less built concurrently. Once the basics were taken care of, I moved to implementing Google Maps, which was time consuming, but easier than expected. Once Google Maps basics were implemented and functional, attention moved to nice to have functionality, creating links across the various disparate parts of the applciation, and polishing the styling.

## Unsolved Problems
heic-convert still crashes the application on Heroku when it triggers. It works fine locally, but hits a storage limit on Heroku.
It would have been cool to get user auth working, but it felt like to much risk for too little reward by the end of the week.

## User Stories 
Jordan and Riley have a dog together and have trouble keeping track if the other had fed the dog, given it's medicine, and taken it out that morning already or not. Tracker allows them to keep track and have live updates across devices on which daily tasks have been completed and which still need to be done.

Alesha comes home to find her dog has dug out of her backyard and is nowhere to be found. Lost & Found allows her to check the local live map of pets seen around her neighborhood, and post a picture of her dog for others in her area to keep an eye out for them.

John just had a breakthrough with his dog while doing their evening training seession. Once he marks it complete, he can share an update with the PetTracker community on this momentous occasion!

## Future Additions
User Auth
  Usernames on comments
  User specific controls for comment removal and editing
  That's my pet! button for user to share info when their pet is found
  Ability to have a shared Tracker with other users
Google Maps
  Custom markers to highlight and better pinpoint locations of lost/found pets on the live map
  Single button directioins to a given marker's location would be cool
Daily Resets/Handling for recurring events in Tracker
  Seems like a very in-depth task while I was trying to keep it simple, and never got back around to it. I don't think it would be too demanding, just requries some forethought I didn't have time for.
  
