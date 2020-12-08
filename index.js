// EXPRESS AND OTHER SETUP
const express = require('express');
const MongoUtil = require('./MongoUtil.js')
const hbs = require('hbs')
const wax = require('wax-on');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash')

// load in environment variables
require('dotenv').config();

// create the app
const app = express();
app.set('view engine', 'hbs')
// middleware to retrieve files from the public folder
app.use(express.static('public'))
// middleware to extract out information from forms
app.use(express.urlencoded({extended:false}))

// Setup the session
app.use(cookieParser(process.env.COOKIE_SECRET))
app.use(session({
    'cookie': {
        maxAge: 60000
    }
}))
app.use(flash())

// register a middleware (our custom one) for extracting
// out the flash message to put into hbs file
app.use(function(req,res,next){
    res.locals.success_messages = req.flash('success_messages');
    res.locals.error_messages = req.flash('error_messages');
    next();
})

// setup template inheritance
wax.on(hbs.handlebars);
wax.setLayoutPath('./views/layouts')

// handlebar helpers
 var helpers = require("handlebars-helpers")({
    handlebars: hbs.handlebars
  });


async function main() {
    const MONGO_URL=process.env.MONGO_URL;
    await MongoUtil.connect(MONGO_URL, "tgc9_fault_reporting");
    let db = MongoUtil.getDB();

    const faultRoutes = require('./routes/faultRoutes');

    app.use('/faults', faultRoutes);   
}   

main();

// LISTEN
app.listen(3000, ()=>{
    console.log("Express is running")
    
})