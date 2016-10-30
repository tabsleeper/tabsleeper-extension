import domready from 'domready';
import React from 'react';
import ReactDOM from 'react-dom';
import uniloc from 'uniloc';

import Popup from './components/views/popup.jsx';

domready(() => {
  const container = document.getElementById('container');
  const router = uniloc({
    groups: 'GET /groups',
    editGroup: 'GET /groups/:uuid/edit',
  }, {
    'GET /': 'groups',
  });

  ReactDOM.render(<Popup router={router} />, container);
});
