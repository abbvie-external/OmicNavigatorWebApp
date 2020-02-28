import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import * as d3 from 'd3';
import _ from 'lodash';
import { Grid, Search, Radio, Label } from 'semantic-ui-react';
import NetworkGraphTree from './NetworkGraphTree';
import './EnrichmentResultsGraph.scss';

const resultRenderer = ({ title }) => <Label content={title} />;

class EnrichmentResultsGraph extends Component {
  state = {
    showNetworkLabels: true,
    results: [],
    networkSearchValue: '',
    descriptions: []
  };

  componentDidMount() {
    const networkDataNodeDescriptions = this.props.networkData.nodes.map(r => ({
      title: r.data.EnrichmentMap_GS_DESCR.toLowerCase()
      // title: r.metaData.Description,
      // prop: r.prop,
      // value: r.value,
      // ontology: r.metaData.Ontology
    }));
    this.setState({
      descriptions: networkDataNodeDescriptions
    });
  }

  // let clusters = this.props.networkDataNew.clusters;
  // const nodes = clusters.map(c => c.nodes);
  // const nodesMapped = nodes.map(n => ({
  //   key: n.id,
  //   title: n.description
  //   // ontology: n.ontology,
  //   // size: n.geneSetSize,
  //   // genes: n.genes
  //   // title: r.metaData.Description,
  //   // prop: r.prop,
  //   // value: r.value,
  //   // ontology: r.metaData.Ontology
  // }));
  // this.setState({
  //   descriptions: nodesMapped
  // });

  // componentWillUnmount() {
  //   d3.select("#svg-chart-network").remove();
  // }

  handlePieClick = data => {
    this.props.onHandlePieClick(
      this.props.enrichmentStudy,
      this.props.enrichmentModel,
      this.props.enrichmentAnnotation,
      data.metaData,
      data.prop
    );
  };

  handleLabels = () => {
    this.setState(prevState => ({
      showNetworkLabels: !prevState.showNetworkLabels
    }));
    if (this.state.showNetworkLabels) {
      d3.selectAll('.node-label').style('opacity', 0);
    } else {
      d3.selectAll('.node-label').style('opacity', 1);
    }
  };

  handleResultSelect = (e, { result }) =>
    this.setState({ networkSearchValue: result.title });

  handleSearchChange = (e, { value }) => {
    this.setState({ networkSearchValue: value.toLowerCase() });

    setTimeout(() => {
      if (this.state.networkSearchValue.length < 1)
        return this.setState({
          ...this.state,
          results: [],
          networkSearchValue: ''
        });

      const re = new RegExp(_.escapeRegExp(this.state.networkSearchValue), 'i');
      const isMatch = result => re.test(result.title);

      this.setState({
        results: _.filter(this.state.descriptions, isMatch)
      });
    }, 300);
  };

  render() {
    const { networkSearchValue, results } = this.state;

    return (
      <Grid className="NetworkGraphFiltersContainer">
        <Grid.Row>
          <Grid.Column
            className="NetworkGraphFilters"
            mobile={6}
            tablet={6}
            largeScreen={3}
            widescreen={2}
          ></Grid.Column>
          <Grid.Column
            // className="NetworkGraphFilters"
            mobile={6}
            tablet={6}
            largeScreen={4}
            widescreen={4}
          >
            <Search
              placeholder="Search Network"
              onResultSelect={this.handleResultSelect}
              onSearchChange={_.debounce(this.handleSearchChange, 500, {
                leading: true
              })}
              results={results}
              value={networkSearchValue}
              resultRenderer={resultRenderer}
              {...this.props}
            />
          </Grid.Column>
          <Grid.Column
            className="NetworkGraphFilters"
            id="NetworkGraphLabelsToggle"
            mobile={6}
            tablet={6}
            largeScreen={3}
            widescreen={4}
          >
            <Radio
              toggle
              label="Show Labels"
              checked={this.state.showNetworkLabels}
              onChange={this.handleLabels}
            />
          </Grid.Column>
          <Grid.Column
            className="NetworkGraphFilters"
            mobile={6}
            tablet={6}
            largeScreen={3}
            widescreen={3}
          >
            <h3>toggle tbd</h3>
          </Grid.Column>
          <Grid.Column
            className="NetworkGraphFilters"
            mobile={6}
            tablet={6}
            largeScreen={3}
            widescreen={3}
          >
            <h3>legend</h3>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row className="NetworkGraphContainer">
          <Grid.Column
            className=""
            mobile={16}
            tablet={16}
            largeScreen={16}
            widescreen={16}
          >
            <NetworkGraphTree
              {...this.props}
              {...this.state}
              onPieClick={this.handlePieClick}
            ></NetworkGraphTree>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default withRouter(EnrichmentResultsGraph);
