import * as React from 'react';
import type { FunctionComponent } from 'react';
import type { Icon } from './types';

const Back: FunctionComponent<Icon> = ({ color = '#000000', width = '24px', height = '24px' }) => {
  return <svg  className="icon icon--back" fill={color} width={width} height={height} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0h24v24H0z" fill="none"/>
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
  </svg>;
}

export default Back;
