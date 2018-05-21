//--------------------------------------------configuration-----------------------------------------------------------
var express = require('express');
var bodyParser = require('body-parser');
var authenticator = require("../../authentication/authenticator-2.js");
var fs = require('fs');

var authoriser = require("../../authentication/authoriser.js");

var appRouter = express();

//appRouter.use(cookieParser());
appRouter.use(bodyParser.json());
appRouter.use(bodyParser.urlencoded({ extended: true }));

var mysql = require('mysql');
var dbConn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "classrep"
});

dbConn.connect(function(err) {
  if (err){
    console.log("Database Inaccessible! Is it up?"+"\n\n");
    console.log(err);
  }
  else {
    console.log("Connected to ClassRep Database!"+"\n\n"+"Listening"+"\n\n");
  }
});

//--------------------------------------------POST REQUESTS-----------------------------------------------------------
//sign in
appRouter.post('/users/authlib/:UserType/reqID=sign_in', function(request, response){
    switch(request.params.UserType){
        case("Lecturer"):
            if(!request.body.UserID || !request.body.Password){
                var message = "\nFAILURE: No request parameters on Sign In @ " + new Date;
                fs.appendFileSync('serverlog', message);
//ensure both UserID and password are not empty
                response.status("400");      //bad request
                response.send();
            }
            else{
                var TechMail = request.body.UserID;
                var Password = request.body.Password;
                
                authenticator.lecturerLogin(TechMail, Password, response, dbConn, fs);
                
            }
            break
        
        case("Student"):
            if(!request.body.UserID || !request.body.Password){       //ensure both UserID and password are not empty
                var message = "\nFAILURE: No request parameters for Sign In @ " + new Date;
                fs.appendFileSync('serverlog', message);
                
                response.status("400");      //bad request
                response.send();
            }
            else{
                var IndexNumber = request.body.UserID;
                var Password = request.body.Password;
                
                authenticator.studentLogin(IndexNumber, Password, response, dbConn, fs);
                
            }
            break
        
    }
});

//sign out
appRouter.post('/users/deauthlib/:UserType/reqID=:Token', function(request, response){
    //extract token from URL
    if(!request.params.Token){
        var message = "\nFAILURE: No request parameters for Sign Out @ " + new Date;
        fs.appendFileSync('serverlog', message);
        
        response.status("400");     //bad request
        response.send();
    }
    else{
        var Token = request.params.Token;
        
        switch(request.params.UserType){
            case "Lecturer":
                authenticator.lecturerLogout(Token, response, dbConn, fs);
                break
            
            case "Student":
                authenticator.studentLogout(Token, response, dbConn, fs);
                break
        }
    }
});

///process posted messages
appRouter.post('/data/systlab/:Token/post/:course_table', function(request, response){
    //extract token from URL
    if(!request.params.Token){
        var message = "\nFAILURE: No session token on Post-Store @ "+ new Date;
        fs.appendFileSync('serverlog', message);
        
        response.status("400");
        response.send();
    }
    else{
        authoriser.Authorise(request.params.Token, response, dbConn, fs);       //check session token validity
        //SQL TIMESTAMP Format 2018-04-22 10:58:16
        database.postDb(request.params.Token, request.params.CourseCode, request.body.SentBy, request.body.TimeSent, request.body.PostID, request.body.Message, request.body.Votable, request.body.Attachment, dbConn, fs, response);
    }
    
    
});

//store results of Vote on message
appRouter.post("/data/systlab/reqID=:Token/poll", function(request, response){
    //extract token from URL
    if(!request.params.Token|!request.body.PostID|!request.body.IndexNumber|!request.body.Vote){
//        response.set();        //bad request
        response.send();
        fs.appendFileSync('serverlog', '\nFAILURE: POST request on Poll@ '+new Date);        //log activities
//        console.log("Failed: POST request on Poll");
    }
    else{
        authoriser.Authorise(request.params.Token, response, dbConn, fs);
        database.postVote(request.params.Token, request.body.PostID, request.body.IndexNumber, request.body.Vote, dbConn, fs, response);
//        console.log("Success: Token validated for "+Token+" @ " +date);
    }
});

//Update course session data
//Special function only be used by lecturers
appRouter.post("/data/systlab/course/session/reqID=:Token", function(request, response){
    //extract token from URL
    if(!request.params.Token | !request.body.alter){
        response.status("400");
        response.send("Either Token or alter or both params missing");
        fs.appendFileSync('serverlog', '\nFAILURE: Update on Course Sessions @ '+new Date+' #TokenOrAlter');
    }
    else{
        authoriser.Authorise(request.params.Token, response, dbConn, fs);       //check session token validity
        database.updateCourse(request.params.Token, request.body.Alter, request.body.CourseCode, request.body.StartingTime, request.body.EndingTime, request.body.TechMail, request.body.Venue, request.body.ProgrammeAndYear, request.body.Day, dbConn, fs, response);
    }
});

//---------------------------------------------GET REQUESTS--------------------------------------------------------

//serve requested posts
appRouter.get('/data/post/reqID=:Token/:CourseCode/:time', function(request, response){
    if(!request.params.Token || !request.params.CourseCode || !request.params.Time){
        fs.appendFileSync('serverlog','\nFAILURE: Request on Get posts @ '+new Date+' #TokenOrCodeOrTime')
        response.status("400");
        response.send('Invalid params');
    }
    else{
        authoriser.Authorise(request.params.Token, response, dbConn, fs);       //check session token validity
        database.getPosts(request.params.Token, request.params.CourseCode, request.params.Time, response, dbConn, fs);
    }
});

//Results of poll
appRouter.get('/data/share/reqID=:Token/poll/:PostID', function(request, response){
    if(!request.params.Token || !request.params.PostID){
        response.status("400");     //bad request
        response.send("Invalid Details");
        fs.appendFileSync('serverlog', 'FAILURE: GET request on Poll Results @ '+new Date+' #BadParams');
    }
    else{
        authoriser.Authorise(request.params.Token, response, dbConn, fs);       //check session token validity
        database.getPolls(request.params.Token, request.params.PostID, response, dbConn, fs);
    }
});

//serve course sessions
appRouter.get('/data/course/session/reqID=:Token/share/:UserType/:Query', function(request, response){
    if(!request.params.Token || !request.params.UserType || !request.params.Query){
        response.status("400");
        response.send("Invalid Details");
        fs.appendFileSync('serverlog', 'FAILURE: GET request on CCA @ '+new Date+' #BadParams');
    }
    else{
        authoriser.Authorise(request.params.Token, response, dbConn, fs);       //check session token validity
        database.getSessions(request.params.Token, request.params.UserType, request.params.Query, response, dbConn, fs);
    }
});

//serve biodata
appRouter.get('/data/users/share/reqID=:Token/:UserType/:UserID', function(request, response){
    if(!request.params.Token || !request.params.UserType|| !request.params.UserID){
        response.status("400");
        response.send("Invalid Details");
        fs.appendFileSync('serverlog', 'Failed: GET request on Bio Data');
    }
    else{
        authoriser.Authorise(request.params.Token, response, dbConn, fs);       //check session token validity
        database.getBioData(request.params.Token, request.params.UserType, request.params.UserID, response, dbConn, fs);
    }
});

appRouter.listen(5555);
