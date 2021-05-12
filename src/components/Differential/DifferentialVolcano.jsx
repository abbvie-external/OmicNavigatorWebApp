import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import CustomEmptyMessage from '../Shared/Templates';
// eslint-disable-next-line no-unused-vars
import QHGrid, { EZGrid } from '../Shared/QHGrid';
import DifferentialPlot from './DifferentialPlot';
import SVGPlot from '../Shared/SVGPlot';
import { scrollElement } from '../Shared/helpers';
import DifferentialVolcanoPlot from './DifferentialVolcanoPlot';
import {
  Form,
  Grid,
  Select,
  Checkbox,
  Popup,
  Label,
  Sidebar,
} from 'semantic-ui-react';
import VolcanoPlotIcon from '../../resources/VolcanoPlotIcon.png';
import VolcanoPlotIconSelected from '../../resources/VolcanoPlotIconSelected.png';
import ButtonActions from '../Shared/ButtonActions';
import './DifferentialVolcano.scss';
import SplitPane from 'react-split-pane';

class DifferentialVolcano extends Component {
  state = {
    volcanoHeight: parseInt(localStorage.getItem('volcanoHeight'), 10) || 1,
    volcanoHeightBackup:
      parseInt(localStorage.getItem('volcanoHeightBackup'), 10) || 350,
    volcanoWidth: parseInt(localStorage.getItem('volcanoWidth'), 10) || 500,
    volcanoPlotsVisible: false,
    // JSON.parse(localStorage.getItem('volcanoPlotsVisible')) || false,
    // filteredTableData: [],
    itemsPerPageVolcanoTable:
      parseInt(localStorage.getItem('itemsPerPageVolcanoTable'), 10) || 30,
    // volcanoPlotRows: 0,
    doXAxisTransformation: false,
    doYAxisTransformation: false,
    allowXTransformation: true,
    allowYTransformation: true,
    axisLabels: [],
    xAxisLabel: null,
    yAxisLabel: null,
    volcanoCircleLabel: null,
    identifier: null,
    volcanoCircleLabels: [],
    animation: 'overlay',
    direction: 'right',
    visible: false,
    featuresLength: 0,
  };
  volcanoPlotFilteredGridRef = React.createRef();
  differentialVolcanoPlotRef = React.createRef();

  shouldComponentUpdate(nextProps) {
    return nextProps.tab === 'differential';
  }

  componentDidMount() {
    this.getAxisLabels();
    this.setState({
      filteredTableData: this.props.differentialResults,
      volcanoPlotRows: this.props.differentialResults.length,
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
    const {
      // featureToHighlightInDiffTable,
      differentialResults,
      // isItemSelected,
    } = this.props;
    if (prevProps.differentialResults !== differentialResults) {
      this.setState({
        filteredTableData: differentialResults,
        volcanoPlotRows: differentialResults.length,
        featuresLength: differentialResults.length || 0,
      });
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

  pageToFeature = featureToHighlight => {
    if (featureToHighlight) {
      const { differentialFeatureIdKey } = this.props;
      const { itemsPerPageVolcanoTable } = this.state;
      const sortedData =
        this.volcanoPlotFilteredGridRef.current?.qhGridRef?.current?.getSortedData() ||
        [];
      if (sortedData != null) {
        const Index = _.findIndex(sortedData, function(p) {
          return p[differentialFeatureIdKey] === featureToHighlight;
        });
        const pageNumber = Math.ceil((Index + 1) / itemsPerPageVolcanoTable);
        if (pageNumber > 0) {
          this.volcanoPlotFilteredGridRef.current.handlePageChange(pageNumber);
          scrollElement(this, 'volcanoPlotFilteredGridRef', 'rowHighlightMax');
        }
      }
    } else {
      this.volcanoPlotFilteredGridRef.current.handlePageChange(1);
    }
  };

  rowLevelPropsCalc = item => {
    let className;
    const {
      differentialFeatureIdKey,
      volcanoDifferentialTableRowMax,
      volcanoDifferentialTableRowOther,
    } = this.props;
    /* eslint-disable eqeqeq */
    if (item[differentialFeatureIdKey] === volcanoDifferentialTableRowMax) {
      className = 'rowHighlightMax';
    }
    if (
      volcanoDifferentialTableRowOther?.includes(item[differentialFeatureIdKey])
    ) {
      className = 'rowHighlightOther';
    }
    return {
      className,
    };
  };

  getAxisLabels = () => {
    if (this.props.differentialResults.length > 0) {
      let differentialAlphanumericFields = [];
      let relevantConfigColumns = [];
      const firstObject = this.props.differentialResults[0];
      for (let [key, value] of Object.entries(firstObject)) {
        if (typeof value === 'string' || value instanceof String) {
          differentialAlphanumericFields.push(key);
        } else {
          relevantConfigColumns.push(key);
        }
      }
      //Pushes "none" option into Volcano circle text dropdown
      differentialAlphanumericFields.unshift('None');
      let volcanoCircleLabelsVar = differentialAlphanumericFields.map(e => {
        return {
          key: e,
          text: e,
          value: e,
        };
      });
      let identifierVar =
        differentialAlphanumericFields[0] !== 'None'
          ? differentialAlphanumericFields[0]
          : differentialAlphanumericFields[1];
      this.setState({
        identifier: identifierVar,
        volcanoCircleLabels: volcanoCircleLabelsVar,
        volcanoCircleLabel: differentialAlphanumericFields[0],
      });
      var yLabel = relevantConfigColumns[0];
      var xLabel = relevantConfigColumns[1];
      var doY = false;
      if (relevantConfigColumns.indexOf('logFC') >= 0) {
        xLabel = 'logFC';
      }
      if (relevantConfigColumns.indexOf('P_Value') >= 0) {
        yLabel = 'P_Value';
        doY = true;
      } else if (relevantConfigColumns.indexOf('P.Value') >= 0) {
        yLabel = 'P.Value';
        doY = true;
      } else if (relevantConfigColumns.indexOf('PValue') >= 0) {
        yLabel = 'PValue';
        doY = true;
      } else if (relevantConfigColumns.indexOf('PVal') >= 0) {
        yLabel = 'PVal';
        doY = true;
      } else if (relevantConfigColumns.indexOf('P value') >= 0) {
        yLabel = 'P value';
        doY = true;
      } else if (relevantConfigColumns.indexOf('adj_P_Val') >= 0) {
        yLabel = 'adj_P_Val';
        doY = true;
      } else if (relevantConfigColumns.indexOf('adj.P.Val') >= 0) {
        yLabel = 'adj.P.Val';
        doY = true;
      } else {
        this.handleDropdownChange({}, { name: 'yAxisSelector', value: yLabel });
      }
      const axes = relevantConfigColumns.map(e => {
        return {
          key: e,
          text: e,
          value: e,
        };
      });
      this.setState({
        axisLabels: axes,
        yAxisLabel: yLabel,
        doYAxisTransformation: doY,
      });
      this.handleDropdownChange({}, { name: 'xAxisSelector', value: xLabel });
    }
  };
  handleVolcanoPlotSelectionChange = volcanoPlotSelectedDataArr => {
    this.pageToFeature();
    if (volcanoPlotSelectedDataArr.length > 0) {
      this.setState({
        filteredTableData: volcanoPlotSelectedDataArr,
        volcanoPlotRows: volcanoPlotSelectedDataArr.length,
      });
      this.props.onHandleSelectedVolcano([]);
    } else {
      this.setState({
        filteredTableData: this.props.differentialResults,
        volcanoPlotRows: this.props.differentialResults.length,
      });
      this.props.onHandleSelectedVolcano([]);
    }
  };

  handleItemsPerPageChange = items => {
    this.setState({
      itemsPerPageVolcanoTable: items,
    });
    localStorage.setItem('itemsPerPageVolcanoTable', items);
  };

  handleDotClick = (event, item, index) => {
    event.stopPropagation();
    const { differentialFeatureIdKey } = this.props;
    // const dotClickArr = [
    //   {
    //     id: item[differentialFeatureIdKey],
    //     value: item[differentialFeatureIdKey],
    //     key: item[differentialFeatureIdKey],
    //   },
    // ];
    // this.setState({
    //   filteredTableData: dotClickArr,
    //   volcanoPlotRows: dotClickArr.length,
    // });
    this.props.onHandleSelectedVolcano([
      {
        id: item[differentialFeatureIdKey],
        value: item[differentialFeatureIdKey],
        key: item[differentialFeatureIdKey],
      },
    ]);
    this.pageToFeature(item[differentialFeatureIdKey]);
  };

  handleRowClick = (event, item, index) => {
    if (
      item !== null &&
      event?.target?.className !== 'ExternalSiteIcon' &&
      event?.target?.className !== 'TableCellLink NoSelect' &&
      event?.target?.className !== 'TableCellLink'
    ) {
      const { differentialFeatureIdKey } = this.props;
      event.stopPropagation();
      let sortedData =
        this.volcanoPlotFilteredGridRef.current?.qhGridRef?.current?.data ||
        this.props.differentialResults;
      const PreviouslyHighlighted = [
        ...this.props.HighlightedFeaturesArrVolcano,
      ];
      const alreadyHighlighted = PreviouslyHighlighted.some(
        d => d.id === item[differentialFeatureIdKey],
      );
      if (event.shiftKey) {
        const allTableData =
          this.volcanoPlotFilteredGridRef.current?.qhGridRef.current?.getSortedData() ||
          [];
        const indexMaxFeature = _.findIndex(allTableData, function(d) {
          return d[differentialFeatureIdKey] === PreviouslyHighlighted[0]?.id;
        });
        const sliceFirst = index < indexMaxFeature ? index : indexMaxFeature;
        const sliceLast = index > indexMaxFeature ? index : indexMaxFeature;
        const shiftedTableData = allTableData.slice(sliceFirst, sliceLast + 1);
        const shiftedTableDataArray = shiftedTableData.map(function(d) {
          return {
            id: d[differentialFeatureIdKey],
            value: d[differentialFeatureIdKey],
            key: d[differentialFeatureIdKey],
          };
        });
        this.props.onHandleSelectedVolcano(shiftedTableDataArray);
        this.setState({
          featuresLength: shiftedTableDataArray.length || sortedData.length,
        });
      } else if (event.ctrlKey) {
        const allTableData =
          this.volcanoPlotFilteredGridRef.current?.qhGridRef.current?.getSortedData() ||
          [];
        let selectedTableDataArray = [];
        // already highlighted, remove it from array
        if (alreadyHighlighted) {
          selectedTableDataArray = PreviouslyHighlighted.filter(
            i => i.id !== item[differentialFeatureIdKey],
          );
          this.props.onHandleSelectedVolcano(selectedTableDataArray);
          this.setState({
            featuresLength: selectedTableDataArray.length || sortedData.length,
          });
        } else {
          // not yet highlighted, add it to array
          const indexMaxFeature = _.findIndex(allTableData, function(d) {
            return d[differentialFeatureIdKey] === PreviouslyHighlighted[0]?.id;
          });
          // map feature to fix obj entries
          const mappedFeature = {
            id: item[differentialFeatureIdKey],
            value: item[differentialFeatureIdKey],
            key: item[differentialFeatureIdKey],
          };
          const lowerIndexThanMax = index < indexMaxFeature ? true : false;
          if (lowerIndexThanMax) {
            // add to beginning of array if max
            PreviouslyHighlighted.unshift(mappedFeature);
          } else {
            // just add to array if not max
            PreviouslyHighlighted.push(mappedFeature);
          }
          selectedTableDataArray = [...PreviouslyHighlighted];
          this.props.onHandleSelectedVolcano(selectedTableDataArray);
          this.setState({
            featuresLength: selectedTableDataArray.length || sortedData.length,
          });
        }
      } else {
        // already highlighted, remove it from array
        // if (alreadyHighlighted) {
        //   selectedTableDataArray = PreviouslyHighlighted.filter(
        //     i => i.id !== item[differentialFeatureIdKey],
        //   );
        //   this.props.onHandleSelectedVolcano(selectedTableDataArray);
        //   this.setState({ featuresLength: selectedTableDataArray.length || 0 });
        // } else {
        this.props.onHandleSelectedVolcano([
          {
            id: item[differentialFeatureIdKey],
            value: item[differentialFeatureIdKey],
            key: item[differentialFeatureIdKey],
          },
        ]);
        this.setState({ featuresLength: sortedData.length || 0 });
      }
    }
  };

  getMaxAndMin(data, element) {
    if (data.length > 0 && data[0][element] != null) {
      var values = [data[0][element], data[0][element]];
      for (var i = 1; i < data.length; i++) {
        if (data[i] != null && data[i][element] != null) {
          if (data[i][element] > values[1]) {
            values[1] = data[i][element];
          } else if (data[i][element] < values[0]) {
            values[0] = data[i][element];
          }
        }
      }
      return values;
    } else return [0, 0];
  }

  handleDropdownChange(evt, { name, value }) {
    const { differentialResultsUnfiltered } = this.props;
    const allowXTransCheck =
      this.getMaxAndMin(differentialResultsUnfiltered, value)[0] > 0;
    const doXaxisTransCheck = allowXTransCheck
      ? this.state.doXAxisTransformation
      : false;
    if (name === 'xAxisSelector') {
      this.setState({
        xAxisLabel: value,
        doXAxisTransformation: doXaxisTransCheck,
        allowXTransformation: allowXTransCheck,
      });
    } else if (name === 'yAxisSelector') {
      const allowYTransCheck =
        this.getMaxAndMin(differentialResultsUnfiltered, value)[0] > 0;
      const doYaxisTransCheck = allowYTransCheck
        ? this.state.doYAxisTransformation
        : false;
      this.setState({
        yAxisLabel: value,
        doYAxisTransformation: doYaxisTransCheck,
        allowYTransformation: allowYTransCheck,
      });
    } else {
      this.setState({
        volcanoCircleLabel: value,
      });
    }
  }

  handleTransformationChange = (evt, { name }) => {
    if (name === 'xTransformationCheckbox') {
      this.setState({
        doXAxisTransformation: !this.state.doXAxisTransformation,
      });
    } else {
      this.setState({
        doYAxisTransformation: !this.state.doYAxisTransformation,
      });
    }
  };

  onSizeChange = (newSize, paneType) => {
    const { volcanoWidth } = this.state;
    const { fwdRefDVC } = this.props;
    const adjustedSize = Math.round(newSize * 0.95);
    if (paneType === 'horizontal') {
      const width = parseInt(localStorage.getItem('volcanoWidth'), 10) || 500;
      const volcanoSvgWidthPx =
        fwdRefDVC.current?.offsetWidth - volcanoWidth || 500;
      const volcanoSvgHeightPx = newSize || 300;
      // on up/down drag, we are forcing a svg resize by change the volcano width by 1
      localStorage.setItem('volcanoWidth', width + 1);
      localStorage.setItem('volcanoHeight', adjustedSize + 1);
      this.setState({
        volcanoHeight: adjustedSize + 1,
        volcanoWidth: width + 1,
        volcanoSvgWidth: volcanoSvgWidthPx,
        volcanoSvgHeight: volcanoSvgHeightPx,
      });
    } else {
      const volcanoSvgWidthPx = fwdRefDVC.current?.offsetWidth - newSize || 500;
      localStorage.setItem('volcanoWidth', adjustedSize);
      this.setState({
        volcanoWidth: adjustedSize,
        volcanoSvgWidth: volcanoSvgWidthPx,
      });
    }
  };

  getDynamicSizeBtn() {
    let w = Math.max(
      document.documentElement.clientWidth,
      window.innerWidth || 0,
    );
    if (w < 1200) {
      return 'small';
    } else if (w > 1199 && w < 1600) {
      return 'small';
    } else if (w > 1599 && w < 2600) {
      return undefined;
    } else if (w > 2599) return 'large';
  }

  getDynamicSizeLabel() {
    let w = Math.max(
      document.documentElement.clientWidth,
      window.innerWidth || 0,
    );
    if (w < 1200) {
      return undefined;
    } else if (w > 1199 && w < 1600) {
      return undefined;
    } else if (w > 1599 && w < 2600) {
      return 'large';
    } else if (w > 2599) return 'large';
  }

  handleVolcanoVisability = () => {
    const { volcanoPlotsVisible } = this.state;
    if (volcanoPlotsVisible) {
      localStorage.setItem('volcanoHeightBackup', this.state.volcanoHeight);
      this.setState({
        volcanoHeightBackup: this.state.volcanoHeight,
      });
    }
    const size = !volcanoPlotsVisible ? this.state.volcanoHeightBackup : 0;
    this.onSizeChange(size, 'horizontal');
    this.setState({
      volcanoPlotsVisible: !volcanoPlotsVisible,
    });
  };

  getVolcanoPlotButtonContent = () => {
    const { isDataStreamingResultsTable } = this.props;
    const { volcanoPlotsVisible } = this.state;
    if (isDataStreamingResultsTable) {
      return 'Plots are not avaialble until data finishes streaming';
    } else {
      return volcanoPlotsVisible ? 'Hide Charts' : 'Show Charts';
    }
  };

  handleTableFiltered = () => {
    this.setFeaturesLength(true);
  };

  setFeaturesLength = filteredData => {
    const { differentialResults, HighlightedFeaturesArrVolcano } = this.props;
    let sortedData =
      this.volcanoPlotFilteredGridRef.current?.qhGridRef?.current?.data ||
      this.props.differentialResults;
    if (HighlightedFeaturesArrVolcano.length === 1) {
      this.setState({
        featuresLength: 1,
      });
    } else if (HighlightedFeaturesArrVolcano.length > 1) {
      this.setState({
        featuresLength:
          HighlightedFeaturesArrVolcano.length || sortedData.length,
      });
    } else {
      let sortedData =
        this.volcanoPlotFilteredGridRef.current?.qhGridRef?.current?.data ||
        differentialResults;
      this.setState({ featuresLength: sortedData.length || 0 });
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

  render() {
    const {
      filteredTableData,
      itemsPerPageVolcanoTable,
      volcanoPlotRows,
      axisLabels,
      xAxisLabel,
      yAxisLabel,
      volcanoCircleLabels,
      volcanoCircleLabel,
      doXAxisTransformation,
      doYAxisTransformation,
      allowXTransformation,
      allowYTransformation,
      volcanoPlotsVisible,
      volcanoHeight,
      volcanoWidth,
      animation,
      direction,
      featuresLength,
    } = this.state;

    const {
      additionalTemplateInfoDifferentialTable,
      differentialColumns,
      isVolcanoTableLoading,
      differentialStudy,
      differentialModel,
      differentialTest,
      // multisetQueriedDifferential,
      tab,
      isItemSelected,
      isDataStreamingResultsTable,
      // differentialResults,
      HighlightedFeaturesArrVolcano,
    } = this.props;
    // let differentialVolcanoCacheKey = `${differentialStudy}-${differentialModel}-${differentialTest}-Volcano`;
    // if (multisetQueriedDifferential) {
    //   differentialVolcanoCacheKey = `${differentialStudy}-${differentialModel}-${differentialTest}-${multisetQueriedDifferential}-Volcano`;
    // }
    const dynamicSize = this.getDynamicSizeBtn();
    const dynamicSizeLarger = this.getDynamicSizeLabel();

    const TableValuePopupStyle = {
      backgroundColor: '2E2E2E',
      borderBottom: '2px solid var(--color-primary)',
      color: '#FFF',
      padding: '1em',
      maxWidth: '50vw',
      fontSize: '13px',
      wordBreak: 'break-all',
    };
    const xAxisTransformBox = allowXTransformation ? (
      <Form.Field
        control={Checkbox}
        name="xTransformationCheckbox"
        className="VolcanoTransformationCheckbox"
        checked={doXAxisTransformation}
        onClick={this.handleTransformationChange.bind(this)}
      ></Form.Field>
    ) : (
      <Form.Field
        control={Checkbox}
        name="xTransformationCheckbox"
        className="VolcanoTransformationCheckbox"
        checked={false}
        disabled={true}
        //checked={doXAxisTransformation}
        //onClick={this.handleTransformationChange.bind(this)}
      ></Form.Field>
    );
    const yAxisTransformBox = allowYTransformation ? (
      <Form.Field
        control={Checkbox}
        name="yTransformationCheckbox"
        className="VolcanoTransformationCheckbox"
        checked={doYAxisTransformation}
        onClick={this.handleTransformationChange.bind(this)}
      ></Form.Field>
    ) : (
      <Form.Field
        control={Checkbox}
        name="yTransformationCheckbox"
        className="VolcanoTransformationCheckbox"
        checked={false}
        disabled={true}
      ></Form.Field>
    );
    const resizerStyle = {
      display: 'block',
    };

    const hiddenResizerStyle = {
      display: 'none',
    };
    const VerticalSidebar = ({ animation, direction, isItemSelected }) => {
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
              // {...this.props}
              // {...this.state}
              featuresString={this.props.featuresString}
              onBackToTable={this.props.onBackToTable}
              differentialFeatureIdKey={this.props.differentialFeatureIdKey}
              differentialFeature={this.props.differentialFeature}
              isItemSVGLoaded={this.props.isItemSVGLoaded}
              metaFeaturesDataDifferential={
                this.props.metaFeaturesDataDifferential
              }
              modelSpecificMetaFeaturesExist={
                this.props.modelSpecificMetaFeaturesExist || false
              }
              fwdRefDVC={this.props.fwdRefDVC}
              imageInfoDifferentialLength={
                this.props.imageInfoDifferentialLength || 0
              }
              imageInfoDifferential={this.props.imageInfoDifferential}
              differentialPlotTypes={this.props.differentialPlotTypes}
              svgTabMax={4}
              tab={this.props.tab}
              differentialStudy={this.props.differentialStudy}
              differentialModel={this.props.differentialModel}
              differentialTest={this.props.differentialTest}
            ></DifferentialPlot>
          </Sidebar>
        );
      } else return null;
    };

    const HasMultifeaturePlots = this.hasMultifeaturePlots();
    const tableData =
      this.volcanoPlotFilteredGridRef?.current?.qhGridRef?.current?.data ||
      this.props.differentialResults;
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
              <span className="VolcanoPlotButton">
                <Popup
                  trigger={
                    <img
                      src={
                        volcanoPlotsVisible
                          ? VolcanoPlotIconSelected
                          : VolcanoPlotIcon
                      }
                      alt="Volcano Plot"
                      className={
                        isDataStreamingResultsTable ? 'CursorNotAllowed' : ''
                      }
                      id="VolcanoPlotButton"
                      onClick={
                        !isDataStreamingResultsTable
                          ? this.handleVolcanoVisability
                          : null
                      }
                    />
                  }
                  style={TableValuePopupStyle}
                  // className="TablePopupValue"
                  content={this.getVolcanoPlotButtonContent()}
                  inverted
                  basic
                />
              </span>
              <Grid className="VolcanoPlotGridContainer">
                <Grid.Row
                  className={
                    volcanoPlotsVisible
                      ? 'Show VolcanoPlotAxisSelectorsRow'
                      : 'Hide VolcanoPlotAxisSelectorsRow'
                  }
                >
                  <Grid.Column
                    className="EmptyColumn"
                    mobile={2}
                    tablet={4}
                    computer={4}
                    largeScreen={2}
                    widescreen={2}
                  ></Grid.Column>
                  <Grid.Column
                    className="VolcanoPlotFilters"
                    id="xAxisSelector"
                    mobile={14}
                    tablet={12}
                    computer={6}
                    largeScreen={8}
                    widescreen={8}
                  >
                    <Fragment>
                      <Form size={dynamicSize}>
                        <Form.Group inline>
                          <Label
                            className="VolcanoAxisLabel NoSelect"
                            size={dynamicSize}
                          >
                            X AXIS
                          </Label>
                          <Form.Field
                            control={Select}
                            // label="X Axis"
                            name="xAxisSelector"
                            className="axisSelector NoSelect"
                            id="xAxisSelector"
                            value={xAxisLabel}
                            options={axisLabels}
                            onChange={this.handleDropdownChange.bind(this)}
                          ></Form.Field>
                          <Popup
                            trigger={xAxisTransformBox}
                            style={TableValuePopupStyle}
                            content="-log10 Transform, X Axis"
                            inverted
                            basic
                          />
                          <Label
                            className="VolcanoAxisLabel"
                            id="VolcanoAxisLabelY"
                            size={dynamicSize}
                          >
                            Y AXIS
                          </Label>
                          <Form.Field
                            control={Select}
                            // label="Y Axis"
                            name="yAxisSelector"
                            id="yAxisSelector"
                            className="axisSelector"
                            value={yAxisLabel}
                            options={axisLabels}
                            onChange={this.handleDropdownChange.bind(this)}
                          ></Form.Field>
                          <Popup
                            trigger={yAxisTransformBox}
                            style={TableValuePopupStyle}
                            content="-log10 Transform, Y Axis"
                            inverted
                            basic
                          />
                          <Popup
                            trigger={
                              <Label
                                className="VolcanoAxisLabel"
                                id="VolcanoCircleLabel"
                                size={dynamicSize}
                              >
                                LABEL
                              </Label>
                            }
                            style={TableValuePopupStyle}
                            content="Label for Selected Features"
                            inverted
                            basic
                            on={['hover', 'click']}
                            position="left center"
                            mouseEnterDelay={1000}
                            mouseLeaveDelay={0}
                          />

                          <Form.Field
                            control={Select}
                            name="volcanoCircleSelector"
                            id="volcanoCircleSelector"
                            // value={this.props.differentialFeatureIdKey}
                            value={volcanoCircleLabel}
                            options={volcanoCircleLabels}
                            onChange={this.handleDropdownChange.bind(this)}
                          ></Form.Field>
                        </Form.Group>
                      </Form>
                    </Fragment>
                  </Grid.Column>
                </Grid.Row>
                <Grid.Row id="VolcanoViewRow">
                  <Grid.Column>
                    <SplitPane
                      split="horizontal"
                      className="VolcanoSplitPane"
                      id=""
                      resizerStyle={
                        !volcanoPlotsVisible ? hiddenResizerStyle : resizerStyle
                      }
                      // defaultSize={this.state.volcanoHeight * 1.05263157895}
                      size={
                        volcanoPlotsVisible ? volcanoHeight * 1.05263157895 : 0
                      }
                      minSize={350}
                      maxSize={1000}
                      onDragFinished={size =>
                        this.onSizeChange(size, 'horizontal')
                      }
                    >
                      <SplitPane
                        split="vertical"
                        className={
                          volcanoPlotsVisible
                            ? 'Show VolcanoSplitPane'
                            : 'Hide VolcanoSplitPane'
                        }
                        // defaultSize={this.state.volcanoWidth * 1.05263157895}
                        size={volcanoWidth * 1.05263157895}
                        minSize={300}
                        maxSize={1800}
                        onDragFinished={size =>
                          this.onSizeChange(size, 'vertical')
                        }
                      >
                        {/* {volcanoPlot} */}
                        <DifferentialVolcanoPlot
                          ref={this.differentialVolcanoPlotRef}
                          {...this.state}
                          {...this.props}
                          handleVolcanoPlotSelectionChange={
                            this.handleVolcanoPlotSelectionChange
                          }
                          getMaxAndMin={this.getMaxAndMin}
                          onHandleDotClick={this.handleDotClick}
                        ></DifferentialVolcanoPlot>
                        <SVGPlot
                          divWidth={this.state.volcanoSvgWidth}
                          divHeight={this.state.volcanoSvgHeight}
                          pxToPtRatio={105}
                          pointSize={12}
                          svgTabMax={1}
                          tab={this.props.tab}
                          volcanoWidth={this.state.volcanoWidth}
                          volcanoHeight={this.state.volcanoHeight}
                          volcanoPlotsVisible={this.state.volcanoPlotsVisible}
                          imageInfoVolcano={this.props.imageInfoVolcano}
                          imageInfoVolcanoLength={
                            this.props.imageInfoVolcanoLength
                          }
                          svgExportName={this.props.svgExportName}
                          differentialPlotTypes={
                            this.props.differentialPlotTypes
                          }
                          tabsMessage={this.props.tabsMessage}
                          isVolcanoPlotSVGLoaded={
                            this.props.isVolcanoPlotSVGLoaded
                          }
                        ></SVGPlot>
                      </SplitPane>
                      <Grid.Row>
                        <div
                          className={
                            !HasMultifeaturePlots ||
                            isDataStreamingResultsTable ||
                            HighlightedFeaturesArrVolcano.length === 1 ||
                            featuresLength === 1
                              ? 'MultifeaturePlotBtnDiv Hide'
                              : 'MultifeaturePlotBtnDiv Show'
                          }
                        >
                          <Label
                            className="MultiFeaturePlotBtn"
                            size={dynamicSizeLarger}
                            // color="blue"
                            // image
                            // basic
                            onClick={() =>
                              this.props.onGetMultifeaturePlot(
                                'Differential',
                                tableData,
                              )
                            }
                          >
                            {HighlightedFeaturesArrVolcano.length !== 1
                              ? 'MULTI-FEATURE PLOT'
                              : 'SINGLE-FEATURE PLOT'}
                            <Label.Detail className="MultiFeaturePlotDetail">
                              {featuresLength}
                            </Label.Detail>
                          </Label>
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
                          mobile={16}
                          tablet={16}
                          largeScreen={16}
                          widescreen={16}
                        >
                          <EZGrid
                            ref={this.volcanoPlotFilteredGridRef}
                            // uniqueCacheKey={differentialVolcanoCacheKey}
                            className="VolcanoPlotTable"
                            // note, default is 70vh; if you want a specific vh, specify like "40vh"; "auto" lets the height flow based on items per page
                            // height="auto"
                            height={volcanoPlotsVisible ? 'auto' : '70vh'}
                            // height="70vh"
                            data={filteredTableData || []}
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
                            onFiltered={this.handleTableFiltered}
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
