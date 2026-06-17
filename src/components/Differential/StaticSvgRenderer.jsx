import React from 'react';
import SVG from 'react-inlinesvg';

function StaticSvgRenderer({ src, title, uniqueHash, onLoad, onError }) {
  return (
    <SVG
      cacheRequests={true}
      src={src}
      title={title}
      uniqueHash={uniqueHash}
      uniquifyIDs={true}
      onLoad={onLoad}
      onError={onError}
    />
  );
}

export default StaticSvgRenderer;
