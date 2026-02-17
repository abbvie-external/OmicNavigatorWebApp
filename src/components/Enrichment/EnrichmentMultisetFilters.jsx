import React, { Component, Fragment } from 'react';
import { Form, Select, Input } from 'semantic-ui-react';
import * as d3 from 'd3';
import { maxLinesWidth, measureTextWidth } from '../Shared/svgTextMeasure';
import '../Shared/MultisetFilters.scss';
import NumericExponentialInput from '../Shared/NumericExponentialInput';

class EnrichmentMultisetFilters extends Component {
  componentDidMount() {
    this.makeMultiset();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      this.props.multisetFiltersVisibleEnrichment !==
        prevProps.multisetFiltersVisibleEnrichment ||
      this.props.mustEnrichment !== prevProps.mustEnrichment ||
      this.props.notEnrichment !== prevProps.notEnrichment ||
      this.props.uAnchor !== prevProps.uAnchor ||
      this.props.uSettings !== prevProps.uSettings ||
      this.props.metaSvg !== prevProps.metaSvg ||
      this.props.sigValue !== prevProps.sigValue ||
      this.props.sigValue.length !== prevProps.sigValue.length ||
      this.props.selectedCol !== prevProps.selectedCol ||
      this.props.selectedOperator !== prevProps.selectedOperator ||
      this.props.multisetTestsFilteredOut.length !==
        prevProps.multisetTestsFilteredOut.length ||
      this.props.numElements !== prevProps.numElements ||
      this.props.maxElements !== prevProps.maxElements
    ) {
      this.makeMultiset();
    }
  }

  makeMultiset = () => {
    const { multisetFiltersVisibleEnrichment, uSettings } = this.props;
    if (multisetFiltersVisibleEnrichment) {
      d3.selectAll('#multiset-query').selectAll('*').remove();
      const base = d3
        .selectAll('#multiset-query')
        .append('div')
        .style('padding-bottom', '5px');

      if (uSettings.displayMetaData) {
        this.prepareMultiset(base);
        const baseMetaSvg = base
          .append('div')
          .attr('class', 'SidebarWideSvg')
          .append('svg');
        this.metaScript(baseMetaSvg);
      }
    } else {
      d3.selectAll('#filter-tests').selectAll('*').remove();
      const base = d3
        .selectAll('#filter-tests')
        .append('div')
        .style('padding-bottom', '5px');
      this.prepareTestFilter(base);
    }
  };

  metaScript = (metaSvg) => {
    const {
      uAnchor,
      uSettings,
      selectedOperator,
      sigValue,
      mustEnrichment,
      notEnrichment,
    } = this.props;

    const heightScalar = 15;
    const svgHeight =
      notEnrichment.length * heightScalar +
      mustEnrichment.length * heightScalar +
      94;
    const useAnchor = uSettings.useAnchor;
    const setDescP = [];
    const notSetDescP = [];

    for (var i = 0; i < selectedOperator.length; i++) {
      switch (selectedOperator[i].value) {
        case '<':
          setDescP.push(`less than ${sigValue[i]} in:`);
          notSetDescP.push(`not less than ${sigValue[i]} in:`);
          break;
        case '>':
          setDescP.push(`greater than ${sigValue[i]} in:`);
          notSetDescP.push(`not greater than ${sigValue[i]} in:`);
          break;
        case '|<|':
          setDescP.push(`absolute value less than ${sigValue[i]} in:`);
          notSetDescP.push(`absolute value not less than ${sigValue[i]} in:`);
          break;
        case '|>|':
          setDescP.push(`absolute value greater than ${sigValue[i]} in:`);
          notSetDescP.push(
            `absolute value not greater than ${sigValue[i]} in:`,
          );
          break;
        default:
      }
    }
    const fontFamily = 'Lato,Arial,Helvetica,sans-serif';
    const font15 = `15px ${fontFamily}`;
    const font14 = `14px ${fontFamily}`;
    const font13 = `13px ${fontFamily}`;
    const svgWidth = (() => {
      const lines = [{ text: 'Set Composition:', font: font15 }]
        .concat(setDescP.map((t) => ({ text: t, font: font15 })))
        .concat(useAnchor ? [{ text: uAnchor, font: font13 }] : [])
        .concat(mustEnrichment.map((t) => ({ text: t, font: font13 })))
        .concat(notSetDescP.map((t) => ({ text: t, font: font14 })))
        .concat(notEnrichment.map((t) => ({ text: t, font: font13 })));

      const maxTextW = maxLinesWidth(lines, font14);
      return Math.max(315, maxTextW + 55);
    })();

    //Reset the svg
    metaSvg.selectAll('text').remove();
    metaSvg.selectAll('circle').remove();
    metaSvg.selectAll('rect').remove();
    if (
      mustEnrichment.length !== 0 ||
      notEnrichment.length !== 0 ||
      useAnchor
    ) {
      metaSvg.attr('width', svgWidth).attr('height', svgHeight);

      metaSvg
        .append('text')
        .attr('x', 0)
        .attr('y', 15)
        .text('Set Composition:')
        .attr('font-family', 'Lato,Arial,Helvetica,sans-serif')
        .attr('font-size', '15px')
        .attr('fill', 'black');
      if (mustEnrichment.length !== 0 || useAnchor) {
        metaSvg
          .selectAll('dataObject')
          .data(setDescP)
          .enter()
          .append('text')
          .attr('x', 7)
          .attr('y', function (d, i) {
            return 30 + heightScalar * i;
          })
          .text(function (d) {
            return d;
          })
          .attr('font-family', 'Lato,Arial,Helvetica,sans-serif')
          .attr('font-size', '14px')
          .attr('fill', 'black');
      }

      if (useAnchor) {
        metaSvg
          .append('circle')
          .style('fill', 'green')
          .attr('cx', 17)
          .attr('cy', function () {
            return 30 + heightScalar * setDescP.length;
          })
          .attr('r', 4);
        metaSvg
          .append('text')
          .attr('x', 25)
          .attr('y', function () {
            return 30 + heightScalar * setDescP.length + 4;
          })
          .text(uAnchor)
          .attr('font-family', 'Lato,Arial,Helvetica,sans-serif')
          .attr('font-size', '13px')
          .attr('fill', 'black');
      }

      metaSvg
        .selectAll('dataObject')
        .data(mustEnrichment)
        .enter()
        .append('circle')
        .style('fill', 'green')
        .attr('cx', 17)
        .attr('cy', function (d, i) {
          if (!useAnchor) {
            return (
              30 +
              heightScalar * setDescP.length +
              mustEnrichment.indexOf(d) * heightScalar
            );
          } else {
            return (
              30 +
              heightScalar * setDescP.length +
              (mustEnrichment.indexOf(d) + 1) * heightScalar
            );
          }
        })
        .attr('r', 4);

      // const mustText =
      metaSvg
        .selectAll('svg.dataObject')
        .data(mustEnrichment)
        .enter()
        .append('text')
        .attr('x', 25)
        .attr('y', function (d) {
          if (!useAnchor) {
            return (
              30 +
              heightScalar * setDescP.length +
              mustEnrichment.indexOf(d) * heightScalar +
              4
            );
          } else {
            return (
              30 +
              heightScalar * setDescP.length +
              (mustEnrichment.indexOf(d) + 1) * heightScalar +
              4
            );
          }
        })
        .text(function (d) {
          return d;
        })
        .attr('font-family', 'Lato,Arial,Helvetica,sans-serif')
        .attr('font-size', '13px')
        .attr('fill', 'black');

      if (notEnrichment.length !== 0) {
        metaSvg
          .selectAll('dataObject')
          .data(notSetDescP)
          .enter()
          .append('text')
          .attr('x', 7)
          .attr('y', function (d, i) {
            if (!useAnchor && mustEnrichment.length === 0) {
              return 30 + heightScalar * i;
            } else {
              return (
                30 +
                4 +
                heightScalar * setDescP.length +
                (i + mustEnrichment.length) * heightScalar
              );
            }
          })
          .text(function (d) {
            return d;
          })
          .attr('font-family', 'Lato,Arial,Helvetica,sans-serif')
          .attr('font-size', '14px')
          .attr('fill', 'black');

        // const notTestCircles =
        metaSvg
          .selectAll('dataObject')
          .data(notEnrichment)
          .enter()
          .append('circle')
          .style('fill', 'red')
          .attr('cx', 17)
          .attr('cy', function (d, i) {
            if (!useAnchor && mustEnrichment.length === 0) {
              return 30 + heightScalar * (i + notSetDescP.length);
            } else {
              return (
                30 +
                4 +
                heightScalar *
                  (i +
                    setDescP.length +
                    notSetDescP.length +
                    mustEnrichment.length)
              );
            }
          })
          .attr('r', 4);

        // const notText =
        metaSvg
          .selectAll('svg.dataObject')
          .data(notEnrichment)
          .enter()
          .append('text')
          .attr('x', 25)
          .attr('y', function (d, i) {
            if (!useAnchor && mustEnrichment.length === 0) {
              return 30 + 4 + heightScalar * (i + notSetDescP.length);
            } else {
              return (
                30 +
                8 +
                heightScalar *
                  (i +
                    setDescP.length +
                    notSetDescP.length +
                    mustEnrichment.length)
              );
            }
          })
          .text(function (d) {
            return d;
          })
          .attr('font-family', 'Lato,Arial,Helvetica,sans-serif')
          .attr('font-size', '13px')
          .attr('fill', 'black');
      }
    }
  };

  prepareMultiset = (base) => {
    const {
      multisetTestsFilteredOut,
      uData,
      uAnchor,
      uSettings,
      mustEnrichment,
      notEnrichment,
      numElements,
      maxElements,
    } = this.props;

    const self = this;
    let dataset = uData;
    // let dataset = { ...uData };
    if (uSettings.useAnchor && dataset.indexOf(uAnchor) < 0) {
      dataset.unshift(uAnchor);
    }

    // Sizing
    let heightScalar = 1;
    if (uSettings.heightScalar != null) {
      heightScalar = uSettings.heightScalar;
    }

    const circlePadding = 8 * heightScalar;
    const circleRadius = 12 * heightScalar;
    const topBoxHeight = 45 * heightScalar;
    const svgHeight =
      dataset.length * 2 * circleRadius +
      (dataset.length + 1) * circlePadding +
      topBoxHeight;

    const minWidth = 250 * heightScalar;

    // Set the width of the svg based on actual rendered text width (industry-standard)
    // so long test names are never clipped; horizontal scroll will appear when needed.
    const circlesWidth = 4 * circlePadding + 6 * circleRadius;

    const labelFontSizePx = Math.round(heightScalar * 14);
    const labelFontFamily = 'Lato,Arial,Helvetica,sans-serif';
    const labelFontNormal = `${labelFontSizePx}px ${labelFontFamily}`;
    const labelFontBold = `bold ${labelFontSizePx}px ${labelFontFamily}`;

    // Include the "x of maxElements" suffix, since that can be longer than the base test name.
    let maxLabelWidthPx = 0;
    for (let i = 0; i < dataset.length; i++) {
      const d = dataset[i];
      const dText = numElements !== maxElements ? `${d} of ${maxElements}` : d;
      const font = d === uAnchor ? labelFontBold : labelFontNormal;
      maxLabelWidthPx = Math.max(
        maxLabelWidthPx,
        measureTextWidth(dText, font),
      );
    }

    let svgWidth = circlesWidth + maxLabelWidthPx + 24;
    if (svgWidth < minWidth) {
      svgWidth = minWidth;
    }
    let textElementWidth = svgWidth - circlesWidth;

    //Colors
    // let chosenColorCode = '#00FF40';
    let chosenColorCode = 'var(--color-primary)';
    let baseColorCode = '#585858';
    let backgroundColorCode = '#E6E6E6';
    //Adding settings colors
    if (uSettings.colors != null) {
      if (uSettings.colors.chosen != null) {
        chosenColorCode = uSettings.colors.chosen;
      }
      if (uSettings.colors.base != null) {
        baseColorCode = uSettings.colors.base;
      }
      if (uSettings.colors.background != null) {
        backgroundColorCode = uSettings.colors.background;
      }
    }

    // const topBox =
    base.append('div').style('padding-bottom', '5px');

    const svgWrapper = base.append('div').attr('class', 'SidebarWideSvg');

    const svg = svgWrapper
      .append('svg')
      .attr('width', svgWidth)
      .attr('height', svgHeight)
      .style('padding-bottom', '5px');

    // const rect =
    svg
      .append('path')
      .attr(
        'd',
        rightRoundedRect(
          0,
          topBoxHeight,
          svgWidth,
          svgHeight - topBoxHeight,
          20,
        ),
      )
      .attr('fill', 'white');

    function rightRoundedRect(x, y, width, height, radius) {
      return (
        'M' +
        x +
        ',' +
        y +
        'h' +
        (width - radius) +
        'a' +
        radius +
        ',' +
        radius +
        ' 0 0 1 ' +
        radius +
        ',' +
        radius +
        'v' +
        (height - 2 * radius) +
        'a' +
        radius +
        ',' +
        radius +
        ' 0 0 1 ' +
        -radius +
        ',' +
        radius +
        'h' +
        (radius - width) +
        'z'
      );
    }

    const mustCircles = svg
      .selectAll('svg.dataGreenObject')
      .data(dataset)
      .enter()
      .append('circle')
      .style('opacity', function (d) {
        return multisetTestsFilteredOut.includes(d) ? 0.5 : 1;
      })
      .style('fill', baseColorCode)
      .attr('class', 'SetCircle')
      .attr('cx', circlePadding + circleRadius)
      .attr('cy', function (d) {
        return (
          dataset.indexOf(d) * (2 * circleRadius) +
          (topBoxHeight + circleRadius + circlePadding) +
          dataset.indexOf(d) * circlePadding
        );
      })
      .attr('r', circleRadius)
      .style('stroke', (d) =>
        mustEnrichment.includes(d) || d === uAnchor
          ? chosenColorCode
          : 'transparent',
      )
      .attr('stroke-width', circleRadius / 5)
      .on('click', function (d) {
        if (!multisetTestsFilteredOut.includes(d)) {
          if (!mustEnrichment.includes(d) && d !== uAnchor) {
            let mustEnrichmentCopy = [...mustEnrichment];
            let notEnrichmentCopy = [...notEnrichment];
            mustEnrichmentCopy.push(d);
            if (notEnrichmentCopy.includes(d)) {
              notEnrichmentCopy.splice(notEnrichmentCopy.indexOf(d), 1);
            }
            updateCircles();
            self.props.onHandleSetChange(mustEnrichmentCopy, notEnrichmentCopy);
          }
        }
      });

    const maybeCircles = svg
      .selectAll('svg.dataObject')
      .data(dataset)
      .enter()
      .append('circle')
      .style('opacity', function (d) {
        return multisetTestsFilteredOut.includes(d) ? 0.5 : 1;
      })
      .style('fill', backgroundColorCode)
      .attr('class', 'SetCircle')
      .attr('cx', 2 * circlePadding + 3 * circleRadius)
      .attr('cy', function (d) {
        return (
          dataset.indexOf(d) * (2 * circleRadius) +
          (topBoxHeight + circleRadius + circlePadding) +
          dataset.indexOf(d) * circlePadding
        );
      })
      .attr('r', circleRadius)
      .style('stroke', (d) =>
        !notEnrichment.includes(d) &&
        !mustEnrichment.includes(d) &&
        d !== uAnchor
          ? chosenColorCode
          : baseColorCode,
      )
      .attr('stroke-width', circleRadius / 5)
      .on('click', function (d) {
        if (!multisetTestsFilteredOut.includes(d)) {
          let mustEnrichmentCopy = [...mustEnrichment];
          let notEnrichmentCopy = [...notEnrichment];
          if (mustEnrichmentCopy.includes(d) && d !== uAnchor) {
            mustEnrichmentCopy.splice(mustEnrichmentCopy.indexOf(d), 1);
          }
          if (notEnrichmentCopy.includes(d) && d !== uAnchor) {
            notEnrichmentCopy.splice(notEnrichmentCopy.indexOf(d), 1);
          }
          updateCircles();
          self.props.onHandleSetChange(mustEnrichmentCopy, notEnrichmentCopy);
        }
      });

    // const miniMaybeCircles =
    svg
      .selectAll('svg.dataObject')
      .data(dataset)
      .enter()
      .append('circle')
      .style('opacity', function (d) {
        return multisetTestsFilteredOut.includes(d) ? 0.5 : 1;
      })
      .style('fill', baseColorCode)
      .attr('class', 'SetCircle')
      .attr('cx', 2 * circlePadding + 3 * circleRadius)
      .attr('cy', function (d) {
        return (
          dataset.indexOf(d) * (2 * circleRadius) +
          (topBoxHeight + circleRadius + circlePadding) +
          dataset.indexOf(d) * circlePadding
        );
      })
      .attr('r', circleRadius / 3)
      .on('click', function (d) {
        if (!multisetTestsFilteredOut.includes(d)) {
          let mustEnrichmentCopy = [...mustEnrichment];
          let notEnrichmentCopy = [...notEnrichment];
          if (mustEnrichmentCopy.includes(d) && d !== uAnchor) {
            mustEnrichmentCopy.splice(mustEnrichmentCopy.indexOf(d), 1);
          }
          if (notEnrichmentCopy.includes(d) && d !== uAnchor) {
            notEnrichmentCopy.splice(notEnrichmentCopy.indexOf(d), 1);
          }
          updateCircles();
          self.props.onHandleSetChange(mustEnrichmentCopy, notEnrichmentCopy);
        }
      });

    const notCircles = svg
      .selectAll('svg.dataObject')
      .data(dataset)
      .enter()
      .append('circle')
      .style('fill', backgroundColorCode)
      .style('opacity', function (d) {
        return multisetTestsFilteredOut.includes(d) ? 0.5 : 1;
      })
      .attr('class', 'SetCircle')
      .attr('cx', 3 * circlePadding + 5 * circleRadius)
      .attr('cy', function (d) {
        return (
          dataset.indexOf(d) * (2 * circleRadius) +
          (topBoxHeight + circleRadius + circlePadding) +
          dataset.indexOf(d) * circlePadding
        );
      })
      .attr('r', circleRadius)
      .style('stroke', (d) =>
        notEnrichment.includes(d) && d !== uAnchor
          ? chosenColorCode
          : 'transparent',
      )
      .attr('stroke-width', circleRadius / 5)
      .on('click', function (d) {
        if (!multisetTestsFilteredOut.includes(d)) {
          let mustEnrichmentCopy = [...mustEnrichment];
          let notEnrichmentCopy = [...notEnrichment];
          if (!notEnrichmentCopy.includes(d) && d !== uAnchor) {
            notEnrichmentCopy.push(d);
            if (mustEnrichmentCopy.includes(d)) {
              mustEnrichmentCopy.splice(mustEnrichmentCopy.indexOf(d), 1);
            }
            updateCircles();
            self.props.onHandleSetChange(mustEnrichmentCopy, notEnrichmentCopy);
          }
        }
      });

    // const lineVert =
    svg
      .append('line')
      .attr('x1', 4 * circlePadding + 6 * circleRadius)
      .attr('x2', 4 * circlePadding + 6 * circleRadius)
      .attr('y1', topBoxHeight)
      .attr('y2', svgHeight)
      .attr('stroke', 'black')
      .attr('stroke-width', 5);

    // const testElements =
    svg
      .selectAll('svg.dataObject')
      .data(dataset)
      .enter()
      .append('text')
      .attr('x', 5 * circlePadding + 6 * circleRadius)
      .attr('y', function (d) {
        return (
          dataset.indexOf(d) * (2 * circleRadius) +
          (topBoxHeight + circleRadius + circlePadding) +
          dataset.indexOf(d) * circlePadding +
          circleRadius / 2
        );
      })
      .text(function (d) {
        return d;
      })
      .style('opacity', function (d) {
        return multisetTestsFilteredOut.includes(d) ? 0.5 : 1;
      })
      .attr('font-family', 'Lato,Arial,Helvetica,sans-serif')
      .attr('font-weight', (d) => (d === uAnchor ? 'bold' : 'normal'))
      .attr('font-size', function () {
        return heightScalar * 14 + 'px';
      })
      .attr('fill', 'black');

    //Test filtering check boxes
    if (uSettings.useTestCheckBoxes) {
      svg
        .selectAll('svg.dataObject')
        .data(dataset)
        .enter()
        .append('foreignObject')
        .attr('x', svgWidth - 20)
        .attr('y', function (d) {
          return (
            dataset.indexOf(d) * (2 * circleRadius) +
            (topBoxHeight + circleRadius + circlePadding) +
            dataset.indexOf(d) * circlePadding +
            circleRadius / 2 -
            14
          );
        })
        .attr('width', 20)
        .attr('height', 20)
        .append('xhtml:div')
        .append('div')
        .attr('class', 'checkboxMultiset')
        .append('input')
        .attr('type', 'checkbox')
        .property('checked', function (d) {
          return !multisetTestsFilteredOut.includes(d);
        })
        .on('change', function (d) {
          self.props.onFilterOutChange(d);
        });
    }

    svg
      .append('text')
      .attr('x', circlePadding + circleRadius)
      .attr('y', topBoxHeight - 4)
      .attr(
        'transform',
        'rotate(' +
          305 +
          ',' +
          (circlePadding + circleRadius) +
          ',' +
          (topBoxHeight - 4) +
          ')',
      )
      .text('Must')
      .attr('font-family', 'Lato,Arial,Helvetica,sans-serif')
      .attr('font-size', function () {
        return heightScalar * 14 + 'px';
      })
      .attr('fill', 'black');
    svg
      .append('text')
      .attr('x', 2 * circlePadding + 3 * circleRadius)
      .attr('y', topBoxHeight - 4)
      .attr(
        'transform',
        'rotate(' +
          305 +
          ',' +
          (2 * circlePadding + 3 * circleRadius) +
          ',' +
          (topBoxHeight - 4) +
          ')',
      )
      .text('Maybe')
      .attr('font-family', 'Lato,Arial,Helvetica,sans-serif')
      .attr('font-size', function () {
        return heightScalar * 14 + 'px';
      })
      .attr('fill', 'black');
    svg
      .append('text')
      .attr('x', 3 * circlePadding + 5 * circleRadius)
      .attr('y', topBoxHeight - 4)
      .attr(
        'transform',
        'rotate(' +
          305 +
          ',' +
          (3 * circlePadding + 5 * circleRadius) +
          ',' +
          (topBoxHeight - 4) +
          ')',
      )
      .text('Not')
      .attr('font-family', 'Lato,Arial,Helvetica,sans-serif')
      .attr('font-size', function () {
        return heightScalar * 14 + 'px';
      })
      .attr('fill', 'black');
    if (numElements != null && maxElements != null) {
      // const numElementsLine =
      svg
        .append('line')
        .attr('class', 'numElements')
        .attr('x1', 4 * circlePadding + 6 * circleRadius)
        .attr('x2', function () {
          return (
            4 * circlePadding +
            6 * circleRadius +
            (textElementWidth - 85 * heightScalar) *
              (numElements / maxElements) +
            3
          );
        })
        .attr('y1', topBoxHeight - 10 * heightScalar)
        .attr('y2', topBoxHeight - 10 * heightScalar)
        .attr('stroke', chosenColorCode)
        .attr('stroke-width', 10 * heightScalar);

      const numElementsVar = svg
        .selectAll('svg.dataObject')
        .data([numElements])
        .enter()
        .append('text')
        .attr('class', 'numElements')
        .attr('x', function () {
          return (
            4 * circlePadding +
            6 * circleRadius +
            (textElementWidth - 85 * heightScalar) *
              (numElements / maxElements) +
            6
          );
        })
        .attr('y', topBoxHeight - 6 * heightScalar);

      // const numElementsText =
      numElementsVar
        .text(function (d) {
          const dText =
            numElements !== maxElements ? `${d} of ${maxElements}` : d;
          return dText;
        })
        .attr('font-family', 'Lato,Arial,Helvetica,sans-serif')
        .attr('font-size', function () {
          return heightScalar * 13 + 'px';
        })
        .attr('fill', 'black');
    }

    //Building the lock on the anchor circle
    if (uSettings.useAnchor) {
      svg
        .append('circle')
        .style('fill', baseColorCode)
        .attr('cx', circlePadding + circleRadius)
        .attr(
          'cy',
          topBoxHeight - 1 + circleRadius + circlePadding - circleRadius / 6,
        )
        .attr('r', circleRadius / 6)
        .style('stroke', 'white')
        .attr('stroke-width', circleRadius / 7);
      svg
        .append('rect')
        .style('fill', 'white')
        .attr('x', circlePadding + circleRadius - circleRadius / 3)
        .attr(
          'y',
          topBoxHeight + circleRadius + circlePadding - circleRadius / 6,
        )
        .attr('width', (circleRadius * 2) / 3)
        .attr('height', (circleRadius * 2) / 3);
    }

    function updateCircles() {
      mustCircles
        .style('stroke', (d) =>
          mustEnrichment.includes(d) || d === uAnchor
            ? chosenColorCode
            : 'transparent',
        )
        .attr('stroke-width', circleRadius / 5);
      maybeCircles
        .style('stroke', (d) =>
          !notEnrichment.includes(d) &&
          !mustEnrichment.includes(d) &&
          d !== uAnchor
            ? chosenColorCode
            : baseColorCode,
        )
        .attr('stroke-width', circleRadius / 5);
      notCircles
        .style('stroke', (d) =>
          notEnrichment.includes(d) ? chosenColorCode : 'transparent',
        )
        .attr('stroke-width', circleRadius / 5);
    }
  };
  prepareTestFilter(base) {
    const { multisetTestsFilteredOut, uData, uAnchor } = this.props;
    const self = this;
    let dataset = uData;
    const textScalar = 20;

    // Size SVG width based on real rendered text widths (not character-count guesses).
    const fontFamily = 'Lato,Arial,Helvetica,sans-serif';
    const fontNormal = `14px ${fontFamily}`;
    const fontBold = `bold 14px ${fontFamily}`;

    let maxLabelWidthPx = 0;
    for (let i = 0; i < dataset.length; i++) {
      const d = dataset[i];
      const font = d === uAnchor ? fontBold : fontNormal;
      maxLabelWidthPx = Math.max(maxLabelWidthPx, measureTextWidth(d, font));
    }

    // Left padding (x=10) + checkbox column (~25) + right padding.
    const svgWidth = Math.max(132, 10 + maxLabelWidthPx + 40);
    const svgHeight = dataset.length * textScalar + textScalar / 2;
    base.append('div').style('padding-bottom', '5px');

    const svgWrapper = base.append('div').attr('class', 'SidebarWideSvg');

    const svg = svgWrapper
      .append('svg')
      .attr('width', svgWidth)
      .attr('height', svgHeight)
      .style('padding-bottom', '5px');

    // const rect =
    svg
      .append('path')
      .attr('d', rightRoundedRect(0, 0, svgWidth + 20, svgHeight, 20))
      .attr('fill', 'white');
    function rightRoundedRect(x, y, width, height, radius) {
      return (
        'M' +
        x +
        ',' +
        y +
        'h' +
        (width - radius) +
        'a' +
        radius +
        ',' +
        radius +
        ' 0 0 1 ' +
        radius +
        ',' +
        radius +
        'v' +
        (height - 2 * radius) +
        'a' +
        radius +
        ',' +
        radius +
        ' 0 0 1 ' +
        -radius +
        ',' +
        radius +
        'h' +
        (radius - width) +
        'z'
      );
    }
    svg
      .selectAll('svg.dataObject')
      .data(dataset)
      .enter()
      .append('text')
      .attr('x', 10)
      .attr('y', function (d) {
        return dataset.indexOf(d) * textScalar + 18;
      })
      .text(function (d) {
        return d;
      })
      .style('opacity', function (d) {
        return multisetTestsFilteredOut.includes(d) ? 0.5 : 1;
      })
      .attr('font-family', 'Lato,Arial,Helvetica,sans-serif')
      .attr('font-weight', (d) => (d === uAnchor ? 'bold' : 'normal'))
      .attr('font-size', function () {
        return 14 + 'px';
      })
      .attr('fill', 'black');

    svg
      .selectAll('svg.dataObject')
      .data(dataset)
      .enter()
      .append('foreignObject')
      .attr('x', svgWidth - 25)
      .attr('y', function (d) {
        return dataset.indexOf(d) * textScalar + 6;
      })
      .attr('width', 20)
      .attr('height', 20)
      .append('xhtml:div')
      .append('div')
      .attr('class', 'checkboxMultiset')
      .append('input')
      .attr('type', 'checkbox')
      .property('checked', function (d) {
        return !multisetTestsFilteredOut.includes(d);
      })
      .on('change', function (d) {
        self.props.onFilterOutChange(d);
      });
  }

  addFilter = () => {
    this.props.onAddFilter();
  };

  removeFilter = (index) => {
    this.props.onRemoveFilter(index);
  };

  changeHoveredFilter = (index) => {
    this.props.onChangeHoveredFilter(index);
  };

  render() {
    const { sigValue, selectedOperator, uSettings } = this.props;
    const Columns = uSettings.thresholdCols;
    const Operators = uSettings.thresholdOperator;
    const SelOp = selectedOperator;
    const indexFilters = uSettings.indexFilters;
    // const defaultSigValue = uSettings.defaultSigValue;
    // const hoveredFilter = uSettings.hoveredFilter;
    // for now, column is displayed as label, just matching the "nominal" or "adjusted" p value type
    const SelColOverride =
      this.props.pValueType === 'nominal'
        ? 'Nominal P Value'
        : 'Adjusted P Value';
    if (this.props.multisetFiltersVisibleEnrichment) {
      return (
        <Fragment>
          <Form className="MultisetDropdownContainer">
            <ul style={{ padding: '0px' }}>
              {indexFilters.map((index) => (
                <Form.Group
                  key={index}
                  onMouseEnter={() => this.changeHoveredFilter(index)}
                  onMouseLeave={() => this.changeHoveredFilter(-1)}
                >
                  <Form.Field
                    control={Input}
                    readOnly
                    label={index === 0 ? 'Column' : ''}
                    name="selectedCol"
                    className="ThresholdColumnReadOnly"
                    index={index}
                    value={SelColOverride}
                    options={Columns}
                    width={7}
                  ></Form.Field>
                  <Form.Field
                    control={Select}
                    label={index === 0 ? 'Operator' : ''}
                    name="selectedOperator"
                    className="ThresholdOperatorSelect"
                    index={index}
                    // selection
                    value={SelOp[index].value}
                    options={Operators}
                    width={5}
                    onChange={this.props.onHandleOperatorChange}
                  ></Form.Field>
                  <Form.Field width={4} id="SignificantValueInputMultisetE">
                    <label>{index === 0 ? 'Value' : ''}</label>
                    <NumericExponentialInput
                      className="SignificantValueInput"
                      onChange={this.props.onHandleSigValueEInputChange}
                      min={1e-100}
                      max={1}
                      preventNegatives={true}
                      name="sigValue"
                      // defaultValue={sigValue[index]}
                      value={sigValue[index]}
                    />
                  </Form.Field>
                </Form.Group>
              ))}
            </ul>
          </Form>
          <p id="multiset-query" className="MultisetQueryContainer"></p>
        </Fragment>
      );
    } else {
      return <p id="filter-tests" className="FilterTestsContainer"></p>;
    }
  }
}

export default EnrichmentMultisetFilters;
