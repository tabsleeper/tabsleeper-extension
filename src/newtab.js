import domready from 'domready';
import React from 'react';
import ReactDOM from 'react-dom';

import NewTab from './components/views/new-tab.jsx';

domready(() => {
  let container = document.getElementById('container');

  ReactDOM.render(<NewTab />, container);
});
