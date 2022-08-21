'use strict';


function Answer (id, riddleID, userID, time, correct=false,answer) {
    this.id = id;
    this.riddleID=riddleID;
    this.userID=userID;
    this.time=time;
    this.correct=correct;
    this.answer=answer;
}

exports.Answer = Answer;