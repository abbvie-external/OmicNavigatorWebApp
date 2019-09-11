import React from 'react';
import './TransitionStill.css';
import { Header, Image } from 'semantic-ui-react';

const TransitionActive = () => (
  <div className="SearchPrompt">
    <Header as="h2" textAlign="center">
      No records available
    </Header>
    <Header as="h4" textAlign="center">
      Use the filters to display relevant records
    </Header>
    <div className="transition-still-loader">
      <div className="transition-still-dot"></div>
      <div className="transition-still-dot"></div>
      <div className="transition-still-dot"></div>
      <div className="transition-still-dot"></div>
      <div className="transition-still-dot"></div>
      <div className="transition-still-dot"></div>
      <div className="transition-still-dot"></div>
      <div className="transition-still-dot"></div>
      <div className="transition-still-dot"></div>
      <div className="transition-still-spec"></div>
      <div className="transition-still-shadow"></div>
    </div>
  </div>
);

export default TransitionActive;
