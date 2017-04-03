var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var app = express();

var http = require('http');
var assert = require('assert');
var fs = require('fs');

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({extended: true})); // support encoded bodies
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

app.listen(3001, () => {
    console.log('parse-server running on port 3001.');
});

//View Engine
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

var url = 'mongodb://admin:1jlt2CMYsL5dUfHVRmlib06G@mongodb7.back4app.com:27017/6e687c63d6f047edb7dc466d09b3463e?ssl=true';
app.use(express.static(__dirname));


//var jsdom = require("jsdom").jsdom;
 //   var doc = jsdom();
  //  var window = doc.defaultView;
   // var $ = require('jQuery')(window);

//Login view
app.get('/Login', function (req, res) {
    res.sendFile(__dirname + "/LoginPage.html");
    //res.render('/index')
});

//calls home page
var name="";
var incidentsName="";
var incidentReportList=[];
var called= false;

app.get('/Home', function (req, res) {
    var incidentList = [];
    mongoClient.connect(url, function (err, db) {

        if (err) {
            console.error('Error occured in database');
            res.send("Error in connection");

        } else {

            console.log('Connection established ');
            var cursor = db.collection('incident').find();
                                    cursor.forEach(function (doc, err) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            incidentList.push(doc);
                                        }
                                    }
                                    , function () {
                                    res.render('HomeView', {Username : name, incident: incidentList});
                                        //console.log(userList.Username);
                                        db.close();
                                    });
        }
    });
});

//calls volunteer page
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
                res.render('VolunteersView', {vol: volunteersList});
            });
        }
    });
});

//validation logins
app.post('/Login', function (req, res) {
    var incidentName = [];
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
                console.log('db connected');
                if (err) {
                    console.log(err);
                } else {
                    if (count === 0) {
                        res.render('LoginView', {invalid: 'email'});
                        console.log('email invalid');
                    } else {
                        db.collection('admin').count({password: login.password}, function (err, count) {
                            if (err) {
                                console.log(err);
                            } else {
                                if (count === 0) {
                                    res.render('LoginView', {invalid: 'pass'});
                                    console.log('password invalid');
                                } else {
                                    var cursor = db.collection('admin').find({emailID: login.emailID});
                                    console.log('connecting to admin .........');
                                    cursor.forEach(function (doc, err) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            name= doc.Username;
                                        }
                                    }
                                    , function () {
                                        
                                    });
                                    cursor = db.collection('incident').find();
                                    cursor.forEach(function (doc, err) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            incidentName.push(doc);
                                            //console.log(incidentName);
                                            //console.log(name);
                                        }
                                    }
                                    , function () {
                                    res.render('HomeView', {Username : name, incident: incidentName});
                                        console.log(name);
                                        console.log(incidentName)
                                        db.close();
                                    });
                                }
                            }
                        });

                    }
                }
            });
        }
    });
});
app.post('/updateIncident', function (req, res) {
    var incidentList = [];
    var updatedIncident = req.body;
    mongoClient.connect(url, function (err, db) {
        if (err) {
            console.error('Error occured in database');
            res.send("Error in connection");

        } else {
            console.log('Connection established ' + url);
            db.collection('incident').update({"_id": updatedIncident._id}, {$set: updatedIncident}, function (err, result) {
                if (err) {
                    console.log(err);
                } else {

                    mongoClient.connect(url, function (err, db) {

                        if (err) {
                            console.error('Error occured in database');
                            res.send("Error in connection");

                        } else {

                            res.redirect("/Home");
                        }
                    });
                }
            });
        }
    });

});

app.post('/deleteIncident', function (req, res) {
    var deleteIncident = req.body;
    mongoClient.connect(url, function (err, db) {
        if (err) {
            console.error('Error occured in database');
            res.send("Error in connection");

        } else {
            db.collection('incident').remove(deleteIncident, function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    res.render('HomeView');
                }
            });
        }
    });
});
function randomIntInc (low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}

app.post('/insertIncident', function (req, res) {
    var incidentList = [];
    var newIncident = {
        _id: randomIntInc(0,9999),
        incidentName: req.body.incidentName

                //        dateTo: req.body.dt1
    };

    mongoClient.connect(url, function (err, db) {
        if (err) {
            console.error('Error occured in database');
            res.send("Error in connection");

        } else {
            console.log('Connection established ' + url);
            db.collection('incident').count({incidentName: newIncident.incidentName}, function (err, count) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(count);
                    if (count === 0) {
                        db.collection('incident').insert(newIncident, function (err, result) {
                            if (err) {
                                console.log(err);
                            } else {
                                res.redirect("/Home");
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

app.post('/Reports', function (req, res) {
    console.log("In open reports");
    var openIncident = req.body.incidentName;
    console.log(name);
    var reportsList = [];
    incidentsName = openIncident;
    mongoClient.connect(url, function (err, db) {

        if (err) {
            console.error('Error occured in database');
            res.send("Error in connection");

        } else {

            console.log('Connection established ');
            var cursor = db.collection('Disaster').find({incidentName: openIncident});
            console.log('Reports Fetched');
            cursor.forEach(function (doc, err) {
                if (err) {
                    console.log(err);
                } else {
                    reportsList.push(doc);
                }
            }
            , function () {
                db.close();
                console.log(reportsList);
                called = true;
                res.render('ReportsView', {incidentName: openIncident, vol: reportsList});
                incidentReportList = reportsList;

            });
        }
    });
    });
//volunteer data changes
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
            db.collection('Volunteer').update({"_id": updatedVolunteer._id}, {$set: updatedVolunteer}, function (err, result) {
                if (err) {
                    console.log(err);
                } else {

                    mongoClient.connect(url, function (err, db) {

                        if (err) {
                            console.error('Error occured in database');
                            res.send("Error in connection");

                        } else {

                            res.redirect("/Volunteers");
                        }
                    });
                }
            });
        }
    });

});

//volunteer deletion
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
                    res.redirect("/Volunteers");
                }
            });
        }
    });
});

//volunteer insertion
app.post('/insertVolunteer', function (req, res) {
    var volunteersList = [];
    var newVolunteer = {
        _id: randomIntInc(0,9999),
        userName: req.body.userName,
        profession: req.body.profession,
        address: req.body.address,
        emailID: req.body.emailID,
        cert: req.body.cert,
        mobileNumber: req.body.mobileNumber

                //        dateTo: req.body.dt1
    };

    mongoClient.connect(url, function (err, db) {
        if (err) {
            console.error('Error occured in database');
            res.send("Error in connection");

        } else {
            console.log('Connection established ' + url);
            db.collection('Volunteer').count({emailID: newVolunteer.emailID}, function (err, count) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(count);
                    if (count === 0) {
                        db.collection('Volunteer').insert(newVolunteer, function (err, result) {
                            if (err) {
                                console.log(err);
                            } else {
                                res.redirect("/Volunteers");
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

//groups retrieval
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

//Reports page
app.get('/Reports', function (req, res) {
    var reportsList = [];
    console.log('-------------');
//    console.log(req.body.reportsList);
//    reportsList = req.body.reportsList;
if(!called){
     mongoClient.connect(url, function (err, db) {

        if (err) {
            console.error('Error occured in database');
            res.send("Error in connection");

        } else {

            console.log('Connection established ');
            var cursor = db.collection('Disaster').find();
            console.log('Reports Fetched');
            //console.log(cursor);
            cursor.forEach(function (doc, err) {
                if (err) {
                    console.log(err);
                } else {
                    reportsList.push(doc);
                    
                }
            }
            , function () {
                db.close();
                return res.render('ReportsView', {incidentName: "Full",vol: reportsList});
            });
        }
    });
}
else{
    res.render('ReportsView', {incidentName: incidentsName,vol: incidentReportList});
    called=false;
    incidentReportList = [];
    incidentsName="";
}
});
//groups update
app.post('/updateGroup', function (req, res) {
    // console.log("In updateVolunteer");
    console.log(req.body);
    //res.render('VolunteersView');
    var groupList = [];
    var updatedGroup = req.body;
    mongoClient.connect(url, function (err, db) {
        if (err) {
            console.error('Error occured in database');
            res.send("Error in connection");

        } else {
            console.log('Connection established ' + url);
            db.collection('groups').update({"_id": updatedGroup._id}, {$set: updatedGroup}, function (err, result) {
                if (err) {
                    console.log(err);
                } else {

                    mongoClient.connect(url, function (err, db) {

                        if (err) {
                            console.error('Error occured in database');
                            res.send("Error in connection");

                        } else {
                            res.redirect('/Groups');
                        }

                    });
                }
            });
        }
    });

});

//group insertion
app.post('/insertGroup', function (req, res) {
    console.log("In Insert");
    var groupList = [];
    var newGroup = {
        _id: randomIntInc(0,9999),
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
                                res.redirect('/Groups');
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