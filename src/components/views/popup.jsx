import React from 'react';

import Groups from './groups';

export class Popup extends React.Component {
  constructor(props) {
    super(props);

    this.onNavigated = this.onNavigated.bind(this);

    this.state = {
      route: { name: null },
    }
  }

  /**
   * Set the initial route and attach the hashchange event listener
   */
  componentWillMount() {
    // Make sure we're on a valid route and view when we start
    this.onNavigated();

    window.addEventListener('hashchange', this.onNavigated, false);
  }

  /**
   * Tear down the hashchange event listener
   */
  componentWillUnmount() {
    window.removeEventListener('hashchange', this.onNavigated, false);
  }

  /**
   * Navigation event handler which responds to and processes hash changes,
   * determining which component to render
   */
  onNavigated() {
    const hash = window.location.hash.substring(1);
    const route = this.props.router.lookup(hash);

    this.setState({ route });
  }

  render() {
    switch(this.state.route.name) {
      case 'editGroup':
        return <Groups.Edit router={this.props.router} uuid={this.state.route.options.uuid} />;

      case 'groups':
      default:
        return <Groups.Index router={this.props.router} />;
    }
  }
}

Popup.propTypes = {
  router: React.PropTypes.object.isRequired,
};

export default Popup;
