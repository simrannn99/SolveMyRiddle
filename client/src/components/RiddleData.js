import {Card, Col, ListGroup,Form, Button} from 'react-bootstrap';
import { useState } from 'react';
import './RiddleGrid.css'
import API from './../API'
import {toast} from 'react-toastify'
import {CountdownTimer} from './CountdownTimer'

function RiddleCard(props){
  const [answer,setAnswer]=useState('');
  const [validated, setValidated] = useState(false);


  const handleSubmit = async (event) => {

    event.preventDefault();
    const form = event.currentTarget;
    event.preventDefault();
    setValidated(true);
    
    if(form.checkValidity() === false) {
          return;
      }
    
    try{
        await API.insertAnswer(props.loggedUser.id,props.riddle.id,answer);
        toast.success(`answer successfully created`, { position: "top-center" } );  
      }catch(error){
        toast.error(`${error}`,  { position: "top-center" });
      }
};

    return(
       <>
        <Col className="col-card">
          <Card className={props.riddle.state}>
          <Card.Header className={`${props.riddle.state}_header`}>
            <div className="col-3">#{props.riddle.id} {props.riddle.state}</div>
            <div className="col-4">{props.riddle.difficulty}</div>
            <div className="col-3">
              <img id="user_image" src={require(`./images/${props.riddle.userIDAuthor}.png`)} alt={'./images/man.png'} />
              <span>{props.riddle.userIDAuthor}</span> 
            </div>
          </Card.Header>
          <Card.Body>
              <Card.Title><strong>Question</strong> {props.riddle.question}</Card.Title>
              {props.loggedUser && 
              <Card.Text>
                {((props.riddle.state==="OPEN" && props.loggedUser.id===props.riddle.userIDAuthor) 
                    || props.riddle.state==="CLOSED")
                    && <span><strong>Correct answer</strong>: {props.riddle.answer}</span>
                }
                {props.riddle.firstHint &&
                  <span><br /><strong>First Hint</strong>: {props.riddle.firstHint}</span>
                }
                {props.riddle.secondHint && 
                  <span><br /><strong>Second Hint</strong>: {props.riddle.secondHint}</span>
                }
                {props.riddle.state==="CLOSED" && props.riddle.winnerUserID && 
                    <span><br /><strong>Winner User ID</strong>: <img id="user_image" 
                    src={require(`./images/${props.riddle.winnerUserID}.png`)} alt={'./images/man.png'} /> 
                    {props.riddle.winnerUserID}</span>
                }
              </Card.Text>
              }
          </Card.Body>
            <ListGroup variant="flush">
            {props.loggedUser && props.riddle.state==="OPEN" && (props.loggedUser.id!==props.riddle.userIDAuthor)
             && props.riddle.answers.length===0 && 
              <ListGroup.Item><strong>Answer</strong>:
                <Form noValidate className='p-4' validated={validated} onSubmit={handleSubmit}>
                  <Form.Control required={true} type='text'  
                      value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder='Answer'
                      pattern='^.*\S.*$'/>
                  <Form.Control.Feedback type='invalid'> Please insert a valid answer! </Form.Control.Feedback>
                  <Button variant='success' type='submit'>Save</Button>&nbsp;
                </Form>
              </ListGroup.Item>}
            </ListGroup>
            {props.loggedUser && (props.riddle.state==="CLOSED" || (props.riddle.answers.length!==0
            && props.riddle.state==="OPEN" )) && 
            <ListGroup>
              {props.riddle.answers.map(e=>
                 <ListGroup.Item key={e.id} className={e.correct ? 'correct' : ''}>
                  <div className="Answer">
                    <div>
                      <div>
                        <img id="user_image" src={require(`./images/${e.userID}.png`)} alt={'./images/man.png'} />
                        <span>{e.userID}</span> 
                      </div>
                      <span>{new Date(e.time).toLocaleString()}</span>
                    </div>
                    <div>{e.answer}</div>
                    </div> 
                  </ListGroup.Item>)}
            </ListGroup>}
             <Card.Footer className="text-muted">
              {
                props.riddle.state ==="OPEN" && props.riddle.closureTime && props.loggedUser &&
                <CountdownTimer targetDate={props.riddle.closureTime} />
              }
              {props.riddle.state==="OPEN"? `Opened at ${new Date(props.riddle.openingTime).toLocaleString()}` :
               `Closed at ${new Date(props.riddle.closureTime).toLocaleString()}`
               }
              </Card.Footer>   
          </Card>
        </Col>
       </>
    );
}
        
export {RiddleCard};