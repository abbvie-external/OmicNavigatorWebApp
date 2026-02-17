import React, { Component, Fragment } from 'react';
import { Form, Select, Icon, Button } from 'semantic-ui-react';
import * as d3 from 'd3';
import { maxLinesWidth, measureTextWidth } from '../Shared/svgTextMeasure';

import NumericExponentialInput from '../Shared/NumericExponentialInput';
// import { ExponentialNumberInput } from '../Shared/ExponentialNumberInput';
import '../Shared/MultisetFilters.scss';

class DifferentialMultisetFilters extends Component {
  componentDidMount() {
    this.makeMultiset();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      this.props.multisetFiltersVisibleDifferential &&
      (this.props.mustDifferential !== prevProps.mustDifferential ||
        this.props.notDifferential !== prevProps.notDifferential ||
        this.props.uDataP !== prevProps.uDataP ||
        this.props.uAnchorP !== prevProps.uAnchorP ||
        this.props.uSettingsP !== prevProps.uSettingsP ||
        this.props.metaSvgP !== prevProps.metaSvgP ||
        this.props.sigValueP !== prevProps.sigValueP ||
        this.props.sigValueP.length !== prevProps.sigValueP.length ||
        this.props.selectedColP !== prevProps.selectedColP ||
        this.props.selectedOperatorP !== prevProps.selectedOperatorP ||
        this.props.numElementsP !== prevProps.numElementsP ||
        this.props.maxElementsP !== prevProps.maxElementsP)
    ) {
      this.makeMultiset();
    }
  }

  makeMultiset = () => {
    d3.selectAll('#multiset-query-p').selectAll('*').remove();
    const baseP = d3
      .selectAll('#multiset-query-p')
      .append('div')
      .style('padding-bottom', '5px');

    if (this.props.uSettingsP.displayMetaDataP) {
      this.prepareMultiset(baseP);
      const baseMetaSvgP = baseP
        .append('div')
        .attr('class', 'SidebarWideSvg')
        .append('svg');
      this.metaScript(baseMetaSvgP);
    }
  };

  metaScript = (metaSvgP) => {
    const {
      uAnchorP,
      uSettingsP,
      sigValueP,
      selectedColP,
      selectedOperatorP,
      mustDifferential,
      notDifferential,
    } = this.props;
    const heightScalarP = 15;
    const svgHeightP =
      notDifferential.length * heightScalarP +
      mustDifferential.length * heightScalarP +
      60 +
      10 +
      24;
    const useAnchorP = uSettingsP.useAnchorP;
    const setDescP = [];
    const notSetDescP = [];
    for (var i = 0; i < selectedOperatorP.length; i++) {
      if (!selectedColP.length || !sigValueP.length) return '';
      switch (selectedOperatorP[i].value) {
        case '<':
          setDescP.push(
            `${selectedColP[i].text} less than ${sigValueP[i]} in:`,
          );
          notSetDescP.push(
            `${selectedColP[i].text} not less than ${sigValueP[i]} in:`,
          );
          break;
        case '>':
          setDescP.push(
            `${selectedColP[i].text} greater than ${sigValueP[i]} in:`,
          );
          notSetDescP.push(
            `${selectedColP[i].text} not greater than ${sigValueP[i]} in:`,
          );
          break;
        case '|<|':
          setDescP.push(
            `${selectedColP[i].text} absolute value less than ${sigValueP[i]} in:`,
          );
          notSetDescP.push(
            `${selectedColP[i].text} absolute value not less than ${sigValueP[i]} in:`,
          );
          break;
        case '|>|':
          setDescP.push(
            `${selectedColP[i].text} absolute value greater than ${sigValueP[i]} in:`,
          );
          notSetDescP.push(
            `${selectedColP[i].text} absolute value not greater than ${sigValueP[i]} in:`,
          );
          break;
        default:
      }
    }
    const fontFamily = 'Lato,Arial,Helvetica,sans-serif';
    const font15 = `15px ${fontFamily}`;
    const font14 = `14px ${fontFamily}`;
    const font13 = `13px ${fontFamily}`;
    const svgWidthP = (() => {
      const lines = [{ text: 'Set Composition:', font: font15 }]
        .concat(setDescP.map((t) => ({ text: t, font: font15 })))
        .concat(useAnchorP ? [{ text: uAnchorP, font: font13 }] : [])
        .concat(mustDifferential.map((t) => ({ text: t, font: font13 })))
        .concat(notSetDescP.map((t) => ({ text: t, font: font14 })))
        .concat(notDifferential.map((t) => ({ text: t, font: font13 })));

      const maxTextW = maxLinesWidth(lines, font14);
      // Add room for left offsets (x≈25) + circle column + some padding.
      return Math.max(315, maxTextW + 55);
    })();

    //Reset the svg
    metaSvgP.selectAll('text').remove();
    metaSvgP.selectAll('circle').remove();
    metaSvgP.selectAll('rect').remove();
    if (
      mustDifferential.length !== 0 ||
      notDifferential.length !== 0 ||
      useAnchorP
    ) {
      metaSvgP.attr('width', svgWidthP).attr('height', svgHeightP);

      metaSvgP
        .append('text')
        .attr('x', 0)
        .attr('y', 15)
        .text('Set Composition:')
        .attr('font-family', 'Lato,Arial,Helvetica,sans-serif')
        .attr('font-size', '15px')
        .attr('fill', 'black');
      metaSvgP
        .selectAll('dataObject')
        .data(setDescP)
        .enter()
        .append('text')
        .attr('x', 7)
        .attr('y', function (d, i) {
          return 30 + heightScalarP * i;
        })
        .text(function (d) {
          return d;
        })
        .attr('font-family', 'Lato,Arial,Helvetica,sans-serif')
        .attr('font-size', '15px')
        .attr('fill', 'black');

      if (useAnchorP) {
        metaSvgP
          .append('circle')
          .style('fill', 'green')
          .attr('cx', 17)
          .attr('cy', function () {
            return 30 + heightScalarP * setDescP.length;
          })
          .attr('r', 4);
        metaSvgP
          .append('text')
          .attr('x', 25)
          .attr('y', function () {
            return 30 + heightScalarP * setDescP.length + 4;
          })
          .text(uAnchorP)
          .attr('font-family', 'Lato,Arial,Helvetica,sans-serif')
          .attr('font-size', '13px')
          .attr('fill', 'black');
      }

      // const mustTestCirclesP =
      metaSvgP
        .selectAll('dataObject')
        .data(mustDifferential)
        .enter()
        .append('circle')
        .style('fill', 'green')
        .attr('cx', 17)
        .attr('cy', function (d, i) {
          if (!useAnchorP) {
            return (
              30 +
              heightScalarP * setDescP.length +
              mustDifferential.indexOf(d) * heightScalarP
            );
          } else {
            return (
              30 +
              heightScalarP * setDescP.length +
              (mustDifferential.indexOf(d) + 1) * heightScalarP
            );
          }
        })
        .attr('r', 4);

      // const mustTextP =
      metaSvgP
        .selectAll('svg.dataObject')
        .data(mustDifferential)
        .enter()
        .append('text')
        .attr('x', 25)
        .attr('y', function (d) {
          if (!useAnchorP) {
            return (
              30 +
              heightScalarP * setDescP.length +
              mustDifferential.indexOf(d) * heightScalarP +
              4
            );
          } else {
            return (
              30 +
              heightScalarP * setDescP.length +
              (mustDifferential.indexOf(d) + 1) * heightScalarP +
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

      if (notDifferential.length !== 0) {
        metaSvgP
          .selectAll('dataObject')
          .data(notSetDescP)
          .enter()
          .append('text')
          .attr('dy', '24px')
          .attr('x', 7)
          .attr('y', function (d, i) {
            if (!useAnchorP) {
              return (
                30 +
                heightScalarP * setDescP.length +
                (i + mustDifferential.length - 1) * heightScalarP
              );
            } else {
              return (
                30 +
                heightScalarP * setDescP.length +
                (i + mustDifferential.length) * heightScalarP
              );
            }
          })
          .text(function (d) {
            return d;
          })
          .attr('font-family', 'Lato,Arial,Helvetica,sans-serif')
          .attr('font-size', '14px')
          .attr('fill', 'black');

        // const notTestCirclesP =
        metaSvgP
          .selectAll('dataObject')
          .data(notDifferential)
          .enter()
          .append('circle')
          .style('fill', 'red')
          .attr('cx', 17)
          .attr('cy', function (d, i) {
            if (!useAnchorP) {
              return (
                30 +
                4 +
                heightScalarP *
                  (i +
                    setDescP.length +
                    notSetDescP.length +
                    mustDifferential.length)
              );
            } else {
              return (
                30 +
                4 +
                heightScalarP *
                  (i +
                    setDescP.length +
                    notSetDescP.length +
                    mustDifferential.length +
                    1)
              );
            }
          })
          .attr('r', 4);

        // const notTextP =
        metaSvgP
          .selectAll('svg.dataObject')
          .data(notDifferential)
          .enter()
          .append('text')
          .attr('x', 25)
          .attr('y', function (d, i) {
            if (!useAnchorP) {
              return (
                30 +
                8 +
                heightScalarP *
                  (i +
                    setDescP.length +
                    notSetDescP.length +
                    mustDifferential.length)
              );
            } else {
              return (
                30 +
                8 +
                heightScalarP *
                  (i +
                    setDescP.length +
                    notSetDescP.length +
                    mustDifferential.length +
                    1)
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

  prepareMultiset = (baseP) => {
    const {
      uDataP,
      uAnchorP,
      uSettingsP,
      mustDifferential,
      notDifferential,
      numElementsP,
      maxElementsP,
    } = this.props;
    const self = this;
    let datasetP = uDataP;
    if (uSettingsP.useAnchorP && datasetP.indexOf(uAnchorP) !== 0) {
      let anchorPIndex = datasetP.indexOf(uAnchorP);
      datasetP.splice(anchorPIndex, 1);
      datasetP.unshift(uAnchorP);
    }

    // Sizing
    let heightScalarP = 1;
    if (uSettingsP.heightScalarP != null) {
      heightScalarP = uSettingsP.heightScalarP;
    }

    const circlePadding = 8 * heightScalarP;
    const circleRadius = 12 * heightScalarP;
    const topBoxHeightP = 45 * heightScalarP;
    const svgHeightP =
      datasetP.length * 2 * circleRadius +
      (datasetP.length + 1) * circlePadding +
      topBoxHeightP;

    const minWidth = 250 * heightScalarP;

    // Set the width of the svg based on actual rendered text width (industry-standard)
    // so long test names are never clipped; horizontal scroll will appear when needed.
    const circlesWidth = 4 * circlePadding + 6 * circleRadius;

    const labelFontSizePx = Math.round(heightScalarP * 14);
    const labelFontFamily = 'Lato,Arial,Helvetica,sans-serif';
    const labelFontNormal = `${labelFontSizePx}px ${labelFontFamily}`;
    const labelFontBold = `bold ${labelFontSizePx}px ${labelFontFamily}`;

    let maxLabelWidthPx = 0;
    for (let i = 0; i < datasetP.length; i++) {
      const d = datasetP[i];
      const font = d === uAnchorP ? labelFontBold : labelFontNormal;
      maxLabelWidthPx = Math.max(maxLabelWidthPx, measureTextWidth(d, font));
    }

    let svgWidthP = circlesWidth + maxLabelWidthPx + 24;
    if (svgWidthP < minWidth) {
      svgWidthP = minWidth;
    }
    let textElementWidth = svgWidthP - circlesWidth;

    //Colors
    // let chosenColorCodeP = '#00FF40';
    let chosenColorCodeP = 'var(--color-primary)';
    let baseColorCodeP = '#585858';
    let backgroundColorCodeP = '#E6E6E6';
    //Adding settings colors
    if (uSettingsP.colors != null) {
      if (uSettingsP.colors.chosen != null) {
        chosenColorCodeP = uSettingsP.colors.chosen;
      }
      if (uSettingsP.colors.baseP != null) {
        baseColorCodeP = uSettingsP.colors.baseP;
      }
      if (uSettingsP.colors.background != null) {
        backgroundColorCodeP = uSettingsP.colors.background;
      }
    }

    // const topBox =
    baseP.append('div').style('padding-bottom', '5px');

    const svgWrapper = baseP.append('div').attr('class', 'SidebarWideSvg');

    const svg = svgWrapper
      .append('svg')
      .attr('width', svgWidthP)
      .attr('height', svgHeightP)
      .style('padding-bottom', '5px');

    // const rect =
    svg
      .append('path')
      .attr(
        'd',
        rightRoundedRect(
          0,
          topBoxHeightP,
          svgWidthP,
          svgHeightP - topBoxHeightP,
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
      .selectAll('svg')
      .data(datasetP)
      .enter()
      .append('circle')
      .style('fill', baseColorCodeP)
      .attr('cx', circlePadding + circleRadius)
      .attr('cy', function (d) {
        return (
          datasetP.indexOf(d) * (2 * circleRadius) +
          (topBoxHeightP + circleRadius + circlePadding) +
          datasetP.indexOf(d) * circlePadding
        );
      })
      .attr('r', circleRadius)
      .style('stroke', (d) =>
        mustDifferential.includes(d) || d === uAnchorP
          ? chosenColorCodeP
          : 'transparent',
      )
      .attr('stroke-width', circleRadius / 5)
      .on('click', function (d) {
        let mustDifferentialCopy = [...mustDifferential];
        let notDifferentialCopy = [...notDifferential];
        if (!mustDifferential.includes(d) && d !== uAnchorP) {
          mustDifferentialCopy.push(d);
          if (notDifferential.includes(d)) {
            notDifferentialCopy.splice(notDifferential.indexOf(d), 1);
          }
          updateCircles();
          self.props.onHandleSetChange(
            mustDifferentialCopy,
            notDifferentialCopy,
          );
        }
      })
      .on('mouseover', function (d) {
        const cursorStyle = d !== uAnchorP ? 'pointer' : 'not-allowed';
        d3.select(this).transition().duration(100).attr('cursor', cursorStyle);
      });

    const maybeCircles = svg
      .selectAll('svg.dataObject')
      .data(datasetP)
      .enter()
      .append('circle')
      .style('fill', backgroundColorCodeP)
      .attr('cx', 2 * circlePadding + 3 * circleRadius)
      .attr('cy', function (d) {
        return (
          datasetP.indexOf(d) * (2 * circleRadius) +
          (topBoxHeightP + circleRadius + circlePadding) +
          datasetP.indexOf(d) * circlePadding
        );
      })
      .attr('r', circleRadius)
      .style('stroke', (d) =>
        !notDifferential.includes(d) &&
        !mustDifferential.includes(d) &&
        d !== uAnchorP
          ? chosenColorCodeP
          : baseColorCodeP,
      )
      .attr('stroke-width', circleRadius / 5)
      .on('click', function (d) {
        let mustDifferentialCopy = [...mustDifferential];
        let notDifferentialCopy = [...notDifferential];
        if (mustDifferential.includes(d) && d !== uAnchorP) {
          mustDifferentialCopy.splice(mustDifferential.indexOf(d), 1);
        }
        if (notDifferential.includes(d) && d !== uAnchorP) {
          notDifferentialCopy.splice(notDifferential.indexOf(d), 1);
        }
        if (d !== uAnchorP) {
          updateCircles();
          self.props.onHandleSetChange(
            mustDifferentialCopy,
            notDifferentialCopy,
          );
        }
      })
      .on('mouseover', function (d) {
        const cursorStyle = d !== uAnchorP ? 'pointer' : 'not-allowed';
        d3.select(this).transition().duration(100).attr('cursor', cursorStyle);
      });

    // const miniMaybeCircles =
    svg
      .selectAll('svg.dataObject')
      .data(datasetP)
      .enter()
      .append('circle')
      .style('fill', baseColorCodeP)
      .attr('cx', 2 * circlePadding + 3 * circleRadius)
      .attr('cy', function (d) {
        return (
          datasetP.indexOf(d) * (2 * circleRadius) +
          (topBoxHeightP + circleRadius + circlePadding) +
          datasetP.indexOf(d) * circlePadding
        );
      })
      .attr('r', circleRadius / 3)
      .on('click', function (d) {
        let mustDifferentialCopy = [...mustDifferential];
        let notDifferentialCopy = [...notDifferential];
        if (mustDifferential.includes(d) && d !== uAnchorP) {
          mustDifferentialCopy.splice(mustDifferential.indexOf(d), 1);
        }
        if (notDifferential.includes(d) && d !== uAnchorP) {
          notDifferentialCopy.splice(notDifferential.indexOf(d), 1);
        }
        if (d !== uAnchorP) {
          updateCircles();
          self.props.onHandleSetChange(
            mustDifferentialCopy,
            notDifferentialCopy,
          );
        }
      })
      .on('mouseover', function (d) {
        const cursorStyle = d !== uAnchorP ? 'pointer' : 'not-allowed';
        d3.select(this).transition().duration(100).attr('cursor', cursorStyle);
      });

    const notCircles = svg
      .selectAll('svg.dataObject')
      .data(datasetP)
      .enter()
      .append('circle')
      .style('fill', backgroundColorCodeP)
      .attr('cx', 3 * circlePadding + 5 * circleRadius)
      .attr('cy', function (d) {
        return (
          datasetP.indexOf(d) * (2 * circleRadius) +
          (topBoxHeightP + circleRadius + circlePadding) +
          datasetP.indexOf(d) * circlePadding
        );
      })
      .attr('r', circleRadius)
      .style('stroke', (d) =>
        notDifferential.includes(d) && d !== uAnchorP
          ? chosenColorCodeP
          : 'transparent',
      )
      .attr('stroke-width', circleRadius / 5)
      .on('click', function (d) {
        let mustDifferentialCopy = [...mustDifferential];
        let notDifferentialCopy = [...notDifferential];
        if (!notDifferential.includes(d) && d !== uAnchorP) {
          notDifferentialCopy.push(d);
          if (mustDifferential.includes(d)) {
            mustDifferentialCopy.splice(mustDifferential.indexOf(d), 1);
          }
          if (d !== uAnchorP) {
            updateCircles();
            self.props.onHandleSetChange(
              mustDifferentialCopy,
              notDifferentialCopy,
            );
          }
        }
      })
      .on('mouseover', function (d) {
        const cursorStyle = d !== uAnchorP ? 'pointer' : 'not-allowed';
        d3.select(this).transition().duration(100).attr('cursor', cursorStyle);
      });

    // const lineVert =
    svg
      .append('line')
      .attr('x1', 4 * circlePadding + 6 * circleRadius)
      .attr('x2', 4 * circlePadding + 6 * circleRadius)
      .attr('y1', topBoxHeightP)
      .attr('y2', svgHeightP)
      .attr('stroke', 'black')
      .attr('stroke-width', 5);

    // const testElements =
    svg
      .selectAll('svg.dataObject')
      .data(datasetP)
      .enter()
      .append('text')
      .attr('x', 5 * circlePadding + 6 * circleRadius)
      .attr('y', function (d) {
        return (
          datasetP.indexOf(d) * (2 * circleRadius) +
          (topBoxHeightP + circleRadius + circlePadding) +
          datasetP.indexOf(d) * circlePadding +
          circleRadius / 2
        );
      })
      .text(function (d) {
        return d;
      })
      .attr('font-family', 'Lato,Arial,Helvetica,sans-serif')
      .attr('font-weight', (d) => (d === uAnchorP ? 'bold' : 'normal'))
      .attr('font-size', function () {
        return heightScalarP * 14 + 'px';
      })
      .attr('fill', 'black');

    svg
      .append('text')
      .attr('x', circlePadding + circleRadius)
      .attr('y', topBoxHeightP - 4)
      .attr(
        'transform',
        'rotate(' +
          305 +
          ',' +
          (circlePadding + circleRadius) +
          ',' +
          (topBoxHeightP - 4) +
          ')',
      )
      .text('Must')
      .attr('font-family', 'Lato,Arial,Helvetica,sans-serif')
      .attr('font-size', function () {
        return heightScalarP * 14 + 'px';
      })
      .attr('fill', 'black');
    svg
      .append('text')
      .attr('x', 2 * circlePadding + 3 * circleRadius)
      .attr('y', topBoxHeightP - 4)
      .attr(
        'transform',
        'rotate(' +
          305 +
          ',' +
          (2 * circlePadding + 3 * circleRadius) +
          ',' +
          (topBoxHeightP - 4) +
          ')',
      )
      .text('Maybe')
      .attr('font-family', 'Lato,Arial,Helvetica,sans-serif')
      .attr('font-size', function () {
        return heightScalarP * 14 + 'px';
      })
      .attr('fill', 'black');
    svg
      .append('text')
      .attr('x', 3 * circlePadding + 5 * circleRadius)
      .attr('y', topBoxHeightP - 4)
      .attr(
        'transform',
        'rotate(' +
          305 +
          ',' +
          (3 * circlePadding + 5 * circleRadius) +
          ',' +
          (topBoxHeightP - 4) +
          ')',
      )
      .text('Not')
      .attr('font-family', 'Lato,Arial,Helvetica,sans-serif')
      .attr('font-size', function () {
        return heightScalarP * 14 + 'px';
      })
      .attr('fill', 'black');
    if (numElementsP != null && maxElementsP != null) {
      // const numElementsPLine =
      svg
        .append('line')
        .attr('class', 'numElements')
        .attr('x1', 4 * circlePadding + 6 * circleRadius)
        .attr('x2', function () {
          return (
            4 * circlePadding +
            6 * circleRadius +
            (textElementWidth - 85 * heightScalarP) *
              (numElementsP / maxElementsP) +
            3
          );
        })
        .attr('y1', topBoxHeightP - 10 * heightScalarP)
        .attr('y2', topBoxHeightP - 10 * heightScalarP)
        .attr('stroke', chosenColorCodeP)
        .attr('stroke-width', 10 * heightScalarP);
      const numElementsPVar = svg
        .selectAll('svg.dataObject')
        .data([numElementsP])
        .enter()
        .append('text')
        .attr('class', 'numElements')
        .attr('x', function () {
          return (
            4 * circlePadding +
            6 * circleRadius +
            (textElementWidth - 85 * heightScalarP) *
              (numElementsP / maxElementsP) +
            6
          );
        })
        .attr('y', topBoxHeightP - 6 * heightScalarP);
      // const numElementsPText =
      numElementsPVar
        .text(function (d) {
          const dText =
            numElementsP !== maxElementsP ? `${d} of ${maxElementsP}` : d;
          return dText;
        })
        .attr('font-family', 'Lato,Arial,Helvetica,sans-serif')
        .attr('font-size', function () {
          return heightScalarP * 13 + 'px';
        })
        .attr('fill', 'black');
    }

    //Building the lock on the anchor circle
    if (uSettingsP.useAnchorP) {
      svg
        .append('circle')
        .style('fill', baseColorCodeP)
        .attr('cx', circlePadding + circleRadius)
        .attr(
          'cy',
          topBoxHeightP - 1 + circleRadius + circlePadding - circleRadius / 6,
        )
        .attr('r', circleRadius / 6)
        .style('stroke', 'white')
        .attr('stroke-width', circleRadius / 7);
      svg
        .append('rect')
        .style('fill', 'white')
        .attr('class', 'CursorNotAllowed')
        .attr('x', circlePadding + circleRadius - circleRadius / 3)
        .attr(
          'y',
          topBoxHeightP + circleRadius + circlePadding - circleRadius / 6,
        )
        .attr('width', (circleRadius * 2) / 3)
        .attr('height', (circleRadius * 2) / 3);
    }

    function updateCircles() {
      mustCircles
        .style('stroke', (d) =>
          mustDifferential.includes(d) || d === uAnchorP
            ? chosenColorCodeP
            : 'transparent',
        )
        .attr('stroke-width', circleRadius / 5);
      maybeCircles
        .style('stroke', (d) =>
          !notDifferential.includes(d) &&
          !mustDifferential.includes(d) &&
          d !== uAnchorP
            ? chosenColorCodeP
            : baseColorCodeP,
        )
        .attr('stroke-width', circleRadius / 5);
      notCircles
        .style('stroke', (d) =>
          notDifferential.includes(d) ? chosenColorCodeP : 'transparent',
        )
        .attr('stroke-width', circleRadius / 5);
    }
  };

  handleDropdownChange = (evt, { name, value, index }) => {
    this.props.onHandleDropdownChange(evt, { name, value, index });
  };

  addFilter = () => {
    this.props.onAddFilterDifferential();
  };

  removeFilter = (index) => {
    this.props.onRemoveFilterDifferential(index);
  };

  changeHoveredFilter = (index) => {
    this.props.onChangeHoveredFilter(index);
  };

  render() {
    const {
      sigValueP,
      selectedOperatorP,
      selectedColP,
      uSettingsP,
      multisetColsDifferential,
    } = this.props;
    const OperatorsP = uSettingsP.thresholdOperatorP;
    const indexFiltersP = uSettingsP.indexFiltersP;
    const hoveredFilter = uSettingsP.hoveredFilter;
    const callbackFactory = (index) => (value) => {
      this.props.onHandleSigValuePInputChange('sigValueP', value, index);
    };
    return (
      <Fragment>
        <Form className="MultisetDropdownContainer">
          <ul style={{ padding: '0px' }}>
            {selectedColP.map((val, index) => {
              return (
                <Form.Group
                  key={`${index}`}
                  onMouseEnter={() => this.changeHoveredFilter(index)}
                  onMouseLeave={() => this.changeHoveredFilter(-1)}
                >
                  <Form.Field
                    control={Select}
                    label={index === 0 ? 'Column' : ''}
                    name="selectedColP"
                    className="ThresholdColumnReadOnly"
                    index={index}
                    // selection
                    value={val.value}
                    options={multisetColsDifferential}
                    width={7}
                    onChange={this.handleDropdownChange}
                  ></Form.Field>
                  {hoveredFilter === index && indexFiltersP.length !== 1 && (
                    <Button
                      circular
                      icon
                      style={{
                        position: 'absolute',
                        marginTop: index === 0 ? '15px' : '0px',
                      }}
                      size="mini"
                      compact
                      onClick={() => this.removeFilter(index)}
                    >
                      <Icon name="minus circle" color={'red'} />
                    </Button>
                  )}
                  <Form.Field
                    control={Select}
                    label={index === 0 ? 'Operator' : ''}
                    name="selectedOperatorP"
                    className="ThresholdOperatorSelect"
                    index={index}
                    // selection
                    value={selectedOperatorP[index].value}
                    options={OperatorsP}
                    width={5}
                    onChange={this.handleDropdownChange}
                  ></Form.Field>
                  <Form.Field width={4} id="SignificantValueInputMultisetP">
                    <label>{index === 0 ? 'Value' : ''}</label>
                    <NumericExponentialInput
                      onChange={callbackFactory(index)}
                      min={1e-100}
                      preventNegatives={false}
                      name="sigValueP"
                      defaultValue={sigValueP[index]}
                      value={sigValueP[index]}
                    />
                  </Form.Field>
                </Form.Group>
              );
            })}
          </ul>
          <Button circular compact size="mini" icon onClick={this.addFilter}>
            <Icon name="plus circle" color={'green'} />
          </Button>
        </Form>
        <p id="multiset-query-p" className="MultisetQueryPContainer"></p>
      </Fragment>
    );
  }
}

export default DifferentialMultisetFilters;
