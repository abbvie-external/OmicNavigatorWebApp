import React, { Component } from 'react';
import {
  Form,
  Grid,
  Select,
  Checkbox,
  Popup,
  Label,
  Icon,
  Button,
  Loader,
  Dimmer,
  List,
} from 'semantic-ui-react';
import {
  isNotNANullUndefinedEmptyString,
  getYAxis,
  getXAxis,
} from '../Shared/helpers';
import ButtonActions from '../Shared/ButtonActions';
import ScatterPlot from './ScatterPlot';
import './ScatterPlotDiv.scss';

class ScatterPlotDiv extends Component {
  state = {
    doXAxisTransformation:
      JSON.parse(sessionStorage.getItem('doXAxisTransformation')) === true
        ? // || sessionStorage.getItem('doXAxisTransformation') == null
          true
        : false,

    doYAxisTransformation:
      JSON.parse(sessionStorage.getItem('doYAxisTransformation')) === true
        ? // || sessionStorage.getItem('doYAxisTransformation') == null
          true
        : false,

    allowXTransformation:
      JSON.parse(sessionStorage.getItem('allowXTransformation')) === true ||
      sessionStorage.getItem('allowXTransformation') == null
        ? true
        : false,
    allowYTransformation:
      JSON.parse(sessionStorage.getItem('allowYTransformation')) === true ||
      sessionStorage.getItem('allowYTransformation') == null
        ? true
        : false,
    axisLabels: [],
    xAxisLabel: sessionStorage.getItem('yAxisLabel') || null,
    yAxisLabel: sessionStorage.getItem('yAxisLabel') || null,
    volcanoCircleLabel: sessionStorage.getItem('volcanoCircleLabel') || null,
    volcanoCircleLabels: [],
    optionsOpen: false,
    usageOpen: false,
  };

  componentDidMount() {
    if (!this.props.differentialResultsTableStreaming) {
      this.getAxisLabels();
    }
  }

  componentWillUnmount() {
    this.setState({
      doXAxisTransformation: false,
      doYAxisTransformation: false,
      allowXTransformation: false,
      allowYTransformation: false,
      axisLabels: [],
      xAxisLabel: null,
      yAxisLabel: null,
      volcanoCircleLabel: null,
      volcanoCircleLabels: [],
      // DEV : do we want to reset these ^ ?
      optionsOpen: false,
      usageOpen: false,
    });
  }

  componentDidUpdate(prevProps) {
    const {
      upperPlotsVisible,
      volcanoPlotVisible,
      differentialResultsTableStreaming,
      differentialTest,
    } = this.props;
    if (
      (!upperPlotsVisible &&
        upperPlotsVisible !== prevProps.upperPlotsVisible) ||
      (!volcanoPlotVisible &&
        volcanoPlotVisible !== prevProps.volcanoPlotVisible)
    ) {
      // user closes volcano plot, close options
      this.setState({ optionsOpen: false, usageOpen: false });
    }
    if (
      differentialResultsTableStreaming !==
        prevProps.differentialResultsTableStreaming ||
      // need this check for cached data from another test
      differentialTest !== prevProps.differentialTest
    ) {
      this.getAxisLabels();
    }
  }

  getMaxAndMin = (data, element) => {
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
    }
  };

  handleDropdownChange = (evt, { name, value }) => {
    const { differentialResultsUnfiltered } = this.props;
    if (name === 'xAxisSelector') {
      const allowXTransCheck =
        this.getMaxAndMin(differentialResultsUnfiltered, value)[0] > 0;
      const doXaxisTransCheck = allowXTransCheck
        ? this.state.doXAxisTransformation
        : false;
      this.setState({
        xAxisLabel: value,
        doXAxisTransformation: doXaxisTransCheck,
        allowXTransformation: allowXTransCheck,
      });
      sessionStorage.setItem('xAxisLabel', value);
      sessionStorage.setItem('doXAxisTransformation', doXaxisTransCheck);
      sessionStorage.setItem('allowXTransformation', allowXTransCheck);
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
      sessionStorage.setItem('yAxisLabel', value);
      sessionStorage.setItem('doYAxisTransformation', doYaxisTransCheck);
      sessionStorage.setItem('allowYTransformation', allowYTransCheck);
    } else {
      this.setState({
        volcanoCircleLabel: value,
      });
      sessionStorage.setItem('volcanoCircleLabel', value);
    }
  };

  handleTransformationChange = (evt, { name }) => {
    if (name === 'xTransformationCheckbox') {
      this.setState({
        doXAxisTransformation: !this.state.doXAxisTransformation,
      });
      sessionStorage.setItem(
        'doXAxisTransformation',
        !this.state.doXAxisTransformation,
      );
    } else {
      this.setState({
        doYAxisTransformation: !this.state.doYAxisTransformation,
      });
      sessionStorage.setItem(
        'doYAxisTransformation',
        !this.state.doYAxisTransformation,
      );
    }
  };

  getAxisLabels = () => {
    const { differentialResults } = this.props;
    if (differentialResults.length < 1) return;
    let differentialAlphanumericFields = [];
    let relevantConfigColumns = [];
    // grab first object
    const firstFullObject =
      differentialResults.length > 0 ? [...differentialResults][0] : null;
    // if exists, loop through the values of each property,
    // find the first real value,
    // and set the config column types
    if (firstFullObject) {
      let allProperties = Object.keys(firstFullObject);
      const dataCopy = [...differentialResults];
      allProperties.forEach((property) => {
        // loop through data, one property at a time
        const notNullObject = dataCopy.find((row) => {
          // find the first value for that property
          return isNotNANullUndefinedEmptyString(row[property]);
        });
        let notNullValue = null;
        if (notNullObject) {
          notNullValue = notNullObject[property] || null;
          // if the property has a value somewhere in the data
          if (
            typeof notNullValue === 'string' ||
            notNullValue instanceof String
          ) {
            // push it to the appropriate field type
            differentialAlphanumericFields.push(property);
          } else {
            relevantConfigColumns.push(property);
          }
        } else {
          // otherwise push it to type numeric
          relevantConfigColumns.push(property);
        }
      });
    }
    //Pushes "none" option into Volcano circle text dropdown
    differentialAlphanumericFields.unshift('None');
    let volcanoCircleLabelsVar = differentialAlphanumericFields.map((e) => {
      return {
        key: e,
        text: e,
        value: e,
      };
    });

    let storedVolcanoCircleLabel = sessionStorage.getItem('volcanoCircleLabel');
    let nextVolcanoCircleLabel = differentialAlphanumericFields?.includes(
      storedVolcanoCircleLabel,
    )
      ? storedVolcanoCircleLabel
      : this.props.differentialFeatureIdKey;
    this.setState({
      volcanoCircleLabels: volcanoCircleLabelsVar,
      volcanoCircleLabel: nextVolcanoCircleLabel,
    });
    sessionStorage.setItem('volcanoCircleLabel', nextVolcanoCircleLabel);
    // XAXIS
    let storedXAxisLabel = sessionStorage.getItem('xAxisLabel');
    // if session storage cached xlabel is an option, use it
    let xLabel = relevantConfigColumns?.includes(storedXAxisLabel)
      ? storedXAxisLabel
      : null;

    // otherwise, if not cached in session, default to logFC. If no logFC, set to first index
    if (xLabel == null) {
      xLabel = getXAxis(relevantConfigColumns);
    }
    const allowXTransCheck =
      this.getMaxAndMin(differentialResults, xLabel)[0] > 0;
    const doXaxisTransCheck = allowXTransCheck
      ? this.state.doXAxisTransformation
      : false;

    // YAXIS
    let storedYAxisLabel = sessionStorage.getItem('yAxisLabel');
    // if session storage cached ylabel is an option, use it, otherwise, if not cached in session, look for a p value label
    let yLabel = relevantConfigColumns?.includes(storedYAxisLabel)
      ? storedYAxisLabel
      : null;
    // DOY
    if (yLabel == null) {
      yLabel = getYAxis(relevantConfigColumns);
      if (yLabel === null) {
        yLabel = relevantConfigColumns[0];
      }
    }
    const allowYTransCheck =
      this.getMaxAndMin(differentialResults, yLabel)[0] > 0;
    const doYaxisTransCheck = allowYTransCheck
      ? this.state.doYAxisTransformation
      : false;
    const axes = relevantConfigColumns.map((e) => {
      return {
        key: e,
        text: e,
        value: e,
      };
    });

    // session storage
    sessionStorage.setItem('xAxisLabel', xLabel);
    sessionStorage.setItem('allowXTransformation', allowXTransCheck);
    sessionStorage.setItem('doXAxisTransformation', doXaxisTransCheck);
    sessionStorage.setItem('yAxisLabel', yLabel);
    sessionStorage.setItem('allowYTransformation', allowYTransCheck);
    sessionStorage.setItem('doYAxisTransformation', doYaxisTransCheck);
    this.setState({
      axisLabels: axes,
      xAxisLabel: xLabel,
      allowXTransformation: allowXTransCheck,
      doXAxisTransformation: doXaxisTransCheck,
      yAxisLabel: yLabel,
      allowYTransformation: allowYTransCheck,
      doYAxisTransformation: doYaxisTransCheck,
    });
  };

  toggleOptionsPopup = (e, obj, close) => {
    if (close) {
      const self = this;
      // timeout needed so optionsOpen still true briefly on scatterplot click
      setTimeout(function () {
        self.setState({ optionsOpen: false });
      }, 10);
    } else {
      this.setState({ optionsOpen: true });
    }
  };

  toggleUsagePopup = (e, obj, close) => {
    if (close) {
      this.setState({ usageOpen: false });
    } else {
      this.setState({ usageOpen: true });
    }
  };

  render() {
    const {
      allowXTransformation,
      allowYTransformation,
      axisLabels,
      doXAxisTransformation,
      doYAxisTransformation,
      optionsOpen,
      usageOpen,
      volcanoCircleLabel,
      volcanoCircleLabels,
      xAxisLabel,
      yAxisLabel,
    } = this.state;

    const {
      differentialStudy,
      differentialModel,
      differentialTest,
      plotMultiFeatureAvailable,
      differentialFeatureIdKey,
      differentialHighlightedFeatures,
      differentialOutlinedFeature,
      differentialResults,
      differentialResultsUnfiltered,
      differentialResultsTableStreaming,
      differentialTableData,
      filteredDifferentialTableData,
      isFilteredDifferential,
      upperPlotsHeight,
      volcanoPlotVisible,
      volcanoWidth,
    } = this.props;

    if (
      !differentialResultsTableStreaming &&
      differentialFeatureIdKey != null &&
      xAxisLabel !== null &&
      yAxisLabel !== null
    ) {
      const xAxisTransformBox = (
        <Form.Field
          control={Checkbox}
          name="xTransformationCheckbox"
          className="VolcanoTransformationCheckbox"
          checked={doXAxisTransformation}
          disabled={!allowXTransformation}
          onClick={this.handleTransformationChange}
        ></Form.Field>
      );
      const yAxisTransformBox = (
        <Form.Field
          control={Checkbox}
          name="yTransformationCheckbox"
          className="VolcanoTransformationCheckbox"
          checked={doYAxisTransformation}
          disabled={!allowYTransformation}
          onClick={this.handleTransformationChange}
        ></Form.Field>
      );
      const TableValuePopupStyle = {
        backgroundColor: '2E2E2E',
        borderBottom: '2px solid var(--color-primary)',
        color: '#FFF',
        padding: '1em',
        maxWidth: '50vw',
        fontSize: '13px',
        wordBreak: 'break-all',
      };
      const PlotName = `${differentialStudy}_${differentialModel}_${differentialTest}_scatter`;
      return (
        <>
          <span
            id="VolcanoOptionsPopup"
            className={volcanoPlotVisible ? 'Show' : 'Hide'}
          >
            <Popup
              trigger={
                <Button
                  size="mini"
                  onClick={this.toggleOptionsPopup}
                  // className={volcanoWidth > 325 ? '' : 'OptionsPadding'}
                >
                  <Icon name="options" className="ViewPlotOptions" />
                  {/* {volcanoWidth > 325 ? 'OPTIONS' : ''} */}
                  OPTIONS
                </Button>
              }
              // style={StudyPopupStyle}
              id="OptionsTooltip"
              position="bottom left"
              basic
              on="click"
              inverted
              open={optionsOpen}
              onClose={(e) => this.toggleOptionsPopup(e, null, true)}
              closeOnDocumentClick
              closeOnEscape
            >
              <Popup.Content
                id="VolcanoOptionsPopupContent"
                className={volcanoPlotVisible ? 'Show' : 'Hide'}
              >
                <Grid>
                  <Grid.Row
                    className={
                      volcanoPlotVisible
                        ? 'Show VolcanoPlotAxisSelectorsRow'
                        : 'Hide VolcanoPlotAxisSelectorsRow'
                    }
                  >
                    <Grid.Column
                      className="VolcanoPlotFilters"
                      id="xAxisSelector"
                      mobile={14}
                      tablet={14}
                      computer={14}
                      largeScreen={14}
                      widescreen={14}
                    >
                      <>
                        <Form>
                          <Form.Group inline>
                            <Popup
                              trigger={
                                <Label className="VolcanoAxisLabel">
                                  LABELS
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
                              value={volcanoCircleLabel}
                              options={volcanoCircleLabels}
                              onChange={this.handleDropdownChange}
                            ></Form.Field>
                          </Form.Group>
                          <Form.Group inline>
                            <Label className="VolcanoAxisLabel NoSelect">
                              X AXIS
                            </Label>
                            <Form.Field
                              control={Select}
                              name="xAxisSelector"
                              className="axisSelector NoSelect"
                              id="xAxisSelector"
                              value={xAxisLabel || ''}
                              options={axisLabels}
                              onChange={this.handleDropdownChange}
                            ></Form.Field>
                            <Popup
                              trigger={xAxisTransformBox}
                              style={TableValuePopupStyle}
                              content="-log10 Transform, X Axis"
                              inverted
                              basic
                            />
                          </Form.Group>
                          <Form.Group inline>
                            <Label className="VolcanoAxisLabel NoSelect">
                              Y AXIS
                            </Label>
                            <Form.Field
                              control={Select}
                              name="yAxisSelector"
                              id="yAxisSelector"
                              className="axisSelector"
                              value={yAxisLabel || ''}
                              options={axisLabels}
                              onChange={this.handleDropdownChange}
                            ></Form.Field>
                            <Popup
                              trigger={yAxisTransformBox}
                              style={TableValuePopupStyle}
                              content="-log10 Transform, Y Axis"
                              inverted
                              basic
                            />
                          </Form.Group>
                        </Form>
                      </>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
              </Popup.Content>
            </Popup>
          </span>
          <span
            id="VolcanoUsagePopup"
            className={volcanoPlotVisible ? 'Show' : 'Hide'}
          >
            <Popup
              trigger={
                <Button
                  size="mini"
                  onClick={this.toggleUsagePopup}
                  // className={volcanoWidth > 325 ? '' : 'UsagePadding'}
                >
                  <Icon name="info" className="ViewPlotUsage" />
                  {/* {volcanoWidth > 325 ? 'USAGE GUIDE' : ''} */}
                  USAGE GUIDE
                </Button>
              }
              // style={StudyPopupStyle}
              id="UsageTooltip"
              position="bottom left"
              basic
              on="click"
              inverted
              open={usageOpen}
              onClose={(e) => this.toggleUsagePopup(e, null, true)}
              closeOnDocumentClick
              closeOnEscape
              hideOnScroll
            >
              <Popup.Content
                id="VolcanoUsagePopupContent"
                className={volcanoPlotVisible ? 'Show' : 'Hide'}
              >
                {/* <Header as="h4">Scatter Plot Controls</Header>
                <Divider /> */}
                <List inverted>
                  <List.Item>
                    <Icon name="zoom in" />
                    <List.Content>
                      <List.Header>Zoom In / Filter Data</List.Header>
                      <List.Description>
                        Click and drag (box select)
                      </List.Description>
                    </List.Content>
                  </List.Item>
                  <List.Item>
                    <Icon name="zoom out" />
                    <List.Content>
                      <List.Header>Zoom Out</List.Header>
                      <List.Description>
                        Double click on an area without circles
                      </List.Description>
                    </List.Content>
                  </List.Item>
                  <List.Item>
                    <Icon name="remove" />
                    <List.Content>
                      <List.Header>Remove Plot Selection</List.Header>
                      <List.Description>
                        Single click on an area without circles
                      </List.Description>
                    </List.Content>
                  </List.Item>
                  <List.Item>
                    <Icon name="circle outline" id="OutlinedCircleIcon" />
                    <List.Content>
                      <List.Header>Plot A Single Feature</List.Header>
                      <List.Description>
                        Click a circle (blue outline)
                      </List.Description>
                    </List.Content>
                  </List.Item>
                  {plotMultiFeatureAvailable ? (
                    <List.Item>
                      <Icon name="circle" id="SelectedCircleIcon" />
                      <List.Content>
                        <List.Header>Plot Multiple Features</List.Header>
                        <List.Description>
                          Control-click circle/s, or hold Shift while
                          box-selecting (orange fill)
                        </List.Description>
                      </List.Content>
                    </List.Item>
                  ) : null}
                </List>
              </Popup.Content>
            </Popup>
          </span>
          <div
            id="VolcanoPlotDiv"
            className={volcanoPlotVisible ? 'Show' : 'Hide'}
          >
            <ButtonActions
              exportButtonSize="mini"
              plotName={PlotName}
              plot="VolcanoChart"
              excelVisible={false}
              pdfVisible={false}
              pngVisible={true}
              svgVisible={true}
            />
          </div>
          <ScatterPlot
            // state
            doXAxisTransformation={doXAxisTransformation}
            doYAxisTransformation={doYAxisTransformation}
            optionsOpen={optionsOpen}
            volcanoCircleLabel={volcanoCircleLabel}
            xAxisLabel={xAxisLabel}
            yAxisLabel={yAxisLabel}
            // props
            differentialFeatureIdKey={differentialFeatureIdKey}
            differentialHighlightedFeatures={differentialHighlightedFeatures}
            differentialOutlinedFeature={differentialOutlinedFeature}
            differentialResults={differentialResults}
            differentialResultsUnfiltered={differentialResultsUnfiltered}
            differentialResultsTableLoading={
              this.props.differentialResultsTableLoading
            }
            differentialResultsTableStreaming={
              differentialResultsTableStreaming
            }
            differentialTableData={differentialTableData}
            filteredDifferentialTableData={filteredDifferentialTableData}
            differentialTest={differentialTest}
            isFilteredDifferential={isFilteredDifferential}
            multisetFiltersVisibleParentRef={
              this.props.multisetFiltersVisibleParentRef
            }
            plotMultiFeatureAvailable={plotMultiFeatureAvailable}
            upperPlotsHeight={upperPlotsHeight}
            volcanoPlotVisible={volcanoPlotVisible}
            volcanoWidth={volcanoWidth}
            // functional props
            onHandleVolcanoPlotSelectionChange={
              this.props.onHandleVolcanoPlotSelectionChange
            }
            onHandleDotClick={this.props.onHandleDotClick}
            onPageToFeature={this.props.onPageToFeature}
            onHandleHighlightedFeaturesDifferential={
              this.props.onHandleHighlightedFeaturesDifferential
            }
            onHandleUpdateDifferentialResults={
              this.props.onHandleUpdateDifferentialResults
            }
            onResetDifferentialOutlinedFeature={
              this.props.onResetDifferentialOutlinedFeature
            }
            onReloadMultifeaturePlot={this.props.onReloadMultifeaturePlot}
            upperPlotsVisible={this.props.upperPlotsVisible}
          />
        </>
      );
    } else {
      return (
        <div
          className={
            volcanoPlotVisible
              ? 'Show PlotInstructions'
              : 'Hide PlotInstructions'
          }
        >
          <Dimmer active inverted>
            <Loader size="large">Loading Data</Loader>
          </Dimmer>
        </div>
      );
    }
  }
}

export default ScatterPlotDiv;
