import React, { Component } from 'react';
import { HashRouter } from 'react-router-dom';
import App from './components/App';

class Container extends Component {
  render() {
    const isReport = window.location.pathname.includes('ocpu') ? true : false;
    if (!isReport) {
      return (
        <HashRouter>
          <App />
        </HashRouter>
      );
    } else return null;
  }
}

export default Container;
