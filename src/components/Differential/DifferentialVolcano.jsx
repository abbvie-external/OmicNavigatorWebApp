import React, { Component } from 'react';
import _ from 'lodash';
import CustomEmptyMessage from '../Shared/Templates';
// eslint-disable-next-line no-unused-vars
import QHGrid, { EZGrid } from '../Shared/QHGrid';
import DifferentialPlot from './DifferentialPlot';
import SVGPlot from './SVGPlot';
import {
  scrollElement,
  limitLength,
  limitLengthOrNull,
  // dynamicSizeLarger,
} from '../Shared/helpers';
import DifferentialVolcanoPlot from './DifferentialVolcanoPlot';
import {
  // Form,
  Grid,
  // Select,
  // Checkbox,
  Popup,
  Label,
  Sidebar,
  // Button,
  // Transition,
  Icon,
  Button,
} from 'semantic-ui-react';
// import VolcanoPlotIcon from '../../resources/VolcanoPlotIcon.png';
// import VolcanoPlotIconSelected from '../../resources/VolcanoPlotIconSelected.png';
import ButtonActions from '../Shared/ButtonActions';
import './DifferentialVolcano.scss';
import SplitPane from 'react-split-pane';

class DifferentialVolcano extends Component {
  state = {
    upperPlotsHeight:
      parseInt(localStorage.getItem('upperPlotsHeight'), 10) || 370,
    upperPlotsHeightBackup:
      parseInt(localStorage.getItem('upperPlotsHeightBackup'), 10) || 370,
    upperPlotsDivHeight:
      parseInt(localStorage.getItem('upperPlotsDivHeight'), 10) || 400,
    upperPlotsDivHeightBackup:
      parseInt(localStorage.getItem('upperPlotsDivHeightBackup'), 10) || 400,
    differentialDynamicPlotWidth:
      parseInt(localStorage.getItem('differentialDynamicPlotWidth'), 10) || 600,
    volcanoWidth: parseInt(localStorage.getItem('volcanoWidth'), 10) || 460,
    volcanoDivWidth:
      parseInt(localStorage.getItem('volcanoDivWidth'), 10) || 500,
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
    volcanoCurrentSelection: [],
    allChecked: false,
  };
  volcanoPlotFilteredGridRef = React.createRef();
  differentialVolcanoPlotRef = React.createRef();

  componentDidMount() {
    this.setState({
      differentialTableData: this.props.differentialResults,
      // volcanoPlotRows: this.props.differentialResults.length,
    });
    // integrate with streaming
    // const { featureToHighlightInDiffTable } = this.props;
    // if (featureToHighlightInDiffTable !== '') {
    //   const featureToHighlightInDiffTableArr = [
    //     {
    //       id: featureToHighlightInDiffTable,
    //       value: featureToHighlightInDiffTable,
    //       key: featureToHighlightInDiffTable,
    //     },
    //   ];
    // this.props.onHandleSelectedVolcano(featureToHighlightInDiffTableArr);
    // this.pageToFeature(featureToHighlightInDiffTable);
    // this.props.onResetFeatureToHighlightInDiffTable();
    // }
  }

  // shouldComponentUpdate() {
  //   return this.props.isValidSearchDifferential;
  // }

  componentDidUpdate(prevProps, prevState) {
    const { differentialResults } = this.props;
    // if (prevProps.differentialTest !== differentialTest) {
    //   this.handleUpperPlotVisability(null, true);
    // }
    if (prevProps.differentialResults !== differentialResults) {
      let data =
        differentialResults.length !==
          this.state.volcanoCurrentSelection.length &&
        !!this.state.volcanoCurrentSelection.length
          ? this.state.volcanoCurrentSelection
          : differentialResults;

      this.setState({
        differentialTableData: data,
        volcanoPlotRows: data?.length || 0,
        featuresLength:
          limitLength(data?.length, this.props.multifeaturePlotMax) || 0,
      });
    }

    if (
      prevProps.HighlightedFeaturesArrVolcano?.length !==
      this.props.HighlightedFeaturesArrVolcano?.length
    ) {
      this.handleTableChange();
    }

    // integrate with streaming
    // if (
    //   featureToHighlightInDiffTable !== '' &&
    //   prevProps.featureToHighlightInDiffTable !== featureToHighlightInDiffTable
    // ) {
    //   const featureToHighlightInDiffTableArr = [
    //     {
    //       id: featureToHighlightInDiffTable,
    //       value: featureToHighlightInDiffTable,
    //       key: featureToHighlightInDiffTable,
    //     },
    //   ];
    //   this.props.onHandleSelectedVolcano(featureToHighlightInDiffTableArr);
    //   this.pageToFeature(featureToHighlightInDiffTable);
    // }
    // if (prevProps.isItemSelected !== isItemSelected) {
    //   this.handlePlotAnimationVolcano('overlay');
    // }
  }

  handleVolcanoCurrentSelection = currentSelection => {
    this.setState({
      volcanoCurrentSelection: currentSelection,
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
      volcanoDifferentialTableRowHighlight,
      volcanoDifferentialTableRowOutline,
    } = this.props;
    if (
      volcanoDifferentialTableRowHighlight?.includes(
        item[differentialFeatureIdKey],
      )
    ) {
      className = 'rowHighlightOther';
    }
    /* eslint-disable eqeqeq */
    // if (item[differentialFeatureIdKey] === volcanoDifferentialTableRowMax) {
    //   className = 'rowHighlightMax';
    // }
    /* eslint-disable eqeqeq */
    if (item[differentialFeatureIdKey] === volcanoDifferentialTableRowOutline) {
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
    if (volcanoPlotSelectedDataArr.length > 0) {
      this.setState({
        differentialTableData: volcanoPlotSelectedDataArr,
        volcanoPlotRows: volcanoPlotSelectedDataArr.length,
      });
      // if there the max in the table, scroll to it
      if (this.props.volcanoDifferentialTableRowOutline) {
        let features = volcanoPlotSelectedDataArr.map(
          i => i[this.props.differentialFeatureIdKey],
        );
        let hasOutline = features.includes(
          this.props.volcanoDifferentialTableRowOutline,
        );
        const self = this;
        if (hasOutline) {
          setTimeout(function() {
            self.pageToFeature(self.props.volcanoDifferentialTableRowOutline);
          }, 500);
        } else this.pageToFeature();
      }
    } else {
      this.setState({
        differentialTableData: [],
        volcanoPlotRows: 0,
      });
    }
    // clear the highlighted rows/dots/svg
    if (clearHighlightedData) {
      this.pageToFeature();
      this.props.onHandleSelectedVolcano([]);
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

    this.props.onHandleSelectedVolcano(bins);
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
  ) => {
    const { differentialFeatureIdKey } = this.props;
    if (simpleClick) {
      const obj = JSON.parse(elem._groups[0][0].attributes.data.value) || '';
      const feature = obj ? obj[differentialFeatureIdKey] : '';
      this.props.onSetPlotSelected(feature);
      this.pageToFeature(event[differentialFeatureIdKey]);
      this.props.onGetPlot('Volcano', feature, false, false);
    } else {
      // const dotClickArr = [
      //   {
      //     id: item[differentialFeatureIdKey],
      //     value: item[differentialFeatureIdKey],
      //     key: item[differentialFeatureIdKey],
      //   },
      // ];
      // this.setState({
      //   differentialTableData: dotClickArr,
      //   volcanoPlotRows: dotClickArr.length,
      // });
      let elementArray = items.map(item => ({
        id: item,
        value: item,
        key: item,
      }));
      this.props.onHandleSelectedVolcano(elementArray, doNotUnhighlight);
      if (items.length) {
        this.pageToFeature(event[differentialFeatureIdKey]);
      }
      // this.props.onHandleSelectedVolcano([
      //   {
      //     id: item[differentialFeatureIdKey],
      //     value: item[differentialFeatureIdKey],
      //     key: item[differentialFeatureIdKey],
      //   },
      // ]);
    }
  };

  getTableHelpers = differentialFeatureIdKeyVar => {
    const self = this;
    let addParams = {};
    addParams.showPlotDifferential = (dataItem, alphanumericTrigger) => {
      return function() {
        self.setState({
          volcanoDifferentialTableRowOutline: dataItem[alphanumericTrigger],
        });
        self.getPlot('Volcano', dataItem[alphanumericTrigger], false, false);
      };
    };
    addParams.elementId = differentialFeatureIdKeyVar;
    this.setState({ additionalTemplateInfoDifferentialTable: addParams });
  };

  handleRowClick = (event, item, index) => {
    const {
      differentialFeatureIdKey,
      volcanoDifferentialTableRowOutline,
      HighlightedFeaturesArrVolcano,
      differentialResults,
    } = this.props;
    event.stopPropagation();
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
      const PreviouslyHighlighted = [...HighlightedFeaturesArrVolcano];
      const itemAlreadyHighlighted = PreviouslyHighlighted.some(
        d => d.id === item[differentialFeatureIdKey],
      );
      let baseFeature = sortedData[0][differentialFeatureIdKey];
      if (PreviouslyHighlighted.length) {
        baseFeature = PreviouslyHighlighted[0]?.id;
      }
      if (volcanoDifferentialTableRowOutline !== '') {
        baseFeature = volcanoDifferentialTableRowOutline;
      }

      if (event.shiftKey) {
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
        this.props.onHandleSelectedVolcano(uniqueTableDataArray);
        this.setState({
          featuresLength:
            limitLengthOrNull(
              uniqueTableDataArray?.length,
              this.props.multifeaturePlotMax,
            ) ||
            limitLength(sortedData?.length, this.props.multifeaturePlotMax),
        });
      } else if (
        event.ctrlKey ||
        event.metaKey ||
        event?.target?.classList?.contains('DifferentialResultsRowCheckbox')
      ) {
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
          this.props.onHandleSelectedVolcano(selectedTableDataArray);
          this.setState({
            featuresLength:
              limitLengthOrNull(
                selectedTableDataArray?.length,
                this.props.multifeaturePlotMax,
              ) ||
              limitLength(sortedData?.length, this.props.multifeaturePlotMax),
          });
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
          this.props.onHandleSelectedVolcano(selectedTableDataArray);
          this.setState({
            featuresLength:
              limitLengthOrNull(
                selectedTableDataArray?.length,
                this.props.multifeaturePlotMax,
              ) ||
              limitLength(sortedData?.length, this.props.multifeaturePlotMax),
          });
        }
      } else {
        // if item is already outlined, remove outline and clear plot
        if (
          item[differentialFeatureIdKey] === volcanoDifferentialTableRowOutline
        ) {
          this.props.onClearPlotSelected();
        } else {
          // simple row click without control nor shift
          this.props.onSetPlotSelected(item[differentialFeatureIdKey]);
          this.props.onGetPlot(
            'Volcano',
            item[differentialFeatureIdKey],
            false,
            false,
          );
        }
      }
    }
  };

  onSizeChange = (newSize, axisDragged) => {
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
    this.onSizeChange(size, 'horizontal');
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
    this.onSizeChange(size, 'vertical');
  };

  handleTableChange = () => {
    const { differentialResults, HighlightedFeaturesArrVolcano } = this.props;
    let sortedFilteredData =
      this.volcanoPlotFilteredGridRef?.current?.qhGridRef?.current?.getSortedData() ||
      this.props.differentialResults;

    this.setState({
      filteredDifferentialTableData: sortedFilteredData,
    });
    // handle features length
    if (HighlightedFeaturesArrVolcano.length === 1) {
      this.setState({
        featuresLength: 1,
      });
    } else if (HighlightedFeaturesArrVolcano.length > 1) {
      this.setState({
        featuresLength:
          limitLengthOrNull(
            HighlightedFeaturesArrVolcano?.length,
            this.props.multifeaturePlotMax,
          ) ||
          limitLength(
            sortedFilteredData?.length,
            this.props.multifeaturePlotMax,
          ),
      });
    } else {
      let sortedData =
        this.volcanoPlotFilteredGridRef?.current?.qhGridRef?.current?.getSortedData() ||
        differentialResults;
      this.setState({
        featuresLength: limitLength(
          sortedData?.length,
          this.props.multifeaturePlotMax,
        ),
      });
    }
  };

  hasMultifeaturePlots = () => {
    if (this.props.differentialPlotTypes) {
      const plotTypesMapped = this.props.differentialPlotTypes.map(
        p => p.plotType,
      );
      return plotTypesMapped.includes('multiFeature') || false;
    } else return false;
  };

  getMultiFeaturePlotBtnPopupContent = () => {
    if (this.state.featuresLength === 1000) {
      if (this.props.HighlightedFeaturesArrVolcano?.length < 1000) {
        return 'Plot the first 1000 features in the table';
      } else return 'Plot the first 1000 highlighted features in the table';
    } else if (this.props.HighlightedFeaturesArrVolcano?.length) {
      return `Plot the ${this.state.featuresLength} highlighted features`;
    } else return 'Plot all of the features in the table';
  };

  toggleAllCheckboxes = () => {
    const { differentialFeatureIdKey } = this.props;
    const { allChecked } = this.state;
    if (allChecked) {
      this.props.onHandleSelectedVolcano([], false);
    } else {
      const tableData =
        this.volcanoPlotFilteredGridRef?.current?.qhGridRef?.current?.getSortedData() ||
        this.props.differentialResults;
      // const featureIds = tableData.map(featureId => featureId[this.props.differentialFeatureIdKey]);
      let elementArray = tableData.map(item => ({
        id: item[differentialFeatureIdKey],
        value: item[differentialFeatureIdKey],
        key: item[differentialFeatureIdKey],
      }));
      this.props.onHandleSelectedVolcano(elementArray, false);
    }
    this.setState({
      allChecked: !allChecked,
    });
  };

  getMultifeaturePlotTransitionRef = () => {
    const tableData =
      this.volcanoPlotFilteredGridRef?.current?.qhGridRef?.current?.getSortedData() ||
      this.props.differentialResults;
    this.props.onHandleMultifeaturePlot('Differential', tableData, true);
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
      animation,
      direction,
      featuresLength,
      differentialDynamicPlotWidth,
      allChecked,
    } = this.state;

    const {
      additionalTemplateInfoDifferentialTable,
      differentialColumns,
      isVolcanoTableLoading,
      differentialStudy,
      differentialModel,
      differentialTest,
      tab,
      isItemSelected,
      // imageInfoDifferential,
      // imageInfoDifferentialLength,
      imageInfoVolcano,
      imageInfoVolcanoLength,
      svgExportName,
      differentialPlotTypes,
      tabsMessage,
      isVolcanoPlotSVGLoaded,
      differentialFeature,
      differentialFeatureIdKey,
      onGetPlotTransition,
      // isDataStreamingResultsTable,
      HighlightedFeaturesArrVolcano,
      // volcanoDifferentialTableRowMax,
      volcanoDifferentialTableRowHighlight,
      volcanoDifferentialTableRowOutline,
      differentialResults,
      onHandleMultifeaturePlot,
    } = this.props;
    // let differentialVolcanoCacheKey = `${differentialStudy}-${differentialModel}-${differentialTest}-Volcano`;
    // if (multisetQueriedDifferential) {
    //   differentialVolcanoCacheKey = `${differentialStudy}-${differentialModel}-${differentialTest}-${multisetQueriedDifferential}-Volcano`;
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
    const VerticalSidebar = ({ animation, direction, isItemSelected }) => {
      const {
        featuresString,
        onBackToTable,
        differentialFeatureIdKey,
        differentialFeature,
        isItemSVGLoaded,
        metaFeaturesDataDifferential,
        modelSpecificMetaFeaturesExist,
        fwdRefDVC,
        imageInfoDifferentialLength,
        imageInfoDifferential,
        differentialPlotTypes,
        differentialTests,
      } = this.props;
      if (isItemSelected) {
        return (
          <Sidebar
            as={'div'}
            animation={animation}
            direction={direction}
            icon="labeled"
            vertical="true"
            visible={isItemSelected}
            width="very wide"
            className="VerticalSidebarPlot"
          >
            <DifferentialPlot
              featuresString={featuresString}
              onBackToTable={onBackToTable}
              differentialFeatureIdKey={differentialFeatureIdKey}
              differentialFeature={differentialFeature}
              isItemSVGLoaded={isItemSVGLoaded}
              metaFeaturesDataDifferential={metaFeaturesDataDifferential}
              modelSpecificMetaFeaturesExist={
                modelSpecificMetaFeaturesExist || false
              }
              fwdRefDVC={fwdRefDVC}
              imageInfoDifferentialLength={imageInfoDifferentialLength || 0}
              imageInfoDifferential={imageInfoDifferential}
              differentialPlotTypes={differentialPlotTypes}
              svgTabMax={4}
              tab={tab}
              differentialStudy={differentialStudy}
              differentialModel={differentialModel}
              differentialTest={differentialTest}
              differentialTests={differentialTests}
            ></DifferentialPlot>
          </Sidebar>
        );
      } else return null;
    };

    const HasMultifeaturePlots = this.hasMultifeaturePlots();
    const tableData =
      this.volcanoPlotFilteredGridRef?.current?.qhGridRef?.current?.getSortedData() ||
      differentialResults;
    const SelectAllPopupContent = (
      <span>
        Click here to select/deselect all checkboxes
        <br />
        Click a checkbox to select/deselect it
        <br />
        Control-Click or Shift-Click a ROW to multi-select/mulit-deselect
      </span>
    );
    const multiFeaturePlotDisabled =
      !HasMultifeaturePlots ||
      // isDataStreamingResultsTable ||
      HighlightedFeaturesArrVolcano.length === 1 ||
      featuresLength === 1;
    // const isMultifeaturePlot =
    //   this.props.imageInfoVolcano?.key?.includes('features') || false;
    return (
      <Grid.Column
        className=""
        mobile={16}
        tablet={16}
        largeScreen={12}
        widescreen={12}
      >
        <Sidebar.Pushable as={'span'}>
          <VerticalSidebar
            animation={animation}
            direction={direction}
            isItemSelected={isItemSelected}
          />
          <Sidebar.Pusher>
            <div>
              <Grid className="VolcanoPlotGridContainer">
                <Grid.Row id="VolcanoViewRow">
                  <Grid.Column>
                    <SplitPane
                      split="horizontal"
                      className="VolcanoSplitPane"
                      id=""
                      resizerStyle={
                        upperPlotsVisible ? resizerStyle : hiddenResizerStyle
                      }
                      // defaultSize={upperPlotsHeight * 1.05263157895} 1.20263157895
                      size={upperPlotsVisible ? upperPlotsDivHeight : 1}
                      minSize={400}
                      maxSize={1000}
                      onDragFinished={size =>
                        this.onSizeChange(size, 'horizontal')
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
                        minSize={300}
                        maxSize={1800}
                        onDragFinished={size =>
                          this.onSizeChange(size, 'vertical')
                        }
                      >
                        <DifferentialVolcanoPlot
                          ref={this.differentialVolcanoPlotRef}
                          {...this.state}
                          {...this.props}
                          onHandleVolcanoPlotSelectionChange={
                            this.handleVolcanoPlotSelectionChange
                          }
                          // getMaxAndMin={this.getMaxAndMin}
                          onHandleDotClick={this.handleDotClick}
                          onPageToFeature={this.pageToFeature}
                          onHandleVolcanoCurrentSelection={
                            this.handleVolcanoCurrentSelection
                          }
                        ></DifferentialVolcanoPlot>
                        <SVGPlot
                          differentialStudy={differentialStudy}
                          differentialModel={differentialModel}
                          differentialFeature={differentialFeature}
                          divWidth={differentialDynamicPlotWidth}
                          divHeight={upperPlotsDivHeight}
                          pxToPtRatio={105}
                          pointSize={12}
                          svgTabMax={0}
                          tab={tab}
                          volcanoWidth={volcanoDivWidth}
                          upperPlotsHeight={upperPlotsDivHeight}
                          volcanoPlotVisible={volcanoPlotVisible}
                          upperPlotsVisible={upperPlotsVisible}
                          imageInfoVolcano={imageInfoVolcano}
                          imageInfoVolcanoLength={imageInfoVolcanoLength}
                          svgExportName={svgExportName}
                          differentialPlotTypes={differentialPlotTypes}
                          tabsMessage={tabsMessage}
                          isVolcanoPlotSVGLoaded={isVolcanoPlotSVGLoaded}
                          HighlightedFeaturesArrVolcano={
                            HighlightedFeaturesArrVolcano
                          }
                          differentialFeatureIdKey={differentialFeatureIdKey}
                          onGetPlotTransitionRef={onGetPlotTransition}
                          onGetMultifeaturePlotTransitionRef={
                            this.getMultifeaturePlotTransitionRef
                          }
                          // onHandleMultifeaturePlotRef={
                          //   onHandleMultifeaturePlot
                          // }
                          onHandleVolcanoVisability={
                            this.handleVolcanoVisability
                          }
                        ></SVGPlot>
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
                                upperPlotsVisible ? 'angle down' : 'angle up'
                              }
                            />
                            {upperPlotsVisible ? 'Hide Plots' : 'Show Plots'}
                          </Label>
                        </span>
                        <div
                          className={
                            HasMultifeaturePlots
                              ? 'MultiFeaturePlotBtnDiv Show'
                              : 'MultiFeaturePlotBtnDiv Hide'
                          }
                        >
                          <Popup
                            trigger={
                              <Label
                                as={Button}
                                disabled={multiFeaturePlotDisabled}
                                id={
                                  multiFeaturePlotDisabled
                                    ? 'CursorNotAllowed'
                                    : ''
                                }
                                className="MultiFeaturePlotBtn NoSelect"
                                // className={
                                //   isMultifeaturePlot
                                //     ? 'MultiFeaturePlotBtn NoSelect MultiFeaturePlotBtnActive'
                                //     : 'MultiFeaturePlotBtn NoSelect MultiFeaturePlotBtnOutline'
                                // }
                                // size={dynamicSizeLarger}
                                // color="blue"
                                // image
                                // basic
                                onClick={() =>
                                  onHandleMultifeaturePlot('Volcano', tableData)
                                }
                              >
                                MULTI-FEATURE PLOT
                                <Label.Detail
                                // className={
                                //   isMultifeaturePlot &&
                                //   !multiFeaturePlotDisabled
                                //     ? 'MultifeaturePlotDetailActive'
                                //     : 'MultiFeaturePlotDetail'
                                // }
                                >
                                  {featuresLength}
                                </Label.Detail>
                              </Label>
                            }
                            style={maxWidthPopupStyle}
                            content={this.getMultiFeaturePlotBtnPopupContent}
                            inverted
                            basic
                          ></Popup>
                        </div>
                        <div className="AbsoluteLegendDifferential NoSelect">
                          {/* {volcanoDifferentialTableRowHighlight?.length > 0 &&
                          volcanoDifferentialTableRowOutline ? (
                            <Popup
                              trigger={<Label circular id="MaxCircle" />}
                              style={maxWidthPopupStyle}
                              // content="Row is dark orange when the feature is selected, and has the lowest index in the current sort"
                              content="Selected, and plots displayed"
                              inverted
                              basic
                            />
                          ) : null} */}
                          {volcanoDifferentialTableRowOutline ? (
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
                          {volcanoDifferentialTableRowHighlight?.length > 0 ? (
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
                            HasMultifeaturePlots
                              ? 'DifferentialResultsTableWrapperCheckboxes'
                              : 'DifferentialResultsTableWrapper'
                          }
                          mobile={16}
                          tablet={16}
                          largeScreen={16}
                          widescreen={16}
                        >
                          {HasMultifeaturePlots ? (
                            <Popup
                              trigger={
                                <Icon
                                  name={
                                    allChecked
                                      ? 'check square outline'
                                      : 'square outline'
                                  }
                                  size="large"
                                  id="ToggleAllCheckbox"
                                  className={allChecked ? 'PrimaryColor' : ''}
                                  onClick={this.toggleAllCheckboxes}
                                />
                                // <Label circular id="OtherCircle" />
                              }
                              style={selectAllPopupStyle}
                              // content="Row is light orange when the feature is selected"
                              content={SelectAllPopupContent}
                              inverted
                              basic
                            />
                          ) : null}
                          <EZGrid
                            ref={this.volcanoPlotFilteredGridRef}
                            // uniqueCacheKey={differentialVolcanoCacheKey}
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
                            loading={isVolcanoTableLoading}
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
export default DifferentialVolcano;
