import React from 'react';
import { Popup, Loader, Dimmer } from 'semantic-ui-react';
import _ from 'lodash';
import * as d3 from 'd3-array';

export const Linkout = React.memo(
  function Linkout({ keyVar, itemValue, linkouts, favicons }) {
    const TableValuePopupStyle = {
      backgroundColor: '2E2E2E',
      borderBottom: '2px solid var(--color-primary)',
      color: '#FFF',
      padding: '1em',
      maxWidth: '50vw',
      fontSize: '13px',
      wordBreak: 'break-all',
    };

    function openWindows(link, itemValue) {
      const windowFeatures =
        'menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes';
      const itemValuesSeparated = separateItemValues(itemValue);
      let linkoutsConcatenated = [];
      if (itemValuesSeparated.length === 1) {
        linkoutsConcatenated = `${link}${itemValuesSeparated[0]}`;
        window.open(linkoutsConcatenated, '_blank', windowFeatures);
      }
      if (itemValuesSeparated.length > 1) {
        for (const item of itemValuesSeparated) {
          linkoutsConcatenated.push(`${link}${item}`);
        }
        linkoutsConcatenated.forEach(link => {
          window.open(link, '_blank', windowFeatures);
        });
      }
    }

    const iconBaseUrl = 'https://icons.duckduckgo.com/ip3/';
    let iconDomains = [];
    let icons = [...favicons];

    if (linkouts.length > 1) {
      for (const val of linkouts) {
        const domainRaw = findDomain(`${val}`);
        const domainRawWww = domainRaw.includes('www')
          ? domainRaw
          : `www.${domainRaw}`;
        const domainRawWwwHttps = domainRawWww.includes('//')
          ? domainRawWww.split('//').pop()
          : domainRawWww;
        iconDomains.push(domainRawWwwHttps);
        if (favicons.length === 0) {
          icons.push(`${iconBaseUrl}${domainRawWwwHttps}.ico`);
        }
      }

      const Popups = linkouts.map((link, index) => {
        return (
          <Popup
            key={`${keyVar}-PopupArr-${index}`}
            trigger={
              <img
                src={icons[index]}
                alt={iconDomains[index]}
                className="ExternalSiteIcon"
                onClick={() => openWindows(link, itemValue)}
              />
            }
            style={TableValuePopupStyle}
            className="TablePopupValue"
            content={iconDomains[index]}
            inverted
            basic
          />
        );
      });
      return Popups;
    } else {
      const linkoutsIsArray = Array.isArray(linkouts);
      const domainRaw = linkoutsIsArray
        ? findDomain(`${linkouts[0]}`)
        : findDomain(linkouts);
      const domainRawWww = domainRaw.includes('www')
        ? domainRaw
        : `www.${domainRaw}`;
      const domainRawWwwHttps = domainRawWww.includes('//')
        ? domainRawWww.split('//').pop()
        : domainRawWww;
      iconDomains.push(domainRawWwwHttps);
      if (favicons.length === 0) {
        icons.push(`${iconBaseUrl}${domainRawWwwHttps}.ico`);
      }
      return (
        <Popup
          key={`${keyVar}-PopupObj`}
          trigger={
            <img
              src={icons[0]}
              alt={iconDomains}
              className="ExternalSiteIcon"
              onClick={() => openWindows(linkouts, itemValue)}
            />
          }
          style={TableValuePopupStyle}
          className="TablePopupValue"
          content={iconDomains}
          inverted
          basic
        />
      );
    }
  },
  //,
  // for deeper array comparison
  // ,(prev,next)=>{
  //   return ;
  // }
);

export function separateItemValues(value) {
  if (value) {
    const splitValuesArr = value.split(';');
    // const arrayOfValues =
    return splitValuesArr;
  }
}

export function formatNumberForDisplay(num) {
  if (!isNaN(num)) {
    const number = Math.abs(num);
    if (number === 0) {
      return num;
    } else if (number < 0.001 || number >= 1000) {
      return num.toExponential(2);
      // * If a number is < .001 report this value scientific notation with three significant digits
      // * If a number is >= 1000, switch to scientific notation with three sig digits.

      // } else if (number < 1 && number >= 0.001) {
      //   return num.toPrecision(3);
      // * If a number is < 1 & >= .001, report this value with three decimal places
      // PN - what's left is >=1 and <1000, guess that goes to 3 digits too
    } else {
      return num.toPrecision(3);
    }
  } else return null;
}

export function splitValue(value) {
  if (value && isNaN(value)) {
    const firstValue = value.split(';')[0];
    const numberOfSemicolons = (value.match(/;/g) || []).length;
    return numberOfSemicolons > 0
      ? `${firstValue}...(${numberOfSemicolons})`
      : firstValue;
  } else return value;
}

export function findDomain(link) {
  if (link) {
    const path = link.split('//')[1] || null;
    return path != null ? path.split('/')[0] : null;
  }
}

export function limitValues(values, size) {
  if (values) {
    let commaSeparatedValues = values.join(', ');
    if (values.length <= size) {
      return commaSeparatedValues;
    } else {
      const numberOfCommas = (commaSeparatedValues.match(/,/g) || []).length;
      const splitValues = commaSeparatedValues.split(',');
      const slicedValues = splitValues.slice(0, size);
      return `${slicedValues}...(${numberOfCommas + 1 - size} more)`;
    }
  }
}

export function limitString(string, indexes, characters) {
  if (indexes < 3) {
    return string;
  } else {
    let stringSubstring = string?.substring(0, characters);
    return `${stringSubstring}...`;
  }
}

export function scrollElement(_this, grid, target) {
  const bodyRef =
    _this[grid].current?.qhGridRef?.current?.bodyRef?.current || null;
  window.requestAnimationFrame(function() {
    if (bodyRef != null) {
      const row = bodyRef.getElementsByClassName(target);
      if (row.length !== 0) {
        bodyRef.scrollTo({
          top: row[0].offsetTop - 40,
          left: 0,
          behavior: 'smooth',
        });
      }
    }
  });
}

export function roundToPrecision(value, precision) {
  var multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
}

export function limitLength(arrLength, length) {
  if (arrLength) {
    return arrLength < length ? arrLength : length;
  } else return 0;
}

export function limitLengthOrNull(arrLength, length) {
  if (arrLength) {
    return arrLength < length ? arrLength : length;
  } else return null;
}

export function networkByCluster(network) {
  network = _.cloneDeep(network);
  let buckets = [];
  let inBucket = false;
  const bucket = () => {
    let keepGoing = true;
    let nodeArray = [];
    let nowInBucket = false;

    while (keepGoing) {
      keepGoing = false;
      _.forEach(network.links, link => {
        nowInBucket = false;
        _.forEach(buckets, bucket => {
          if (
            _.includes(bucket, link.source) ||
            _.includes(bucket, link.target)
          ) {
            nowInBucket = true;
          }
        });
        if (!nowInBucket) {
          if (
            !_.includes(nodeArray, link.source) &&
            !_.includes(nodeArray, link.target) &&
            nodeArray.length === 0
          ) {
            nodeArray.push(link.source);
            nodeArray.push(link.target);
            keepGoing = true;
          }
          if (
            _.includes(nodeArray, link.source) &&
            !_.includes(nodeArray, link.target)
          ) {
            nodeArray.push(link.target);
            keepGoing = true;
          }
          if (
            _.includes(nodeArray, link.target) &&
            !_.includes(nodeArray, link.source)
          ) {
            nodeArray.push(link.source);
            keepGoing = true;
          }
        }
      });
    }
    return nodeArray;
  };
  _.forEach(network.links, link => {
    inBucket = false;
    _.forEach(buckets, bucket => {
      if (_.includes(bucket, link.source) || _.includes(bucket, link.target)) {
        inBucket = true;
      }
    });
    //found a link that isn't accounted for, so run through the bucketing process
    if (!inBucket) {
      buckets.push(bucket());
    }
  });
  let nextIndex = 1;
  _.forEach(network.nodes, node => {
    let found = false;
    _.forEach(buckets, (bucket, i) => {
      if (_.includes(bucket, node.id)) {
        node.group = i;
        found = true;
      }
    });
    if (!found) {
      node.group = buckets.length + nextIndex;
      nextIndex++;
    }
  });
  _.forEach(network.links, link => {
    _.forEach(buckets, (bucket, i) => {
      if (_.includes(bucket, link.target || _.includes(bucket, link.source))) {
        link.group = i;
      }
    });
  });
  network.nodes = _.sortBy(network.nodes, [
    function(o) {
      return o.group;
    },
  ]);
  network.links = _.sortBy(network.links, [
    function(o) {
      return o.group;
    },
  ]);
  let nodes = d3.group(network.nodes, d => d.group);
  let links = d3.group(network.links, d => d.group);
  let nodeArray = Array.from(nodes, function(o) {
    return { name: 'cluster' + o[0], size: o[1].length, nodes: o[1] };
  });
  let linkArray = Array.from(links, function(o) {
    return { name: 'cluster' + o[0], size_links: o[1].length, links: o[1] };
  });
  _.forEach(nodeArray, nObj => {
    let links = _.find(linkArray, function(lObj) {
      return lObj.name === nObj.name;
    });
    if (links) {
      nObj.links = links.links;
    } else {
      nObj.links = [];
    }
  });
  nodeArray.sort((x, y) => d3.descending(x.size, y.size));
  return { name: 'Network', children: nodeArray };
}

export const loadingDimmer = (
  <Dimmer active inverted>
    <Loader size="large">SVG Loading</Loader>
  </Dimmer>
);

export function dynamicSizeLarger() {
  let w = Math.max(
    document.documentElement.clientWidth,
    window.innerWidth || 0,
  );
  if (w < 1200) {
    return 'medium';
  } else if (w > 1199 && w < 1600) {
    return 'medium';
  } else if (w > 1599 && w < 2600) {
    return 'large';
  } else if (w > 2599) return 'large';
}
