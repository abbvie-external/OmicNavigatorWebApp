import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import EZGrid from '../utility/EZGrid';
import ButtonActions from '../Shared/ButtonActions';
import SVGPlot from '../Shared/SVGPlot';
import PepplotVolcanoPlot from './PepplotVolcanoPlot';
import {
  Form,
  Grid,
  Select,
  Checkbox,
  Dimmer,
  Loader,
  GridColumn,
  Image,
} from 'semantic-ui-react';
import './PepplotVolcano.scss';
import SplitPane, {Pane} from 'react-split-pane';
import excel_logo_custom from '../../resources/excel3.png';

class PepplotVolcano extends Component {
  state = {
    volcanoWidth: null,
    volcanoHeight: null,
    defaultVolcanoWidth: 500,
    defaultVolcanoHeight: 400,
    filteredTableData: [],
    itemsPerPageInformedPepplot: null,
    volcanoPlotRows: 0,
    doXAxisTransformation: false,
    doYAxisTransformation: false,
    allowXTransformation: true,
    allowYTransformation: true,
    axisLables: [],
    xAxisLabel: null,
    yAxisLabel: null,
    identifier: null
  };

  componentDidMount() {
    this.getAxisLabels();
    this.setState({
      filteredTableData: this.props.pepplotResults,
      volcanoPlotRows: this.props.pepplotResults.length,
      volcanoWidth: this.state.defaultVolcanoWidth*.95,
      volcanoHeight: this.state.defaultVolcanoHeight*.95,
    });
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.pepplotResults !== this.props.pepplotResults) {
      this.setState({
        filteredTableData: this.props.pepplotResults,
        volcanoPlotRows: this.props.pepplotResults.length,
      });
      this.props.onSelectFromTable([]);
    }
    // if (
    //   this.props.selectedFromTableData.length === 1 &&
    //   this.state.volcanoWidth !== 400
    // ) {
    //   this.setState({ volcanoWidth: 400 });
    // } else if (
    //   this.props.selectedFromTableData.length !== 1 &&
    //   this.state.volcanoWidth !== 600
    // ) {
    //   this.setState({ volcanoWidth: 600 });
    // }
  }
  getAxisLabels = () => {
    if(this.props.pepplotResults.length !== 0){
      let pepplotAlphanumericFields = [];
      let relevantConfigColumns = [];
      const firstObject = this.props.pepplotResults[0];
      for (let [key, value] of Object.entries(firstObject)) {
        if (typeof value === 'string' || value instanceof String) {
          pepplotAlphanumericFields.push(key);
        } else {
          relevantConfigColumns.push(key);
        }
      }
      this.setState({identifier:pepplotAlphanumericFields[0]})
      var yLabel = relevantConfigColumns[0];
      var xLabel = relevantConfigColumns[1];
      var doY = false;
      if(relevantConfigColumns.includes("logFC")){
        xLabel = "logFC";
      }
      if(relevantConfigColumns.includes("adj_P_Val")){
        yLabel = "adj_P_Val";
        doY = true;
      } else if(relevantConfigColumns.includes("adj.P.Val")){
        yLabel = "adj.P.Val";
        doY = true;
      }else if(relevantConfigColumns.includes("P_Value")){
        yLabel = "P_Value";
        doY= true;
      } else if(relevantConfigColumns.includes("P.Value")){
        yLabel = "P.Value";
        doY= true;
      } else {
        this.handleDropdownChange({},{name:"yAxisSelector", value:yLabel})
      }
      const axes = relevantConfigColumns.map(e =>{
        return({
          key: e,
          text: e,
          value: e,
        })
      });
      this.setState({
        axisLables: axes,
        yAxisLabel: yLabel,
        doYAxisTransformation: doY
      });
      this.handleDropdownChange({},{name:"xAxisSelector", value:xLabel})
    }
  };
  handleVolcanoPlotSelectionChange = volcanoPlotSelectedDataArr => {
    if (volcanoPlotSelectedDataArr.length !== 0) {
      this.setState({
        filteredTableData: volcanoPlotSelectedDataArr,
        volcanoPlotRows: volcanoPlotSelectedDataArr.length,
      });
    } else {
      this.setState({
        filteredTableData: this.props.pepplotResults,
        volcanoPlotRows: this.props.pepplotResults.length,
      });
    }
    this.props.onSelectFromTable([]);
  };

  informItemsPerPage = items => {
    this.setState({
      itemsPerPageInformedPepplot: items,
    });
  };

  handleRowClick = (event, item, index) => {
    const {identifier} = this.state;
    const {pepplotFeatureIdKey}=this.props;
    const PreviouslyHighlighted = this.props.selectedFromTableData;
    event.stopPropagation();
    if (event.shiftKey) {
      const allTableData = _.cloneDeep(this.state.filteredTableData);
      const indexMaxProtein = _.findIndex(allTableData, function(d) {
        return d[pepplotFeatureIdKey] === PreviouslyHighlighted[0]?.id;
      });
      const sliceFirst = index < indexMaxProtein ? index : indexMaxProtein;
      const sliceLast = index > indexMaxProtein ? index : indexMaxProtein;
      const shiftedTableData = allTableData.slice(sliceFirst, sliceLast + 1);
      const shiftedTableDataArray = shiftedTableData.map(function(d) {
        return {
          id: d[pepplotFeatureIdKey],
          key: d[identifier]
        };
      });
      this.props.onSelectFromTable(shiftedTableDataArray);
    } else if (event.ctrlKey) {
      const allTableData = _.cloneDeep(this.state.filteredTableData);
      let selectedTableDataArray = [];

      const ctrlClickedObj = allTableData[index];
      const alreadyHighlighted = PreviouslyHighlighted.some(
        d => d.id === ctrlClickedObj[pepplotFeatureIdKey],
      );
      // already highlighted, remove it from array
      if (alreadyHighlighted) {
        selectedTableDataArray = PreviouslyHighlighted.filter(
          i => i.id !== ctrlClickedObj[pepplotFeatureIdKey],
        );
        this.props.onSelectFromTable(selectedTableDataArray);
      } else {
        // map protein to fix obj entries
        const mappedProtein = {
          id: ctrlClickedObj[pepplotFeatureIdKey],
          key:ctrlClickedObj[identifier]
        };
        PreviouslyHighlighted.push(mappedProtein);
        this.props.onSelectFromTable(PreviouslyHighlighted);
      }
    } else {
      this.props.onSelectFromTable([
        {
          id: item[pepplotFeatureIdKey],
          key: item[identifier]
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
    const { pepplotResultsUnfiltered } = this.props;
    if (name === 'xAxisSelector') {
      this.setState({
        xAxisLabel: value,
        doXAxisTransformation: false,
        allowXTransformation:
          this.getMaxAndMin(pepplotResultsUnfiltered, value)[0] > 0,
      });
    } else {
      this.setState({
        yAxisLabel: value,
        doYAxisTransformation: false,
        allowYTransformation:
          this.getMaxAndMin(pepplotResultsUnfiltered, value)[0] > 0,
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
    return null
    if (this.props.selectedFromTableData.length !== 1) {
      return null;
    } else if (
      this.props.selectedFromTableData.length === 1 &&
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
            // ref={this.PepplotViewContainerRef}
            {...this.props}
            {...this.state}
            onSVGTabChange={this.props.onSVGTabChange}
          ></SVGPlot>
        </div>
      );
    }
  };

  onSizeChange=(size, direction)=>{
    if(direction==="horizontal"){
      console.log("Horizontal: "+ size)
      this.setState({volcanoHeight: size*.95})
    }else{
      console.log("Vertical: "+ size)
      this.setState({volcanoWidth: size*.95})
    }
  }

  render() {
    const {
      filteredTableData,
      itemsPerPageInformedPepplot,
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
      additionalTemplateInfoPepplotTable,
      isItemSelected,
      pepplotColumns,
    } = this.props;

    if (!isItemSelected) {
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
              <SplitPane
                className="ThreePlotsDiv SplitPanesWrapper"
                split="horizontal"
                defaultSize={this.state.defaultVolcanoHeight}
                minSize={200}
                maxSize={800}
                onDragFinished={size=>this.onSizeChange(size, "horizontal")}
              >
              <SplitPane
                split="vertical"
                defaultSize={this.state.defaultVolcanoWidth}
                minSize={300}
                maxSize={800}
                onDragFinished={size=>this.onSizeChange(size, "vertical")}
              >
              <PepplotVolcanoPlot
                {...this.state}
                {...this.props}
                handleVolcanoPlotSelectionChange={
                  this.handleVolcanoPlotSelectionChange
                }
                getMaxAndMin={this.getMaxAndMin}
                handleRowClick={this.handleRowClick}
              ></PepplotVolcanoPlot>
              <svg
                width={400}
                height={400}
              >
                <rect
                  x={0}
                  y={0}
                  width={100}
                  height={100}
                  fill="red"
                ></rect>
              </svg>
              {/* {svgPlot} */}
              </SplitPane>
              <EZGrid
                className="volcanoPlotTable"
                data={filteredTableData}
                totalRows={volcanoPlotRows}
                columnsConfig={pepplotColumns}
                itemsPerPage={itemsPerPageInformedPepplot}
                onInformItemsPerPage={this.informItemsPerPage}
                disableGeneralSearch
                disableGrouping
                disableColumnVisibilityToggle
                exportBaseName="VolcanoPlot_Filtered_Results"
                additionalTemplateInfo={additionalTemplateInfoPepplotTable}
                headerAttributes={<ButtonActions />}
                onRowClick={this.handleRowClick}
              />
              </SplitPane>
            </Grid.Column>
          {/* </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <EZGrid
                data={filteredTableData}
                totalRows={volcanoPlotRows}
                columnsConfig={pepplotColumns}
                itemsPerPage={itemsPerPageInformedPepplot}
                onInformItemsPerPage={this.informItemsPerPage}
                disableGeneralSearch
                disableGrouping
                disableColumnVisibilityToggle
                exportBaseName="VolcanoPlot_Filtered_Results"
                additionalTemplateInfo={additionalTemplateInfoPepplotTable}
                headerAttributes={<ButtonActions />}
                onRowClick={this.handleRowClick}
              />
            </Grid.Column> */}
          </Grid.Row>
        </Grid>
      );
    }
  }
}
export default PepplotVolcano;
