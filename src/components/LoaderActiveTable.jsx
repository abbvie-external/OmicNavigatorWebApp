import React from 'react';
import { Header, Image } from 'semantic-ui-react';
import './LoaderActiveTable.scss';

const LoaderActivePlots = () => (
  <div className="SearchPrompt">
    <Header as="h2" textAlign="center">
      Records are loading...
    </Header>
    <div class="loading">
      <div class="loader-active-table-dots animate">
        <div class="loader-active-table-dot"></div>
        <div class="loader-active-table-dot"></div>
        <div class="loader-active-table-dot"></div>
        <div class="loader-active-table-dot"></div>
        <div class="loader-active-table-dot"></div>
      </div>
    </div>
  </div>
);

export default LoaderActivePlots;
