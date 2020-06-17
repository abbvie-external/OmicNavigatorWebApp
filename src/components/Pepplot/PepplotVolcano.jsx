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
} from 'semantic-ui-react';
import './PepplotVolcano.scss';
import SplitPane, {Pane} from 'react-split-pane';

class PepplotVolcano extends Component {
  state = {
    volcanoWidth: 400,
    volcanoHeight: 400,
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
    if (
      this.props.selectedFromTableData.length === 1 &&
      this.state.volcanoWidth !== 400
    ) {
      this.setState({ volcanoWidth: 400 });
    } else if (
      this.props.selectedFromTableData.length !== 1 &&
      this.state.volcanoWidth !== 600
    ) {
      this.setState({ volcanoWidth: 600 });
    }
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
    const PreviouslyHighlighted = this.props.selectedFromTableData;
    event.stopPropagation();
    if (event.shiftKey) {
      const allTableData = _.cloneDeep(this.state.filteredTableData);
      const indexMaxProtein = _.findIndex(allTableData, function(d) {
        return d.Protein_Site === PreviouslyHighlighted[0]?.Protein_Site;
      });
      const sliceFirst = index < indexMaxProtein ? index : indexMaxProtein;
      const sliceLast = index > indexMaxProtein ? index : indexMaxProtein;
      const shiftedTableData = allTableData.slice(sliceFirst, sliceLast + 1);
      const shiftedTableDataArray = shiftedTableData.map(function(d) {
        return {
          Protein_Site: d.Protein_Site,
          id_mult: d.id_mult,
          cpm: d.F === undefined ? d.t : d.F,
        };
      });
      this.props.onSelectFromTable(shiftedTableDataArray);
    } else if (event.ctrlKey) {
      const allTableData = _.cloneDeep(this.state.filteredTableData);
      let selectedTableDataArray = [];

      const ctrlClickedObj = allTableData[index];
      const alreadyHighlighted = PreviouslyHighlighted.some(
        d => d.Protein_Site === ctrlClickedObj.Protein_Site,
      );
      // already highlighted, remove it from array
      if (alreadyHighlighted) {
        selectedTableDataArray = PreviouslyHighlighted.filter(
          i => i.Protein_Site !== ctrlClickedObj.Protein_Site,
        );
        this.props.onSelectFromTable(selectedTableDataArray);
      } else {
        // map protein to fix obj entries
        const mappedProtein = {
          Protein_Site: ctrlClickedObj.Protein_Site,
          id_mult: ctrlClickedObj.id_mult,
          cpm:
            ctrlClickedObj.F === undefined
              ? ctrlClickedObj.t
              : ctrlClickedObj.F,
        };
        PreviouslyHighlighted.push(mappedProtein);
        this.props.onSelectFromTable(PreviouslyHighlighted);
      }
    } else {
      this.props.onSelectFromTable([
        {
          Protein_Site: item.Protein_Site, //circleID,
          id_mult: item.id_mult,
          cpm: item.logFC, //statistic,
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
                  </Form.Group>
                </Form>
              </Fragment>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <PepplotVolcanoPlot
                {...this.state}
                {...this.props}
                handleVolcanoPlotSelectionChange={
                  this.handleVolcanoPlotSelectionChange
                }
                getMaxAndMin={this.getMaxAndMin}
                handleRowClick={this.handleRowClick}
              ></PepplotVolcanoPlot>
              {svgPlot}
            </Grid.Column>
          </Grid.Row>
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
            </Grid.Column>
          </Grid.Row>
        </Grid>
      );
    }
  }
}
export default PepplotVolcano;
