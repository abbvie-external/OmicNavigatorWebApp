import React, { Component } from 'react';
import ButtonActions from '../Shared/ButtonActions';
import { Icon, Popup } from 'semantic-ui-react';
import './BarcodePlot.scss';
import * as d3 from 'd3';

class BarcodePlot extends Component {
  state = {
    switch: 0,
    barcodeWidth: 0,
    barcodeContainerWidth: 0,
    xScale: null,
    hoveredLineId: null,
    hoveredLineName: null,
    highlightedLineName: null,
    tooltipPosition: null,
    tooltipPositionMax: null,
    tooltipTextAnchor: 'start',
    tooltipTextAnchorMax: 'start',
    displayElementTextBarcode:
      JSON.parse(sessionStorage.getItem('displayElementTextBarcode')) || false,
    settings: {
      // brushing: false,
      bottomLabel: '',
      barcodeHeight: 0,
      margin: {
        top: 65,
        right: 40,
        bottom: 20,
        left: 20,
        hovered: 45,
        selected: 45,
        highlighted: 25,
        max: 15,
      },
    },
  };

  barcodeContainerRef = React.createRef();

  barcodeSVGRef = React.createRef();

  componentDidMount() {
    this.setWidth(true, false);
    let resizedFn;
    window.addEventListener('resize', () => {
      clearTimeout(resizedFn);
      resizedFn = setTimeout(() => {
        this.windowResized();
      }, 200);
    });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      this.props.horizontalSplitPaneSize !== prevProps.horizontalSplitPaneSize
    ) {
      this.setWidth(false, true);
    }
    if (this.props.HighlightedProteins !== prevProps.HighlightedProteins) {
      if (!this.state.initialLoad) {
        d3.selectAll(`.MaxLine`)
          .attr('y1', this.state.settings.margin.selected)
          .attr('style', 'stroke:#838383;strokeWidth: 1.5;opacity: 0.5')
          .classed('MaxLine', false);
        d3.selectAll(`.HighlightedLine`)
          .attr('y1', this.state.settings.margin.selected)
          .attr('style', 'stroke:#838383;strokeWidth: 1.5;opacity: 0.5')
          .classed('HighlightedLine', false);
        d3.selectAll(`.selected`)
          .attr('y1', this.state.settings.margin.selected)
          .attr('style', 'stroke:#2c3b78;strokeWidth: 2.5;opacity: 1');
        if (this.props.HighlightedProteins.length > 0) {
          const HighlightedProteinsCopy = [...this.props.HighlightedProteins];
          const MaxFeatureData = HighlightedProteinsCopy[0];
          const OtherFeatures = HighlightedProteinsCopy.slice(1);
          OtherFeatures.forEach(element => {
            const lineId = `${element.featureID}`;
            const OtherHighlighted = d3.select(
              `line[id='barcode-line-${lineId}']`,
            );
            OtherHighlighted.classed('HighlightedLine', true)
              .attr('y1', this.state.settings.margin.highlighted)
              .attr('style', 'stroke:#ff7e38;stroke-width:3');
          });
          const MaxFeatureId = MaxFeatureData.featureID;
          const MaxFeatureElement = d3.select(
            `line[id='barcode-line-${MaxFeatureId}']`,
          );
          if (MaxFeatureElement != null) {
            MaxFeatureElement.classed('MaxLine', true)
              .attr('y1', this.state.settings.margin.max)
              .attr('style', 'stroke:#FF4400;stroke-width:3.5');
            const MaxFeatureLineData = {
              x2: MaxFeatureElement.attr('x2') || null,
              featureID: MaxFeatureElement.attr('featureid') || null,
              lineID: MaxFeatureElement.attr('lineid') || null,
              logFC: MaxFeatureElement.attr('logfc') || null,
              statistic: MaxFeatureElement.attr('statistic') || null,
            };
            const statistic = MaxFeatureLineData.statistic;
            const textAnchorMax =
              statistic > this.props.barcodeSettings.highStat / 2
                ? 'end'
                : 'start';
            const ttPositionMax =
              textAnchorMax === 'end'
                ? MaxFeatureLineData.x2 - 5
                : MaxFeatureLineData.x2 + 5;
            this.setState({
              hoveredLineId: null,
              hoveredLineName: null,
              highlightedLineName: MaxFeatureLineData.lineID,
              tooltipPositionMax: ttPositionMax,
              tooltipTextAnchorMax: textAnchorMax,
            });
          }
        }
      }
      this.setState({ initialLoad: false });
    }
  }

  windowResized = () => {
    this.setWidth(false, true);
  };

  setWidth = (initialBrush, resized) => {
    const { settings } = this.state;
    const containerWidth = this.getWidth();
    const width = containerWidth - settings.margin.left - settings.margin.right;
    this.setState({
      barcodeContainerWidth: containerWidth,
      barcodeWidth: width,
    });

    const barcodeHeight =
      this.props.horizontalSplitPaneSize -
      this.state.settings.margin.top -
      this.state.settings.margin.bottom;
    this.setupBrush(
      width,
      barcodeHeight,
      this.state.settings,
      initialBrush,
      resized,
    );
  };

  getWidth() {
    if (this.barcodeContainerRef.current !== null) {
      return this.barcodeContainerRef.current.parentElement.offsetWidth;
    }
    return 1200;
  }

  handleLineEnter = event => {
    const lineIdMult = event.target.attributes[6].nodeValue;
    const lineName = event.target.attributes[7].nodeValue;
    const lineStatistic = event.target.attributes[9].nodeValue;
    const textAnchor =
      lineStatistic > this.props.barcodeSettings.highStat / 1.5
        ? 'end'
        : 'start';
    const textPosition =
      textAnchor === 'end'
        ? event.target.attributes[2].nodeValue - 5
        : event.target.attributes[2].nodeValue + 5;
    const lineId = `#barcode-line-${lineIdMult}`;
    const hoveredLine = d3.select(`line[id='barcode-line-${lineIdMult}']`);
    // const hoveredLine = d3.select(lineId);
    if (hoveredLine.attr('class').endsWith('selected')) {
      hoveredLine.attr('y1', this.state.settings.margin.selected - 10);
    } else if (hoveredLine.attr('class').endsWith('MaxLine')) {
      hoveredLine.attr('y1', this.state.settings.margin.max);
    } else if (hoveredLine.attr('class').endsWith('HighlightedLine')) {
      hoveredLine.attr('y1', this.state.settings.margin.highlighted - 10);
    } else {
      hoveredLine
        .classed('HoveredLine', true)
        .attr('y1', this.state.settings.margin.hovered);
    }
    if (lineIdMult !== this.state.highlightedLineName) {
      this.setState({
        hoveredLineId: lineId,
        hoveredLineName: lineName,
      });
    }
    this.setState({
      tooltipPosition: textPosition,
      tooltipTextAnchor: textAnchor,
    });
  };

  handleLineLeave = () => {
    const hoveredLine = d3.select(this.state.hoveredLineId);
    if (!hoveredLine.empty()) {
      if (hoveredLine.attr('class').endsWith('selected')) {
        hoveredLine.attr('y1', this.state.settings.margin.selected);
      } else if (hoveredLine.attr('class').endsWith('MaxLine')) {
        hoveredLine.attr('y1', this.state.settings.margin.max);
      } else if (hoveredLine.attr('class').endsWith('HighlightedLine')) {
        hoveredLine.attr('y1', this.state.settings.margin.highlighted);
      } else {
        hoveredLine
          .classed('HoveredLine', false)
          .attr('y1', this.state.settings.margin.top);
      }
    }

    this.setState({
      hoveredLineId: null,
      hoveredLineName: null,
      tooltipPosition: null,
      tooltipTextAnchor: null,
    });
  };

  getMaxObject(array) {
    if (array) {
      const max = Math.max.apply(
        Math,
        array.map(function(o) {
          return o.statistic;
        }),
      );
      const obj = array.find(function(o) {
        return o.statistic === max;
      });
      return obj;
    }
  }
  setupBrush(barcodeWidth, barcodeHeight, settings, initialBrush, resized) {
    const self = this;
    self.resized = resized;
    let objsBrush = {};

    // Remove existing brushes
    if (d3.selectAll('.barcodeBrush').nodes().length > 0) {
      d3.selectAll('.barcodeBrush').remove();
    }

    objsBrush = d3
      .brushX()
      .extent([
        [settings.margin.left + 4, 0],
        [barcodeWidth + 15, Math.round(barcodeHeight * 0.5)],
      ])
      .on('start', function() {
        if (!self.resized || d3.event.sourceEvent?.composed) {
          self.setState({
            highlightedLineName: null,
            hoveredLineId: null,
            hoveredLineName: null,
          });
        }
      })
      .on('brush', function() {
        if (!self.resized || d3.event.sourceEvent?.composed) {
          const selection = d3.event?.selection || null;
          if (selection != null) {
            const brushedLines = d3.brushSelection(this);
            const isBrushed = function(brushedLines, x) {
              const xMin = brushedLines[0];
              const xMax = brushedLines[1];
              const brushTest = xMin <= x && x <= xMax;
              return brushTest;
            };

            const lines = d3
              .selectAll('line.barcode-line')
              .attr('y1', settings.margin.top)
              .attr('style', 'stroke:#838383;stroke-width: 1.5;opacity: 0.5')
              .classed('selectedReference', false)
              .classed('selected', false)
              .classed('MaxLine', false);
            const brushed = lines
              .filter(function() {
                const x = d3.select(this).attr('x1');
                return isBrushed(brushedLines, x);
              })
              .attr('y1', settings.margin.selected)
              .attr('style', 'stroke:#2c3b78;stroke-width: 2.5;opacity: 1')
              .classed('selectedReference', true)
              .classed('selected', true);
            const brushedArr = brushed._groups[0];
            const brushedDataVar = brushedArr.map(a => {
              return {
                x2: a.attributes[2].nodeValue,
                featureID: a.attributes[6].nodeValue,
                lineID: a.attributes[7].nodeValue,
                logFC: a.attributes[8].nodeValue,
                statistic: a.attributes[9].nodeValue,
                class: a.attributes[1].nodeValue,
              };
            });
            const brushedDataTooltips = brushedDataVar.map(line => {
              const textAnchor =
                line.statistic > self.props.barcodeSettings.highStat / 2
                  ? 'end'
                  : 'start';
              var ttPosition = null;
              if (textAnchor === 'end') {
                ttPosition = line.x2 - 5;
              } else {
                ttPosition = line.x2 + 5;
              }
              const fiveLevelSwitch = (self.state.switch + 1) % 5;
              self.setState({ switch: fiveLevelSwitch });
              let alternatePosition = 0;
              if (self.state.switch === 0) {
                alternatePosition = 0;
              } else if (self.state.switch === 1) {
                alternatePosition = 10;
              } else if (self.state.switch === 2) {
                alternatePosition = 20;
              } else if (self.state.switch === 3) {
                alternatePosition = 30;
              } else {
                alternatePosition = 40;
              }

              return (
                <text
                  id={`${line.featureID}-barcodeTooltip`}
                  key={`${line.featureID}-barcodeTooltip`}
                  className="BarcodeTooltipText"
                  transform={`translate(${ttPosition}, ${alternatePosition})rotate(0)`}
                  fontSize="11px"
                  textAnchor={textAnchor}
                  fontFamily="Lato, Helvetica Neue, Arial, Helvetica, sans-serif"
                >
                  {line.featureID}
                </text>
              );
            });
            self.props.onHandleBarcodeChanges({
              brushedData: brushedDataVar,
            });
            if (brushedDataVar.length > 0) {
              const maxLineObject = self.getMaxObject(brushedDataVar);
              const maxLineId = `${maxLineObject.lineID}`;
              const maxLine = d3.select(`line[id='barcode-line-${maxLineId}']`);
              maxLine
                .classed('MaxLine', true)
                .attr('style', 'stroke:#FF4400;stroke-width:3.5')
                .attr('y1', settings.margin.max);
              const statistic = maxLineObject.statistic;
              const textAnchorMax =
                statistic > self.props.barcodeSettings.highStat / 2
                  ? 'end'
                  : 'start';
              const ttPositionMax =
                textAnchorMax === 'end'
                  ? maxLineObject.x2 - 5
                  : maxLineObject.x2 + 5;
              self.setState({
                hoveredLineId: null,
                hoveredLineName: null,
                highlightedLineName: maxLineObject.lineID,
                tooltipPositionMax: ttPositionMax,
                tooltipTextAnchorMax: textAnchorMax,
                allTooltips: brushedDataTooltips,
              });
            }
          }
        }
      })
      .on('end', function() {
        if (!self.resized || d3.event.sourceEvent?.composed) {
          const selection = d3.event?.selection || null;
          if (selection != null) {
            if (self.props.barcodeSettings.brushedData.length > 0) {
              const maxLineData = self.getMaxObject(
                self.props.barcodeSettings.brushedData,
              );
              const maxLineDataArr = [maxLineData];
              const highlightedLineArray = maxLineDataArr.map(function(m) {
                return {
                  sample: m.lineID,
                  featureID: m.featureID,
                  cpm: m.statistic,
                  // logfc: m.cpm,
                };
              });
              self.props.onHandleProteinSelected(highlightedLineArray);
            } else {
              self.props.onHandleProteinSelected([]);
              self.setState({
                tooltipPosition: null,
                tooltipTextAnchor: null,
                highlightedLineName: null,
              });
            }
          }
        }
      });

    d3.selectAll('.x.barcode-axis')
      .append('g')
      .attr('class', 'barcodeBrush')
      .call(objsBrush);

    if (initialBrush) {
      const quartileTicks = d3.selectAll('line').filter(function() {
        return d3.select(this).attr('id');
      });
      const quartile = Math.round(quartileTicks.nodes().length * 0.25);
      setTimeout(function() {
        d3.select('.barcodeBrush').call([objsBrush][0].move, [
          quartileTicks.nodes()[quartile].getAttribute('x1'),
          quartileTicks.nodes()[0].getAttribute('x1'),
        ]);
      }, 500);
      d3.select('.barcodeBrush rect.overlay').remove();
    } else {
      // reposition the brushed rect on window resize, or horizontal pane resize
      const selectedTicks = d3.selectAll('line').filter(function() {
        return d3.select(this).classed('selectedReference');
      });
      const highestTickIndex = selectedTicks.nodes().length - 1;
      if (highestTickIndex >= 0) {
        d3.select('.barcodeBrush').call([objsBrush][0].move, [
          selectedTicks.nodes()[highestTickIndex].getAttribute('x1'),
          selectedTicks.nodes()[0].getAttribute('x1'),
        ]);
      }
      d3.select('.barcodeBrush rect.overlay').remove();
    }
  }

  getTooltip = () => {
    const { hoveredLineName, tooltipPosition } = this.state;
    if (tooltipPosition) {
      if (hoveredLineName) {
        return (
          <text
            className="BarcodeTooltipText"
            // transform={`translate(${tooltipPosition}, 15)rotate(-45)`}
            transform={`translate(${tooltipPosition}, 13)`}
            fontSize="14px"
            textAnchor="end"
            fontFamily="Lato, Helvetica Neue, Arial, Helvetica, sans-serif"
          >
            {hoveredLineName}
          </text>
        );
      }
    }
  };

  getMaxTooltip = () => {
    const {
      // tooltipPosition,
      highlightedLineName,
      tooltipPositionMax,
      tooltipTextAnchorMax,
    } = this.state;
    if (
      tooltipPositionMax &&
      highlightedLineName &&
      this.props.HighlightedProteins.length > 0
    ) {
      return (
        <text
          className="BarcodeTooltipText"
          // transform={`translate(${tooltipPosition}, 15)rotate(-45)`}
          transform={`translate(${tooltipPositionMax}, 15)`}
          fontSize="14px"
          textAnchor={tooltipTextAnchorMax}
          fontFamily="Lato, Helvetica Neue, Arial, Helvetica, sans-serif"
        >
          {highlightedLineName}
        </text>
      );
    }
    return null;
  };

  handleElementTextChange = () => {
    sessionStorage.setItem(
      'displayElementTextBarcode',
      !this.state.displayElementTextBarcode,
    );
    this.setState(prevState => ({
      displayElementTextBarcode: !prevState.displayElementTextBarcode,
    }));
  };

  render() {
    const {
      barcodeWidth,
      barcodeContainerWidth,
      settings,
      allTooltips,
      displayElementTextBarcode,
    } = this.state;

    const { horizontalSplitPaneSize, barcodeSettings } = this.props;
    const barcodeHeight =
      horizontalSplitPaneSize - settings.margin.top - settings.margin.bottom;

    const xScale = d3
      .scaleLinear()
      .domain([0, barcodeSettings.highStat])
      .range([5, barcodeWidth - 5]);

    const xAxisTicks = xScale.ticks().map(value => ({
      value,
      xOffset: xScale(value),
    }));
    const barcodeTicks = xAxisTicks.map(({ value, xOffset }) => (
      <g
        key={value}
        className="individualTick"
        transform={`translate(${xOffset + 20}, ${barcodeHeight})`}
      >
        <line y2="8" stroke="currentColor" />
        <text
          key={value}
          style={{
            fontSize: '12px',
            textAnchor: 'middle',
            transform: 'translateY(20px)',
            fontFamily: 'Lato, Helvetica Neue, Arial, Helvetica, sans-serif',
          }}
        >
          {value}
        </text>
      </g>
    ));
    // example data:
    // featureDisplay: "RPL24_T83"
    // featureEnrichment: "RPL24"
    // featureID: "17747_1"
    // logFoldChange: 0
    // statistic: 19.0484
    const barcodeLines = barcodeSettings.barcodeData.map(d => (
      <line
        id={`barcode-line-${d.featureID}`}
        className="barcode-line"
        style={{ stroke: '#838383', strokeWidth: 1.5, opacity: 0.5 }}
        key={`${d.featureID}`}
        x1={xScale(d.statistic) + settings.margin.left}
        x2={xScale(d.statistic) + settings.margin.left}
        y1={settings.margin.top}
        y2={barcodeHeight}
        featureid={d.featureID}
        lineid={d.featureDisplay}
        logfc={d.logFoldChange}
        statistic={d.statistic}
        onMouseEnter={e => this.handleLineEnter(e)}
        onMouseLeave={this.handleLineLeave}
        // cursor="crosshair"
      />
    ));

    const tooltip = this.getTooltip();
    const maxTooltip = this.getMaxTooltip();
    return (
      <div ref={this.barcodeContainerRef} id="BarcodeChartContainer">
        <div className="export-container">
          <ButtonActions
            exportButtonSize={'mini'}
            excelVisible={false}
            pngVisible={true}
            pdfVisible={false}
            svgVisible={true}
            txtVisible={false}
            plot="BarcodeChart"
            description={this.props.plotDataEnrichment.key}
          />
        </div>
        <span className="TextToggleButton">
          <Popup
            trigger={
              <Icon
                name="font"
                size="small"
                inverted
                circular
                onClick={this.handleElementTextChange}
                id={displayElementTextBarcode ? 'PrimaryBackground' : 'black'}
              />
            }
            style={{
              backgroundColor: '#2E2E2E',
              borderBottom: '2px solid var(--color-primary)',
              color: '#FFF',
              padding: '1em',
              fontSize: '13px',
            }}
            className=""
            basic
            content={displayElementTextBarcode ? 'Hide Labels' : 'Show Labels'}
          />
        </span>
        <svg
          ref={this.barcodeSVGRef}
          id="BarcodeChart"
          height={horizontalSplitPaneSize}
          width={barcodeContainerWidth}
          viewBox={`0 0 ${barcodeContainerWidth} ${horizontalSplitPaneSize}`}
          preserveAspectRatio="xMinYMin meet"
        >
          {/* X Axis */}
          <path
            d={`M 25 ${barcodeHeight} H ${barcodeWidth + 15}`}
            stroke="currentColor"
          />
          {/* X Axis Ticks */}
          {barcodeTicks}
          {/* X Axis Label */}
          <text
            className="BarcodeLabel"
            fontWeight={600}
            fontSize={15}
            transform={`translate(${barcodeWidth / 2}, ${barcodeHeight + 35})`}
            textAnchor="middle"
            fontFamily="Lato, Helvetica Neue, Arial, Helvetica, sans-serif"
          >
            {barcodeSettings.statLabel}
          </text>
          {/* Semantic UI Button */}
          {/* <div
        x="-100"
        y="15"> */}

          {/* </div> */}
          {/* Y Axis Left Label */}
          <text
            className="BarcodeLabel"
            fontWeight={600}
            fontSize={15}
            transform="rotate(-90)"
            y={15}
            x={-barcodeHeight}
            fontFamily="Lato, Helvetica Neue, Arial, Helvetica, sans-serif"
          >
            {barcodeSettings.lowLabel}
          </text>
          {/* Y Axis Right Label */}
          <text
            className="BarcodeLabel"
            fontWeight={600}
            fontSize={15}
            transform="rotate(-90)"
            y={barcodeWidth + 27}
            x={-barcodeHeight}
            fontFamily="Lato, Helvetica Neue, Arial, Helvetica, sans-serif"
          >
            {barcodeSettings.highLabel}
          </text>
          <g className="x barcode-axis" />
          {/* Barcode Lines & Tooltip */}
          {barcodeLines}
          {tooltip}
          {displayElementTextBarcode ? allTooltips : maxTooltip}
        </svg>
      </div>
    );
  }
}

export default BarcodePlot;
