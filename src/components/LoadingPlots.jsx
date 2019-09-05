import React from 'react';
// import './LoadingPlots.css';
import { Header, Image } from 'semantic-ui-react';

const LoadingPlots = () => (
  <div className="SearchPrompt">
    <Header as="h2" textAlign="center">
      Plots are loading
    </Header>
    <Header as="h4" textAlign="center">
      Hydrate with water, or dehydrate with coffee~
    </Header>
    <Image src="empty_search_alt3.png" size="medium" centered />
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

export default LoadingPlots;
