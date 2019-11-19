import React, { Component } from 'react';
import { Modal, Form, Header, Popup, Icon } from 'semantic-ui-react';
const colorOptions = [
  { key: 'No Colour', value: '', text: 'No Colour' },
  { key: 'red', value: 'red', text: 'Red' },
  { key: 'orange', value: 'orange', text: 'Orange' },
  { key: 'yellow', value: 'yellow', text: 'Yellow' },
  { key: 'olive', value: 'olive', text: 'Olive' },
  { key: 'green', value: 'green', text: 'Green' },
  { key: 'teal', value: 'teal', text: 'Teal' },
  { key: 'blue', value: 'blue', text: 'Blue' },
  { key: 'violet', value: 'violet', text: 'Violet' },
  { key: 'purple', value: 'purple', text: 'Purple' },
  { key: 'pink', value: 'pink', text: 'Pink' },
  { key: 'brown', value: 'brown', text: 'Brown' },
  { key: 'grey', value: 'grey', text: 'Grey' },
  { key: 'black', value: 'black', text: 'Black' },
  { key: 'AbbvieBlue', value: 'AbbvieBlue', text: 'AbbVie Blue' },
  { key: 'AbbviePurple', value: 'AbbviePurple', text: 'AbbVie Purple' },
  { key: 'AbbvieTeal', value: 'AbbvieTeal', text: 'AbbVie Teal' }
];
let icons = [
  'hourglass',
  'hourglass start',
  'hourglass half',
  'hourglass end',
  'checkmark',
  'user',
  'star outline',
  'users',
  'warning sign',
  'times circle outline',
  'flask',
  'cocktail',
  'beer',
  'coffee',
  'certificate',
  'birthday cake',
  'magic',
  'plus circle',
  'plus square outline',
  'question',
  'pied piper',
  'smile outline',
  'frown outline',
  'thumbs up outline',
  'thumbs down outline',
  'hand rock',
  'hand paper',
  'hand scissors',
  'hand lizard',
  'hand spock'
];
const iconOptions = icons.map(icon => ({
  key: icon,
  // icon,
  value: icon,
  text: icon,
  content: <Header icon={icon} content={icon} />
}));
iconOptions.unshift({ key: 'No Icon', value: '', text: 'No Icon' });
export default class QuickViewModal extends Component {
  state = {
    name: '',
    group: 'No Group',
    color: '',
    icon: '',
    update: false
    // groupOptions: [],
  };
  // static defaultProps = {
  //   header: 'Create QuickView',
  // };
  handleConfirmClick = () => {};
  handleGroupAddition = (evt, { value }) => {
    this.setState(prev => ({
      groupOptions: [
        { text: value, value, key: value, icon: 'add' },
        ...prev.groupOptions
      ]
    }));
  };
  handleGroupChange = (evt, { value }) => {
    this.setState({ group: value, groupError: false });
  };
  handleColorChange = (evt, { value }) => {
    this.setState({ color: value });
  };
  handleIconChange = (evt, { value }) => {
    this.setState({ icon: value });
  };
  static getDerivedStateFromProps(nextProps, prevState) {
    if (!nextProps.open) return null;
    let state = {};
    if (nextProps.quickViews !== prevState.quickViews && nextProps.quickViews) {
      state.quickViews = nextProps.quickViews;
      state.usedNames = nextProps.quickViews.reduce((opts, qv) => {
        opts[qv.name.toLowerCase()] = true;
        return opts;
      }, {});
      state.groupOptions = [
        { text: 'No Group', value: 'No Group', key: 'No Group' }
      ].concat(
        Object.keys(
          nextProps.quickViews
            .filter(qv => qv.group !== undefined)
            .reduce((opts, qv) => {
              opts[qv.group] = true;
              return opts;
            }, {})
        ).map(key => ({
          key,
          text: key,
          value: key
        }))
      );
    } else if (!nextProps.quickViews) {
      state.groupOptions = [
        { text: 'No Group', value: 'No Group', key: 'No Group' }
      ];
      state.usedNames = {};
    }
    if (nextProps.values && nextProps.values !== prevState.values) {
      state.values = nextProps.values;
      let {
        name,
        group = 'No Group',
        icon = '',
        color = ''
      } = nextProps.values;
      state.name = name;
      state.group = group;
      state.icon = icon;
      state.color = color;
      state.nameError = false;
    } else if (!nextProps.values && prevState.values) {
      state.values = null;
      state.name = '';
      state.group = 'No Group';
      state.icon = '';
      state.color = '';
      state.nameError = false;
    }
    return state;
  }
  handleNameChange = (evt, { value }) => {
    let nameError =
      !!this.state.usedNames[value.toLowerCase()] &&
      (!this.props.values ||
        this.props.values.name.toLowerCase() !== value.toLowerCase());
    this.setState({ name: value, nameError });
  };
  handleUpdateChange = (evt, { checked }) => {
    this.setState({ update: checked });
  };
  handleSubmit = evt => {
    evt.preventDefault();
    let { group, name, icon, color, update } = this.state;
    if (
      this.state.usedNames[name] &&
      (!this.props.values || this.props.values.name !== name)
    ) {
      // this.setState({nameError:true});
      return;
    }
    if (group === 'No Group') {
      group = undefined;
    }
    if (icon === '') {
      icon = undefined;
    }
    if (color === '') {
      color = undefined;
    }
    if (this.props.values) {
      this.props.onCreateQuickView &&
        this.props.onEditQuickView(
          this.props.values.name,
          name,
          group,
          icon,
          color,
          update
        );
    } else {
      this.props.onCreateQuickView &&
        this.props.onCreateQuickView(name, group, icon, color);
    }

    this.setState({
      name: '',
      nameError: false,
      group: 'No Group',
      icon: '',
      color: '',
      update: false
    });
    this.props.onClose();
    // console.log('submitted');
  };
  render() {
    if (!this.props.open) {
      return null;
    }
    return (
      <Modal
        open={this.props.open}
        onClose={this.props.onClose}
        as={Form}
        onSubmit={this.handleSubmit}
      >
        <Modal.Header>
          {this.props.header || this.props.values
            ? `Edit QuickView: ${this.props.values.name}`
            : 'Create QuickView'}
        </Modal.Header>
        <Modal.Content>
          <Form.Group widths="equal">
            <Form.Input
              label={
                <label>
                  Name
                  {this.state.nameError && (
                    <Popup
                      trigger={
                        <Icon
                          name="info circle"
                          style={{ cursor: 'pointer' }}
                        />
                      }
                      inverted
                      content={`Please choose another name. "${this.state.name}" is taken`}
                    />
                  )}
                </label>
              }
              // label="Name"
              placeholder="Enter QuickView Name"
              value={this.state.name}
              onChange={this.handleNameChange}
              error={this.state.nameError}
              required
            />
            <Form.Dropdown
              allowAdditions
              onChange={this.handleGroupChange}
              onAddItem={this.handleGroupAddition}
              options={this.state.groupOptions}
              value={this.state.group}
              selection
              search
              label={
                <label>
                  Group
                  <Popup
                    trigger={
                      <Icon
                        name="question circle"
                        style={{ cursor: 'pointer' }}
                      />
                    }
                    inverted
                    content="Used to separate quick views into groups. Type a name to add a new group."
                  />
                </label>
              }
              placeholder={'Select or add a group name'}
              // title="Used to separate quick views into groups."
            />
          </Form.Group>
          <Form.Group widths="equal">
            <Form.Select
              label={
                <label>
                  Color
                  <Popup
                    trigger={
                      <Icon
                        name="question circle"
                        style={{ cursor: 'pointer' }}
                      />
                    }
                    inverted
                    content="Adds color to the Quick View Card in the Home Page"
                  />
                </label>
              }
              options={colorOptions}
              placeholder="Choose a color"
              value={this.state.color}
              onChange={this.handleColorChange}
            />
            <Form.Dropdown
              label={
                <label>
                  Icon
                  <Popup
                    trigger={
                      <Icon
                        name="question circle"
                        style={{ cursor: 'pointer' }}
                      />
                    }
                    inverted
                    content="Adds an Icon to the Quick View Card in the Home Page"
                  />
                </label>
              }
              selection
              options={iconOptions}
              placeholder="Choose an Icon"
              value={this.state.icon}
              onChange={this.handleIconChange}
            />
          </Form.Group>
          {this.props.values && (
            <Form.Checkbox
              label="Update View Settings to the Current Settings"
              inline
              checked={this.state.update}
              onChange={this.handleUpdateChange}
            />
          )}
        </Modal.Content>
        <Modal.Actions
          actions={[
            {
              content: 'Cancel',
              key: 'cancel',
              negative: true,
              onClick: this.props.onClose,
              type: 'button'
            },
            {
              key: 'confirm',
              content: 'Confirm',
              positive: true,
              type: 'submit'
            }
          ]}
        />
      </Modal>
    );
  }
}
