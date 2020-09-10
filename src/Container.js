import React, { Component } from 'react';
import { HashRouter } from 'react-router-dom';
import App from './components/App';

class Container extends Component {
  render() {
    const isReport = window.location.pathname.includes('html') ? true : false;
    if (isReport) {
      return '';
    } else {
      return (
        <HashRouter>
          <App />
        </HashRouter>
      );
    }
  }
}

export default Container;
