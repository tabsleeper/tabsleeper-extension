import React from 'react';

export function Sleep({ color, width, height }) {
  return <svg className="icon icon--sleep" width={width || "24px"} height={height || "24px"} viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" strokeLinecap="round" strokeLinejoin="round">
          <g stroke={color || '#000000'} strokeWidth="2">
              <path d="M22.5,12.1093468 C22.4401972,17.8578494 17.7621915,22.4996804 12.0002975,22.4996804 C6.20121277,22.4996804 1.5,17.7980374 1.5,11.9977572 C1.5,6.29359291 6.04768921,1.65116675 11.7146723,1.5 C11.7146723,1.5 6.60733615,2.68642094 6.60733615,8.91044412 C6.60733615,14.5893148 11.6405883,17.3168629 15.0746366,17.3168629 C21.4589555,17.3168629 22.5,12.1093468 22.5,12.1093468 L22.5,12.1093468 Z"></path>
          </g>
      </g>
  </svg>;
}

export default Sleep;
