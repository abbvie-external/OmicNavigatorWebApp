import React from 'react';
import { Header } from 'semantic-ui-react';
import './SearchingAlt.scss';

const SearchingAlt = () => (
  <div className="LoaderContainer">
    <Header as="h2" textAlign="center">
      Loading Data...
    </Header>
    <div id="hourglassLoader">
      <div id="top"></div>
      <div id="bottom"></div>
      <div id="line"></div>
    </div>
  </div>
);

export default SearchingAlt;
