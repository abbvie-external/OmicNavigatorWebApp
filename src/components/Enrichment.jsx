import React, { Component } from 'react';
import { Grid, Popup, Button, Divider } from 'semantic-ui-react';
import { withRouter } from 'react-router-dom';
import EnrichmentSearchCriteria from './EnrichmentSearchCriteria';
import EnrichmentNetworkGraph from './EnrichmentNetworkGraph';
import EnrichmentResults from './EnrichmentResults';
import TransitionActive from './TransitionActive';
import TransitionStill from './TransitionStill';
import { formatNumberForDisplay, splitValue } from '../helpers';
// import { phosphoprotService } from '../services/phosphoprot.service';
// import { updateUrl } from './UrlControl';
import _ from 'lodash';
import './Enrichment.scss';
import './Table.scss';

class EnrichmentContainer extends Component {
  static defaultProps = {
    tab: 'enrichment'
  };

  constructor(props) {
    super(props);
    this.state = {
      enrichmentStudy: '',
      enrichmentModel: '',
      enrichmentAnnotation: '',
      isValidSearchEnrichment: false,
      isSearching: false,
      isTestSelected: false,
      enrichmentResults: [],
      enrichmentColumns: [],
      enrichmentView: 'table',
      networkDataAvailable: false,
      networkData: {},
      useUpsetAnalysis: false,
      upsetPlotInfo: {
        title: '',
        svg: []
      }
    };
  }

  componentDidMount() {
    // updateUrl(this.props, this.state);
  }

  handleSearchTransition = () => {
    this.setState({
      isSearching: true
    });
  };

  handleEnrichmentSearch = searchResults => {
    const columns = this.getConfigCols(searchResults);
    this.setState({
      enrichmentResults: searchResults.enrichmentResults,
      enrichmentColumns: columns,
      isSearching: false,
      isValidSearchEnrichment: true,
      isTestSelected: false
    });
    // updateUrl(this.props, this.state);
  };

  handleSearchCriteriaChange = changes => {
    this.setState({
      enrichmentStudy: changes.enrichmentStudy,
      enrichmentModel: changes.enrichmentModel,
      enrichmentAnnotation: changes.enrichmentAnnotation,
      enrichmentView: 'table'
    });
  };

  hideEGrid = () => {
    this.setState({
      isValidSearchEnrichment: false
    });
  };

  handleUpsetPlot = upsetPlotResults => {
    debugger;
    this.setState({
      upsetPlotInfo: {
        title: upsetPlotResults.svgInfo.plotType,
        svg: upsetPlotResults.svgInfo.svg
      },
      enrichmentView: 'upset'
    });
  };

  handleUpsetAnalysis = changeBoolean => {
    debugger;
    this.setState({
      useUpsetAnalysis: changeBoolean
    });
    if (changeBoolean === false) {
      this.setState({
        enrichmentView: 'table'
      });
    }
  };

  getConfigCols = annotationData => {
    const enrResults = annotationData.enrichmentResults;
    const {
      enrichmentStudy,
      enrichmentModel,
      enrichmentAnnotation
    } = this.state;
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

    let icon = '';
    let iconText = '';
    if (enrichmentAnnotation === 'REACTOME') {
      icon = 'reactome.jpg';
      iconText = 'Reactome';
    } else if (enrichmentAnnotation.substring(0, 2) === 'GO') {
      icon = 'go.png';
      iconText = 'AmiGO 2';
    } else if (enrichmentAnnotation.substring(0, 4) === 'msig') {
      icon = 'msig.ico';
      iconText = 'GSEA MSigDB';
    } else if (enrichmentAnnotation === 'PSP') {
      icon = 'phosphosite.ico';
      iconText = 'PhosphoSitePlus';
    }

    let allKeys = _.keys(enrResults[0]);

    let ***REMOVED***_text_col = _.indexOf(allKeys, 'name_1006');
    if (***REMOVED***_text_col >= 0) {
      const Col_Name_1006 = {
        title: 'name_1006',
        field: 'name_1006',
        filterable: { type: 'alphanumericFilter' },
        template: (value, item, addParams) => {
          return (
            <div>
              <Popup
                trigger={
                  <span className="TableValue">{splitValue(value)}</span>
                }
                style={TableValuePopupStyle}
                className="TablePopupValue"
                content={value}
                inverted
                basic
              />
            </div>
          );
        }
      };
      initConfigCols.push(Col_Name_1006);
    }

    let descripton_text_col = _.indexOf(allKeys, 'Description');
    if (descripton_text_col >= 0) {
      const Col_Name_Description = {
        title: 'Description',
        field: 'Description',
        filterable: { type: 'alphanumericFilter' },
        template: (value, item, addParams) => {
          return (
            <div>
              <Popup
                trigger={
                  <span className="TableValue">{splitValue(value)}</span>
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
                    alt={iconText}
                    className="ExternalSiteIcon"
                    onClick={addParams.getLink(
                      enrichmentStudy,
                      enrichmentAnnotation,
                      item
                    )}
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
      };
      initConfigCols.push(Col_Name_Description);
    }

    let annotation_text_col = _.indexOf(allKeys, 'Annotation');
    if (annotation_text_col >= 0) {
      const Col_Name_Annotation = {
        title: 'Annotation',
        field: 'Annotation',
        filterable: { type: 'alphanumericFilter' },
        template: (value, item, addParams) => {
          return (
            <div>
              <Popup
                trigger={
                  <span className="TableValue">{splitValue(value)}</span>
                }
                style={TableValuePopupStyle}
                className="TablePopupValue"
                content={value}
                inverted
                basic
              />
            </div>
          );
        }
      };
      initConfigCols.push(Col_Name_Annotation);
    }

    const relevantConfigColumns = _.filter(allKeys, function(key) {
      return (
        key !== 'name_1006' && key !== 'Description' && key !== 'Annotation'
      );
    });

    const additionalConfigColumns = relevantConfigColumns.map(c => {
      return {
        title: c,
        field: c,
        type: 'number',
        filterable: { type: 'numericFilter' },
        exportTemplate: value => (value ? `${value}` : 'N/A'),
        template: (value, item, addParams) => {
          if (enrichmentStudy === '***REMOVED***') {
            return (
              <div>
                <Popup
                  trigger={
                    <span
                      className="TableCellLink"
                      onClick={addParams.barcodeData(
                        enrichmentStudy,
                        enrichmentModel,
                        enrichmentAnnotation,
                        item,
                        c
                      )}
                    >
                      {formatNumberForDisplay(value)}
                    </span>
                  }
                  style={TableValuePopupStyle}
                  className="TablePopupValue"
                  content={value}
                  inverted
                  basic
                />
              </div>
            );
          } else
            return (
              <div>
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
              </div>
            );
        }
      };
    });

    const configCols = initConfigCols.concat(additionalConfigColumns);

    return configCols;
  };

  handleEnrichmentViewChange = choice => {
    return evt => {
      this.setState({
        enrichmentView: choice
      });
    };
  };

  // getNetworkData = () => {
  //   phosphoprotService.getEnrichmentMap().then(EMData => {
  //     this.setState({
  //       networkDataAvailable: true,
  //       nwData: EMData.elements
  //     });
  //   });
  // };

  getView = () => {
    if (
      this.state.isValidSearchEnrichment &&
      !this.state.isTestSelected &&
      !this.state.isSearching &&
      this.state.enrichmentView === 'table'
    ) {
      return <EnrichmentResults {...this.props} {...this.state} />;
    } else if (
      this.state.isValidSearchEnrichment &&
      !this.state.isTestSelected &&
      !this.state.isSearching &&
      this.state.enrichmentView === 'network'
    ) {
      return <EnrichmentNetworkGraph {...this.props} {...this.state} />;
    } else if (
      this.state.isValidSearchEnrichment &&
      !this.state.isTestSelected &&
      !this.state.isSearching &&
      this.state.enrichmentView === 'upset'
    ) {
      return (
        <div
          className="UpsetSvgSpan"
          dangerouslySetInnerHTML={{ __html: this.state.upsetPlotInfo.svg }}
        ></div>
      );
    } else if (this.state.isSearching) {
      return <TransitionActive />;
    } else return <TransitionStill />;
  };

  render() {
    const enrichmentView = this.getView(this.state);
    const {
      enrichmentStudy,
      enrichmentModel,
      enrichmentAnnotation,
      useUpsetAnalysis
    } = this.state;

    // let networkGraphData = '';
    let networkViewButton = '';
    if (
      enrichmentAnnotation === 'GO_CELLULAR_COMPONENT' &&
      enrichmentStudy === '***REMOVED***' &&
      enrichmentModel === 'Timecourse Differential Phosphorylation'
    ) {
      networkViewButton = (
        <React.Fragment>
          <Button.Or className="OrCircle" />
          <Button
            type="button"
            className="NetworkGraphButton"
            positive={this.state.enrichmentView === 'network'}
            onClick={this.handleEnrichmentViewChange('network')}
          >
            Network Graph
          </Button>
        </React.Fragment>
      );
    }

    let upsetPlotButton = '';
    if (useUpsetAnalysis === true) {
      upsetPlotButton = (
        <React.Fragment>
          <Button.Or className="OrCircle" />
          <Button
            type="button"
            className="NetworkGraphButton"
            positive={this.state.enrichmentView === 'upset'}
            onClick={this.handleEnrichmentViewChange('upset')}
          >
            Upset Plot
          </Button>
        </React.Fragment>
      );
    }

    // networkGraphData = this.getNetworkData();
    // networkData will be used for Network Graph
    let enrichmentViewToggle = '';
    if (this.state.isValidSearchEnrichment) {
      enrichmentViewToggle = (
        <div className="ToggleNetworkGraphContainer">
          <Divider />
          <span className="ToggleNetworkGraphText">VIEW</span>
          <span className="ToggleNetworkGraph">
            <Button.Group className="">
              <Button
                type="button"
                className="NetworkGraphButton"
                positive={this.state.enrichmentView === 'table'}
                onClick={this.handleEnrichmentViewChange('table')}
              >
                Table
              </Button>
              {upsetPlotButton}
              {networkViewButton}
            </Button.Group>
          </span>
        </div>
      );
    }

    return (
      <Grid.Row className="EnrichmentContainer">
        <Grid.Column
          className="SidebarContainer"
          mobile={16}
          tablet={16}
          largeScreen={4}
          widescreen={4}
        >
          <EnrichmentSearchCriteria
            {...this.state}
            onSearchTransition={this.handleSearchTransition}
            onEnrichmentSearch={this.handleEnrichmentSearch}
            onSearchCriteriaChange={this.handleSearchCriteriaChange}
            onSearchCriteriaReset={this.hideEGrid}
            onGetUpsetPlot={this.handleUpsetPlot}
            onUseUpsetAnalysis={this.handleUpsetAnalysis}
          />
          {enrichmentViewToggle}
        </Grid.Column>
        <Grid.Column
          className="ContentContainer"
          mobile={16}
          tablet={16}
          largeScreen={12}
          widescreen={12}
        >
          {enrichmentView}
        </Grid.Column>
      </Grid.Row>
    );
  }
}

export default withRouter(EnrichmentContainer);
