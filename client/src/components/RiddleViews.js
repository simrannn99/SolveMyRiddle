import { Row, Col, Container} from 'react-bootstrap';
import { Outlet } from "react-router-dom";
import { ToastContainer} from 'react-toastify'
import './style.css'
import { RiddleNavbar } from './RiddleNavbar';
import { CreateRiddleForm } from './CreateRiddle';
import { LoginForm } from './AuthComponents';
import {RiddleGrid} from './RiddleGrid'
import {RiddleRanking} from './Ranking'
import {useEffect, useState } from 'react';
import {ButtonBar} from './ButtonBar';


const filterDictionary = {
  'All': e=>e,
  'Open': e=>e.state==="OPEN",
  'Closed': e=>e.state==="CLOSED"
}

function DefaultRoute() {
    return(
      <>
        <Row>
          <Col>
            <h1>Nothing here...</h1>
            <p>This is not the route you are looking for!</p>
          </Col>
        </Row>
      </>
    );
  }
  
  function Layout(props){

    return(
      <>
      <Row>
        <RiddleNavbar loggedUser = {props.loggedUser} score={props.score} handleLogout={props.handleLogout} />  
        <ToastContainer />
      </Row>
      <Outlet />
    </>
    );
  }
  function LoginRoute(props) {
    return(
      <>
      <Container fluid className='mt-3 float-left' id="float-container">
        <LoginForm login={props.login} />
      </Container>
      </>
    );
  }

  function CreateRiddle(props) {
    return(
      <>
      <Container fluid className='mt-3 float-left' id="float-container">
        <Row>
            <CreateRiddleForm loggedUser={props.loggedUser}/>
        </Row>
      </Container>
      </>
    )
  }

function HomePage(props){

  const [riddlesToBeShown,setRiddles] = useState(props.allRiddles);
  const [tableTitle,setTableTitle]=useState('All');

    useEffect(()=>{
      if(tableTitle==='My Riddles'){
        if(props.loggedUser)
          setRiddles(props.allRiddles.filter(e=>e.userIDAuthor===props.loggedUser.id))
        else{
          setTableTitle('All');
          setRiddles(props.allRiddles);
        }
      }
      else if(tableTitle==='My Victories'){
        if(props.loggedUser)
          setRiddles(props.allRiddles.filter(e=>e.winnerUserID===props.loggedUser.id))
        else{
          setTableTitle('All');
          setRiddles(props.allRiddles);
        }
      }
      else
        setRiddles(props.allRiddles.filter(filterDictionary[tableTitle]));
    },[tableTitle,props.allRiddles,props.loggedUser])


  return(
    <>
    <Container fluid className='mt-3 float-left' id="float-container">
    <Row> 
      <Container fluid className='col-lg-11 col-md-11'>
     <Row>
      <Col>
        <RiddleRanking ranking={props.ranking} />
      </Col>
     </Row>
     <Row className="row-container">
      <ButtonBar setTableTitle = {setTableTitle} loggedUser={props.loggedUser}/>
     </Row>
     <Row>
      <Col>
        <RiddleGrid riddles={riddlesToBeShown} loggedUser={props.loggedUser} tableTitle={tableTitle} 
        setDirty={props.setDirty} />
      </Col>
     </Row>
     </Container>
     </Row>
    </Container>
   </>
  );

}
  
  export {Layout,DefaultRoute,LoginRoute, CreateRiddle, HomePage}