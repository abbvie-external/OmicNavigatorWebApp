import React, { Component } from 'react';
import { Slider } from 'react-semantic-ui-range';
import * as d3 from 'd3';
import _ from 'lodash';
import {
  Popup,
  Grid,
  Search,
  Radio,
  Label,
  Input,
  Button,
  Icon,
  // Segment
  Header,
  Dropdown
  // Input
} from 'semantic-ui-react';
// import {
//   sortableContainer,
//   sortableElement
//     sortableHandle
// } from 'react-sortable-hoc';
// import arrayMove from 'array-move';
import NetworkGraph from './NetworkGraph';
import LoaderActivePlots from '../Transitions/LoaderActivePlots';
import './EnrichmentResultsGraph.scss';

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

// const DragHandle = sortableHandle(() => <span>::</span>);
// const SortableItem = sortableElement(props => (
//   <li className="NetworkGraphSortableLink">
//     {/* <DragHandle /> */}
//     <Label color="blue" size="small" key={`label-${props.value}`}>
//       {props.sortIndex + 1}) {props.value}
//     </Label>
//   </li>
// ));

// const SortableContainer = sortableContainer(({ children }) => {
//   return <ul>{children}</ul>;
// });

class EnrichmentResultsGraph extends Component {
  state = {
    showNetworkLabels: true,
    results: [],
    networkSearchValue: '',
    descriptions: [],
    nodeCutoff: 0.5,
    edgeCutoff: 0.375,
    // networkGraphReady: false,
    legendIsOpen: true,
    // legendIsOpen: JSON.parse(sessionStorage.getItem('legendOpen')) || true,
    // networkSortBy: ['significance', 'edgecount', 'nodecount']
    networkSortBy: 'significance'
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

  componentWillUnmount() {
    d3.select('#svg-chart-network').remove();
    d3.select('div.tooltip-pieSlice').remove();
  }

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
    this.setState({ networkSearchValue: result.description });
  };

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

  handleLegendOpen = () => {
    // sessionStorage.setItem('legendOpen', 'true');
    this.setState({ legendIsOpen: true });
    // this.timeout = setTimeout(() => {
    //   this.setState({ legendIsOpen: false });
    // }, 2500);
  };

  handleLegendClose = () => {
    // sessionStorage.setItem('legendOpen', 'false');
    this.setState({ legendIsOpen: false });
    // clearTimeout(this.timeout);
  };

  handleNetworkSortByChange = (evt, { value }) => {
    this.setState({
      networkSortBy: value
      // networkGraphReady: false
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

  // handleNetworkGraphReady = bool => {
  //   this.setState({
  //     networkGraphReady: bool
  //   });
  // };

  getDynamicSize = () => {
    let w = Math.max(
      document.documentElement.clientWidth,
      window.innerWidth || 0
    );
    if (w < 1200) {
      return 'small';
    } else if (w > 1199 && w < 1600) {
      return 'small';
    } else if (w > 1599 && w < 2600) {
      return undefined;
    } else if (w > 2599) return 'large';
  };

  // onSortEnd = ({ oldIndex, newIndex }) => {
  //   this.setState(({ networkSortBy }) => ({
  //     networkSortBy: arrayMove(networkSortBy, oldIndex, newIndex)
  //   }));
  // };

  render() {
    const { networkDataLoaded } = this.props;
    const {
      results,
      nodeCutoff,
      edgeCutoff,
      legendIsOpen,
      networkSortBy
      // networkGraphReady
    } = this.state;

    const networkSortByOptions = [
      {
        key: 'significance',
        text: 'Significance',
        value: 'significance',
        content: 'Significance'
      },
      {
        key: 'edgecount',
        text: 'Edge Count',
        value: 'edgecount',
        content: 'Edge Count'
      },
      {
        key: 'nodecount',
        text: 'Node Count',
        value: 'nodecount',
        content: 'Node Count'
      }
    ];

    const legend = this.getLegend();
    const LegendPopupStyle = {
      padding: '1em',
      width: '250px'
    };

    const dynamicSize = this.getDynamicSize();
    if (!networkDataLoaded) {
      return (
        <div className="LoaderActivePlotsNetwork">
          <LoaderActivePlots />
        </div>
      );
    } else {
      // if (!networkGraphReady) {
      //   return (
      //     <div>
      //       <LoaderActivePlots />
      //     </div>
      //   );
      // } else {
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
              largeScreen={4}
              widescreen={4}
            >
              <Search
                size={dynamicSize}
                // className="NetworkSearchResultsContainer"
                placeholder="Search Network"
                onResultSelect={this.handleResultSelect}
                onSearchChange={this.handleSearchChange}
                results={results}
                // value={networkSearchValue}
                resultRenderer={resultRenderer}
                // {...this.props}
              />
              <Radio
                className="RadioLabelsDisplay"
                toggle
                size={dynamicSize}
                label="Show Labels"
                checked={this.state.showNetworkLabels}
                onChange={this.handleLabels}
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
                size={dynamicSize}
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
                size={dynamicSize}
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
              className="NetworkGraphFilters"
              id="NetworkGraphSortByDiv"
              mobile={6}
              tablet={6}
              largeScreen={4}
              widescreen={4}
            >
              {/* <Segment id="NetworkGraphSortBySegment">
                <Label floating id="NetworkSortByLabel">
                  SORT BY
                </Label>
                <SortableContainer
                  onSortEnd={this.onSortEnd}
                  // useDragHandle
                  helperClass="SortableHelper"
                >
                  {networkSortBy.map((value, index) => (
                    <SortableItem
                      key={`item-${value}`}
                      index={index}
                      sortIndex={index}
                      value={value}
                      className="SortableItem NoSelect"
                    />
                  ))}
                </SortableContainer>
              </Segment> */}
              {/* <Header as="h4">
                <Icon name="sort" />
                <Header.Content>
                  Sort By{' '} */}
              <span>
                <span id="NetworkGraphSortByText">Sort By </span>
                <Dropdown
                  inline
                  // header="Sort By"
                  options={networkSortByOptions}
                  defaultValue={networkSortBy}
                  onChange={this.handleNetworkSortByChange}
                />
              </span>
              {/* </Header.Content>
              </Header> */}
              {/* <Button.Group className="PValueTypeContainer" size={dynamicSize}>
                <Button
                  icon
                  labelPosition="right"
                  type="button"
                  className="pValueButton"
                  value="lowestTestValue"
                  name="lowestttestvalue"
                  positive={networkSortBy === 'lowestTestValue'}
                  onClick={this.handleNetworkSortByChange}
                >
                  Significance
                  <Icon name="sort" className="NetworkSortIcon" />
                </Button>
                <Button
                  type="button"
                  className="pValueButton"
                  value="highestEdgeCount"
                  name="highestEdgeCount"
                  positive={networkSortBy === 'highestEdgeCount'}
                  onClick={this.handleNetworkSortByChange}
                >
                  Edge Count
                </Button>
              </Button.Group> */}
            </Grid.Column>
          </Grid.Row>
          <Grid.Row className="NetworkGraphContainer">
            <Popup
              trigger={
                <Button
                  icon
                  labelPosition="left"
                  // color="blue"
                  id="LegendIconButton"
                  size="mini"
                >
                  Legend
                  <Icon name="info" />
                </Button>
              }
              wide
              on="click"
              style={LegendPopupStyle}
              // position="top left"
              open={legendIsOpen}
              onClose={this.handleLegendClose}
              onOpen={this.handleLegendOpen}
            >
              {legend}
            </Popup>
            <Grid.Column
              className=""
              mobile={16}
              tablet={16}
              largeScreen={16}
              widescreen={16}
            >
              <NetworkGraph
                {...this.props}
                {...this.state}
                // onNetworkGraphReady={this.handleNetworkGraphReady}
              ></NetworkGraph>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      );
      // }
    }
  }
}

export default EnrichmentResultsGraph;
