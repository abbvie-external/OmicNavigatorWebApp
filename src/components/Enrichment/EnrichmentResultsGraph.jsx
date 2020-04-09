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
  Dropdown,
  Menu
} from 'semantic-ui-react';
import {
  sortableContainer,
  sortableElement,
  SortableHandle
} from 'react-sortable-hoc';
import arrayMove from 'array-move';
import NetworkGraph from './NetworkGraph';
import LoaderActivePlots from '../Transitions/LoaderActivePlots';
import './EnrichmentResultsGraph.scss';
// import { getFieldValue } from '../utility/selectors/QHGridSelector';

function getDynamicSize() {
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
}

function getDynamicLegend() {
  let w = Math.max(
    document.documentElement.clientWidth,
    window.innerWidth || 0
  );
  if (w < 768) {
    return {
      padding: '1em',
      width: '250px'
    };
    // else if (w > 767 && w < 1600) {
    //   return {
    //     padding: '1em',
    //     width: '350px'
    //   };
    // } else if (w > 1599 && w < 2600) {
    //   return {
    //     padding: '1em',
    //     width: '450px'
    //   };
  } else
    return {
      padding: '1em',
      width: '350px'
    };
}

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
  // let dynamicSize = getDynamicSize();
  return (
    <Grid className="NetworkSearchResultsContainer">
      <Grid.Column width={13}>
        <Label
        // size={dynamicSize}
        >
          {description}
        </Label>
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

const LegendPopupStyle = getDynamicLegend();

const CustomPopupStyle = {
  backgroundColor: '2E2E2E',
  borderBottom: '2px solid var(--color-primary)',
  color: '#FFF',
  padding: '1em',
  maxWidth: '300px',
  fontSize: '13px',
  wordBreak: 'break-word'
};

const getItemName = val => {
  if (val === 'significance') {
    return 'Significance';
  } else if (val === 'nodecount') {
    return 'Node Count';
  } else if (val === 'edgecount') {
    return 'Edge Count';
  }
};

const DragHandle = SortableHandle(() => <Icon name="bars" />);
const SortableItem = sortableElement(props => {
  const ItemTooltip = function() {
    if (props.value === 'significance') {
      return 'Sort clusters by chosen significance metric';
    } else if (props.value === 'nodecount') {
      return 'Sort clusters by number of nodes per cluster';
    } else if (props.value === 'edgecount') {
      return 'Sort clusters by number of edges per cluster';
    }
  };

  let dynamicSize = getDynamicSize();

  return (
    <li className="NetworkGraphSortableList">
      <Popup
        trigger={
          <Label
            className="NetworkGraphSortableListLabel"
            // color="blue"
            // size="small"
            size={dynamicSize}
            key={`label-${props.value}`}
          >
            <DragHandle />
            {/* {props.sortIndex + 1})  */}
            {getItemName(props.value)}
          </Label>
        }
        style={CustomPopupStyle}
        content={ItemTooltip}
        inverted
        position="left center"
      />
    </li>
    //   <List celled size={dynamicSize}>
    //   <List.Item key={`label-${props.value}`}>
    //     <List.Content>
    //       <List.Header>
    //         <DragHandle />
    //         {getItemName(props.value)}
    //       </List.Header>
    //     </List.Content>
    //   </List.Item>
    // </List>
  );
});

const SortableContainer = sortableContainer(({ children }) => {
  return <ul className="NetworkGraphSortableList">{children}</ul>;
});

class EnrichmentResultsGraph extends Component {
  state = {
    showNetworkLabels: true,
    results: [],
    networkSearchValue: '',
    descriptions: [],
    networkSortBy: ['significance', 'nodecount', 'edgecount']
    // networkSortBy: [
    //   {
    //     key: 'significance',
    //     text: 'Significance',
    //     value: 'significance',
    //     content: 'Significance',
    //     tooltip: 'sort clusters by chosen significance metric'
    //   },
    //   {
    //     key: 'nodecount',
    //     text: 'Node Count',
    //     value: 'nodecount',
    //     content: 'Node Count',
    //     tooltip: 'sort clusters by number of nodes per cluster'
    //   },
    //   {
    //     key: 'edgecount',
    //     text: 'Edge Count',
    //     value: 'edgecount',
    //     content: 'Edge Count',
    //     tooltip: 'sort clusters by number of edges per cluster'
    //   }
    // ]
  };

  componentDidMount() {
    if (!this.props.networkGraphReady) {
      d3.select('div.tooltip-pieSlice').remove();
      d3.select('tooltipEdge').remove();
      d3.select(`#svg-${this.props.networkSettings.id}`).remove();
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

  // onSortEnd = ({ oldIndex, newIndex }) => {
  //   this.setState(({ networkSortBy }) => ({
  //     networkSortBy: arrayMove(networkSortBy, oldIndex, newIndex)
  //   }));
  // };

  onSortEnd = ({ oldIndex, newIndex }) => {
    this.removeNetworkSVG();
    this.setState(({ networkSortBy }) => ({
      networkSortBy: arrayMove(networkSortBy, oldIndex, newIndex)
    }));
  };

  removeNetworkSVG = () => {
    d3.select('div.tooltip-pieSlice').remove();
    d3.select('tooltipEdge').remove();
    d3.select(`#svg-${this.props.networkSettings.id}`).remove();
  };

  // getDropdownTooltip = () => {
  //   const { networkSortBy } = this.props;
  //   if (networkSortBy === 'significance')
  //     return 'sort clusters by chosen significance metric';
  //   if (networkSortBy === 'nodecount')
  //     return 'sort clusters by number of nodes per cluster';
  //   if (networkSortBy === 'edgecount')
  //     return 'sort clusters by number of edges per cluster';
  // };

  render() {
    const { results, networkSortBy } = this.state;
    const {
      nodeCutoff,
      edgeCutoff,
      networkDataLoaded,
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
      const dynamicSize = getDynamicSize();

      const openLegend =
        legendIsOpen && activeIndexEnrichmentView === 1 && networkGraphReady
          ? true
          : false;

      return (
        <Grid className="NetworkGraphFiltersContainer">
          <Grid.Row className="NetworkGraphFiltersRow">
            <Grid.Column
              className="NetworkGraphFilters"
              mobile={14}
              tablet={4}
              largeScreen={2}
              widescreen={2}
            ></Grid.Column>
            <Grid.Column
              // className="NetworkGraphFilters"
              mobile={16}
              tablet={10}
              largeScreen={3}
              widescreen={3}
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
              mobile={16}
              tablet={5}
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
                name="nodeCutoff"
                className="NetworkSliderInput"
                value={nodeCutoff}
                onChange={this.props.onHandleNetworkCutoffInputChange}
              >
                <Popup
                  trigger={
                    <Label className="NetworkInputLabel" size={dynamicSize}>
                      NODE
                      <span className="DisplayOnLarge"> SIGNIFICANCE</span>
                      <br></br>
                      CUTOFF
                    </Label>
                  }
                  style={CustomPopupStyle}
                  // content="Statistical significance threshold. Nodes (database terms) with values greater than this value are removed"
                  content="Only nodes (i.e. enrichment terms) with a statistical significance value less than or equal to the cutoff are displayed in the network below. The statistic is either the nominal or adjusted p-value, depending on the currently chosen setting."
                  inverted
                  basic
                  position="left center"
                />
                <input />
              </Input>
              <div className="NetworkSliderAndTotalsDiv">
                <Slider
                  disabled={!networkGraphReady}
                  className="NetworkSlider"
                  inverted={false}
                  value={nodeCutoff}
                  name="nodeCutoffSlider"
                  settings={{
                    start: nodeCutoff,
                    min: 0,
                    max: 1,
                    step: 0.05,
                    onChange: value => {
                      this.props.onHandleSliderChange('nodeCutoff', value);
                    }
                  }}
                />
                <div
                  className={networkGraphReady ? 'Show NodeEdgeTotals' : 'Hide'}
                >
                  <Popup
                    trigger={
                      <Label size={dynamicSize}>
                        {filteredNodesTotal} of {totalNodes} Nodes
                      </Label>
                    }
                    style={CustomPopupStyle}
                    content="Number of nodes meeting current filter requirements, of total nodes without filters"
                    inverted
                    position="left center"
                  />
                </div>
              </div>
            </Grid.Column>
            <Grid.Column
              className="NetworkGraphFilters"
              mobile={16}
              tablet={5}
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
                name="edgeCutoff"
                className="NetworkSliderInput"
                value={edgeCutoff}
                onChange={this.props.onHandleNetworkCutoffInputChange}
              >
                <Popup
                  trigger={
                    <Label className="NetworkInputLabel" size={dynamicSize}>
                      EDGE
                      <span className="DisplayOnLarge"> SIMILARITY</span>
                      <br></br>
                      CUTOFF
                    </Label>
                  }
                  style={CustomPopupStyle}
                  // content="Edge weight threshold. Edges with values greater than this value are removed"
                  content="Only edges that have a similarity metric greater than or equal to the cutoff are displayed in the network below. The similarity metric is either the overlap coefficient, Jaccard index, or a mixture of the two, depending on the current settings."
                  inverted
                  basic
                  position="left center"
                />
                <input />
              </Input>
              <div className="NetworkSliderAndTotalsDiv">
                <Slider
                  disabled={!networkGraphReady}
                  className="NetworkSlider"
                  inverted={false}
                  name="edgeCutoffSlider"
                  value={edgeCutoff}
                  settings={{
                    start: edgeCutoff,
                    min: 0.05,
                    max: 1,
                    step: 0.025,
                    onChange: value => {
                      this.props.onHandleSliderChange('edgeCutoff', value);
                    }
                  }}
                />
                <span
                  className={networkGraphReady ? 'Show NodeEdgeTotals' : 'Hide'}
                >
                  <Popup
                    trigger={
                      <Label size={dynamicSize}>
                        {filteredEdgesTotal} of {totalEdges} Edges
                      </Label>
                    }
                    style={CustomPopupStyle}
                    content="Number of edges meeting current filter requirements, of total edges without filters"
                    inverted
                    position="left center"
                  />
                </span>
              </div>
            </Grid.Column>
            <Grid.Column
              className="NetworkGraphFilters"
              id="NetworkGraphSortByDiv"
              mobile={16}
              tablet={6}
              largeScreen={3}
              widescreen={3}
            >
              <Menu id="NetworkGraphSortByMenu" secondary size={dynamicSize}>
                <Label className="NetworkInputLabel" size={dynamicSize}>
                  SORT
                  <br></br>
                  BY
                </Label>
                <Dropdown
                  item
                  size={dynamicSize}
                  text={getItemName(networkSortBy[0])}
                >
                  <Dropdown.Menu>
                    <SortableContainer
                      onSortEnd={this.onSortEnd}
                      helperClass="SortableHelper"
                    >
                      {networkSortBy.map((value, index) => (
                        <SortableItem
                          disabled={!networkGraphReady}
                          key={`item-${value}`}
                          index={index}
                          sortIndex={index}
                          value={value}
                          className="SortableItem NoSelect"
                        />
                      ))}
                    </SortableContainer>
                  </Dropdown.Menu>
                </Dropdown>
              </Menu>
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
                    className={networkGraphReady ? 'Show' : 'Hide'}
                    size={dynamicSize}
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
            {/* <Grid.Column
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
            </Grid.Column> */}
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
