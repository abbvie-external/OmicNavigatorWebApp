import React from 'react';
import { Popup } from 'semantic-ui-react';
import _ from 'lodash';
// import phosphosite_icon from '../../resources/phosphosite.ico';
import reactome_icon from '../../resources/reactome.jpg';
import go_icon from '../../resources/go.png';
import msig_icon from '../../resources/msig.ico';
import * as d3 from 'd3-array';
// import { omicNavigatorService } from '../../services/omicNavigator.service';

export function getLinkout(
  // icons,
  // iconDomains,
  // TableValuePopupStyle,
  // linkoutsConcatenated,
  itemValue,
  linkouts,
  TableValuePopupStyle,
) {
  // itemValue = 'ENSP00000489236.1;ENSP00000484789.1;ENSP00000481486.1;ENSP00000480960.1;ENSP00000479794.1;ENSP00000479461.1';
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
  let icons = [];

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
      icons.push(`${iconBaseUrl}${domainRawWwwHttps}.ico`);
    }

    const Popups = linkouts.map((link, index) => {
      return (
        <Popup
          key={itemValue - index}
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
    const domainRaw = findDomain(`${linkouts[0]}`);
    const domainRawWww = domainRaw.includes('www')
      ? domainRaw
      : `www.${domainRaw}`;
    const domainRawWwwHttps = domainRawWww.includes('//')
      ? domainRawWww.split('//').pop()
      : domainRawWww;
    icons.push(`${iconBaseUrl}${domainRawWwwHttps}.ico`);
    iconDomains.push(domainRawWwwHttps);
    icons.push(`${iconBaseUrl}${domainRawWwwHttps}`);
    return (
      <Popup
        key={itemValue}
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
}

// export function showPhosphositePlus(item, featureIdKey) {
//   const featureID = item[featureIdKey].split(';')[0];
//   omicNavigatorService.postToPhosphositePlus(
//     { searchStr: featureID, queryId: -1, from: 0 },
//     'https://www.phosphosite.org/proteinSearchSubmitAction.action',
//   );
// }

export function getLinkoutHardcoded(
  item,
  TableValuePopupStyle,
  featureIdKey,
  test,
) {
  let icon = '';
  let iconText = '';
  if (test === 'REACTOME') {
    icon = reactome_icon;
    iconText = 'Reactome';
  }
  if (test.substring(0, 2) === 'GO') {
    icon = go_icon;
    iconText = 'AmiGO 2';
  }
  if (test.substring(0, 4) === 'msig') {
    icon = msig_icon;
    iconText = 'GSEA MSigDB';
  }

  // if (featureIdKey === 'idmult' || test === 'PSP') {
  //   return (
  //     <Popup
  //       trigger={
  //         <img
  //           src={phosphosite_icon}
  //           alt="Phosophosite"
  //           className="ExternalSiteIcon"
  //           onClick={() => showPhosphositePlus(item, featureIdKey)}
  //         />
  //       }
  //       style={TableValuePopupStyle}
  //       className="TablePopupValue"
  //       content={'PhosphoSitePlus'}
  //       inverted
  //       basic
  //     />
  //   );
  // } else
  if (
    test === 'REACTOME' ||
    test.substring(0, 4) === 'msig' ||
    item[featureIdKey].includes('GO:')
  ) {
    return (
      <Popup
        trigger={
          <img
            src={icon}
            alt={iconText}
            className="ExternalSiteIcon"
            onClick={() => getLink(test, item, featureIdKey)}
          />
        }
        style={TableValuePopupStyle}
        className="TablePopupValue"
        content={iconText}
        inverted
        basic
      />
    );
  } else return null;
}

export function getLink(test, item, featureIdKey) {
  if (test === 'REACTOME') {
    window.open(
      'https://reactome.org/content/detail/' + item[featureIdKey],
      '_blank',
    );
  } else if (test.substring(0, 2) === 'GO') {
    window.open(
      'http://amigo.geneontology.org/amigo/term/' + item[featureIdKey],
      '_blank',
    );
  } else if (test.substring(0, 4) === 'msig') {
    window.open(
      'http://software.broadinstitute.org/gsea/msigdb/cards/' +
        item[featureIdKey],
      '_blank',
    );
  } else return null;
}

export function separateItemValues(value) {
  if (value) {
    const splitValuesArr = value.split(';');
    // const arrayOfValues =
    return splitValuesArr;
  }
}

export function formatNumberForDisplay(num) {
  if (num) {
    if (!isNaN(num)) {
      const number = Math.abs(num);
      if (number < 0.001 || number >= 1000) {
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
    } else return num;
  } else return null;
}

export function splitValue(value) {
  if (value) {
    const firstValue = value.split(';')[0];
    const numberOfSemicolons = (value.match(/;/g) || []).length;
    return numberOfSemicolons > 0
      ? `${firstValue}...(${numberOfSemicolons})`
      : firstValue;
  }
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
