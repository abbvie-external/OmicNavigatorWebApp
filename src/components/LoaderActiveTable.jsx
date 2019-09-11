import React from 'react';
import { Header, Image } from 'semantic-ui-react';
import './LoaderActiveTable.scss';

const LoaderActivePlots = () => (
  <div className="SearchPrompt">
    <Header as="h2" textAlign="center">
      Records are loading...
    </Header>
    <div className="loading">
      <div className="loader-active-table-dots animate">
        <div className="loader-active-table-dot"></div>
        <div className="loader-active-table-dot"></div>
        <div className="loader-active-table-dot"></div>
        <div className="loader-active-table-dot"></div>
        <div className="loader-active-table-dot"></div>
      </div>
    </div>
  </div>
);

export default LoaderActivePlots;
