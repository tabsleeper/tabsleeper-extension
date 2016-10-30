import React from 'react';

export function Back({ color, width, height }) {
  return <svg className="icon icon--check" fill={color || '#000000'} width={width || "24px"} height={height || "24px"} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0h24v24H0z" fill="none"/>
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
  </svg>
}

export default Back;
