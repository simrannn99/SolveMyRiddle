'use strict';


function Riddle (id, difficulty, duration, question, answer, firstHint,secondHint, state="OPEN" , openingTime, closureTime, userIDAuthor, winnerUserID) {
    this.id = id;
    this.difficulty=difficulty;
    this.duration=duration;
    this.question=question;
    this.answer=answer;
    this.firstHint=firstHint;
    this.secondHint=secondHint;
    this.state=state;
    this.openingTime=openingTime;
    this.closureTime=closureTime;
    this.userIDAuthor=userIDAuthor;
    this.winnerUserID=winnerUserID;
}

exports.Riddle = Riddle;