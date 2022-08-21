import {Container, Table, Card, Row, Col} from 'react-bootstrap';
import './RiddleGrid.css'

function RiddleRanking(props) {

	return(
    
    <Container id="wrapper" fluid className="col-lg-8-auto grid-margin stretch-card">
      <Card className="text-center" id="Card-wrapper" >
        <Card.Header className="headerCard">Top-3 Ranking</Card.Header>
        <Card.Body>
            <Row>
                <Col className="col-2">
                    <img src={require(`./images/trophy.png`)} alt={'./images/man.png'}></img>
                </Col>
                <Col className="col-10">
                    <RankingTable ranking={props.ranking} />
                </Col>
            </Row>
        </Card.Body>
      </Card>
    </Container>
    
	);
}

function RankingTable(props){
    return(
      <Table>
        <RankingTableBody ranking={props.ranking} /> 
      </Table>
    );
    
}

function RankingTableBody(props){

  
    return(
    <>
      <thead>
        <tr>
          <th>1°</th>
          <th>{props.ranking[0] ? (props.ranking[0].score === props.ranking[1].score ? "1°" : "2°") : "2°"}</th>
          <th>
            {
              props.ranking[0] ? (
                props.ranking[0].score === props.ranking[2].score ? "1°" : 
                props.ranking[1].score === props.ranking[2].score || 
                props.ranking[0].score === props.ranking[1].score ? "2°" : "3°"
              ) : "3°"
            }
          </th>
        </tr>
      </thead> 
      <tbody>
        {
          <RankingRow ranking = {props.ranking} />
        }

      </tbody>
      </>
    );
  }
  
  function RankingRow(props) {
      return(
    <>
        <tr>
        {props.ranking.map(e => {return  <td key={(e.id)}><img id="user_image" src={require(`./images/${e.id}.png`)} alt={'./images/man.png'} />{e.id}</td>})}
        </tr>
        <tr>
        {props.ranking.map(e => {return <td key={(e.id)}>{e.score}</td>})}
        </tr>

            
        </>
      );
  }

export {RiddleRanking};
