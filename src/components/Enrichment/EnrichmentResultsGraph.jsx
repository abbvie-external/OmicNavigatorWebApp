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
  // Header,
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
    descriptions: []
  };

  componentDidMount() {
    if (!this.props.networkGraphReady) {
      d3.select(`#svg-${this.props.networkSettings.id}`).remove();
      d3.select('div.tooltip-pieSlice').remove();
      this.setupSearch();
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      this.props.networkGraphReady !== prevProps.networkGraphReady ||
      this.props.networkData !== prevProps.networkData
    ) {
      this.setupSearch();
      this.props.onCreateLegend();
    }
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
    const { results } = this.state;
    const {
      nodeCutoff,
      edgeCutoff,
      networkDataLoaded,
      networkSortBy,
      networkGraphReady,
      activeIndexEnrichmentView,
      filteredNodesTotal,
      filteredEdgesTotal,
      totalNodes,
      totalEdges,
      legendIsOpen
    } = this.props;

    if (!networkDataLoaded) {
      return (
        <div className="LoaderActivePlotsNetwork">
          <LoaderActivePlots />
        </div>
      );
    } else {
      const dynamicSize = this.getDynamicSize();

      const openLegend =
        legendIsOpen && activeIndexEnrichmentView === 1 && networkGraphReady
          ? true
          : false;

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
      // const legend = this.getLegend();
      const LegendPopupStyle = {
        padding: '1em',
        width: '250px'
      };

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
                disabled={!networkGraphReady}
                size={dynamicSize}
                id="NetworkSearchInput"
                placeholder="Search Network"
                onResultSelect={this.handleResultSelect}
                onSearchChange={this.handleSearchChange}
                results={results}
                // value={networkSearchValue}
                resultRenderer={resultRenderer}
                // {...this.props}
              />
              <Radio
                disabled={!networkGraphReady}
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
                disabled={!networkGraphReady}
                size={dynamicSize}
                type="number"
                step="0.01"
                min="0"
                max="1"
                default="0.10"
                label="Node Cutoff"
                name="nodeCutoff"
                className="NetworkSliderInput"
                value={nodeCutoff}
                onChange={this.props.onHandleInputChange}
              />
              <Slider
                disabled={!networkGraphReady}
                className="NetworkSlider"
                inverted={false}
                value={nodeCutoff}
                name="nodeCutoff"
                settings={{
                  start: nodeCutoff,
                  min: 0,
                  max: 1,
                  step: 0.05,
                  onChange: value => {
                    this.props.onHandleSliderChange({
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
                disabled={!networkGraphReady}
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
                onChange={this.props.onHandleInputChange}
              />
              <Slider
                disabled={!networkGraphReady}
                className="NetworkSlider"
                inverted={false}
                name="edgeCutoff"
                value={edgeCutoff}
                settings={{
                  start: edgeCutoff,
                  min: 0.05,
                  max: 1,
                  step: 0.025,
                  onChange: value => {
                    this.props.onHandleSliderChange({
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
                  disabled={!networkGraphReady}
                  // header="Sort By"
                  options={networkSortByOptions}
                  defaultValue={networkSortBy}
                  onChange={this.props.onHandleNetworkSortByChange}
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
            <Grid.Column
              id="LegendColumn"
              mobile={8}
              tablet={8}
              largeScreen={8}
              widescreen={8}
            >
              <Popup
                trigger={
                  <Button
                    disabled={!networkGraphReady}
                    icon
                    labelPosition="left"
                    // color="blue"
                    id="LegendIconButton"
                    // className={networkGraphReady ? 'Show' : 'Hide'}
                    size="mini"
                  >
                    Legend
                    <Icon name="info" />
                  </Button>
                }
                wide
                on="click"
                style={LegendPopupStyle}
                id="LegendPopup"
                // position="top left"
                open={openLegend}
                onClose={this.props.onHandleLegendClose}
                onOpen={this.props.onHandleLegendOpen}
                // className={(activeIndexEnrichmentView === 1
                //   && networkGraphReady) ? 'Show' : 'Hide'}
              >
                <Popup.Content className="legend"></Popup.Content>
              </Popup>
            </Grid.Column>
            <Grid.Column
              id="TotalsColumn"
              mobile={8}
              tablet={8}
              largeScreen={8}
              widescreen={8}
            >
              <span
                id="NodeEdgeTotals"
                className={networkGraphReady ? 'Show' : 'Hide'}
              >
                <Label>
                  {filteredNodesTotal} of {totalNodes} Nodes
                </Label>
                <Label>
                  {filteredEdgesTotal} of {totalEdges} Edges
                </Label>
              </span>
            </Grid.Column>
            <Grid.Column
              className=""
              mobile={16}
              tablet={16}
              largeScreen={16}
              widescreen={16}
            >
              <NetworkGraph {...this.props} {...this.state}></NetworkGraph>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      );
      // }
    }
  }
}

export default EnrichmentResultsGraph;
