import React, { Component } from 'react';
import { Grid, Popup, Sidebar } from 'semantic-ui-react';
import { withRouter } from 'react-router-dom';
import DifferentialSearchCriteria from './DifferentialSearchCriteria';
// import DifferentialPlot from './DifferentialPlot';
// import LoaderActivePlots from '../Transitions/LoaderActivePlots';
import TransitionActive from '../Transitions/TransitionActive';
import TransitionStill from '../Transitions/TransitionStill';
import ButtonActions from '../Shared/ButtonActions';
import { formatNumberForDisplay, splitValue, Linkout } from '../Shared/helpers';
import DOMPurify from 'dompurify';
import { omicNavigatorService } from '../../services/omicNavigator.service';
import DifferentialVolcano from './DifferentialVolcano';
import { CancelToken } from 'axios';
import _ from 'lodash';
import './Differential.scss';
import '../Shared/Table.scss';

let cancelRequestDifferentialResultsGetPlot = () => {};
class Differential extends Component {
  static defaultProps = {
    differentialStudy: '',
    differentialModel: '',
    differentialTest: '',
    differentialFeature: '',
  };

  state = {
    isValidSearchDifferential: false,
    isSearchingDifferential: false,
    isVolcanoTableLoading: false,
    // differentialResults: [],
    // differentialResultsMounted: false,
    // differentialResultsUnfiltered: [],
    /**
     * @type {QHGrid.ColumnConfig[]}
     */
    // differentialColumns: [],
    filterableColumnsP: [],
    multisetPlotInfoDifferential: {
      title: '',
      svg: [],
    },
    isItemSelected: false,
    isItemSVGLoaded: false,
    // isItemDatatLoaded: false,
    // HighlightedFeaturesArrVolcano: [],
    // volcanoDifferentialTableRowMax: '',
    // volcanoDifferentialTableRowOther: [],
    // maxObjectIdentifier: null,
    imageInfo: {
      key: null,
      title: '',
      svg: [],
    },
    imageInfoDifferential: {
      key: null,
      title: '',
      svg: [],
    },
    activeSVGTabIndex: 0,
    multisetPlotAvailableDifferential: false,
    animation: 'uncover',
    direction: 'left',
    visible: false,
    plotButtonActiveDifferential: false,
    multisetQueriedDifferential: false,
    thresholdColsP: [],
    tabsMessage: 'Select a feature to display plots and data',
    // differentialPlotTypes: [],
    differentialStudyMetadata: [],
    differentialModelsAndTests: [],
    differentialTestsMetadata: [],
    modelSpecificMetaFeaturesExist: true,
    resultsLinkouts: [],
    resultsFavicons: [],
    isVolcanoPlotSVGLoaded: true,
    metaFeaturesDataDifferential: [],
    allMetaFeaturesDataDifferential: [],
    isDataStreamingResultsTable: false,
  };
  differentialViewContainerRef = React.createRef();
  differentialGridRef = React.createRef();

  shouldComponentUpdate(nextProps) {
    return nextProps.tab === 'differential';
  }

  handleSearchTransitionDifferential = bool => {
    this.setState({
      isSearchingDifferential: bool,
    });
  };

  handleSearchTransitionDifferentialAlt = bool => {
    this.setState({
      isVolcanoTableLoading: bool,
    });
  };

  handleMultisetQueriedDifferential = value => {
    this.setState({
      multisetQueriedDifferential: value,
      // isVolcanoPlotSVGLoaded: !value,
    });
  };

  // handleVolcanoPlotSVGLoaded = bool => {
  //   this.setState({
  //     isVolcanoPlotSVGLoaded: bool,
  //   });
  // };

  setStudyModelTestMetadata = (studyData, modelsAndTests) => {
    this.setState(
      {
        differentialStudyMetadata: studyData,
        differentialModelsAndTests: modelsAndTests,
      },
      function() {
        this.handlePlotTypesDifferential(this.props.differentialModel);
      },
    );
  };

  setTestsMetadata = testsData => {
    this.setState({
      differentialTestsMetadata: testsData,
    });
  };

  handleDifferentialSearchUnfiltered = searchResults => {
    this.setState({
      differentialResultsUnfiltered: searchResults.differentialResults,
      isItemSVGLoaded: false,
      // isItemDatatLoaded: false,
      // isItemSelected: this.props.differentialFeature !== '',
      HighlightedFeaturesArrVolcano: [],
    });
  };

  handleDifferentialSearch = searchResults => {
    /**
     * @type {QHGrid.ColumnConfig<{}>[]}
     */
    let columns = [{}];
    // need this check for page refresh
    if (searchResults.differentialResults?.length > 0) {
      columns = this.getConfigCols(searchResults);
    }
    this.setState({
      differentialResults: searchResults.differentialResults,
      differentialColumns: columns,
      isSearchingDifferential: false,
      isValidSearchDifferential: true,
      isVolcanoTableLoading: false,
      // differentialResultsMounted: false,
      plotButtonActiveDifferential: false,
      visible: false,
      // isItemSVGLoaded: false,
      HighlightedFeaturesArrVolcano: [],
    });
  };

  handleVolcanoTableLoading = bool => {
    this.setState({
      isVolcanoTableLoading: bool,
    });
  };

  handlePlotTypesDifferential = differentialModel => {
    if (differentialModel !== '') {
      if (this.state.differentialStudyMetadata?.plots != null) {
        const differentialModelData = this.state.differentialStudyMetadata.plots.find(
          model => model.modelID === differentialModel,
        );
        this.setState({
          differentialPlotTypes: differentialModelData?.plots,
        });
      }
    }
  };
  handleSearchCriteriaChangeDifferential = (changes, scChange) => {
    this.props.onHandleUrlChange(changes, 'differential');
    this.setState({
      visible: false,
      plotButtonActiveDifferential: false,
    });
    if (scChange) {
      this.setState({
        multisetPlotAvailableDifferential: false,
        imageInfo: { key: null, title: '', svg: [] },
        imageInfoDifferential: { key: null, title: '', svg: [] },
        tabsMessage: 'Select a feature to display plots and data',
        // differentialResults: [],
        // differentialResultsMounted: false,
        // differentialResultsUnfiltered: [],
        // isItemDatatLoaded: false,
        HighlightedFeaturesArrVolcano: [],
        volcanoDifferentialTableRowMax: '',
        volcanoDifferentialTableRowOther: [],
        maxObjectIdentifier: null,
        isVolcanoPlotSVGLoaded: true,
        isItemSelected: false,
        isItemSVGLoaded: true,
      });
    }
    if (
      changes.differentialModel !== '' &&
      changes.differentialModel !== this.props.differentialModel
    ) {
      this.doMetaFeaturesExist(
        changes.differentialStudy,
        changes.differentialModel,
      );
      this.getResultsLinkouts(
        changes.differentialStudy,
        changes.differentialModel,
      );
    }
  };

  doMetaFeaturesExist = (differentialStudy, differentialModel) => {
    omicNavigatorService
      .getMetaFeatures(differentialStudy, differentialModel)
      .then(getMetaFeaturesResponseData => {
        const exist = getMetaFeaturesResponseData.length > 0 ? true : false;
        this.setState({
          modelSpecificMetaFeaturesExist: exist,
          allMetaFeaturesDataDifferential: getMetaFeaturesResponseData,
        });
      });
  };

  getResultsLinkouts = (differentialStudy, differentialModel) => {
    this.setState({
      resultsLinkouts: [],
      resultsFavicons: [],
    });
    debugger;
    const storedResultsLinkouts = sessionStorage.getItem(
      `ResultsLinkouts-${differentialStudy}_${differentialModel}`,
    );
    if (storedResultsLinkouts) {
      const parsedResultsLinkouts = JSON.parse(storedResultsLinkouts);
      this.setState({
        resultsLinkouts: parsedResultsLinkouts,
      });
      const storedResultsFavicons = sessionStorage.getItem(
        `ResultsFavicons-${differentialStudy}_${differentialModel}`,
      );
      if (storedResultsFavicons) {
        const parsedResultsFavicons = JSON.parse(storedResultsFavicons);
        this.setState({
          resultsFavicons: parsedResultsFavicons,
        });
      } else {
        omicNavigatorService
          .getFavicons(parsedResultsLinkouts)
          .then(getFaviconsResponseData => {
            this.setState({
              resultsFavicons: getFaviconsResponseData,
            });
            sessionStorage.setItem(
              `ResultsFavicons-${differentialStudy}_${differentialModel}`,
              JSON.stringify(getFaviconsResponseData),
            );
          });
      }
    } else {
      omicNavigatorService
        .getResultsLinkouts(differentialStudy, differentialModel)
        .then(getResultsLinkoutsResponseData => {
          this.setState({
            resultsLinkouts: getResultsLinkoutsResponseData,
          });
          sessionStorage.setItem(
            `ResultsLinkouts-${differentialStudy}_${differentialModel}`,
            JSON.stringify(getResultsLinkoutsResponseData),
          );
          omicNavigatorService
            .getFavicons(getResultsLinkoutsResponseData)
            .then(getFaviconsResponseData => {
              this.setState({
                resultsFavicons: getFaviconsResponseData,
              });
              sessionStorage.setItem(
                `ResultsFavicons-${differentialStudy}_${differentialModel}`,
                JSON.stringify(getFaviconsResponseData),
              );
            });
        });
    }
  };

  handleIsDataStreamingResultsTable = bool => {
    this.setState({
      isDataStreamingResultsTable: bool,
    });
  };

  disablePlotDifferential = () => {
    this.setState({
      multisetPlotAvailableDifferential: false,
    });
  };

  handleSearchCriteriaResetDifferential = () => {
    this.setState({
      isValidSearchDifferential: false,
      multisetPlotAvailableDifferential: false,
      plotButtonActiveDifferential: false,
      visible: false,
      isItemSelected: false,
      // differentialResultsMounted: false,
      isItemSVGLoaded: false,
    });
  };

  handlePlotAnimationDifferential = animation => () => {
    this.setState(prevState => ({
      animation,
      visible: !prevState.visible,
      plotButtonActiveDifferential: !prevState.plotButtonActiveDifferential,
    }));
  };

  handleMultisetPlot = multisetPlotResults => {
    this.setState({
      multisetPlotInfoDifferential: {
        title: multisetPlotResults.svgInfo.plotType,
        svg: multisetPlotResults.svgInfo.svg,
      },
      multisetPlotAvailableDifferential: true,
    });
  };

  getProteinData = (
    id,
    dataItem,
    imageInfoDifferential,
    featureidSpecificMetaFeaturesExist,
  ) => {
    const { differentialFeatureIdKey } = this.props;
    const self = this;
    this.setState(
      {
        imageInfoDifferential: imageInfoDifferential,
        isItemSelected: true,
        // differentialResultsMounted: false,
        isItemSVGLoaded: false,
        // isItemDatatLoaded: false,
        currentSVGs: [],
      },
      function() {
        this.handleSearchCriteriaChangeDifferential(
          {
            differentialStudy: this.props.differentialStudy || '',
            differentialModel: this.props.differentialModel || '',
            differentialTest: this.props.differentialTest || '',
            differentialFeature: dataItem[differentialFeatureIdKey] || '',
          },
          false,
        );
        self.getPlot('Differential', id, featureidSpecificMetaFeaturesExist);
      },
    );
  };
  getTableHelpers = differentialFeatureIdKeyVar => {
    const self = this;
    let addParams = {};
    addParams.showPlotDifferential = (
      dataItem,
      alphanumericTrigger,
      featureidSpecificMetaFeaturesExist,
    ) => {
      return function() {
        let value = dataItem[alphanumericTrigger];
        let imageInfoDifferential = {
          key: `${value}`,
          title: `${alphanumericTrigger} ${value}`,
          svg: [],
        };
        self.getProteinData(
          dataItem[alphanumericTrigger],
          dataItem,
          imageInfoDifferential,
          featureidSpecificMetaFeaturesExist,
        );
      };
    };
    addParams.elementId = differentialFeatureIdKeyVar;
    this.setState({ additionalTemplateInfoDifferentialTable: addParams });
  };

  getPlot = (view, featureId, featureidSpecificMetaFeaturesExist) => {
    const { differentialPlotTypes } = this.state;
    const {
      differentialStudy,
      differentialModel,
      differentialFeature,
      differentialFeatureIdKey,
    } = this.props;
    let self = this;
    let id = featureId != null ? featureId : differentialFeature;
    let imageInfo = {
      key: `${featureId}`,
      title: `${differentialFeatureIdKey} ${featureId}`,
      svg: [],
    };
    let currentSVGs = [];
    cancelRequestDifferentialResultsGetPlot();
    let cancelToken = new CancelToken(e => {
      cancelRequestDifferentialResultsGetPlot = e;
    });
    if (featureidSpecificMetaFeaturesExist) {
      this.getMetaFeaturesTable(featureId);
    }
    if (differentialPlotTypes.length !== 0) {
      _.forEach(differentialPlotTypes, function(plot, i) {
        omicNavigatorService
          .plotStudy(
            differentialStudy,
            differentialModel,
            id,
            differentialPlotTypes[i].plotID,
            // self.handleItemSelected,
            null,
            cancelToken,
          )
          .then(svgMarkupObj => {
            let svgMarkup = svgMarkupObj.data;
            if (svgMarkup != null || svgMarkup !== []) {
              svgMarkup = svgMarkup.replace(
                /id="/g,
                'id="' + id + '-' + i + '-',
              );
              svgMarkup = svgMarkup.replace(
                /#glyph/g,
                '#' + id + '-' + i + '-glyph',
              );
              svgMarkup = svgMarkup.replace(
                /#clip/g,
                '#' + id + '-' + i + '-clip',
              );
              svgMarkup = svgMarkup.replace(
                /<svg/g,
                `<svg preserveAspectRatio="xMinYMin meet" id="currentSVG-${id}-${i}"`,
              );
              DOMPurify.addHook('afterSanitizeAttributes', function(node) {
                if (
                  node.hasAttribute('xlink:href') &&
                  !node.getAttribute('xlink:href').match(/^#/)
                ) {
                  node.remove();
                }
              });
              // Clean HTML string and write into our DIV
              let sanitizedSVG = DOMPurify.sanitize(svgMarkup, {
                ADD_TAGS: ['use'],
              });
              let svgInfo = {
                plotType: differentialPlotTypes[i],
                svg: sanitizedSVG,
              };
              imageInfo.svg.push(svgInfo);
              currentSVGs.push(sanitizedSVG);
              self.handleSVG(view, imageInfo);
            } else {
              // self.handleItemSelected(false);
            }
          });
        // .catch(error => {
        //   self.handleItemSelected(false);
        // });
      });
    } else {
      this.setState({
        imageInfo: {
          key: null,
          title: '',
          svg: [],
        },
        isItemSVGLoaded: true,
        isVolcanoPlotSVGLoaded: true,
      });
    }
  };

  getMetaFeaturesTable = featureId => {
    const { differentialStudy, differentialModel } = this.props;
    omicNavigatorService
      .getMetaFeaturesTable(
        differentialStudy,
        differentialModel,
        featureId,
        this.handleGetMetaFeaturesTableError,
      )
      .then(getMetaFeaturesTableResponseData => {
        this.setState({
          metaFeaturesDataDifferential: getMetaFeaturesTableResponseData,
          // areDifferentialPlotTabsReady: true,
        });
      })
      .catch(error => {
        console.error('Error during getMetaFeaturesTable', error);
      });
  };

  handleGetMetaFeaturesTableError = () => {
    const { differentialStudy, differentialModel } = this.props;
    sessionStorage.setItem(
      `${differentialStudy}-${differentialModel}-MetaFeaturesExist`,
      false,
    );
    this.setState({
      areDifferentialPlotTabsReady: true,
    });
  };

  handleSelectedVolcano = toHighlightArr => {
    //if(toHighlightArr !== this.state.HighlightedFeaturesArrVolcano){
    this.setState({
      HighlightedFeaturesArrVolcano: toHighlightArr,
    });
    if (toHighlightArr.length > 0) {
      const MaxLine = toHighlightArr[0] || null;
      let volcanoDifferentialTableRowMaxVar = '';
      if (MaxLine !== {} && MaxLine != null) {
        volcanoDifferentialTableRowMaxVar = MaxLine.key;
      }
      const HighlightedFeaturesCopy = [...toHighlightArr];
      const SelectedFeatures = HighlightedFeaturesCopy.slice(1);
      let volcanoDifferentialTableRowOtherVar = [];
      if (
        SelectedFeatures.length > 0 &&
        SelectedFeatures != null &&
        SelectedFeatures !== {}
      ) {
        SelectedFeatures.forEach(element => {
          volcanoDifferentialTableRowOtherVar.push(element.key);
        });
      }
      const maxId = toHighlightArr[0].id || '';
      this.setState({
        volcanoDifferentialTableRowMax: volcanoDifferentialTableRowMaxVar,
        volcanoDifferentialTableRowOther: volcanoDifferentialTableRowOtherVar,
        volcanoDifferentialTableAll: toHighlightArr,
        updateVolcanoLabels: true,
      });
      this.handlePlotVolcano(maxId);
    } else {
      this.setState({
        volcanoDifferentialTableRowMax: '',
        volcanoDifferentialTableRowOther: [],
      });
      this.handlePlotVolcano('');
    }
    //}
  };

  updateVolcanoLabels = bool => {
    this.setState({
      updateVolcanoLabels: bool,
    });
  };

  handlePlotVolcano = maxId => {
    if (maxId !== '') {
      if (this.state.maxObjectIdentifier !== maxId) {
        this.setState({
          isVolcanoPlotSVGLoaded: false,
          maxObjectIdentifier: maxId,
        });
        this.getPlot('Volcano', maxId);
      }
    } else {
      this.setState({
        isVolcanoPlotSVGLoaded: true,
        maxObjectIdentifier: '',

        imageInfo: {
          key: null,
          title: '',
          svg: [],
        },
      });
    }
  };

  handleSVGTabChange = activeTabIndex => {
    this.setState({
      activeSVGTabIndex: activeTabIndex,
    });
  };
  handleItemSelected = bool => {
    this.setState({
      isItemSelected: bool,
    });
  };
  handleSVG = (view, imageInfo) => {
    const key = view === 'Differential' ? `imageInfo${view}` : 'imageInfo';
    this.setState({
      [key]: imageInfo,
      isItemSVGLoaded: true,
      isVolcanoPlotSVGLoaded: true,
    });
  };
  backToTable = () => {
    this.setState({
      // differentialResultsMounted: false,
      isItemSelected: false,
      // isItemDatatLoaded: false,
      isItemSVGLoaded: false,
    });
    this.handleSearchCriteriaChangeDifferential(
      {
        differentialStudy: this.props.differentialStudy || '',
        differentialModel: this.props.differentialModel || '',
        differentialTest: this.props.differentialTest || '',
        differentialFeature: '',
      },
      false,
    );
  };
  getConfigCols = testData => {
    const differentialResultsVar = testData.differentialResults;
    const { differentialFeature } = this.props;
    const {
      resultsLinkouts,
      resultsFavicons,
      allMetaFeaturesDataDifferential,
      differentialPlotTypes,
      modelSpecificMetaFeaturesExist,
    } = this.state;
    // let differentialPlotTypes = [];
    const TableValuePopupStyle = {
      backgroundColor: '2E2E2E',
      borderBottom: '2px solid var(--color-primary)',
      color: '#FFF',
      padding: '1em',
      maxWidth: '50vw',
      fontSize: '13px',
      wordBreak: 'break-all',
    };
    let differentialAlphanumericFields = [];
    let differentialNumericFields = [];
    const firstObject = differentialResultsVar[0];
    for (let [key, value] of Object.entries(firstObject)) {
      if (typeof value === 'string' || value instanceof String) {
        differentialAlphanumericFields.push(key);
      } else {
        differentialNumericFields.push(key);
      }
    }
    const alphanumericTrigger = differentialAlphanumericFields[0];
    if (differentialFeature !== '') {
      // on page refresh, handle if differential features is selected
      let imageInfoDifferential = {
        key: `${differentialFeature}`,
        title: `${alphanumericTrigger} ${differentialFeature}`,
        svg: [],
      };
      this.setState({
        imageInfoDifferential: imageInfoDifferential,
        // differentialResultsMounted: false,
        isItemSelected: true,
        isItemSVGLoaded: false,
        // isItemDatatLoaded: false,
        currentSVGs: [],
      });
      this.getPlot('Differential', differentialFeature, true);
    }
    this.props.onHandleDifferentialFeatureIdKey(
      'differentialFeatureIdKey',
      alphanumericTrigger,
    );
    this.getTableHelpers(alphanumericTrigger);
    const self = this;
    const differentialAlphanumericColumnsMapped = differentialAlphanumericFields.map(
      (f, { index }) => {
        const noPlots = differentialPlotTypes.length === 0;

        if (noPlots) {
          self.setState({
            tabsMessage: 'No plots available',
          });
        }
        if (noPlots && !modelSpecificMetaFeaturesExist) {
          self.setState({
            tabsMessage: 'No plots or feature data available',
          });
        }
        return {
          title: f,
          field: f,
          filterable: { type: 'multiFilter' },
          template: (value, item, addParams) => {
            const keyVar = `${item[f]}-${item[alphanumericTrigger]}`;
            const mappedMetafeaturesFeatureIds = allMetaFeaturesDataDifferential.map(
              meta => meta[alphanumericTrigger],
            );
            const featureidSpecificMetaFeaturesExist = mappedMetafeaturesFeatureIds.includes(
              item[alphanumericTrigger],
            );
            const featureIdClass =
              noPlots && !featureidSpecificMetaFeaturesExist
                ? 'TableCellBold NoSelect'
                : 'TableCellLink NoSelect';
            const featureIdClick =
              noPlots && !featureidSpecificMetaFeaturesExist
                ? null
                : addParams.showPlotDifferential(
                    item,
                    alphanumericTrigger,
                    featureidSpecificMetaFeaturesExist,
                  );
            const resultsLinkoutsKeys = Object.keys(resultsLinkouts);
            let linkoutWithIcon = null;
            if (resultsLinkoutsKeys.includes(f)) {
              if (item[f] != null && item[f] !== '') {
                const columnLinkoutsObj = resultsLinkouts[f];
                const columnFaviconsObj = resultsFavicons[f];
                const columnLinkoutsIsArray = Array.isArray(columnLinkoutsObj);
                let favicons = [];
                if (columnFaviconsObj != null) {
                  const columnFaviconsIsArray = Array.isArray(
                    columnFaviconsObj,
                  );
                  favicons = columnFaviconsIsArray
                    ? columnFaviconsObj
                    : [columnFaviconsObj];
                }
                const linkouts = columnLinkoutsIsArray
                  ? columnLinkoutsObj
                  : [columnLinkoutsObj];

                const itemValue = item[f];
                linkoutWithIcon = (
                  <Linkout {...{ keyVar, itemValue, linkouts, favicons }} />
                );
              }
            }
            if (f === alphanumericTrigger) {
              return (
                <div className="NoSelect" key={keyVar}>
                  <Popup
                    trigger={
                      <span className={featureIdClass} onClick={featureIdClick}>
                        {splitValue(value)}
                      </span>
                    }
                    style={TableValuePopupStyle}
                    className="TablePopupValue"
                    content={value}
                    inverted
                    basic
                    closeOnTriggerClick
                  />
                  {linkoutWithIcon}
                </div>
              );
            } else {
              return (
                <div className="NoSelect" key={keyVar}>
                  <Popup
                    trigger={<span className="">{splitValue(value)}</span>}
                    style={TableValuePopupStyle}
                    className="TablePopupValue"
                    content={value}
                    inverted
                    basic
                  />
                  {linkoutWithIcon}
                </div>
              );
            }
          },
        };
      },
    );
    const thresholdColsDifferential = this.listToJson(
      differentialNumericFields,
    );
    this.setState({
      thresholdColsP: thresholdColsDifferential,
    });
    this.setState({ filterableColumnsP: [...differentialNumericFields] });
    const differentialNumericColumnsMapped = differentialNumericFields.map(
      c => {
        return {
          title: c,
          field: c,
          type: 'number',
          filterable: { type: 'numericFilter' },
          exportTemplate: value => (value ? `${value}` : 'N/A'),
          template: (value, item, addParams) => {
            return (
              <div className="NoSelect">
                <Popup
                  trigger={
                    <span className="TableValue NoSelect">
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
          },
        };
      },
    );
    const configCols = differentialAlphanumericColumnsMapped.concat(
      differentialNumericColumnsMapped,
    );
    return configCols;
  };

  listToJson(list) {
    var valueJSON = [];
    for (var i = 0; i < list.length; i++) {
      valueJSON.push({
        key: list[i],
        text: list[i],
        value: list[i],
      });
    }
    return valueJSON;
  }

  getMessage = () => {
    const {
      differentialStudy,
      differentialModel,
      differentialTest,
    } = this.props;
    if (differentialStudy === '') {
      return 'study';
    } else if (differentialModel === '') {
      return 'model';
    } else if (differentialTest === '') {
      return 'test';
    } else return '';
  };

  getView = () => {
    const message = this.getMessage();
    if (this.state.isSearchingDifferential) {
      return <TransitionActive />;
    } else if (
      this.state.isValidSearchDifferential &&
      !this.state.isSearchingDifferential
    ) {
      return (
        <DifferentialVolcano
          {...this.state}
          {...this.props}
          handleVolcanoPlotSelectionChange={
            this.handleVolcanoPlotSelectionChange
          }
          onHandleSelectedVolcano={this.handleSelectedVolcano}
          onVolcanoSVGSizeChange={this.handleVolcanoSVGSizeChange}
          onSVGTabChange={this.handleSVGTabChange}
          onHandleVolcanoTableLoading={this.handleVolcanoTableLoading}
          onBackToTable={this.backToTable}
          onUpdateVolcanoLabels={this.updateVolcanoLabels}
        />
      );
    } else return <TransitionStill stillMessage={message} />;
  };

  render() {
    const differentialView = this.getView();
    const {
      multisetPlotInfoDifferential,
      animation,
      direction,
      visible,
    } = this.state;
    const { tab, differentialStudy, differentialModel } = this.props;
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
              <ButtonActions
                exportButtonSize={'small'}
                excelVisible={false}
                pngVisible={true}
                pdfVisible={false}
                svgVisible={true}
                txtVisible={false}
                plot={'differentialMultisetAnalysisSVG'}
                tab={tab}
                study={differentialStudy}
                model={differentialModel}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <div
          className="MultisetSvgOuter"
          dangerouslySetInnerHTML={{ __html: multisetPlotInfoDifferential.svg }}
        ></div>
      </Sidebar>
    );
    return (
      <Grid>
        <Grid.Row className="DifferentialContainer">
          <Grid.Column
            className="SidebarContainer"
            mobile={16}
            tablet={16}
            largeScreen={4}
            widescreen={4}
          >
            <DifferentialSearchCriteria
              {...this.state}
              {...this.props}
              onSearchTransitionDifferential={
                this.handleSearchTransitionDifferential
              }
              onSearchTransitionDifferentialAlt={
                this.handleSearchTransitionDifferentialAlt
              }
              onDifferentialSearch={this.handleDifferentialSearch}
              onDifferentialSearchUnfiltered={
                this.handleDifferentialSearchUnfiltered
              }
              onSearchCriteriaChangeDifferential={
                this.handleSearchCriteriaChangeDifferential
              }
              onSearchCriteriaResetDifferential={
                this.handleSearchCriteriaResetDifferential
              }
              onDisablePlotDifferential={this.disablePlotDifferential}
              onGetMultisetPlotDifferential={this.handleMultisetPlot}
              onHandlePlotAnimationDifferential={
                this.handlePlotAnimationDifferential
              }
              onMultisetQueriedDifferential={
                this.handleMultisetQueriedDifferential
              }
              onSetStudyModelTestMetadata={this.setStudyModelTestMetadata}
              onSetTestsMetadata={this.setTestsMetadata}
              onHandlePlotTypesDifferential={this.handlePlotTypesDifferential}
              onHandleVolcanoTableLoading={this.handleVolcanoTableLoading}
              onDoMetaFeaturesExist={this.doMetaFeaturesExist}
              onGetResultsLinkouts={this.getResultsLinkouts}
              onHandleIsDataStreamingResultsTable={
                this.handleIsDataStreamingResultsTable
              }
            />
          </Grid.Column>
          <Grid.Column
            className="DifferentialContentContainer"
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
              <Sidebar.Pusher>
                <div
                  className="DifferentialViewContainer"
                  ref={this.differentialViewContainerRef}
                >
                  {differentialView}
                </div>
              </Sidebar.Pusher>
            </Sidebar.Pushable>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default withRouter(Differential);
