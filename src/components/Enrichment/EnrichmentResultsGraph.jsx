import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import * as d3 from 'd3';
import _ from 'lodash';
import {
  Icon,
  Popup,
  Grid,
  Search,
  Radio,
  Label,
  Header,
  Segment
} from 'semantic-ui-react';
import NetworkGraphTree from './NetworkGraphTree';
import './EnrichmentResultsGraph.scss';
const initialState = {
  showNetworkLabels: true,
  descriptions: [],
  results: [],
  value: ''
};

const resultRenderer = ({ title }) => <Label content={title} />;

class EnrichmentResultsGraph extends Component {
  state = initialState;

  componentDidMount() {
    debugger;
    const enrichmentResultsDescriptions = this.props.enrichmentResults.map(
      r => ({
        title: r.Description
        // title: r.metaData.Description,
        // prop: r.prop,
        // value: r.value,
        // ontology: r.metaData.Ontology
      })
    );
    this.setState({
      descriptions: enrichmentResultsDescriptions
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

  getEnrichmentViewToggle = () => {
    const IconPopupStyle = {
      backgroundColor: '2E2E2E',
      borderBottom: '2px solid var(--color-primary)',
      color: '#FFF',
      padding: '1em',
      maxWidth: '50vw',
      fontSize: '13px',
      wordBreak: 'break-all'
    };

    return (
      <div className="NetworkGraphToggle">
        <Popup
          trigger={
            <Icon
              name="table"
              size="large"
              color="orange"
              bordered
              className="TableVsNetworkButtons"
              inverted={this.props.enrichmentView === 'table'}
              onClick={this.props.onEnrichmentViewChange({
                enrichmentView: 'table'
              })}
            />
          }
          style={IconPopupStyle}
          inverted
          basic
          position="bottom left"
          content="View Table"
        />
        <Popup
          trigger={
            <Icon
              name="chart pie"
              size="large"
              color="orange"
              bordered
              className="TableVsNetworkButtons"
              inverted={this.props.enrichmentView === 'network'}
              onClick={this.props.onEnrichmentViewChange({
                enrichmentView: 'network'
              })}
            />
          }
          style={IconPopupStyle}
          inverted
          basic
          position="bottom left"
          content="View Network Graph"
        />
      </div>
    );
  };

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

  // highlightLabels(str) {
  //   if (str.length === 0) {
  //     d3.selectAll('.node-label').style('opacity', 0);
  //   } else {
  //     d3.selectAll('.node-label').style('opacity', 0);
  //     var keep = d3.selectAll('.node-label').filter(function(d) {
  //       return d[self.chart.settings.nodeLabel].toLowerCase().includes(str);
  //     });
  //     keep.style('opacity', 1);
  //   }
  // }

  handleResultSelect = (e, { result }) =>
    this.setState({ value: result.title });

  handleSearchChange = (e, { value }) => {
    this.setState({ value });

    setTimeout(() => {
      if (this.state.value.length < 1) return this.setState(initialState);

      const re = new RegExp(_.escapeRegExp(this.state.value), 'i');
      const isMatch = result => re.test(result.title);

      this.setState({
        results: _.filter(this.state.descriptions, isMatch)
      });
    }, 300);
  };

  render() {
    // const {
    //   enrichmentResults,
    //   enrichmentColumns,
    //   enrichmentStudy,
    //   enrichmentModel,
    //   enrichmentAnnotation
    // } = this.props;

    const { value, results } = this.state;

    const enrichmentViewToggle = this.getEnrichmentViewToggle();

    return (
      <div className="NetworkGraphWrapper">
        {enrichmentViewToggle}
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
                value={value}
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
        </Grid>
        <NetworkGraphTree
          {...this.props}
          onPieClick={this.handlePieClick}
        ></NetworkGraphTree>
      </div>
    );
  }
}

export default withRouter(EnrichmentResultsGraph);
