'use strict';
const { database } = require('./db');
const db = new database();
const { Riddle } = require('./Riddle');
const {Answer} = require('./Answer');
const { wsServer } = require('./ws_notifcation');
const userDao = require('./user-dao'); 


let scores = new Map();
scores.set("EASY",1); 
scores.set("AVERAGE",2); 
scores.set("DIFFICULT",3);

exports.createNewRiddle = async (userIDAuthor, riddle)=>{
    const creationDate = Date.now();
   
    return await new Promise((resolve, reject) => {
        const sql = 'INSERT INTO RIDDLE(difficulty,question,duration,answer,\
            firstHint,secondHint,openingTime,closureTime,userIDAuthor,winnerUserID,state)\
             VALUES(?,?,?,?,?,?,?,?,?,?,?)';
        db.run(sql, [riddle.difficulty,riddle.question,riddle.duration*1000,riddle.answer,
            riddle.firstHint,riddle.secondHint,creationDate,null,userIDAuthor,null,"OPEN"], 
        function (err) { 
            if(err){
                reject(err);
            }
            else{
                resolve(this.lastID);
            }
        });
    });
      
}

exports.getAnswersByRiddleID = async (riddleID) =>{
    return await new Promise((resolve,reject)=>{
        let sql = 'SELECT * FROM ANSWER WHERE riddleID==?'
        db.all(sql, [riddleID], (err,rows) => {
            if(err){
                reject(err);
            }
            else{
                const answers = rows.map(row=>new Answer(row.id,row.riddleID,row.userID,row.time,row.correct,row.answer));
                resolve(answers);
            }
            });
    })
}


exports.getAllRiddles = async ()=>{

    const riddles =  await new Promise((resolve,reject)=>{
        let sql = 'SELECT * FROM RIDDLE'
        db.all(sql, [], (err,rows) => {
            if(err){
                reject(err);
            }
            else{
                const riddles = rows.map(row=>new Riddle(row.id,row.difficulty,row.duration,
                    row.question,row.answer,row.firstHint,row.secondHint,row.state,row.openingTime,
                    row.closureTime,row.userIDAuthor,row.winnerUserID))
                resolve(riddles);
            }
            });
    })
    await Promise.all(riddles.map(async riddle=>{
        try{
            riddle.answers = await this.getAnswersByRiddleID(riddle.id);
            return riddle;
        }catch(error){
            throw error;
        }
    }))
   
    return riddles

}
exports.initTimer = async () => {
    const riddles = await this.getAllRiddles();
    await Promise.all(riddles.map(async riddle=>{
        if(riddle.closureTime && riddle.state==="OPEN"){
                //close the riddle when the timer expires
                setTimeout(async () => {
                    await this.updateRiddle(riddle.id,riddle.winnerUserID,riddle.closureTime,"CLOSED")
                    wsServer.pushUpdates(riddle.id)
                }, riddle.closureTime - Date.now());
                
                //send first hint 
                setTimeout(async () => {
                    wsServer.pushUpdates(riddle.id)
                }, riddle.closureTime - riddle.duration*0.5 - Date.now());

                //send second hint
                setTimeout(async () => {
                    wsServer.pushUpdates(riddle.id)
                }, riddle.closureTime - riddle.duration*0.25 - Date.now());
                          
        }
    }))
}

exports.getRiddleAnswerByUserID = async (userID,riddleID)=>{
    return await new Promise((resolve,reject)=>{
        let sql = 'SELECT * FROM ANSWER WHERE userID==? and riddleID=?'
        db.all(sql, [userID,riddleID], (err,rows) => {
            if(err){
                reject(err);
            }
            else{
                const answers = rows.map(row=>new Answer(row.id,row.riddleID,row.userID,
                    row.time,row.correct,row.answer));
                resolve(answers);
            }
            });
    })
}

exports.getRiddleById = async(id)=>{
    try{
        const riddle =  await new Promise((resolve,reject)=>{
        let sql = 'SELECT * FROM RIDDLE WHERE id==?'
        db.get(sql, [id], (err,row) => {
            if(err){
                reject(err);
            }
            else{

                if(!row){
                    resolve(row)
                }
                const riddle = new Riddle(row.id,row.difficulty,row.duration,row.question, row.answer,row.firstHint,
                    row.secondHint,row.state,row.openingTime,row.closureTime,row.userIDAuthor,row.winnerUserID)
                resolve(riddle);
            }
            });
         })

        riddle.answers = await this.getAnswersByRiddleID(id);
        return riddle
    }catch(error){
        throw error
    }
}

exports.updateRiddle = async (riddleID,winnerUserID,closureTime,state) => {
    
    await new Promise((resolve, reject) => {
        const sql = 'UPDATE RIDDLE SET winnerUserID=?, closureTime=?, state=? WHERE id=? AND winnerUserID IS NULL';
        db.run(sql, [winnerUserID, closureTime, state, riddleID], function (err) {
          if(err){
            reject(err);
          }
          else{
            resolve(this.changes);
          }
        });
      });
    
}

exports.insertAnswer = async (riddleID,userID,answer) =>{
    
    let riddle = await this.getRiddleById(riddleID);
    if(!riddle){
        return {code:404,message:"Riddle not Found"}
    }
    try{
        
        const answer = await this.getRiddleAnswerByUserID(userID,riddleID);
        if(answer.length>0){
            return {code:422,message:"Answer already inserted"}
        }
    }catch(error){
        throw error
    }
    if(riddle.userIDAuthor===userID){
        return {code:422,message:"Author cannot answer to his own question"}
    }

    let answerDate = Date.now();
    let correct = false;

    if(answer===riddle.answer){
        correct=true;
        try{
            if(riddle.closureTime){
                if(riddle.closureTime-answerDate<0){
                    return {code:422,message:"Riddle is closed"}
                }
            }
            
            await this.updateRiddle(riddleID,userID,answerDate,"CLOSED")
            await userDao.updateScore(userID,scores.get(riddle.difficulty))
            wsServer.pushUpdates(riddleID)

        }catch(error){
            throw error;
        }
        
    }else{
        let closureTime = Date.now()+riddle.duration;     
        if(!riddle.closureTime){
            try{
                
                await this.updateRiddle(riddleID,null,closureTime,"OPEN")
        
                setTimeout(async () => {
                    await this.updateRiddle(riddleID,null,closureTime,"CLOSED")
                    wsServer.pushUpdates(riddleID)
                    
                }, closureTime - Date.now());
                
                setTimeout(async () => {
                    wsServer.pushUpdates(riddleID)
                }, closureTime - riddle.duration*0.5 - Date.now());

                setTimeout(async () => {
                    wsServer.pushUpdates(riddleID)
                }, closureTime - riddle.duration*0.25 - Date.now());

            }catch(error){
                throw error;
            }
        }
    }
    
    return await new Promise((resolve, reject) => {
        let sql = 'INSERT INTO ANSWER(riddleID,userID,time,correct,answer) VALUES(?,?,?,?,?)';
        db.run(sql, [riddleID,userID,answerDate,correct,answer], (err) => {
        if(err){
            reject(err);
        }
        else{
            resolve({code:201,message:"Success"});
        }
        });
    });
   
    
}