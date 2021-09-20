import React, { Component } from 'react';
import { Grid, Popup, Sidebar } from 'semantic-ui-react';
import { withRouter } from 'react-router-dom';
import SVG from 'react-inlinesvg';
import { CancelToken } from 'axios';
import DOMPurify from 'dompurify';
import _ from 'lodash';
import { toast } from 'react-toastify';
import {
  formatNumberForDisplay,
  splitValue,
  Linkout,
  roundToPrecision,
  limitValues,
} from '../Shared/helpers';
import DifferentialSearchCriteria from './DifferentialSearchCriteria';
import TransitionActive from '../Transitions/TransitionActive';
import TransitionStill from '../Transitions/TransitionStill';
import ButtonActions from '../Shared/ButtonActions';
import { omicNavigatorService } from '../../services/omicNavigator.service';
import DifferentialVolcano from './DifferentialVolcano';
import ErrorBoundary from '../Shared/ErrorBoundary';
import './Differential.scss';
import '../Shared/Table.scss';

let cancelRequestDifferentialResultsGetPlot = () => {};
let cancelRequestDifferentialResultsGetMultifeaturePlot = () => {};
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
    this.state = {
      isValidSearchDifferential: false,
      isSearchingDifferential: false,
      isVolcanoTableLoading: false,
      // differentialResults: [],
      // differentialResultsUnfiltered: [],
      /**
       * @type {QHGrid.ColumnConfig[]}
       */
      // differentialColumns: [],
      multisetPlotInfoDifferential: {
        title: '',
        svg: [],
      },
      isItemSelected: false,
      isItemSVGLoaded: false,
      isUpsetVisible: false,
      isFilteredDifferential: false,
      // isItemDatatLoaded: false,
      HighlightedFeaturesArrVolcano: [],
      // volcanoDifferentialTableRowMax: '',
      // volcanoDifferentialTableRowOther: [],
      volcanoDifferentialTableRowHyperlink: '',
      // maxObjectIdentifier: null,
      imageInfoVolcano: {
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
      upsetColsDifferential: [],
      tabsMessage: 'Select a feature to display plots',
      // differentialPlotTypes: [],
      differentialStudyMetadata: [],
      differentialModelsAndTests: [],
      differentialTestsMetadata: [],
      differentialTestIds: [],
      modelSpecificMetaFeaturesExist: true,
      resultsLinkouts: [],
      resultsFavicons: [],
      isVolcanoPlotSVGLoaded: true,
      allMetaFeaturesDataDifferential: [],
      isDataStreamingResultsTable: true,
      enableMultifeaturePlotting: false,
      updateVolcanoLabels: false,
      multifeaturePlotMax: 1000,
    };
  }

  differentialViewContainerRef = React.createRef();
  differentialGridRef = React.createRef();

  shouldComponentUpdate(nextProps) {
    return nextProps.tab === 'differential';
  }

  componentDidUpdate(prevProps, prevState) {
    const { volcanoDifferentialTableRowHyperlink } = this.state;
    if (
      volcanoDifferentialTableRowHyperlink === '' &&
      volcanoDifferentialTableRowHyperlink !==
        prevState.volcanoDifferentialTableRowHyperlink
    ) {
      this.handlePlotVolcano(this.state.maxObjectIdentifier, true);
    }
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

  handleUpsetVisible = bool => {
    this.setState({
      isUpsetVisible: bool,
    });
  };

  handleIsFilteredDifferential = bool => {
    this.setState({
      isFilteredDifferential: bool,
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

  setDifferentialTestIds = differentialTestIds => {
    this.setState({
      differentialTestIds,
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
      plotButtonActiveDifferential: false,
      visible: false,
      isItemSVGLoaded: false,
    });

    if (streamingFinished) {
      this.setState({ isDataStreamingResultsTable: false });
    }
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
        imageInfoVolcano: { key: null, title: '', svg: [] },
        imageInfoDifferential: { key: null, title: '', svg: [] },
        tabsMessage: 'Select a feature to display plots',
        // differentialResults: [],
        // differentialResultsUnfiltered: [],
        // isItemDatatLoaded: false,
        HighlightedFeaturesArrVolcano: [],
        volcanoDifferentialTableRowMax: '',
        volcanoDifferentialTableRowOther: [],
        volcanoDifferentialTableRowHyperlink: '',
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
      this.getUpsetColsDifferential(
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
        // Paul - save this data to local storage (e.g. indexDB)
        this.setState({
          modelSpecificMetaFeaturesExist: exist,
          allMetaFeaturesDataDifferential: getMetaFeaturesResponseData,
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
        resultsLinkouts: parsedResultsLinkouts,
      });
      const cachedResultsFavicons = sessionStorage.getItem(
        `ResultsFavicons-${differentialStudy}_${differentialModel}`,
      );
      if (cachedResultsFavicons) {
        const parsedResultsFavicons = JSON.parse(cachedResultsFavicons);
        this.setState({
          resultsFavicons: parsedResultsFavicons,
        });
      } else {
        this.setState({
          resultsFavicons: [],
        });
        omicNavigatorService
          .getFavicons(parsedResultsLinkouts)
          .then(getFaviconsResponseData => {
            const favicons = getFaviconsResponseData || [];
            this.setState({
              resultsFavicons: favicons,
            });
            sessionStorage.setItem(
              `ResultsFavicons-${differentialStudy}_${differentialModel}`,
              JSON.stringify(favicons),
            );
          });
      }
    } else {
      this.setState({
        resultsLinkouts: [],
        resultsFavicons: [],
      });
      omicNavigatorService
        .getResultsLinkouts(differentialStudy, differentialModel)
        .then(getResultsLinkoutsResponseData => {
          const linkouts = getResultsLinkoutsResponseData || [];
          this.setState({
            resultsLinkouts: linkouts,
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
                resultsFavicons: favicons,
              });
              sessionStorage.setItem(
                `ResultsFavicons-${differentialStudy}_${differentialModel}`,
                JSON.stringify(favicons),
              );
            });
        });
    }
  };

  getUpsetColsDifferential = (differentialStudy, differentialModel) => {
    const cachedUpsetColsDifferential = sessionStorage.getItem(
      `UpsetCols-${differentialStudy}_${differentialModel}`,
    );
    if (cachedUpsetColsDifferential) {
      const parsedUpsetColsDifferential = JSON.parse(
        cachedUpsetColsDifferential,
      );
      this.setState({
        upsetColsDifferential: parsedUpsetColsDifferential,
      });
    } else {
      this.setState({
        upsetColsDifferential: [],
      });
      omicNavigatorService
        .getUpsetCols(differentialStudy, differentialModel)
        .then(getUpsetColsDifferentialResponseData => {
          const cols = getUpsetColsDifferentialResponseData || [];
          this.setState({
            upsetColsDifferential: cols,
          });
          sessionStorage.setItem(
            `UpsetCols-${differentialStudy}_${differentialModel}`,
            JSON.stringify(cols),
          );
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

  getPlotTransition = (id, dataItem, imageInfoDifferential, useId) => {
    const { differentialFeatureIdKey } = this.props;
    const differentialFeatureVar = useId
      ? id
      : dataItem[differentialFeatureIdKey];
    const self = this;
    this.setState(
      {
        imageInfoDifferential: imageInfoDifferential,
        imageInfoDifferentialLength: imageInfoDifferential.svg?.length || 0,
        isItemSelected: true,
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
            differentialFeature: differentialFeatureVar || '',
          },
          false,
        );
        self.getPlot('Differential', id, true);
      },
    );
  };

  getTableHelpers = differentialFeatureIdKeyVar => {
    const self = this;
    let addParams = {};
    addParams.showPlotDifferential = (dataItem, alphanumericTrigger) => {
      return function() {
        self.setState({
          volcanoDifferentialTableRowHyperlink: dataItem[alphanumericTrigger],
        });
        self.getPlot('Volcano', dataItem[alphanumericTrigger], false, false);
      };
    };
    addParams.elementId = differentialFeatureIdKeyVar;
    this.setState({ additionalTemplateInfoDifferentialTable: addParams });
  };

  getPlot = (view, featureId, returnSVG, multifeaturePlot) => {
    const { differentialPlotTypes, differentialTestIds } = this.state;
    const {
      differentialStudy,
      differentialModel,
      differentialTest,
      differentialFeature,
      differentialFeatureIdKey,
    } = this.props;
    let self = this;
    let id = featureId != null ? featureId : differentialFeature;
    let imageInfoVar = {
      key: `${featureId}`,
      title: `${differentialFeatureIdKey} ${featureId}`,
      svg: [],
    };
    let currentSVGs = [];
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
        const featuresLengthVar = featureId.length;
        imageInfoVar = {
          key: `(${featuresLengthVar}-features)`,
          title: `${differentialFeatureIdKey} (${featuresLengthVar} Features)`,
          svg: [],
        };
      } else {
        plots = differentialPlotTypes.filter(
          p => !p.plotType.includes('multiFeature'),
        );
      }
      if (returnSVG) {
        _.forEach(plots, function(plot, i) {
          // if (plots[i].plotType.includes('multiFeature')) {
          //   return;
          // }
          const testsArg = plots[i].plotType.includes('multiTest')
            ? differentialTestIds
            : differentialTest;
          omicNavigatorService
            .plotStudyReturnSvg(
              differentialStudy,
              differentialModel,
              // ['12759', '53624'],
              id,
              plots[i].plotID,
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
                let sanitizedSVG = DOMPurify.sanitize(xml, {
                  ADD_TAGS: ['use'],
                });
                let svgInfo = {
                  plotType: plots[i],
                  svg: sanitizedSVG,
                };
                imageInfoVar.svg.push(svgInfo);
                currentSVGs.push(sanitizedSVG);
                self.handleSVG(view, imageInfoVar);
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
        });
      } else {
        // refined for dynamically sized plots on single-threaded servers (running R locally), we're using a race condition to take the first url and handle/display it asap; after that, we're using allSettled to wait for remaining urls, and then sending them all to the component as props
        const promises = plots
          .map(plot => {
            const testsArg = plot.plotType.includes('multiTest')
              ? differentialTestIds
              : differentialTest;
            return omicNavigatorService
              .plotStudyReturnSvgUrl(
                differentialStudy,
                differentialModel,
                // ['12759', '53624'],
                id,
                plot.plotID,
                testsArg,
                null,
                cancelToken,
              )
              .then(svg => ({ svg, plotType: plot }));
          })
          .filter(Boolean);
        Promise.race(promises)
          .then(svg => {
            imageInfoVar.svg = [svg];
            self.handleSVG(view, imageInfoVar);
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
              self.handleSVG(view, { ...imageInfoVar, svg: svgArray });
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
      this.setState({
        imageInfoVolcano: {
          key: null,
          title: '',
          svg: [],
        },
        isItemSVGLoaded: true,
        isVolcanoPlotSVGLoaded: true,
      });
    }
  };

  async getMultifeaturePlot(featureids) {
    if (featureids?.length) {
      const { differentialPlotTypes, differentialTestIds } = this.state;
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
      const featuresLengthVar = featureids.length;
      let imageInfoVar = {
        key: `(${featuresLengthVar}-features)`,
        title: `${differentialFeatureIdKey} (${featuresLengthVar} Features)`,
        svg: [],
      };
      let currentSVGs = [];
      if (multifeaturePlot.length !== 0) {
        if (multifeaturePlot.length === 1) {
          try {
            const testsArg = multifeaturePlot[0].plotType.includes('multiTest')
              ? differentialTestIds
              : differentialTest;
            const promise = omicNavigatorService.plotStudyReturnSvgWithTimeoutResolver(
              differentialStudy,
              differentialModel,
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
                const featuresLengthVar = featureids.length;
                const imageInfoVar = {
                  key: `(${featuresLengthVar}-features)`,
                  title: `${differentialFeatureIdKey} (${featuresLengthVar} Features)`,
                  svg: [],
                };
                imageInfoVar.svg.push(svgInfo);
                self.handleSVG('Differential', imageInfoVar);
              }
            }
          } catch (err) {
            self.handleItemSelected(false);
            return err;
          }
        } else {
          _.forEach(multifeaturePlot, function(plot, i) {
            const testsArg = plot.plotType.includes('multiTest')
              ? differentialTestIds
              : differentialTest;

            omicNavigatorService
              .plotStudyReturnSvg(
                differentialStudy,
                differentialModel,
                featureids,
                multifeaturePlot[i].plotID,
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
                      `<svg preserveAspectRatio="xMinYMin meet" id="currentSVG-multifeatures-${i}"`,
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

                    imageInfoVar.svg.push(svgInfo);
                    currentSVGs.push(sanitizedSVG);
                    self.handleSVG('Differential', imageInfoVar);
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
          });
        }
      } else {
        this.setState({
          imageInfoDifferential: {
            key: null,
            title: '',
            svg: [],
          },
          isItemSVGLoaded: true,
          isVolcanoPlotSVGLoaded: true,
        });
      }
    } else {
      this.setState({
        imageInfoDifferential: {
          key: null,
          title: '',
          svg: [],
        },
        isItemSVGLoaded: true,
        isVolcanoPlotSVGLoaded: true,
      });
    }
  }

  handleMultifeaturePlot = (view, tableData) => {
    debugger;
    const { HighlightedFeaturesArrVolcano } = this.state;
    const { differentialFeatureIdKey } = this.props;
    let data =
      HighlightedFeaturesArrVolcano.length > 1
        ? HighlightedFeaturesArrVolcano
        : tableData;
    const key =
      HighlightedFeaturesArrVolcano.length > 1
        ? 'id'
        : differentialFeatureIdKey;
    if (data.length) {
      if (data.length > this.state.multifeaturePlotMax) {
        data = [...data.slice(0, this.state.multifeaturePlotMax)];
      }
      const featureIds = data.map(featureId => featureId[key]);
      // this.getMultifeaturePlotTransition(featureIds, false, 0);
      this.getPlot(view, featureIds, false, true);
    } else return;
  };

  async getMultifeaturePlotTransition(featureids, openNewTab, plotindex) {
    const featuresString = limitValues(featureids, 100);
    if (openNewTab) {
      // if (plotindex === 0) {
      this.setState({
        isItemSelected: false,
        isItemSVGLoaded: true,
        // isItemDatatLoaded: false,
        currentSVGs: [],
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
          // isItemSelected: true,
          // isItemSVGLoaded: false,
          // isItemDatatLoaded: false,
          currentSVGs: [],
          featuresString,
        },
        function() {
          this.handleSearchCriteriaChangeDifferential(
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
    const { differentialPlotTypes, differentialTestIds } = this.state;
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
      const testsArg = multifeaturePlot[plotindex].plotType.includes(
        'multiTest',
      )
        ? differentialTestIds
        : differentialTest;
      try {
        const promise = omicNavigatorService.plotStudyReturnSvg(
          differentialStudy,
          differentialModel,
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
        imageInfoDifferential: {
          key: null,
          title: '',
          svg: [],
        },
        isItemSVGLoaded: true,
        isVolcanoPlotSVGLoaded: true,
      });
    }
  }

  updateDifferentialResults = results => {
    this.setState({
      differentialResults: results,
    });
  };

  handleSelectedVolcano = (toHighlightArr, doNotUnhighlight) => {
    this.setState({
      HighlightedFeaturesArrVolcano: toHighlightArr,
    });
    if (toHighlightArr.length > 0) {
      // unhighlight single row if already highlighted
      if (
        toHighlightArr.length === 1 &&
        this.state.volcanoDifferentialTableRowOther?.length === 0 &&
        !doNotUnhighlight
      ) {
        if (
          toHighlightArr[0].id === this.state.volcanoDifferentialTableRowMax
        ) {
          this.setState({
            HighlightedFeaturesArrVolcano: [],
            volcanoDifferentialTableRowMax: '',
            volcanoDifferentialTableRowOther: [],
            volcanoDifferentialTableRowHyperlink: '',
          });
          this.handlePlotVolcano('');
          return;
        }
      }
      // highlight max and other
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
        volcanoDifferentialTableRowHyperlink: '',
        // volcanoDifferentialTableAll: toHighlightArr,
        HighlightedFeaturesArrVolcano: toHighlightArr,
        updateVolcanoLabels: true,
      });
      this.handlePlotVolcano(maxId);
    } else {
      this.setState({
        HighlightedFeaturesArrVolcano: [],
        volcanoDifferentialTableRowMax: '',
        volcanoDifferentialTableRowOther: [],
        volcanoDifferentialTableRowHyperlink: '',
        updateVolcanoLabels: true,
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

  handlePlotVolcano = (maxId, rerenderMaxPlot) => {
    if (maxId !== '') {
      if (this.state.maxObjectIdentifier !== maxId || rerenderMaxPlot) {
        this.setState({
          isVolcanoPlotSVGLoaded: false,
          maxObjectIdentifier: maxId,
        });
        this.getPlot('Volcano', maxId, false);
      }
    } else {
      this.setState({
        isVolcanoPlotSVGLoaded: true,
        maxObjectIdentifier: '',
        imageInfoVolcano: {
          key: null,
          title: '',
          svg: [],
        },
      });
    }
  };

  handleItemSelected = bool => {
    this.setState({
      isItemSelected: bool,
    });
  };

  handleSVG = (view, imageInfoArg) => {
    const imageInfoKey = `imageInfo${view}`;
    const imageInfoLengthKey = `imageInfo${view}Length`;
    this.setState({
      [imageInfoKey]: imageInfoArg,
      [imageInfoLengthKey]: imageInfoArg.svg?.length || 0,
      isItemSVGLoaded: true,
      isVolcanoPlotSVGLoaded: true,
    });
  };

  backToTable = () => {
    this.setState({
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
    function isNotNANorNullNorUndefined(o) {
      return typeof o !== 'undefined' && o !== null && o !== 'NA';
    }
    function everyIsNotNANorNullNorUndefined(arr) {
      return arr.every(isNotNANorNullNorUndefined);
    }
    const objectValuesArr = [...differentialResultsVar].map(f =>
      Object.values(f),
    );
    const firstFullObjectIndex = objectValuesArr.findIndex(
      everyIsNotNANorNullNorUndefined,
    );
    const firstFullObject = differentialResultsVar[firstFullObjectIndex];
    for (let [key, value] of Object.entries(firstFullObject)) {
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
        imageInfoDifferentialLength: imageInfoDifferential.svg?.length || 0,
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
            tabsMessage: 'No plots available',
          });
        }
        return {
          title: f,
          field: f,
          filterable: { type: 'multiFilter' },
          template: (value, item, addParams) => {
            const keyVar = `${item[f]}-${item[alphanumericTrigger]}`;

            const featureIdClass =
              noPlots && !modelSpecificMetaFeaturesExist
                ? 'TableCellBold NoSelect'
                : 'TableCellLink NoSelect';
            const featureIdClick =
              noPlots && !modelSpecificMetaFeaturesExist
                ? null
                : addParams.showPlotDifferential(item, alphanumericTrigger);
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
                    content={`View plots for feature ${value}`}
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
    const upsetColsDifferentialVar = this.listToJson(differentialNumericFields);
    this.setState({
      upsetColsDifferential: upsetColsDifferentialVar,
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
          onHandleSelectedVolcano={this.handleSelectedVolcano}
          onVolcanoSVGSizeChange={this.handleVolcanoSVGSizeChange}
          onHandleVolcanoTableLoading={this.handleVolcanoTableLoading}
          onBackToTable={this.backToTable}
          onUpdateVolcanoLabels={this.updateVolcanoLabels}
          onHandleUpdateDifferentialResults={this.updateDifferentialResults}
          onHandleVolcanoState={this.updateVolcanoState}
          onHandleTableDataChange={this.handleTableDataChange}
          fwdRefDVC={this.differentialViewContainerRef}
          onHandleMultifeaturePlot={this.handleMultifeaturePlot}
          onGetPlotTransition={this.getPlotTransition}
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
    const pxToPtRatio = 105;
    const pointSize = 12;
    const width =
      window.innerWidth ||
      document.documentElement.clientWidth ||
      document.body.clientWidth;
    const height =
      window.innerHeight ||
      document.documentElement.clientHeight ||
      document.body.clientHeight;
    // const divWidth =
    //   this.differentialViewContainerRef?.current?.parentElement?.offsetWidth ||
    //   width - 310;
    const divWidth = width * 0.75;
    const divHeight = height * 0.85;
    const divWidthPt = roundToPrecision(divWidth / pxToPtRatio, 1);
    const divHeightPt = roundToPrecision(divHeight / pxToPtRatio, 1);
    const divWidthPtString = `width=${divWidthPt}`;
    const divHeightPtString = `&height=${divHeightPt}`;
    const pointSizeString = `&pointsize=${pointSize}`;
    const dimensions = `?${divWidthPtString}${divHeightPtString}${pointSizeString}`;
    const srcUrl = `${multisetPlotInfoDifferential.svg}${dimensions}`;
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
          {multisetPlotInfoDifferential.svg?.length ? (
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
            <DifferentialSearchCriteria
              {...this.state}
              {...this.props}
              onSearchTransitionDifferential={
                this.handleSearchTransitionDifferential
              }
              onDifferentialSearch={this.handleDifferentialSearch}
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
              onSetDifferentialTestIds={this.setDifferentialTestIds}
              onHandlePlotTypesDifferential={this.handlePlotTypesDifferential}
              onHandleVolcanoTableLoading={this.handleVolcanoTableLoading}
              onDoMetaFeaturesExist={this.doMetaFeaturesExist}
              onGetResultsLinkouts={this.getResultsLinkouts}
              onGetUpsetColsDifferential={this.getUpsetColsDifferential}
              onHandleIsDataStreamingResultsTable={
                this.handleIsDataStreamingResultsTable
              }
              onHandleUpsetVisible={this.handleUpsetVisible}
              onHandleIsFilteredDifferential={this.handleIsFilteredDifferential}
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
