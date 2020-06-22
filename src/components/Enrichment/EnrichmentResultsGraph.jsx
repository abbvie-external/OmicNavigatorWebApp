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
} from 'semantic-ui-react';
import {
  sortableContainer,
  sortableElement,
  SortableHandle,
} from 'react-sortable-hoc';
import arrayMove from 'array-move';
import NetworkGraph from './NetworkGraph';
import ReactSlider from 'react-slider';
import LoaderActivePlots from '../Transitions/LoaderActivePlots';
import './EnrichmentResultsGraph.scss';
import NumericExponentialInput from '../Shared/NumericExponentialInput';
// import { limitValues } from '../Shared/helpers';
import { ResizableBox } from 'react-resizable';
import '../Shared/ReactResizable.css';

const StyledSlider = styled(ReactSlider)`
  width: 100%;
  height: 18px;
  cursor: pointer;
`;

const StyledThumb = styled.div`
  /* line-height: 63px; */
  line-height: 32px;
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

const LinkCutoffStyledTrack = styled.div`
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

const LinkTypeStyledTrack = styled.div`
  top: 0;
  bottom: 0;
  background: ${props =>
    props.index === 2
      ? '#2e2e2e'
      : props.index === 1
      ? '#ddd'
      : // : 'var(--color-light)'};
        'var(--color-primary)'};
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

function getDynamicSearch() {
  let w = Math.max(
    document.documentElement.clientWidth,
    window.innerWidth || 0,
  );
  if (w < 1200) {
    return 'small';
  } else if (w > 1199 && w < 1600) {
    return 'small';
  } else if (w > 1599 && w < 2000) {
    return undefined;
  } else if (w > 1999 && w < 2600) {
    return 'large';
  } else if (w > 2599) return 'big';
}

function getDynamicLegend() {
  let w = Math.max(
    document.documentElement.clientWidth,
    window.innerWidth || 0,
  );
  if (w < 768) {
    return 250;
  } else if (w > 767 && w < 1600) {
    return 300;
    // else if (w > 1599 && w < 2600) { return 450
  } else return 350;
}

const resultRenderer = ({ description, genes, size }) => {
  // let genesFormatted = limitValues(genes, 15);
  // const SearchValuePopupStyle = {
  //   backgroundColor: '2E2E2E',
  //   borderBottom: '2px solid var(--color-primary)',
  //   color: '#FFF',
  //   padding: '1em',
  //   maxWidth: '25vw',
  //   fontSize: '13px',
  //   wordBreak: 'break-all',
  // };
  // let dynamicSize = getDynamicSize();
  return (
    <Grid className="NetworkSearchResultsContainer">
      <Grid.Column width={12}>
        <Label
        // size={dynamicSize}
        >
          {description}
        </Label>
      </Grid.Column>
      <Grid.Column width={4}>
        <Label circular color="blue" key={description}>
          {size}
        </Label>
        {/* <Popup
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
        </Popup> */}
      </Grid.Column>
    </Grid>

    // ALTERNATE VERSION
    // <div className="NetworkSearchResultsContainer">
    //   <Popup
    //     basic
    //     style={SearchValuePopupStyle}
    //     inverted
    //     // position="bottom left"
    //     trigger={
    //       <Label
    //         color="blue"
    //         // size={dynamicSize}
    //       >
    //         {description}
    //         <Label.Detail key={description}>{size}</Label.Detail>
    //       </Label>
    //     }
    //   >
    //     {genesFormatted}
    //   </Popup>
    // </div>
  );
};
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
  } else if (val === 'linkcount') {
    return 'Link Count';
  }
};

const DragHandle = SortableHandle(() => <Icon name="bars" />);
const SortableItem = sortableElement(props => {
  const ItemTooltip = function() {
    if (props.value === 'significance') {
      return 'Sort clusters by chosen significance metric';
    } else if (props.value === 'nodecount') {
      return 'Sort clusters by number of nodes per cluster';
    } else if (props.value === 'linkcount') {
      return 'Sort clusters by number of links per cluster';
    }
  };

  let dynamicSize = getDynamicSize();

  return (
    <li className="NetworkGraphSortableList">
      <Popup
        trigger={
          <Label
            className="NetworkGraphSortableListLabel"
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
    networkSearchResults: [],
    networkSearchLoading: false,
    networkSearchValue: '',
    descriptions: [],
    networkSortBy: ['significance', 'nodecount', 'linkcount'],
    nodeCutoffLocal: sessionStorage.getItem('nodeCutoff') || 0.1,
    linkCutoffLocal: sessionStorage.getItem('linkCutoff') || 0.4,
    linkTypeLocal: sessionStorage.getItem('linkType') || 0.5,
    legendHeight:
      parseInt(sessionStorage.getItem('legendHeight'), 10) ||
      getDynamicLegend(),
    legendWidth:
      parseInt(sessionStorage.getItem('legendWidth'), 10) || getDynamicLegend(),
  };

  componentDidMount() {
    if (!this.props.networkGraphReady) {
      d3.select('div.tooltip-pieSlice').remove();
      d3.select('tooltipLink').remove();
      d3.select(`#svg-${this.props.networkSettings.id}`).remove();
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      this.props.networkGraphReady !== prevProps.networkGraphReady ||
      this.props.networkData !== prevProps.networkData
    ) {
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
    const value = result.description;
    this.setState({ networkSearchValue: value });
    this.handleSearchChange(e, { value });
  };

  handleSearchChange = (e, { value }) => {
    if (value.length < 1) {
      return this.setState({
        networkSearchResults: [],
        networkSearchValue: '',
        networkSearchLoading: false,
      });
    } else {
      this.setState({
        networkSearchLoading: true,
      });
      const valueLowercase = value?.toLowerCase();
      this.setState({
        networkSearchResults: this.state.descriptions.filter(result =>
          result.description?.toLowerCase().includes(valueLowercase),
        ),
        networkSearchValue: valueLowercase,
        networkSearchLoading: false,
      });
    }
  };

  setupNetworkSearch = filteredNodes => {
    const networkDataNodeDescriptions = filteredNodes.map(r => ({
      description: r.description?.toLowerCase(),
      // genes: r.EnrichmentMap_Genes,
      size: r.geneSetSize,
    }));
    this.setState({
      descriptions: networkDataNodeDescriptions,
    });
  };

  onSortEnd = ({ oldIndex, newIndex }) => {
    this.setState(({ networkSortBy }) => ({
      networkSortBy: arrayMove(networkSortBy, oldIndex, newIndex),
    }));
  };

  // NODE CUTOFF
  handleNodeCutoffInputChange = value => {
    this.setState({
      nodeCutoffLocal: value,
    });
  };

  actuallyHandleNodeCutoffInputChange = _.debounce(value => {
    if (!this.props.multisetFiltersVisible) {
      this.props.onHandleNodeCutoffInputChange(value);
    }
  }, 1250);

  actuallyHandleNodeCutoffSliderChange = value => {
    if (!this.props.multisetFiltersVisible) {
      let decimalValue = value / 100;
      this.props.onHandleNodeCutoffSliderChange(decimalValue);
    }
  };

  handleNodeCutoffSliderChange = value => {
    let decimalValue = value / 100;
    this.setState({
      nodeCutoffLocal: decimalValue,
    });
  };

  // LINK CUTOFF
  handleLinkCutoffInputChange = value => {
    this.setState({
      linkCutoffLocal: value,
    });
  };

  actuallyHandleLinkCutoffInputChange = _.debounce(value => {
    this.props.onHandleLinkCutoffInputChange(value);
  }, 1250);

  actuallyHandleLinkCutoffSliderChange = value => {
    let decimalValue = value >= 5 ? value / 100 : 0.05;
    this.props.onHandleLinkCutoffSliderChange(decimalValue);
  };

  handleLinkCutoffSliderChange = value => {
    let decimalValue = value >= 5 ? value / 100 : 0.05;
    this.setState({
      linkCutoffLocal: decimalValue,
    });
  };

  // LINK TYPE
  actuallyHandleLinkTypeSliderChange = value => {
    let decimalValue = value / 100;
    this.props.onHandleLinkTypeSliderChange(decimalValue);
  };

  handleLinkTypeSliderChange = value => {
    let decimalValue = value / 100;
    this.setState({
      linkTypeLocal: decimalValue,
    });
  };

  onResizeLegend = (event, { element, size, handle }) => {
    this.setState({ legendWidth: size.width, legendHeight: size.height });
  };

  onResizeLegendStop = (event, { element, size, handle }) => {
    sessionStorage.setItem(`legendWidth`, size.width);
    sessionStorage.setItem(`legendHeight`, size.height);
  };

  render() {
    const {
      networkSearchResults,
      networkSearchLoading,
      networkSearchValue,
      networkSortBy,
      nodeCutoffLocal,
      linkCutoffLocal,
      linkTypeLocal,
    } = this.state;
    const {
      networkDataLoaded,
      networkGraphReady,
      activeIndexEnrichmentView,
      filteredNodesTotal,
      filteredLinksTotal,
      totalNodes,
      totalLinks,
      legendIsOpen,
      multisetFiltersVisible,
      networkSigValue,
    } = this.props;

    if (!networkDataLoaded) {
      return (
        <div className="LoaderActivePlotsNetwork">
          <LoaderActivePlots />
        </div>
      );
    } else {
      const dynamicSize = getDynamicSize();
      const dynamicSearchSize = getDynamicSearch();

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

      const LinkCutoffThumb = (props, state) => (
        <StyledThumb {...props}></StyledThumb>
      );
      const LinkCutoffTrack = (props, state) => (
        <LinkCutoffStyledTrack {...props} index={state.index} />
      );

      const LinkTypeThumb = (props, state) => (
        <StyledThumb {...props}>
          {/* <span className="ValueNowLinkTypeJaccardNumber">
            {state.valueNow}%
          </span>
          <span className="ValueNowLinkTypeOverlapNumber">
            {100 - state.valueNow}%
          </span> */}
          {/* <span className="ValueNowLinkTypeJaccardText">
            Jaccard
            {state.valueNow <= 50 ? 'Jaccard' : ''}
          </span>
          <span className="ValueNowLinkTypeOverlapText">
            {state.valueNow >= 50 ? 'Overlap' : ''}
            Overlap
          </span> */}
        </StyledThumb>
      );
      const LinkTypeTrack = (props, state) => (
        <LinkTypeStyledTrack {...props} index={state.index} />
      );

      return (
        <Grid className="NetworkGraphFiltersContainer">
          <Grid.Row className="NetworkGraphFiltersRow">
            <Grid.Column
              className="NetworkGraphFilters"
              mobile={6}
              tablet={5}
              computer={10}
              largeScreen={2}
              widescreen={2}
            ></Grid.Column>
            <Grid.Column
              id="NetworkSearchInputColumn"
              mobile={10}
              tablet={5}
              computer={6}
              largeScreen={2}
              widescreen={2}
            >
              <Search
                disabled={!networkGraphReady}
                size={dynamicSearchSize}
                input={{ icon: 'search', iconPosition: 'left' }}
                id="NetworkSearchInput"
                placeholder="Search"
                onResultSelect={this.handleResultSelect}
                onSearchChange={this.handleSearchChange}
                onFocus={this.handleSearchChange}
                results={networkSearchResults}
                loading={networkSearchLoading}
                value={networkSearchValue}
                resultRenderer={resultRenderer}
                spellCheck="false"
              />
            </Grid.Column>
            <Grid.Column
              className="NetworkGraphFilters"
              mobile={8}
              tablet={6}
              computer={4}
              largeScreen={3}
              widescreen={3}
              textAlign="center"
            >
              <div
                // className={
                //   multisetFiltersVisible
                //     ? 'InlineFlex NumericExponentialInputContainer Hide'
                //     : 'InlineFlex NumericExponentialInputContainer Show'
                // }
                className="InlineFlex NumericExponentialInputContainer"
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
                  content="Nodes with statistics (typically p values or multiple testing adjusted versions of p values) greater than the cutoff value are removed. The statistic used is dependent on the currently chosen setting."
                  inverted
                  basic
                  position="left center"
                  mouseEnterDelay={1000}
                  mouseLeaveDelay={0}
                />
                <NumericExponentialInput
                  onChange={number => {
                    this.handleNodeCutoffInputChange(number);
                    this.actuallyHandleNodeCutoffInputChange(number);
                  }}
                  min={0}
                  max={1}
                  defaultValue={parseFloat(nodeCutoffLocal)}
                  disabled={!networkGraphReady || multisetFiltersVisible}
                  value={
                    !multisetFiltersVisible
                      ? parseFloat(nodeCutoffLocal)
                      : parseFloat(networkSigValue)
                  }
                  spellcheck="false"
                />
              </div>
              <div
                // className={
                //   multisetFiltersVisible
                //     ? 'NetworkSliderDiv Hide'
                //     : 'NetworkSliderDiv Show'
                // }
                className="NetworkSliderDiv"
              >
                <StyledSlider
                  renderTrack={NodeTrack}
                  renderThumb={NodeThumb}
                  disabled={!networkGraphReady || multisetFiltersVisible}
                  className={
                    networkGraphReady
                      ? 'NetworkSlider Show'
                      : 'NetworkSlider Hide'
                  }
                  value={
                    !multisetFiltersVisible
                      ? nodeCutoffLocal * 100
                      : networkSigValue * 100
                  }
                  name="nodeCutoffSlider"
                  min={0}
                  max={100}
                  onChange={this.handleNodeCutoffSliderChange}
                  onSliderClick={this.actuallyHandleNodeCutoffSliderChange}
                  onAfterChange={this.actuallyHandleNodeCutoffSliderChange}
                />
              </div>
            </Grid.Column>
            <Grid.Column
              className="NetworkGraphFilters"
              mobile={8}
              tablet={5}
              computer={4}
              largeScreen={3}
              widescreen={3}
              textAlign="center"
            >
              <div className="InlineFlex NumericExponentialInputContainer">
                <Popup
                  trigger={
                    <Label className="NetworkInputLabel" size={dynamicSize}>
                      LINK
                      <span className="DisplayOnLarge"> SIMILARITY</span>
                      <br></br>
                      CUTOFF
                    </Label>
                  }
                  style={CustomPopupStyle}
                  content="Links with similarity metrics less than the cutoff are removed. The similarity metric is either the overlap coefficient, Jaccard index, or a mixture of the two, depending on the current settings."
                  inverted
                  basic
                  position="left center"
                  mouseEnterDelay={1000}
                  mouseLeaveDelay={0}
                />
                <NumericExponentialInput
                  onChange={number => {
                    let revisedNumber = number >= 0.1 ? number : 0.1;
                    this.handleLinkCutoffInputChange(revisedNumber);
                    this.actuallyHandleLinkCutoffInputChange(revisedNumber);
                  }}
                  min={0.1}
                  max={1}
                  defaultValue={parseFloat(linkCutoffLocal)}
                  disabled={!networkGraphReady}
                  value={parseFloat(linkCutoffLocal)}
                  spellcheck="false"
                />
              </div>
              <div className="NetworkSliderDiv">
                <StyledSlider
                  renderTrack={LinkCutoffTrack}
                  renderThumb={LinkCutoffThumb}
                  disabled={!networkGraphReady}
                  className={
                    networkGraphReady
                      ? 'NetworkSlider Show'
                      : 'NetworkSlider Hide'
                  }
                  value={linkCutoffLocal * 100}
                  name="linkCutoffSlider"
                  min={10}
                  max={100}
                  onChange={this.handleLinkCutoffSliderChange}
                  onSliderClick={this.actuallyHandleLinkCutoffSliderChange}
                  onAfterChange={this.actuallyHandleLinkCutoffSliderChange}
                />
              </div>
            </Grid.Column>

            <Grid.Column
              className="NetworkGraphFilters"
              mobile={8}
              tablet={5}
              computer={4}
              largeScreen={3}
              widescreen={3}
              textAlign="center"
            >
              <Grid className="LinkTypeContainer">
                <Grid.Row columns={2} centered id="LinkTypeRow">
                  <Grid.Column id="LinkTypeLabelColumn" textAlign="right">
                    <Popup
                      trigger={
                        <Label
                          className="NetworkInputLabel"
                          id="LinkTypeLabel"
                          size={dynamicSize}
                        >
                          LINK
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
                  <Grid.Column id="LinkTextContainer" textAlign="left">
                    <Label circular size={dynamicSize} id="JaccardPercent">
                      {Math.round(linkTypeLocal * 100)} %
                    </Label>
                    <span id="JaccardText" className="LinkTypeText">
                      Jaccard
                    </span>
                    <br></br>
                    <span id="OverlapText" className="LinkTypeText">
                      Overlap
                    </span>
                    <Label circular size={dynamicSize} id="OverlapPercent">
                      {Math.round(100 - linkTypeLocal * 100)} %
                    </Label>
                  </Grid.Column>
                </Grid.Row>
                <Grid.Row
                  className="NetworkSliderDiv"
                  id="NetworkSliderDivLinkType"
                >
                  <StyledSlider
                    renderTrack={LinkTypeTrack}
                    renderThumb={LinkTypeThumb}
                    disabled={!networkGraphReady}
                    className={
                      networkGraphReady
                        ? 'NetworkSlider Show'
                        : 'NetworkSlider Hide'
                    }
                    value={linkTypeLocal * 100}
                    name="linkTypeSlider"
                    min={0}
                    max={100}
                    onChange={this.handleLinkTypeSliderChange}
                    onSliderClick={this.actuallyHandleLinkTypeSliderChange}
                    onAfterChange={this.actuallyHandleLinkTypeSliderChange}
                  />
                </Grid.Row>
              </Grid>
            </Grid.Column>
            <Grid.Column
              className="NetworkGraphFilters"
              id="NetworkGraphSortByDiv"
              mobile={8}
              tablet={6}
              computer={4}
              largeScreen={3}
              widescreen={3}
              textAlign="center"
            >
              <Menu id="NetworkGraphSortByMenu" size={dynamicSize}>
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
              mobile={16}
              tablet={9}
              computer={9}
              largeScreen={9}
              widescreen={9}
            >
              <Popup
                trigger={
                  <Button
                    disabled={!networkGraphReady}
                    icon
                    labelPosition="left"
                    className={
                      networkGraphReady
                        ? 'ShowInlineBlock LegendButton'
                        : 'Hide'
                    }
                    size="mini"
                  >
                    Legend
                    <Icon name="info" />
                  </Button>
                }
                id="LegendPopup"
                open={openLegend}
                onClose={this.props.onHandleLegendClose}
                onOpen={this.props.onHandleLegendOpen}
                content={
                  <ResizableBox
                    className="box"
                    minConstraints={[250, 250]}
                    maxConstraints={[750, 750]}
                    height={this.state.legendHeight}
                    width={this.state.legendWidth}
                    lockAspectRatio={true}
                    handle={
                      <span className="custom-handle custom-handle-se">
                        <Icon name="resize horizontal" size="large"></Icon>
                      </span>
                    }
                    handleSize={[50, 50]}
                    resizeHandles={['se']}
                    onResize={this.onResizeLegend}
                    onResizeStop={this.onResizeLegendStop}
                  >
                    <span className="legend"></span>
                  </ResizableBox>
                }
                on="click"
                basic
                flowing
              />
              <Radio
                disabled={!networkGraphReady}
                className={networkGraphReady ? 'RadioLabelsDisplay' : 'Hide'}
                toggle
                // size={dynamicSize}
                size="small"
                label="Show Labels"
                checked={this.state.showNetworkLabels}
                onChange={this.handleLabels}
              />
            </Grid.Column>
            <Grid.Column
              id="TotalsColumn"
              mobile={16}
              tablet={7}
              computer={7}
              largeScreen={7}
              widescreen={7}
            >
              <div
                className={
                  networkGraphReady ? 'ShowInlineBlock NodeLinkTotals' : 'Hide'
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
                      {filteredLinksTotal} of {totalLinks} Links
                    </Label>
                  }
                  style={CustomPopupStyle}
                  content="Number of links meeting current filter requirements, of total links without filters"
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
              <NetworkGraph
                {...this.props}
                {...this.state}
                onInformFilteredNetworkData={this.setupNetworkSearch}
              ></NetworkGraph>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      );
    }
  }
}

export default EnrichmentResultsGraph;
