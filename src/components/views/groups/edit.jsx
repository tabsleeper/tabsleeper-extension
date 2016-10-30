import React from 'react';

import { TabGroup } from '../../../models';
import Icon from '../../../icons';

class Edit extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      groupName: "",
      group: null,
    };

    this.onGroupNameChanged = this.onGroupNameChanged.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentWillMount() {
    this.loadGroup(this.props.uuid);
  }

  /**
   * Listen for changes to the UUID that has been supplied, loading a new
   * record if necessary
   */
  componentWillReceiveProps(newProps) {
    if (newProps.uuid !== this.props.uuid) {
      // Clear the old group
      this.setState({ group: null, groupName: "" });

      // Load the new one
      this.loadGroup(newProps.uuid);
    }
  }

  /**
   * Read the record from the DB
   */
  loadGroup(uuid) {
    TabGroup.read(uuid).then(group => {
      this.setState({ group, groupName: (group.name || "") });
    })
    .catch(error => {
      if (error) console.error("An error occurred ", error);
    });
  }

  /**
   * Input handler for the name field
   */
  onGroupNameChanged(evt) {
    this.setState({ groupName: evt.target.value });

    const group = this.state.group;
    group.name = evt.target.value;
    group.save();
  }

  /**
   * Handler for when the form is submitted
   *
   * This should not make any writes - things are saved as they're edited
   */
  onSubmit(evt) {
    evt.preventDefault();
    window.location.hash = `#${this.props.router.generate('groups')}`;
  }

  render() {
    if (this.state.group) {
      return <div className='popup edit-group'>
        <div className='back-action'>
          <a href={`#${this.props.router.generate('groups')}`}>
            <Icon.Back color='#484848' width='24px' height='24px' />
            <span className='back-action--text'>Back</span>
          </a>
        </div>

        <form onSubmit={this.onSubmit}>
          <div className='edit-group--input-group'>
            <label for='name'>Name</label><br />
            <input
              type='text'
              name='name'
              value={this.state.groupName}
              onChange={this.onGroupNameChanged}
              placeholder="Untitled" />
          </div>
        </form>
      </div>;
    } else {
      return <div className='popup'>
        <div>
          <Icon.Back color='#484848' width='24px' height='24px' />
        </div>
        <p>
          There was a problem trying to edit the group
        </p>
        <p>
          <a href={`#${this.props.router.generate('groups')}`}>Go back</a>
        </p>
      </div>;
    }
  }
};

Edit.propTypes = {
  uuid: React.PropTypes.string.isRequired,
  router: React.PropTypes.object.isRequired,
};

export { Edit };
export default Edit;
