import React from "react";
import "./ButtonBar.css";
import { useNavigate } from 'react-router-dom';


function ButtonBar(props) {

  const navigate = useNavigate();
  return (
    <div className={'col-xs-11 col-sm-11 position-sm-fixed position-md-relative position-lg-relative'} 
      id="left-container">
      <center><div className="col">
        <button className="button rounded-corners disabled" 
        onClick={()=>{props.setTableTitle("All")}}>
          <strong>All</strong></button>
      </div></center>
      <center><div className="col">
        <button className="button rounded-corners disabled" 
        onClick={()=>{props.setTableTitle("Open");}}>
          <strong>Open </strong></button>
      </div></center>
      <center><div className="col">
        <button className="button rounded-corners disabled" 
        onClick={()=>{props.setTableTitle("Closed");}}>
          <strong>Closed</strong></button>
      </div></center>
      { props.loggedUser &&
        <center><div className="col">
          <button className="button rounded-corners disabled"
          onClick={()=>{props.setTableTitle("My Riddles");}}>
            <strong>My Riddles</strong></button>
        </div></center>
      }
      { props.loggedUser &&
        <center><div className="col">
          <button className="button rounded-corners disabled"
          onClick={() => {props.setTableTitle("My Victories");}}>
            <strong>My Victories</strong></button>
        </div></center>
      }   
      { props.loggedUser &&
        <center><div className="col">
          <button className="button rounded-corners disabled"
          onClick={() => {navigate('/CreateRiddle');}}>
            <strong>Create</strong></button>
        </div></center>
      }   
    </div>
  );
}


export {ButtonBar}