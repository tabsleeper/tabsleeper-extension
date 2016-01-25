import React from 'react';

export class TopSite extends React.Component {

  render() {
    let { className, title, url, ...attrs } = this.props;
    return <a {...attrs} className={`top-site ${className || ''}`} href={this.props.url}>

      <span className='top-site--favicon-container'>
        <img className='top-site--favicon' ref='image' src={`chrome://favicon/${this.props.url}`} />
      </span>

      <span className='top-site--title'>{this.props.title}</span>
    </a>;
  }
}

export default TopSite;
