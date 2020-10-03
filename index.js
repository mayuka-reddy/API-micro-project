const express=require("express");
const app=express();

//connecting server file for awt
let server= require('./server');
let middleware=require('./middleware');

//bodyparser
const bodyParser=require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//for mongodb
const MongoClient=require('mongodb').MongoClient;

//database connection
const url='mongodb://127.0.0.1:27017';
const dbName='hospital';
let db

MongoClient.connect(url,{useUnifiedTopology: true},(err,client)=>{
    if(err) return console.log(err);
    db=client.db(dbName);
    console.log(`connected mongodb:${url}`);
    console.log(`Database: ${dbName}`);
})
//fetching hospital details
app.get('/hospitaldetails',middleware.checkToken,function(req,res){
    console.log("Fetching details from hospital collection");
    var data=db.collection('hospitalInventory').find().toArray()
    .then(result=>res.json(result));
});

//ventilator details
app.get('/ventilatordetails',middleware.checkToken,(req,res)=>{
    console.log("ventilator details");
    var ventilatordetails=db.collection('ventilator').find().toArray().then(result=>res.json(result));
});
//search ventilator deatils by status
app.post('/searchventbystatus',middleware.checkToken,(req,res)=>{
    var status=req.body.status;
    console.log(status);
    var ventilatordetails=db.collection('ventilator')
    .find({"status":status}).toArray().then(result=>res.json(result));
});

//search ventilators by hospital name
app.post('/searchventbyname',middleware.checkToken,(req,res)=>{
    var name=req.query.name;
    console.log(name);
    var ventilatordetails=db.collection('ventilator')
    .find({'name': new RegExp(name,'i')}).toArray().then(result=>res.json(result));
});

//search hospital by name
app.post('/searchhospital',middleware.checkToken,(req,res)=>{
    var name=req.query.name;
    console.log(name);
    var hospitaldetails=db.collection('hospitalInventory')
    .find({'name': new RegExp(name,'i')}).toArray().
    then(result=>res.json(result));
});
//update ventilator details
app.put('/updateventilator',middleware.checkToken,(req,res)=>{
    var ventid={ventilatorId: req.body.ventilatorId};
    console.log(ventid);
    var newvalues={$set: {status: req.body.status}};
    db.collection('ventilator').updateOne(ventid,newvalues,function(err,result){
        res.json('1 document updated ');
        if(err) throw err;
    });
});

//add ventilator
app.post('/addventilatorbyuser',middleware.checkToken,(req,res)=>{
    var hid=req.body.hid;
    var ventilatorId=req.body.ventilatorId;
    var status=req.body.status;
    var name=req.body.name;

    var item=
    {
        hid:hid,ventilatorId:ventilatorId,status:status,name:name
    };
    db.collection('ventilator').insertOne(item,function(err,result){
        res.json('Item inserted');
    });
});

//delete by ventilator by ventilatorid
app.delete('/delete',middleware.checkToken,(req,res)=>{
    var myquery=req.query.ventilatorId;
    console.log(myquery);

    var myquery1={ventilatorId: myquery};
    db.collection('ventilator').deleteOne(myquery1,function(err,obj)
    {
        if(err) throw err;
        res.json("1 document deleted");
    });

});
app.listen(8002);