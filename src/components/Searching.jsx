import React from 'react';
// import './Searching.css';
import { Header, Image } from 'semantic-ui-react';

const Searching = () => (
  <div className="SearchPrompt">
    <Header as="h2" textAlign="center">
      Records are loading
    </Header>
    <Header as="h4" textAlign="center">
      Sit up straight, take a deep breath
    </Header>
    <Image src="empty_search_alt.png" size="medium" centered />
    {/* <div className="searching-loader">
      <div className="searching-dot"></div>
      <div className="searching-dot"></div>
      <div className="searching-dot"></div>
      <div className="searching-dot"></div>
      <div className="searching-dot"></div>
      <div className="searching-dot"></div>
      <div className="searching-dot"></div>
      <div className="searching-dot"></div>
      <div className="searching-dot"></div>
      <div className="searching-spec"></div>
      <div className="searching-shadow"></div>
    </div> */}
  </div>
);

export default Searching;
