import React, { Component } from 'react';
import { HashRouter } from 'react-router-dom';
import App from './components/App';

class Container extends Component {
  render() {
    return (
      <HashRouter>
        <App />
      </HashRouter>
    );
  }
}

export default Container;
