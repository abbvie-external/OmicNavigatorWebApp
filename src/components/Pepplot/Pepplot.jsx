import React, { Component } from 'react';
import { Grid, Popup, Sidebar } from 'semantic-ui-react';
import { withRouter } from 'react-router-dom';
import PepplotSearchCriteria from './PepplotSearchCriteria';
import PepplotResults from './PepplotResults';
import TransitionActive from '../Transitions/TransitionActive';
import TransitionStill from '../Transitions/TransitionStill';
import ButtonActions from '../Shared/ButtonActions';
import { formatNumberForDisplay, splitValue } from '../Shared/helpers';
import phosphosite_icon from '../../resources/phosphosite.ico';

import _ from 'lodash';
import './Pepplot.scss';
import '../Shared/Table.scss';

class Pepplot extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isValidSearchPepplot: false,
      isSearching: false,
      showProteinPage: false,
      pepplotResults: [],
      pepplotColumns: [],
      multisetPlotInfo: {
        title: '',
        svg: []
      },
      multisetPlotAvailable: false,
      animation: 'uncover',
      direction: 'left',
      visible: false,
      plotButtonActive: false,
      excelVisible: false,
      pngVisible: true,
      pdfVisible: false,
      svgVisible: true,
      multisetQueried: false
    };
  }

  componentDidMount() {}

  componentDidUpdate = (prevProps, prevState) => {
    // if (this.props.proteinToHighlight !== "" && this.props.proteinToHighlight !== undefined) {
    //   this.handlePepplotSearch(this.state.pepplotResults);
    // }
    //   if (prevProps.proteinToHighlightInDiffTable !== "" && prevProps.proteinToHighlightInDiffTable !== undefined) {
    //   this.handlePepplotSearch(this.state.pepplotResults);
    // }
    // if (this.props.proteinToHighlightInDiffTable !== prevProps.proteinToHighlightInDiffTable) {
    //   this.handlePepplotSearch(this.state.pepplotResults);
    // }
  };

  handleSearchTransition = bool => {
    this.setState({
      isSearching: bool
    });
  };

  handleMultisetQueried = value => {
    this.setState({
      multisetQueried: value
    });
  };

  handlePepplotSearch = searchResults => {
    const columns = this.getConfigCols(searchResults);
    this.setState({
      pepplotResults: searchResults.pepplotResults,
      pepplotColumns: columns,
      isSearching: false,
      isValidSearchPepplot: true,
      showProteinPage: false,
      plotButtonActive: false,
      visible: false
    });
  };

  handleSearchCriteriaChange = (changes, scChange) => {
    this.props.onSearchCriteriaToTop(changes, 'pepplot');
    this.setState({
      visible: false,
      plotButtonActive: false
    });
    if (scChange) {
      this.setState({
        multisetPlotAvailable: false
      });
    }
  };

  disablePlot = () => {
    this.setState({
      multisetPlotAvailable: false
    });
  };

  hidePGrid = () => {
    this.setState({
      isValidSearchPepplot: false,
      multisetPlotAvailable: false,
      plotButtonActive: false,
      visible: false
    });
  };

  handlePlotAnimation = animation => () => {
    this.setState(prevState => ({
      animation,
      visible: !prevState.visible,
      plotButtonActive: !this.state.plotButtonActive
    }));
  };

  handleDirectionChange = direction => () =>
    this.setState({ direction: direction, visible: false });

  handleMultisetPlot = multisetPlotResults => {
    this.setState({
      multisetPlotInfo: {
        title: multisetPlotResults.svgInfo.plotType,
        svg: multisetPlotResults.svgInfo.svg
      },
      multisetPlotAvailable: true
    });
  };

  // highlightRef = (value, toHighlight) => {
  //   if (value) {
  //     if (value === toHighlight) {
  //       return this.highlightedRowRef
  //     } else return '';
  //   }
  // }

  getConfigCols = testData => {
    const pepResults = testData.pepplotResults;
    const model = testData.model;
    let initConfigCols = [];

    const TableValuePopupStyle = {
      backgroundColor: '2E2E2E',
      borderBottom: '2px solid #FF4400',
      color: '#FFF',
      padding: '1em',
      maxWidth: '50vw',
      fontSize: '13px',
      wordBreak: 'break-all'
    };

    let icon = phosphosite_icon;
    let iconText = 'PhosphoSitePlus';

    if (model === 'Differential Expression') {
      initConfigCols = [
        {
          title: 'MajorityProteinIDsHGNC',
          field: 'MajorityProteinIDsHGNC',
          filterable: { type: 'alphanumericFilter' },
          template: (value, item, addParams) => {
            return (
              <div>
                {/* ref={this.highlightRef()}> */}
                <Popup
                  trigger={
                    <span
                      className="TableCellLink"
                      onClick={addParams.showPlot(model, item)}
                    >
                      {splitValue(value)}
                    </span>
                  }
                  content={value}
                  style={TableValuePopupStyle}
                  className="TablePopupValue"
                  inverted
                  basic
                />
                <Popup
                  trigger={
                    <img
                      src={icon}
                      alt="Phosophosite"
                      className="ExternalSiteIcon"
                      onClick={addParams.showPhosphositePlus(item)}
                    />
                  }
                  style={TableValuePopupStyle}
                  className="TablePopupValue"
                  content={iconText}
                  inverted
                  basic
                />
              </div>
            );
          }
        },
        {
          title: 'MajorityProteinIDs',
          field: 'MajorityProteinIDs',
          filterable: { type: 'alphanumericFilter' },
          template: (value, item, addParams) => {
            return (
              <Popup
                trigger={
                  <span className="TableValue">{splitValue(value)}</span>
                }
                content={value}
                style={TableValuePopupStyle}
                className="TablePopupValue"
                inverted
                basic
              />
            );
          }
        }
      ];
    } else {
      initConfigCols = [
        {
          title: 'Protein_Site',
          field: 'Protein_Site',
          filterable: { type: 'alphanumericFilter' },
          template: (value, item, addParams) => {
            return (
              <div>
                {/* ref={this.highlightRef()} */}
                <Popup
                  trigger={
                    <span
                      className="TableCellLink"
                      onClick={addParams.showPlot(model, item)}
                    >
                      {splitValue(value)}
                    </span>
                  }
                  style={TableValuePopupStyle}
                  className="TablePopupValue"
                  content={value}
                  inverted
                  basic
                />
                <Popup
                  trigger={
                    <img
                      src={icon}
                      alt="Phosophosite"
                      className="ExternalSiteIcon"
                      onClick={addParams.showPhosphositePlus(item)}
                    />
                  }
                  style={TableValuePopupStyle}
                  className="TablePopupValue"
                  content={iconText}
                  inverted
                  basic
                />
              </div>
            );
          }
        }
      ];
    }
    let relevantConfigCols = [
      'F',
      'logFC',
      't',
      'P_Value',
      'adj_P_Val',
      'adjPVal'
    ];
    if (pepResults.length !== 0 && pepResults.length !== undefined) {
      let orderedTestData = JSON.parse(
        JSON.stringify(pepResults[0], relevantConfigCols)
      );

      let relevantConfigColumns = _.map(
        _.filter(_.keys(orderedTestData), function(d) {
          return _.includes(relevantConfigCols, d);
        })
      );

      // if using multi-set analysis, show set membership column
      if (this.state.multisetQueried) {
        relevantConfigColumns.splice(0, 0, 'Set_Membership');
      }

      const additionalConfigColumns = relevantConfigColumns.map(c => {
        return {
          title: c,
          field: c,
          type: 'number',
          filterable: { type: 'numericFilter' },
          exportTemplate: value => (value ? `${value}` : 'N/A'),
          template: (value, item, addParams) => {
            return (
              <p>
                <Popup
                  trigger={
                    <span className="TableValue">
                      {formatNumberForDisplay(value)}
                    </span>
                  }
                  style={TableValuePopupStyle}
                  className="TablePopupValue"
                  content={value}
                  inverted
                  basic
                />
              </p>
            );
          }
        };
      });
      const configCols = initConfigCols.concat(additionalConfigColumns);
      return configCols;
    }
  };

  getView = () => {
    if (
      this.state.isValidSearchPepplot &&
      !this.state.showProteinPage &&
      !this.state.isSearching
    ) {
      return (
        <PepplotResults
          {...this.state}
          {...this.props}
          // highlightedRowRef={this.highlightedRowRef}
          onSearchCriteriaChange={this.handleSearchCriteriaChange}
          onHandlePlotAnimation={this.handlePlotAnimation}
        />
      );
    } else if (this.state.isSearching) {
      return <TransitionActive />;
    } else return <TransitionStill />;
  };

  render() {
    const pepplotView = this.getView(this.state);

    const { multisetPlotInfo, animation, direction, visible } = this.state;
    const VerticalSidebar = ({ animation, visible }) => (
      <Sidebar
        as={'div'}
        animation={animation}
        direction={direction}
        icon="labeled"
        vertical="true"
        visible={visible}
        width="very wide"
        className="VerticalSidebarPlot"
      >
        <Grid className="">
          <Grid.Row className="ActionsRow">
            <Grid.Column
              mobile={16}
              tablet={16}
              largeScreen={16}
              widescreen={16}
            >
              <ButtonActions {...this.props} {...this.state} />
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <div
          className="MultisetSvgSpan"
          id="MultisetSvgOuter"
          dangerouslySetInnerHTML={{ __html: multisetPlotInfo.svg }}
        ></div>
      </Sidebar>
    );

    return (
      <Grid.Row className="PepplotContainer">
        <Grid.Column
          className="SidebarContainer"
          mobile={16}
          tablet={16}
          largeScreen={4}
          widescreen={4}
        >
          <PepplotSearchCriteria
            {...this.state}
            {...this.props}
            onSearchTransition={this.handleSearchTransition}
            onPepplotSearch={this.handlePepplotSearch}
            onSearchCriteriaChange={this.handleSearchCriteriaChange}
            onSearchCriteriaReset={this.hidePGrid}
            onDisablePlot={this.disablePlot}
            onGetMultisetPlot={this.handleMultisetPlot}
            onHandlePlotAnimation={this.handlePlotAnimation}
            onMultisetQueried={this.handleMultisetQueried}
          />
        </Grid.Column>
        <Grid.Column
          className="ContentContainer"
          mobile={16}
          tablet={16}
          largeScreen={12}
          widescreen={12}
        >
          <Sidebar.Pushable as={'span'}>
            <VerticalSidebar
              animation={animation}
              direction={direction}
              visible={visible}
            />
            <Sidebar.Pusher>{pepplotView}</Sidebar.Pusher>
          </Sidebar.Pushable>
        </Grid.Column>
      </Grid.Row>
    );
  }
}

export default withRouter(Pepplot);
