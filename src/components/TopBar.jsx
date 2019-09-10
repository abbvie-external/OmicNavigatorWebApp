import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Tabs from './Tabs';
import './TopBar.scss';

class TopBar extends Component {
  componentDidMount() {}

  render() {
    return (
      <div className="TopBar">
        <Tabs props></Tabs>
      </div>
    );
  }
}

export default withRouter(TopBar);
