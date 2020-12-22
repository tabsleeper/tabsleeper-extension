import * as React from 'react';
import type { FunctionComponent } from 'react';
import type { Icon } from './types';

const Back: FunctionComponent<Icon> = ({ color = '#000000', width = '24px', height = '24px' }) => {
  return <svg className="icon icon--check" fill={color} width={width} height={height} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0h24v24H0z" fill="none"/>
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
  </svg>
}

export default Back;
