import React from 'react';
import './TransitionActive.css';
import { Header, Image } from 'semantic-ui-react';

const TransitionActive = () => (
  <div className="SearchPrompt">
    <Header as="h2" textAlign="center">
      Records are loading...
    </Header>
    <div className="transition-active-loader">
      <div className="transition-active-dot"></div>
      <div className="transition-active-dot"></div>
      <div className="transition-active-dot"></div>
      <div className="transition-active-dot"></div>
      <div className="transition-active-dot"></div>
      <div className="transition-active-dot"></div>
      <div className="transition-active-dot"></div>
      <div className="transition-active-dot"></div>
      <div className="transition-active-dot"></div>
      <div className="transition-active-spec"></div>
      <div className="transition-active-shadow"></div>
    </div>
  </div>
);

export default TransitionActive;
