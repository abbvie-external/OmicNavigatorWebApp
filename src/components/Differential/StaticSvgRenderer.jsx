import React from 'react';
import SVG from 'react-inlinesvg';

/**
 * Renders static SVG plots with consistent ID uniquification and load/error handling.
 * Supports both URL-based SVGs (with dimensions) and data-URI SVGs (pre-rendered).
 *
 * @param {string} src - SVG source (URL or data-URI)
 * @param {string} title - Plot title for accessibility
 * @param {string} uniqueHash - Hash for ID uniquification
 * @param {Function} [onLoad] - Callback when SVG loads successfully
 * @param {Function} [onError] - Callback when SVG fails to load
 */
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
