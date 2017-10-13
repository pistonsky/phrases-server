import React from 'react';
import Icon from 'react-icons-kit';
import { arrowRightC } from 'react-icons-kit/ionicons/arrowRightC';

const Phrase = props => {
  return (
    <div className='phrase'>
      <div className='original'>{props.data.original}</div>
      <Icon icon={arrowRightC} />
      <div className='translated'>{props.data.translated}</div>
    </div>
  );
}

export default Phrase;
