const express = require('express');
const router = express.Router();
const MongoUtil = require('../MongoUtil')
const ObjectId = require('mongodb').ObjectId;


let db = MongoUtil.getDB();

// define a constant to hold the name of our faults collection
const COLLECTION_NAME = "faults";

router.get('/', async (req, res) => {
    let results = await db.collection(COLLECTION_NAME).find().toArray();
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
    req.flash('success_messages', 'New fault added!')
    res.redirect('/faults')
})

router.get('/:id/update', async (req,res)=>{
    // 1. get the record that we want to update
    let fault = await db.collection(COLLECTION_NAME).findOne({
        '_id': ObjectId(req.params.id)
    });

    // 2. display that record in a form
    res.render('fault_form', {
        'fault': fault
    })
})

router.post('/:id/update', async (req, res)=>{
    // spread operator
    let updatedFaultRecord = {...req.body};
    /* using the spred operator is e.q.v. the code below
    let updatedFaultRecord = {};
    updatedFaultRecord.title = req.body.title;
    updatedFaultRecord.location = req.body.location;
    updatedFaultRecord.block = req.body.block;
    updatedFaultRecord.tags = req.body.tags
    updatedFaultRecord.reporter_email = req.body.reporter_email
    updatedFaultRecord.reporter_name = req.body.reporter_name
    */

    updatedFaultRecord.tags = updatedFaultRecord.tags || [];
    /*
    .e.q.v:
    if (!updatedFaultRecord.tags) {

        updatedFaultRecord.tags = [];
    }

    */
   updatedFaultRecord.tags = Array.isArray(updatedFaultRecord.tags) ?
                            updatedFaultRecord.tags : [updatedFaultRecord.tags];

    /* eqv.
    if (Array.isArray(updatedFaultRecord.tags)) {
        updatedFaultRecord.tags = updatedFaultRecord.tags;
    } else {
        updatedFaultRecord.tags = [updatedFaultRecord.tags];
    }

    */

    updatedFaultRecord.block = updatedFaultRecord.block || "304";

    await db.collection(COLLECTION_NAME).updateOne({
        '_id':ObjectId(req.params.id)
    }, {
        '$set':updatedFaultRecord
    });

    res.redirect('/faults');

})

router.get('/:id/delete', async (req,res)=>{
    let faultRecord = await db.collection(COLLECTION_NAME).findOne({
        '_id':ObjectId(req.params.id)
    })

    res.render('confirm_delete_fault', {
        'fault':faultRecord
    })
})

router.post('/:id/delete', async(req, res)=>{
    await db.collection(COLLECTION_NAME).deleteOne({
        '_id':ObjectId(req.params.id)
    })
    res.redirect('/faults')
})

module.exports = router;