import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Icon, Popup, Grid, Search, Radio } from 'semantic-ui-react';
// import ButtonActions from './ButtonActions';
import SplitPanesContainer from './SplitPanesContainer';
import NetworkGraphTree from './NetworkGraphTree';
import SearchingAlt from '../Transitions/SearchingAlt';
import './EnrichmentResultsGraph.scss';
import * as d3 from 'd3';
// import _ from 'lodash';

class EnrichmentResultsGraph extends Component {
  // static defaultProps = {
  //   enrichmentStudy: '',
  //   enrichmentModel: '',
  //   enrichmentAnnotation: '',
  //   enrichmentResults: [],
  //   enrichmentColumns: [],
  //   isTestSelected: false,
  //   showNetworkLabels: true
  // };

  state = {
    treeDataRaw: [],
    treeData: [],
    treeDataColumns: [],
    plotType: [],
    imageInfo: {
      key: null,
      title: '',
      svg: []
    },
    currentSVGs: [],
    isTestDataLoaded: false
  };

  componentDidMount() {}

  // componentWillUnmount() {
  //   d3.select("#svg-chart-network").remove();
  // }

  showBarcodePlot = (dataItem, barcode, test, largest) => {
    // this.bData = barcode;
    // this.bSettings = {
    //   lineID: "",
    //   statLabel: barcode[0].statLabel,
    //   statistic: 'statistic',
    //   highLabel: barcode[0].highLabel,
    //   lowLabel: barcode[0].lowLabel,
    //   highStat: largest,
    //   enableBrush: true
    // }
    this.setState({
      isTestDataLoaded: true
    });
  };

  testSelectedTransition = () => {
    this.setState({
      isTestSelected: true
    });
  };

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
    debugger;
  };

  render() {
    // const {
    //   enrichmentResults,
    //   enrichmentColumns,
    //   enrichmentStudy,
    //   enrichmentModel,
    //   enrichmentAnnotation
    // } = this.props;

    const enrichmentViewToggle = this.getEnrichmentViewToggle();

    if (!this.state.isTestSelected) {
      return (
        <div className="NetworkGraphWrapper">
          {enrichmentViewToggle}
          <Grid>
            <Grid.Row>
              <Grid.Column
                className="NetworkGraphFilters"
                mobile={6}
                tablet={6}
                largeScreen={3}
                widescreen={2}
              ></Grid.Column>
              <Grid.Column
                className="NetworkGraphFilters"
                mobile={6}
                tablet={6}
                largeScreen={4}
                widescreen={4}
              >
                <Search
                  placeholder="Search Network"
                  // loading={isLoading}
                  // onResultSelect={this.handleResultSelect}
                  // onSearchChange={_.debounce(this.handleSearchChange, 500, {
                  //   leading: true,
                  // })}
                  // results={results}
                  // value={value}
                  // {...this.props}
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
          </Grid>{' '}
          <NetworkGraphTree
            {...this.props}
            {...this.state}
            onPieClick={this.handlePieClick}
          ></NetworkGraphTree>
        </div>
      );
    } else if (this.state.isTestSelected && !this.state.isTestDataLoaded) {
      return (
        <div>
          <SearchingAlt />
        </div>
      );
    } else {
      return (
        <div>
          <SplitPanesContainer
            {...this.props}
            {...this.state}
            onBackToTable={this.backToTable}
            onHandleMaxLinePlot={this.handleMaxLinePlot}
            onHandleBarcodeChanges={this.handleBarcodeChanges}
          ></SplitPanesContainer>
        </div>
      );
    }
  }
}

export default withRouter(EnrichmentResultsGraph);

function getDataItemDescription(value) {
  if (value) {
    const dataItem = value.split(':')[1];
    return dataItem;
  }
}

function getTestName(value) {
  if (value) {
    const test = value.split(':')[0];
    return test;
  }
}
