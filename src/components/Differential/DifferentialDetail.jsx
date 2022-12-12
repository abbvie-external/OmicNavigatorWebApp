import React, { Component } from 'react';
import _ from 'lodash-es';
import CustomEmptyMessage from '../Shared/Templates';
// eslint-disable-next-line no-unused-vars
import { EZGrid } from '../Shared/QHGrid/index.module.js';
import PlotsOverlay from './PlotsOverlay';
import PlotsDynamic from './PlotsDynamic';
import { scrollElement } from '../Shared/helpers';
import ScatterPlotDiv from './ScatterPlotDiv';
import {
  Grid,
  Popup,
  Label,
  Sidebar,
  Icon,
  List,
  Button,
  Form,
  Input,
} from 'semantic-ui-react';
import ButtonActions from '../Shared/ButtonActions';
import './DifferentialDetail.scss';
import SplitPane from 'react-split-pane';

class DifferentialDetail extends Component {
  state = {
    upperPlotsHeight:
      parseInt(localStorage.getItem('upperPlotsHeight'), 10) || 420,
    upperPlotsHeightBackup:
      parseInt(localStorage.getItem('upperPlotsHeightBackup'), 10) || 420,
    upperPlotsDivHeight:
      parseInt(localStorage.getItem('upperPlotsDivHeight'), 10) || 460,
    upperPlotsDivHeightBackup:
      parseInt(localStorage.getItem('upperPlotsDivHeightBackup'), 10) || 460,
    differentialDynamicPlotWidth:
      parseInt(localStorage.getItem('differentialDynamicPlotWidth'), 10) ||
      document.body.clientWidth * 0.75 - 420,
    volcanoWidth: parseInt(localStorage.getItem('volcanoWidth'), 10) || 380,
    volcanoDivWidth:
      parseInt(localStorage.getItem('volcanoDivWidth'), 10) || 420,
    volcanoDivWidthBackup:
      parseInt(localStorage.getItem('volcanoDivWidthBackup'), 10) || 420,
    volcanoPlotVisible:
      JSON.parse(localStorage.getItem('volcanoPlotVisible')) === true ||
      localStorage.getItem('volcanoPlotVisible') == null
        ? true
        : false,
    upperPlotsVisible:
      JSON.parse(localStorage.getItem('upperPlotsVisible')) === true ||
      localStorage.getItem('upperPlotsVisible') == null
        ? true
        : false,
    itemsPerPageVolcanoTable:
      parseInt(localStorage.getItem('itemsPerPageVolcanoTable'), 10) || 15,
    animation: 'overlay',
    direction: 'right',
    visible: false,
    allChecked: false,
    enableTabChangeOnSelection: true,
    scatterplotLoaded: false,
    // data consumed by EZGrid (it handles it's own filters)
    differentialTableData: [],
    differentialTableRows: 0,
    // data consumed by Scatterplot, AFTER EZGrid filters it's data
    filteredDifferentialTableData: [],
    // all data in scatterplot selection
    allDataInScatterView: [],
    // active data in scatterplot selection
    volcanoPlotSelectedDataArr: [],
    // single feature search
    singleFeatureSearchActive: false,
    singleFeatureSearchIcon: 'search',
    singleFeatureSearchText: '',
    singleFeatureSearched: '',
    // multi-feature search
    multiFeatureSearchText: '',
    multiFeaturesSearched: [],
    multiSearching: false,
    multiSearchOpen: false,
    multiFeaturesNotFound: [],
    multiFeatureSearchActive: false,
    multiFeatureSearchTextError: false,
  };
  volcanoPlotFilteredGridRef = React.createRef();

  componentDidUpdate(prevProps, prevState) {
    const {
      differentialResults,
      differentialFeatureIdKey,
      differentialResultsUnfiltered,
    } = this.props;
    const {
      multiFeaturesSearched,
      singleFeatureSearched,
      allDataInScatterView,
    } = this.state;
    if (
      prevProps.differentialResultsUnfiltered !==
      this.props.differentialResultsUnfiltered
    ) {
      this.setState({
        allDataInScatterView: differentialResultsUnfiltered,
      });
    }
    if (prevProps.differentialResults !== differentialResults) {
      // GOAL: set the new state for differentialTableData (consumed by EZGrid)
      // which will update itself (filters) and fire 'handleTableChanged'
      // which sets new state for volcanoPlotSelectedDataArr (consumed by scatter plot)
      let relevantSearched = [...differentialResults];
      // 1) keep the differentialResults that pass single or multiple feature SEARCH filters
      if (multiFeaturesSearched.length || singleFeatureSearched !== '') {
        if (multiFeaturesSearched.length) {
          // multi-search filter
          const multiFeaturesSearchedSet = new Set(multiFeaturesSearched);
          relevantSearched = [...differentialResults].filter(d =>
            multiFeaturesSearchedSet.has(d[differentialFeatureIdKey]),
          );
        } else {
          // single search filter
          relevantSearched = [...differentialResults].filter(d =>
            d[this.props.differentialFeatureIdKey].includes(
              singleFeatureSearched,
            ),
          );
        }
      }
      let relevantSearchedAndInScatterView = relevantSearched;
      // 2) keep the intersection from 1) above and what is in current scatterplot view
      const allDataInScatterViewIdsSet = new Set(
        [...allDataInScatterView].map(
          d => d[this.props.differentialFeatureIdKey],
        ),
      );
      relevantSearchedAndInScatterView = [...relevantSearched].filter(d =>
        allDataInScatterViewIdsSet.has(d[this.props.differentialFeatureIdKey]),
      );
      this.setState({
        allChecked: false,
        differentialTableData: relevantSearchedAndInScatterView,
        differentialTableRows: relevantSearchedAndInScatterView?.length || 0,
        filteredDifferentialTableData: relevantSearchedAndInScatterView,
      });
    }
  }

  hasWhitespace = s => {
    return s.indexOf(' ') >= 0;
  };

  pageToFeature = featureToHighlight => {
    if (featureToHighlight) {
      const { differentialFeatureIdKey } = this.props;
      const { itemsPerPageVolcanoTable } = this.state;
      const sortedData =
        this.volcanoPlotFilteredGridRef?.current?.qhGridRef?.current?.getSortedData() ||
        [];
      if (sortedData != null) {
        const Index = _.findIndex(sortedData, function(p) {
          return p[differentialFeatureIdKey] === featureToHighlight;
        });
        const pageNumber = Math.ceil((Index + 1) / itemsPerPageVolcanoTable);
        if (pageNumber > 0) {
          this.volcanoPlotFilteredGridRef.current?.handlePageChange(pageNumber);
          scrollElement(this, 'volcanoPlotFilteredGridRef', 'rowHighlightMax');
        }
      }
    } else {
      this.volcanoPlotFilteredGridRef?.current?.handlePageChange(1);
    }
  };

  rowLevelPropsCalc = item => {
    let className;
    let id;
    const {
      differentialFeatureIdKey,
      // volcanoDifferentialTableRowMax,
      differentialHighlightedFeatures,
      differentialOutlinedFeature,
    } = this.props;
    if (
      differentialHighlightedFeatures?.includes(item[differentialFeatureIdKey])
    ) {
      className = 'rowHighlightOther';
    }
    if (item[differentialFeatureIdKey] === differentialOutlinedFeature) {
      id = 'rowOutline';
    }
    return {
      className,
      id,
    };
  };

  handleVolcanoPlotSelectionChange = (
    volcanoPlotSelectedDataArrArg,
    clearHighlightedData,
    doubleClickEvent,
    allDataInScatterView,
  ) => {
    const {
      differentialFeatureIdKey,
      differentialHighlightedFeatures,
      differentialOutlinedFeature,
      plotMultiFeatureAvailable,
      differentialResults,
    } = this.props;
    const { multiFeaturesSearched, singleFeatureSearched } = this.state;
    // volcanoPlotSelectedDataArrArg is empty
    // when grey circles are selected
    this.setState({
      volcanoPlotSelectedDataArr: volcanoPlotSelectedDataArrArg,
      allDataInScatterView,
    });
    let relevantDifferentialData = [...volcanoPlotSelectedDataArrArg];
    if (doubleClickEvent) {
      // on double click,
      // differentialResults is passed as volcanoPlotSelectedDataArrArg
      // to make it more clear, just use differentialResults below
      if (multiFeaturesSearched.length || singleFeatureSearched !== '') {
        // find the intersection between the searched features, and volcano plot
        if (multiFeaturesSearched.length) {
          const multiFeaturesSearchedSet = new Set(multiFeaturesSearched);
          relevantDifferentialData = [...differentialResults].filter(d =>
            multiFeaturesSearchedSet.has(
              d[this.props.differentialFeatureIdKey],
            ),
          );
        } else {
          relevantDifferentialData = [...differentialResults].filter(d =>
            d[this.props.differentialFeatureIdKey].includes(
              singleFeatureSearched,
            ),
          );
        }
      }
    }
    // this.setState({
    //   allChecked: false,
    // });
    // clear the highlighted rows/dots/svg on svg double-click
    // this is an option, but currently we are NOT using it
    // we retain the highlighted data (scatter function transitionZoom second arg)
    if (clearHighlightedData) {
      this.setState(
        {
          differentialTableData: differentialResults,
        },
        // in callback so scatter reload is priority
        function() {
          this.pageToFeature();
          this.props.onHandleHighlightedFeaturesDifferential([]);
          this.props.onResetDifferentialOutlinedFeature();
        },
      );
      return;
    }
    // DEV - this is a bottle neck; we should either add a threshold (e.g. 20K features) or not worry about
    //    let sortedData =
    //    this.volcanoPlotFilteredGridRef?.current?.qhGridRef?.current?.getSortedData() ||
    //    this.props.differentialResults;
    //  // const sortDataIds = new Set([...sortedData].map(d => d[this.props.differentialFeatureIdKey]));
    //  const volcanoPlotDataArrIds = new Set(
    //    [...relevantDifferentialData].map(
    //      d => d[this.props.differentialFeatureIdKey],
    //    ),
    //  );
    //  const matchCurrentTableOrder = [...sortedData].filter(d =>
    //    volcanoPlotDataArrIds.has(d[this.props.differentialFeatureIdKey]),
    //  );
    // IF DATA
    if (relevantDifferentialData.length > 0) {
      const self = this;
      self.setState(
        {
          differentialTableData: relevantDifferentialData,
          differentialTableRows: relevantDifferentialData.length,
        },
        function() {
          // load the table, then paging and mapping
          let allFeatureIdsRemaining = [...relevantDifferentialData].map(
            i => i[differentialFeatureIdKey],
          );
          let isOutlinedFeatureInView = allFeatureIdsRemaining.includes(
            differentialOutlinedFeature,
          );
          if (isOutlinedFeatureInView) {
            // PAGE TO OUTLINED FEATURE IF IT REMAINS
            setTimeout(function() {
              self.pageToFeature(differentialOutlinedFeature);
            }, 500);
          } else {
            // CLEAR OUTLINED FEATURE IF IT DOES NOT REMAIN, AND PAGE TO 0
            self.props.onResetDifferentialOutlinedFeature();
            self.pageToFeature();
          }
          if (!doubleClickEvent && plotMultiFeatureAvailable) {
            // IF MULTI-FEATURE PLOTTING AVAILABLE AND THERE IS DATA
            const highlightedFeaturesLength =
              differentialHighlightedFeatures.length;
            const highlightedFeatures = new Set(
              differentialHighlightedFeatures,
            );
            let multiselectedFeaturesArrRemaining = [
              ...relevantDifferentialData,
            ].filter(item =>
              highlightedFeatures.has(item[differentialFeatureIdKey]),
            );

            if (
              highlightedFeaturesLength !==
              multiselectedFeaturesArrRemaining.length
            ) {
              // IF CHECKED FEATURES LENGTH IS DIFFERENT THAN EXISTING
              if (multiselectedFeaturesArrRemaining.length) {
                // if there are multi-selected features in the box selection, reload the svg, single or multi
                let multiselectedFeaturesArrMappedRemaining = [
                  ...multiselectedFeaturesArrRemaining,
                ].map(item => ({
                  id: item[differentialFeatureIdKey],
                  value: item[differentialFeatureIdKey],
                  key: item[differentialFeatureIdKey],
                }));
                self.props.onHandleHighlightedFeaturesDifferential(
                  multiselectedFeaturesArrMappedRemaining,
                  true,
                );
                let multiselectedFeatureIdsMappedRemaining = [
                  ...multiselectedFeaturesArrRemaining,
                ].map(item => item[differentialFeatureIdKey]);
                self.reloadMultifeaturePlot(
                  multiselectedFeatureIdsMappedRemaining,
                  true,
                );
              }
            }
          }
        },
      );
    } else {
      // nothing is in box selection
      this.props.onHandleHighlightedFeaturesDifferential([]);
      this.props.onResetDifferentialOutlinedFeature();
      this.pageToFeature();
      this.setState({
        differentialTableData: [],
        differentialTableRows: 0,
      });
    }
  };

  handleItemsPerPageChange = items => {
    this.setState({
      itemsPerPageVolcanoTable: items,
    });
    localStorage.setItem('itemsPerPageVolcanoTable', items);
  };

  handleBinClick = item => {
    const { differentialFeatureIdKey } = this.props;
    const bins = item.map(elem => {
      const data = JSON.parse(elem.props.data);
      return {
        id: data[differentialFeatureIdKey],
        value: data[differentialFeatureIdKey],
        key: data[differentialFeatureIdKey],
      };
    });

    this.props.onHandleHighlightedFeaturesDifferential(bins);
    this.pageToFeature(
      JSON.parse(item[0].props.data)[differentialFeatureIdKey],
    );
  };

  handleDotClick = (
    event,
    items,
    index,
    doNotUnhighlight,
    simpleClick,
    elem,
  ) => {
    const { differentialFeatureIdKey } = this.props;
    this.setState({
      enableTabChangeOnSelection: true,
    });
    if (simpleClick) {
      const obj = JSON.parse(elem._groups[0][0].attributes.data.value) || '';
      const feature = obj ? obj[differentialFeatureIdKey] : '';
      this.props.onSetPlotSelected(feature);
      this.pageToFeature(event[differentialFeatureIdKey]);
      this.props.onGetPlot('SingleFeature', feature, false, false);
    } else {
      if (!this.props.plotMultiFeatureAvailable) return;
      let elementArray = items.map(item => ({
        id: item,
        value: item,
        key: item,
      }));
      this.props.onHandleHighlightedFeaturesDifferential(
        elementArray,
        doNotUnhighlight,
      );
      if (items.length) {
        // IF YOU WANT TO PAGE TO A CONTROL-CLICKED FEATURE
        // this.pageToFeature(event[differentialFeatureIdKey]);
      }
      this.reloadMultifeaturePlot(elementArray);
    }
  };

  removeSelectedFeature = featureToRemove => {
    const { differentialHighlightedFeaturesData } = this.props;
    const PreviouslyHighlighted = [...differentialHighlightedFeaturesData];
    const selectedTableDataArray = PreviouslyHighlighted.filter(
      i => i.id !== featureToRemove,
    );
    this.props.onHandleHighlightedFeaturesDifferential(selectedTableDataArray);
    this.reloadMultifeaturePlot(selectedTableDataArray);
  };

  reloadMultifeaturePlot = _.debounce((selected, boxSelection) => {
    const data = boxSelection
      ? selected
      : this.volcanoPlotFilteredGridRef?.current?.qhGridRef?.current?.getSortedData() ||
        this.props.differentialResults;
    if (selected?.length > 1) {
      this.props.onHandleMultifeaturePlot('MultiFeature', data);
    }
  }, 1250);

  handlePlotlyClick = (featureArg, exactLabel) => {
    let featureData = null;
    let relevantFeatures = [...this.state.differentialTableData].filter(f =>
      this.props.differentialHighlightedFeatures.includes(
        f[this.props.differentialFeatureIdKey],
      ),
    );
    if (exactLabel) {
      // if Plotly gives us the exact string matching a value in our data
      featureData = relevantFeatures.find(f => {
        const fValues = _.values(f);
        return fValues.includes(featureArg);
      });
    } else {
      // if Plotly gives us a string containing some value in our data
      featureData = relevantFeatures.find(f => {
        const fValues = _.values(f);
        const fValuesRelevant = fValues.filter(f => isNaN(f));
        function hasValue(value) {
          return featureArg.includes(value);
        }
        return fValuesRelevant.some(hasValue);
      });
    }
    if (featureData) {
      this.setState({
        enableTabChangeOnSelection: false,
      });
      const feature = featureData[this.props.differentialFeatureIdKey];
      // if item is already outlined, remove outline and clear plot
      if (this.props.differentialOutlinedFeature === feature) {
        this.props.onResetDifferentialOutlinedFeature();
      } else {
        // simple row click without control nor shift
        this.props.onSetPlotSelected(feature);
        this.pageToFeature(feature);
        this.props.onGetPlot('SingleFeature', feature, false, false);
      }
    }
  };

  handleRowClick = (event, item, index) => {
    const {
      differentialFeatureIdKey,
      differentialOutlinedFeature,
      differentialHighlightedFeaturesData,
      differentialResults,
    } = this.props;
    const { plotMultiFeatureAvailable } = this.props;
    event.persist();
    event.stopPropagation();
    this.setState({
      enableTabChangeOnSelection: true,
    });
    if (
      item == null ||
      event?.target?.className === 'ExternalSiteIcon' ||
      event?.target?.className === 'TableCellLink NoSelect' ||
      event?.target?.className === 'TableCellLink'
    ) {
      // CLICK ON EXTERNAL LINK, OR FEATURE ID PROMPTING PLOT OVERLAY
      return;
    } else {
      let sortedData =
        this.volcanoPlotFilteredGridRef?.current?.qhGridRef?.current?.getSortedData() ||
        differentialResults;
      const PreviouslyHighlighted = [...differentialHighlightedFeaturesData];
      const itemAlreadyHighlighted = PreviouslyHighlighted.some(
        d => d.id === item[differentialFeatureIdKey],
      );
      let baseFeature = sortedData[0][differentialFeatureIdKey];
      if (PreviouslyHighlighted.length) {
        baseFeature = PreviouslyHighlighted[0]?.id;
      }
      if (differentialOutlinedFeature !== '') {
        baseFeature = differentialOutlinedFeature;
      }
      if (event.shiftKey) {
        // SHIFT CLICK - ADD MULTIPLE FEATURES
        if (!plotMultiFeatureAvailable) return;
        const currentTableData =
          this.volcanoPlotFilteredGridRef?.current?.qhGridRef.current?.getSortedData() ||
          [];
        const indexBaseFeature = _.findIndex(currentTableData, function(d) {
          return d[differentialFeatureIdKey] === baseFeature;
        });
        const sliceFirst = index < indexBaseFeature ? index : indexBaseFeature;
        const sliceLast = index > indexBaseFeature ? index : indexBaseFeature;
        const shiftedTableData = currentTableData.slice(
          sliceFirst,
          sliceLast + 1,
        );
        const shiftedTableDataArray = shiftedTableData.map(function(d) {
          return {
            id: d[differentialFeatureIdKey],
            value: d[differentialFeatureIdKey],
            key: d[differentialFeatureIdKey],
          };
        });

        const oldAndNewTableDataArray = PreviouslyHighlighted.concat(
          shiftedTableDataArray,
        );
        const key = 'id';
        const uniqueTableDataArray = [
          ...new Map(
            oldAndNewTableDataArray.map(item => [item[key], item]),
          ).values(),
        ];
        this.props.onHandleHighlightedFeaturesDifferential(
          uniqueTableDataArray,
        );
        this.reloadMultifeaturePlot(uniqueTableDataArray);
      } else if (
        event.ctrlKey ||
        event.metaKey ||
        event?.target?.classList?.contains('DifferentialResultsRowCheckbox') ||
        event?.target?.classList?.contains(
          'DifferentialResultsRowCheckboxDiv',
        ) ||
        event?.target?.innerHTML.includes('DifferentialResultsRowCheckboxDiv')
      ) {
        // CONTROL CLICK OR CLICK IN CHECKBOX CELL CLICK - ADD/REMOVE ONE FEATURE
        if (!plotMultiFeatureAvailable) return;
        // control-click or click specifically on checkbox
        const currentTableData =
          this.volcanoPlotFilteredGridRef?.current?.qhGridRef.current?.getSortedData() ||
          [];
        let selectedTableDataArray = [];
        // already highlighted, remove it from array
        if (itemAlreadyHighlighted) {
          selectedTableDataArray = PreviouslyHighlighted.filter(
            i => i.id !== item[differentialFeatureIdKey],
          );
          this.props.onHandleHighlightedFeaturesDifferential(
            selectedTableDataArray,
          );
          this.reloadMultifeaturePlot(selectedTableDataArray);
        } else {
          // not yet highlighted, add it to array
          const indexBaseFeature = _.findIndex(currentTableData, function(d) {
            return d[differentialFeatureIdKey] === baseFeature;
          });
          // map feature to fix obj entries
          const mappedFeature = {
            id: item[differentialFeatureIdKey],
            value: item[differentialFeatureIdKey],
            key: item[differentialFeatureIdKey],
          };
          const lowerIndexThanBase = index < indexBaseFeature ? true : false;
          if (lowerIndexThanBase) {
            // add to beginning of array if max
            PreviouslyHighlighted.unshift(mappedFeature);
          } else {
            // just add to array if not max
            PreviouslyHighlighted.push(mappedFeature);
          }
          selectedTableDataArray = [...PreviouslyHighlighted];
          this.props.onHandleHighlightedFeaturesDifferential(
            selectedTableDataArray,
          );
          this.reloadMultifeaturePlot(selectedTableDataArray);
        }
      } else {
        // CLICK WITHOUT SHIFT OR CONTROL, NOT IN CHECKBOX CELL
        // if item is already outlined, remove outline and clear plot
        if (item[differentialFeatureIdKey] === differentialOutlinedFeature) {
          this.props.onResetDifferentialOutlinedFeature();
        } else {
          // simple row click without control nor shift
          this.props.onSetPlotSelected(item[differentialFeatureIdKey]);
          this.props.onGetPlot(
            'SingleFeature',
            item[differentialFeatureIdKey],
            false,
            false,
          );
        }
      }
    }
  };

  handleUpperPlotsVisability = e => {
    // toggle visability
    const {
      upperPlotsVisible,
      upperPlotsHeight,
      upperPlotsDivHeight,
      upperPlotsDivHeightBackup,
    } = this.state;
    if (upperPlotsVisible) {
      // closing the upper plots, set backup heights
      localStorage.setItem('upperPlotsDivHeightBackup', upperPlotsDivHeight);
      localStorage.setItem('upperPlotsHeightBackup', upperPlotsHeight);
      this.setState({
        upperPlotsHeightBackup: upperPlotsHeight,
        upperPlotsDivHeightBackup: upperPlotsDivHeight,
      });
    }
    localStorage.setItem('upperPlotsVisible', !upperPlotsVisible);
    this.setState({
      upperPlotsVisible: !upperPlotsVisible,
    });
    // opening the upper plots (use div height backup as new size) or closing the plot (use 1)
    const size = !upperPlotsVisible ? upperPlotsDivHeightBackup : 1;
    this.handleSizeChange(size, 'horizontal');
  };

  handleVolcanoVisability = e => {
    const {
      volcanoPlotVisible,
      volcanoWidth,
      volcanoDivWidth,
      volcanoDivWidthBackup,
    } = this.state;
    if (volcanoPlotVisible) {
      // closing the volcano plot, set backup widths
      localStorage.setItem('volcanoDivWidthBackup', volcanoDivWidth);
      localStorage.setItem('volcanoWidthBackup', volcanoWidth);
      this.setState({
        volcanoDivWidthBackup: volcanoDivWidth,
        volcanoWidthBackup: volcanoWidth,
      });
    }
    localStorage.setItem('volcanoPlotVisible', !volcanoPlotVisible);
    this.setState({
      volcanoPlotVisible: !volcanoPlotVisible,
    });
    const size = !volcanoPlotVisible ? volcanoDivWidthBackup : 1;
    this.handleSizeChange(size, 'vertical');
  };

  handleSizeChange = (newSize, axisDragged) => {
    if (newSize === undefined) return;
    const { volcanoDivWidth } = this.state;
    const { fwdRefDVC } = this.props;
    const plotSizeAdjustment = Math.round(newSize * 0.9);
    if (axisDragged === 'horizontal') {
      // if (newSize)
      // on up/down drag, we are forcing a dynamic plot resize by change the volcano width by 1
      const vDivWidth =
        parseInt(localStorage.getItem('volcanoDivWidth'), 10) || 500;
      const vWidth = parseInt(localStorage.getItem('volcanoWidth'), 10) || 460;
      const differentialDynamicPlotWidthPx =
        fwdRefDVC.current?.offsetWidth - volcanoDivWidth - 1 || 500;
      // up/down drag expected logic
      localStorage.setItem('volcanoDivWidth', vDivWidth + 1);
      localStorage.setItem('volcanoWidth', vWidth + 1);
      localStorage.setItem('upperPlotsHeight', plotSizeAdjustment + 1);
      localStorage.setItem('upperPlotsDivHeight', newSize + 1);
      localStorage.setItem(
        'differentialDynamicPlotWidth',
        differentialDynamicPlotWidthPx,
      );
      this.setState({
        differentialDynamicPlotWidth: differentialDynamicPlotWidthPx,
        volcanoWidth: vWidth + 1,
        upperPlotsHeight: plotSizeAdjustment + 1,
        upperPlotsDivHeight: newSize + 1,
        volcanoDivWidth: vDivWidth + 1,
      });
    } else {
      // on left/right "vertical"
      const differentialDynamicPlotWidthPx =
        fwdRefDVC.current?.offsetWidth - newSize || 500;
      localStorage.setItem(
        'differentialDynamicPlotWidth',
        differentialDynamicPlotWidthPx,
      );
      localStorage.setItem('volcanoDivWidth', newSize);
      localStorage.setItem('volcanoWidth', plotSizeAdjustment);
      this.setState({
        volcanoDivWidth: newSize,
        volcanoWidth: plotSizeAdjustment,
        differentialDynamicPlotWidth: differentialDynamicPlotWidthPx,
      });
    }
  };

  handleTableChange = () => {
    let sortedFilteredData =
      this.volcanoPlotFilteredGridRef?.current?.qhGridRef?.current?.getSortedData() ||
      this.props.differentialResults;
    this.setState(
      {
        filteredDifferentialTableData: sortedFilteredData,
        // allChecked: false,
        scatterplotLoaded: true,
      },
      function() {
        // DEV - test whether we want the rest of this in a callback, so scatter loads faster...
        let allFeatureIdsRemaining = [...sortedFilteredData].map(
          i => i[this.props.differentialFeatureIdKey],
        );
        let isOutlinedFeatureInView = allFeatureIdsRemaining.includes(
          this.props.differentialOutlinedFeature,
        );
        if (sortedFilteredData.length > 0) {
          const self = this;
          // IF DATA
          if (isOutlinedFeatureInView) {
            // PAGE TO OUTLINED FEATURE IF IT REMAINS
            setTimeout(function() {
              self.pageToFeature(self.props.differentialOutlinedFeature);
            }, 500);
          } else {
            // CLEAR OUTLINED FEATURE IF IT DOES NOT REMAIN, AND PAGE TO 0
            this.props.onResetDifferentialOutlinedFeature();
            this.pageToFeature();
          }
          if (this.props.plotMultiFeatureAvailable) {
            // IF MULTI-FEATURE PLOTTING AVAILABLE AND THERE IS DATA
            let multiselectedFeaturesArrRemaining = [
              ...sortedFilteredData,
            ].filter(item =>
              self.props.differentialHighlightedFeatures.includes(
                item[self.props.differentialFeatureIdKey],
              ),
            );
            if (
              self.props.differentialHighlightedFeatures.length !==
              multiselectedFeaturesArrRemaining.length
            ) {
              // IF CHECKED FEATURES LENGTH IS DIFFERENT THAN EXISTING
              if (multiselectedFeaturesArrRemaining.length) {
                // IF CHECKED FEATURES REMAIN, GET NEW SVG
                let multiselectedFeaturesArrMappedRemaining = [
                  ...multiselectedFeaturesArrRemaining,
                ].map(item => ({
                  id: item[self.props.differentialFeatureIdKey],
                  value: item[self.props.differentialFeatureIdKey],
                  key: item[self.props.differentialFeatureIdKey],
                }));
                this.props.onHandleHighlightedFeaturesDifferential(
                  multiselectedFeaturesArrMappedRemaining,
                  true,
                );
                let multiselectedFeatureIdsMappedRemaining = [
                  ...multiselectedFeaturesArrRemaining,
                ].map(item => item[self.props.differentialFeatureIdKey]);
                this.reloadMultifeaturePlot(
                  multiselectedFeatureIdsMappedRemaining,
                  true,
                );
              } else {
                // no highlighted after table filter
                this.props.onHandleHighlightedFeaturesDifferential([]);
              }
            }
          }
        } else {
          this.props.onHandleHighlightedFeaturesDifferential([]);
          this.props.onResetDifferentialOutlinedFeature();
          this.pageToFeature();
        }
      },
    );
  };

  toggleAllCheckboxes = () => {
    const { differentialFeatureIdKey } = this.props;
    const { allChecked } = this.state;
    if (allChecked) {
      this.props.onHandleHighlightedFeaturesDifferential([], false);
    } else {
      let tableData =
        this.volcanoPlotFilteredGridRef?.current?.qhGridRef?.current?.getSortedData() ||
        this.props.differentialResults;
      // const featureIds = tableData.map(featureId => featureId[this.props.differentialFeatureIdKey]);
      if (tableData.length > this.props.plotMultiFeatureMax) {
        tableData = [...tableData].slice(0, this.props.plotMultiFeatureMax);
      }
      let elementArray = tableData.map(item => ({
        id: item[differentialFeatureIdKey],
        value: item[differentialFeatureIdKey],
        key: item[differentialFeatureIdKey],
      }));

      this.props.onHandleHighlightedFeaturesDifferential(elementArray, false);
      this.reloadMultifeaturePlot(elementArray);
    }
    this.setState({
      allChecked: !allChecked,
    });
  };

  getMultifeaturePlotTransitionAlt = () => {
    const tableData =
      this.volcanoPlotFilteredGridRef?.current?.qhGridRef?.current?.getSortedData() ||
      this.props.differentialResults;
    this.props.onHandleMultifeaturePlot('Overlay', tableData, true);
  };

  getRelevantSingleFeatureSearchData = () => {
    const { differentialResults } = this.props;
    const { singleFeatureSearchText, allDataInScatterView } = this.state;
    // goal: set the new state for differentialTableData, which will update the scatter plot
    let relevantSearchedDifferentialData = [...differentialResults];
    // 1) keep the differentialResults that pass SINGLE SEARCH filters
    if (singleFeatureSearchText !== '') {
      relevantSearchedDifferentialData = [...differentialResults].filter(d =>
        d[this.props.differentialFeatureIdKey].includes(
          singleFeatureSearchText,
        ),
      );
    }
    let relevantDifferentialDataSearchAndInView = relevantSearchedDifferentialData;
    // 2) keep data is in current volcano view/selection
    if (allDataInScatterView.length) {
      const allDataInScatterViewIdsSet = new Set(
        [...allDataInScatterView].map(
          d => d[this.props.differentialFeatureIdKey],
        ),
      );
      relevantDifferentialDataSearchAndInView = [
        ...relevantSearchedDifferentialData,
      ].filter(d =>
        allDataInScatterViewIdsSet.has(d[this.props.differentialFeatureIdKey]),
      );
    }
    return relevantDifferentialDataSearchAndInView;
  };

  getEmptySearchData = () => {
    const { differentialResults } = this.props;
    const { allDataInScatterView } = this.state;
    let relevantDifferentialDataSearchAndInView = [...differentialResults];
    // 1) keep differentialResults that are in current volcano view/selection
    if (allDataInScatterView.length) {
      const allDataInScatterViewIdsSet = new Set(
        [...allDataInScatterView].map(
          d => d[this.props.differentialFeatureIdKey],
        ),
      );
      relevantDifferentialDataSearchAndInView = [
        ...differentialResults,
      ].filter(d =>
        allDataInScatterViewIdsSet.has(d[this.props.differentialFeatureIdKey]),
      );
    }
    return relevantDifferentialDataSearchAndInView;
  };

  handleSingleFeatureSearchTextChange = e => {
    this.setState({
      singleFeatureSearchActive: true,
      singleFeatureSearchIcon: 'search',
    });
    if (e.target.value === '') {
      this.handleSingleFeatureSearchClear();
    } else if (
      e.target.value.includes(',') ||
      e.target.value.includes('\n') ||
      this.hasWhitespace(e.target.value)
    ) {
      this.setState({
        // singleFeatureSearchText: '',
        multiFeatureSearchText: e.target.value,
        multiSearching: true,
        multiSearchOpen: true,
        multiFeatureSearchActive: true,
      });
    } else {
      this.setState({
        // multiFeatureSearchText: '',
        singleFeatureSearchText: e.target.value,
        // multiSearching: false,
        // multiSearchOpen: false,
      });
    }
  };

  handleSingleFeatureSearchSubmit = () => {
    const {
      // volcanoPlotSelectedDataArr,
      // allDataInScatterView,
      singleFeatureSearchText,
    } = this.state;
    if (singleFeatureSearchText.length < 3) return;
    const relevantDifferentialData = this.getRelevantSingleFeatureSearchData();
    if (relevantDifferentialData.length) {
      this.setState({
        differentialTableData: relevantDifferentialData,
        differentialTableRows: relevantDifferentialData?.length || 0,
        singleFeatureSearchActive: false,
        singleFeatureSearchIcon: 'remove',
        singleFeatureSearched: singleFeatureSearchText,
      });
    } else {
      this.setState({
        differentialTableData: [],
        differentialTableRows: 0,
        singleFeatureSearchActive: false,
        singleFeatureSearchIcon: 'remove',
        singleFeatureSearched: singleFeatureSearchText,
      });
      // toast.error('No features found, please adjust your search');
    }
  };

  handleSingleFeatureSearchClear = () => {
    const { singleFeatureSearchText } = this.state;
    const emptySearchData = this.getEmptySearchData();
    if (singleFeatureSearchText.length) {
      this.setState({
        differentialTableData: emptySearchData,
        differentialTableRows: emptySearchData?.length || 0,
        singleFeatureSearchActive: false,
        singleFeatureSearchIcon: 'search',
        singleFeatureSearchText: '',
        singleFeatureSearched: '',
      });
    }
  };

  moveCaretAtEnd = e => {
    var temp_value = e.target.value;
    e.target.value = '';
    e.target.value = temp_value;
  };

  handleMultiFeatureSearchTextChange = (e, { value }) => {
    this.setState({
      multiFeatureSearchText: value,
      multiFeatureSearchActive: true,
    });
  };

  // handleMultiSearchClear = () => {
  //   this.setState({
  //     multiFeatureSearchText: '',
  //   });
  // };

  submitMultiFeatureSearch = () => {
    const { multiFeatureSearchText } = this.state;
    if (multiFeatureSearchText === '') {
      const emptySearchData = this.getEmptySearchData();
      // if submit nothing, close and single feature search
      this.setState({
        singleFeatureSearchActive: false,
        singleFeatureSearchIcon: 'search',
        singleFeatureSearchText: '',
        singleFeatureSearched: '',
        multiFeatureSearchText: '',
        multiSearching: false,
        multiSearchOpen: false,
        multiFeaturesSearched: [],
        multiFeaturesNotFound: [],
        multiFeatureSearchActive: false,
        multiFeatureSearchTextError: false,
        differentialTableData: emptySearchData,
        differentialTableRows: emptySearchData?.length || 0,
      });
    } else if (
      multiFeatureSearchText !== '' ||
      multiFeatureSearchText.includes(',') ||
      multiFeatureSearchText.includes('\n') ||
      this.hasWhitespace(multiFeatureSearchText)
    ) {
      // do the multi-search!
      this.setState({ multiFeatureSearchTextError: false });
      this.handleMultiFeatureSearch();
    } else {
      // there are no features matched, but there is text
      this.setState({ multiFeatureSearchTextError: true });
    }
  };

  handleMultiSearchClose = () => {
    const { multiFeatureSearchText } = this.state;
    if (multiFeatureSearchText === '') {
      // if close with nothing in text area
      const emptySearchData = this.getEmptySearchData();
      this.setState({
        multiFeatureSearchText: '',
        multiSearching: false,
        multiSearchOpen: false,
        multiFeaturesSearched: [],
        multiFeaturesNotFound: [],
        differentialTableData: emptySearchData,
        differentialTableRows: emptySearchData?.length || 0,
        singleFeatureSearchActive: false,
        singleFeatureSearchIcon: 'search',
        singleFeatureSearchText: '',
      });
    } else if (
      multiFeatureSearchText.includes(',') ||
      multiFeatureSearchText.includes('\n') ||
      this.hasWhitespace(multiFeatureSearchText)
    ) {
      // if close with something valid in the text area
      this.setState({
        multiSearchOpen: false,
        // singleFeatureSearchText: '',
      });
    } else {
      // if close with something not valid in the text area
      this.setState({
        multiFeatureSearchText: '',
        multiSearching: false,
        multiSearchOpen: false,
        singleFeatureSearchText: multiFeatureSearchText,
      });
    }
  };

  getRelevantMultiFeatureSearchData = () => {
    const { differentialResults, differentialFeatureIdKey } = this.props;
    const { multiFeaturesSearched, allDataInScatterView } = this.state;
    // goal: set the new state for differentialTableData, which will update the scatter plot
    let relevantSearchedDifferentialData = [...differentialResults];
    // 1) keep the differentialResults that pass MULTIFEATURE SEARCH filters
    // 1) keep data that passes search filters
    if (multiFeaturesSearched.length) {
      const multiFeaturesSearchedSet = new Set(multiFeaturesSearched);
      relevantSearchedDifferentialData = [...differentialResults].filter(d =>
        multiFeaturesSearchedSet.has(d[differentialFeatureIdKey]),
      );
    }
    let relevantDifferentialDataSearchAndInView = relevantSearchedDifferentialData;
    // 2) keep data is in current volcano view/selection
    // if (allDataInScatterView.length) {
    const allDataInScatterViewIdsSet = new Set(
      [...allDataInScatterView].map(
        d => d[this.props.differentialFeatureIdKey],
      ),
    );
    relevantDifferentialDataSearchAndInView = [
      ...relevantSearchedDifferentialData,
    ].filter(d =>
      allDataInScatterViewIdsSet.has(d[this.props.differentialFeatureIdKey]),
    );
    // }
    return relevantDifferentialDataSearchAndInView;
  };

  // resetSearch = () => {
  //   const { allDataInScatterView } = this.state;
  //   this.setState({
  //     differentialTableData: allDataInScatterView,
  //     differentialTableRows: allDataInScatterView?.length || 0,
  //     singleFeatureSearchActive: false,
  //     singleFeatureSearchIcon: 'search',
  //     singleFeatureSearchText: '',
  //     singleFeatureSearched: '',
  //     multiFeatureSearchText: '',
  //     multiSearching: false,
  //     multiSearchOpen: false,
  //     multiFeaturesSearched: [],
  //     multiFeaturesNotFound: [],
  //     multiFeatureSearchActive: false,
  //     multiFeatureSearchTextError: false,
  //   });
  // };

  handleMultiFeatureSearch = () => {
    const { multiFeatureSearchText } = this.state;
    const multiFeatureSearchTextSplit = multiFeatureSearchText
      // .replace(/[,;]$/, '')
      // .split(',')
      // .split(/\s*[,\n.]+\s*/)
      // .split(/[ .:;?!~,`"&|()<>{}\[\]\r\n/\\]+/)
      .split(/[,\s]+/)
      .map(item => item.trim())
      .filter(Boolean);
    let multiFeaturesFound = [];
    const relevantDataAfterSearchAndSelectionFilters = this.getRelevantMultiFeatureSearchData();
    const multiFeaturesSearchedSet = new Set(multiFeatureSearchTextSplit);
    const relevantDifferentialData = [
      ...relevantDataAfterSearchAndSelectionFilters,
    ].filter(d => {
      if (
        multiFeaturesSearchedSet.has(d[this.props.differentialFeatureIdKey])
      ) {
        multiFeaturesFound.push(d[this.props.differentialFeatureIdKey]);
        return true;
      } else return false;
    });
    function getDifference(setA, setB) {
      return new Set([...setA].filter(element => !setB.has(element)));
    }
    const multiFeaturesFoundSet = new Set(multiFeaturesFound);
    const multiFeaturesNotFoundSet = getDifference(
      multiFeaturesSearchedSet,
      multiFeaturesFoundSet,
    );
    const multiFeaturesNotFoundValues = Array.from(multiFeaturesNotFoundSet);
    // if any filteredDifferentialTableData matches the search text, take action
    // if (multiFeaturesFound.length) {
    this.setState({
      differentialTableData: relevantDifferentialData,
      differentialTableRows: relevantDifferentialData?.length || 0,
      multiFeaturesSearched: multiFeaturesFound,
      multiFeaturesNotFound: multiFeaturesNotFoundValues,
      multiFeatureSearchTextError:
        !multiFeaturesFound.length && multiFeaturesNotFoundValues.length,
      multiFeatureSearchText: multiFeaturesFound.toString(),
      multiFeatureSearchActive: false,
      singleFeatureSearchActive: false,
      singleFeatureSearchIcon: 'search',
      singleFeatureSearched: '',
    });
    // } else {
    //  if no features are found
    //  we are continuing with the search, and displaying no data
    //  use and adjust this if we'd rather just not go through with the search
    //   if (multiFeaturesNotFoundValues.length) {
    //     this.setState({
    //       multiFeaturesNotFound: multiFeaturesNotFoundValues,
    //       // multiFeatureSearchActive: true,
    //     });
    //   } else {
    //     this.resetSearch();
    //   }
    // }
  };

  render() {
    const {
      differentialTableData,
      itemsPerPageVolcanoTable,
      differentialTableRows,
      volcanoPlotVisible,
      upperPlotsVisible,
      upperPlotsDivHeight,
      volcanoDivWidth,
      volcanoWidth,
      animation,
      direction,
      differentialDynamicPlotWidth,
      enableTabChangeOnSelection,
      multiFeaturesSearched,
      multiFeatureSearchText,
      multiFeatureSearchTextError,
      multiSearchOpen,
      multiFeaturesNotFound,
      multiFeatureSearchActive,
    } = this.state;

    const {
      additionalTemplateInfoDifferentialTable,
      differentialColumns,
      differentialResultsTableLoading,
      differentialStudy,
      differentialModel,
      differentialTest,
      differentialPlotTypes,
      differentialFeature,
      differentialFeatureIdKey,
      differentialHighlightedFeaturesData,
      plotMultiFeatureMax,
      modelSpecificMetaFeaturesExist,
      onGetPlotTransition,
      plotOverlayVisible,
      plotSingleFeatureData,
      plotSingleFeatureDataLength,
      plotSingleFeatureDataLoaded,
      plotMultiFeatureAvailable,
      plotMultiFeatureData,
      plotMultiFeatureDataLength,
      plotMultiFeatureDataLoaded,
      singleFeaturePlotTypes,
      multiFeaturePlotTypes,
      svgExportName,
      tab,
      // multiModelMappingFirstKey,
    } = this.props;

    // let DifferentialDetailCacheKey = `${differentialStudy}-${differentialModel}-${differentialTest}-Volcano`;
    // if (multisetQueriedDifferential) {
    //   DifferentialDetailCacheKey = `${differentialStudy}-${differentialModel}-${differentialTest}-${multisetQueriedDifferential}-Volcano`;
    // }

    // const maxWidthPopupStyle = {
    //   backgroundColor: '2E2E2E',
    //   borderBottom: '2px solid var(--color-primary)',
    //   color: '#FFF',
    //   padding: '1em',
    //   maxWidth: '15vw',
    //   fontSize: '13px',
    // };

    const selectAllPopupStyle = {
      backgroundColor: '2E2E2E',
      borderBottom: '2px solid var(--color-primary)',
      color: '#FFF',
      padding: '1em',
      maxWidth: '25vw',
      fontSize: '13px',
    };
    const resizerStyle = {
      display: 'block',
    };

    const hiddenResizerStyle = {
      display: 'none',
    };

    const VerticalSidebar = ({ animation, direction, plotOverlayVisible }) => {
      const {
        featuresString,
        onBackToTable,
        differentialFeatureIdKey,
        differentialFeature,
        metaFeaturesDataDifferential,
        modelSpecificMetaFeaturesExist,
        fwdRefDVC,
        plotOverlayData,
        plotOverlayDataLength,
        plotOverlayLoaded,
        differentialPlotTypes,
        differentialTests,
        differentialHighlightedFeaturesData,
      } = this.props;

      if (plotOverlayVisible) {
        return (
          <Sidebar
            as={'div'}
            animation={animation}
            direction={direction}
            icon="labeled"
            vertical="true"
            visible={plotOverlayVisible}
            width="very wide"
            className="VerticalSidebarPlot"
          >
            <PlotsOverlay
              featuresString={featuresString}
              onBackToTable={onBackToTable}
              differentialFeatureIdKey={differentialFeatureIdKey}
              differentialFeature={differentialFeature}
              differentialHighlightedFeaturesData={
                differentialHighlightedFeaturesData
              }
              metaFeaturesDataDifferential={metaFeaturesDataDifferential}
              modelSpecificMetaFeaturesExist={
                modelSpecificMetaFeaturesExist || false
              }
              fwdRefDVC={fwdRefDVC}
              plotOverlayDataLength={plotOverlayDataLength || 0}
              plotOverlayData={plotOverlayData}
              plotOverlayLoaded={plotOverlayLoaded}
              differentialPlotTypes={differentialPlotTypes}
              svgTabMax={0}
              tab={tab}
              differentialStudy={differentialStudy}
              differentialModel={differentialModel}
              differentialTest={differentialTest}
              differentialTests={differentialTests}
              singleFeaturePlotTypes={singleFeaturePlotTypes}
              multiFeaturePlotTypes={multiFeaturePlotTypes}
            ></PlotsOverlay>
          </Sidebar>
        );
      } else return null;
    };

    const SelectAllPopupContent = (
      <List inverted>
        <List.Header id="MultiSelectColumnHeader">
          Multi-Select Column
        </List.Header>
        <List.Item>
          <Icon name="check square outline" />
          <List.Content>
            <List.Header>Select One</List.Header>
            <List.Description>
              Click a checkbox (or checkbox table cell) to select/deselect it
            </List.Description>
          </List.Content>
        </List.Item>
        <List.Item>
          <Icon name="keyboard" id="SelectedCircleIcon" />
          <List.Content>
            <List.Header>Select Multiple</List.Header>
            <List.Description>
              Control-Click or Shift-Click a ROW to multi-select/multi-deselect
            </List.Description>
          </List.Content>
        </List.Item>
      </List>
    );

    const MultiFeatureSearchPopup = {
      backgroundColor: '2E2E2E',
      borderBottom: '2px solid var(--color-primary)',
      color: '#FFF',
      padding: '1em',
      minWidth: '40vw',
      maxWidth: '40vw',
      fontSize: '13px',
      wordBreak: 'break-all',
    };

    // const differentialTableDataOptions =
    //   differentialTableData?.map(data => {
    //     return {
    //       key: data[this.props.differentialFeatureIdKey],
    //       text: data[this.props.differentialFeatureIdKey],
    //       value: data[this.props.differentialFeatureIdKey],
    //     };
    //   }) || [];

    // const onSearch = searchString => {
    // };

    const isMultiSearchOpen = bool => {
      if (bool != null) {
        this.setState({ multiSearchOpen: bool });
      } else this.setState({ multiSearchOpen: !this.state.multiOpen });
    };
    const searchColor =
      this.state.singleFeatureSearchText.length < 3 ? 'lightgrey' : 'blue';
    const searchIcon = this.state.singleFeatureSearchIcon;
    const searchClick = this.state.singleFeatureSearchActive
      ? this.handleSingleFeatureSearchSubmit
      : this.handleSingleFeatureSearchClear;
    const multiSearchInput = (
      // this.state.multiSearching ? (
      <div className="AbsoluteMultiSearchDifferential">
        <span id="MultiSearchPopupContainer">
          {!this.state.multiSearching ? (
            <Input
              placeholder="Search feature/s (min 3 char)"
              value={this.state.singleFeatureSearchText}
              onChange={this.handleSingleFeatureSearchTextChange}
              action={{
                color: searchColor,
                icon: searchIcon,
                onClick: searchClick,
              }}
            />
          ) : null}
          {this.state.multiSearching ? (
            <Popup
              trigger={
                <Button
                  as="div"
                  labelPosition="right"
                  onClick={isMultiSearchOpen}
                >
                  <Button color="blue" size="mini">
                    <Icon name="search" />
                    FEATURES SEARCHED
                  </Button>
                  <Label as="a" basic color="blue" pointing="left">
                    {multiFeaturesSearched.length}
                  </Label>
                </Button>
              }
              position="right center"
              basic
              on="click"
              open={multiSearchOpen}
              inverted
              style={MultiFeatureSearchPopup}
              id="MultiFeatureSearchPopup"
            >
              <Popup.Header>Multi-Feature Search</Popup.Header>
              <Popup.Content>
                Paste or type features below; separate with a comma, space or
                newline
              </Popup.Content>
              <Popup.Content id="MultiFeaturesSearchedList">
                {multiFeaturesNotFound?.length ? (
                  <List
                    animated
                    inverted
                    verticalAlign="middle"
                    className="NoSelect"
                    divided
                    horizontal
                    size="mini"
                  >
                    <List.Item>NOT FOUND:</List.Item>
                    {multiFeaturesNotFound.map(f => {
                      return (
                        <List.Item
                          key={`featureList-${f}`}
                          className="NoSelect"
                        >
                          <Label color="red" className="CursorPointer">
                            {f}
                          </Label>
                        </List.Item>
                      );
                    })}
                  </List>
                ) : null}
              </Popup.Content>
              <Popup.Content>
                <Form>
                  <Form.TextArea
                    autoFocus
                    placeholder="Separate features with a comma, space, or newline"
                    name="multiFeatureSearchText"
                    id="multiFeatureSearchTextArea"
                    value={multiFeatureSearchText}
                    onChange={this.handleMultiFeatureSearchTextChange}
                    onFocus={this.moveCaretAtEnd}
                  />
                </Form>
                {multiFeatureSearchTextError ? (
                  <Popup.Content id="multiFeatureSearchTextError">
                    Features must be separated with a space, comma, or newline
                  </Popup.Content>
                ) : null}
                <div>
                  <Button
                    className={
                      multiFeatureSearchActive
                        ? 'PrimaryBackground multiSearchAction'
                        : 'multiSearchAction'
                    }
                    content="Search"
                    onClick={this.submitMultiFeatureSearch}
                    icon="search"
                  />
                  {/* <Button
                    color="blue"
                    className="multiSearchAction"
                    content="Clear Selection"
                    onClick={this.handleMultiSearchClear}
                    icon="undo"
                  /> */}
                  <Button
                    className="multiSearchAction"
                    content="Close"
                    onClick={this.handleMultiSearchClose}
                    icon="close"
                  />
                </div>
              </Popup.Content>
            </Popup>
          ) : null}
        </span>
      </div>
      // ) : (
      //   <Input onChange={this.handleSingleFeatureSearchTextChange} />
    );

    const table = (
      <EZGrid
        ref={this.volcanoPlotFilteredGridRef}
        // uniqueCacheKey={DifferentialDetailCacheKey}
        className="VolcanoPlotTable"
        // note, default is 70vh; if you want a specific vh, specify like "40vh"; "auto" lets the height flow based on items per page
        // height="auto"
        height={upperPlotsVisible ? 'auto' : '70vh'}
        // height="70vh"
        data={differentialTableData || []}
        totalRows={differentialTableRows || 0}
        columnsConfig={differentialColumns}
        itemsPerPage={itemsPerPageVolcanoTable}
        onItemsPerPageChange={this.handleItemsPerPageChange}
        disableGeneralSearch
        disableGrouping
        disableColumnVisibilityToggle
        // exportBaseName="VolcanoPlot_Filtered_Results"
        loading={differentialResultsTableLoading}
        additionalTemplateInfo={additionalTemplateInfoDifferentialTable}
        onRowClick={this.handleRowClick}
        rowLevelPropsCalc={this.rowLevelPropsCalc}
        emptyMessage={CustomEmptyMessage}
        onFiltered={this.handleTableChange}
        disableQuickViewEditing
        disableQuickViewMenu
        extraHeaderItem={
          multiSearchInput
          // <Dropdown
          //   placeholder="Search"
          //   multiple
          //   search
          //   selection
          //   options={differentialTableDataOptions}
          // />
        }
      />
    );
    const scatterPlot = (
      <ScatterPlotDiv
        {...this.state}
        {...this.props}
        // DEV - drill just as needed!
        onHandleHighlightedFeaturesDifferential={
          this.props.onHandleHighlightedFeaturesDifferential
        }
        onHandleVolcanoPlotSelectionChange={
          this.handleVolcanoPlotSelectionChange
        }
        // getMaxAndMin={this.getMaxAndMin}
        onHandleDotClick={this.handleDotClick}
        onPageToFeature={this.pageToFeature}
        onHandleUpdateDifferentialResults={
          this.props.onHandleUpdateDifferentialResults
        }
        onResetDifferentialOutlinedFeature={
          this.props.onResetDifferentialOutlinedFeature
        }
        onReloadMultifeaturePlot={this.reloadMultifeaturePlot}
      ></ScatterPlotDiv>
    );

    const dynamicPlots = (
      <PlotsDynamic
        modelSpecificMetaFeaturesExist={modelSpecificMetaFeaturesExist || false}
        differentialStudy={differentialStudy}
        differentialModel={differentialModel}
        differentialTest={differentialTest}
        differentialFeature={differentialFeature}
        enableTabChangeOnSelection={enableTabChangeOnSelection}
        pxToPtRatio={105}
        pointSize={12}
        svgTabMax={0}
        tab={tab}
        upperPlotsDivHeight={upperPlotsDivHeight}
        upperPlotsHeight={upperPlotsDivHeight}
        differentialDynamicPlotWidth={differentialDynamicPlotWidth}
        volcanoDivWidth={volcanoDivWidth}
        volcanoWidth={volcanoWidth}
        volcanoPlotVisible={volcanoPlotVisible}
        upperPlotsVisible={upperPlotsVisible}
        plotSingleFeatureData={plotSingleFeatureData}
        plotSingleFeatureDataLength={plotSingleFeatureDataLength}
        plotSingleFeatureDataLoaded={plotSingleFeatureDataLoaded}
        plotMultiFeatureData={plotMultiFeatureData}
        plotMultiFeatureDataLength={plotMultiFeatureDataLength}
        plotMultiFeatureDataLoaded={plotMultiFeatureDataLoaded}
        singleFeaturePlotTypes={singleFeaturePlotTypes}
        multiFeaturePlotTypes={multiFeaturePlotTypes}
        svgExportName={svgExportName}
        differentialPlotTypes={differentialPlotTypes}
        differentialHighlightedFeaturesData={
          differentialHighlightedFeaturesData
        }
        differentialFeatureIdKey={differentialFeatureIdKey}
        plotMultiFeatureMax={plotMultiFeatureMax}
        onGetPlotTransitionRef={onGetPlotTransition}
        onGetMultifeaturePlotTransitionAlt={
          this.getMultifeaturePlotTransitionAlt
        }
        onHandleVolcanoVisability={this.handleVolcanoVisability}
        onHandleHighlightedFeaturesDifferential={
          this.props.onHandleHighlightedFeaturesDifferential
        }
        onResetDifferentialOutlinedFeature={
          this.props.onResetDifferentialOutlinedFeature
        }
        onRemoveSelectedFeature={this.removeSelectedFeature}
        onHandleAllChecked={bool => this.setState({ allChecked: bool })}
        plotMultiFeatureAvailable={this.props.plotMultiFeatureAvailable}
        onHandlePlotlyClick={this.handlePlotlyClick}
      ></PlotsDynamic>
    );
    return (
      <Grid.Column mobile={16} tablet={16} largeScreen={12} widescreen={12}>
        <Sidebar.Pushable as={'span'}>
          <VerticalSidebar
            animation={animation}
            direction={direction}
            plotOverlayVisible={plotOverlayVisible}
          />
          <Sidebar.Pusher>
            <div>
              <Grid className="VolcanoPlotGridContainer">
                <Grid.Row id="VolcanoViewRow">
                  <Grid.Column>
                    <SplitPane
                      split="horizontal"
                      className="VolcanoSplitPane"
                      resizerStyle={
                        upperPlotsVisible ? resizerStyle : hiddenResizerStyle
                      }
                      // defaultSize={upperPlotsHeight * 1.05263157895} 1.20263157895
                      size={upperPlotsVisible ? upperPlotsDivHeight : 1}
                      minSize={420}
                      maxSize={1000}
                      onDragFinished={size =>
                        this.handleSizeChange(size, 'horizontal')
                      }
                    >
                      <SplitPane
                        split="vertical"
                        className={
                          upperPlotsVisible
                            ? 'Show VolcanoSplitPane'
                            : 'Hide VolcanoSplitPane'
                        }
                        resizerStyle={
                          upperPlotsVisible && volcanoPlotVisible
                            ? resizerStyle
                            : hiddenResizerStyle
                        }
                        // defaultSize={volcanoWidth * 1.05263157895}
                        size={volcanoDivWidth}
                        minSize={350}
                        maxSize={1800}
                        onDragFinished={size =>
                          this.handleSizeChange(size, 'vertical')
                        }
                      >
                        {scatterPlot}
                        {dynamicPlots}
                      </SplitPane>
                      <Grid.Row>
                        <span
                          className={
                            upperPlotsVisible
                              ? 'VolcanoPlotButton'
                              : 'UpperPlotsToggle'
                          }
                        >
                          <Label
                            circular
                            image
                            id="VolcanoPlotButton"
                            onClick={this.handleUpperPlotsVisability}
                            // size={dynamicSizeLarger}
                            // size={upperPlotsVisible ? '' : 'large'}
                          >
                            <Icon
                              // size={dynamicSizeLarger}
                              // size={upperPlotsVisible ? '' : 'large'}
                              name={
                                upperPlotsVisible ? 'angle up' : 'angle down'
                              }
                            />
                            {upperPlotsVisible ? 'Hide Plots' : 'Show Plots'}
                          </Label>
                        </span>
                        {/* <div className="DifferentialDetailMultiModelText NoSelect">
                          {multiModelMappingFirstKey ? (
                            <Popup
                              trigger={
                                <Icon
                                  name="asterisk"
                                  size="small"
                                  color="blue"
                                />
                              }
                              style={maxWidthPopupStyle}
                              content="Multi-Model plot available for this feature"
                              inverted
                              basic
                            />
                          ) : null}
                        </div> */}
                        {/* <div className="DifferentialDetailMultiModelText NoSelect">
                          {multiModelMappingFirstKey ? (
                            <>
                              <Icon name="asterisk" size="small" color="blue" />
                              Multi-Model plot available for this feature
                            </>
                          ) : null}
                        </div> */}
                        <div className="FloatRight AbsoluteExportDifferential">
                          <ButtonActions
                            exportButtonSize={'small'}
                            excelVisible={true}
                            pngVisible={false}
                            pdfVisible={false}
                            svgVisible={false}
                            txtVisible={true}
                            refFwd={this.volcanoPlotFilteredGridRef}
                            tab={tab}
                            study={differentialStudy}
                            model={differentialModel}
                            test={differentialTest}
                          />
                        </div>
                        <Grid.Column
                          className="ResultsTableWrapper"
                          id={
                            plotMultiFeatureAvailable
                              ? 'DifferentialResultsTableWrapperCheckboxes'
                              : 'DifferentialResultsTableWrapper'
                          }
                          mobile={16}
                          tablet={16}
                          largeScreen={16}
                          widescreen={16}
                        >
                          {plotMultiFeatureAvailable ? (
                            <>
                              <Popup
                                trigger={
                                  <Icon
                                    name="info"
                                    id="ToggleAllCheckboxInfo"
                                  />
                                }
                                style={selectAllPopupStyle}
                                // content="Row is light orange when the feature is selected"
                                content={SelectAllPopupContent}
                                inverted
                                basic
                              />
                              {/* <Icon
                                name={
                                  allChecked ? 'check square' : 'square outline'
                                }
                                size="large"
                                id="ToggleAllCheckbox"
                                className={allChecked ? 'PrimaryColor' : ''}
                                onClick={this.toggleAllCheckboxes}
                              /> */}
                            </>
                          ) : null}
                          {table}
                        </Grid.Column>
                      </Grid.Row>
                    </SplitPane>
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </div>
          </Sidebar.Pusher>
        </Sidebar.Pushable>
      </Grid.Column>
    );
  }
}
export default DifferentialDetail;
