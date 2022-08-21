import React from 'react';
import DateTimeDisplay from './DateTimeDisplay';
import './Timer.css'
import { useEffect, useState } from 'react';


const useCountdown = (targetDate) => {
  const countDownDate = targetDate;
  const [countDown, setCountDown] = useState(
    countDownDate-Date.now());

  useEffect(() => {
  
    const interval = setInterval(() => {
      if(countDownDate - Date.now()< 0){
        clearInterval(interval); 
        setCountDown(0);
      } else {

        setCountDown(countDownDate - Date.now());
      }
    }, 1000);
    return;
  }, [countDownDate]);

  return getReturnValues(countDown);
};

const getReturnValues = (countDown) => {

  const minutes = Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((countDown % (1000 * 60)) / 1000);

  return [ minutes, seconds];
};

function CountdownTimer(props){

  const [ minutes, seconds] = useCountdown(props.targetDate);
  
  return (

    <div className="show-counter">
      <div className='row' id="rowTimer">
        <div className='col' id="colTimer">
          <DateTimeDisplay value={minutes} type={'Mins'} isDanger={false} />
        </div>
        <div className='col'  id="colTimer">
          <p>:</p>
        </div>
        <div className='col' id="colTimer">
            <DateTimeDisplay value={seconds} type={'Seconds'} isDanger={minutes===0 && seconds<=5} />
        </div>
    </div>
  </div>
  );
  
};
export {CountdownTimer};