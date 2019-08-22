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
          className="customOrange"
          icon="ellipsis horizontal"
          floated="right"
        />
        <Button.Group basic className="customOrange" floated="right">
          <Button basic className="customOrange" content="Export" />
          <Dropdown
            className="button icon"
            options={options}
            trigger={<React.Fragment />}
          />
        </Button.Group>
        <Button.Group floated="right">
          <Button basic className="customOrange" icon="chart pie" />
          <Button basic className="customOrange" icon="th list" />
        </Button.Group>
      </div>
    );
  }
}

export default ButtonActions;
