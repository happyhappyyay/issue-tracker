/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';
var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});
console.log(CONNECTION_STRING,1);

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      console.log("GET");
      var project = req.params.project;
      var query = req.query;
      console.log(req.query);
      if(query._id) query._id = ObjectId(query._id);
      if(query.open) {
        if(query.open == "true"){ 
          query.open = true;
        }
          else {
            query.open= false;
          }
        } 
console.log(query,1);
      MongoClient.connect(CONNECTION_STRING, {useNewUrlParser:true, useUnifiedTopology: true}, (err, client)=>{ 
        var db = client.db("issues");
        
      db.collection(project).find(query).toArray((err,issues)=>{
        if(!err){
        res.json(issues);
        }
        else {
          res.send("could not find requested issues");
        }
      });
    })
    })
    
    .post(function (req, res){
      console.log("POST");
      var project = req.params.project;
      var title = req.body.issue_title;
      var text = req.body.issue_text;
      var created = req.body.created_by;
      console.log(title,text,created);
      if(title != null & text != null & created != null){
        console.log("posted");
        var issue = {
          issue_title: req.body.issue_title,
          issue_text: req.body.issue_text,
          created_on: new Date(),
          updated_on: new Date(),
          created_by: req.body.created_by,
          assigned_to: req.body.assigned_to || '',
          open: true,
          status_text: req.body.status_text || ''
        };

      MongoClient.connect(CONNECTION_STRING, {useNewUrlParser:true, useUnifiedTopology: true}, (err, client)=>{ 
        var db = client.db("issues");
      db.collection(project).insertOne(issue,(err,issue)=>{
          if(!err){
            res.json(issue.ops);
            }
            else {
              res.json({"error":"could not create issue. please try again later."})
            }
          }
        );
      });
    }
    else {
      res.send("please complete required fields")
    }
    })
    
    .put(function (req, res){
      console.log("PUT");
      var project = req.params.project;
      var id = req.body._id;
      delete req.body._id;
      var updates = req.body;
      for(var i in updates){
        if(!updates[i]){
          delete updates[i];
        }
      }
      if(Object.keys(updates).length > 0){
        updates["updated_on"] = new  Date();
        if(updates.open){
          if(updates.open == "true"){
            updates.open = true;
          }
          else if (updates.open == "false"){
            updates.open = false;
          }
        }
      MongoClient.connect(CONNECTION_STRING, {useNewUrlParser:true, useUnifiedTopology: true}, (err, client)=>{ 
        var db = client.db("issues");
        db.collection(project).findOneAndUpdate({_id:ObjectId(id)},{$set: updates},{new:true},(err)=>{
          if(!err){
            res.send("Successfully updated " + id);
          }
          else {
            res.send("Could not update " + id);
          }
          })
        });
      }
      else {
        res.send("no updated field sent");
      }
    })
    
    .delete(function (req, res){
      console.log("DELETE");
      var project = req.params.project;
      var id = req.body._id;
      if(id){
        MongoClient.connect(CONNECTION_STRING, {useNewUrlParser:true, useUnifiedTopology: true}, (err, client)=>{ 
          var db = client.db("issues");
        db.collection(project).deleteOne({_id:ObjectId(id)},(err)=>{
          if(!err){
            res.send("deleted " + id);
          }
          else{
            res.send("could not delete " + id);
          }
        })
      });
      }
      else {
        res.send("_id error");
      }
    });
};
