import React from 'react';

export default class Destroy extends React.Component {
  render() {
    return <svg className="icon icon--destroy" fill={this.props.color || '#000000'} width={this.props.width || "24px"} height={this.props.height || "24px"} viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
      <path d="M0 0h24v24H0z" fill="none"/>
    </svg>;
  }
}
