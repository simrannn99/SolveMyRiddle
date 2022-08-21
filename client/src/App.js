import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import {toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.min.css';
import { useEffect, useState } from 'react';
import { Routes, Route,Navigate } from 'react-router-dom';
import { Container} from 'react-bootstrap';
import API from './API';
import { DefaultRoute, Layout, LoginRoute, CreateRiddle, HomePage} from './components/RiddleViews';
import { w3cwebsocket as W3CWebSocket } from "websocket";

let client;
const initClient = () => {

 client = new W3CWebSocket('ws://localhost:3002/ws');
  client.onopen = () => {
    console.log('WebSocket Client Connected');
};

client.onerror = function() {
  console.log('Connection Error');
};
}

initClient();

function App() {

  const [loggedIn, setLoggedIn] = useState(false);
  const [loggedUser, setLoggedUser] = useState('');
  const [dirty,setDirty] = useState(true);
  const [allRiddles,setAllRiddles] = useState([]);
  const [score, setScore] = useState(0);
  const [ranking,setRanking] = useState([])
  const [connection,setConnection] = useState(true);

  useEffect(()=>{
    if(connection){
      client.close();
      initClient();
      setConnection(false);
    }
  },[connection])

    client.onmessage = (message) => {
     
      if(message.data){
        const receivedMessage = JSON.parse(message.data)
        const riddle = receivedMessage.riddle;
        let riddles = allRiddles.map(e => (e.id === riddle.id) ?  riddle : e);
        if(riddles.filter(e => (e.id === riddle.id)).length === 0) 
          riddles.push(riddle);   
        setAllRiddles(riddles);
        if(loggedUser){
          setScore(receivedMessage.score);
        }
        setRanking(receivedMessage.ranking);

      }
    };


  

  useEffect(() => {
    if(loggedIn){
      setDirty(true);
    }
    setConnection(true);
    client.close();
    initClient();
  }, [loggedIn]);


  useEffect(() => {
    const checkAuth = async () => {
      try{
       
        const user = await API.getUserInfo(); // we have the user info here
        setLoggedUser(user);     

        if(user){
          setLoggedIn(true);
          setScore(user.score);   
        }

      }catch(error){
        console.log(error)
      }
    };
    checkAuth();
  }, []);

  
  const handleLogin = async (credentials) => {
    try {
      const user = await API.logIn(credentials);  
      setLoggedUser(user);
      setScore(user.score);
      setLoggedIn(true);
      toast.success(`Welcome, ${user.name}`, {position: "top-center"});
    }catch(err) {
      toast.error(`Incorrect username and/or password`, { position: "top-center" },{toastId: 1});
    }
  }

  const handleLogout = async () => {
    try {
      await API.logOut();
      toast.success(`Good bye, ${loggedUser.name}`, {position: "top-center"});
      setLoggedUser('');
      setLoggedIn(false);
    }catch(err) {
      toast.error(`LogOut error`, { position: "top-center" },{toastId: 1});
    }
  }

  useEffect(()=>{
    const getAllRiddles = async()=>{
      try{
        const riddles = await API.getAllRiddles();
        setAllRiddles(riddles);
      }catch(error){
        toast.error(error, { position: "top-center" });
      }
    };
    const getRanking = async()=>{
      try{
        const ranking = await API.getRanking();
        setRanking(ranking);
      }catch(error){
        toast.error(error, { position: "top-center" });
      }
    };
    if(dirty){
      
      getAllRiddles();
      getRanking();
      setDirty(false)     
    }
    
  },[dirty,loggedUser,loggedUser.id])


 

  return (
    <Container fluid>
        <Routes>
          <Route path='/' element={ <Layout handleLogout = {handleLogout} score={score} loggedUser = {loggedUser} />} >        
          <Route index element={<HomePage loggedUser={loggedUser}  ranking={ranking} allRiddles={allRiddles} />} />
          <Route path='*' element={ <DefaultRoute/> } />
          <Route path='/CreateRiddle' element={loggedIn? <CreateRiddle loggedUser={loggedUser} /> : ''} />
          <Route path='/Login' element={loggedIn? <Navigate replace to='/' /> : <LoginRoute login={handleLogin} /> } />
        </Route>
      </Routes>
    </Container>
    
  );
}

export default App;

