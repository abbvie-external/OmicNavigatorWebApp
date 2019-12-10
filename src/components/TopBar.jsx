import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import Tabs from './Tabs';
import './TopBar.scss';

class TopBar extends Component {
  componentDidMount() {}

  render() {
    return (
      <Fragment>
        <ToastContainer autoClose={5000} />
        <div className="TopBar">
          <Tabs></Tabs>
        </div>
      </Fragment>
    );
  }
}

export default withRouter(TopBar);
