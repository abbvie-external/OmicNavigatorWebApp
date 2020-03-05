import _ from 'lodash';
import * as d3 from 'd3-array';

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

export function networkByCluster(network) {
  network = _.cloneDeep(network);
  function bucket() {
    let keepGoing = true;
    let nodeArray = [];
    let nowInBucket = false;

    while (keepGoing) {
      keepGoing = false;
      _.forEach(network.links, function(l) {
        nowInBucket = false;
        _.forEach(buckets, function(b) {
          if (_.includes(b, l.source) || _.includes(b, l.target)) {
            nowInBucket = true;
          }
        });
        if (!nowInBucket) {
          if (
            !_.includes(nodeArray, l.source) &&
            !_.includes(nodeArray, l.target) &&
            nodeArray.length === 0
          ) {
            nodeArray.push(l.source);
            nodeArray.push(l.target);
            keepGoing = true;
          }
          if (
            _.includes(nodeArray, l.source) &&
            !_.includes(nodeArray, l.target)
          ) {
            nodeArray.push(l.target);
            keepGoing = true;
          }
          if (
            _.includes(nodeArray, l.target) &&
            !_.includes(nodeArray, l.source)
          ) {
            nodeArray.push(l.source);
            keepGoing = true;
          }
        }
      });
    }
    return nodeArray;
  }

  let buckets = [];
  let inBucket = false;
  _.forEach(network.links, function(l) {
    inBucket = false;
    _.forEach(buckets, function(b) {
      if (_.includes(b, l.source) || _.includes(b, l.target)) {
        inBucket = true;
      }
    });
    //found a link that isn't accounted for, so run through the bucketing process
    if (!inBucket) {
      buckets.push(bucket());
    }
  });

  let nextIndex = 1;
  _.forEach(network.nodes, function(n) {
    let found = false;
    _.forEach(buckets, function(b, i) {
      if (_.includes(b, n.id)) {
        n.group = i;
        found = true;
      }
    });
    if (!found) {
      n.group = buckets.length + nextIndex;
      nextIndex++;
    }
  });
  _.forEach(network.links, function(l) {
    _.forEach(buckets, function(b, i) {
      if (_.includes(b, l.target || _.includes(b, l.source))) {
        l.group = i;
      }
    });
  });

  //console.log(buckets)
  console.log(network);
  network.nodes = _.sortBy(network.nodes, [
    function(o) {
      return o.group;
    }
  ]);
  network.links = _.sortBy(network.links, [
    function(o) {
      return o.group;
    }
  ]);

  let nodes = d3.group(network.nodes, d => d.group);
  console.log('nodes is ');
  console.log(nodes);
  let links = d3.group(network.links, d => d.group);
  console.log('links is ');
  console.log(links);

  let nodeArray = Array.from(nodes, function(o) {
    return { name: 'cluster' + o[0], size: o[1].length, nodes: o[1] };
  });
  console.log('here is the node array');
  console.log(nodeArray);
  let linkArray = Array.from(links, function(o) {
    return { name: 'cluster' + o[0], size_links: o[1].length, links: o[1] };
  });
  console.log('here is the link array');
  console.log(linkArray);

  _.forEach(nodeArray, function(nObj) {
    let links = _.find(linkArray, function(lObj) {
      return lObj.name === nObj.name;
    });
    if (links) {
      nObj.links = links.links;
    } else {
      nObj.links = [];
    }
  });
  console.log(nodeArray);

  //let nwArray: any = Array.from(temp, function(o) {return {name: 'cluster' + o[0], value: {size: o[1].length, obj:o[1]}}});
  //let nwArray: any = Array.from(nodes, function (o) { return { name: 'cluster' + o[0], size: o[1].length, obj: o[1] } });
  nodeArray.sort((x, y) => d3.descending(x.size, y.size));

  return { name: 'Network', children: nodeArray };
}
