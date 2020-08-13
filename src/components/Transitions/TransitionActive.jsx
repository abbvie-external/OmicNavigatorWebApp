import React from 'react';
import './TransitionActive.css';
import { Header } from 'semantic-ui-react';

const TransitionActive = () => (
  <div className="LoaderContainer">
    <Header as="h2" textAlign="center">
      Loading Records...
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
