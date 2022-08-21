
function Riddle (id, difficulty, duration, question, answer, firstHint,secondHint, state , openingTime, closureTime, userIDAuthor, winnerUserID, answers) {
    this.id = id;
    this.difficulty=difficulty;
    this.duration=duration;
    this.question=question;
    this.answer=answer;
    this.firstHint=firstHint;
    this.secondHint=secondHint;
    this.state= state;
    this.openingTime=new Date(openingTime);
    this.closureTime=closureTime? new Date(closureTime) : closureTime;
    this.userIDAuthor=userIDAuthor;
    this.winnerUserID=winnerUserID;
    this.answers = [...answers];
}

exports.Riddle = Riddle;