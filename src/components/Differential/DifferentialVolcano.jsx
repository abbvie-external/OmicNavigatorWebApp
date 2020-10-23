import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import CustomEmptyMessage from '../Shared/Templates';
// eslint-disable-next-line no-unused-vars
import QHGrid, { EZGrid } from '***REMOVED***';
import SVGPlot from '../Shared/SVGPlot';
import { scrollElement } from '../Shared/helpers';
import DifferentialVolcanoPlot from './DifferentialVolcanoPlot';
import {
  Form,
  Grid,
  Select,
  Checkbox,
  Dimmer,
  Loader,
} from 'semantic-ui-react';
import './DifferentialVolcano.scss';
import SplitPane from 'react-split-pane';

class DifferentialVolcano extends Component {
  state = {
    volcanoHeight: parseInt(localStorage.getItem('volcanoHeight'), 10) || 500,
    volcanoWidth: parseInt(localStorage.getItem('volcanoWidth'), 10) || 300,
    filteredTableData: [],
    itemsPerPageVolcanoTable:
      parseInt(localStorage.getItem('itemsPerPageVolcanoTable'), 10) || 30,
    volcanoPlotRows: 0,
    doXAxisTransformation: false,
    doYAxisTransformation: false,
    allowXTransformation: true,
    allowYTransformation: true,
    axisLables: [],
    xAxisLabel: null,
    yAxisLabel: null,
    identifier: null,
  };
  volcanoPlotFilteredGridRef = React.createRef();
  differentialVolcanoPlotRef = React.createRef();

  componentDidMount() {
    this.getAxisLabels();
    this.setState({
      filteredTableData: this.props.differentialResults,
      volcanoPlotRows: this.props.differentialResults.length,
    });
    const { featureToHighlightInDiffTable } = this.props;
    if (featureToHighlightInDiffTable !== '') {
      const featureToHighlightInDiffTableArr = [
        {
          id: featureToHighlightInDiffTable,
          value: featureToHighlightInDiffTable,
          key: featureToHighlightInDiffTable,
        },
      ];
      this.props.onHandleSelectedVolcano(featureToHighlightInDiffTableArr);
      // this.pageToFeature(featureToHighlightInDiffTable);
      // this.props.onResetFeatureToHighlightInDiffTable();
    }
  }

  // shouldComponentUpdate() {
  //   return this.props.isValidSearchDifferential;
  // }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.differentialResults !== this.props.differentialResults) {
      this.setState({
        filteredTableData: this.props.differentialResults,
        volcanoPlotRows: this.props.differentialResults.length,
      });
    }
    const { featureToHighlightInDiffTable } = this.props;
    if (
      featureToHighlightInDiffTable !== '' &&
      prevProps.featureToHighlightInDiffTable !== featureToHighlightInDiffTable
    ) {
      const featureToHighlightInDiffTableArr = [
        {
          id: featureToHighlightInDiffTable,
          value: featureToHighlightInDiffTable,
          key: featureToHighlightInDiffTable,
        },
      ];
      this.props.onHandleSelectedVolcano(featureToHighlightInDiffTableArr);
      this.pageToFeature(featureToHighlightInDiffTable);
    }
  }

  pageToFeature = featureToHighlight => {
    if (featureToHighlight !== '') {
      const {
        differentialFeatureIdKey,
        // differentialResults
      } = this.props;
      // const { itemsPerPageVolcanoTable } = this.state;
      const currentData = this.volcanoPlotFilteredGridRef?.current?.qhGridRef
        ?.current?.data;
      if (currentData != null) {
        const itemsPerPage = this.volcanoPlotFilteredGridRef?.current?.qhGridRef
          ?.current?.props.itemsPerPage;
        const Index = _.findIndex(currentData, function(p) {
          // const Index = _.findIndex(differentialResults, function(p) {
          return p[differentialFeatureIdKey] === featureToHighlight;
        });
        const pageNumber = Math.ceil((Index + 1) / itemsPerPage);
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
      volcanoDifferentialTableRowOther.includes(item[differentialFeatureIdKey])
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
      this.setState({ identifier: differentialAlphanumericFields[0] });
      var yLabel = relevantConfigColumns[0];
      var xLabel = relevantConfigColumns[1];
      var doY = false;
      if (relevantConfigColumns.includes('logFC')) {
        xLabel = 'logFC';
      }
      if (relevantConfigColumns.includes('adj_P_Val')) {
        yLabel = 'adj_P_Val';
        doY = true;
      } else if (relevantConfigColumns.includes('adj.P.Val')) {
        yLabel = 'adj.P.Val';
        doY = true;
      } else if (relevantConfigColumns.includes('P_Value')) {
        yLabel = 'P_Value';
        doY = true;
      } else if (relevantConfigColumns.includes('P.Value')) {
        yLabel = 'P.Value';
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
        axisLables: axes,
        yAxisLabel: yLabel,
        doYAxisTransformation: doY,
      });
      this.handleDropdownChange({}, { name: 'xAxisSelector', value: xLabel });
    }
  };
  handleVolcanoPlotSelectionChange = volcanoPlotSelectedDataArr => {
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

  // informItemsPerPageVolcanoTable = items => {
  //   this.setState({
  //     itemsPerPageVolcanoTable: items,
  //   });
  //   localStorage.setItem('itemsPerPageVolcanoTable', items);
  // };

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
    if (item !== null && event?.target?.className !== 'ExternalSiteIcon') {
      const { differentialFeatureIdKey } = this.props;
      event.stopPropagation();
      const PreviouslyHighlighted = [
        ...this.props.HighlightedFeaturesArrVolcano,
      ];
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
      } else if (event.ctrlKey) {
        const allTableData =
          this.volcanoPlotFilteredGridRef.current?.qhGridRef.current?.getSortedData() ||
          [];
        let selectedTableDataArray = [];

        const alreadyHighlighted = PreviouslyHighlighted.some(
          d => d.id === item[differentialFeatureIdKey],
        );
        // already highlighted, remove it from array
        if (alreadyHighlighted) {
          selectedTableDataArray = PreviouslyHighlighted.filter(
            i => i.id !== item[differentialFeatureIdKey],
          );
          this.props.onHandleSelectedVolcano(selectedTableDataArray);
        } else {
          // not yet highlighted, add it to array
          const indexMaxFeature = _.findIndex(allTableData, function(d) {
            return d[differentialFeatureIdKey] === PreviouslyHighlighted[0]?.id;
          });
          // map protein to fix obj entries
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
        }
      } else {
        this.props.onHandleSelectedVolcano([
          {
            id: item[differentialFeatureIdKey],
            value: item[differentialFeatureIdKey],
            key: item[differentialFeatureIdKey],
          },
        ]);
      }
    }
    // else {
    //   this.props.onPagedToFeature();
    // }
  };

  getMaxAndMin(data, element) {
    var values = [data[0][element], data[0][element]];
    for (var i = 1; i < data.length; i++) {
      if (data[i][element] > values[1]) {
        values[1] = data[i][element];
      } else if (data[i][element] < values[0]) {
        values[0] = data[i][element];
      }
    }
    return values;
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
    } else {
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
  getSVGPlot = () => {
    if (
      this.props.imageInfo.key !== null &&
      this.props.isVolcanoPlotSVGLoaded
    ) {
      return (
        <div className="VolcanoPlotSVGPlot">
          <SVGPlot
            // ref={this.DifferentialViewContainerRef}
            {...this.props}
            {...this.state}
            onSVGTabChange={this.props.onSVGTabChange}
          ></SVGPlot>
        </div>
      );
    } else if (!this.props.isVolcanoPlotSVGLoaded) {
      return (
        <Dimmer active inverted>
          <Loader size="large">Loading Plots</Loader>
        </Dimmer>
      );
    } else {
      return (
        <div className="PlotInstructions">
          <h4 className="PlotInstructionsText">
            Select a feature to display SVG Plot
          </h4>
        </div>
      );
    }
  };

  onSizeChange = (size, paneType) => {
    const adjustedSize = Math.round(size * 0.95);
    if (paneType === 'horizontal') {
      const width = parseInt(localStorage.getItem('volcanoWidth'), 10) || 300;
      // on up/down drag, we are forcing a svg resize by change the volcano width by 1
      localStorage.setItem('volcanoWidth', width + 1);
      localStorage.setItem('volcanoHeight', adjustedSize);
      this.setState({
        volcanoHeight: adjustedSize,
        volcanoWidth: width + 1,
      });
    } else {
      localStorage.setItem('volcanoWidth', adjustedSize);
      this.setState({
        volcanoWidth: adjustedSize,
      });
    }
  };

  render() {
    const {
      filteredTableData,
      itemsPerPageVolcanoTable,
      volcanoPlotRows,
      axisLables,
      xAxisLabel,
      yAxisLabel,
      doXAxisTransformation,
      doYAxisTransformation,
      allowXTransformation,
      allowYTransformation,
    } = this.state;

    const {
      additionalTemplateInfoDifferentialTable,
      differentialColumns,
      isDifferentialTableLoading,
      // differentialResultsMounted,
      differentialStudy,
      differentialModel,
      differentialTest,
      multisetQueriedP,
    } = this.props;
    // if (differentialResultsMounted) {
    const xAxisTransformBox = allowXTransformation ? (
      <span title="-log10 Transform">
        <Form.Field
          control={Checkbox}
          name="xTransformationCheckbox"
          checked={doXAxisTransformation}
          onClick={this.handleTransformationChange.bind(this)}
        ></Form.Field>
      </span>
    ) : (
      <span title="-log10 Transform">
        <Form.Field
          control={Checkbox}
          name="xTransformationCheckbox"
          checked={false}
          disabled={true}
          //checked={doXAxisTransformation}
          //onClick={this.handleTransformationChange.bind(this)}
        ></Form.Field>
      </span>
    );
    const yAxisTransformBox = allowYTransformation ? (
      <span title="-log10 Transform">
        <Form.Field
          control={Checkbox}
          name="yTransformationCheckbox"
          checked={doYAxisTransformation}
          onClick={this.handleTransformationChange.bind(this)}
        ></Form.Field>
      </span>
    ) : (
      <span title="-log10 Transform">
        <Form.Field
          control={Checkbox}
          name="yTransformationCheckbox"
          checked={false}
          disabled={true}
          //checked={doYAxisTransformation}
          //onClick={this.handleTransformationChange.bind(this)}
        ></Form.Field>
      </span>
    );
    const svgPlot = this.getSVGPlot();
    let differentialVolcanoCacheKey = `${differentialStudy}-${differentialModel}-${differentialTest}-Volcano`;
    if (multisetQueriedP) {
      differentialVolcanoCacheKey = `${differentialStudy}-${differentialModel}-${differentialTest}-${multisetQueriedP}-Volcano`;
    }
    return (
      <Grid className="VolcanoPlotGridContainer">
        <Grid.Row className="VolcanoPlotAxisSelectorsRow">
          <Grid.Column
            className="EmptyColumn"
            tablet={4}
            computer={4}
            largeScreen={2}
            widescreen={2}
          ></Grid.Column>
          <Grid.Column
            className="VolcanoPlotFilters"
            tablet={8}
            computer={16}
            largeScreen={8}
            widescreen={8}
          >
            <Fragment>
              <Form>
                <Form.Group>
                  <Form.Field
                    control={Select}
                    label="X Axis"
                    name="xAxisSelector"
                    className="axisSelector"
                    value={xAxisLabel}
                    options={axisLables}
                    width={4}
                    onChange={this.handleDropdownChange.bind(this)}
                  ></Form.Field>
                  {xAxisTransformBox}
                  <Form.Field
                    control={Select}
                    label="Y Axis"
                    name="yAxisSelector"
                    className="axisSelector"
                    value={yAxisLabel}
                    options={axisLables}
                    width={4}
                    onChange={this.handleDropdownChange.bind(this)}
                  ></Form.Field>
                  {yAxisTransformBox}
                  {/* <Image
                      src={excel_logo_custom}
                      onClick={console.log("Exporting not working")}
                      style={{ float: 'right', cursor: 'pointer' }}
                    /> */}
                </Form.Group>
              </Form>
            </Fragment>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row id="volcanoViewRow">
          <Grid.Column>
            <SplitPane
              split="horizontal"
              className="volcanoSplitPane"
              id=""
              // defaultSize={this.state.volcanoHeight * 1.05263157895}
              size={this.state.volcanoHeight * 1.05263157895}
              minSize={200}
              maxSize={1200}
              onDragFinished={size => this.onSizeChange(size, 'horizontal')}
            >
              <SplitPane
                split="vertical"
                className="volcanoSplitPane"
                // defaultSize={this.state.volcanoWidth * 1.05263157895}
                size={this.state.volcanoWidth * 1.05263157895}
                minSize={300}
                maxSize={1500}
                onDragFinished={size => this.onSizeChange(size, 'vertical')}
              >
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
                {svgPlot}
              </SplitPane>
              <EZGrid
                ref={this.volcanoPlotFilteredGridRef}
                uniqueCacheKey={differentialVolcanoCacheKey}
                className="volcanoPlotTable"
                // note, default is 70vh; if you want a specific vh, specify like "40vh"; "auto" lets the height flow based on items per page
                // height="auto"
                height="40vh"
                data={filteredTableData}
                totalRows={volcanoPlotRows}
                columnsConfig={differentialColumns}
                itemsPerPage={itemsPerPageVolcanoTable}
                // onInformItemsPerPage={this.informItemsPerPageVolcanoTable}
                // disableGeneralSearch
                disableGrouping
                disableColumnVisibilityToggle
                exportBaseName="VolcanoPlot_Filtered_Results"
                loading={isDifferentialTableLoading}
                additionalTemplateInfo={additionalTemplateInfoDifferentialTable}
                onRowClick={this.handleRowClick}
                rowLevelPropsCalc={this.rowLevelPropsCalc}
                emptyMessage={CustomEmptyMessage}
              />
            </SplitPane>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
    // } else {
    //   return (
    //     <div>
    //       <Dimmer active inverted>
    //         <Loader size="large">Plots are Loading</Loader>
    //       </Dimmer>
    //     </div>
    //   );
    // }
  }
}
export default DifferentialVolcano;
