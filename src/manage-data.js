import domready from 'domready';
import React from 'react';
import ReactDOM from 'react-dom';

import ManageData from 'components/views/manage-data.jsx';

domready(() => {
  const container = document.getElementById('container');

  ReactDOM.render(<ManageData />, container);
});
