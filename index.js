// EXPRESS AND OTHER SETUP
const express = require('express');
const MongoUtil = require('./MongoUtil.js')
const hbs = require('hbs')
const wax = require('wax-on')

// load in environment variables
require('dotenv').config();

// create the app
const app = express();
app.set('view engine', 'hbs')
app.use(express.static('public'))
app.use(express.urlencoded({extended:false}))

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

    app.get('/', async (req,res)=>{
        let results = await db.collection('faults').find().toArray();
        res.render('faults', {
            'allFaults': results
        })
    })

    app.get('/fault/add', (req,res)=>{
        res.render('add_fault')
    })

    app.post('/fault/add', async (req,res)=>{
        let { title, location, tags, block, reporter_name, reporter_email, date} = req.body;
        let newFaultRecord = {
            title, location, tags, block, reporter_name, reporter_email,
            'date': new Date(date)

        };
        await db.collection('faults').insertOne(newFaultRecord);
        res.redirect('/')
    })
}   

main();

// LISTEN
app.listen(3000, ()=>{
    console.log("Express is running")
    
})