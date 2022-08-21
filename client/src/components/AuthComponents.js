import { useState } from 'react';
import {Form, Button,Container} from 'react-bootstrap';
import { useNavigate} from 'react-router-dom';
import './Login.css'

function LoginForm(props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  
  const handleSubmit = (event) => {
      event.preventDefault();
      const credentials = { username, password };
      
      props.login(credentials);
  };

  return (

    <Container className="pt-3">
     <Container className="container-wrapper" >
      <Form className='p-5' onSubmit={handleSubmit}>
        <h3 className="text-center">Login</h3>
        <Form.Group className="mb-3" controlId='username'>
          <Form.Label>User Id</Form.Label>
          <Form.Control type='id' value={username} onChange={ev => setUsername(ev.target.value)} 
          required={true} />
        </Form.Group>
        <Form.Group className="mb-3" controlId='password'>
          <Form.Label>Password</Form.Label>
          <Form.Control type='password' value={password} onChange={ev => setPassword(ev.target.value)} 
          required={true} minLength={6}/>
        </Form.Group>
        <Button variant="primary" className="w-100" type="submit">Login</Button>
        <Button type="button" id="go-back" className="btn btn-secondary w-100" 
          onClick={() =>  navigate('/')} >Go back</Button>
      </Form>
      </Container>
    </Container>

  )
};



export { LoginForm };