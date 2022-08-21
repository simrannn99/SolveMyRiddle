'use strict';
const { database } = require('./db');
const db = new database();
const crypto = require('crypto');
const { User } = require('./User');


exports.getUser = (id, password) => {
  return new Promise((resolve, reject) => {
    let sql = 'SELECT * FROM USERS U WHERE U.id = ?';
    db.get(sql, [id], (err, row) => {
      if (err) { 
        reject(err); 
      }
      else if (row === undefined) { 
        resolve(false); 
      }
      else {
        const user = new User(row.name,row.surname,row.id,row.mail,row.password,row.score);
        
        crypto.scrypt(password, row.salt, 32, function(err, hashedPassword) {
          if (err) reject(err);
          if(!crypto.timingSafeEqual(Buffer.from(row.password, 'hex'), hashedPassword))
            resolve(false);
          else
            resolve(user);
        });
      }
    });
  });
};


// User Deserialization

exports.deserializeUser = async (id) => {
  const query = "SELECT * FROM USERS WHERE id=?";
  return new Promise((res, rej) => {
      db.get(query, [id], (err, row) => {
          if (err)
              res({ status: false, error: err });
          else if(row===undefined)
              res({status: false, error: "Not Found"})
          else res({
              status: true, result:  row
          });
      });
  });
}



/**
 * 
 * @returns the top three users
 */
exports.getRanking = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT id, name, surname, score FROM USERS ORDER BY score DESC, id ASC LIMIT 3';
    db.all(sql, [], (err, rows) => {
      if (err) { 
        reject(err); 
      }
      else if (rows === undefined) { 
        resolve({error: 'User not found!'}); 
      }
      else {
        const ranking = rows.map(row=>new User(row.name,row.surname,row.id,row.mail,row.password,row.score))
        resolve(ranking);
      }
    });
  });
};

/**
 * 
 * @returns the score of the user
 */

exports.getScoreOfUserID = async(id)=>{
  return new Promise((resolve, reject) => {
    const sql = 'SELECT score FROM USERS WHERE id=?';
    db.get(sql, [id], (err, row) => {
      if (err) { 
        reject(err); 
      }
      
      if(row)
        resolve(row.score);
      else resolve(row)
    });
  });
};

/**
* updates the score 
 */

exports.updateScore = (id,score) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE USERS SET score = score + ? WHERE id=?';
    db.run(sql, [score,id], function(err){
      if (err) { 
        reject(err); 
      }
      else {
        resolve(this.changes);
      }
    });
  });
};