'use strict';
const sqlite = require('sqlite3');
const crypto = require('crypto');
const { User } = require('./User');

   /**
     *  + --------------------------------------------- +
     *  |                                               |
     *  |           DATABASE: CREATION                  |
     *  |                                               |
     *  + --------------------------------------------- +
     */

const users = [
  new User("Fabio","Stani","r0001","fabio.stani@studenti.polito.it","password",0),
  new User("Andrea","Scotti","r0002","andrea.scotti@studenti.polito.it","password",0),
  new User("Tom","Jerry","r0003", "tom.jerry@studenti.polito.it","password",0),
  new User("Michele","Peroni","r0004","michele.peroni@studenti.polito.it","password",0),
  new User("Parnit","Singh","r0005","parnit.singh@studenti.polito.it","password",0),
]

exports.database = function createDatabase(){
  const db = new sqlite.Database('database.sqlite', (err) => {
          if (err) throw err;});
   
    createTableUsers();
    createTableRiddle();
    createTableAnswers();

    /* ----- TABLES CREATION ----- */
      async function createTableRiddle(){
        await new Promise(async (resolve, reject) => {
          const sql = ` CREATE TABLE IF NOT EXISTS RIDDLE( \
                          id INTEGER PRIMARY KEY AUTOINCREMENT,\
                          difficulty VARCHAR(8),\
                          question VARCHAR(100),\
                          duration INTEGER,\
                          answer VARCHAR(100),\
                          firstHint VARCHAR(100),\
                          secondHint VARCHAR(100),\
                          state VARCHAR(6),\
                          openingTime DATETIME,\
                          closureTime DATETIME,\
                          userIDAuthor VARCHAR(5),\
                          winnerUserID INTEGER,\
                          FOREIGN KEY (userIDAuthor) REFERENCES USERS(id),
                          FOREIGN KEY (winnerUserID) REFERENCES USERS(id)
                          )`;
         db.run(sql, function( error){
              if(error){
                console.log(error)
                  reject(error);     
              }else{
                resolve(this.lastID);
              }
            });
          
        });
        
      } 


      async function createTableAnswers(){
        await new Promise(async (resolve, reject) => {
          const sql = ` CREATE TABLE IF NOT EXISTS ANSWER( \
                          id INTEGER PRIMARY KEY AUTOINCREMENT,\
                          riddleID INTEGER,\
                          userID VARCHAR(5),\
                          answer VARCHAR(100),\  
                          time DATETIME,\
                          correct BOOLEAN,\
                          FOREIGN KEY (UserID) REFERENCES USERS(id),\
                          FOREIGN KEY (riddleID) REFERENCES RIDDLE(id)
                          )`;
         db.run(sql, function( error){
              if(error){
                console.log(error)
                  reject(error);     
              }else{
                resolve(this.lastID);
              }
            });
          
        });
        
      } 

      async function createTableUsers(){
        await new Promise( async(resolve, reject) => {
          const sql = ` CREATE TABLE IF NOT EXISTS USERS( \
                          id VARCHAR(5),\
                          mail VARCHAR(20),\
                          name VARCHAR(7),\
                          surname VARCHAR(7),\
                          password VARCHAR(32),
                          salt VARCHAR(16),
                          score INTEGER,
                          PRIMARY KEY(id)  
                          )`;
          db.run(sql, function(error){
              if(error){
                console.log(error)
                  reject(error);   
              }else{
                resolve(this.lastID);
              }
            });
        });
        await insertUser();      
      }



  async function insertUser() {
    users.forEach(async (user)=>{
      await new Promise((resolve, reject) => {
        const sql = "INSERT OR IGNORE INTO USERS(id,name,surname, mail, password, salt,score) VALUES(?,?,?,?,?,?,?)";
        const salt = crypto.randomBytes(8).toString('hex');
        crypto.scrypt(user.password, salt, 32, function(err, hashedPassword){
            if(err){
                reject(err);
            }else{
                db.run(sql, [user.id,user.name, user.surname, user.mail, hashedPassword.toString('hex'), salt, user.score], function(err){
                    if(err){
                        reject(err);
                    }else{
                        resolve(this.lastId);
                    }
                })
            }
        });
    })
   
  });
}

   

    return db;

}

