'use strict';
const express = require('express');
const morgan = require('morgan'); // logging middleware
const dao = require('./riddle-dao'); // module for accessing the DB
const userDao = require('./user-dao'); // module for accessing the DB
const { wsServer } = require('./ws_notifcation'); //module for web socket
const cors = require('cors');
const { validationHandler } = require("./Validator/validationHandler");
const { param }             = require('express-validator');
const { body }              = require('express-validator');
// Passport-related imports
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');


dao.initTimer();
// init expresss
const app = express();
const port = 3001;


// set up the middlewares
app.use(morgan('dev'));
app.use(express.json()); // for parsing json request body
// set up and enable cors
const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200,
  credentials: true,
};
app.use(cors(corsOptions));

/*** APIs ***/
// Passport: set up local strategy
passport.use(new LocalStrategy(async function verify(username, password, cb) {
  const user = await userDao.getUser(username, password)
  if(!user)
    return cb(null, false, 'Incorrect username or password.');
    
  return cb(null, user);
}));

passport.serializeUser(function (user, cb) {
  cb(null, user);
});


passport.deserializeUser(async (user, done) => {
  //we double check that the user is still in the database 
  //although it shouldn't happen since we don't delete any user
  const result = await userDao.deserializeUser(user.id);
  if (!result.status)
    return done(result.error, null)
  else
    return done(null, result.result);
});

const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({error: 'Not authorized'});
}

app.use(session({
  secret: "shhhhh... it's a secret!",
  resave: false,
  saveUninitialized: false,
  maxAge : 1000000000000000000n,
}));
app.use(passport.authenticate('session'));


app.post('/api/sessions', function (req, res, next) {
  passport.authenticate('local', function (err, user) {
    if (err)
      return res.status(403).send(err);

    if (!user)
      return res.status(404).end();

    req.login(user, function (err) {
      if (err)
        return res.status(500).send(err);
    wsServer.removeSessionUser(req.session.id);
    wsServer.insertSessionUser(req.session.id, req.user.id);
    return res.status(201).send(req.user);
    });
  })(req, res, next);
});


app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
      res.status(204).end();
  });
  wsServer.removeSessionUser(req.session.id);
  wsServer.insertSessionUser(req.session.id,undefined);
});


app.get('/api/sessions/current', async (req, res) => {
  if(req.isAuthenticated()) {
    try{
      res.json(req.user);
    }catch(error){
      throw error;
    }}
  else
    res.status(401).json({error: 'Not authenticated'});

});


/**
 * API for creating a new riddle
 */
app.post('/api/riddle/:id' ,[
  param('id').isLength({min: 5, max: 8}), 
  body().custom(value => {   
    if(value.riddle===undefined){
      throw new Error('Missing parameters');
    }
    else if (value.riddle.question ===undefined) { 
      throw new Error('Missing parameters');
    }else if(value.riddle.answer===undefined){
      throw new Error('Missing parameters');
    }else if(value.riddle.firstHint===undefined || value.riddle.secondHint===undefined){
      throw new Error('Missing parameters');
    }else if(value.riddle.duration===undefined){
      throw new Error('Missing parameters');
    }else if(value.riddle.difficulty===undefined){
      throw new Error('Missing parameters');
    }
    
    return true;
    }),
    body().custom(value => {    

      if (value.riddle.question.length===0) {   
        throw new Error('invalid question');
      }else if(value.riddle.answer.length===0){
        throw new Error('invalid answer');
      }else if(value.riddle.firstHint.length===0|| value.riddle.secondHint.length===0){
        throw new Error('invalid hint');
      }else if(isNaN(value.riddle.duration) ||value.riddle.duration<30||value.riddle.duration>600){
        throw new Error('invalid duration');
      }else if(value.riddle.difficulty!=="EASY" && 
        value.riddle.difficulty!=="AVERAGE" && value.riddle.difficulty!=="DIFFICULT" ){
        throw new Error('invalid difficulty');
      }
      
      return true;
      }),

    
],
validationHandler,async (req,response)=>{
  
  if(!req.isAuthenticated() || req.user.id!==req.params.id){
    return response.status(401).json("Not Authorized");
  }
  try{
    const newRiddleID = await dao.createNewRiddle(req.user.id,req.body.riddle);
    wsServer.pushUpdates(newRiddleID);
    response.status(201).end()
  }catch(err){
    response.status(500).json("Internal server error");
  }
});



/**
 * API for getting the riddles
 */
app.get('/api/riddles' , async (req,response)=>{
  try{
    let result = await dao.getAllRiddles();
      if(!req.isAuthenticated()){
        result = result.map(e => 
          {
            e.answers = [];
            e.answer = undefined;
            e.firstHint = undefined;
            e.secondHint = undefined;
            e.winnerUserID = undefined;
            return e;
          });
      } else {
        result = result.map(e => {
          if(e.userIDAuthor !== req.user.id && e.state==="OPEN") {
            e.answer = undefined;
            e.firstHint = e.closureTime && (((e.closureTime - Date.now())/e.duration <= 0.50)) ? e.firstHint : undefined;
            e.secondHint = e.closureTime && (((e.closureTime - Date.now())/e.duration <= 0.25)) ? e.secondHint : undefined;
            e.answers = e.answers.filter(a => a.userID === req.user.id);     
          }
          return e;
        })
      }
    return response.status(200).json(result)
    
  }catch(err){
    response.status(500).end();
  }
});

/**
 * API: POST of a new answer for a given riddle by an user
 **/

app.post('/api/:id/riddle/:riddleid/answer' ,[
  param('id').isLength({min: 5, max: 5}),
  param('riddleid').isNumeric(), 
  body().custom(value => {   
    if(value.answer===undefined){
      throw new Error('Missing parameters');
    }
    else if (value.riddleID ===undefined) { 
      throw new Error('Missing parameters');
    }
    return true;
    }),
    body().custom(value => {    

      if (value.answer.length===0) {   
        throw new Error('invalid answer');
      }else if(isNaN(value.riddleID)){
        throw new Error('invalid riddleID');
      }
      return true;
      }),

    
],
validationHandler,async (req,response)=>{
  if(!req.isAuthenticated() || req.user.id!==req.params.id){
    return response.status(401).json("Not Authorized");
  }
  try{
    const result = await dao.insertAnswer(req.body.riddleID,req.user.id,req.body.answer);
    response.status(result.code).json(result.message);
    wsServer.pushUpdates(req.body.riddleID);
  }catch(err){
    response.status(500).json("Internal server error");
  }
});

/**
 * API for getting the ranking
 **/

app.get('/api/riddles/ranking' , async (req,response)=>{
  try{
    const result = await userDao.getRanking();
    if(result.error){
      return response.status(404).json("Ranking not Found");
    }
    return response.status(200).json(result)
    
  }catch(err){
    response.status(500).end();
  }
});


// activate the server
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}.`);
});


