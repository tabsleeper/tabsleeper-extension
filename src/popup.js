import domready from 'domready';
import React from 'react';
import ReactDOM from 'react-dom';

import Popup from './components/views/popup.jsx';

domready(() => {
  let container = document.getElementById('container');

  ReactDOM.render(<Popup />, container);
});
