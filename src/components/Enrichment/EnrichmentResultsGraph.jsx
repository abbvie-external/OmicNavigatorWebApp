import React, { Component } from 'react';
import { Slider } from 'react-semantic-ui-range';
import legendIcon from '../../resources/legend.jpg';
// import styled from 'styled-components';
import * as d3 from 'd3';
import _ from 'lodash';
import {
  Popup,
  Grid,
  Search,
  Radio,
  Label,
  Input,
  Button
  // Input
} from 'semantic-ui-react';
// import NetworkGraphOld from './NetworkGraphOld';
// import NetworkGraphNew from './NetworkGraphNew'
import NetworkGraphSemioticForce from './NetworkGraphSemioticForce';
import NetworkGraphSemioticHierarchy from './NetworkGraphSemioticHierarchy';
import NetworkGraphOld from './NetworkGraphOld';
import NetworkGraphTree from './NetworkGraphTree';
import NetworkGraphTreeEx from './NetworkGraphTreeEx';
import NetworkGraphTreeAlt from './NetworkGraphTreeAlt';
import NetworkGraphAlt from './NetworkGraphTree';
import NetworkGraphReact from './NetworkGraphReact';
import NetworkGraphThresholdSlider from './NetworkGraphThresholdSlider';
import NetworkGraphAdjacencyMatrix from './NetworkGraphAdjacencyMatrix';
import NetworkGraphCustomLayout from './NetworkGraphCustomLayout';
// import NetworkGraphCarousel from './NetworkGraphCarousel';
import TransitionActive from '../Transitions/TransitionActive';
import './EnrichmentResultsGraph.scss';
// const StyledInput = styled(Input)`
//   border: unset;
// `;

const resultRenderer = ({ description, genes, size }) => {
  let genesFormatted = genes.join(', ');
  const SearchValuePopupStyle = {
    backgroundColor: '2E2E2E',
    borderBottom: '2px solid var(--color-primary)',
    color: '#FFF',
    padding: '1em',
    maxWidth: '25vw',
    fontSize: '13px',
    wordBreak: 'break-all'
    // zIndex: 333,
    // overflow: 'auto'
  };
  return (
    <Grid className="NetworkSearchResultsContainer">
      <Grid.Column width={13}>
        <Label>{description}</Label>
      </Grid.Column>
      <Grid.Column width={3}>
        <Popup
          trigger={
            <Label circular color="blue" key={description}>
              {size}
            </Label>
          }
          basic
          style={SearchValuePopupStyle}
          inverted
          // position="bottom left"
        >
          {genesFormatted}
        </Popup>
      </Grid.Column>
    </Grid>
  );
};
class EnrichmentResultsGraph extends Component {
  state = {
    showNetworkLabels: true,
    results: [],
    networkSearchValue: '',
    descriptions: [],
    nodeCutoff: 0.5,
    edgeCutoff: 0.375,
    networkSortBy: 'lowestTestValue'
    // legendIsOpen: true
  };

  componentDidMount() {
    // if (this.props.networkDataLoaded) {
    this.setupSearch();
    //}
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      // this.props.networkDataLoaded &&
      this.props.networkData !== prevProps.networkData
    ) {
      this.setupSearch();
    }
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

  handleResultSelect = (e, { result }) => {
    debugger;
    this.setState({ networkSearchValue: result.description });
  };

  // handleSearchChange = (e, { value }) => {
  //   if (value.length < 1) {
  //     return this.setState({
  //       results: [],
  //       networkSearchValue: ''
  //     });
  //   } else {
  //     this.setState(
  //       { networkSearchValue: value.toLowerCase() },
  //       this.debounceSearchChange
  //     );
  //   }
  // };
  handleSearchChange = _.debounce((e, { value: networkSearchValue }) => {
    if (networkSearchValue.length < 1) {
      return this.setState({
        results: [],
        networkSearchValue
      });
    }
    networkSearchValue = networkSearchValue.toLowerCase();

    this.setState({
      results: this.state.descriptions.filter(result =>
        result.description.toLowerCase().includes(networkSearchValue)
      ),
      networkSearchValue
    });
  }, 500);

  handleInputChange = (evt, { name, value }) => {
    this.setState({
      [name]: value
    });
  };

  getLegend = () => {
    return (
      <svg viewBox="0 0 300 250" preserveAspectRatio="xMinYMin meet">
        <g className="prefix__slices">
          <path
            className="prefix__slice"
            stroke="#000"
            d="M150 50a50 50 0 0150 50h-50zM200 100a50 50 0 01-50 50v-50zM150 150a50 50 0 01-50-50h50zM100 100a50 50 0 0150-50v50z"
            fill="#d3d3d3"
          />
        </g>
        <g className="prefix__labels">
          <text
            dy=".35em"
            x={56.569}
            y={-56.569}
            fontSize=".75em"
            textAnchor="middle"
            transform="translate(150 100)"
          >
            {'mut Time Change'}
          </text>
          <text
            dy=".35em"
            x={56.569}
            y={56.569}
            fontSize=".75em"
            textAnchor="middle"
            transform="translate(150 100)"
          >
            {'wt Time Change'}
          </text>
          <text
            dy=".35em"
            x={-56.569}
            y={56.569}
            fontSize=".75em"
            textAnchor="middle"
            transform="translate(150 100)"
          >
            {'wt VS mut'}
          </text>
          <text
            dy=".35em"
            x={-56.569}
            y={-56.569}
            fontSize=".75em"
            textAnchor="middle"
            transform="translate(150 100)"
          >
            {'wt VS mut Time'}
          </text>
          <path
            className="prefix__pointer"
            d="M250.108 48.431h-87.079l15.255 23.285M247.162 161.569h-81.187l12.31-33.285M66.736 161.569h53.39l1.59-33.285M132.853 48.431H54.01l67.706 23.285"
            fill="none"
            stroke="#000"
          />
        </g>
        <g className="prefix__gradient">
          <path className="prefix__filled" d="M100 200h100v15H100z" />
          <g
            className="prefix__y prefix__axis"
            fill="none"
            fontSize={10}
            fontFamily="sans-serif"
            textAnchor="middle"
          >
            <path
              className="prefix__domain"
              stroke="currentColor"
              d="M100.5 221v-5.5h100v5.5"
            />
            <g className="prefix__tick">
              <path stroke="currentColor" d="M100.5 215v6" />
              <text
                fill="currentColor"
                y={9}
                dy=".71em"
                transform="translate(100.5 215)"
              >
                {'0.0'}
              </text>
            </g>
            <g className="prefix__tick">
              <path stroke="currentColor" d="M172.722 215v6" />
              <text
                fill="currentColor"
                y={9}
                dy=".71em"
                transform="translate(172.722 215)"
              >
                {'0.5'}
              </text>
            </g>
            <g className="prefix__tick">
              <path stroke="currentColor" d="M200.5 215v6" />
              <text
                fill="currentColor"
                y={9}
                dy=".71em"
                transform="translate(200.5 215)"
              >
                {'1.0'}
              </text>
            </g>
          </g>
          <text y={2} dy=".35em" transform="translate(65 205)">
            {'pValue'}
          </text>
        </g>
        <defs>
          <linearGradient id="prefix__mainGradient">
            <stop offset={0} stopColor="red" />
            <stop offset={0.5} stopColor="#fff" />
            <stop offset={1} stopColor="#00f" />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  // handleLegendOpen = () => {
  //   this.setState({ legendIsOpen: true });

  //   this.timeout = setTimeout(() => {
  //     this.setState({ legendIsOpen: false });
  //   }, 2500);
  // };

  // handleLegendClose = () => {
  //   this.setState({ legendIsOpen: false });
  //   clearTimeout(this.timeout);
  // };

  handleNetworkSortByChange = (evt, { value }) => {
    this.setState({
      networkSortBy: value
    });
  };

  setupSearch = () => {
    const networkDataNodeDescriptions = this.props.networkData.nodes.map(r => ({
      description: r.data.EnrichmentMap_GS_DESCR.toLowerCase(),
      genes: r.data.EnrichmentMap_Genes,
      size: r.data.EnrichmentMap_Genes.length
    }));
    this.setState({
      descriptions: networkDataNodeDescriptions
    });
  };

  render() {
    const { networkDataLoaded } = this.props;
    const { results, nodeCutoff, edgeCutoff, networkSortBy } = this.state;
    const legend = this.getLegend();
    const LegendPopupStyle = {
      padding: '1em',
      width: '250px'
    };
    if (!networkDataLoaded) {
      return (
        <div className="PlotInstructionsDiv">
          <h4 className="PlotInstructionsText">Network Data is Loading</h4>
        </div>
      );
    } else {
      return (
        <Grid className="NetworkGraphFiltersContainer">
          <Grid.Row className="NetworkGraphFiltersRow">
            <Grid.Column
              className="NetworkGraphFilters"
              mobile={4}
              tablet={4}
              largeScreen={2}
              widescreen={2}
            ></Grid.Column>
            <Grid.Column
              // className="NetworkGraphFilters"
              mobile={10}
              tablet={10}
              largeScreen={3}
              widescreen={3}
            >
              <Search
                // className="NetworkSearchResultsContainer"
                placeholder="Search Network"
                onResultSelect={this.handleResultSelect}
                onSearchChange={this.handleSearchChange}
                results={results}
                // value={networkSearchValue}
                resultRenderer={resultRenderer}
                {...this.props}
              />
              <br></br>
              <Radio
                toggle
                label="Show Labels"
                checked={this.state.showNetworkLabels}
                onChange={this.handleLabels}
              />
            </Grid.Column>
            <Grid.Column
              className="NetworkGraphFilters"
              id="NetworkGraphLabelsToggle"
              mobile={6}
              tablet={6}
              largeScreen={3}
              widescreen={3}
            >
              <label className="sortByLabel">Sort By </label>
              <Button.Group className="PValueTypeContainer" size="small">
                <Button
                  type="button"
                  className="pValueButton"
                  value="lowestTestValue"
                  name="lowestttestvalue"
                  positive={networkSortBy === 'lowestTestValue'}
                  onClick={this.handleNetworkSortByChange}
                >
                  Value
                </Button>
                <Button.Or className="OrCircle" />
                <Button
                  type="button"
                  className="pValueButton"
                  value="highestLinkCoefficient"
                  name="highestLinkCoefficient"
                  positive={networkSortBy === 'highestLinkCoefficient'}
                  onClick={this.handleNetworkSortByChange}
                >
                  Coefficient
                </Button>
              </Button.Group>
            </Grid.Column>
            <Grid.Column
              className="NetworkGraphFilters"
              mobile={8}
              tablet={8}
              largeScreen={3}
              widescreen={3}
            >
              <Input
                type="number"
                step="0.05"
                min="0"
                max="1"
                default="0.50"
                label="Node Cutoff"
                name="nodeCutoff"
                className="NetworkSliderInput"
                value={nodeCutoff}
                onChange={this.handleInputChange}
              />
              <Slider
                className="NetworkSlider"
                inverted={false}
                value={nodeCutoff}
                settings={{
                  start: nodeCutoff,
                  min: 0,
                  max: 1,
                  step: 0.05,
                  onChange: value => {
                    this.setState({
                      nodeCutoff: value
                    });
                  }
                }}
              />
            </Grid.Column>
            <Grid.Column
              className="NetworkGraphFilters"
              mobile={8}
              tablet={8}
              largeScreen={3}
              widescreen={3}
            >
              <Input
                type="number"
                step="0.025"
                min="0.050"
                max="1.000"
                default="0.375"
                label="Edge Cutoff"
                name="edgeCutoff"
                className="NetworkSliderInput"
                value={edgeCutoff}
                onChange={this.handleInputChange}
              />
              <Slider
                className="NetworkSlider"
                inverted={false}
                value={edgeCutoff}
                settings={{
                  start: edgeCutoff,
                  min: 0.05,
                  max: 1,
                  step: 0.025,
                  onChange: value => {
                    this.setState({
                      edgeCutoff: value
                    });
                  }
                }}
              />
            </Grid.Column>
            <Grid.Column
              className="NetworkGraphFilters LegendColumn"
              mobile={2}
              tablet={2}
              largeScreen={2}
              widescreen={2}
            >
              <Popup
                // trigger={<Label color="blue">Legend</Label>}
                trigger={
                  <img src={legendIcon} alt="Legend Icon" id="LegendIcon" />
                }
                wide
                basic
                on="click"
                style={LegendPopupStyle}
                // position="bottom center"
                // open={this.state.legendIsOpen}
                // onClose={this.handleLegendClose}
                // onOpen={this.handleLegendOpen}
              >
                {legend}
              </Popup>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row className="NetworkGraphContainer">
            <Grid.Column
              className=""
              mobile={3}
              tablet={3}
              largeScreen={16}
              widescreen={16}
            >
              {/* <NetworkGraphOld
                {...this.props}
                {...this.state}
                onPieClick={this.handlePieClick}
              ></NetworkGraphOld> */}

              <NetworkGraphTree
                {...this.props}
                {...this.state}
                onPieClick={this.handlePieClick}
              ></NetworkGraphTree>

              {/* <NetworkGraphTreeAlt
                {...this.props}
                {...this.state}
                onPieClick={this.handlePieClick}
              ></NetworkGraphTreeAlt> */}

              {/* <NetworkGraphTreeEx
                {...this.props}
                {...this.state}
                onPieClick={this.handlePieClick}
              ></NetworkGraphTreeEx> */}

              {/* <NetworkGraphReact
                {...this.props}
                {...this.state}
                onPieClick={this.handlePieClick}
              ></NetworkGraphReact> */}

              {/* <NetworkGraphThresholdSlider
              {...this.props}
              {...this.state}
              onPieClick={this.handlePieClick}
            ></NetworkGraphThresholdSlider> */}

              {/* <NetworkGraphSemioticForce
              {...this.props}
              {...this.state}
              onPieClick={this.handlePieClick}
            ></NetworkGraphSemioticForce> */}

              {/* <NetworkGraphSemioticHierarchy
              {...this.props}
              {...this.state}
              onPieClick={this.handlePieClick}
            ></NetworkGraphSemioticHierarchy> */}

              {/* <NetworkGraphAdjacencyMatrix
              {...this.props}
              {...this.state}
              onPieClick={this.handlePieClick}
            ></NetworkGraphAdjacencyMatrix> */}

              {/* <NetworkGraphCustomLayout
              {...this.props}
              {...this.state}
              onPieClick={this.handlePieClick}
            ></NetworkGraphCustomLayout> */}
            </Grid.Column>
          </Grid.Row>
        </Grid>
      );
    }
  }
}

export default EnrichmentResultsGraph;
