import {Container, Card, Row} from 'react-bootstrap';
import { RiddleCard } from './RiddleData';
import './RiddleGrid.css'

function RiddleGrid(props) {

	return(
    
    <Container id="wrapper" fluid className="col-lg-8-auto grid-margin stretch-card">
      <Card className="text-center" id="Card-wrapper" >
        <Card.Header className="headerCard riddleheaderCard">{props.tableTitle}</Card.Header>
        <Row xs={1} sm={2} md={2} lg={3} className="g-4">
        {props.riddles.map(riddle=><RiddleCard riddle={riddle} setDirty={props.setDirty} 
          key={riddle.id} loggedUser={props.loggedUser}/>)}
        </Row>
      </Card>
    </Container>
    
	);
}





export {RiddleGrid};