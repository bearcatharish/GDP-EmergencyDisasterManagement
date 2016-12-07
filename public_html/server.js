/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var express = require('express');
var http = require('http');
var assert = require('assert');
var fs = require('fs');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({extended: true})); // support encoded bodies
var router = express.Router();
var mongo = require('mongodb');
var mongoClient = mongo.MongoClient;

var url = 'mongodb://localhost:27017/MDB';
app.use(express.static(__dirname));

app.get('/', function (req, res) {
    res.sendFile(__dirname + "/Volunteers.html");
    //res.render('/index')
});
app.get('/Volunteers', function (req, res) {
    mongoClient.connect(url, function (err, db) {

        if (err) {
            console.error('Error occured in database');
            res.send("Error in connection");

        } else {
            var volunteersList = [];
            console.log('Connection established ' + url);
            var cursor = db.collection('Volunteers').find();
            cursor.forEach(function (doc, err) {
                if (err) {
                    console.log(err);
                } else {
                    volunteersList.push(doc);
                    console.log('Volunteers Fetched');
                   
                }
//                 console.log(volunteersList);
            }
            , function () {
                db.close();        
                res.sendFile(__dirname + "/Volunteers.html");
            });
        }
    });
});
app.post('/insertVolunteer', function (req, res) {
    console.log("In Insert");
    var newVolunteer = {
        _id:3,
        fName: req.body.firstname,
        lName: req.body.lastname,
        Address: req.body.address,
        email: req.body.email,
        profession: req.body.prof,
        contact: req.body.contact,
        age: req.body.age
//        dateTo: req.body.dt1
    };
    
    mongoClient.connect(url, function (err, db) {
        if (err) {
            console.error('Error occured in database');
            res.send("Error in connection");

        } else {
            console.log('Connection established ' + url);
            db.collection('Volunteers').count({email: newVolunteer.email}, function (err, count) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(count);
//                    var number = count;
                    if (count === 0) {
                        db.collection('Volunteers').insert(newVolunteer, function (err, result) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log('Item Inserted');
                                res.sendFile(__dirname + "/Volunteers.html");
                                db.close();
                            }
                        });

                    } else {
                        res.send("already exists");
                        db.close();

                    }
                }


            });

        }
    });


});

app.listen(3000);
console.log('Running on port 3000');

http.createServer(function (request, response) {
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end('Page One');
}).listen(80);
console.log("Server is listening");
