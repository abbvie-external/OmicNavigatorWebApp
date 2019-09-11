import React from 'react';
import { Header, Image } from 'semantic-ui-react';
import './LoaderStill.scss';

const LoaderStill = () => (
  <div className="SearchPrompt">
    <Header as="h2" textAlign="center">
      No records available
    </Header>
    <Header as="h4" textAlign="center">
      Use the filters to display relevant records
    </Header>
    <div className="loading">
      <div className="loader-still-dots">
        <div className="loader-still-dot"></div>
        <div className="loader-still-dot"></div>
        <div className="loader-still-dot"></div>
        <div className="loader-still-dot"></div>
        <div className="loader-still-dot"></div>
      </div>
    </div>
  </div>
);

export default LoaderStill;
