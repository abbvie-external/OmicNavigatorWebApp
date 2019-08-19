import React, { Component } from 'react';
import { Dropdown, Button } from 'semantic-ui-react';

const options = [
  { key: 1, text: 'Choice 1', value: 1 },
  { key: 2, text: 'Choice 2', value: 2 },
  { key: 3, text: 'Choice 3', value: 3 }
];

class ButtonActions extends Component {
  state = {};

  componentDidMount() {}

  render() {
    return (
      <div className="">
        <Button
          basic
          color="orange"
          icon="ellipsis horizontal"
          floated="right"
        />
        <Button.Group basic color="orange" floated="right">
          <Button basic color="orange" content="Export" />
          <Dropdown
            className="button icon"
            options={options}
            trigger={<React.Fragment />}
          />
        </Button.Group>
        <Button.Group floated="right">
          <Button basic color="orange" icon="chart pie" />
          <Button basic color="orange" icon="th list" />
        </Button.Group>
      </div>
    );
  }
}

export default ButtonActions;
