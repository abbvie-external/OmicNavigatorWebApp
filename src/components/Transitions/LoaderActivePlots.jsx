import React from 'react';
import { Header } from 'semantic-ui-react';
import './LoaderActivePlots.scss';

const LoaderActivePlots = () => (
  <div className="LoaderContainer">
    <Header as="h2" textAlign="center">
      Loading Plots...
    </Header>
    <div className="loading">
      <div className="loader-active-plots-dots animate">
        <div className="loader-active-plots-dot"></div>
        <div className="loader-active-plots-dot"></div>
        <div className="loader-active-plots-dot"></div>
        <div className="loader-active-plots-dot"></div>
        <div className="loader-active-plots-dot"></div>
      </div>
    </div>
  </div>
);

export default LoaderActivePlots;
