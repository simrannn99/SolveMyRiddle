import {Container, Navbar, Button} from 'react-bootstrap'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import React from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate} from 'react-router-dom';
import './Navbar.css'

function RiddleNavbar(props) {

  const navigate = useNavigate();
  

	return(
	<Navbar className='navbar navbar-expand-sm bg-success navbar-success' id="navbar"  variant='dark' expand="lg">
      <Container fluid id="container-navbar">
        <Navbar.Brand>
            <i className="bi bi-journal-check"/> Riddle 
        </Navbar.Brand>
        <Navbar id="navbarScroll">
        {
          props.loggedUser && <span id="score">SCORE: {props.score}</span>
        }
        { props.loggedUser &&
          <Button id="logOutButton" variant="success"  onClick={() => {props.handleLogout(); navigate('/');}}>
            {props.loggedUser.id}<br/>Logout</Button>
          
        }
        {
          props.loggedUser &&
          <img id="user_image" src={require(`./images/${props.loggedUser.id}.png`)} alt={'./images/man.png'} />
        }
        
        { !props.loggedUser && <a href="/Login" className='userIcon' >
              <svg xmlns="http://www.w3.org/2000/svg" color ="white" width="25" height="25" fill="currentColor" 
              className="bi bi-person-circle" viewBox="0 0 16 16">
                <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
              </svg>
            </a>
        }
        </Navbar>
      </Container>
    </Navbar>
	);
}

export{RiddleNavbar};