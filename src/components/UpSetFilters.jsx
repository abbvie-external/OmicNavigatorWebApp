import React, { Component, Fragment } from 'react';
import { Form, Select, Input } from 'semantic-ui-react';
import * as d3 from 'd3';
import './UpSetFilters.scss';

class UpSetFilters extends Component {
  componentDidMount() {
    const {
      uData,
      uAnchor,
      uSettings,
      metaSvg,
      sigValue,
      selectedCol,
      selectedOperator
    } = this.props;
    this.makeUpset(
      uData,
      uAnchor,
      uSettings,
      metaSvg,
      sigValue,
      selectedCol,
      selectedOperator
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
      selectedOperator
    } = this.props;
    if (uSettings !== prevProps.uSettings) {
      this.makeUpset(
        uData,
        uAnchor,
        uSettings,
        metaSvg,
        sigValue,
        selectedCol,
        selectedOperator
      );
    }
  }

  makeUpset(
    uData,
    uAnchor,
    uSettings,
    metaSvg,
    sigValue,
    selectedCol,
    selectedOperator
  ) {
    d3.selectAll('#upset-query')
      .selectAll('*')
      .remove();
    const base = d3
      .selectAll('#upset-query')
      .append('div')
      .style('padding-bottom', '5px');

    if (uSettings.displayMetaData) {
      this.prepareUpset(uData, uAnchor, uSettings, base);
      const baseMetaSvg = base.append('svg');
      this.metaScript(
        baseMetaSvg,
        uAnchor,
        uData,
        uSettings,
        selectedOperator,
        sigValue
      );
    }
  }

  metaScript(metaSvg, uAnchor, uData, uSettings, selectedOperator, sigValue) {
    const svgWidth = 135 + 140; //To match the SVG above
    const heightScalar = 20; //20 per circle
    const mustData = uSettings.must;
    const notData = uSettings.not;
    const svgHeight =
      notData.length * heightScalar +
      mustData.length * heightScalar +
      60 +
      10 +
      24;
    const useAnchor = uSettings.useAnchor;

    switch (selectedOperator.text) {
      case '<':
        this.setDesc = `Elements less than ${sigValue} in:`;
        this.notSetDesc = `Elements greater than ${sigValue} not in:`;
        break;
      case '>':
        this.setDesc = `Elements greater than ${sigValue} in:`;
        this.notSetDesc = `Elements less than ${sigValue} not in:`;
        break;
      case '|<|':
        this.setDesc = `Elements absolute value less than ${sigValue} in:`;
        this.notSetDesc = `Elements absolute value greater than ${sigValue} not in:`;
        break;
      case '|>|':
        this.setDesc = `Elements absolute value greater than ${sigValue} in:`;
        this.notSetDesc = `Elements absolute value less than ${sigValue} not in:`;
        break;
      default:
        this.setDesc = '';
        this.notSetDesc = '';
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
      metaSvg
        .append('text')
        .attr('dy', '12px')
        .attr('x', 7)
        .attr('y', 30)
        .text('' + this.setDesc)
        .attr('font-family', 'Lato,Arial,Helvetica,sans-serif')
        .attr('font-size', '15px')
        .attr('fill', 'black');

      if (useAnchor) {
        metaSvg
          .append('circle')
          .style('fill', 'green')
          .attr('cx', 17)
          .attr('cy', 52)
          .attr('r', 4);
        metaSvg
          .append('text')
          .attr('x', 25)
          .attr('y', 56)
          .text(uAnchor)
          .attr('font-family', 'Lato,Arial,Helvetica,sans-serif')
          .attr('font-size', '13px')
          .attr('fill', 'black');
      }

      const mustTestCircles = metaSvg
        .selectAll('dataObject')
        .data(mustData)
        .enter()
        .append('circle')
        .style('fill', 'green')
        .attr('cx', 17)
        .attr('cy', function(d) {
          if (!useAnchor) {
            return mustData.indexOf(d) * heightScalar + 44 + 12;
          } else {
            return mustData.indexOf(d) * heightScalar + 60 + 12;
          }
        })
        .attr('r', 4);

      const mustText = metaSvg
        .selectAll('svg.dataObject')
        .data(mustData)
        .enter()
        .append('text')
        .attr('x', 25)
        .attr('y', function(d) {
          if (!useAnchor) {
            return mustData.indexOf(d) * heightScalar + 48 + 12;
          } else {
            return mustData.indexOf(d) * heightScalar + 60 + 4 + 12;
          }
        })
        .text(function(d) {
          return d;
        })
        .attr('font-family', 'Lato,Arial,Helvetica,sans-serif')
        .attr('font-size', '14px')
        .attr('fill', 'black');

      if (notData.length !== 0) {
        metaSvg
          .append('text')
          .attr('dy', '24px')
          .attr('x', 7)
          .attr('y', function(d) {
            if (!useAnchor) {
              return mustData.length * heightScalar + 44;
            } else {
              return mustData.length * heightScalar + 60;
            }
          })
          .text('' + this.notSetDesc)
          .attr('font-family', 'Lato,Arial,Helvetica,sans-serif')
          .attr('font-size', '15px')
          .attr('fill', 'black');

        const notTestCircles = metaSvg
          .selectAll('dataObject')
          .data(notData)
          .enter()
          .append('circle')
          .style('fill', 'red')
          .attr('cx', 17)
          .attr('cy', function(d) {
            if (!useAnchor) {
              return (
                notData.indexOf(d) * heightScalar +
                mustData.length * heightScalar +
                44 +
                14 +
                24
              );
            } else {
              return (
                notData.indexOf(d) * heightScalar +
                mustData.length * heightScalar +
                60 +
                14 +
                24
              );
            }
          })
          .attr('r', 4);

        const notText = metaSvg
          .selectAll('svg.dataObject')
          .data(notData)
          .enter()
          .append('text')
          .attr('x', 25)
          .attr('y', function(d) {
            if (!useAnchor) {
              return (
                notData.indexOf(d) * heightScalar +
                mustData.length * heightScalar +
                44 +
                18 +
                24
              );
            } else {
              return (
                notData.indexOf(d) * heightScalar +
                mustData.length * heightScalar +
                60 +
                18 +
                24
              );
            }
          })
          .text(function(d) {
            return d;
          })
          .attr('font-family', 'Lato,Arial,Helvetica,sans-serif')
          .attr('font-size', '14px')
          .attr('fill', 'black');
      }
    }
  }

  prepareUpset(data, anchor, settings, base) {
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
    const maxWidth = 500 * heightScalar;

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
    let chosenColorCode = '#ff4400';
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

    const topBox = base.append('div').style('padding-bottom', '5px');

    const svg = base
      .append('svg')
      .attr('width', svgWidth)
      .attr('height', svgHeight)
      .style('padding-bottom', '5px');

    const rect = svg
      .append('path')
      .attr(
        'd',
        rightRoundedRect(
          0,
          topBoxHeight,
          svgWidth,
          svgHeight - topBoxHeight,
          20
        )
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
        mustData.includes(d) || d === anchor ? chosenColorCode : 'transparent'
      )
      .attr('stroke-width', circleRadius / 5)
      .on('click', function(d) {
        if (!mustData.includes(d) && d !== anchor) {
          mustData.push(d);
          if (notData.includes(d)) {
            notData.splice(notData.indexOf(d), 1);
          }
          updateCircles();
          self.props.onUpdateQueryData({ must: mustData, not: notData });
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
          : baseColorCode
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
        self.props.onUpdateQueryData({ must: mustData, not: notData });
      });

    const miniMaybeCircles = svg
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
        self.props.onUpdateQueryData({ must: mustData, not: notData });
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
        notData.includes(d) && d !== anchor ? chosenColorCode : 'transparent'
      )
      .attr('stroke-width', circleRadius / 5)
      .on('click', function(d) {
        if (!notData.includes(d) && d !== anchor) {
          notData.push(d);
          if (mustData.includes(d)) {
            mustData.splice(mustData.indexOf(d), 1);
          }
          updateCircles();
          self.props.onUpdateQueryData({ must: mustData, not: notData }); // updateGlobalVariables();
        }
      });

    const lineVert = svg
      .append('line')
      .attr('x1', 4 * circlePadding + 6 * circleRadius)
      .attr('x2', 4 * circlePadding + 6 * circleRadius)
      .attr('y1', topBoxHeight)
      .attr('y2', svgHeight)
      .attr('stroke', 'black')
      .attr('stroke-width', 5);

    const testElements = svg
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
          ')'
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
          ')'
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
          ')'
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
      const numElementsLine = svg
        .append('line')
        .attr('class', 'numElements')
        .attr('x1', 4 * circlePadding + 6 * circleRadius)
        .attr('x2', function() {
          return (
            4 * circlePadding +
            6 * circleRadius +
            (textElementWidth - 80 * heightScalar) *
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
            (textElementWidth - 80 * heightScalar) *
              (settings.numElements / settings.maxElements) +
            6
          );
        })
        .attr('y', topBoxHeight - 6 * heightScalar);

      const numElementsText = numElements
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
          topBoxHeight - 1 + circleRadius + circlePadding - circleRadius / 6
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
          topBoxHeight + circleRadius + circlePadding - circleRadius / 6
        )
        .attr('width', (circleRadius * 2) / 3)
        .attr('height', (circleRadius * 2) / 3);
    }

    function updateCircles() {
      mustCircles
        .style('stroke', d =>
          mustData.includes(d) || d === anchor ? chosenColorCode : 'transparent'
        )
        .attr('stroke-width', circleRadius / 5);
      maybeCircles
        .style('stroke', d =>
          !notData.includes(d) && !mustData.includes(d) && d !== anchor
            ? chosenColorCode
            : baseColorCode
        )
        .attr('stroke-width', circleRadius / 5);
      notCircles
        .style('stroke', d =>
          notData.includes(d) ? chosenColorCode : 'transparent'
        )
        .attr('stroke-width', circleRadius / 5);
    }
  }

  handleDropdownChange = (evt, { name, value }) => {
    this.props.onUpdateQueryData({
      [name]: {
        key: value,
        text: value,
        value: value
      }
    });
  };

  handleInputChange = (evt, { name, value }) => {
    this.props.onUpdateQueryData({
      [name]: value
    });
  };

  render() {
    const { selectedCol, selectedOperator, sigValue, uSettings } = this.props;
    const Columns = uSettings.thresholdCols;
    const Operators = uSettings.thresholdOperator;
    const SelCol = selectedCol.text;
    const SelOp = selectedOperator.text;
    return (
      <Fragment>
        <Form className="UpSetDropdownContainer">
          <Form.Group>
            <Form.Field
              control={Select}
              label="Column"
              name="selectedCol"
              className="ThresholdColumnSelect"
              // selection
              value={SelCol}
              options={Columns}
              width={7}
              onChange={this.handleDropdownChange}
            ></Form.Field>
            <Form.Field
              control={Select}
              label="Operator"
              name="selectedOperator"
              className="ThresholdOperatorSelect"
              // selection
              value={SelOp}
              options={Operators}
              width={3}
              onChange={this.handleDropdownChange}
            ></Form.Field>
            <Form.Field
              control={Input}
              type="number"
              step="0.01"
              min="0.00"
              label="Significance"
              name="sigValue"
              className="SignificantValueInput"
              value={sigValue}
              width={6}
              onChange={this.handleInputChange}
            ></Form.Field>
          </Form.Group>
        </Form>
        <p id="upset-query" className="UpSetQueryContainer"></p>
      </Fragment>
    );
  }
}

export default UpSetFilters;
