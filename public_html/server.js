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
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


app.get('/Login', function (req, res) {
    res.sendFile(__dirname + "/LoginPage.html");
    //res.render('/index')
});

//app.get('/hello',function(req,res){
//    
//     var volunteersList = [];
//    mongoClient.connect(url, function (err, db) {
//
//        if (err) {
//            console.error('Error occured in database');
//            res.send("Error in connection");
//
//        } else {
//
//            console.log('Connection established ' + url);
//            var cursor = db.collection('Volunteers').find();
//            cursor.forEach(function (doc, err) {
//                if (err) {
//                    console.log(err);
//                } else {
//                    volunteersList.push(doc);
//                    console.log(volunteersList);
//                    console.log('Volunteers Fetched');
//
//                }
//            }
//            , function () {
//                db.close();
//                res.render('hello',{vol: volunteersList});
//                //res.render('Volunteers',{vol: volunteersList});
//            });
//        }
//    });
//    
//    //res.render('hello',{names: JSON.stringify(["Daniel", "Sarah", "Peter"])    });
//});
app.get('/Volunteers', function (req, res) {
    console.log(req);
    console.log(res);
    var volunteersList = [];
    mongoClient.connect(url, function (err, db) {

        if (err) {
            console.error('Error occured in database');
            res.send("Error in connection");

        } else {

            console.log('Connection established ' + url);
            var cursor = db.collection('Volunteers').find();
            cursor.forEach(function (doc, err) {
                if (err) {
                    console.log(err);
                } else {
                    volunteersList.push(doc);
                    console.log(volunteersList);
                    console.log('Volunteers Fetched');

                }
            }
            , function () {
                db.close();
                res.render('Volunteers', {vol: volunteersList});
            });
        }
    });
});
app.post('/Login', function (req, res) {
    var login = {
        emailID: req.body.emailID,
        password: req.body.password

    };
    mongoClient.connect(url, function (err, db) {
        if (err) {
            console.error('Error occured in database');
            res.send("Error in connection");

        } else {
            console.log('Connection established ' + url);
            db.collection('admin').count({emailID: login.emailID}, function (err, count) {
                if (err) {
                    console.log(err);
                } else {
                    if (count === 0) {
                        res.send("Invalid Username");
                    } else {
                        db.collection('admin').count({password: login.password}, function (err, count) {
                            if (err) {
                                console.log(err);
                            } else {
                                if (count === 0) {
                                    res.send("Invalid password");
                                } else {
                                    res.render('Login', {emailID: login.emailID});
                                    db.close();
                                }
                            }
                        });
                        db.close();
                    }
                }
            });
        }
    });


});
app.post('/insertVolunteer', function (req, res) {
    console.log("In Insert");

    var newVolunteer = {
        _id: 10,
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
                                var volunteersList = [];
                                mongoClient.connect(url, function (err, db) {

                                    if (err) {
                                        console.error('Error occured in database');
                                        res.send("Error in connection");

                                    } else {

                                        console.log('Connection established ' + url);
                                        var cursor = db.collection('Volunteers').find();
                                        cursor.forEach(function (doc, err) {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                volunteersList.push(doc);
                                                console.log(volunteersList);
                                                console.log('Volunteers Fetched');

                                            }
                                        }
                                        , function () {
                                            db.close();
                                            res.render('Volunteers', {vol: volunteersList});
                                        });
                                    }
                                });
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
