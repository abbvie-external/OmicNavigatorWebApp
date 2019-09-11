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
    <div class="loading">
      <div class="loader-still-dots">
        <div class="loader-still-dot"></div>
        <div class="loader-still-dot"></div>
        <div class="loader-still-dot"></div>
        <div class="loader-still-dot"></div>
        <div class="loader-still-dot"></div>
      </div>
    </div>
  </div>
);

export default LoaderStill;
