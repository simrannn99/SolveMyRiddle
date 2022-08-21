const { WebSocketServer } = require('ws');
const dao = require('./riddle-dao')
const user_dao = require('./user-dao')

let wsServer = new WebSocketServer({
    port : 3002,
    path : '/ws'


});


let sessionUser = {};


wsServer.on('connection', (ws,req) => {
    const sessionID = req.headers.cookie?.match(/^(?:connect\.sid=s%3A)([^.]*)/)[1];
    const session = sessionUser[sessionID];
    const userID = session?.userID;
    
    if(sessionUser[sessionID])
      sessionUser[sessionID].ws = ws;
    else if(sessionID)
      sessionUser[sessionID] = {ws : ws};
    

ws.on('close',(connection) => {
  const deleteThis = []
  Object.keys(sessionUser).forEach(key => { 
    if(sessionUser[key].ws === connection)
      deleteThis.push(key);
  });
  deleteThis.forEach(k => delete sessionUser[k]);
});
});



wsServer.pushUpdates = async (riddleID) => {


    const riddle = await dao.getRiddleById(riddleID);
    const ranking = await user_dao.getRanking();

    Object.keys(sessionUser).forEach(async key => { 
       
        if(!sessionUser[key].userID){
          let riddleToBeSent = {...riddle};
          riddleToBeSent.firstHint = undefined;
          riddleToBeSent.secondHint = undefined;
          riddleToBeSent.answers = [];
          riddleToBeSent.answer = undefined;
          riddleToBeSent.winnerUserId = undefined;
          sessionUser[key]?.ws?.send(JSON.stringify({riddle: riddleToBeSent, score:undefined, ranking: ranking}))
        }
        else if(sessionUser[key].userID === riddle.userIDAuthor){
        
          const score = await user_dao.getScoreOfUserID(sessionUser[key].userID);
          sessionUser[key].ws?.send(JSON.stringify({riddle: riddle, score:score, ranking: ranking}));         
        }else {
          let riddleToBeSent = {...riddle};
          if(riddleToBeSent.state==="OPEN"){
            riddleToBeSent.answer = undefined;
            riddleToBeSent.firstHint = riddleToBeSent.closureTime && ((riddleToBeSent.closureTime - Date.now())/riddleToBeSent.duration <= 0.50) ? riddleToBeSent.firstHint : undefined;
            riddleToBeSent.secondHint = riddleToBeSent.closureTime && ((riddleToBeSent.closureTime - Date.now())/riddleToBeSent.duration <= 0.25) ? riddleToBeSent.secondHint : undefined;
            riddleToBeSent.answers = await dao.getRiddleAnswerByUserID(sessionUser[key].userID,riddleID)
          }
          
          const score = await user_dao.getScoreOfUserID(sessionUser[key].userID);
          sessionUser[key]?.ws?.send(JSON.stringify({riddle: riddleToBeSent, score:score, ranking: ranking}))
        }
          
         
      })
}

wsServer.insertSessionUser = (sessionID, userID) => {

  sessionUser[sessionID] = { userID : userID };
  
}

wsServer.removeSessionUser = (sessionID) => {
  
  sessionUser[sessionID]?.ws?.close();
  delete sessionUser[sessionID];
}


module.exports = { wsServer };
