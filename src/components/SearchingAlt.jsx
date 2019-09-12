import React from 'react';
import { Header, Image } from 'semantic-ui-react';
import './SearchingAlt.scss';

const SearchingAlt = () => (
  <div className="LoaderContainer">
    <Header as="h2" textAlign="center">
      Records are loading...
    </Header>
    <div id="hourglassLoader">
      <div id="top"></div>
      <div id="bottom"></div>
      <div id="line"></div>
    </div>
  </div>
);

export default SearchingAlt;
