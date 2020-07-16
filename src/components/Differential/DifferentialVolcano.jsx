import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import EZGrid from '../utility/EZGrid';
import ButtonActions from '../Shared/ButtonActions';
import SVGPlot from '../Shared/SVGPlot';
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
    volcanoWidth: null,
    volcanoHeight: null,
    defaultVolcanoWidth: 500,
    defaultVolcanoHeight: 400,
    filteredTableData: [],
    itemsPerPageInformedDifferential: null,
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

  componentDidMount() {}
  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.differentialResultsMounted !==
      this.props.differentialResultsMounted
    ) {
      const { identifier } = this.state;
      const { maxObjectIdentifier, differentialFeatureIdKey } = this.props;
      this.getAxisLabels();
      this.setState({
        filteredTableData: this.props.differentialResults,
        volcanoPlotRows: this.props.differentialResults.length,
        volcanoWidth: this.state.defaultVolcanoWidth * 0.95,
        volcanoHeight: this.state.defaultVolcanoHeight * 0.95,
      });
      const defaultMaxObject = this.props.differentialResults[0];
      this.props.onSelectFromTable([
        {
          id: defaultMaxObject[differentialFeatureIdKey],
          value: defaultMaxObject[maxObjectIdentifier],
          key: defaultMaxObject[identifier],
        },
      ]);
      this.props.onVolcanoSVGSizeChange(
        this.state.volcanoHeight * 0.9,
        (1000 - this.state.defaultVolcanoWidth) * 0.88,
      );
      this.setState({
        filteredTableData: this.props.differentialResults,
        volcanoPlotRows: this.props.differentialResults.length,
      });
    }
  }
  getAxisLabels = () => {
    if (this.props.differentialResults.length !== 0) {
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
    const { identifier } = this.state;
    const { maxObjectIdentifier, differentialFeatureIdKey } = this.props;
    if (volcanoPlotSelectedDataArr.length !== 0) {
      this.setState({
        filteredTableData: volcanoPlotSelectedDataArr,
        volcanoPlotRows: volcanoPlotSelectedDataArr.length,
      });
      const defaultMaxObject = volcanoPlotSelectedDataArr[0];
      this.props.onSelectFromTable([
        {
          id: defaultMaxObject[differentialFeatureIdKey],
          value: defaultMaxObject[maxObjectIdentifier],
          key: defaultMaxObject[identifier],
        },
      ]);
    } else {
      this.setState({
        filteredTableData: this.props.differentialResults,
        volcanoPlotRows: this.props.differentialResults.length,
      });
      const defaultMaxObject = this.props.differentialResults[0];
      this.props.onSelectFromTable([
        {
          id: defaultMaxObject[differentialFeatureIdKey],
          value: defaultMaxObject[maxObjectIdentifier],
          key: defaultMaxObject[identifier],
        },
      ]);
    }
  };

  informItemsPerPage = items => {
    this.setState({
      itemsPerPageInformedDifferential: items,
    });
  };

  handleRowClick = (event, item, index) => {
    const { identifier } = this.state;
    const { differentialFeatureIdKey, maxObjectIdentifier } = this.props;
    const PreviouslyHighlighted = this.props.selectedFromTableData;
    event.stopPropagation();
    if (event.shiftKey) {
      const allTableData = _.cloneDeep(this.state.filteredTableData);
      const indexMaxProtein = _.findIndex(allTableData, function(d) {
        return d[differentialFeatureIdKey] === PreviouslyHighlighted[0]?.id;
      });
      const sliceFirst = index < indexMaxProtein ? index : indexMaxProtein;
      const sliceLast = index > indexMaxProtein ? index : indexMaxProtein;
      const shiftedTableData = allTableData.slice(sliceFirst, sliceLast + 1);
      const shiftedTableDataArray = shiftedTableData.map(function(d) {
        return {
          id: item[differentialFeatureIdKey],
          value: item[maxObjectIdentifier],
          key: item[identifier],
        };
      });
      this.props.onSelectFromTable(shiftedTableDataArray);
    } else if (event.ctrlKey) {
      //const allTableData = _.cloneDeep(this.state.filteredTableData);
      let selectedTableDataArray = [];
      const alreadyHighlighted = PreviouslyHighlighted.some(
        d => d.id === item[differentialFeatureIdKey],
      );
      // already highlighted, remove it from array
      if (alreadyHighlighted) {
        selectedTableDataArray = PreviouslyHighlighted.filter(
          i => i.id !== item[differentialFeatureIdKey],
        );
        this.props.onSelectFromTable(selectedTableDataArray);
      } else {
        // map protein to fix obj entries
        const mappedProtein = {
          id: item[differentialFeatureIdKey],
          value: item[maxObjectIdentifier],
          key: item[identifier],
        };
        PreviouslyHighlighted.push(mappedProtein);
        this.props.onSelectFromTable(PreviouslyHighlighted);
      }
    } else {
      this.props.onSelectFromTable([
        {
          id: item[differentialFeatureIdKey],
          value: item[maxObjectIdentifier],
          key: item[identifier],
        },
      ]);
    }
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
    if (name === 'xAxisSelector') {
      this.setState({
        xAxisLabel: value,
        doXAxisTransformation: false,
        allowXTransformation:
          this.getMaxAndMin(differentialResultsUnfiltered, value)[0] > 0,
      });
    } else {
      this.setState({
        yAxisLabel: value,
        doYAxisTransformation: false,
        allowYTransformation:
          this.getMaxAndMin(differentialResultsUnfiltered, value)[0] > 0,
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
    if (this.props.imageInfo.key === null) {
      return null;
    } else if (
      this.props.imageInfo.key !== null &&
      !this.props.isProteinSVGLoaded
    ) {
      return (
        <Dimmer active inverted>
          <Loader size="large">SVG Plot is Loading</Loader>
        </Dimmer>
      );
    } else {
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
    }
  };

  onSizeChange = (size, direction) => {
    if (direction === 'horizontal') {
      this.setState({ volcanoHeight: size * 0.95 });
      this.props.onVolcanoSVGSizeChange(
        size * 0.9,
        (1000 - this.state.volcanoWidth) * 0.88,
      );
    } else {
      this.setState({ volcanoWidth: size * 0.95 });
      this.props.onVolcanoSVGSizeChange(
        this.state.volcanoHeight * 0.9,
        (1000 - size) * 0.88,
      );
    }
  };

  render() {
    const {
      filteredTableData,
      itemsPerPageInformedDifferential,
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
      differentialResultsMounted,
    } = this.props;

    if (differentialResultsMounted) {
      const xAxisTransformBox = allowXTransformation ? (
        <span title="-log10 Transform">
          <Form.Field
            control={Checkbox}
            name="xTransformationCheckbox"
            checked={doXAxisTransformation}
            onClick={this.handleTransformationChange.bind(this)}
          ></Form.Field>
        </span>
      ) : null;
      const yAxisTransformBox = allowYTransformation ? (
        <span title="-log10 Transform">
          <Form.Field
            control={Checkbox}
            name="yTransformationCheckbox"
            checked={doYAxisTransformation}
            onClick={this.handleTransformationChange.bind(this)}
          ></Form.Field>
        </span>
      ) : null;
      const svgPlot = this.getSVGPlot();
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
          <Grid.Row>
            <Grid.Column>
              <div id="volcanoDiv1">
                <SplitPane
                  split="vertical"
                  defaultSize={this.state.defaultVolcanoWidth}
                  minSize={300}
                  maxSize={800}
                  onDragFinished={size => this.onSizeChange(size, 'vertical')}
                >
                  <DifferentialVolcanoPlot
                    {...this.state}
                    {...this.props}
                    handleVolcanoPlotSelectionChange={
                      this.handleVolcanoPlotSelectionChange
                    }
                    getMaxAndMin={this.getMaxAndMin}
                    handleRowClick={this.handleRowClick}
                  ></DifferentialVolcanoPlot>
                  {svgPlot}
                </SplitPane>
              </div>
              <div id="volcanoDiv2">
                <EZGrid
                  className="volcanoPlotTable"
                  // note, default is 70vh; if you want a specific vh, specify like "50vh"; "auto" lets the height flow based on items per page
                  height="auto"
                  data={filteredTableData}
                  totalRows={volcanoPlotRows}
                  columnsConfig={differentialColumns}
                  itemsPerPage={itemsPerPageInformedDifferential}
                  onInformItemsPerPage={this.informItemsPerPage}
                  disableGeneralSearch
                  disableGrouping
                  disableColumnVisibilityToggle
                  exportBaseName="VolcanoPlot_Filtered_Results"
                  additionalTemplateInfo={
                    additionalTemplateInfoDifferentialTable
                  }
                  headerAttributes={<ButtonActions />}
                  onRowClick={this.handleRowClick}
                />
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      );
    } else {
      return (
        <div>
          <Dimmer active inverted>
            <Loader size="large">Plots are Loading</Loader>
          </Dimmer>
        </div>
      );
    }
  }
}
export default DifferentialVolcano;
