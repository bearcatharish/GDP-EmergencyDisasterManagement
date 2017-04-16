var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var session = require('express-session');
var app = express();

app.use(session({secret: 'ssshhhhh'}));

var http = require('http');
var assert = require('assert');
var fs = require('fs');

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({extended: true})); // support encoded bodies

var sess;

//app.get('/',function(req,res){
//sess = req.session;
////Session set when user Request our app via URL
//if(sess.email) {
///*
//* This line check Session existence.
//* If it existed will do some action.
//*/
//    res.redirect('/Home');
//}
//else {
//    res.render('LoginPage.html');
//}
//});

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


//Mailing service
const nodemailer = require('nodemailer');
var sendmail = require('sendmail')();
/*{
  logger: {
    debug: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error
  },
  silent: false,
  dkim: { // Default: False 
    privateKey: fs.readFileSync('./dkim-private.pem', 'utf8'),
    keySelector: 'mydomainkey'
  },
  devPort: 1025 // Default: False 
});*/

const TestUtils = require('parse-server').TestUtils;
var transporter = nodemailer.createTransport({
   service: 'gmail',
   auth: {
       user: 'edmsystems2017@gmail.com',
       pass: 'Admin2017'
   }
});

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
    //res.render('LoginView')
});

//calls home page
var name="";
var incidentsName="";
var incidentReportList=[];
var called= false;
var newCount = 0;       
var oldIncident = [];       
var incidentCount = 0;
app.get('/Home', function (req, res) {
    var incidentName = [];
    var details = {
                _id : 0,        
                        incidentName: "",       
                        count : 0       
                };
    sess = req.session;
    if(sess.email) {
        var incidentList = [];
        mongoClient.connect(url, function (err, db) {

            if (err) {
                console.error('Error occured in database');
                res.send("Error in connection");

            } else {

                console.log('Connection established ');
                var cursor1 = db.collection('incident').find();
   cursor1.forEach(function (doc, err) {
if (err) {
console.log(err);
} else {

if (doc.newCount == 0){
db.collection('Disaster').count({"incidentName": doc.incidentName}, function (err, count){
if (err) {
console.log(err);
} else {
var updatedCount = {
"_id": doc._id,
"incidentName": doc.incidentName,
"newCount": count
}
db.collection('incident').update({"_id": doc._id}, {$set: updatedCount}, function (err, result) {
if (err) {
console.log(err);
} else {}
});
}
});

}
db.collection('Disaster').count({"incidentName": doc.incidentName}, function (err, count){
if (err) {
console.log(err);
} else {
var updatedCount = {
"_id": doc._id,
"incidentName": doc.incidentName,
"newCount": count
};
db.collection('incident').update({"_id": doc._id}, {$set: updatedCount}, function (err, result) {
if (err) {
console.log(err);
} else {}
});
}
});
}
},function(){});
var cursor2 = db.collection('incident').find();
cursor2.forEach(function (doc, err) {
if (err) {
console.log(err);
} else {
var notifyCount = 0;
notifyCount = doc.newCount - doc.readCount;
details._id = doc._id;
details.incidentName = doc.incidentName;
details.count = notifyCount;
console.log(details);


incidentName.push(details);
//                                console.log(details);
details = {_id : 0, incidentName: "", count : 0};
}
},function(){
res.render('HomeView', {Username : name, incident: incidentName});
console.log(incidentName);
});
}
});
//res.end('<a href="+">Logout</a>');
} else {
res.redirect("/Login");
//res.render('LoginPage.html');
//    res.write('<h1>Please login first.</h1>');
//    res.end('<a href="./LoginPage.html">Login</a>');
}
});

//calls volunteer page
app.get('/Volunteers', function (req, res) {
    sess = req.session;
    if(sess.email) {
        var volunteersList = [];
        var incidentList = [];
        mongoClient.connect(url, function (err, db) {

            if (err) {
                console.error('Error occured in database');
                res.send("Error in connection");

            } else {

                console.log('Connection established ');
                var cursor = db.collection('Volunteer').find();
                var cursor1 = db.collection('incident').find();
                console.log('Volunteers AND INCIDENTS Fetched');
            //console.log(cursor);
            cursor1.forEach(function (doc, err) {
                if (err) {
                    console.log(err);
                } else {
                 incidentList.push(doc);
             }
         }
         , function () {

         });
            cursor.forEach(function (doc, err) {
                if (err) {
                    console.log(err);
                } else {
                    volunteersList.push(doc);
                }
            }
            , function () {
                db.close();
                res.render('VolunteersView', {vol: volunteersList, incident: incidentList});
            });
        }
    });
//res.end('<a href="+">Logout</a>');
} else {
    res.redirect("/Login");
}
});

//validation logins
app.post('/Login', function (req, res) {
    var incidentName = [];
            var attribute;
            var c;
    sess = req.session;
    // var incidentName = [];
    var login = {
        emailID: req.body.emailID,
        password: req.body.password

    };
    var details = {
                "_id" : 0,
                "incidentName": "",
                "count" : 0
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
                                    cursor1 = db.collection('incident').find();
                                    cursor1.forEach(function (doc, err) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                           if (doc.newCount == 0){
                            db.collection('Disaster').count({incidentName: doc.incidentName}, function (err, count){
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log('checking');
                                    console.log({incidentName: doc.incidentName});
                                    console.log('counting..........');
                                    console.log(count);
                                    var updatedCount = {
                                        "_id": doc._id,
                                        "incidentName": doc.incidentName,
                                        "newCount": count
                                    }
                                    console.log(updatedCount);
                                    db.collection('incident').update({"_id": doc._id}, {$set: updatedCount}, function (err, result) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                            //console.log(doc.oldCount);
                            console.log('Updated........');
                        }
                    });
                                }
                            });
                            
                        }
                        db.collection('Disaster').count({"incidentName": doc.incidentName}, function (err, count){
                            if (err) {
                                console.log(err);
                            } else {
                                var updatedCount = {
                                    "_id": doc._id,
                                    "incidentName": doc.incidentName,
                                    "newCount": count
                                };
                                db.collection('incident').update({"_id": doc._id}, {$set: updatedCount}, function (err, result) {
                                    if (err) {
                                        console.log(err);
                                    } else {}
                                });
                            }
                        });
                    }
                },function(){});
                                            var cursor2 = db.collection('incident').find();
                                            cursor2.forEach(function (doc, err) {
                                                if (err) {
                                                    console.log(err);
                                                } else {
                                                    var notifyCount = 0;
                                                    notifyCount = doc.newCount - doc.readCount;
                                                    details._id = doc._id;
                                                    details.incidentName = doc.incidentName;
                                                    details.count = notifyCount;
                                                    console.log(details);
                                                    incidentName.push(details);
                                                    console.log(details);
                                                    details = {"_id" : 0, "incidentName": "", "count" : 0};
                                                }
                                            },function(){
                                                res.render('HomeView', {Username : name, incident: incidentName});
                                                console.log(incidentName);
                                            });
                                        }
                                    }});
}
}
});
}
            //db.close(); 
        });
sess.email = req.body.emailID;
                //res.end('done');
            });
app.post('/updateIncident', function (req, res) {
    sess = req.session;
    if(sess.email) {
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
//res.end('<a href="+">Logout</a>');
} else {
    res.redirect("/Login");
}
});

app.post('/deleteIncident', function (req, res) {
    sess = req.session;
    if(sess.email) {
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
                        res.redirect('/Home');
                    }
                });
            }
        });
//res.end('<a href="+">Logout</a>');
} else {
    res.redirect("/Login");
}
});
function randomIntInc (low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}

app.post('/insertIncident', function (req, res) {
    sess = req.session;
    if(sess.email) {
        var incidentList = [];
        var newIncident = {
            _id: randomIntInc(0, 9999),
                    incidentName: req.body.incidentName,
                    newCount: 0,
                    readCount:0

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

//res.end('<a href="+">Logout</a>');
} else {
    res.redirect("/Login");
}
});

app.post('/Reports', function (req, res) {
    sess = req.session;
    if(sess.email) {
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
                var cursor1 = db.collection('incident').find();
                        console.log('---------------');
                        
                        cursor1.forEach(function (doc, err) {
                            if (err) {
                                console.log(err);
                            } else {
                                var updatedCount = {
                                    "_id": doc._id,
                                    "incidentName": doc.incidentName,
                                    "readCount": doc.newCount
                                };
                                
                                db.collection('incident').update({"_id": doc._id}, {$set: updatedCount}, function (err, result) {
                                    if (err) {
                                        console.log(err);
                                    } else {}
                                });
                            }
                        },function(){});
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
                //res.end('<a href="+">Logout</a>');
            } else {
                res.redirect("/Login");
            }
        });
//Reports Deletion
app.post('/deleteReport', function (req, res) {
    sess = req.session;
    if(sess.email) {
        console.log("In deleteReport");
        console.log(req.body);
        var deleteReport = req.body;
        mongoClient.connect(url, function (err, db) {
            if (err) {
                console.error('Error occured in database');
                res.send("Error in connection");

            } else {
                db.collection('Disaster').remove(deleteReport, function (err, result) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.redirect("/Reports");
                    }
                });
            }
        });
//res.end('<a href="+">Logout</a>');
} else {
    res.redirect("/Login");
}
});
//reports update
app.post('/updateReport', function (req, res) {
    // console.log("In updateVolunteer");
    sess = req.session;
    if(sess.email) {
        console.log(req.body);
    //res.render('VolunteersView');
    var reportList = [];
    var updatedReport = req.body;
    mongoClient.connect(url, function (err, db) {
        if (err) {
            console.error('Error occured in database');
            res.send("Error in connection");

        } else {
            console.log('Connection established ' + url);
            db.collection('Disaster').update({"_id": updatedReport._id}, {$set: updatedReport}, function (err, result) {
                if (err) {
                    console.log(err);
                } else {

                    mongoClient.connect(url, function (err, db) {

                        if (err) {
                            console.error('Error occured in database');
                            res.send("Error in connection");

                        } else {
                            res.redirect('/Reports');
                        }

                    });
                }
            });
        }
    });
//res.end('<a href="+">Logout</a>');
} else {
    res.redirect("/Login");
}
});
//volunteer data changes
app.post('/updateVolunteer', function (req, res) {
    // console.log("In updateVolunteer");
    // console.log(req.body);
    //res.render('VolunteersView');
    sess = req.session;
    if(sess.email) {
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
//res.end('<a href="+">Logout</a>');
} else {
    res.redirect("/Login");
}
});

//volunteer deletion
app.post('/deleteVolunteer', function (req, res) {
    sess = req.session;
    if(sess.email) {
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
//res.end('<a href="+">Logout</a>');
} else {
    res.redirect("/Login");
}
});

//Group Deletion
app.post('/deleteGroup', function (req, res) {
    sess = req.session;
    if(sess.email) {
        console.log("In deleteGroup");
        console.log(req.body);
        var deleteGroup = req.body;
        mongoClient.connect(url, function (err, db) {
            if (err) {
                console.error('Error occured in database');
                res.send("Error in connection");

            } else {
                db.collection('groups').remove(deleteGroup, function (err, result) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.redirect("/Groups");
                    }
                });
            }
        });
//res.end('<a href="+">Logout</a>');
} else {
    res.redirect("/Login");
}
});

//volunteer insertion
app.post('/insertVolunteer', function (req, res) {
    sess = req.session;
    if(sess.email) {
        var volunteersList = [];
        var passwords= req.body.userName+randomIntInc(1000,9999);
        var newVolunteer = {
            _id: randomIntInc(0,9999),
            userName: req.body.userName,
            profession: req.body.profession,
            address: req.body.address,
            emailID: req.body.emailID,
            cert: req.body.cert,
            password: passwords,
            mobileNumber: req.body.mobileNumber

                //        dateTo: req.body.dt1
            };
            var message= '<a href="http://tinypic.com?ref=19s0uo"  border="0" alt="Image and video hosting by TinyPic"></a> <img src="http://i65.tinypic.com/19s0uo.jpg" name="image" height="150" width="500"/> <br><br> Welcome to Emergency Disaster Management, <br><br>Thank you for creating Emergency Disaster Management account. Your account details <br><br>'+'username: '+newVolunteer.userName+ '<br>password: '+passwords+'<br><br>Please log in to our app with these credentials and update your profile soon.<br><br>Thank you for joining Emergency Disaster Management.<br><br>Sincerely.<br><br> Emergency Disaster Management Team.'; 
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
                                        var mailOptions = {
    from: 'no-reply@edmsystems.com', // sender address
    to:  newVolunteer.emailID, // list of receivers
    subject: 'Registration succcessful', // Subject line
    text: 'no-reply@edmsystems.com', // plain text body
    html: message // html body
};
								/*sendmail({
										from: 'no-reply@edmsystems.com',
										to: newVolunteer.emailID,
										subject: 'Your Username',
										html: 'Mail of test sendmail ',
										}, function(err, reply) {
											console.log(err && err.stack);
											console.dir(reply);
										});*/
										transporter.sendMail(mailOptions, (error, info) => {
                                            if (error) {
                                                return console.log(error);
                                            }
                                            console.log('Message %s sent: %s', info.messageId, info.response);
                                        });
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

//res.end('<a href="+">Logout</a>');
} else {
    res.redirect("/Login");
}
});

//groups retrieval
app.get('/Groups', function (req, res) {
    sess = req.session;
    if(sess.email) {
        var groupList = [];
        var incidentList=[];
        mongoClient.connect(url, function (err, db) {

            if (err) {
                console.error('Error occured in database');
                res.send("Error in connection");

            } else {

                console.log('Connection established ' + url);
                var cursor = db.collection('groups').find();
                console.log('Groups Fetched');
                var cursor1 = db.collection('incident').find();
                console.log('Volunteers AND INCIDENTS Fetched');
            //console.log(cursor);
            cursor1.forEach(function (doc, err) {
                if (err) {
                    console.log(err);
                } else {
                 incidentList.push(doc);
             }
         }, function () {

         });
            cursor.forEach(function (doc, err) {
                if (err) {
                    console.log(err);
                } else {
                    groupList.push(doc);
                }
            }
            , function () {
                db.close();
                res.render('GroupsView', {gList: groupList, inci: incidentList});
            });
        }
    });
//res.end('<a href="+">Logout</a>');
} else {
    res.redirect("/Login");
}
});

//Reports page
app.get('/Reports', function (req, res) {
    sess = req.session;
    if(sess.email) {
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
        var cursor1 = db.collection('incident').find();
                            console.log('---------------');
                            
                            cursor1.forEach(function (doc, err) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    var updatedCount = {
                                        "_id": doc._id,
                                        "incidentName": doc.incidentName,
                                        "readCount": doc.newCount
                                    };
                                    notifyCount = doc.newCount - doc.readCount;
                                    db.collection('incident').update({"_id": doc._id}, {$set: updatedCount}, function (err, result) {
                                        if (err) {
                                            console.log(err);
                                        } else {}
                                    });
                                }
                            },function(){});
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
                    return res.render('ReportsView', {incidentName: "Full", vol: reportsList});
                });
            }
        });
                }
                else{
                    res.render('ReportsView', {incidentName: incidentsName, vol: incidentReportList});
                    called = false;
                    incidentReportList = [];
                    incidentsName = "";
                }
        //res.end('<a href="+">Logout</a>');
    } else {
        res.redirect("/Login");
    }
});
//groups update
app.post('/updateGroup', function (req, res) {
    // console.log("In updateVolunteer");
    sess = req.session;
    if(sess.email) {
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
//res.end('<a href="+">Logout</a>');
} else {
    res.redirect("/Login");
}
});

//group insertion
app.post('/insertGroup', function (req, res) {
    sess = req.session;
    if(sess.email) {
        console.log("In Insert");
        var groupList = [];
        var newGroup = {
            _id: randomIntInc(0,9999),
            gName: req.body.groupname,
            iName: req.body.incidentname,
            gLead: req.body.GroupLeadMailId,
            comments: req.body.desc,
            gMembers: req.body.GroupMem
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
                                    var message= '<a href="http://tinypic.com?ref=19s0uo"  border="0" alt="Image and video hosting by TinyPic"></a> <img src="http://i65.tinypic.com/19s0uo.jpg" name="image" height="150" width="500"/> <br><br> Greetings from Emergency Disaster Management,<br>\n\
<br> Your Group Name: '+newGroup.gName+'<br>Team Lead: '+newGroup.gLead+'<br>Team Members: '+newGroup.gMembers+'<br><br> Rescue operation details: <br> Incident: '+newGroup.iName+ '<br>\n\
                                            Full Description: '+newGroup.comments+'<br>\n\
                                            <br>Please log in to our EDM app in iOS and report the disaster ASAP.<br>"Saving a life gives more happiness than anything else!"\n\
                                            <br>Thank you from Emergency Disaster Management.<br><br>Sincerely.\n\
                                            <br> Emergency Disaster Management Team.';
//                        console.log(pass);
//                        console.log(message);
var mailOptions = {
    from: 'no-reply@edmsystems.com', // sender address
    to:  newGroup.gLead+','+newGroup.gMembers, // list of receivers
    subject: 'Emergency Disaster Management Account', // Subject line
    text: 'no-reply@edmsystems.com', // plain text body
    html: message // html body
};
transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log(error);
    }
    console.log('Message %s sent: %s', info.messageId, info.response);
});
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

//res.end('<a href="+">Logout</a>');
} else {
    res.redirect("/Login");
}
});

app.get('/logout',function(req,res){
    sess=req.session;
    req.session.destroy(function(err) {
      if(err) {
        console.log(err);
    } else {
      sess.email=null;
      res.redirect('/Login');
  }
});
});

app.post('/forgotPassword', function (req, res) {
    sess = req.session;
    console.log('in forgot password');
    var pass;
    var login = {
        emailID: req.body.femailID
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
                        var cursor = db.collection('admin').find({emailID: login.emailID});
                        console.log('connecting to admin .........');
                        cursor.forEach(function (doc, err) {
                            if (err) {
                                console.log(err);
                            } else {
                                pass= JSON.stringify(doc.password);
                                            //console.log(doc.password);
                                            var message= '<a href="http://tinypic.com?ref=19s0uo"  border="0" alt="Image and video hosting by TinyPic"></a> <img src="http://i65.tinypic.com/19s0uo.jpg" name="image" height="150" width="500"/> <br><br> Welcome to Emergency Disaster Management, <br><br>Your account details <br>\n\
                                            <br>'+'username: '+login.emailID+ '<br>\n\
                                            password: '+pass+'<br>\n\
                                            <br>Please log in to our app with these credentials and update your profile soon.<br>\n\
                                            <br>Thank you from Emergency Disaster Management.<br><br>Sincerely.<br>\n\
                                            <br> Emergency Disaster Management Team.';
//                        console.log(pass);
//                        console.log(message);
var mailOptions = {
    from: 'no-reply@edmsystems.com', // sender address
    to:  login.emailID, // list of receivers
    subject: 'Emergency Disaster Management Account', // Subject line
    text: 'no-reply@edmsystems.com', // plain text body
    html: message // html body
};
transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log(error);
    }
    console.log('Message %s sent: %s', info.messageId, info.response);
});
res.render('LoginView', {invalid: 'femail'});
}
});
                        
                    }
                }
            });
        }
    });
    sess.email=req.body.emailID;
  //res.end('done');
});