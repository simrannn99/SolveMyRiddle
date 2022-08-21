import { useState } from 'react';
import {Form, Button, Container} from 'react-bootstrap';
import { useNavigate} from 'react-router-dom';
import './createRiddle.css'
import API from './../API';
import {toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.min.css';

function CreateRiddleForm(props) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [firstHint,setFirstHint] = useState('');
  const [secondHint, setSecondHint]=useState('');
  const [difficulty, setDifficulty]=useState('');
  const [duration,setDuration]=useState(30);
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {

      event.preventDefault();
      const form = event.currentTarget;

        event.preventDefault();

        setValidated(true);

        if(form.checkValidity() === false) {
            return;
        }
      
      try{
        const riddle = {question: question, answer: answer, firstHint: firstHint, 
            secondHint: secondHint, difficulty: difficulty, duration: duration };
        await API.createRiddle(props.loggedUser.id,riddle);
        toast.success(`Riddle successfully created`, { position: "top-center" } );
        navigate('/');
      }catch(error){
        toast.error(`${error}`,  { position: "top-center" });
      }
  };


  return(
    <Container className="container-create">
    <Container >
    <Form noValidate className='p-4' validated={validated} onSubmit={handleSubmit}>
        <h3 className="text-center">Create a new Riddle</h3>
                <Form.Group  className="mb-3" >
                    <Form.Label> Question </Form.Label>
                    <Form.Control as="textarea" rows={3} required={true} type='textarea'  
                        value={question} onChange={(event) => setQuestion(event.target.value)} 
                        placeholder='Question' pattern='^.*\S.*$'/>
                    <Form.Control.Feedback type='invalid'> 
                        Please insert a valid question! 
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group  className="mb-3" >
                    <Form.Label> Answer </Form.Label>
                    <Form.Control required={true} type='text'  
                        value={answer} onChange={(event) => setAnswer(event.target.value)} 
                        placeholder='Answer' pattern='^.*\S.*$'/>
                    <Form.Control.Feedback type='invalid'> Please insert a valid answer! </Form.Control.Feedback>
                </Form.Group>
                <Form.Group  className="mb-3" >
                    <Form.Label> First Hint </Form.Label>
                    <Form.Control as="textarea" rows={3} required={true} type='textarea'  
                        value={firstHint} onChange={(event) => setFirstHint(event.target.value)} 
                        placeholder='First Hint' pattern='^.*\S.*$'/>
                    <Form.Control.Feedback type='invalid'> Please insert a valid hint! </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" >
                    <Form.Label> Second Hint </Form.Label>
                    <Form.Control  as="textarea" rows={3}required={true} type='text'  
                        value={secondHint} onChange={(event) => setSecondHint(event.target.value)} 
                        placeholder='Second Hint' pattern='^.*\S.*$'/>
                    <Form.Control.Feedback type='invalid'> Please insert a valid hint! </Form.Control.Feedback>
                </Form.Group>
                <Form.Group  className="mb-3" >
                    <Form.Label> Difficulty Level</Form.Label>
                    <Form.Control required as="select" type="select" 
                        onChange={(event)=>setDifficulty(event.target.value)} value={difficulty}>
                        <option value="">Select</option> 
                        <option value="EASY">Easy</option>
                        <option value="AVERAGE">Average</option>
                        <option value="DIFFICULT">Difficult</option>
                    </Form.Control>
                    <Form.Control.Feedback type='invalid'> Please select a level difficulty! </Form.Control.Feedback>
                </Form.Group> 
                <Form.Group  className="mb-3" >
                    <Form.Label> Duration in seconds</Form.Label>
                    <Form.Control required={true} type="number"  
                        onChange={(event)=>setDuration(event.target.value)} value={duration} min={30} max={600}>
                    </Form.Control>
                    <Form.Control.Feedback type='invalid'> Please insert a valid duration </Form.Control.Feedback>
                </Form.Group>         
                <Button variant='success' type='submit'>Save</Button>&nbsp;
            <Button variant='danger' onClick={()=>navigate('/')}>Cancel</Button>
        </Form>
    </Container>
    </Container>
);
}

export { CreateRiddleForm };