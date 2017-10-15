import React from 'react';
import Icon from 'react-icons-kit';
import { arrowRightC } from 'react-icons-kit/ionicons/arrowRightC';

import * as config from '../utils/config';

const Phrase = props => {
  return (
    <div
      className='phrase'
      onClick={() => {
        props.data.audio.play();
      }}
    >
      <div className='original'>{props.data.original}</div>
      <Icon icon={arrowRightC} />
      <div className='translated'>{props.data.translated}</div>
    </div>
  );
}

export default Phrase;
