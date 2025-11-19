import React, { Component } from 'react';
import { Grid, Popup, Sidebar, Icon } from 'semantic-ui-react';
import _ from 'lodash-es';
import { CancelToken } from 'axios';
import DOMPurify from 'dompurify';
import { withRouter } from 'react-router-dom';
import SVG from 'react-inlinesvg';
import { toast } from 'react-toastify';
import {
  isNotNANullUndefinedEmptyStringInf,
  formatNumberForDisplay,
  splitValue,
  Linkout,
  roundToPrecision,
  limitValues,
  getIdArg,
  getTestsArg,
  getModelsArg,
  isMultiModelMultiTest,
} from '../Shared/helpers';
import ButtonActions from '../Shared/ButtonActions';
import DifferentialSearch from './DifferentialSearch';
import DifferentialDetail from './DifferentialDetail';
import ErrorBoundary from '../Shared/ErrorBoundary';
import { omicNavigatorService } from '../../services/omicNavigator.service';
import TransitionActive from '../Transitions/TransitionActive';
import TransitionStill from '../Transitions/TransitionStill';
import PlotHelpers from '../Shared/Plots/PlotHelpers';
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
      differentialPlotTypes: [],
      differentialModelsAndTests: [],
      differentialTestIds: [],
      differentialTestIdsCommon: [],
      differentialModelIds: [],
      // RESULTS
      differentialResultsTableLoading: false,
      // differentialResults: [],
      differentialResultsTableStreaming: true,
      differentialResultsLinkouts: [],
      differentialResultsFavicons: [],
      differentialResultsColumnTooltips: [],
      differentialPlotDescriptions: [],
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

  handleSearchTransitionDifferential = (bool) => {
    this.setState({
      isSearchingDifferential: bool,
    });
  };

  handleMultisetFiltersVisibleParentRef = (bool) => {
    this.setState({
      multisetFiltersVisibleParentRef: bool,
    });
  };

  handleIsFilteredDifferential = (bool) => {
    this.setState({
      isFilteredDifferential: bool,
    });
  };

  handleDifferentialColumnsConfigured = (bool) => {
    this.differentialColumnsConfigured = bool;
  };

  handleSearchTransitionDifferentialAlt = (bool) => {
    this.setState({
      differentialResultsTableLoading: bool,
    });
  };

  handleMultisetQueriedDifferential = (value) => {
    this.setState({
      multisetQueriedDifferential: value,
      // dynamicPlotsLoaded: !value,
    });
  };

  setDifferentialTestIds = (differentialTestIds) => {
    this.setState({
      differentialTestIds,
    });
  };

  setDifferentialModelIds = (differentialModelIds) => {
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

  handleResultsTableLoading = (bool) => {
    this.setState({
      differentialResultsTableLoading: bool,
    });
  };

  setStudyModelTestMetadata = (allTests) => {
    const modelsAndTests = Object.entries(allTests).map(
      ([modelID, testsObj]) => ({
        modelID,
        tests: Object.keys(testsObj).map((testID) => ({ testID })),
      }),
    );
    let commonTestIds = [];
    let testIDsArrays = [];
    if (modelsAndTests.length) {
      if (modelsAndTests.length === 1) {
        testIDsArrays = modelsAndTests.map((obj) => {
          return obj.tests.map((test) => test.testID);
        });
        commonTestIds = testIDsArrays.flat();
      }
      if (modelsAndTests.length > 1) {
        // Iterate over the tests of the first object
        for (const test of modelsAndTests[0].tests) {
          // Check if the testID exists in all other objects
          if (
            modelsAndTests.every((obj) =>
              obj.tests.some((t) => t.testID === test.testID),
            )
          ) {
            commonTestIds.push(test.testID);
          }
        }
        // console.log('Common testIDs across all objects:', commonTestIds);
      }
    }
    this.setState({
      differentialModelsAndTests: modelsAndTests,
      differentialTestIdsCommon: commonTestIds,
    });
  };

  handlePlotTypesDifferential = () => {
    const { differentialPlotsMetadata } = this.state;
    if (differentialPlotsMetadata.length) {
      // filter out invalid plots - plotType string must be 'singleFeature', 'multiFeature', 'singleTest', 'multiTest', 'plotly'
      const differentialPlotTypesVar = [...differentialPlotsMetadata].filter(
        // if undefined or null plotType, set default
        (plot) => {
          if (!plot.plotType) {
            plot.plotType = ['singleFeature', 'singleTest'];
          }
          let plotTypeArr = plot?.plotType;
          // Convert string to array
          if (typeof plotTypeArr === 'string') {
            plotTypeArr = [plotTypeArr];
          }
          const isValidPlotType = (pt) => {
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
          (p) => !p.plotType.includes('multiFeature'),
        );
        multiFeaturePlotTypesVar = [...differentialPlotTypesVar].filter((p) =>
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
        plotMultiFeatureAvailableVar = multiFeaturePlotTypesVar?.length
          ? true
          : false;
      }
      this.setState({
        differentialPlotTypes: differentialPlotTypesVar,
        singleFeaturePlotTypes: singleFeaturePlotTypesVar,
        multiFeaturePlotTypes: multiFeaturePlotTypesVar,
        // multiModelPlotTypes: multiModelPlotTypesVar,
        plotMultiFeatureAvailable: plotMultiFeatureAvailableVar,
      });
    } else {
      this.setState({
        differentialPlotTypes: [],
        singleFeaturePlotTypes: [],
        multiFeaturePlotTypes: [],
        // multiModelPlotTypes: [],
        plotMultiFeatureAvailable: false,
      });
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
    if (
      changes.differentialModel !== '' &&
      changes.differentialModel !== this.props.differentialModel
    ) {
      // get favicons before anything else
      this.getResultsLinkouts(
        changes.differentialStudy,
        changes.differentialModel,
      );
    }
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
      this.getMultisetColsDifferential(
        changes.differentialStudy,
        changes.differentialModel,
      );
    }
  };

  doMetaFeaturesExist = (differentialStudy, differentialModel) => {
    omicNavigatorService
      .getMetaFeatures(differentialStudy, differentialModel)
      .then((getMetaFeaturesResponseData) => {
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
          .then((getFaviconsResponseData) => {
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
        .then((getResultsLinkoutsResponseData) => {
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
            .then((getFaviconsResponseData) => {
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
        .then((getMultisetColsDifferentialResponseData) => {
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

  handleDifferentialResultsTableStreaming = (bool) => {
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

  handlePlotAnimationDifferential = (animation) => () => {
    this.setState((prevState) => ({
      animation,
      visible: !prevState.visible,
      multisetButttonActiveDifferential:
        !prevState.multisetButttonActiveDifferential,
    }));
  };

  handleMultisetPlot = (multisetPlotResults) => {
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
      function () {
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

  getTableHelpers = (differentialFeatureIdKeyVar) => {
    const self = this;
    let addParams = {};
    addParams.showPlotOverlay = (dataItem, alphanumericTrigger) => {
      return function () {
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

  /**
   * Main plot fetching function - handles all plot types
   *
   * @param {string} view - 'Overlay' | 'SingleFeature' | 'MultiFeature'
   * @param {string|Array} featureId - Feature ID(s) to plot
   * @param {boolean} returnSVG - true=fetch all immediately, false=race for first
   * @param {boolean} multifeaturePlot - true=multi-feature plots only
   */
  getPlot = (view, featureId, returnSVG, multifeaturePlot) => {
    const {
      differentialPlotTypes,
      differentialTestIds,
      differentialTestIdsCommon,
      differentialModelIds,
      differentialModelsAndTests,
      multiModelMappingFirstKey,
      multiModelMappingArrays,
      differentialPlotDescriptions,
    } = this.state;

    const {
      differentialStudy,
      differentialModel,
      differentialTest,
      differentialFeature,
      differentialFeatureIdKey,
    } = this.props;

    const self = this;
    const plotDataLoadedKey = `plot${view}DataLoaded`;

    // Set loading state
    this.setState({ [plotDataLoadedKey]: false });

    const id = featureId != null ? featureId : differentialFeature;

    // Base plot data
    let plotDataVar = PlotHelpers.createPlotDataObject(
      id,
      differentialFeatureIdKey,
      [],
    );

    // Validate plots exist
    if (!PlotHelpers.isValidPlotArray(differentialPlotTypes)) {
      console.warn('No valid plots available');
      this.handleNoPlots(view, id);
      return;
    }

    // Filter plots (single vs multi-feature)
    const plots = PlotHelpers.filterPlotsByType(
      differentialPlotTypes,
      multifeaturePlot,
    );

    if (!plots || !plots.length) {
      console.warn(
        `No ${multifeaturePlot ? 'multi' : 'single'}-feature plots available`,
      );
      this.handleNoPlots(view, id);
      return;
    }

    // Cancel token key
    const cancelTokenKey = multifeaturePlot
      ? 'multiPlot'
      : view === 'Overlay'
      ? 'overlay'
      : 'singlePlot';

    const cancelToken = PlotHelpers.createCancelToken(cancelTokenKey);

    const plotArgsConfig = {
      differentialModelIds,
      differentialTestIds,
      differentialTest,
      differentialModelsAndTests,
      multiModelMappingFirstKey,
      differentialModel,
      differentialTestIdsCommon,
      differentialPlotDescriptions,
      multiModelMappingArrays,
    };

    // ============= returnSVG=true: Fetch all plots immediately (overlay-style) =============
    if (returnSVG) {
      plots.forEach((plot, i) => {
        const { modelsArg, testsArg, idArg } = PlotHelpers.buildPlotArgs({
          plot,
          ...plotArgsConfig,
          featureId: id,
        });

        if (plot.plotType.includes('plotly')) {
          // Plotly: URL
          omicNavigatorService
            .plotStudyReturnSvgUrl(
              differentialStudy,
              modelsArg,
              idArg,
              plot.plotID,
              plot.plotType,
              testsArg,
              null,
              cancelToken,
            )
            .then((svg) => {
              const svgInfo = { plotType: plot, svg };
              plotDataVar.svg.push(svgInfo);
              self.handleSVG(view, plotDataVar);
            })
            .catch((error) => {
              if (!error.__CANCEL__) {
                console.error(
                  `Error fetching Plotly URL for ${plot.plotID}:`,
                  error,
                );
              }
            });
        } else {
          // Static SVG: fetch + sanitize
          omicNavigatorService
            .plotStudyReturnSvg(
              differentialStudy,
              modelsArg,
              id,
              plot.plotID,
              plot.plotType,
              testsArg,
              null,
              cancelToken,
            )
            .then((svg) => {
              const xml = svg?.data || null;
              if (xml && xml.length > 0) {
                const sanitizedSVG = PlotHelpers.sanitizeStaticSvg(xml, {
                  idBase: Array.isArray(id) ? 'multifeatures' : id,
                  svgIndex: i,
                  multiFeature: !!multifeaturePlot,
                });

                if (sanitizedSVG) {
                  const svgInfo = { plotType: plot, svg: sanitizedSVG };
                  plotDataVar.svg.push(svgInfo);
                  self.handleSVG(view, plotDataVar);
                }
              }
            })
            .catch((error) => {
              if (!error.__CANCEL__) {
                console.error(`Error fetching SVG for ${plot.plotID}:`, error);
              }
            });
        }
      });

      return;
    }

    // ============= returnSVG=false: Race for first, then get all (dynamic) =============
    const promises = plots
      .map((plot) => {
        const { modelsArg, testsArg, idArg } = PlotHelpers.buildPlotArgs({
          plot,
          ...plotArgsConfig,
          featureId: id,
        });

        return omicNavigatorService
          .plotStudyReturnSvgUrl(
            differentialStudy,
            modelsArg,
            idArg,
            plot.plotID,
            plot.plotType,
            testsArg,
            null,
            cancelToken,
          )
          .then((svg) => ({ svg, plotType: plot }))
          .catch((error) => {
            if (!error.__CANCEL__) {
              console.error(`Error in promise for ${plot.plotID}:`, error);
            }
            return null;
          });
      })
      .filter(Boolean);

    // Race for first result
    Promise.race(
      promises.map((p) => p.then((r) => r || Promise.reject(new Error('No result')))),
    )
      .then((firstResult) => {
        if (firstResult) {
          plotDataVar.svg = [firstResult];
          self.handleSVG(view, plotDataVar);
        }
      })
      .catch(() => {
        console.warn('Race condition failed, waiting for allSettled');
      })
      .then(() => {
        if (promises.length > 1) {
          return Promise.allSettled(promises);
        }
        return null;
      })
      .then((results) => {
        if (!results) return;

        const svgArray = results
          .filter((r) => r.status === 'fulfilled' && r.value !== null)
          .map(({ value }) => value);

        const errors = results
          .filter((r) => r.status === 'rejected')
          .map(({ reason }) => reason);

        if (svgArray.length) {
          self.handleSVG(view, { ...plotDataVar, svg: svgArray });
        } else if (errors.length === promises.length) {
          console.error('All plot fetches failed');
          self.handleNoPlots(view, id);
        }

        if (errors.length && errors.length < promises.length) {
          console.warn(`${errors.length} plot(s) failed to load`);
        }
      })
      .catch((error) => {
        console.error('Critical error in plot fetching:', error);
        self.handleNoPlots(view, id);
      });
  };

  /**
   * Handles case where no plots are available
   */
  handleNoPlots = (view, featureId) => {
    const emptyData = PlotHelpers.createEmptyPlotData();

    if (view === 'Overlay') {
      this.backToTable();
      toast.error(`No plots available for feature ${featureId}`);
    } else {
      this.setState({
        [`plot${view}Data`]: emptyData,
        [`plot${view}DataLength`]: 0,
        [`plot${view}DataLoaded`]: true,
        plotOverlayLoaded: true,
      });
    }
  };

  /**
   * Fetches multi-feature plot with timeout handling
   *
   * For large feature sets, plots may take >10 seconds.
   * If timeout occurs, opens plot in new browser tab.
   */
  async getMultifeaturePlot(featureids) {
    // Validate input
    if (!featureids || !Array.isArray(featureids) || !featureids.length) {
      this.setState({
        plotOverlayData: PlotHelpers.createEmptyPlotData(),
        plotOverlayDataLength: 0,
        plotOverlayLoaded: true,
        plotSingleFeatureDataLoaded: true,
        plotMultiFeatureDataLoaded: true,
      });
      return;
    }

    const {
      differentialPlotTypes,
      differentialTestIds,
      differentialTestIdsCommon,
      differentialModelIds,
      differentialModelsAndTests,
      multiModelMappingFirstKey,
      differentialPlotDescriptions,
      multiModelMappingArrays,
    } = this.state;

    const {
      differentialStudy,
      differentialModel,
      differentialFeatureIdKey,
      differentialTest,
    } = this.props;

    const self = this;

    // Cancel token for multi plots
    const cancelToken = PlotHelpers.createCancelToken('multiPlot');

    // Filter for multi-feature plots only
    const multifeaturePlots = PlotHelpers.filterPlotsByType(
      differentialPlotTypes,
      true,
    );

    // Create plot data structure
    const plotDataVar = PlotHelpers.createPlotDataObject(
      featureids,
      differentialFeatureIdKey,
      [],
    );

    // No multi-feature plots
    if (!multifeaturePlots || !multifeaturePlots.length) {
      this.setState({
        plotOverlayData: PlotHelpers.createEmptyPlotData(),
        plotOverlayDataLength: 0,
        plotOverlayLoaded: true,
        plotSingleFeatureDataLoaded: true,
        plotMultiFeatureDataLoaded: true,
      });
      return;
    }

    const plotArgsConfig = {
      differentialModelIds,
      differentialTestIds,
      differentialTest,
      differentialModelsAndTests,
      multiModelMappingFirstKey,
      differentialModel,
      differentialTestIdsCommon,
      differentialPlotDescriptions,
      multiModelMappingArrays,
    };

    // ============= Single Multi-Feature Plot =============
    if (multifeaturePlots.length === 1) {
      const plot = multifeaturePlots[0];

      try {
        const { modelsArg, testsArg } = PlotHelpers.buildPlotArgs({
          plot,
          ...plotArgsConfig,
          featureId: featureids,
        });

        if (plot.plotType.includes('plotly')) {
          const svg = await omicNavigatorService.plotStudyReturnSvgUrl(
            differentialStudy,
            modelsArg,
            featureids,
            plot.plotID,
            plot.plotType,
            testsArg,
            null,
            cancelToken,
          );

          const svgInfo = { plotType: plot, svg };
          plotDataVar.svg.push(svgInfo);
          self.handleSVG('Overlay', plotDataVar);
        } else {
          // Static SVG with timeout
          const result =
            await omicNavigatorService.plotStudyReturnSvgWithTimeoutResolver(
              differentialStudy,
              modelsArg,
              featureids,
              plot.plotID,
              testsArg,
              null,
              cancelToken,
            );

          if (result === true) {
            PlotHelpers.cancelRequest('multiPlot');
            this.getMultifeaturePlotTransition(featureids, true, 0);
          } else if (result && result.data) {
            const sanitizedSVG = PlotHelpers.sanitizeStaticSvg(result.data, {
              idBase: 'multifeatures',
              svgIndex: 0,
              multiFeature: true,
            });

            if (sanitizedSVG) {
              const svgInfo = { plotType: plot, svg: sanitizedSVG };
              plotDataVar.svg.push(svgInfo);
              self.handleSVG('Overlay', plotDataVar);
            }
          } else {
            console.warn('No SVG data returned for multi-feature plot');
            self.handleItemSelected(false);
          }
        }
      } catch (error) {
        if (!error.__CANCEL__) {
          console.error('Error fetching single multi-feature plot:', error);
        }
        self.handleItemSelected(false);
      }

      return;
    }

    // ============= Multiple Multi-Feature Plots =============
    multifeaturePlots.forEach((plot, i) => {
      const { modelsArg, testsArg } = PlotHelpers.buildPlotArgs({
        plot,
        ...plotArgsConfig,
        featureId: featureids,
      });

      if (plot.plotType.includes('plotly')) {
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
          .then((svg) => {
            const svgInfo = { plotType: plot, svg };
            plotDataVar.svg.push(svgInfo);
            self.handleSVG('Overlay', plotDataVar);
          })
          .catch((error) => {
            if (!error.__CANCEL__) {
              console.error(`Error fetching Plotly for ${plot.plotID}:`, error);
            }
          });
      } else {
        omicNavigatorService
          .plotStudyReturnSvg(
            differentialStudy,
            modelsArg,
            featureids,
            plot.plotID,
            plot.plotType,
            testsArg,
            null,
            cancelToken,
          )
          .then((svg) => {
            if (!svg || !svg.data) return;

            const xml = svg.data;
            if (xml && xml.length > 0) {
              const sanitizedSVG = PlotHelpers.sanitizeStaticSvg(xml, {
                idBase: 'multifeatures',
                svgIndex: i,
                multiFeature: true,
              });

              if (sanitizedSVG) {
                const svgInfo = { plotType: plot, svg: sanitizedSVG };
                plotDataVar.svg.push(svgInfo);
                self.handleSVG('Overlay', plotDataVar);
              }
            }
          })
          .catch((error) => {
            if (!error.__CANCEL__) {
              console.error(`Error fetching SVG for ${plot.plotID}:`, error);
            }
          });
      }
    });
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
      const featureIds = data.map((featureId) => featureId[key]);
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
        function () {
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

  /**
   * Fetches multi-feature plot for new tab (no timeout)
   * Used when plot takes >10 seconds to render
   *
   * @param {Array<string>} featureids - Feature IDs to plot
   * @param {number} plotindex - Index of plot to fetch
   * @returns {Promise<Object|null>} SVG response or null
   */
  async getMultifeaturePlotForNewTab(featureids, plotindex) {
    const {
      differentialPlotTypes,
      differentialTestIds,
      differentialTestIdsCommon,
      differentialModelIds,
      differentialModelsAndTests,
      multiModelMappingFirstKey,
      differentialPlotDescriptions,
      multiModelMappingArrays,
    } = this.state;

    const { differentialStudy, differentialModel, differentialTest } =
      this.props;

    const cancelToken = PlotHelpers.createCancelToken('multiPlot');

    const multifeaturePlots = PlotHelpers.filterPlotsByType(
      differentialPlotTypes,
      true,
    );

    if (
      !multifeaturePlots ||
      !multifeaturePlots.length ||
      !multifeaturePlots[plotindex]
    ) {
      console.warn('Invalid plot index or no multi-feature plots available');
      return null;
    }

    const plot = multifeaturePlots[plotindex];

    const { modelsArg, testsArg } = PlotHelpers.buildPlotArgs({
      plot,
      differentialModelIds,
      differentialTestIds,
      differentialTest,
      differentialModelsAndTests,
      multiModelMappingFirstKey,
      differentialModel,
      differentialTestIdsCommon,
      differentialPlotDescriptions,
      multiModelMappingArrays,
      featureId: featureids,
    });

    try {
      const svg = await omicNavigatorService.plotStudyReturnSvg(
        differentialStudy,
        modelsArg,
        featureids,
        plot.plotID,
        plot.plotType,
        testsArg,
        null,
        cancelToken,
      );

      if (!svg || svg === true) {
        return null;
      }

      return svg;
    } catch (error) {
      if (!error.__CANCEL__) {
        console.error('Error fetching plot for new tab:', error);
      }
      return null;
    }
  }

  updateDifferentialResults = (results) => {
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
            HighlightedFeaturesCopy != null
          ) {
            HighlightedFeaturesCopy.forEach((element) => {
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
          HighlightedFeaturesCopy != null
        ) {
          HighlightedFeaturesCopy.forEach((element) => {
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

  handleItemSelected = (bool) => {
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

  isChecked = (item) => {
    return function () {
      return this.state.differentialHighlightedFeatures.contains(
        item[this.state.differentialFeatureIdKey],
      );
    };
  };

  setPlotSelected = (featureId) => {
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

  getConfigCols = (testData) => {
    const differentialResultsVar = testData.differentialResults;
    const {
      differentialFeature,
      onHandleDifferentialFeatureIdKey,
      differentialModel,
      differentialTest,
    } = this.props;
    const {
      differentialResultsLinkouts,
      differentialResultsFavicons,
      differentialResultsColumnTooltips,
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
      let differentialColumnsConfiguredVar = false;
      allProperties.forEach((property) => {
        // loop through data, one property at a time
        const notNullObject = dataCopy.find((row) => {
          // find the first value for that property
          return isNotNANullUndefinedEmptyStringInf(row[property]);
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
          // if this occurs, the first 30 records streamed
          // did not have a value for all properties
          // we push it to number just so we can show the table quickly
          differentialNumericFields.push(property);
          // but set flag false so this func can be called again
          differentialColumnsConfiguredVar = false;
        }
        this.differentialColumnsConfigured = differentialColumnsConfiguredVar;
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
    onHandleDifferentialFeatureIdKey(
      'differentialFeatureIdKey',
      alphanumericTrigger,
    );
    this.getTableHelpers(alphanumericTrigger);
    const noPlots = !differentialPlotTypes?.length > 0;
    const differentialAlphanumericColumnsMapped =
      differentialAlphanumericFields.map((f, { index }) => {
        return {
          title: f,
          headerAttributes: {
            title:
              differentialResultsColumnTooltips?.[differentialModel]?.[
                differentialTest
              ]?.[f] || null,
          },
          exportTitle: f,
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
                  const columnFaviconsIsArray =
                    Array.isArray(columnFaviconsObj);
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
      });
    const multisetColsDifferentialVar = this.listToJson(
      differentialNumericFields,
    );
    this.setState({
      differentialAlphanumericFields,
      differentialNumericFields,
      multisetColsDifferential: multisetColsDifferentialVar,
    });
    const differentialNumericColumnsMapped = differentialNumericFields.map(
      (c) => {
        return {
          title: c,
          headerAttributes: {
            title:
              differentialResultsColumnTooltips?.[differentialModel]?.[
                differentialTest
              ]?.[c] || null,
          },
          field: c,
          type: 'number',
          filterable: { type: 'numericFilter' },
          exportTemplate: (value) => (value ? `${value}` : 'N/A'),
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
    checkboxCol = [
      {
        title: '',
        field: 'select',
        hideOnExport: true,
        sortDisabled: true,
        // sortAccessor: (item, field) => console.log(item, field),
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
    const { differentialStudy, differentialModel, differentialTest } =
      this.props;
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

  setMultiModelMappingObject = (multiModelMappingObject) => {
    if (!multiModelMappingObject) return;
    const multiModelMappingFirstKey = Object.keys(
      multiModelMappingObject[0],
    )[0];
    const multiModelMappingObjectCopy = [...multiModelMappingObject];
    const multiModelMappingArrays = multiModelMappingObjectCopy.filter((mm) => {
      return Object.values(mm).every(
        (x) =>
          x !== 'NA' && x !== '' && x != null && x !== 'Inf' && x !== '-Inf',
      );
    });
    let multiModelMappingObjectArr = [];
    multiModelMappingArrays.forEach((a) => {
      multiModelMappingObjectArr.push(Object.values(a));
    });
    const multiModelMappingFlat = multiModelMappingObjectArr.flat();
    let multiModelMappingSet = new Set(multiModelMappingFlat);

    let multiModelMappingFirstKeyValues = [];
    multiModelMappingArrays.forEach((a) => {
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

  getMultiModelMappingObject = (differentialStudy) => {
    cancelRequestGetMapping();
    let cancelToken = new CancelToken((e) => {
      cancelRequestGetMapping = e;
    });
    omicNavigatorService
      .getMapping(differentialStudy, cancelToken)
      .then((mappingObj) => {
        const mappingObject = mappingObj?.default || null;
        this.setMultiModelMappingObject(mappingObject);
      });
    // .catch(error => {
    //   console.error(
    //     `no multi-model mapping object available for study ${differentialStudy}`,
    //   );
    // });
  };

  setDifferentialResultsColumnTooltips = (response) => {
    this.setState({
      differentialResultsColumnTooltips: response,
    });
  };

  setDifferentialPlotDescriptions = (response) => {
    /**
     * @param {Object} plots - The plots object, e.g. { lineplot: { displayName: "Line plot", plotType: "singleFeature" }, ... }
     * @returns {Array} Array of plot metadata objects: [{ plotID, plotDisplay, plotType }]
     */
    function convertGetPlotsTypeToListStudiesType(plots) {
      if (!plots || typeof plots !== 'object') return [];
      return Object.entries(plots).map(([plotID, plotObj]) => ({
        plotID,
        plotDisplay: plotObj.displayName,
        plotType: plotObj.plotType,
      }));
    }
    const plotsMetadata = convertGetPlotsTypeToListStudiesType(response);
    this.setState(
      {
        differentialPlotDescriptions: response,
        differentialPlotsMetadata: plotsMetadata,
      },
      () => {
        this.handlePlotTypesDifferential();
      },
    );
  };

  render() {
    const differentialView = this.getView();
    const { plotMultisetDataDifferential, animation, direction, visible } =
      this.state;
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
            mobile={4}
            tablet={4}
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
              onSetDifferentialResultsColumnTooltips={
                this.setDifferentialResultsColumnTooltips
              }
              onSetDifferentialPlotDescriptions={
                this.setDifferentialPlotDescriptions
              }
            />
          </Grid.Column>
          <Grid.Column
            className="DifferentialContentContainer"
            mobile={12}
            tablet={12}
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
