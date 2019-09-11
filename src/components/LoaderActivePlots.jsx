import React from 'react';
import { Header, Image } from 'semantic-ui-react';
import './LoaderActivePlots.scss';

const LoaderActivePlots = () => (
  <div className="SearchPrompt">
    <Header as="h2" textAlign="center">
      Plots are loading...
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
