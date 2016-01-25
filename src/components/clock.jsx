import React from 'react';
import DateFormat from 'dateformat';

export class Clock extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      currentTime: new Date()
    }
  }

  componentDidMount() {
    this.timer = window.setInterval(() => {
      this.setState({ currentTime: new Date() });
    }, 1000);
  }

  componentWillUnmount() {
    window.clearInterval(this.timer);
  }

  render() {
    let { className, ...attrs } = this.props;

    return <time {...attrs} className={`clock ${className || ''}`} dateTime={this.state.currentTime.toISOString()}>
      <span className='clock--time'>
        {DateFormat(this.state.currentTime, "h:MM")}
      </span>

      <span className='clock--date'>
        {DateFormat(this.state.currentTime, "dddd, mmm d")}
      </span>
    </time>;
  }
}

export default Clock;
