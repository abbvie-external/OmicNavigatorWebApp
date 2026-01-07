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
    autoMaxAssigned: false,
    allTooltips: null,
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
        highlighted: 30,
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

    const HighlightedProteins = this.props.HighlightedProteins || [];
    const selectedProteinId = this.props.selectedProteinId;

    if (this.props.HighlightedProteins !== prevProps.HighlightedProteins) {
      if (!this.state.initialLoad) {
        d3.selectAll(`.HighlightedLine`)
          .attr('y1', this.state.settings.margin.selected)
          .attr('style', 'stroke:#838383;strokeWidth: 1.5;opacity: 0.5')
          .classed('HighlightedLine', false);
        d3.selectAll(`.selected`)
          .attr('y1', this.state.settings.margin.selected)
          .attr('style', 'stroke:#2c3b78;strokeWidth: 2.5;opacity: 1');
        if (this.props.HighlightedProteins.length > 0) {
          const HighlightedProteinsCopy = [...this.props.HighlightedProteins];
          HighlightedProteinsCopy.forEach((element) => {
            const lineId = `${element.featureID}`;
            const OtherHighlighted = d3.select(
              `line[id='barcode-line-${lineId}']`,
            );
            if (!OtherHighlighted.empty()) {
              OtherHighlighted.classed('HighlightedLine', true)
                .attr('y1', this.state.settings.margin.highlighted)
                .attr('style', 'stroke:#ff7e38;stroke-width:3;opacity:1');
            }
          });
        }
      }

      this.setState({
        hoveredLineId: null,
        hoveredLineName: null,
        highlightedLineName: null,
        tooltipPositionMax: null,
        tooltipTextAnchorMax: null,
      });

      this.setState({ initialLoad: false });

      // Multi changed, but single might still be active → re-apply single style on top
      if (selectedProteinId) {
        this.applySingleSelectedStyle(selectedProteinId, HighlightedProteins);
      }
    }

    // --- SINGLE-SELECTION (BLUE) UPDATE ---
    if (selectedProteinId !== prevProps.selectedProteinId) {
      // Revert previous single-selected line back to its multi/default style
      this.resetPreviousSingleSelected(
        prevProps.selectedProteinId,
        HighlightedProteins,
      );

      // Apply styling to the new single-selected line (if any)
      if (selectedProteinId) {
        this.applySingleSelectedStyle(selectedProteinId, HighlightedProteins);
      }
    }
  }

  /**
   * Resets the styling of a previously selected line in the barcode plot
   *
   * This method removes the single selection styling from a line and applies the
   * appropriate styling based on its current state (highlighted, brushed, or neither).
   *
   * @param {string} prevSelectedId - The ID of the previously selected protein/feature
   * @param {Array} highlightedProteins - List of currently highlighted proteins
   * @returns {void} - Returns early if prevSelectedId is falsy or the line doesn't exist
   */
  resetPreviousSingleSelected(prevSelectedId, highlightedProteins = []) {
    if (!prevSelectedId) return;

    const line = d3.select(`line[id='barcode-line-${prevSelectedId}']`);
    if (line.empty()) return;

    line.classed('SingleSelectedLine', false);

    // Check if this line is still in highlighted proteins
    const isHighlighted = highlightedProteins.some(
      (p) => p.featureID === prevSelectedId,
    );

    // Check if this line is in brushed data
    const isBrushed = this.props.barcodeSettings.brushedData.some(
      (item) => item.featureID === prevSelectedId,
    );

    if (isHighlighted) {
      // Still highlighted → use orange style
      line
        .classed('HighlightedLine', true)
        .attr('y1', this.state.settings.margin.highlighted)
        .attr('style', 'stroke:#ff7e38;stroke-width:3;opacity:1');
    } else if (isBrushed) {
      // In brushed data but not highlighted → use blue selection style
      line
        .classed('selected', true)
        .attr('y1', this.state.settings.margin.selected)
        .attr('style', 'stroke:#2c3b78;stroke-width:2.5;opacity:1');
    } else {
      // Not in any selection → reset to base grey
      line
        .attr('y1', this.state.settings.margin.top)
        .attr('style', 'stroke:#838383;stroke-width:1.5;opacity:0.5');
    }
  }

  /**
   * Applies styling to a single selected protein line in a barcode visualization.
   *
   * @param {string} selectedId - The ID of the selected protein feature to style.
   * @param {Array} highlightedProteins - An array of proteins that are currently highlighted in the visualization.
   *                                     Default is an empty array if no proteins are highlighted.
   * @returns {void} - Returns early if no selectedId is provided or if the line element doesn't exist.
   *
   * This method styles a selected protein line in the barcode visualization by:
   * 1. Adding the 'SingleSelectedLine' CSS class to the line
   * 2. Setting its vertical position based on margin settings
   * 3. Applying different styling based on whether the protein is also in the highlighted set:
   *    - Orange color (#ff7e38) if the protein is also highlighted
   *    - Blue color (#0066f5) if the protein is only selected but not highlighted
   * Both styling options use increased stroke width (3.5) and full opacity (1).
   */
  applySingleSelectedStyle(selectedId, highlightedProteins = []) {
    if (!selectedId) return;

    const line = d3.select(`line[id='barcode-line-${selectedId}']`);
    if (line.empty()) return;
    const isHighlighted = highlightedProteins.some(
      (p) => p.featureID === selectedId,
    );

    line.classed('SingleSelectedLine', true);

    // If it's also part of the multi set, keep its vertical position from multi
    let y1 = this.state.settings.margin.max;
    if (isHighlighted) {
      line
        .attr('y1', y1)
        .attr('style', 'stroke:#ff7e38;stroke-width:3.5;opacity:1');
    } else {
      line
        .attr('y1', y1)
        .attr('style', 'stroke:#0066f5;stroke-width:3.5;opacity:1');
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

  handleLineEnter = (event) => {
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

    if (hoveredLine.attr('class').endsWith('selected')) {
      hoveredLine.attr('y1', this.state.settings.margin.selected - 10);
    } else if (hoveredLine.attr('class').endsWith('SingleSelectedLine')) {
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
      } else if (hoveredLine.attr('class').endsWith('SingleSelectedLine')) {
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
        array.map(function (o) {
          return o.statistic;
        }),
        5,
      );
      const obj = array.find(function (o) {
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
      .on('start', function () {
        if (!self.resized || d3.event.sourceEvent?.composed) {
          self.setState({
            highlightedLineName: null,
            hoveredLineId: null,
            hoveredLineName: null,
          });
        }
      })
      .on('brush', function () {
        if (!self.resized || d3.event.sourceEvent?.composed) {
          const selection = d3.event?.selection || null;
          if (selection != null) {
            const brushedLines = d3.brushSelection(this);
            const isBrushed = function (brushedLines, x) {
              const xMin = brushedLines[0];
              const xMax = brushedLines[1];
              return xMin <= x && x <= xMax;
            };

            const lines = d3.selectAll('line.barcode-line');

            lines.each(function () {
              const lineSel = d3.select(this);
              const x = parseFloat(lineSel.attr('x1'));
              if (!isBrushed(brushedLines, x)) {
                lineSel
                  .classed('selectedReference', false)
                  .classed('selected', false)
                  .classed('MaxLine', false)
                  .classed('SingleSelectedLine', false)
                  .classed('HighlightedLine', false)
                  .attr('y1', settings.margin.top)
                  .attr('style', 'stroke:#838383;stroke-width:1.5;opacity:0.5');
              }
            });

            // Apply blue style to brushed lines
            const brushed = lines.filter(function () {
              const x = parseFloat(d3.select(this).attr('x1'));
              return isBrushed(brushedLines, x);
            });

            brushed.each(function () {
              const lineSel = d3.select(this);
              const className = lineSel.attr('class') || '';
              const isSingleSelected = className.includes('SingleSelectedLine');
              const isHighlighted = className.includes('HighlightedLine');

              if (!isSingleSelected && !isHighlighted) {
                lineSel
                  .classed('selectedReference', true)
                  .classed('selected', true)
                  .attr('y1', settings.margin.selected)
                  .attr('style', 'stroke:#2c3b78;stroke-width:2.5;opacity:1');
              }
            });

            const brushedArr = brushed._groups[0];
            const brushedDataVar = brushedArr.map((a) => {
              return {
                x2: a.attributes[2].nodeValue,
                featureID: a.attributes[6].nodeValue,
                lineID: a.attributes[7].nodeValue,
                logFC: a.attributes[8].nodeValue,
                statistic: a.attributes[9].nodeValue,
                class: a.attributes[1].nodeValue,
              };
            });
            const brushedDataTooltips = brushedDataVar.map((line) => {
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

            self.lastBrushedData = brushedDataVar;

            self.setState({
              allTooltips: brushedDataTooltips,
            });

            self.props.onHandleBarcodeChanges({
              brushedData: brushedDataVar,
            });
          }
        }
      })
      .on('end', function () {
        if (!self.resized || d3.event.sourceEvent?.composed) {
          const selection = d3.event?.selection || null;
          if (selection != null) {
            const brushedData = self.props.barcodeSettings.brushedData || [];
            const brushedIds = new Set(brushedData.map((d) => d.featureID));

            const HighlightedProteins = self.props.HighlightedProteins || [];
            const selectedProteinId = self.props.selectedProteinId;

            if (
              selectedProteinId &&
              !brushedIds.has(selectedProteinId) &&
              self.props.onHandleSingleProteinSelected
            ) {
              self.props.onHandleSingleProteinSelected(null);
            }

            if (self.props.onHandleProteinSelected) {
              const filteredMulti = HighlightedProteins.filter((p) =>
                brushedIds.has(p.featureID),
              );
              self.props.onHandleProteinSelected(filteredMulti);
            }

            if (brushedData.length > 0) {
              const maxLineData = self.getMaxObject(brushedData);
              if (
                initialBrush &&
                self.props.onHandleSingleProteinSelected &&
                !self.props.selectedProteinId &&
                !self.state.autoMaxAssigned
              ) {
                self.props.onHandleSingleProteinSelected(maxLineData.featureID);
                self.setState({
                  autoMaxAssigned: true,
                });
              }
            } else {
              if (self.props.onHandleProteinSelected) {
                self.props.onHandleProteinSelected([]);
              }
              if (self.props.onHandleSingleProteinSelected) {
                self.props.onHandleSingleProteinSelected(null);
              }
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
      const quartileTicks = d3.selectAll('line').filter(function () {
        return d3.select(this).attr('id');
      });
      const quartile = Math.round(quartileTicks.nodes().length * 0.25);
      setTimeout(function () {
        d3.select('.barcodeBrush').call([objsBrush][0].move, [
          quartileTicks.nodes()[quartile]?.getAttribute('x1'),
          quartileTicks.nodes()[0]?.getAttribute('x1'),
        ]);
      }, 500);
      d3.select('.barcodeBrush rect.overlay').remove();
    } else {
      // reposition the brushed rect on window resize, or horizontal pane resize
      const selectedTicks = d3.selectAll('line').filter(function () {
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
    const { hoveredLineName, tooltipPosition, tooltipTextAnchor } = this.state;
    if (tooltipPosition && hoveredLineName) {
      return (
        <text
          className="BarcodeTooltipText"
          transform={`translate(${tooltipPosition}, 13)`}
          fontSize="14px"
          textAnchor={tooltipTextAnchor || 'end'}
          fontFamily="Lato, Helvetica Neue, Arial, Helvetica, sans-serif"
        >
          {hoveredLineName}
        </text>
      );
    }
    return null;
  };

  getSingleSelectedTooltip = () => {
    const { selectedProteinId } = this.props;
    if (!selectedProteinId) return null;

    // Find the line and get its information
    const line = d3.select(`line[id='barcode-line-${selectedProteinId}']`);
    if (line.empty()) return null;

    const featureName = line.attr('lineid');
    const xPosition = line.attr('x2');
    const statistic = line.attr('statistic');

    // Calculate text anchor position similar to tooltip
    const textAnchor =
      statistic > this.props.barcodeSettings.highStat / 2 ? 'end' : 'start';
    const ttPosition = textAnchor === 'end' ? xPosition - 5 : +xPosition + 5;

    return (
      <text
        className="BarcodeTooltipText"
        transform={`translate(${ttPosition}, 15)`}
        fontSize="14px"
        textAnchor={textAnchor}
        fontFamily="Lato, Helvetica Neue, Arial, Helvetica, sans-serif"
      >
        {featureName}
      </text>
    );
  };

  handleElementTextChange = () => {
    sessionStorage.setItem(
      'displayElementTextBarcode',
      !this.state.displayElementTextBarcode,
    );
    this.setState((prevState) => ({
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
      .domain([barcodeSettings.lowStat, barcodeSettings.highStat])
      .range([5, barcodeWidth - 5]);

    const xAxisTicks = xScale.ticks().map((value) => ({
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
    const barcodeLines = barcodeSettings.barcodeData?.map((d) => (
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
        onMouseEnter={(e) => this.handleLineEnter(e)}
        onMouseLeave={this.handleLineLeave}
        // cursor="crosshair"
      />
    ));

    const tooltip = this.getTooltip();
    const maxTooltip = this.getSingleSelectedTooltip();
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
            position="bottom center"
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
