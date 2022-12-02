import React, { Component } from 'react';
import { Grid, Popup, Sidebar, Icon } from 'semantic-ui-react';
import _ from 'lodash-es';
import { CancelToken } from 'axios';
import DOMPurify from 'dompurify';
import { withRouter } from 'react-router-dom';
import SVG from 'react-inlinesvg';
import { toast } from 'react-toastify';
import {
  isNotNANullUndefinedEmptyString,
  formatNumberForDisplay,
  splitValue,
  Linkout,
  roundToPrecision,
  limitValues,
  getIdArg,
  getTestsArg,
  getModelsArg,
} from '../Shared/helpers';
import ButtonActions from '../Shared/ButtonActions';
import DifferentialSearch from './DifferentialSearch';
import DifferentialDetail from './DifferentialDetail';
import ErrorBoundary from '../Shared/ErrorBoundary';
import { omicNavigatorService } from '../../services/omicNavigator.service';
import TransitionActive from '../Transitions/TransitionActive';
import TransitionStill from '../Transitions/TransitionStill';
import './Differential.scss';
import '../Shared/Table.scss';

let cancelRequestDifferentialResultsGetPlot = () => {};
let cancelRequestDifferentialResultsGetMultifeaturePlot = () => {};
let cancelRequestGetMapping = () => {};
class Differential extends Component {
  static defaultProps = {
    differentialStudy: '',
    differentialModel: '',
    differentialTest: '',
    differentialFeature: '',
  };

  constructor(props) {
    super(props);
    // this.resizeListener = this.resizeListener.bind(this);
    // this.debouncedResizeListener = _.debounce(this.resizeListener, 100);
    this.differentialColumnsConfigured = false;
    this.state = {
      // GENERAL
      // differentialPlotTypes: [],

      differentialStudyMetadata: [],
      differentialModelsAndTests: [],
      differentialTestsMetadata: [],
      differentialTestIds: [],
      differentialModelIds: [],
      // RESULTS
      differentialResultsTableLoading: false,
      // differentialResults: [],
      differentialResultsTableStreaming: true,
      differentialResultsLinkouts: [],
      differentialResultsFavicons: [],
      // differentialResultsUnfiltered: [],
      /**
       * @type {QHGrid.ColumnConfig[]}
       */
      differentialColumns: [],
      isSearchingDifferential: false,
      isValidSearchDifferential: false,
      isFilteredDifferential: false,
      // HIGHLIGHTED FEATURES
      differentialHighlightedFeaturesData: [],
      differentialHighlightedFeatures: [],
      differentialOutlinedFeature: '',
      // FEATURE DATA
      allMetaFeaturesDataDifferential: [],
      modelSpecificMetaFeaturesExist: false,
      // SINGLE FEATURE PLOTS
      plotSingleFeatureDataLoaded: true,
      plotSingleFeatureData: {
        key: null,
        title: '',
        svg: [],
      },
      // plotSingleFeatureDataLength: 0,
      // MULTI-FEATURE PLOTS
      plotMultiFeatureAvailable: false,
      plotMultiFeatureDataLoaded: true,
      plotMultiFeatureData: {
        key: null,
        title: '',
        svg: [],
      },
      // plotMultiFeatureDataLength: 0,
      plotMultiFeatureMax: 1000,
      // OVERLAY PLOTS
      plotOverlayVisible: false,
      plotOverlayLoaded: false,
      plotOverlayData: {
        key: null,
        title: '',
        svg: [],
      },
      // plotOverlayDataLength: 0,
      // MULTI-SET PLOT
      plotMultisetLoadedDifferential: false,
      plotMultisetDataDifferential: {
        title: '',
        svg: [],
      },
      // MULTISET PLOT ANIMANTION
      animation: 'uncover',
      direction: 'left',
      visible: false,
      // MULTISET FILTERS
      multisetColsDifferential: [],
      multisetFiltersVisibleParentRef: false,
      multisetButttonActiveDifferential: false,
      multisetQueriedDifferential: false,
    };
  }

  differentialViewContainerRef = React.createRef();
  differentialGridRef = React.createRef();

  componentDidMount() {
    if (this.props.differentialStudy) {
      this.getMultiModelMappingObject(this.props.differentialStudy);
    }
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.tab === 'differential';
  }

  // componentWillUnmount() {
  //   window.removeEventListener('resize', this.debouncedResizeListener);
  // }

  // resizeListener() {
  //   this.forceUpdate();
  // }

  handleSearchTransitionDifferential = bool => {
    this.setState({
      isSearchingDifferential: bool,
    });
  };

  handleMultisetFiltersVisibleParentRef = bool => {
    this.setState({
      multisetFiltersVisibleParentRef: bool,
    });
  };

  handleIsFilteredDifferential = bool => {
    this.setState({
      isFilteredDifferential: bool,
    });
  };

  handleDifferentialColumnsConfigured = bool => {
    this.differentialColumnsConfigured = bool;
  };

  handleSearchTransitionDifferentialAlt = bool => {
    this.setState({
      differentialResultsTableLoading: bool,
    });
  };

  handleMultisetQueriedDifferential = value => {
    this.setState({
      multisetQueriedDifferential: value,
      // dynamicPlotsLoaded: !value,
    });
  };

  setTestsMetadata = testsData => {
    this.setState({
      differentialTestsMetadata: testsData,
    });
  };

  setDifferentialTestIds = differentialTestIds => {
    this.setState({
      differentialTestIds,
    });
  };

  setDifferentialModelIds = differentialModelIds => {
    this.setState({
      differentialModelIds,
    });
  };

  handleDifferentialSearch = (
    searchResults,
    setUnfiltered,
    streamingFinished,
  ) => {
    if (setUnfiltered) {
      this.setState({
        differentialResultsUnfiltered: searchResults.differentialResults,
      });
    }
    /**
     * @type {QHGrid.ColumnConfig<{}>[]}
     */
    // need this check for page refresh
    if (
      searchResults?.differentialResults?.length &&
      !this.differentialColumnsConfigured
    ) {
      let columns = this.getConfigCols(searchResults);
      this.setState({
        differentialColumns: columns,
      });
      this.differentialColumnsConfigured = true;
    }
    this.setState({
      differentialResults: searchResults.differentialResults,
      isSearchingDifferential: false,
      isValidSearchDifferential: true,
      differentialResultsTableLoading: false,
      multisetButttonActiveDifferential: false,
      visible: false,
      plotOverlayLoaded: false,
      differentialResultsTableStreaming: !streamingFinished,
    });
    // if needed...
    // differentialResults flow down
    // and update the table state (differentialTableData)
    // this callback ensures streaming follows later
    // so scatter plot lifecycles don't interupt the table from finishing
    // const self = this;
    // if (streamingFinished) {
    // if we need to delay them longer,
    // setTimeout(function() {
    // DEV - can we add this back up ^ now?
    // self.setState({ differentialResultsTableStreaming: false });
    // }, 500);
    // }
  };

  handleResultsTableLoading = bool => {
    this.setState({
      differentialResultsTableLoading: bool,
    });
  };

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

  handlePlotTypesDifferential = differentialModel => {
    if (differentialModel !== '') {
      if (this.state.differentialStudyMetadata?.plots != null) {
        const differentialModelData = this.state.differentialStudyMetadata.plots.find(
          model => model.modelID === differentialModel,
        );
        const differentialPlotTypesRaw = differentialModelData?.plots;
        // filter out invalid plots - plotType string must be 'singleFeature', 'multiFeature', 'singleTest', 'multiTest', 'plotly'
        const differentialPlotTypesVar = [...differentialPlotTypesRaw].filter(
          plot => {
            let plotTypeArr = plot?.plotType || null;
            const convertStringToArray = object => {
              return typeof object === 'string' ? Array(object) : object;
            };
            if (plotTypeArr) {
              plotTypeArr = convertStringToArray(plot.plotType);
            }
            const isValidPlotType = pt => {
              return (
                pt === 'singleFeature' ||
                pt === 'multiFeature' ||
                pt === 'singleTest' ||
                pt === 'multiTest' ||
                pt === 'plotly' ||
                pt === 'multiModel'
              );
            };
            const valid = plotTypeArr.every(isValidPlotType);
            if (!valid) {
              console.log(
                `${plot?.plotID} will be ignored because it has unknown plotType ${plot.plotType}`,
              );
              toast.error(
                `${plot?.plotID} will be ignored because it has unknown plotType ${plot.plotType}`,
              );
            }
            return valid;
          },
        );
        let plotMultiFeatureAvailableVar = false;
        let singleFeaturePlotTypesVar = [];
        let multiFeaturePlotTypesVar = [];
        // let multiModelPlotTypesVar = [];
        if (differentialPlotTypesVar) {
          singleFeaturePlotTypesVar = [...differentialPlotTypesVar].filter(
            p => !p.plotType.includes('multiFeature'),
          );
          multiFeaturePlotTypesVar = [...differentialPlotTypesVar].filter(p =>
            p.plotType.includes('multiFeature'),
          );
          // in progress - if we need to distinuguish tabs for multi-modal
          // multiModelPlotTypesVar = [...differentialPlotTypesVar].filter(p =>
          //   p.plotType.includes('multiModel'),
          // );
          // const notMultiModelPlotTypesVar = [
          //   ...differentialPlotTypesVar,
          // ].filter(p => p.plotType.includes('!multiModel'));
          // singleFeaturePlotTypesVar = [...notMultiModelPlotTypesVar].filter(
          //   p => !p.plotType.includes('multiFeature'),
          // );
          // multiFeaturePlotTypesVar = [...notMultiModelPlotTypesVar].filter(p =>
          //   p.plotType.includes('multiFeature'),
          // );
          plotMultiFeatureAvailableVar =
            multiFeaturePlotTypesVar?.length || false;
        }
        this.setState({
          differentialPlotTypes: differentialPlotTypesVar,
          singleFeaturePlotTypes: singleFeaturePlotTypesVar,
          multiFeaturePlotTypes: multiFeaturePlotTypesVar,
          // multiModelPlotTypes: multiModelPlotTypesVar,
          plotMultiFeatureAvailable: plotMultiFeatureAvailableVar,
        });
      }
    }
  };

  resetOverlay = () => {
    this.setState({
      plotOverlayData: { key: null, title: '', svg: [] },
      plotOverlayVisible: false,
      plotOverlayLoaded: true,
    });
  };

  handleSearchChangeDifferential = (
    changes,
    scChange,
    resetSelectedFeatures,
  ) => {
    this.props.onHandleUrlChange(changes, 'differential');
    this.setState({
      visible: false,
      multisetButttonActiveDifferential: false,
    });
    if (scChange) {
      this.resetOverlay();
      if (resetSelectedFeatures) {
        this.setState({
          plotMultisetLoadedDifferential: false,
          plotSingleFeatureData: { key: null, title: '', svg: [] },
          plotMultiFeatureData: { key: null, title: '', svg: [] },
          differentialHighlightedFeaturesData: [],
          differentialHighlightedFeatures: [],
          differentialOutlinedFeature: '',
          plotSingleFeatureDataLoaded: true,
          plotMultiFeatureDataLoaded: true,
        });
      }
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
      this.getMultisetColsDifferential(
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
          // Dev - if needed save this data to local storage (e.g. indexDB)
          // allMetaFeaturesDataDifferential: getMetaFeaturesResponseData,
        });
      });
  };

  getResultsLinkouts = (differentialStudy, differentialModel) => {
    const cachedResultsLinkouts = sessionStorage.getItem(
      `ResultsLinkouts-${differentialStudy}_${differentialModel}`,
    );
    if (cachedResultsLinkouts) {
      const parsedResultsLinkouts = JSON.parse(cachedResultsLinkouts);
      this.setState({
        differentialResultsLinkouts: parsedResultsLinkouts,
      });
      const cachedResultsFavicons = sessionStorage.getItem(
        `ResultsFavicons-${differentialStudy}_${differentialModel}`,
      );
      if (cachedResultsFavicons) {
        const parsedResultsFavicons = JSON.parse(cachedResultsFavicons);
        this.setState({
          differentialResultsFavicons: parsedResultsFavicons,
        });
      } else {
        this.setState({
          differentialResultsFavicons: [],
        });
        omicNavigatorService
          .getFavicons(parsedResultsLinkouts)
          .then(getFaviconsResponseData => {
            const favicons = getFaviconsResponseData || [];
            this.setState({
              differentialResultsFavicons: favicons,
            });
            sessionStorage.setItem(
              `ResultsFavicons-${differentialStudy}_${differentialModel}`,
              JSON.stringify(favicons),
            );
          });
      }
    } else {
      this.setState({
        differentialResultsLinkouts: [],
        differentialResultsFavicons: [],
      });
      omicNavigatorService
        .getResultsLinkouts(differentialStudy, differentialModel)
        .then(getResultsLinkoutsResponseData => {
          const linkouts = getResultsLinkoutsResponseData || [];
          this.setState({
            differentialResultsLinkouts: linkouts,
          });
          sessionStorage.setItem(
            `ResultsLinkouts-${differentialStudy}_${differentialModel}`,
            JSON.stringify(linkouts),
          );
          omicNavigatorService
            .getFavicons(linkouts)
            .then(getFaviconsResponseData => {
              const favicons = getFaviconsResponseData || [];
              this.setState({
                differentialResultsFavicons: favicons,
              });
              sessionStorage.setItem(
                `ResultsFavicons-${differentialStudy}_${differentialModel}`,
                JSON.stringify(favicons),
              );
            });
        });
    }
  };

  getMultisetColsDifferential = (differentialStudy, differentialModel) => {
    const cachedMultisetColsDifferential = sessionStorage.getItem(
      `MultisetCols-${differentialStudy}_${differentialModel}`,
    );
    if (cachedMultisetColsDifferential) {
      const parsedMultisetColsDifferential = JSON.parse(
        cachedMultisetColsDifferential,
      );
      this.setState({
        multisetColsDifferential: parsedMultisetColsDifferential,
      });
    } else {
      this.setState({
        multisetColsDifferential: [],
      });
      omicNavigatorService
        .getMultisetCols(differentialStudy, differentialModel)
        .then(getMultisetColsDifferentialResponseData => {
          const cols = getMultisetColsDifferentialResponseData || [];
          this.setState({
            multisetColsDifferential: cols,
          });
          sessionStorage.setItem(
            `MultisetCols-${differentialStudy}_${differentialModel}`,
            JSON.stringify(cols),
          );
        });
    }
  };

  handleDifferentialResultsTableStreaming = bool => {
    this.setState({
      differentialResultsTableStreaming: bool,
    });
  };

  disablePlotDifferential = () => {
    this.setState({
      plotMultisetLoadedDifferential: false,
    });
  };

  handleSearchResetDifferential = () => {
    this.setState({
      isValidSearchDifferential: false,
      plotMultisetLoadedDifferential: false,
      multisetButttonActiveDifferential: false,
      visible: false,
      plotOverlayVisible: false,
      plotOverlayLoaded: false,
    });
  };

  handlePlotAnimationDifferential = animation => () => {
    this.setState(prevState => ({
      animation,
      visible: !prevState.visible,
      multisetButttonActiveDifferential: !prevState.multisetButttonActiveDifferential,
    }));
  };

  handleMultisetPlot = multisetPlotResults => {
    this.setState({
      plotMultisetDataDifferential: {
        title: multisetPlotResults.svgInfo.plotType,
        svg: multisetPlotResults.svgInfo.svg,
      },
      plotMultisetLoadedDifferential: true,
    });
  };

  getPlotTransition = (id, dataItem, plotOverlayData, useId) => {
    const { differentialFeatureIdKey } = this.props;
    const differentialFeatureVar = useId
      ? id
      : dataItem[differentialFeatureIdKey];
    const self = this;
    this.setState(
      {
        plotOverlayData: plotOverlayData,
        plotOverlayDataLength: plotOverlayData.svg?.length || 0,
        plotOverlayVisible: true,
        plotOverlayLoaded: false,
      },
      function() {
        this.handleSearchChangeDifferential(
          {
            differentialStudy: this.props.differentialStudy || '',
            differentialModel: this.props.differentialModel || '',
            differentialTest: this.props.differentialTest || '',
            differentialFeature: differentialFeatureVar || '',
          },
          false,
        );
        self.getPlot('Overlay', id, true);
      },
    );
  };

  getTableHelpers = differentialFeatureIdKeyVar => {
    const self = this;
    let addParams = {};
    addParams.showPlotOverlay = (dataItem, alphanumericTrigger) => {
      return function() {
        let value = dataItem[alphanumericTrigger];
        let plotOverlayData = {
          key: `${value}`,
          title: `${alphanumericTrigger} ${value}`,
          svg: [],
        };
        self.getPlotTransition(
          dataItem[alphanumericTrigger],
          dataItem,
          plotOverlayData,
          false,
        );
      };
    };
    addParams.elementId = differentialFeatureIdKeyVar;
    this.setState({ additionalTemplateInfoDifferentialTable: addParams });
  };

  getPlot = (view, featureId, returnSVG, multifeaturePlot) => {
    const {
      differentialPlotTypes,
      differentialTestIds,
      differentialModelIds,
      differentialModelsAndTests,
      multiModelMappingFirstKey,
      multiModelMappingArrays,
    } = this.state;
    const {
      differentialStudy,
      differentialModel,
      differentialTest,
      differentialFeature,
      differentialFeatureIdKey,
    } = this.props;
    let self = this;
    const plotDataLoadedKey = `plot${view}DataLoaded`;
    this.setState({
      [plotDataLoadedKey]: false,
    });
    let id = featureId != null ? featureId : differentialFeature;
    let plotDataVar = {
      key: `${featureId}`,
      title: `${differentialFeatureIdKey} ${featureId}`,
      svg: [],
    };
    cancelRequestDifferentialResultsGetPlot();
    let cancelToken = new CancelToken(e => {
      cancelRequestDifferentialResultsGetPlot = e;
    });
    if (differentialPlotTypes.length !== 0) {
      let plots = differentialPlotTypes;
      if (multifeaturePlot) {
        plots = differentialPlotTypes.filter(p =>
          p.plotType.includes('multiFeature'),
        );
        const featuresLengthParentVar = featureId?.length || 0;
        plotDataVar = {
          key: `(${featuresLengthParentVar}-features)`,
          title: `${differentialFeatureIdKey} (${featuresLengthParentVar} Features)`,
          svg: [],
        };
      } else {
        plots = differentialPlotTypes.filter(
          p => !p.plotType.includes('multiFeature'),
        );
      }
      if (plots?.length) {
        if (returnSVG) {
          _.forEach(plots, function(plot, i) {
            const idArg = getIdArg(
              plot.plotType,
              differentialModelIds,
              differentialTestIds,
              differentialTest,
              differentialModelsAndTests,
              multiModelMappingFirstKey,
              // differentialModel,
              multiModelMappingArrays,
              id,
            );
            const testsArg = getTestsArg(
              plot.plotType,
              differentialModelIds,
              differentialTestIds,
              differentialTest,
              differentialModelsAndTests,
              multiModelMappingFirstKey,
              differentialModel,
            );
            const modelsArg = getModelsArg(
              plot.plotType,
              differentialModelIds,
              differentialTestIds,
              differentialModel,
              differentialModelsAndTests,
              multiModelMappingFirstKey,
            );
            // handle plotly differently than static plot svgs
            if (plots[i].plotType.includes('plotly')) {
              omicNavigatorService
                .plotStudyReturnSvgUrl(
                  differentialStudy,
                  modelsArg,
                  // ['12759', '53624'],
                  idArg,
                  plot.plotID,
                  plot.plotType,
                  testsArg,
                  null,
                  cancelToken,
                )
                // .then(svg => ({ svg, plotType: plot }));
                .then(svg => {
                  let svgInfo = {
                    plotType: plots[i],
                    svg,
                  };
                  plotDataVar.svg.push(svgInfo);
                  self.handleSVG(view, plotDataVar);
                });
            } else {
              omicNavigatorService
                .plotStudyReturnSvg(
                  differentialStudy,
                  modelsArg,
                  // ['12759', '53624'],
                  id,
                  plots[i].plotID,
                  plots[i].plotType,
                  testsArg,
                  null,
                  cancelToken,
                )
                .then(svg => {
                  let xml = svg?.data || null;
                  if (xml != null && xml !== []) {
                    xml = xml.replace(/id="/g, 'id="' + id + '-' + i + '-');
                    xml = xml.replace(/#glyph/g, '#' + id + '-' + i + '-glyph');
                    xml = xml.replace(/#clip/g, '#' + id + '-' + i + '-clip');
                    xml = xml.replace(
                      /<svg/g,
                      `<svg preserveAspectRatio="xMinYMin meet" class="currentSVG" id="currentSVG-${id}-${i}"`,
                    );
                    DOMPurify.addHook('afterSanitizeAttributes', function(
                      node,
                    ) {
                      if (
                        node.hasAttribute('xlink:href') &&
                        !node.getAttribute('xlink:href').match(/^#/)
                      ) {
                        node.remove();
                      }
                    });
                    // Clean HTML string and write into our DIV
                    let sanitizedSVG = DOMPurify.sanitize(xml, {
                      ADD_TAGS: ['use'],
                    });
                    let svgInfo = {
                      plotType: plots[i],
                      svg: sanitizedSVG,
                    };
                    plotDataVar.svg.push(svgInfo);
                    self.handleSVG(view, plotDataVar);
                  }
                })
                .catch(error => {
                  console.error(
                    `Error during plotStudyReturnSvg for plot ${plots[i].plotID}`,
                    error,
                  );
                  // if one of many plots fails we don't want to return to the table; eventually we should use this when single feature differentialPlotTypes length is 1
                  // self.handleItemSelected(false);
                });
            }
          });
        } else {
          // refined for dynamically sized plots on single-threaded servers (running R locally), we're using a race condition to take the first url and handle/display it asap; after that, we're using allSettled to wait for remaining urls, and then sending them all to the component as props
          const promises = plots
            .map(plot => {
              const idArg = getIdArg(
                plot.plotType,
                differentialModelIds,
                differentialTestIds,
                differentialTest,
                differentialModelsAndTests,
                multiModelMappingFirstKey,
                // differentialModel,
                multiModelMappingArrays,
                id,
              );
              const testsArg = getTestsArg(
                plot.plotType,
                differentialModelIds,
                differentialTestIds,
                differentialTest,
                differentialModelsAndTests,
                multiModelMappingFirstKey,
                differentialModel,
              );
              const modelsArg = getModelsArg(
                plot.plotType,
                differentialModelIds,
                differentialTestIds,
                differentialModel,
                differentialModelsAndTests,
                multiModelMappingFirstKey,
              );
              return omicNavigatorService
                .plotStudyReturnSvgUrl(
                  differentialStudy,
                  modelsArg,
                  // ['12759', '53624'],
                  idArg,
                  plot.plotID,
                  plot.plotType,
                  testsArg,
                  null,
                  cancelToken,
                )
                .then(svg => ({ svg, plotType: plot }));
            })
            .filter(Boolean);
          Promise.race(promises)
            .then(svg => {
              plotDataVar.svg = [svg];

              self.handleSVG(view, plotDataVar);
            })
            // Ignore error in first race - Handled later
            .catch(error => undefined)
            .then(() => {
              if (promises.length > 1) {
                const all = Promise.allSettled(promises);
                return all;
              }
            })
            .then(promiseResults => {
              if (!promiseResults) {
                // If promise.length===1, then this is undefined
                return;
              }
              const svgArray = promiseResults
                .filter(result => result.status === 'fulfilled')
                .map(({ value }) => value);
              /**
               * @type {Error[]}
               */
              const errors = promiseResults
                .filter(result => result.status === 'rejected')
                .map(({ reason }) => reason);
              if (svgArray.length) {
                self.handleSVG(view, { ...plotDataVar, svg: svgArray });
              }
              if (errors.length === promises.length) {
                throw new Error('Error during plotStudyReturnSvgUrl');
              }
              if (errors.length) {
                console.error(`Error during plotStudyReturnSvgUrl`, errors);
                // Handle errors coming in - warn users
              }
            })
            .catch(error => {
              console.error(`Error during plotStudyReturnSvgUrl`, error);
              // if one of many plots fails we don't want to alter the UI, however eventually consdider how best to handle failure when single feature differentialPlotTypes length is 1
            });
        }
      } else {
        if (view === 'Overlay') {
          // this.setState({
          // plotOverlayVisible: false,
          // plotOverlayLoaded: true,
          // featuresString: '',
          // });
          this.backToTable();
          toast.error(`No plots available for feature ${featureId}`);
        } else if (view === 'SingleFeature') {
          this.setState({
            plotSingleFeatureData: {
              key: null,
              title: '',
              svg: [],
            },
            plotSingleFeatureDataLength: 0,
            plotOverlayLoaded: true,
            plotSingleFeatureDataLoaded: true,
          });
          // toast.error(`No plots available for feature ${featureId}`);
        } else if (view === 'MultiFeature') {
          this.setState({
            plotMultiFeatureData: {
              key: null,
              title: '',
              svg: [],
            },
            plotMultiFeatureDataLength: 0,
            plotOverlayLoaded: true,
            plotMultiFeatureDataLoaded: true,
          });
          // toast.error(`No plots available for feature ${featureId}`);
        }
      }
    } else {
      this.setState({
        plotSingleFeatureData: {
          key: null,
          title: '',
          svg: [],
        },
        plotSingleFeatureDataLength: 0,
        plotMultiFeatureData: {
          key: null,
          title: '',
          svg: [],
        },
        plotMultiFeatureDataLength: 0,
        plotOverlayLoaded: true,
        plotSingleFeatureDataLoaded: true,
        plotMultiFeatureDataLoaded: true,
      });
    }
  };

  async getMultifeaturePlot(featureids) {
    if (featureids?.length) {
      const {
        differentialPlotTypes,
        differentialTestIds,
        differentialModelIds,
        differentialModelsAndTests,
        multiModelMappingFirstKey,
      } = this.state;
      const {
        differentialStudy,
        differentialModel,
        differentialFeatureIdKey,
        differentialTest,
      } = this.props;
      const self = this;
      cancelRequestDifferentialResultsGetMultifeaturePlot();
      let cancelToken = new CancelToken(e => {
        cancelRequestDifferentialResultsGetMultifeaturePlot = e;
      });
      let multifeaturePlot = differentialPlotTypes.filter(p =>
        p.plotType.includes('multiFeature'),
      );
      const featuresLengthParentVar = featureids?.length || 0;
      let plotDataVar = {
        key: `(${featuresLengthParentVar}-features)`,
        title: `${differentialFeatureIdKey} (${featuresLengthParentVar} Features)`,
        svg: [],
      };
      if (multifeaturePlot.length !== 0) {
        if (multifeaturePlot.length === 1) {
          try {
            const testsArg = getTestsArg(
              multifeaturePlot[0].plotType,
              differentialModelIds,
              differentialTestIds,
              differentialTest,
              differentialModelsAndTests,
              multiModelMappingFirstKey,
              differentialModel,
            );
            const modelsArg = getModelsArg(
              multifeaturePlot[0].plotType,
              differentialModelIds,
              differentialTestIds,
              differentialModel,
              differentialModelsAndTests,
              multiModelMappingFirstKey,
            );
            // handle plotly differently than static plot svgs
            if (multifeaturePlot[0].plotType.includes('plotly')) {
              omicNavigatorService
                .plotStudyReturnSvgUrl(
                  differentialStudy,
                  modelsArg,
                  // ['12759', '53624'],
                  featureids,
                  multifeaturePlot[0].plotID,
                  multifeaturePlot[0].plotType,
                  testsArg,
                  null,
                  cancelToken,
                )
                // .then(svg => ({ svg, plotType: plot }));
                .then(svg => {
                  let svgInfo = {
                    plotType: multifeaturePlot[0],
                    svg,
                  };
                  plotDataVar.svg.push(svgInfo);
                  self.handleSVG('Overlay', plotDataVar);
                });
            } else {
              const promise = omicNavigatorService.plotStudyReturnSvgWithTimeoutResolver(
                differentialStudy,
                modelsArg,
                featureids,
                multifeaturePlot[0].plotID,
                testsArg,
                null,
                cancelToken,
              );
              const svg = await promise;
              if (svg) {
                if (svg === true) {
                  // duration timeout
                  cancelRequestDifferentialResultsGetPlot();
                  this.getMultifeaturePlotTransition(featureids, true, 0);
                } else {
                  let svgInfo = {
                    plotType: multifeaturePlot[0],
                    svg: svg.data,
                  };
                  const featuresLengthParentVar = featureids?.length || 0;
                  const plotDataVar = {
                    key: `(${featuresLengthParentVar}-features)`,
                    title: `${differentialFeatureIdKey} (${featuresLengthParentVar} Features)`,
                    svg: [],
                  };
                  plotDataVar.svg.push(svgInfo);
                  self.handleSVG('Overlay', plotDataVar);
                }
              }
            }
          } catch (err) {
            self.handleItemSelected(false);
            return err;
          }
        } else {
          _.forEach(multifeaturePlot, function(plot, i) {
            const testsArg = getTestsArg(
              plot.plotType,
              differentialModelIds,
              differentialTestIds,
              differentialTest,
              differentialModelsAndTests,
              multiModelMappingFirstKey,
              differentialModel,
            );
            const modelsArg = getModelsArg(
              plot.plotType,
              differentialModelIds,
              differentialTestIds,
              differentialModel,
              differentialModelsAndTests,
              multiModelMappingFirstKey,
            );
            // handle plotly differently than static plot svgs
            if (multifeaturePlot[i].plotType.includes('plotly')) {
              omicNavigatorService
                .plotStudyReturnSvgUrl(
                  differentialStudy,
                  modelsArg,
                  featureids,
                  plot.plotID,
                  plot.plotType,
                  testsArg,
                  null,
                  cancelToken,
                )
                // .then(svg => ({ svg, plotType: plot }));
                .then(svg => {
                  let svgInfo = {
                    plotType: multifeaturePlot[i],
                    svg,
                  };
                  plotDataVar.svg.push(svgInfo);
                  self.handleSVG('Overlay', plotDataVar);
                });
            } else {
              omicNavigatorService
                .plotStudyReturnSvg(
                  differentialStudy,
                  modelsArg,
                  featureids,
                  multifeaturePlot[i].plotID,
                  multifeaturePlot[i].plotType,
                  testsArg,
                  null,
                  cancelToken,
                )
                .then(svg => {
                  if (svg) {
                    // if (svg === true) {
                    //   duration timeout - for multiple plots, won't open a new tab for each, but rather await the longer responses
                    //   cancelRequestDifferentialResultsGetPlot();
                    //   self.getMultifeaturePlotTransition(featureids, true, i);
                    // } else {
                    let xml = svg?.data || null;
                    if (xml != null && xml !== []) {
                      xml = xml.replace(/id="/g, 'id="' + i + '-');
                      xml = xml.replace(/#glyph/g, '#' + i + '-glyph');
                      xml = xml.replace(/#clip/g, '#' + i + '-clip');
                      xml = xml.replace(
                        /<svg/g,
                        `<svg preserveAspectRatio="xMinYMin meet" class="currentSVG" id="currentSVG-multifeatures-${i}"`,
                      );
                      DOMPurify.addHook('afterSanitizeAttributes', function(
                        node,
                      ) {
                        if (
                          node.hasAttribute('xlink:href') &&
                          !node.getAttribute('xlink:href').match(/^#/)
                        ) {
                          node.remove();
                        }
                      });
                      // Clean HTML string and write into our DIV
                      let sanitizedSVG = DOMPurify.sanitize(xml, {
                        ADD_TAGS: ['use'],
                      });
                      let svgInfo = {
                        plotType: multifeaturePlot[i],
                        svg: sanitizedSVG,
                      };

                      plotDataVar.svg.push(svgInfo);
                      self.handleSVG('Overlay', plotDataVar);
                    }
                  }
                  // }
                })
                .catch(error => {
                  console.error(
                    `Error during plotStudyReturnSvgWithTimeoutResolver for plot ${differentialPlotTypes[i].plotID}`,
                    error,
                  );
                  // if one of many plots fails we don't want to return to the table; eventually we should use this when single feature differentialPlotTypes length is 1
                  // self.handleItemSelected(false);
                  return error;
                });
            }
          });
        }
      } else {
        this.setState({
          plotOverlayData: {
            key: null,
            title: '',
            svg: [],
          },
          plotOverlayDataLength: 0,
          plotOverlayLoaded: true,
          plotSingleFeatureDataLoaded: true,
          plotMultiFeatureDataLoaded: true,
        });
      }
    } else {
      this.setState({
        plotOverlayData: {
          key: null,
          title: '',
          svg: [],
        },
        plotOverlayDataLength: 0,
        plotOverlayLoaded: true,
        plotSingleFeatureDataLoaded: true,
        plotMultiFeatureDataLoaded: true,
      });
    }
  }

  handleMultifeaturePlot = (view, tableData) => {
    const { differentialHighlightedFeaturesData } = this.state;
    const { differentialFeatureIdKey } = this.props;
    let data =
      differentialHighlightedFeaturesData.length > 0
        ? differentialHighlightedFeaturesData
        : tableData;
    const key =
      differentialHighlightedFeaturesData.length > 0
        ? 'id'
        : differentialFeatureIdKey;
    if (data.length) {
      if (data.length > this.state.plotMultiFeatureMax) {
        data = [...data.slice(0, this.state.plotMultiFeatureMax)];
      }
      const featureIds = data.map(featureId => featureId[key]);
      const returnSVG = view === 'Overlay' ? true : false;

      if (returnSVG) {
        this.getMultifeaturePlotTransition(featureIds, false, 0);
      } else {
        this.getPlot(view, featureIds, returnSVG, true);
      }
    } else return;
  };

  async getMultifeaturePlotTransition(featureids, openNewTab, plotindex) {
    const featuresString = limitValues(featureids, 100);
    if (openNewTab) {
      // if (plotindex === 0) {
      this.setState({
        plotOverlayVisible: false,
        plotOverlayLoaded: true,
        featuresString: '',
      });
      toast.success(
        'Your plot has more taken more than 10 seconds to load, so will appear in a new tab when it is ready',
      );
      const plot = await this.getMultifeaturePlotForNewTab(
        featureids,
        plotindex,
      );
      if (plot?.config?.url) {
        const newWindow = window.open(
          plot.config.url,
          '_blank',
          'noopener,noreferrer',
        );
        if (newWindow) newWindow.opener = null;
      }
      // }
    } else {
      this.setState(
        {
          plotOverlayVisible: true,
          plotOverlayLoaded: false,
          featuresString,
        },
        function() {
          this.handleSearchChangeDifferential(
            {
              differentialStudy: this.props.differentialStudy || '',
              differentialModel: this.props.differentialModel || '',
              differentialTest: this.props.differentialTest || '',
              differentialFeature: '',
            },
            false,
          );
          this.getMultifeaturePlot(featureids, true);
        },
      );
    }
  }

  async getMultifeaturePlotForNewTab(featureids, plotindex) {
    const {
      differentialPlotTypes,
      differentialTestIds,
      differentialModelIds,
      differentialModelsAndTests,
      multiModelMappingFirstKey,
    } = this.state;
    const {
      differentialStudy,
      differentialModel,
      differentialTest,
    } = this.props;
    cancelRequestDifferentialResultsGetMultifeaturePlot();
    let cancelToken = new CancelToken(e => {
      cancelRequestDifferentialResultsGetMultifeaturePlot = e;
    });
    let multifeaturePlot = differentialPlotTypes.filter(p =>
      p.plotType.includes('multiFeature'),
    );
    if (multifeaturePlot.length !== 0) {
      const testsArg = getTestsArg(
        multifeaturePlot[plotindex].plotType,
        differentialModelIds,
        differentialTestIds,
        differentialTest,
        differentialModelsAndTests,
        multiModelMappingFirstKey,
        differentialModel,
      );
      const modelsArg = getModelsArg(
        multifeaturePlot[plotindex].plotType,
        differentialModelIds,
        differentialTestIds,
        differentialModel,
        differentialModelsAndTests,
        multiModelMappingFirstKey,
      );
      try {
        const promise = omicNavigatorService.plotStudyReturnSvg(
          differentialStudy,
          modelsArg,
          featureids,
          multifeaturePlot[plotindex].plotID,
          testsArg,
          null,
          cancelToken,
        );
        const svg = await promise;
        if (svg) {
          if (svg === true) {
            // 10 second timeout
            return;
          } else return svg;
        } else return null;
      } catch (err) {
        console.log(err);
        return null;
      }
    } else {
      this.setState({
        plotOverlayData: {
          key: null,
          title: '',
          svg: [],
        },
        plotOverlayDataLength: 0,
        plotOverlayLoaded: true,
        plotSingleFeatureDataLoaded: true,
        plotMultiFeatureDataLoaded: true,
      });
    }
  }

  updateDifferentialResults = results => {
    this.setState({
      differentialResults: results,
    });
  };

  handleHighlightedFeaturesDifferential = (
    toHighlightArr,
    doNotUnhighlight,
  ) => {
    // const { differentialOutlinedFeature } = this.state;
    if (toHighlightArr?.length > 1) {
      // when multi-selecting, show svg loading
      this.setState({
        plotMultiFeatureDataLoaded: false,
        differentialHighlightedFeaturesData: toHighlightArr,
      });
    } else {
      this.setState({
        differentialHighlightedFeaturesData: toHighlightArr,
      });
    }
    if (toHighlightArr?.length > 0) {
      if (toHighlightArr.length === 1) {
        // 1 feature
        if (
          this.state.differentialHighlightedFeatures?.length === 1 &&
          this.state.differentialHighlightedFeatures[0] === toHighlightArr[0].id
        ) {
          if (!doNotUnhighlight) {
            // if not override, unhighlight row selected
            this.setState({
              differentialHighlightedFeaturesData: [],
              differentialHighlightedFeatures: [],
            });
          }
        } else {
          // new row has been selected
          const HighlightedFeaturesCopy = [...toHighlightArr];
          let differentialHighlightedFeaturesVar = [];
          if (
            HighlightedFeaturesCopy.length > 0 &&
            HighlightedFeaturesCopy != null &&
            HighlightedFeaturesCopy !== {}
          ) {
            HighlightedFeaturesCopy.forEach(element => {
              differentialHighlightedFeaturesVar.push(element.key);
            });
          }
          this.setState({
            differentialHighlightedFeaturesData: toHighlightArr,
            differentialHighlightedFeatures:
              differentialHighlightedFeaturesVar || [],
          });
        }
      } else {
        // highlight selected rows
        const HighlightedFeaturesCopy = [...toHighlightArr];
        let differentialHighlightedFeaturesVar = [];
        if (
          HighlightedFeaturesCopy.length > 0 &&
          HighlightedFeaturesCopy != null &&
          HighlightedFeaturesCopy !== {}
        ) {
          HighlightedFeaturesCopy.forEach(element => {
            differentialHighlightedFeaturesVar.push(element.key);
          });
        }
        this.setState({
          differentialHighlightedFeatures: differentialHighlightedFeaturesVar,
          differentialHighlightedFeaturesData: toHighlightArr,
        });
      }
    } else {
      this.setState({
        differentialHighlightedFeaturesData: [],
        differentialHighlightedFeatures: [],
        plotOverlayLoaded: true,
        plotSingleFeatureDataLoaded: true,
        plotMultiFeatureDataLoaded: true,
      });
    }
  };

  handleItemSelected = bool => {
    this.setState({
      plotOverlayVisible: bool,
    });
  };

  handleSVG = _.debounce((view, plotDataObj) => {
    const plotDataKey = `plot${view}Data`;
    const plotDataLengthKey = `plot${view}DataLength`;
    const plotDataLoadedKey = `plot${view}DataLoaded`;
    this.setState({
      [plotDataKey]: plotDataObj,
      [plotDataLengthKey]: plotDataObj.svg?.length || 0,
      [plotDataLoadedKey]: true,
      plotOverlayLoaded: true,
    });
  }, 750);

  backToTable = () => {
    this.setState({
      plotOverlayVisible: false,
      plotOverlayLoaded: false,
    });
    this.handleSearchChangeDifferential(
      {
        differentialStudy: this.props.differentialStudy || '',
        differentialModel: this.props.differentialModel || '',
        differentialTest: this.props.differentialTest || '',
        differentialFeature: '',
      },
      false,
    );
  };

  isChecked = item => {
    return function() {
      return this.state.differentialHighlightedFeatures.contains(
        item[this.state.differentialFeatureIdKey],
      );
    };
  };

  setPlotSelected = featureId => {
    this.setState({
      differentialOutlinedFeature: featureId || '',
    });
  };

  resetDifferentialOutlinedFeature = () => {
    // cancelRequestDifferentialResultsGetPlot();
    this.setState({
      differentialOutlinedFeature: '',
      plotSingleFeatureData: {
        key: null,
        title: '',
        svg: [],
      },
      plotSingleFeatureDataLength: 0,
      plotOverlayLoaded: true,
      plotSingleFeatureDataLoaded: false,
      plotMultiFeatureDataLoaded: true,
    });
  };

  getConfigCols = testData => {
    const differentialResultsVar = testData.differentialResults;
    const { differentialFeature } = this.props;
    const {
      differentialResultsLinkouts,
      differentialResultsFavicons,
      differentialPlotTypes,
      modelSpecificMetaFeaturesExist,
    } = this.state;
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
    // grab first object
    const firstFullObject =
      differentialResultsVar.length > 0 ? [...differentialResultsVar][0] : null;
    // if exists, loop through the values of each property,
    // find the first real value,
    // and set the config column types
    if (firstFullObject) {
      let allProperties = Object.keys(firstFullObject);
      const dataCopy = [...differentialResultsVar];
      allProperties.forEach(property => {
        // loop through data, one property at a time
        const notNullObject = dataCopy.find(row => {
          // find the first value for that property
          return isNotNANullUndefinedEmptyString(row[property]);
        });
        let notNullValue = null;
        if (notNullObject) {
          notNullValue = notNullObject[property] || null;
          // if the property has a value somewhere in the data
          if (
            typeof notNullValue === 'string' ||
            notNullValue instanceof String
          ) {
            // push it to the appropriate field type
            differentialAlphanumericFields.push(property);
          } else {
            differentialNumericFields.push(property);
          }
        } else {
          // otherwise push it to type numeric
          differentialNumericFields.push(property);
        }
      });
    }
    const alphanumericTrigger = differentialAlphanumericFields[0];
    if (differentialFeature !== '') {
      // on page refresh, handle if differential features is selected
      let plotOverlayData = {
        key: `${differentialFeature}`,
        title: `${alphanumericTrigger} ${differentialFeature}`,
        svg: [],
      };
      this.setState({
        plotOverlayData: plotOverlayData,
        plotOverlayDataLength: plotOverlayData.svg?.length || 0,
        plotOverlayVisible: true,
        plotOverlayLoaded: false,
      });
      this.getPlot('Overlay', differentialFeature, true);
    }
    this.props.onHandleDifferentialFeatureIdKey(
      'differentialFeatureIdKey',
      alphanumericTrigger,
    );
    this.getTableHelpers(alphanumericTrigger);
    const noPlots = !differentialPlotTypes?.length > 0;
    const differentialAlphanumericColumnsMapped = differentialAlphanumericFields.map(
      (f, { index }) => {
        return {
          title: f,
          field: f,
          filterable: { type: 'multiFilter' },
          template: (value, item, addParams) => {
            const keyVar = `${item[f]}-${item[alphanumericTrigger]}`;
            const differentialResultsLinkoutsKeys = Object.keys(
              differentialResultsLinkouts,
            );
            let linkoutWithIcon = null;
            if (differentialResultsLinkoutsKeys.includes(f)) {
              if (item[f] != null && item[f] !== '') {
                const columnLinkoutsObj = differentialResultsLinkouts[f];
                const columnFaviconsObj = differentialResultsFavicons[f];
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
              const popupContent = `View plots for feature ${value}`;
              const featureIdClass =
                noPlots && !modelSpecificMetaFeaturesExist
                  ? 'TableCellBold NoSelect'
                  : 'TableCellLink NoSelect';
              const featureIdClick =
                noPlots && !modelSpecificMetaFeaturesExist
                  ? null
                  : addParams.showPlotOverlay(item, alphanumericTrigger);
              return (
                <div className="NoSelect" key={keyVar}>
                  {/* {this.state.multiModelMappingFirstValuesSet ? (
                    this.state.multiModelMappingFirstValuesSet.has(value) ? (
                      // ? '*'
                      <Popup
                        trigger={
                          <Icon name="asterisk" size="small" color="blue" />
                        }
                        style={TableValuePopupStyle}
                        content="This feature is also available in all other models"
                        content="This feature is not available across models"
                        inverted
                        basic
                        // position="top left"
                      />
                    ) : null
                  ) : null} */}
                  <Popup
                    trigger={
                      <span className={featureIdClass} onClick={featureIdClick}>
                        {splitValue(value)}
                      </span>
                    }
                    style={TableValuePopupStyle}
                    className="TablePopupValue"
                    content={popupContent}
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
    const multisetColsDifferentialVar = this.listToJson(
      differentialNumericFields,
    );
    this.setState({
      differentialAlphanumericFields,
      differentialNumericFields,
      multisetColsDifferential: multisetColsDifferentialVar,
    });
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
    let checkboxCol = [];
    if (this.state.plotMultiFeatureAvailable) {
      checkboxCol = [
        {
          title: '',
          field: 'select',
          hideOnExport: true,
          sortDisabled: true,
          sortAccessor: (item, field) => console.log(item, field),
          // self.state.differentialHighlightedFeatures.contains(item),
          template: (value, item, addParams) => {
            return (
              <div className="DifferentialResultsRowCheckboxDiv">
                <Icon
                  name="square outline"
                  size="large"
                  className="DifferentialResultsRowCheckbox"
                />
              </div>
            );
          },
        },
      ];
    }

    const checkboxAndAlphanumericCols = checkboxCol.concat(
      differentialAlphanumericColumnsMapped,
    );
    const configCols = checkboxAndAlphanumericCols.concat(
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
        <DifferentialDetail
          {...this.state}
          {...this.props}
          onHandleHighlightedFeaturesDifferential={
            this.handleHighlightedFeaturesDifferential
          }
          onHandleResultsTableLoading={this.handleResultsTableLoading}
          onBackToTable={this.backToTable}
          onHandleUpdateDifferentialResults={this.updateDifferentialResults}
          onHandleVolcanoState={this.updateVolcanoState}
          onTableDataChange={this.handleTableDataChange}
          fwdRefDVC={this.differentialViewContainerRef}
          onHandleMultifeaturePlot={this.handleMultifeaturePlot}
          onGetMultifeaturePlotTransition={this.getMultifeaturePlotTransition}
          onGetPlotTransition={this.getPlotTransition}
          onGetPlot={this.getPlot}
          onSetPlotSelected={this.setPlotSelected}
          onResetDifferentialOutlinedFeature={
            this.resetDifferentialOutlinedFeature
          }
        />
      );
    } else return <TransitionStill stillMessage={message} />;
  };

  setMultiModelMappingObject = multiModelMappingObject => {
    if (!multiModelMappingObject) return;
    const multiModelMappingFirstKey = Object.keys(
      multiModelMappingObject[0],
    )[0];
    const multiModelMappingObjectCopy = [...multiModelMappingObject];
    const multiModelMappingArrays = multiModelMappingObjectCopy.filter(mm => {
      return Object.values(mm).every(x => x !== 'NA' && x !== '' && x != null);
    });
    let multiModelMappingObjectArr = [];
    multiModelMappingArrays.forEach(a => {
      multiModelMappingObjectArr.push(Object.values(a));
    });
    const multiModelMappingFlat = multiModelMappingObjectArr.flat();
    let multiModelMappingSet = new Set(multiModelMappingFlat);

    let multiModelMappingFirstKeyValues = [];
    multiModelMappingArrays.forEach(a => {
      multiModelMappingFirstKeyValues.push(a[multiModelMappingFirstKey]);
    });
    // this will be a part of phase 2, displaying in the UI what features are/are not available across models to plot
    // const multiModelMappingFirstValuesFlat = multiModelMappingFirstKeyValues.flat();
    // let multiModelMappingFirstValuesSet = new Set(
    //   multiModelMappingFirstKeyValues,
    // );

    this.setState({
      multiModelMappingFirstKey,
      multiModelMappingSet,
      multiModelMappingFirstKeyValues,
      // multiModelMappingFirstValuesSet,
      multiModelMappingArrays,
    });
  };

  getMultiModelMappingObject = differentialStudy => {
    cancelRequestGetMapping();
    let cancelToken = new CancelToken(e => {
      cancelRequestGetMapping = e;
    });
    omicNavigatorService
      .getMapping(differentialStudy, cancelToken)
      .then(mappingObj => {
        const mappingObject = mappingObj?.default || null;
        this.setMultiModelMappingObject(mappingObject);
      });
    // .catch(error => {
    //   console.error(
    //     `no multi-model mapping object available for study ${differentialStudy}`,
    //   );
    // });
  };

  render() {
    const differentialView = this.getView();
    const {
      plotMultisetDataDifferential,
      animation,
      direction,
      visible,
    } = this.state;
    const { tab, differentialStudy, differentialModel } = this.props;
    let pxToPtRatio,
      pointSize,
      width,
      height,
      divWidth,
      divHeight,
      divWidthPt,
      divHeightPt,
      divWidthPtString,
      divHeightPtString,
      pointSizeString,
      dimensions,
      srcUrl;
    if (plotMultisetDataDifferential?.svg?.length > 0) {
      pxToPtRatio = 105;
      pointSize = 12;
      width =
        window.innerWidth ||
        document.documentElement.clientWidth ||
        document.body.clientWidth;
      height =
        window.innerHeight ||
        document.documentElement.clientHeight ||
        document.body.clientHeight;
      // divWidth =
      //   this.differentialViewContainerRef?.current?.parentElement?.offsetWidth ||
      //   width - 310;
      divWidth = width * 0.75;
      divHeight = height * 0.85;
      divWidthPt = roundToPrecision(divWidth / pxToPtRatio, 1);
      divHeightPt = roundToPrecision(divHeight / pxToPtRatio, 1);
      divWidthPtString = `width=${divWidthPt}`;
      divHeightPtString = `&height=${divHeightPt}`;
      pointSizeString = `&pointsize=${pointSize}`;
      dimensions = `?${divWidthPtString}${divHeightPtString}${pointSizeString}`;
      srcUrl = `${plotMultisetDataDifferential.svg}${dimensions}`;
    }
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
          id="differentialMultisetAnalysisSVGDiv"
          className="MultisetSvgOuter"
        >
          {plotMultisetDataDifferential.svg?.length > 0 ? (
            <SVG
              cacheRequests={true}
              src={srcUrl}
              uniqueHash="b2g9e2"
              uniquifyIDs={true}
              id="differentialMultisetAnalysisSVG"
            />
          ) : null}
        </div>
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
            <DifferentialSearch
              {...this.state}
              {...this.props}
              onSearchTransitionDifferential={
                this.handleSearchTransitionDifferential
              }
              onDifferentialSearch={this.handleDifferentialSearch}
              onSearchChangeDifferential={this.handleSearchChangeDifferential}
              onSearchResetDifferential={this.handleSearchResetDifferential}
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
              onSetDifferentialTestIds={this.setDifferentialTestIds}
              onSetDifferentialModelIds={this.setDifferentialModelIds}
              onHandlePlotTypesDifferential={this.handlePlotTypesDifferential}
              onHandleResultsTableLoading={this.handleResultsTableLoading}
              onDoMetaFeaturesExist={this.doMetaFeaturesExist}
              onGetResultsLinkouts={this.getResultsLinkouts}
              onGetMultisetColsDifferential={this.getMultisetColsDifferential}
              onHandleDifferentialResultsTableStreaming={
                this.handleDifferentialResultsTableStreaming
              }
              onHandleMultisetFiltersVisibleParentRef={
                this.handleMultisetFiltersVisibleParentRef
              }
              onHandleIsFilteredDifferential={this.handleIsFilteredDifferential}
              onHandleDifferentialColumnsConfigured={
                this.handleDifferentialColumnsConfigured
              }
              onResetOverlay={this.resetOverlay}
              onGetMultiModelMappingObject={this.getMultiModelMappingObject}
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
                <ErrorBoundary>
                  <div
                    className="DifferentialViewContainer"
                    ref={this.differentialViewContainerRef}
                  >
                    {differentialView}
                  </div>
                </ErrorBoundary>
              </Sidebar.Pusher>
            </Sidebar.Pushable>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default withRouter(Differential);
