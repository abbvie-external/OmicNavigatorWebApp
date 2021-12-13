import React, { Component } from 'react';
import _ from 'lodash';
import CustomEmptyMessage from '../Shared/Templates';
// eslint-disable-next-line no-unused-vars
import { EZGrid } from '../Shared/QHGrid';
import PlotsOverlay from './PlotsOverlay';
import PlotsDynamic from './PlotsDynamic';
import {
  scrollElement,
  limitLength,
  limitLengthOrNull,
} from '../Shared/helpers';
import ScatterPlot from './ScatterPlot';
import { Grid, Popup, Label, Sidebar, Icon, List } from 'semantic-ui-react';
import ButtonActions from '../Shared/ButtonActions';
import './DifferentialDetail.scss';
import SplitPane from 'react-split-pane';

class DifferentialDetail extends Component {
  state = {
    upperPlotsHeight:
      parseInt(localStorage.getItem('upperPlotsHeight'), 10) || 400,
    upperPlotsHeightBackup:
      parseInt(localStorage.getItem('upperPlotsHeightBackup'), 10) || 400,
    upperPlotsDivHeight:
      parseInt(localStorage.getItem('upperPlotsDivHeight'), 10) || 440,
    upperPlotsDivHeightBackup:
      parseInt(localStorage.getItem('upperPlotsDivHeightBackup'), 10) || 440,
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
    // differentialTableData: [],
    filteredDifferentialTableData: [],
    itemsPerPageVolcanoTable:
      parseInt(localStorage.getItem('itemsPerPageVolcanoTable'), 10) || 30,
    // volcanoPlotRows: 0,
    animation: 'overlay',
    direction: 'right',
    visible: false,
    scatterPlotBoxSelection: [],
    allChecked: false,
  };
  volcanoPlotFilteredGridRef = React.createRef();
  ScatterPlotRef = React.createRef();

  componentDidMount() {
    this.setState({
      differentialTableData: this.props.differentialResults,
      // volcanoPlotRows: this.props.differentialResults.length,
    });
  }

  componentDidUpdate(prevProps) {
    const { differentialResults } = this.props;
    // if (prevProps.differentialTest !== differentialTest) {
    //   this.handleUpperPlotVisability(null, true);
    // }

    // THIS CODE ISN'T BEING USED NOW, BUT IS BREAKING THE APP IN SOME SITUATIONS, E.G. MULTIPLE COLUMN MULTISET FILTERING WITH NO RESULTS
    // if (this.props.plotMultiFeatureAvailable) {
    //   const columnHeader = document.querySelector('[data-id="select"]');
    //   if (!columnHeader.classList.value.split(' ').includes('th-select')) {
    //     columnHeader.classList.add('th-select');
    //     const toggleDiv = document.createElement('div');
    //     toggleDiv.classList.add('toggleDiv');
    //     // toggleDiv.onclick = () => {
    //     //   this.toggleAllCheckboxes();
    //     // };
    //     columnHeader.appendChild(toggleDiv);
    //   }
    // }

    if (prevProps.differentialResults !== differentialResults) {
      let data =
        differentialResults.length !==
          this.state.scatterPlotBoxSelection.length &&
        !!this.state.scatterPlotBoxSelection.length
          ? this.state.scatterPlotBoxSelection
          : differentialResults;

      this.setState({
        allChecked: false,
        differentialTableData: data,
        volcanoPlotRows: data?.length || 0,
        featuresLength:
          limitLength(data?.length, this.props.plotMultiFeatureMax) || 0,
      });
    }

    // if (
    //   prevProps.differentialHighlightedFeaturesData?.length !==
    //   this.props.differentialHighlightedFeaturesData?.length
    // ) {
    //   this.handleTableChange();
    // }
  }

  handleScatterPlotBoxSelection = currentSelection => {
    this.setState({
      scatterPlotBoxSelection: currentSelection,
    });
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
    /* eslint-disable eqeqeq */
    // if (item[differentialFeatureIdKey] === volcanoDifferentialTableRowMax) {
    //   className = 'rowHighlightMax';
    // }
    /* eslint-disable eqeqeq */
    if (item[differentialFeatureIdKey] === differentialOutlinedFeature) {
      id = 'rowOutline';
    }
    return {
      className,
      id,
    };
  };

  handleVolcanoPlotSelectionChange = (
    volcanoPlotSelectedDataArr,
    clearHighlightedData,
  ) => {
    this.setState({
      allChecked: false,
    });
    // clear the highlighted rows/dots/svg on svg double-click
    if (clearHighlightedData) {
      this.pageToFeature();
      this.props.onHandleHighlightedFeaturesDifferential([]);
      this.setState({
        differentialTableData: volcanoPlotSelectedDataArr,
      });
      return;
    }
    let allFeatureIdsRemaining = [...volcanoPlotSelectedDataArr].map(
      i => i[this.props.differentialFeatureIdKey],
    );
    let isOutlinedFeatureInView = allFeatureIdsRemaining.includes(
      this.props.differentialOutlinedFeature,
    );
    if (volcanoPlotSelectedDataArr.length > 0) {
      let sortedData =
        this.volcanoPlotFilteredGridRef?.current?.qhGridRef?.current?.getSortedData() ||
        this.props.differentialResults;
      // const sortDataIds = [...sortedData].map(d => d[this.props.differentialFeatureIdKey]);
      const volcanoPlotDataArrIds = [...volcanoPlotSelectedDataArr].map(
        d => d[this.props.differentialFeatureIdKey],
      );
      const matchCurrentTableOrder = [...sortedData].filter(d =>
        volcanoPlotDataArrIds.includes(d[this.props.differentialFeatureIdKey]),
      );
      const self = this;
      this.setState({
        differentialTableData: matchCurrentTableOrder,
        volcanoPlotRows: volcanoPlotSelectedDataArr.length,
      });
      let multiselectedFeaturesArrRemaining = [
        ...volcanoPlotSelectedDataArr,
      ].filter(item =>
        self.props.differentialHighlightedFeatures.includes(
          item[self.props.differentialFeatureIdKey],
        ),
      );
      if (multiselectedFeaturesArrRemaining.length) {
        // if there are multi-selected features in the box selection, reload the svg, single or multi
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
        // let hasOutline = features?.includes(
        //   this.props.differentialOutlinedFeature,
        // );
        // if the outlined dot is still in the chart, page to it, otherwise clear it's state and page to 0
        if (isOutlinedFeatureInView) {
          setTimeout(function() {
            self.pageToFeature(self.props.differentialOutlinedFeature);
          }, 500);
        } else {
          this.props.onClearPlotSelected();
          this.pageToFeature();
        }
      } else {
        this.props.onHandleHighlightedFeaturesDifferential([]);
        // there are no multi-selected features in the box selection; check for outligned row and load, or clear svg pane
        if (isOutlinedFeatureInView) {
          // this timeout give the table time to load, before paging to the outlined feature
          setTimeout(function() {
            self.props.onGetPlot(
              'SingleFeature',
              self.props.differentialOutlinedFeature,
              false,
              false,
            );
            self.pageToFeature(self.props.differentialOutlinedFeature);
          }, 500);
        } else {
          this.props.onClearPlotSelected();
          this.pageToFeature();
        }
      }
    } else {
      // nothing is in box selection
      this.props.onHandleHighlightedFeaturesDifferential([]);
      this.props.onClearPlotSelected();
      this.setState({
        differentialTableData: [],
        volcanoPlotRows: 0,
      });
      this.pageToFeature();
    }
  };

  handleUpdateDifferentialResults = results => {
    this.props.onHandleUpdateDifferentialResults(results);
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
    // console.log('bin', bins[0]);
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
    removedOutlined,
  ) => {
    const { differentialFeatureIdKey } = this.props;
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
        this.pageToFeature(event[differentialFeatureIdKey]);
      }
      this.reloadMultifeaturePlot(elementArray);
    }
  };

  getTableHelpers = differentialFeatureIdKeyVar => {
    const self = this;
    let addParams = {};
    addParams.showPlotOverlay = (dataItem, alphanumericTrigger) => {
      return function() {
        self.setState({
          differentialOutlinedFeature: dataItem[alphanumericTrigger],
        });
        self.getPlot('Volcano', dataItem[alphanumericTrigger], false, false);
      };
    };
    addParams.elementId = differentialFeatureIdKeyVar;
    this.setState({ additionalTemplateInfoDifferentialTable: addParams });
  };

  removeSelectedFeature = featureToRemove => {
    const {
      differentialResults,
      differentialHighlightedFeaturesData,
    } = this.props;
    let sortedData =
      this.volcanoPlotFilteredGridRef?.current?.qhGridRef?.current?.getSortedData() ||
      differentialResults;
    const PreviouslyHighlighted = [...differentialHighlightedFeaturesData];
    const selectedTableDataArray = PreviouslyHighlighted.filter(
      i => i.id !== featureToRemove,
    );
    this.props.onHandleHighlightedFeaturesDifferential(selectedTableDataArray);
    this.setState({
      featuresLength:
        limitLengthOrNull(
          selectedTableDataArray?.length,
          this.props.plotMultiFeatureMax,
        ) || limitLength(sortedData?.length, this.props.plotMultiFeatureMax),
    });
    // if (selectedTableDataArray.length === 1) {
    // less then 2 left
    // this.props.onClearPlotSelected();
    this.reloadMultifeaturePlot(selectedTableDataArray);
    // }
  };

  reloadMultifeaturePlot = _.debounce((selected, boxSelection) => {
    const data = boxSelection
      ? selected
      : this.volcanoPlotFilteredGridRef?.current?.qhGridRef?.current?.getSortedData() ||
        this.props.differentialResults;
    if (selected.length > 1) {
      if (selected.length)
        this.props.onHandleMultifeaturePlot('MultiFeature', data);
    } else if (selected.length === 1) {
      this.setState({ allChecked: false });
      if (this.props.differentialOutlinedFeature) {
        this.props.onGetPlot(
          'SingleFeature',
          this.props.differentialOutlinedFeature,
          false,
          false,
        );
      } else {
        this.props.onClearPlotSelected();
        this.pageToFeature();
      }
    } else return;
  }, 1250);

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
    // console.log('className', event.target.className);
    // console.log('classList', event.target.classList);
    // console.log('Event', { event });
    // console.log(event?.target?.classList?.contains('DifferentialResultsRowCheckbox'));
    // console.log(event?.target?.classList?.contains('DifferentialResultsRowCheckboxDiv'));
    // console.log(event?.target?.innerHTML.includes('DifferentialResultsRowCheckboxDiv'));
    if (
      item == null ||
      event?.target?.className === 'ExternalSiteIcon' ||
      event?.target?.className === 'TableCellLink NoSelect' ||
      event?.target?.className === 'TableCellLink'
    ) {
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
        this.setState({
          featuresLength:
            limitLengthOrNull(
              uniqueTableDataArray?.length,
              this.props.plotMultiFeatureMax,
            ) ||
            limitLength(sortedData?.length, this.props.plotMultiFeatureMax),
        });
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
          this.setState({
            featuresLength:
              limitLengthOrNull(
                selectedTableDataArray?.length,
                this.props.plotMultiFeatureMax,
              ) ||
              limitLength(sortedData?.length, this.props.plotMultiFeatureMax),
          });
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
          this.setState({
            featuresLength:
              limitLengthOrNull(
                selectedTableDataArray?.length,
                this.props.plotMultiFeatureMax,
              ) ||
              limitLength(sortedData?.length, this.props.plotMultiFeatureMax),
          });
          this.reloadMultifeaturePlot(selectedTableDataArray);
        }
      } else {
        // if item is already outlined, remove outline and clear plot
        if (item[differentialFeatureIdKey] === differentialOutlinedFeature) {
          if (this.props.differentialHighlightedFeatures.length) {
            this.reloadMultifeaturePlot(
              this.props.differentialHighlightedFeatures,
            );
          }
          this.props.onClearPlotSelected();
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
    const { volcanoDivWidth } = this.state;
    const { fwdRefDVC } = this.props;
    const plotSizeAdjustment = Math.round(newSize * 0.92);
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
    this.setState({
      filteredDifferentialTableData: sortedFilteredData,
      // allChecked: false,
    });
    let allFeatureIdsRemaining = [...sortedFilteredData].map(
      i => i[this.props.differentialFeatureIdKey],
    );
    let isOutlinedFeatureInView = allFeatureIdsRemaining.includes(
      this.props.differentialOutlinedFeature,
    );

    if (!this.props.plotMultiFeatureAvailable) {
      const self = this;
      if (isOutlinedFeatureInView) {
        setTimeout(function() {
          self.props.onGetPlot(
            'SingleFeature',
            self.props.differentialOutlinedFeature,
            false,
            false,
          );
          self.pageToFeature(self.props.differentialOutlinedFeature);
        }, 500);
      } else {
        this.props.onClearPlotSelected();
        this.pageToFeature();
      }
      this.setState({
        featuresLength: 0,
      });
    } else {
      if (sortedFilteredData.length > 0) {
        const self = this;
        let multiselectedFeaturesArrRemaining = [
          ...sortedFilteredData,
        ].filter(item =>
          self.props.differentialHighlightedFeatures.includes(
            item[self.props.differentialFeatureIdKey],
          ),
        );
        if (multiselectedFeaturesArrRemaining.length) {
          if (multiselectedFeaturesArrRemaining.length === 1) {
            this.setState({
              featuresLength: 1,
            });
          } else if (multiselectedFeaturesArrRemaining.length > 1) {
            this.setState({
              featuresLength:
                limitLengthOrNull(
                  multiselectedFeaturesArrRemaining?.length,
                  this.props.plotMultiFeatureMax,
                ) ||
                limitLength(
                  sortedFilteredData?.length,
                  this.props.plotMultiFeatureMax,
                ),
            });
          }
          // if there are multi-selected features in the table, reload the svg, single or multi
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
          // if the outlined row is still in the table, page to it, otherwise clear it's state and page to 0
          if (isOutlinedFeatureInView) {
            setTimeout(function() {
              self.pageToFeature(self.props.differentialOutlinedFeature);
            }, 500);
          } else {
            this.props.onClearPlotSelected();
            this.pageToFeature();
          }
        } else {
          this.props.onHandleHighlightedFeaturesDifferential([]);
          // there are no multi-selected features in the tablen; check for outligned row and load, or clear svg pane
          if (isOutlinedFeatureInView) {
            setTimeout(function() {
              self.props.onGetPlot(
                'SingleFeature',
                self.props.differentialOutlinedFeature,
                false,
                false,
              );
              self.pageToFeature(self.props.differentialOutlinedFeature);
            }, 500);
          } else {
            this.props.onClearPlotSelected();
            this.pageToFeature();
          }
          this.setState({
            featuresLength: 0,
          });
        }
      } else {
        // no highlighted nor outlined features after table filter
        this.props.onHandleHighlightedFeaturesDifferential([]);
        this.props.onClearPlotSelected();
        this.setState({
          featuresLength: 0,
        });
        this.pageToFeature();
      }
    }
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

  render() {
    const {
      differentialTableData,
      itemsPerPageVolcanoTable,
      volcanoPlotRows,
      volcanoPlotVisible,
      upperPlotsVisible,
      upperPlotsDivHeight,
      volcanoDivWidth,
      volcanoWidth,
      animation,
      direction,
      featuresLength,
      differentialDynamicPlotWidth,
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
      differentialHighlightedFeatures,
      differentialOutlinedFeature,
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
      svgExportName,
      tab,
    } = this.props;
    // let DifferentialDetailCacheKey = `${differentialStudy}-${differentialModel}-${differentialTest}-Volcano`;
    // if (multisetQueriedDifferential) {
    //   DifferentialDetailCacheKey = `${differentialStudy}-${differentialModel}-${differentialTest}-${multisetQueriedDifferential}-Volcano`;
    // }
    const maxWidthPopupStyle = {
      backgroundColor: '2E2E2E',
      borderBottom: '2px solid var(--color-primary)',
      color: '#FFF',
      padding: '1em',
      maxWidth: '15vw',
      fontSize: '13px',
    };

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
              metaFeaturesDataDifferential={metaFeaturesDataDifferential}
              modelSpecificMetaFeaturesExist={
                modelSpecificMetaFeaturesExist || false
              }
              fwdRefDVC={fwdRefDVC}
              plotOverlayDataLength={plotOverlayDataLength || 0}
              plotOverlayData={plotOverlayData}
              plotOverlayLoaded={plotOverlayLoaded}
              differentialPlotTypes={differentialPlotTypes}
              svgTabMax={4}
              tab={tab}
              differentialStudy={differentialStudy}
              differentialModel={differentialModel}
              differentialTest={differentialTest}
              differentialTests={differentialTests}
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
              Control-Click or Shift-Click a ROW to multi-select/mulit-deselect
            </List.Description>
          </List.Content>
        </List.Item>
      </List>
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
                      minSize={400}
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
                        <ScatterPlot
                          ref={this.ScatterPlotRef}
                          {...this.state}
                          {...this.props}
                          onHandleVolcanoPlotSelectionChange={
                            this.handleVolcanoPlotSelectionChange
                          }
                          // getMaxAndMin={this.getMaxAndMin}
                          onHandleDotClick={this.handleDotClick}
                          onPageToFeature={this.pageToFeature}
                          onHandleScatterPlotBoxSelection={
                            this.handleScatterPlotBoxSelection
                          }
                          onClearPlotSelected={this.props.onClearPlotSelected}
                        ></ScatterPlot>
                        <PlotsDynamic
                          modelSpecificMetaFeaturesExist={
                            modelSpecificMetaFeaturesExist || false
                          }
                          differentialStudy={differentialStudy}
                          differentialModel={differentialModel}
                          differentialTest={differentialTest}
                          differentialFeature={differentialFeature}
                          pxToPtRatio={105}
                          pointSize={12}
                          svgTabMax={0}
                          tab={tab}
                          upperPlotsDivHeight={upperPlotsDivHeight}
                          upperPlotsHeight={upperPlotsDivHeight}
                          differentialDynamicPlotWidth={
                            differentialDynamicPlotWidth
                          }
                          volcanoDivWidth={volcanoDivWidth}
                          volcanoWidth={volcanoWidth}
                          volcanoPlotVisible={volcanoPlotVisible}
                          upperPlotsVisible={upperPlotsVisible}
                          plotSingleFeatureData={plotSingleFeatureData}
                          plotSingleFeatureDataLength={
                            plotSingleFeatureDataLength
                          }
                          plotSingleFeatureDataLoaded={
                            plotSingleFeatureDataLoaded
                          }
                          plotMultiFeatureData={plotMultiFeatureData}
                          plotMultiFeatureDataLength={
                            plotMultiFeatureDataLength
                          }
                          plotMultiFeatureDataLoaded={
                            plotMultiFeatureDataLoaded
                          }
                          svgExportName={svgExportName}
                          differentialPlotTypes={differentialPlotTypes}
                          differentialHighlightedFeaturesData={
                            differentialHighlightedFeaturesData
                          }
                          featuresLength={featuresLength}
                          differentialFeatureIdKey={differentialFeatureIdKey}
                          plotMultiFeatureMax={plotMultiFeatureMax}
                          onGetPlotTransitionRef={onGetPlotTransition}
                          onGetMultifeaturePlotTransitionAlt={
                            this.getMultifeaturePlotTransitionAlt
                          }
                          // onHandleMultifeaturePlotRef={
                          //   onHandleMultifeaturePlot
                          // }
                          onHandleVolcanoVisability={
                            this.handleVolcanoVisability
                          }
                          onHandleHighlightedFeaturesDifferential={
                            this.props.onHandleHighlightedFeaturesDifferential
                          }
                          onClearPlotSelected={this.props.onClearPlotSelected}
                          onRemoveSelectedFeature={this.removeSelectedFeature}
                          onHandleAllChecked={bool =>
                            this.setState({ allChecked: bool })
                          }
                          plotMultiFeatureAvailable={
                            this.props.plotMultiFeatureAvailable
                          }
                        ></PlotsDynamic>
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
                        <div className="AbsoluteLegendDifferential NoSelect">
                          {differentialOutlinedFeature ? (
                            <Popup
                              trigger={
                                <Icon
                                  name="square outline"
                                  size="big"
                                  id="SelectedPlotLegend"
                                />
                              }
                              style={maxWidthPopupStyle}
                              // content="Row is outlined blue when the feature's plots are being displayed"
                              content="Plots are displayed above"
                              inverted
                              basic
                            />
                          ) : null}
                          {differentialHighlightedFeatures?.length > 0 ? (
                            <Popup
                              trigger={
                                <Icon
                                  name="check square outline"
                                  size="big"
                                  id="SelectedRowLegend"
                                />
                                // <Label circular id="OtherCircle" />
                              }
                              style={maxWidthPopupStyle}
                              // content="Row is light orange when the feature is selected"
                              content="Selected"
                              inverted
                              basic
                            />
                          ) : null}
                        </div>
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
                          <EZGrid
                            ref={this.volcanoPlotFilteredGridRef}
                            // uniqueCacheKey={DifferentialDetailCacheKey}
                            className="VolcanoPlotTable"
                            // note, default is 70vh; if you want a specific vh, specify like "40vh"; "auto" lets the height flow based on items per page
                            // height="auto"
                            height={volcanoPlotVisible ? 'auto' : '70vh'}
                            // height="70vh"
                            data={differentialTableData || []}
                            totalRows={volcanoPlotRows || 0}
                            columnsConfig={differentialColumns}
                            itemsPerPage={itemsPerPageVolcanoTable}
                            onItemsPerPageChange={this.handleItemsPerPageChange}
                            // disableGeneralSearch
                            disableGrouping
                            disableColumnVisibilityToggle
                            // exportBaseName="VolcanoPlot_Filtered_Results"
                            loading={differentialResultsTableLoading}
                            additionalTemplateInfo={
                              additionalTemplateInfoDifferentialTable
                            }
                            onRowClick={this.handleRowClick}
                            rowLevelPropsCalc={this.rowLevelPropsCalc}
                            emptyMessage={CustomEmptyMessage}
                            onFiltered={this.handleTableChange}
                            disableQuickViewEditing
                            disableQuickViewMenu
                          />
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
