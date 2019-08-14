import * as React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './components/App';

class Container extends React.Component {
  render() {
    return (
      <Router>
        <App />
      </Router>
    );
  }
}

export default Container;
