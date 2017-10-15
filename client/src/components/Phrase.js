import React from 'react';
import Icon from 'react-icons-kit';
import { arrowRightC } from 'react-icons-kit/ionicons/arrowRightC';

import * as config from '../utils/config';

const Phrase = props => {
  return (
    <div
      className='phrase'
      onClick={() => {
        const audio = new Audio(config.BASE_AUDIO_URL + props.data.uri + '.caf');
        audio.play();
      }}
    >
      <div className='original'>{props.data.original}</div>
      <Icon icon={arrowRightC} />
      <div className='translated'>{props.data.translated}</div>
    </div>
  );
}

export default Phrase;
