import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import Tabs from './Tabs';
import './TopBar.scss';

class TopBar extends Component {
  componentDidMount() {}

  render() {
    return (
      <>
        <ToastContainer autoClose={5000} />
        <div className="TopBar">
          <Tabs></Tabs>
        </div>
      </>
    );
  }
}

export default withRouter(TopBar);
