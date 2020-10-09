import React from 'react';
import { Header } from 'semantic-ui-react';
import './LoaderActiveTable.scss';

const LoaderActivePlots = () => (
  <div className="LoaderContainer">
    <Header as="h2" textAlign="center">
      Loading Data...
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
