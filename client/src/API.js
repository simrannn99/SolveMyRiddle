import { Riddle } from "./Riddle";
import{ User } from "./User"

const SERVER_URL = 'http://localhost:3001';


const logIn = async (credentials) => {
  
  const response = await fetch(SERVER_URL + '/api/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(credentials),
  });
  if(response.ok) {
    const user = await response.json();
    return user;
  }
  else {
    const errDetails = await response.text();
    throw errDetails;
  }
};

const getUserInfo = async () => {
  const response = await fetch(SERVER_URL + '/api/sessions/current', {
    credentials: 'include',
  });
  const user = await response.json();
  if (response.ok) {
    return user;
  } else {
    throw user;  // an object with the error coming from the server
  }
};

const logOut = async() => {
  const response = await fetch(SERVER_URL + '/api/sessions/current', {
    method: 'DELETE',
    credentials: 'include'
  });
  if (response.ok)
    return null;
}
const createRiddle = async(id,riddle)=>{
  const res = await fetch(SERVER_URL + '/api/riddle/'+id , {
    credentials: 'include',
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({id, riddle})
  });
 
  
  if(!res.ok){
    const errMessage = await res.text();
    throw errMessage;
  }
  else return null;
}


const getAllRiddles = async(id) => {
  const response = await fetch(SERVER_URL + '/api/riddles',{
    credentials: 'include'
  });
  const riddlesJson = await response.json();

  if(response.ok) {
    const res = riddlesJson.map(riddle=>new Riddle(riddle.id,riddle.difficulty,riddle.duration,riddle.question,riddle.answer,riddle.firstHint,riddle.secondHint,riddle.state,riddle.openingTime,riddle.closureTime,riddle.userIDAuthor,riddle.winnerUserID,riddle.answers));  
    return res
  }
  else
    throw riddlesJson;
}
const insertAnswer = async(id,riddleID,answer)=>{
  const res = await fetch(SERVER_URL + '/api/'+id+'/riddle/'+ riddleID+'/answer' , {
    credentials: 'include',
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({id, riddleID,answer})
  });
 
  
  if(!res.ok){
    const errMessage = await res.text();
    throw errMessage;
  }
  else return null;
}

const getRanking = async()=>{
  const response = await fetch(SERVER_URL + '/api/riddles/ranking',{
    credentials: 'include'
  });
  const rankingJson = await response.json();

  if(response.ok) {
    const res = rankingJson.map(row=>new User(row.name,row.surname,row.id,row.mail,row.password,row.score)); 
    return res
  }
  else
    throw rankingJson;
} 
const API = {logIn,logOut,getUserInfo,createRiddle, getAllRiddles, insertAnswer, getRanking };
export default API;