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
var autoIncrement = require("mongodb-autoincrement");

//below code is for connecting back4app which is a cloud service which connects mobile app and web application
/*
 app.post('/someFunction', function (req, res) {
 Parse.Cloud.run('someFunction', req.body).then(
 function () {
 console.log('Cloud Code Function called');
 return res.send(200);
 },
 function (error) {
 console.log("CLoud Code Function Called Fail");
 return res.status(400).send(error.message);
 });
});
 */
//View Engine
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


app.get('/Login', function (req, res) {
    res.sendFile(__dirname + "/LoginPage.html");
    //res.render('/index')
});

app.get('/Volunteers', function (req, res) {
    var volunteersList = [];
    mongoClient.connect(url, function (err, db) {

        if (err) {
            console.error('Error occured in database');
            res.send("Error in connection");

        } else {

            console.log('Connection established ' + url);
            var cursor = db.collection('Volunteers').find();
            console.log('Volunteers Fetched');
            cursor.forEach(function (doc, err) {
                if (err) {
                    console.log(err);
                } else {
                    volunteersList.push(doc);
                }
            }
            , function () {
                db.close();
                res.render('VolunteersView', {vol: volunteersList});
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
                        res.render('LoginView', {invalid: 'email'});
                    } else {
                        db.collection('admin').count({password: login.password}, function (err, count) {
                            if (err) {
                                console.log(err);
                            } else {
                                if (count === 0) {
                                    res.render('LoginView', {invalid: 'pass'});
                                } else {
                                    res.render('HomeView', {emailID: login.emailID});
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
app.post('/deleteVolunteer', function (req, res) {
    console.log("In deleteVolunteer");
    console.log(req.body);
    var deleteVolunteer = req.body;
    mongoClient.connect(url, function (err, db) {
     if (err) {
        console.error('Error occured in database');
        res.send("Error in connection");
    }
        else
    {
                db.collection('Volunteers').remove(deleteVolunteer, function (err, result) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.sendFile(__dirname+"/views/VolunteersView.ejs");
                    }
                });
        

    } 
    });
});
app.post('/updateVolunteer', function (req, res) {
// console.log("In updateVolunteer");
// console.log(req.body);
//res.render('VolunteersView');
    var volunteersList = [];
    var updatedVolunteer = req.body;
    mongoClient.connect(url, function (err, db) {
        if (err) {
            console.error('Error occured in database');
            res.send("Error in connection");

        } else
        {
            console.log('Connection established ' + url);
            // db.collection('Volunteers').count({email: updatedVolunteer.email, _id: updatedVolunteer._id}, function (err, count) {
            //     if (err) {
            //         console.log(err);
            //     } else {
            //         console.log(count);
            //         if (count === 0) {
            db.collection('Volunteers').update({"_id": updatedVolunteer._id}, {$set: updatedVolunteer}, function (err, result) {
                if (err) {
                    console.log(err);
                } else {

                    mongoClient.connect(url, function (err, db) {

                        if (err) {
                            console.error('Error occured in database');
                            res.send("Error in connection");

                        } else
                        {

                            console.log('Connection established ' + url);
                            var cursor = db.collection('Volunteers').find();
                            console.log('Volunteers Fetched');
                            cursor.forEach(function (doc, err) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    volunteersList.push(doc);
                                }
                            }
                            , function () {
                                db.close();
                                res.render('VolunteersView', {vol: volunteersList});
                            });
                        }
                    });
                }
            });

            //     } else {
            //         res.send("already exists");
            //         db.close();

            //     }
            // }


            // });

        }
    });

});
app.post('/deleteVolunteer', function (req, res) {
    console.log("In deleteVolunteer");
    var volunteerID = {
        _id: req.body._id,
        email: req.body.email
    };
    console.log(volunteerID);
});
app.post('/insertVolunteer', function (req, res) {
    var volunteersList = [];
    var newVolunteer = {
        _id: 5,
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
                } else{
                    console.log(count);
                    if (count === 0) {
                        db.collection('Volunteers').insert(newVolunteer, function (err, result) {
                            if (err) {
                                console.log(err);
                            } else {

                                mongoClient.connect(url, function (err, db) {

                                    if (err) {
                                        console.error('Error occured in database');
                                        res.send("Error in connection");

                                    } else
                                    {

                                        console.log('Connection established ' + url);
                                        var cursor = db.collection('Volunteers').find();
                                        console.log('Volunteers Fetched');
                                        cursor.forEach(function (doc, err) {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                volunteersList.push(doc);
                                            }
                                        }
                                        , function () {
                                            db.close();
                                            res.render('VolunteersView', {vol: volunteersList});
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

app.get('/Groups', function (req, res) {
    var groupList = [];
    mongoClient.connect(url, function (err, db) {

        if (err) {
            console.error('Error occured in database');
            res.send("Error in connection");

        } else {

            console.log('Connection established ' + url);
            var cursor = db.collection('groups').find();
            console.log('Groups Fetched');
            cursor.forEach(function (doc, err) {
                if (err) {
                    console.log(err);
                } else {
                    groupList.push(doc);
                }
            }
            , function () {
                db.close();
                res.render('GroupsView', {gList: groupList});
            });
        }
    });
});

app.post('/insertGroup', function (req, res) {
    console.log("In Insert");
    var groupList = [];
    var newGroup = {
        _id: 1,
        gName: req.body.groupname,
        iName: req.body.incidentname,
        gLead: req.body.GroupLeadMailId,
        comments: req.body.desc
    };

    mongoClient.connect(url, function (err, db) {
        if (err) {
            console.error('Error occured in database');
            res.send("Error in connection");

        } else {
            console.log('Connection established ' + url);
            db.collection('groups').count({gName: newGroup.gName}, function (err, count) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(count);
                    if (count === 0) {
                        db.collection('groups').insert(newGroup, function (err, result) {
                            if (err) {
                                console.log(err);
                            } else {

                                mongoClient.connect(url, function (err, db) {

                                    if (err) {
                                        console.error('Error occured in database');
                                        res.send("Error in connection");

                                    } else {

                                        console.log('Connection established ' + url);
                                        var cursor = db.collection('groups').find();
                                        console.log('Groups Fetched');
                                        cursor.forEach(function (doc, err) {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                groupList.push(doc);
                                            }
                                        }
                                        , function () {
                                            db.close();
                                            res.render('GroupsView', {gList: groupList});
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
