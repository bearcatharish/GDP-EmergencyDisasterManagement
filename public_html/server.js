var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var app = express();

var http = require('http');
var assert = require('assert');
var fs = require('fs');

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
var router = express.Router();
var mongo = require('mongodb');
var mongoClient = mongo.MongoClient;
var autoIncrement = require("mongodb-autoincrement");

// Specify the connection string for your mongodb database
// and the location to your Parse cloud code
var api = new ParseServer({
    databaseURI: 'mongodb://admin:1jlt2CMYsL5dUfHVRmlib06G@mongodb7.back4app.com:27017/6e687c63d6f047edb7dc466d09b3463e?ssl=true',
    appId: 'QpDRrXl8eAlQTnHuY8OA1WWv12B25YM0pjXR0dEy',
    javascriptKey: 'XgWM9iKLNKt95pIMC001HJBjuRUtLSJm58R3KGcw',
    masterKey: 'nuAUJGgBarSqbmMkU7vPHHritN33maylqZJIhRPS',
  serverURL: 'https://parseapi.back4app.com/' // Don't forget to change to https if needed
});

// Serve the Parse API on the /parse URL prefix
app.use('/parse', api);

const TestUtils = require('parse-server').TestUtils;

app.get('/clear', (req, res) => {
  TestUtils.destroyAllDataPermanently().then(() => {
    res.send('{}');
  });
});

app.listen(3000, () => {
    console.log('parse-server running on port 3000.');
});

//View Engine
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

var url = 'mongodb://admin:1jlt2CMYsL5dUfHVRmlib06G@mongodb7.back4app.com:27017/6e687c63d6f047edb7dc466d09b3463e?ssl=true';
app.use(express.static(__dirname));

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

            console.log('Connection established ');
            var cursor = db.collection('Volunteer').find();
            console.log('Volunteers Fetched');
            //console.log(cursor);
            cursor.forEach(function (doc, err) {
                if (err) {
                    console.log(err);
                } else {
                    volunteersList.push(doc);
                }
            }
            , function () {
                db.close();
                res.render('VolunteersView', { vol: volunteersList });
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
            db.collection('admin').count({ emailID: login.emailID }, function (err, count) {
                console.log('db connected');
                if (err) {
                    console.log(err);
                } else {
                    if (count === 0) {
                        res.render('LoginView', { invalid: 'email' });
                        console.log('email invalid');
                    } else {
                        db.collection('admin').count({ password: login.password }, function (err, count) {
                            if (err) {
                                console.log(err);
                            } else {
                                if (count === 0) {
                                    res.render('LoginView', { invalid: 'pass' });
                                    console.log('password invalid');
                                } else {
                                    res.render('HomeView', { emailID: login.emailID });
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

        } else {
            console.log('Connection established ' + url);
            // db.collection('Volunteers').count({email: updatedVolunteer.email, _id: updatedVolunteer._id}, function (err, count) {
            //     if (err) {
            //         console.log(err);
            //     } else {
            //         console.log(count);
            //         if (count === 0) {
            db.collection('Volunteer').update({ "_id": updatedVolunteer._id }, { $set: updatedVolunteer }, function (err, result) {
                if (err) {
                    console.log(err);
                } else {

                    mongoClient.connect(url, function (err, db) {

                        if (err) {
                            console.error('Error occured in database');
                            res.send("Error in connection");

                        } else {

                            console.log('Connection established ' + url);
                            var cursor = db.collection('Volunteer').find();
                            console.log('Volunteers Fetched');
                            console.log(cursor);
                            cursor.forEach(function (doc, err) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    volunteersList.push(doc);
                                }
                            }
                            , function () {
                                db.close();
                                res.render('VolunteersView', { vol: volunteersList });
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
    console.log(req.body);
    var deleteVolunteer = req.body;
    mongoClient.connect(url, function (err, db) {
        if (err) {
            console.error('Error occured in database');
            res.send("Error in connection");

        } else {
            db.collection('Volunteer').remove(deleteVolunteer, function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    res.sendFile(__dirname + "/views/VolunteersView.ejs");
                }
            });
        }
    });
});
app.post('/insertVolunteer', function (req, res) {
    var volunteersList = [];
    var newVolunteer = {
        _id: 67,
        userName: req.body.userName,
        
        address: req.body.address,
        emailID: req.body.emailID,
        certification: req.body.certification,
        mobileNumber: req.body.mobileNumber
        
        //        dateTo: req.body.dt1
    };

    mongoClient.connect(url, function (err, db) {
        if (err) {
            console.error('Error occured in database');
            res.send("Error in connection");

        } else {
            console.log('Connection established ' + url);
            db.collection('Volunteer').count({ emailID: newVolunteer.emailID}, function (err, count) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(count);
                    if (count === 0) {
                        db.collection('Volunteer').insert(newVolunteer, function (err, result) {
                            if (err) {
                                console.log(err);
                            } else {

                                mongoClient.connect(url, function (err, db) {

                                    if (err) {
                                        console.error('Error occured in database');
                                        res.send("Error in connection");

                                    } else {

                                        console.log('Connection established ' + url);
                                        var cursor = db.collection('Volunteer').find();
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
                                            res.render('VolunteersView', { vol: volunteersList });
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
                res.render('GroupsView', { gList: groupList });
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
            db.collection('groups').count({ gName: newGroup.gName }, function (err, count) {
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
                                            res.render('GroupsView', { gList: groupList });
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