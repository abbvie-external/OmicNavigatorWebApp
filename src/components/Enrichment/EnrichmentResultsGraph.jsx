import React, { Component } from 'react';

import styled from 'styled-components';
import * as d3 from 'd3';
import _ from 'lodash';
import {
  Popup,
  Grid,
  Search,
  Radio,
  Label,
  Button,
  Icon,
  Dropdown,
  Menu,
  Segment,
} from 'semantic-ui-react';
import {
  sortableContainer,
  sortableElement,
  SortableHandle,
} from 'react-sortable-hoc';
import arrayMove from 'array-move';
import NumericInput from 'react-numeric-input';
import NetworkGraph from './NetworkGraph';
import ReactSlider from 'react-slider';
import LoaderActivePlots from '../Transitions/LoaderActivePlots';
import './EnrichmentResultsGraph.scss';
import NumericExponentialInput from '../Shared/NumericExponentialInput';

const StyledSlider = styled(ReactSlider)`
  width: 100%;
  height: 18px;
  cursor: pointer;
`;

const StyledThumb = styled.div`
  line-height: 63px;
  /* line-height: 32px; */
  text-align: center;
  cursor: grab !important;
  margin-top: -7px;
  top: 0px;
  left: 219px;
  height: 30px;
  width: 30px;
  border-radius: 100%;
  background-color: rgb(255, 255, 255);
  box-shadow: rgba(34, 36, 38, 0.15) 0px 1px 2px 0px,
    rgba(34, 36, 38, 0.15) 0px 0px 0px 1px inset;
  text-decoration: none;
  color: #e2e2e2;
`;

const NodeStyledTrack = styled.div`
  top: 0;
  bottom: 0;
  background: ${props =>
    props.index === 2
      ? '#2e2e2e'
      : props.index === 1
      ? '#ddd'
      : // : 'linear-gradient(90deg, var(--color-primary) -2.66%, var(--color-primary-gradient) 99.83%)'};
        'var(--color-primary)'};
  border-radius: 999px;
`;

const EdgeCutoffStyledTrack = styled.div`
  top: 0;
  bottom: 0;
  background: ${props =>
    props.index === 2
      ? '#fff'
      : props.index === 1
      ? 'var(--color-primary)'
      : // ? 'linear-gradient(90deg, var(--color-primary) -2.66%, var(--color-primary-gradient) 99.83%)'};
        '#ddd'};
  border-radius: 999px;
`;

const EdgeTypeStyledTrack = styled.div`
  top: 0;
  bottom: 0;
  background: ${props =>
    props.index === 2
      ? '#2e2e2e'
      : props.index === 1
      ? '#ddd'
      : 'var(--color-primary)'};
  /* : 'linear-gradient(90deg, var(--color-primary) -2.66%, var(--color-primary-gradient) 99.83%)'}; */
  border-radius: 999px;
`;

function getDynamicSize() {
  let w = Math.max(
    document.documentElement.clientWidth,
    window.innerWidth || 0,
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
    window.innerWidth || 0,
  );
  if (w < 768) {
    return {
      padding: '1em',
      width: '250px',
    };
  } else if (w > 767 && w < 1600) {
    return {
      padding: '1em',
      width: '300px',
    };
    // else if (w > 1599 && w < 2600) {
    //   return {
    //     padding: '1em',
    //     width: '450px'
    //   };
  } else
    return {
      padding: '1em',
      width: '350px',
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
    wordBreak: 'break-all',
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
  wordBreak: 'break-word',
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
            {getItemName(props.value)}
          </Label>
        }
        style={CustomPopupStyle}
        content={ItemTooltip}
        inverted
        position="left center"
        mouseEnterDelay={1000}
        mouseLeaveDelay={0}
      />
    </li>
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
    networkSortBy: ['significance', 'nodecount', 'edgecount'],
    nodeCutoffLocal: sessionStorage.getItem('nodeCutoff') || 0.1,
    edgeCutoffLocal: sessionStorage.getItem('edgeCutoff') || 0.4,
    edgeTypeLocal: sessionStorage.getItem('edgeType') || 0.5,
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
      showNetworkLabels: !prevState.showNetworkLabels,
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
        networkSearchValue,
      });
    }
    networkSearchValue = networkSearchValue.toLowerCase();

    this.setState({
      results: this.state.descriptions.filter(result =>
        result.description.toLowerCase().includes(networkSearchValue),
      ),
      networkSearchValue,
    });
  }, 500);

  setupSearch = () => {
    const networkDataNodeDescriptions = this.props.networkData.nodes.map(r => ({
      description: r.data.EnrichmentMap_GS_DESCR.toLowerCase(),
      genes: r.data.EnrichmentMap_Genes,
      size: r.data.EnrichmentMap_Genes.length,
    }));
    this.setState({
      descriptions: networkDataNodeDescriptions,
    });
  };

  onSortEnd = ({ oldIndex, newIndex }) => {
    this.removeNetworkSVG();
    this.setState(({ networkSortBy }) => ({
      networkSortBy: arrayMove(networkSortBy, oldIndex, newIndex),
    }));
  };

  removeNetworkSVG = () => {
    d3.select('div.tooltip-pieSlice').remove();
    d3.select('tooltipEdge').remove();
    d3.select(`#svg-${this.props.networkSettings.id}`).remove();
  };

  handleNodeCutoffInputChangeLocal = _.debounce(value => {
    this.setState({
      nodeCutoffLocal: value,
    });
    this.props.onHandleNodeCutoffInputChange(value);
  }, 1250);

  formatNodeCutoff = numString => {
    const num = Number(numString);
    const formattedNumber =
      num >= 0.001 || num === 0 ? num : num.toExponential();
    //.replace(/e\+?/, 'x 10^');
    return `${formattedNumber}`;
    // if we'd reather use x10 display
    // if (num >= 0.01) {
    //   return `${num}`;
    // } else {
    //   const n = Math.round(Math.log10(num));
    //   const m = (num * Math.pow(10, Math.abs(n))).toFixed(3);
    //   const formattedNumber = `${m}x 10${(<sup>n</sup>)}`;
    //   return formattedNumber;
    // }
  };

  // NODE CUTOFF
  nodeCutoffStep = component => {
    if (component.state.btnDownActive) {
      // direction down
      if (component.state.value <= 0.001) {
        return 0.0001;
      } else if (
        component.state.value > 0.001 &&
        component.state.value <= 0.01
      ) {
        return 0.001;
      } else return 0.01;
    } else {
      // direction up
      if (component.state.value < 0.001) {
        return 0.0001;
      } else if (
        component.state.value >= 0.001 &&
        component.state.value < 0.01
      ) {
        return 0.001;
      } else return 0.01;
    }
  };

  handleNodeCutoffSliderChange = value => {
    // let decimalValue = value >= 1 ? value / 100 : 0.01;
    let decimalValue = value / 100;
    this.setState({
      nodeCutoffLocal: decimalValue,
    });
    this.props.onHandleNodeCutoffSliderChange(decimalValue);
  };

  handleNodeCutoffSliderChangeLocal = value => {
    // let decimalValue = value >= 1 ? value / 100 : 0.01;
    let decimalValue = value / 100;
    this.setState({
      nodeCutoffLocal: decimalValue,
    });
  };

  // EDGE CUTOFF
  handleEdgeCutoffInputChangeLocal = _.debounce(value => {
    let revisedValue = value >= 0.05 ? value : 0.05;
    this.setState({
      edgeCutoffLocal: revisedValue,
    });
    this.props.onHandleEdgeCutoffInputChange(revisedValue);
  }, 1250);

  handleEdgeCutoffSliderChange = value => {
    let decimalValue = value >= 5 ? value / 100 : 0.05;
    this.setState({
      edgeCutoffLocal: decimalValue,
    });
    this.props.onHandleEdgeCutoffSliderChange(decimalValue);
  };

  handleEdgeCutoffSliderChangeLocal = value => {
    let decimalValue = value >= 5 ? value / 100 : 0.05;
    this.setState({
      edgeCutoffLocal: decimalValue,
    });
  };

  // EDGE TYPE
  handleEdgeTypeInputChangeLocal = _.debounce(value => {
    this.setState({
      edgeTypeLocal: value,
    });
    this.props.onHandleEdgeTypeInputChange(value);
  }, 500);

  handleEdgeTypeSliderChange = value => {
    let decimalValue = value / 100;
    this.setState({
      edgeTypeLocal: decimalValue,
    });
    this.props.onHandleEdgeTypeSliderChange(decimalValue);
  };

  handleEdgeTypeSliderChangeLocal = value => {
    let decimalValue = value / 100;
    this.setState({
      edgeTypeLocal: decimalValue,
    });
  };

  render() {
    const {
      results,
      networkSortBy,
      nodeCutoffLocal,
      edgeCutoffLocal,
      edgeTypeLocal,
    } = this.state;
    const {
      networkDataLoaded,
      networkGraphReady,
      activeIndexEnrichmentView,
      filteredNodesTotal,
      filteredEdgesTotal,
      totalNodes,
      totalEdges,
      legendIsOpen,
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

      const NodeThumb = (props, state) => (
        <StyledThumb {...props}>
          {/* <span className="ValueNowNode"> */}
          {/* {state.valueNow >= 1 ? state.valueNow / 100 : 0.01} */}
          {/* {(state.valueNow / 100).toFixed(3)} */}
          {/* </span> */}
        </StyledThumb>
      );
      const NodeTrack = (props, state) => (
        <NodeStyledTrack {...props} index={state.index} />
      );

      const EdgeCutoffThumb = (props, state) => (
        <StyledThumb {...props}></StyledThumb>
      );
      const EdgeCutoffTrack = (props, state) => (
        <EdgeCutoffStyledTrack {...props} index={state.index} />
      );

      const EdgeTypeThumb = (props, state) => (
        <StyledThumb {...props}>
          {/* <span className="ValueNowEdgeTypeJaccardNumber">
            {state.valueNow}%
          </span>
          <span className="ValueNowEdgeTypeOverlapNumber">
            {100 - state.valueNow}%
          </span> */}
          <span className="ValueNowEdgeTypeJaccardText">
            Jaccard
            {/* {state.valueNow <= 50 ? 'Jaccard' : ''} */}
          </span>
          <span className="ValueNowEdgeTypeOverlapText">
            {/* {state.valueNow >= 50 ? 'Overlap' : ''} */}
            Overlap
          </span>
        </StyledThumb>
      );
      const EdgeTypeTrack = (props, state) => (
        <EdgeTypeStyledTrack {...props} index={state.index} />
      );

      return (
        <Grid className="NetworkGraphFiltersContainer">
          <Grid.Row className="NetworkGraphFiltersRow">
            <Grid.Column
              className="NetworkGraphFilters"
              mobile={14}
              tablet={4}
              computer={4}
              largeScreen={2}
              widescreen={2}
            ></Grid.Column>
            <Grid.Column
              // className="NetworkGraphFilters"
              mobile={16}
              tablet={6}
              computer={6}
              largeScreen={2}
              widescreen={2}
            >
              <Search
                disabled={!networkGraphReady}
                // size={dynamicSize}
                size-="tiny"
                input={{ icon: 'search', iconPosition: 'left' }}
                id="NetworkSearchInput"
                placeholder="Search"
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
                // size={dynamicSize}
                size="small"
                label="Show Labels"
                checked={this.state.showNetworkLabels}
                onChange={this.handleLabels}
              />
            </Grid.Column>
            <Grid.Column
              className="NetworkGraphFilters"
              mobile={16}
              tablet={6}
              computer={6}
              largeScreen={3}
              widescreen={3}
              textAlign="center"
            >
              <div className="InlineFlex">
                <Popup
                  trigger={
                    <Label className="NetworkInputLabel" size={dynamicSize}>
                      NODE
                      {/* <span className="DisplayOnLarge"> SIGNIFICANCE</span> */}
                      <br></br>
                      CUTOFF
                    </Label>
                  }
                  style={CustomPopupStyle}
                  content="Nodes with statistics (typically p values or multiple testing adjusted versions of p values) greater than the cutoff value are removed. The statistic used is dependent on the currently chosen setting."
                  inverted
                  basic
                  position="left center"
                  mouseEnterDelay={1000}
                  mouseLeaveDelay={0}
                />
                {/* <NumericInput
                  value={nodeCutoffLocal}
                  onChange={this.handleNodeCutoffInputChangeLocal}
                  disabled={!networkGraphReady}
                  // precision={3}
                  size={dynamicSize}
                  format={this.formatNodeCutoff}
                  // step={0.001}
                  step={this.nodeCutoffStep}
                  min={0.0}
                  max={1}
                  id="NetworkSliderNodeInput"
                  className="NetworkSliderInput"
                  // onInvalid={this.}
                /> */}
                <NumericExponentialInput
                  onChange={num => {
                    console.log(num);
                  }}
                />
              </div>
              <div className="NetworkSliderDiv">
                <StyledSlider
                  renderTrack={NodeTrack}
                  renderThumb={NodeThumb}
                  disabled={!networkGraphReady}
                  className={
                    networkGraphReady
                      ? 'NetworkSlider Show'
                      : 'NetworkSlider Hide'
                  }
                  value={nodeCutoffLocal * 100}
                  name="nodeCutoffSlider"
                  min={0}
                  max={100}
                  // step={0.1}
                  onChange={this.handleNodeCutoffSliderChangeLocal}
                  onSliderClick={this.handleNodeCutoffSliderChange}
                  onAfterChange={this.handleNodeCutoffSliderChange}
                />
              </div>
            </Grid.Column>
            <Grid.Column
              className="NetworkGraphFilters"
              mobile={16}
              tablet={5}
              computer={5}
              largeScreen={3}
              widescreen={3}
              textAlign="center"
            >
              <div className="InlineFlex">
                <Popup
                  trigger={
                    <Label className="NetworkInputLabel" size={dynamicSize}>
                      EDGE
                      {/* <span className="DisplayOnLarge"> SIMILARITY</span> */}
                      <br></br>
                      CUTOFF
                    </Label>
                  }
                  style={CustomPopupStyle}
                  content="Edges with similarity metrics less than the cutoff are removed. The similarity metric is either the overlap coefficient, Jaccard index, or a mixture of the two, depending on the current settings."
                  inverted
                  basic
                  position="left center"
                  mouseEnterDelay={1000}
                  mouseLeaveDelay={0}
                />
                <NumericInput
                  value={edgeCutoffLocal}
                  onChange={this.handleEdgeCutoffInputChangeLocal}
                  disabled={!networkGraphReady}
                  precision={2}
                  size={dynamicSize}
                  step={0.01}
                  min={0.0}
                  max={1.0}
                  id="NetworkSliderNodeInput"
                  className="NetworkSliderInput"
                />
              </div>
              <div className="NetworkSliderDiv">
                <StyledSlider
                  renderTrack={EdgeCutoffTrack}
                  renderThumb={EdgeCutoffThumb}
                  disabled={!networkGraphReady}
                  className={
                    networkGraphReady
                      ? 'NetworkSlider Show'
                      : 'NetworkSlider Hide'
                  }
                  value={edgeCutoffLocal * 100}
                  name="edgeCutoffSlider"
                  min={0}
                  max={100}
                  // step={0.1}
                  onChange={this.handleEdgeCutoffSliderChangeLocal}
                  onSliderClick={this.handleEdgeCutoffSliderChange}
                  onAfterChange={this.handleEdgeCutoffSliderChange}
                />
              </div>
            </Grid.Column>
            <Grid.Column
              className="NetworkGraphFilters"
              mobile={16}
              tablet={5}
              computer={5}
              largeScreen={3}
              widescreen={3}
              textAlign="center"
            >
              {/* EDGE TYPE LABEL VERSION */}
              {/* <Grid className="EdgeTypeContainer">
                <Grid.Row columns={2} centered id="EdgeTypeRow">
                  <Grid.Column
                    id="EdgeTypeLabelColumn"
                    textAlign="right"
                    // width={5}
                  >
                    <Popup
                      trigger={
                        <Label
                          className="NetworkInputLabel"
                          id="EdgeTypeLabel"
                          size={dynamicSize}
                        >
                          EDGE
                          <br></br>
                          TYPE
                        </Label>
                      }
                      style={CustomPopupStyle}
                      content="TBD BRETT...Percent used for overlap coefficient and Jaccard index, respectfully."
                      inverted
                      basic
                      position="left center"
                      mouseEnterDelay={1000}
                      mouseLeaveDelay={0}
                    />
                  </Grid.Column>
                  <Grid.Column
                    id="EdgeTextContainer"
                    textAlign="left"
                    // width={11}
                  >
                    <Label circular size="small" color="" id="JaccardPercent">
                      {Math.round(edgeTypeLocal * 100)} %
                    </Label>
                    <span id="JaccardText" className="EdgeTypeText">
                      Jaccard
                    </span>
                    <br></br>
                    <span id="OverlapText" className="EdgeTypeText">
                      Overlap
                    </span>
                    <Label circular size="small" id="OverlapPercent">
                      {Math.round(100 - edgeTypeLocal * 100)} %
                    </Label>
                  </Grid.Column>
                </Grid.Row>
              </Grid> */}

              {/* INPUT VERSION */}
              <div className="InlineFlex">
                <Popup
                  trigger={
                    <Label className="NetworkInputLabel" size={dynamicSize}>
                      EDGE
                      <br></br>
                      TYPE
                    </Label>
                  }
                  style={CustomPopupStyle}
                  content="TBD BRETT...Percent used for overlap coefficient and Jaccard index, respectfully."
                  inverted
                  basic
                  position="left center"
                  mouseEnterDelay={1000}
                  mouseLeaveDelay={0}
                />
                <NumericInput
                  value={edgeTypeLocal}
                  onChange={this.handleEdgeTypeInputChangeLocal}
                  disabled={!networkGraphReady}
                  precision={2}
                  size={dynamicSize}
                  step={0.01}
                  min={0.0}
                  max={1.0}
                  id="NetworkSliderNodeInput"
                  className="NetworkSliderInput"
                />
              </div>
              <div className="NetworkSliderDiv" id="NetworkSliderDivEdgeType">
                <StyledSlider
                  renderTrack={EdgeTypeTrack}
                  renderThumb={EdgeTypeThumb}
                  disabled={!networkGraphReady}
                  className={
                    networkGraphReady
                      ? 'NetworkSlider Show'
                      : 'NetworkSlider Hide'
                  }
                  value={edgeTypeLocal * 100}
                  name="edgeTypeSlider"
                  min={0}
                  max={100}
                  // step={0.1}
                  onChange={this.handleEdgeTypeSliderChangeLocal}
                  onSliderClick={this.handleEdgeTypeSliderChange}
                  onAfterChange={this.handleEdgeTypeSliderChange}
                />
              </div>
            </Grid.Column>
            <Grid.Column
              className="NetworkGraphFilters"
              id="NetworkGraphSortByDiv"
              mobile={16}
              tablet={6}
              computer={6}
              largeScreen={3}
              widescreen={3}
              textAlign="center"
            >
              <Menu
                id="NetworkGraphSortByMenu"
                // className={networkGraphReady ? 'ShowInlineBlock' : 'Hide'}
                // secondary
                size={dynamicSize}
              >
                <Popup
                  trigger={
                    <Label className="NetworkInputLabel" size={dynamicSize}>
                      SORT
                      <br></br>
                      BY
                    </Label>
                  }
                  style={CustomPopupStyle}
                  content="Drag and drop list determines the order in which clusters of nodes will be sorted, left to right."
                  inverted
                  basic
                  position="left center"
                  mouseEnterDelay={1000}
                  mouseLeaveDelay={0}
                />
                <Dropdown
                  item
                  size={dynamicSize}
                  disabled={!networkGraphReady}
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
              computer={8}
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
                    className={networkGraphReady ? 'ShowInlineBlock' : 'Hide'}
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
                //   && networkGraphReady) ? 'ShowInlineBlock' : 'Hide'}
              >
                <Popup.Content className="legend"></Popup.Content>
              </Popup>
            </Grid.Column>
            <Grid.Column
              id="TotalsColumn"
              mobile={8}
              tablet={8}
              computer={8}
              largeScreen={8}
              widescreen={8}
            >
              <div
                className={
                  networkGraphReady ? 'ShowInlineBlock NodeEdgeTotals' : 'Hide'
                }
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
                  mouseEnterDelay={1000}
                  mouseLeaveDelay={0}
                />
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
                  mouseEnterDelay={1000}
                  mouseLeaveDelay={0}
                />
              </div>
            </Grid.Column>
            <Grid.Column
              className=""
              mobile={16}
              tablet={16}
              computer={16}
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
