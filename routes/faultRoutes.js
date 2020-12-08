const express = require('express');
const router = express.Router();
const MongoUtil = require('../MongoUtil')
const ObjectId = require('mongodb').ObjectId;

let db = MongoUtil.getDB();

// define a constant to hold the name of our faults collection
const COLLECITON_NAME = "faults";

router.get('/', async (req, res) => {
    let results = await db.collection(COLLECITON_NAME).find().toArray();
    res.render('faults', {
        'allFaults': results
    })
})

router.get('/add', (req, res) => {
    res.render('fault_form', {
        fault: {
            title: '',
            location:'',
            tags:[],
            block:'',
            reporter_email:'',
            reporter_name:'',
            date: new Date()
        }
    })
})

router.post('/add', async (req, res) => {
    let { title, location, tags, block, reporter_name, reporter_email, date } = req.body;
    
    if (!Array.isArray(tags)) {
        if (!tags) {
            tags = []
        } else {
            tags = ['tags']
        }
    }

    if (!block) {
        block = "304";
    }
    
    let newFaultRecord = {
        title, location, tags, block, reporter_name, reporter_email,
        'date': new Date(date)

    };
    await db.collection(COLLECTION_NAME).insertOne(newFaultRecord);
    res.redirect('/faults')
})

router.get('/:id/update', async (req,res)=>{
    // 1. get the record that we want to update
    let fault = await db.collection(COLLECITON_NAME).findOne({
        '_id': ObjectId(req.params.id)
    });

    // 2. display that record in a form
    res.render('fault_form', {
        'fault': fault
    })
})

module.exports = router;