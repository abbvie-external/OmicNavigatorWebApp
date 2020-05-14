import React, { Component, Fragment } from 'react';
import { Form, Select, Input, Button, Icon } from 'semantic-ui-react';
import * as d3 from 'd3';
import '../Shared/MultisetFilters.scss';

class EnrichmentMultisetFilters extends Component {
  componentDidMount() {
    const {
      uData,
      uAnchor,
      uSettings,
      metaSvg,
      sigValue,
      selectedCol,
      selectedOperator,
    } = this.props;
    this.makeMultiset(
      uData,
      uAnchor,
      uSettings,
      metaSvg,
      sigValue,
      selectedCol,
      selectedOperator,
    );
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const {
      uData,
      uAnchor,
      uSettings,
      metaSvg,
      sigValue,
      selectedCol,
      selectedOperator,
    } = this.props;
    if (uSettings !== prevProps.uSettings) {
      this.makeMultiset(
        uData,
        uAnchor,
        uSettings,
        metaSvg,
        sigValue,
        selectedCol,
        selectedOperator,
      );
    }
  }

  makeMultiset(
    uData,
    uAnchor,
    uSettings,
    metaSvg,
    sigValue,
    selectedCol,
    selectedOperator,
  ) {
    d3.selectAll('#multiset-query')
      .selectAll('*')
      .remove();
    const base = d3
      .selectAll('#multiset-query')
      .append('div')
      .style('padding-bottom', '5px');

    if (uSettings.displayMetaData) {
      this.prepareMultiset(uData, uAnchor, uSettings, base);
      const baseMetaSvg = base.append('svg');
      this.metaScript(
        baseMetaSvg,
        uAnchor,
        uData,
        uSettings,
        selectedCol,
        selectedOperator,
        sigValue,
      );
    }
  }

  metaScript(
    metaSvg,
    uAnchor,
    uData,
    uSettings,
    selectedCol,
    selectedOperator,
    sigValue,
  ) {
    const svgWidth = 315;
    const heightScalar = 15;
    const mustData = uSettings.must;
    const notData = uSettings.not;
    const svgHeight =
      notData.length * heightScalar +
      mustData.length * heightScalar +
      60 +
      10 +
      24;
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

    //Reset the svg
    metaSvg.selectAll('text').remove();
    metaSvg.selectAll('circle').remove();
    metaSvg.selectAll('rect').remove();
    if (mustData.length !== 0 || notData.length !== 0 || useAnchor) {
      metaSvg.attr('width', svgWidth).attr('height', svgHeight);

      metaSvg
        .append('text')
        .attr('x', 0)
        .attr('y', 15)
        .text('Set Composition:')
        .attr('font-family', 'Lato,Arial,Helvetica,sans-serif')
        .attr('font-size', '15px')
        .attr('fill', 'black');
      if(mustData.length !== 0 || useAnchor){
      metaSvg
        .selectAll('dataObject')
        .data(setDescP)
        .enter()
        .append('text')
        .attr('x', 7)
        .attr('y', function(d, i) {
          return 30 + heightScalar * i;
        })
        .text(function(d) {
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
          .attr('cy', function() {
            return 30 + heightScalar * setDescP.length;
          })
          .attr('r', 4);
        metaSvg
          .append('text')
          .attr('x', 25)
          .attr('y', function() {
            return 30 + heightScalar * setDescP.length + 4;
          })
          .text(uAnchor)
          .attr('font-family', 'Lato,Arial,Helvetica,sans-serif')
          .attr('font-size', '13px')
          .attr('fill', 'black');
      }

      metaSvg
        .selectAll('dataObject')
        .data(mustData)
        .enter()
        .append('circle')
        .style('fill', 'green')
        .attr('cx', 17)
        .attr('cy', function(d, i) {
          if (!useAnchor) {
            return (
              30 +
              heightScalar * setDescP.length +
              mustData.indexOf(d) * heightScalar
            );
          } else {
            return (
              30 +
              heightScalar * setDescP.length +
              (mustData.indexOf(d) + 1) * heightScalar
            );
          }
        })
        .attr('r', 4);

      // const mustText =
      metaSvg
        .selectAll('svg.dataObject')
        .data(mustData)
        .enter()
        .append('text')
        .attr('x', 25)
        .attr('y', function(d) {
          if (!useAnchor) {
            return (
              30 +
              heightScalar * setDescP.length +
              mustData.indexOf(d) * heightScalar +
              4
            );
          } else {
            return (
              30 +
              heightScalar * setDescP.length +
              (mustData.indexOf(d) + 1) * heightScalar +
              4
            );
          }
        })
        .text(function(d) {
          return d;
        })
        .attr('font-family', 'Lato,Arial,Helvetica,sans-serif')
        .attr('font-size', '13px')
        .attr('fill', 'black');

      if (notData.length !== 0) {
        metaSvg
          .selectAll('dataObject')
          .data(notSetDescP)
          .enter()
          .append('text')
          .attr('x', 7)
          .attr('y', function(d, i) {
            if (!useAnchor && mustData.length === 0) {
              return 30 + heightScalar * i;
            } else {
              return (
                30 +
                4 +
                heightScalar * setDescP.length +
                (i + mustData.length) * heightScalar
              );
            }
          })
          .text(function(d) {
            return d;
          })
          .attr('font-family', 'Lato,Arial,Helvetica,sans-serif')
          .attr('font-size', '14px')
          .attr('fill', 'black');

        // const notTestCircles =
        metaSvg
          .selectAll('dataObject')
          .data(notData)
          .enter()
          .append('circle')
          .style('fill', 'red')
          .attr('cx', 17)
          .attr('cy', function(d, i) {
            if (!useAnchor && mustData.length === 0) {
              return (
                30 +
                heightScalar *(i + notSetDescP.length)
              );
            } else {
              return (
                30 +
                4 +
                heightScalar *
                  (i +
                    setDescP.length +
                    notSetDescP.length +
                    mustData.length)
              );
            }
          })
          .attr('r', 4);

        // const notText =
        metaSvg
          .selectAll('svg.dataObject')
          .data(notData)
          .enter()
          .append('text')
          .attr('x', 25)
          .attr('y', function(d, i) {
            if (!useAnchor && mustData.length === 0) {
              return (
                30 +
                4 +
                heightScalar *
                  (i + notSetDescP.length)
              );
            } else {
              return (
                30 +
                8 +
                heightScalar *
                  (i +
                    setDescP.length +
                    notSetDescP.length +
                    mustData.length)
              );
            }
          })
          .text(function(d) {
            return d;
          })
          .attr('font-family', 'Lato,Arial,Helvetica,sans-serif')
          .attr('font-size', '13px')
          .attr('fill', 'black');
      }
    }
  }

  prepareMultiset(data, anchor, settings, base) {
    const self = this;
    let dataset = data;
    if (settings.useAnchor && dataset.indexOf(anchor) < 0) {
      dataset.unshift(anchor);
    }
    let mustData = settings.must;
    let notData = settings.not;

    // Sizing
    let heightScalar = 1;
    if (settings.heightScalar !== undefined) {
      heightScalar = settings.heightScalar;
    }

    const circlePadding = 8 * heightScalar;
    const circleRadius = 12 * heightScalar;
    const topBoxHeight = 45 * heightScalar;
    const svgHeight =
      dataset.length * 2 * circleRadius +
      (dataset.length + 1) * circlePadding +
      topBoxHeight;

    const minWidth = 250 * heightScalar;
    const maxWidth = 340 * heightScalar;

    //Set the width of the svg to depending on the size of the largest test element
    let longest = 0;
    if (dataset[0]) {
      longest = dataset[0].length;
      for (let i = 1; i < dataset.length; i++) {
        if (dataset[i].length > longest) {
          longest = dataset[i].length;
        }
      }
    }
    const circlesWidth = 4 * circlePadding + 6 * circleRadius;
    let textElementWidth = longest * 10 * heightScalar;
    let svgWidth = circlesWidth + textElementWidth;
    if (svgWidth < minWidth) {
      svgWidth = minWidth;
      textElementWidth = svgWidth - circlesWidth;
    } else if (svgWidth > maxWidth) {
      svgWidth = maxWidth;
      textElementWidth = svgWidth - circlesWidth;
    }

    //Colors
    // let chosenColorCode = '#00FF40';
    let chosenColorCode = 'var(--color-primary)';
    let baseColorCode = '#585858';
    let backgroundColorCode = '#E6E6E6';
    //Adding settings colors
    if (settings.colors !== undefined) {
      if (settings.colors.chosen !== undefined) {
        chosenColorCode = settings.colors.chosen;
      }
      if (settings.colors.base !== undefined) {
        baseColorCode = settings.colors.base;
      }
      if (settings.colors.background !== undefined) {
        backgroundColorCode = settings.colors.background;
      }
    }

    // const topBox =
    base.append('div').style('padding-bottom', '5px');

    const svg = base
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
      .style('fill', baseColorCode)
      .attr('cx', circlePadding + circleRadius)
      .attr('cy', function(d) {
        return (
          dataset.indexOf(d) * (2 * circleRadius) +
          (topBoxHeight + circleRadius + circlePadding) +
          dataset.indexOf(d) * circlePadding
        );
      })
      .attr('r', circleRadius)
      .style('stroke', d =>
        mustData.includes(d) || d === anchor ? chosenColorCode : 'transparent',
      )
      .attr('stroke-width', circleRadius / 5)
      .on('click', function(d) {
        if (!mustData.includes(d) && d !== anchor) {
          mustData.push(d);
          if (notData.includes(d)) {
            notData.splice(notData.indexOf(d), 1);
          }
          updateCircles();
          self.props.onHandleSetChange({ must: mustData, not: notData });
        }
      });

    const maybeCircles = svg
      .selectAll('svg.dataObject')
      .data(dataset)
      .enter()
      .append('circle')
      .style('fill', backgroundColorCode)
      .attr('cx', 2 * circlePadding + 3 * circleRadius)
      .attr('cy', function(d) {
        return (
          dataset.indexOf(d) * (2 * circleRadius) +
          (topBoxHeight + circleRadius + circlePadding) +
          dataset.indexOf(d) * circlePadding
        );
      })
      .attr('r', circleRadius)
      .style('stroke', d =>
        !notData.includes(d) && !mustData.includes(d) && d !== anchor
          ? chosenColorCode
          : baseColorCode,
      )
      .attr('stroke-width', circleRadius / 5)
      .on('click', function(d) {
        if (mustData.includes(d) && d !== anchor) {
          mustData.splice(mustData.indexOf(d), 1);
        }
        if (notData.includes(d) && d !== anchor) {
          notData.splice(notData.indexOf(d), 1);
        }
        updateCircles();
        self.props.onHandleSetChange({ must: mustData, not: notData });
      });

    // const miniMaybeCircles =
    svg
      .selectAll('svg.dataObject')
      .data(dataset)
      .enter()
      .append('circle')
      .style('fill', baseColorCode)
      .attr('cx', 2 * circlePadding + 3 * circleRadius)
      .attr('cy', function(d) {
        return (
          dataset.indexOf(d) * (2 * circleRadius) +
          (topBoxHeight + circleRadius + circlePadding) +
          dataset.indexOf(d) * circlePadding
        );
      })
      .attr('r', circleRadius / 3)
      .on('click', function(d) {
        if (mustData.includes(d) && d !== anchor) {
          mustData.splice(mustData.indexOf(d), 1);
        }
        if (notData.includes(d) && d !== anchor) {
          notData.splice(notData.indexOf(d), 1);
        }
        updateCircles();
        self.props.onHandleSetChange({ must: mustData, not: notData });
      });

    const notCircles = svg
      .selectAll('svg.dataObject')
      .data(dataset)
      .enter()
      .append('circle')
      .style('fill', backgroundColorCode)
      .attr('cx', 3 * circlePadding + 5 * circleRadius)
      .attr('cy', function(d) {
        return (
          dataset.indexOf(d) * (2 * circleRadius) +
          (topBoxHeight + circleRadius + circlePadding) +
          dataset.indexOf(d) * circlePadding
        );
      })
      .attr('r', circleRadius)
      .style('stroke', d =>
        notData.includes(d) && d !== anchor ? chosenColorCode : 'transparent',
      )
      .attr('stroke-width', circleRadius / 5)
      .on('click', function(d) {
        if (!notData.includes(d) && d !== anchor) {
          notData.push(d);
          if (mustData.includes(d)) {
            mustData.splice(mustData.indexOf(d), 1);
          }
          updateCircles();
          self.props.onHandleSetChange({ must: mustData, not: notData }); // updateGlobalVariables();
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
      .attr('y', function(d) {
        return (
          dataset.indexOf(d) * (2 * circleRadius) +
          (topBoxHeight + circleRadius + circlePadding) +
          dataset.indexOf(d) * circlePadding +
          circleRadius / 2
        );
      })
      .text(function(d) {
        return d;
      })
      .attr('font-family', 'Lato,Arial,Helvetica,sans-serif')
      .attr('font-weight', d => (d === anchor ? 'bold' : 'normal'))
      .attr('font-size', function() {
        return heightScalar * 14 + 'px';
      })
      .attr('fill', 'black');

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
      .attr('font-size', function() {
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
      .attr('font-size', function() {
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
      .attr('font-size', function() {
        return heightScalar * 14 + 'px';
      })
      .attr('fill', 'black');
    if (
      settings.numElements !== undefined &&
      settings.maxElements !== undefined
    ) {
      // const numElementsLine =
      svg
        .append('line')
        .attr('class', 'numElements')
        .attr('x1', 4 * circlePadding + 6 * circleRadius)
        .attr('x2', function() {
          return (
            4 * circlePadding +
            6 * circleRadius +
            (textElementWidth - 85 * heightScalar) *
              (settings.numElements / settings.maxElements) +
            3
          );
        })
        .attr('y1', topBoxHeight - 10 * heightScalar)
        .attr('y2', topBoxHeight - 10 * heightScalar)
        .attr('stroke', chosenColorCode)
        .attr('stroke-width', 10 * heightScalar);

      const numElements = svg
        .selectAll('svg.dataObject')
        .data([settings.numElements])
        .enter()
        .append('text')
        .attr('class', 'numElements')
        .attr('x', function() {
          return (
            4 * circlePadding +
            6 * circleRadius +
            (textElementWidth - 85 * heightScalar) *
              (settings.numElements / settings.maxElements) +
            6
          );
        })
        .attr('y', topBoxHeight - 6 * heightScalar);

      // const numElementsText =
      numElements
        .text(function(d) {
          const dText =
            settings.numElements !== settings.maxElements
              ? `${d} of ${settings.maxElements}`
              : d;
          return dText;
        })
        .attr('font-family', 'Lato,Arial,Helvetica,sans-serif')
        .attr('font-size', function() {
          return heightScalar * 13 + 'px';
        })
        .attr('fill', 'black');
    }

    //Building the lock on the anchor circle
    if (settings.useAnchor) {
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
        .style('stroke', d =>
          mustData.includes(d) || d === anchor
            ? chosenColorCode
            : 'transparent',
        )
        .attr('stroke-width', circleRadius / 5);
      maybeCircles
        .style('stroke', d =>
          !notData.includes(d) && !mustData.includes(d) && d !== anchor
            ? chosenColorCode
            : baseColorCode,
        )
        .attr('stroke-width', circleRadius / 5);
      notCircles
        .style('stroke', d =>
          notData.includes(d) ? chosenColorCode : 'transparent',
        )
        .attr('stroke-width', circleRadius / 5);
    }
  }

  handleDropdownChange = (evt, { name, value, index }) => {
    this.props.onHandleDropdownChange(evt, { name, value, index });
  };

  handleInputChange = (evt, { name, value, index }) => {
    this.props.onHandleInputChange(evt, { name, value, index });
  };
  addFilter = () => {
    this.props.onAddFilter();
  };
  removeFilter = index => {
    this.props.onRemoveFilter(index);
  };
  changeHoveredFilter = index => {
    this.props.onChangeHoveredFilter(index);
  };

  render() {
    const { selectedOperator, sigValue, uSettings } = this.props;
    const Columns = uSettings.thresholdCols;
    const Operators = uSettings.thresholdOperator;
    const SelOp = selectedOperator;
    const indexFilters = uSettings.indexFilters;
    const hoveredFilter = uSettings.hoveredFilter;
    // for now, column is displayed as label, just matching the "nominal" or "Adjusted" p value type
    const SelColOverride =
      this.props.pValueType === 'nominal'
        ? 'Nominal P Value'
        : 'Adjusted P Value';
    return (
      <Fragment>
        <Form className="MultisetDropdownContainer">
          <ul style={{ padding: '0px' }}>
            {indexFilters.map(index => (
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
                  width={4}
                  onChange={this.handleDropdownChange}
                ></Form.Field>
                <Form.Field
                  control={Input}
                  type="number"
                  step="0.01"
                  min="0.00"
                  label={index === 0 ? 'Significance' : ''}
                  index={index}
                  name="sigValue"
                  className="SignificantValueInput"
                  value={sigValue[index]}
                  width={5}
                  onChange={this.handleInputChange}
                ></Form.Field>
              </Form.Group>
            ))}
          </ul>
        </Form>
        <p id="multiset-query" className="MultisetQueryContainer"></p>
      </Fragment>
    );
  }
}

export default EnrichmentMultisetFilters;
