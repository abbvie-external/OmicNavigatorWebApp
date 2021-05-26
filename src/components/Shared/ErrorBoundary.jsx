import React from 'react';
import errorImage from '../../resources/errorImage.png';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  componentDidCatch(error, errorInfo) {
    console.log('error', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  render() {
    if (this.state.errorInfo) {
      return (
        <div
          style={{
            padding: '20px',
          }}
        >
          <h2>An error has occured</h2>
          <h3>Please refresh the browser and try your request again.</h3>
          <h3>
            If the error persists, contact the development team by clicking the
            icon in the top right corner.
          </h3>
          <img
            src={errorImage}
            alt="errorImage"
            style={{ width: '80%', height: '35px' }}
          ></img>
          <h3>See error details below</h3>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
