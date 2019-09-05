import React, { Component } from 'react';
import { Dropdown, Button } from 'semantic-ui-react';

const options = [
  { key: 1, text: 'Data (.xls)', value: 1 },
  { key: 2, text: 'PDF', value: 2 }
];

class ButtonActions extends Component {
  componentDidMount() {}

  render() {
    return (
      <div className="ButtonActions">
        <Button.Group className="MoreButtonGroup" floated="right">
          <Button
            basic
            color="black"
            className="MoreButton"
            icon="ellipsis horizontal"
            floated="right"
          />
        </Button.Group>

        <Button.Group
          basic
          color="black"
          className="ExportButtonGroup"
          floated="right"
        >
          <Button basic className="customOrange" content="Export" />
          <Dropdown
            className="button icon"
            options={options}
            trigger={<React.Fragment />}
          />
        </Button.Group>

        <Button.Group className="ViewButtonGroup" floated="right">
          <Button
            basic
            className="ListViewButton"
            color="black"
            icon="chart list"
          />
        </Button.Group>
        <Button.Group className="ViewButtonGroup" floated="right">
          <Button
            basic
            className="ChartViewButton"
            color="black"
            icon="th pie"
          />
        </Button.Group>
      </div>
    );
  }
}

export default ButtonActions;
