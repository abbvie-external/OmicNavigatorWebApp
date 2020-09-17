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
    defaultVolcanoWidth:
      parseInt(localStorage.getItem('volcanoSplitPaneSize'), 10) || 550,
    defaultVolcanoHeight: 400,
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

  componentDidMount() {
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
    if (this.props.differentialResults.length > 0) {
      this.props.onSelectFromTable([
        {
          id: defaultMaxObject[differentialFeatureIdKey],
          value: defaultMaxObject[maxObjectIdentifier],
          key: defaultMaxObject[identifier],
        },
      ]);
    }
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.differentialResults !== this.props.differentialResults) {
      // const { identifier } = this.state;
      // const { maxObjectIdentifier, differentialFeatureIdKey } = this.props;
      // this.getAxisLabels();
      this.setState({
        filteredTableData: this.props.differentialResults,
        volcanoPlotRows: this.props.differentialResults.length,
      });
      // const defaultMaxObject = this.props.differentialResults[0];
      // this.props.onSelectFromTable([
      //   {
      //     id: defaultMaxObject[differentialFeatureIdKey],
      //     value: defaultMaxObject[maxObjectIdentifier],
      //     key: defaultMaxObject[identifier],
      //   },
      // ]);
    }
    //   if (this.props.featureToHighlightInDiffTable !==
    //     prevProps.featureToHighlightInDiffTable &&
    //     this.props.featureToHighlightInDiffTable !== '')
    //  {

    // }
    if (this.props.bullseyeHighlightInProgress) {
      this.pageToFeature(this.props.featureToHighlightInDiffTable);
    }
  }
  pageToFeature = featureToHighlight => {
    const { differentialFeatureIdKey, differentialResults } = this.props;
    const { itemsPerPageVolcanoTable } = this.state;
    if (this.volcanoPlotFilteredGridRef?.current != null) {
      const Index = _.findIndex(differentialResults, function(p) {
        return p[differentialFeatureIdKey] === featureToHighlight;
      });
      const pageNumber = Math.ceil((Index + 1) / itemsPerPageVolcanoTable);
      this.volcanoPlotFilteredGridRef.current.handlePageChange(
        {},
        { activePage: pageNumber },
      );
    }
  };
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

  informItemsPerPageVolcanoTable = items => {
    this.setState({
      itemsPerPageVolcanoTable: items,
    });
    localStorage.setItem('itemsPerPageVolcanoTable', items);
  };

  handleRowClick = (event, item, index) => {
    if (item !== null && event?.target?.className !== 'ExternalSiteIcon') {
      const { identifier } = this.state;
      const { differentialFeatureIdKey, maxObjectIdentifier } = this.props;
      const PreviouslyHighlighted = this.props.selectedFromTableData;
      event.stopPropagation();
      // MULTISELECT NOT IMPLEMENTED YET
      // if (event.shiftKey) {
      //   const allTableData = _.cloneDeep(this.state.filteredTableData);
      //   const indexMaxProtein = _.findIndex(allTableData, function(d) {
      //     return d[differentialFeatureIdKey] === PreviouslyHighlighted[0]?.id;
      //   });
      //   const sliceFirst = index < indexMaxProtein ? index : indexMaxProtein;
      //   const sliceLast = index > indexMaxProtein ? index : indexMaxProtein;
      //   const shiftedTableData = allTableData.slice(sliceFirst, sliceLast + 1);
      //   const shiftedTableDataArray = shiftedTableData.map(function(d) {
      //     return {
      //       id: item[differentialFeatureIdKey],
      //       value: item[maxObjectIdentifier],
      //       key: item[identifier],
      //     };
      //   });
      //   this.props.onSelectFromTable(shiftedTableDataArray);
      // } else if (event.ctrlKey) {
      //   //const allTableData = _.cloneDeep(this.state.filteredTableData);
      //   let selectedTableDataArray = [];
      //   const alreadyHighlighted = PreviouslyHighlighted.some(
      //     d => d.id === item[differentialFeatureIdKey],
      //   );
      //   // already highlighted, remove it from array
      //   if (alreadyHighlighted) {
      //     selectedTableDataArray = PreviouslyHighlighted.filter(
      //       i => i.id !== item[differentialFeatureIdKey],
      //     );
      //     this.props.onSelectFromTable(selectedTableDataArray);
      //   } else {
      //     // map protein to fix obj entries
      //     const mappedProtein = {
      //       id: item[differentialFeatureIdKey],
      //       value: item[maxObjectIdentifier],
      //       key: item[identifier],
      //     };
      //     PreviouslyHighlighted.push(mappedProtein);
      //     this.props.onSelectFromTable(PreviouslyHighlighted);
      //   }
      // } else {
      this.props.onSelectFromTable([
        {
          id: item[differentialFeatureIdKey],
          value: item[maxObjectIdentifier],
          key: item[identifier],
        },
      ]);
      // }
    } else {
      this.props.onPagedToFeature();
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
    } else {
      return (
        <Dimmer active inverted>
          <Loader size="large">Loading Plots</Loader>
        </Dimmer>
      );
    }
  };

  onSizeChange = size => {
    this.setState({ volcanoWidth: size * 0.95 });
    localStorage.setItem('volcanoSplitPaneSize', size);
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
        <Grid.Row id="volcanoDiv1Row">
          <Grid.Column>
            <div id="volcanoDiv1">
              <SplitPane
                split="vertical"
                className="volcanoDiv1SplitPane"
                defaultSize={this.state.defaultVolcanoWidth}
                minSize={300}
                maxSize={735}
                onDragFinished={size => this.onSizeChange(size)}
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
          </Grid.Column>
        </Grid.Row>
        <Grid.Row id="volcanoDiv2Row">
          <Grid.Column>
            <div id="volcanoDiv2">
              <EZGrid
                ref={this.volcanoPlotFilteredGridRef}
                className="volcanoPlotTable"
                // note, default is 70vh; if you want a specific vh, specify like "40vh"; "auto" lets the height flow based on items per page
                // height="auto"
                height="40vh"
                data={filteredTableData}
                totalRows={volcanoPlotRows}
                columnsConfig={differentialColumns}
                itemsPerPage={itemsPerPageVolcanoTable}
                onInformItemsPerPage={this.informItemsPerPageVolcanoTable}
                disableGeneralSearch
                disableGrouping
                disableColumnVisibilityToggle
                exportBaseName="VolcanoPlot_Filtered_Results"
                loading={isDifferentialTableLoading}
                additionalTemplateInfo={additionalTemplateInfoDifferentialTable}
                headerAttributes={<ButtonActions />}
                onRowClick={this.handleRowClick}
              />
            </div>
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
