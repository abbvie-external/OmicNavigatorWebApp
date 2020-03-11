import React, { Component, Fragment } from 'react';
import { Form, Select, Input, Icon, Button } from 'semantic-ui-react';
import * as d3 from 'd3';
import '../Shared/MultisetFilters.scss';

class PepplotMultisetFilters extends Component {
  componentDidMount() {
    const {
      uDataP,
      uAnchorP,
      uSettingsP,
      metaSvgP,
      sigValueP,
      selectedColP,
      selectedOperatorP,
      thresholdColsP,
      thresholdOperatorP
    } = this.props;
    this.makeMultiset(
      uDataP,
      uAnchorP,
      uSettingsP,
      metaSvgP,
      sigValueP,
      selectedColP,
      selectedOperatorP,
      thresholdColsP,
      thresholdOperatorP
    );
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const {
      uDataP,
      uAnchorP,
      uSettingsP,
      metaSvgP,
      sigValueP,
      selectedColP,
      selectedOperatorP
    } = this.props;
    if (uSettingsP !== prevProps.uSettingsP) {
      this.makeMultiset(
        uDataP,
        uAnchorP,
        uSettingsP,
        metaSvgP,
        sigValueP,
        selectedColP,
        selectedOperatorP
      );
    }
  }

  makeMultiset(
    uDataP,
    uAnchorP,
    uSettingsP,
    metaSvgP,
    sigValueP,
    selectedColP,
    selectedOperatorP
  ) {
    d3.selectAll('#multiset-query-p')
      .selectAll('*')
      .remove();
    const baseP = d3
      .selectAll('#multiset-query-p')
      .append('div')
      .style('padding-bottom', '5px');

    if (uSettingsP.displayMetaDataP) {
      this.prepareMultiset(uDataP, uAnchorP, uSettingsP, baseP);
      const baseMetaSvgP = baseP.append('svg');
      this.metaScript(
        baseMetaSvgP,
        uAnchorP,
        uDataP,
        uSettingsP,
        selectedColP,
        selectedOperatorP,
        sigValueP
      );
    }
  }

  metaScript(
    metaSvgP,
    uAnchorP,
    uDataP,
    uSettingsP,
    selectedColP,
    selectedOperatorP,
    sigValueP
  ) {
    const svgWidthP = 315;
    const heightScalarP = 15;
    const mustDataP = uSettingsP.mustP;
    const notDataP = uSettingsP.notP;
    const svgHeightP =
      notDataP.length * heightScalarP +
      mustDataP.length * heightScalarP +
      60 +
      10 +
      24;
    const useAnchorP = uSettingsP.useAnchorP;
    const setDescP=[];
    const notSetDescP=[];
    //var mustTextScalar = (15 * Number(mustDataP.length !== 0))
    //var notTextScalar = (15 * Number(notDataP.length !== 0))

    for(var i = 0;i < selectedOperatorP.length; i++){
    switch (selectedOperatorP[i].value) {
      case '<':
        setDescP.push(`Elements ${selectedColP[i].text} less than ${sigValueP[i]} in:`);
        notSetDescP.push(`Elements ${selectedColP[i].text} less than ${sigValueP[i]} not in:`);
        break;
      case '>':
        setDescP.push(`Elements ${selectedColP[i].text} greater than ${sigValueP[i]} in:`);
        notSetDescP.push(`Elements ${selectedColP[i].text} greater than ${sigValueP[i]} not in:`);
        break;
      case '|<|':
        setDescP.push(`Elements ${selectedColP[i].text} absolute value less than ${sigValueP[i]} in:`);
        notSetDescP.push(`Elements ${selectedColP[i].text} absolute value less than ${sigValueP[i]} not in:`);
        break;
      case '|>|':
        setDescP.push(`Elements ${selectedColP[i].text} absolute value greater than ${sigValueP[i]} in:`);
        notSetDescP.push(`Elements ${selectedColP[i].text} absolute value greater than ${sigValueP[i]} not in:`);
        break;
      default:
    }
  }

    //Reset the svg
    metaSvgP.selectAll('text').remove();
    metaSvgP.selectAll('circle').remove();
    metaSvgP.selectAll('rect').remove();
    if (mustDataP.length !== 0 || notDataP.length !== 0 || useAnchorP) {
      metaSvgP.attr('width', svgWidthP).attr('height', svgHeightP);

      metaSvgP
        .append('text')
        .attr('x', 0)
        .attr('y', 15)
        .text('Set Composition:')
        .attr('font-family', 'Lato,Arial,Helvetica,sans-serif')
        .attr('font-size', '15px')
        .attr('fill', 'black');
      metaSvgP.selectAll("dataObject")
          .data(setDescP)
          .enter()
          .append('text')
          .attr('x', 7)
          .attr('y', function (d, i) { return (30+heightScalarP*i) })
          .text(function (d) { return d })
          .attr('font-family', 'Lato,Arial,Helvetica,sans-serif')
          .attr('font-size', '15px')
          .attr('fill', 'black');

      if (useAnchorP) {
        metaSvgP
          .append('circle')
          .style('fill', 'green')
          .attr('cx', 17)
          .attr('cy', function () { return (30+(heightScalarP*setDescP.length)) })
          .attr('r', 4);
        metaSvgP
          .append('text')
          .attr('x', 25)
          .attr('y', function () { return (30+(heightScalarP*setDescP.length)+4) })
          .text(uAnchorP)
          .attr('font-family', 'Lato,Arial,Helvetica,sans-serif')
          .attr('font-size', '13px')
          .attr('fill', 'black');
      }

      // const mustTestCirclesP =
      metaSvgP
        .selectAll('dataObject')
        .data(mustDataP)
        .enter()
        .append('circle')
        .style('fill', 'green')
        .attr('cx', 17)
        .attr('cy', function(d,i) {
          if (!useAnchorP) {
            return 30+(heightScalarP*setDescP.length)+mustDataP.indexOf(d) * heightScalarP;
          } else {
            return 30+(heightScalarP*setDescP.length)+(mustDataP.indexOf(d)+1) * heightScalarP;
          }
        })
        .attr('r', 4);

      // const mustTextP =
      metaSvgP
        .selectAll('svg.dataObject')
        .data(mustDataP)
        .enter()
        .append('text')
        .attr('x', 25)
        .attr('y', function(d) {
          if (!useAnchorP) {
            return 30+(heightScalarP*setDescP.length)+mustDataP.indexOf(d) * heightScalarP + 4;
          } else {
            return 30+(heightScalarP*setDescP.length)+(mustDataP.indexOf(d)+1) * heightScalarP + 4;
          }
        })
        .text(function(d) {
          return d;
        })
        .attr('font-family', 'Lato,Arial,Helvetica,sans-serif')
        .attr('font-size', '13px')
        .attr('fill', 'black');

      if (notDataP.length !== 0) {
        metaSvgP.selectAll("dataObject")
          .data(notSetDescP)
          .enter()
          .append('text')
          .attr('dy', '24px')
          .attr('x', 7)
          .attr('y', function(d,i) {
            if (!useAnchorP) {
              return 30+(heightScalarP*setDescP.length)+(i+mustDataP.length-1) * heightScalarP;
            } else {
              return 30+(heightScalarP*setDescP.length)+(i+mustDataP.length) * heightScalarP;
            }
          })
          .text(function (d) { return d })
          .attr('font-family', 'Lato,Arial,Helvetica,sans-serif')
          .attr('font-size', '14px')
          .attr('fill', 'black');

        // const notTestCirclesP =
        metaSvgP
          .selectAll('dataObject')
          .data(notDataP)
          .enter()
          .append('circle')
          .style('fill', 'red')
          .attr('cx', 17)
          .attr('cy', function(d,i) {
            if (!useAnchorP) {
              return 30+4+heightScalarP*(i+setDescP.length+notSetDescP.length+mustDataP.length);
            } else {
              return 30+4+heightScalarP*(i+setDescP.length+notSetDescP.length+mustDataP.length+1);
            }
          })
          .attr('r', 4);

        // const notTextP =
        metaSvgP
          .selectAll('svg.dataObject')
          .data(notDataP)
          .enter()
          .append('text')
          .attr('x', 25)
          .attr('y', function(d,i) {
            if (!useAnchorP) {
              return 30+8+heightScalarP*(i+setDescP.length+notSetDescP.length+mustDataP.length);
            } else {
              return 30+8+heightScalarP*(i+setDescP.length+notSetDescP.length+mustDataP.length+1);
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

  prepareMultiset(uDataP, uAnchorP, uSettingsP, baseP) {
    const self = this;
    let datasetP = uDataP;
    if (uSettingsP.useAnchorP && datasetP.indexOf(uAnchorP) !== 0) {
      let anchorPIndex = datasetP.indexOf(uAnchorP);
      datasetP.splice(anchorPIndex, 1);
      datasetP.unshift(uAnchorP);
    }
    let mustDataP = uSettingsP.mustP;
    let notDataP = uSettingsP.notP;

    // Sizing
    let heightScalarP = 1;
    if (uSettingsP.heightScalarP !== undefined) {
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
    const maxWidth = 340 * heightScalarP;

    //Set the width of the svg to depending on the size of the largest test element
    let longest = 0;
    if (datasetP[0]) {
      longest = datasetP[0].length;
      for (let i = 1; i < datasetP.length; i++) {
        if (datasetP[i].length > longest) {
          longest = datasetP[i].length;
        }
      }
    }
    const circlesWidth = 4 * circlePadding + 6 * circleRadius;
    let textElementWidth = longest * 10 * heightScalarP;
    let svgWidthP = circlesWidth + textElementWidth;
    if (svgWidthP < minWidth) {
      svgWidthP = minWidth;
      textElementWidth = svgWidthP - circlesWidth;
    } else if (svgWidthP > maxWidth) {
      svgWidthP = maxWidth;
      textElementWidth = svgWidthP - circlesWidth;
    }

    //Colors
    // let chosenColorCodeP = '#00FF40';
    let chosenColorCodeP = 'var(--color-primary)';
    let baseColorCodeP = '#585858';
    let backgroundColorCodeP = '#E6E6E6';
    //Adding settings colors
    if (uSettingsP.colors !== undefined) {
      if (uSettingsP.colors.chosen !== undefined) {
        chosenColorCodeP = uSettingsP.colors.chosen;
      }
      if (uSettingsP.colors.baseP !== undefined) {
        baseColorCodeP = uSettingsP.colors.baseP;
      }
      if (uSettingsP.colors.background !== undefined) {
        backgroundColorCodeP = uSettingsP.colors.background;
      }
    }

    // const topBox =
    baseP.append('div').style('padding-bottom', '5px');

    const svg = baseP
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
      .selectAll('svg')
      .data(datasetP)
      .enter()
      .append('circle')
      .style('fill', baseColorCodeP)
      .attr('cx', circlePadding + circleRadius)
      .attr('cy', function(d) {
        return (
          datasetP.indexOf(d) * (2 * circleRadius) +
          (topBoxHeightP + circleRadius + circlePadding) +
          datasetP.indexOf(d) * circlePadding
        );
      })
      .attr('r', circleRadius)
      .style('stroke', d =>
        mustDataP.includes(d) || d === uAnchorP
          ? chosenColorCodeP
          : 'transparent'
      )
      .attr('stroke-width', circleRadius / 5)
      .on('click', function(d) {
        if (!mustDataP.includes(d) && d !== uAnchorP) {
          mustDataP.push(d);
          if (notDataP.includes(d)) {
            notDataP.splice(notDataP.indexOf(d), 1);
          }
          updateCircles();
          self.props.onHandleSetChange({ mustP: mustDataP, notP: notDataP });
        }
      });

    const maybeCircles = svg
      .selectAll('svg.dataObject')
      .data(datasetP)
      .enter()
      .append('circle')
      .style('fill', backgroundColorCodeP)
      .attr('cx', 2 * circlePadding + 3 * circleRadius)
      .attr('cy', function(d) {
        return (
          datasetP.indexOf(d) * (2 * circleRadius) +
          (topBoxHeightP + circleRadius + circlePadding) +
          datasetP.indexOf(d) * circlePadding
        );
      })
      .attr('r', circleRadius)
      .style('stroke', d =>
        !notDataP.includes(d) && !mustDataP.includes(d) && d !== uAnchorP
          ? chosenColorCodeP
          : baseColorCodeP
      )
      .attr('stroke-width', circleRadius / 5)
      .on('click', function(d) {
        if (mustDataP.includes(d) && d !== uAnchorP) {
          mustDataP.splice(mustDataP.indexOf(d), 1);
        }
        if (notDataP.includes(d) && d !== uAnchorP) {
          notDataP.splice(notDataP.indexOf(d), 1);
        }
        updateCircles();
        self.props.onHandleSetChange({ mustP: mustDataP, notP: notDataP });
      });

    // const miniMaybeCircles =
    svg
      .selectAll('svg.dataObject')
      .data(datasetP)
      .enter()
      .append('circle')
      .style('fill', baseColorCodeP)
      .attr('cx', 2 * circlePadding + 3 * circleRadius)
      .attr('cy', function(d) {
        return (
          datasetP.indexOf(d) * (2 * circleRadius) +
          (topBoxHeightP + circleRadius + circlePadding) +
          datasetP.indexOf(d) * circlePadding
        );
      })
      .attr('r', circleRadius / 3)
      .on('click', function(d) {
        if (mustDataP.includes(d) && d !== uAnchorP) {
          mustDataP.splice(mustDataP.indexOf(d), 1);
        }
        if (notDataP.includes(d) && d !== uAnchorP) {
          notDataP.splice(notDataP.indexOf(d), 1);
        }
        updateCircles();
        self.props.onHandleSetChange({ mustP: mustDataP, notP: notDataP });
      });

    const notCircles = svg
      .selectAll('svg.dataObject')
      .data(datasetP)
      .enter()
      .append('circle')
      .style('fill', backgroundColorCodeP)
      .attr('cx', 3 * circlePadding + 5 * circleRadius)
      .attr('cy', function(d) {
        return (
          datasetP.indexOf(d) * (2 * circleRadius) +
          (topBoxHeightP + circleRadius + circlePadding) +
          datasetP.indexOf(d) * circlePadding
        );
      })
      .attr('r', circleRadius)
      .style('stroke', d =>
        notDataP.includes(d) && d !== uAnchorP
          ? chosenColorCodeP
          : 'transparent'
      )
      .attr('stroke-width', circleRadius / 5)
      .on('click', function(d) {
        if (!notDataP.includes(d) && d !== uAnchorP) {
          notDataP.push(d);
          if (mustDataP.includes(d)) {
            mustDataP.splice(mustDataP.indexOf(d), 1);
          }
          updateCircles();
          self.props.onHandleSetChange({ mustP: mustDataP, notP: notDataP }); // updateGlobalVariables();
        }
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
      .attr('y', function(d) {
        return (
          datasetP.indexOf(d) * (2 * circleRadius) +
          (topBoxHeightP + circleRadius + circlePadding) +
          datasetP.indexOf(d) * circlePadding +
          circleRadius / 2
        );
      })
      .text(function(d) {
        return d;
      })
      .attr('font-family', 'Lato,Arial,Helvetica,sans-serif')
      .attr('font-weight', d => (d === uAnchorP ? 'bold' : 'normal'))
      .attr('font-size', function() {
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
          ')'
      )
      .text('Must')
      .attr('font-family', 'Lato,Arial,Helvetica,sans-serif')
      .attr('font-size', function() {
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
          ')'
      )
      .text('Maybe')
      .attr('font-family', 'Lato,Arial,Helvetica,sans-serif')
      .attr('font-size', function() {
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
          ')'
      )
      .text('Not')
      .attr('font-family', 'Lato,Arial,Helvetica,sans-serif')
      .attr('font-size', function() {
        return heightScalarP * 14 + 'px';
      })
      .attr('fill', 'black');
    if (
      uSettingsP.numElementsP !== undefined &&
      uSettingsP.maxElementsP !== undefined
    ) {
      // const numElementsPLine =
      svg
        .append('line')
        .attr('class', 'numElements')
        .attr('x1', 4 * circlePadding + 6 * circleRadius)
        .attr('x2', function() {
          return (
            4 * circlePadding +
            6 * circleRadius +
            (textElementWidth - 85 * heightScalarP) *
              (uSettingsP.numElementsP / uSettingsP.maxElementsP) +
            3
          );
        })
        .attr('y1', topBoxHeightP - 10 * heightScalarP)
        .attr('y2', topBoxHeightP - 10 * heightScalarP)
        .attr('stroke', chosenColorCodeP)
        .attr('stroke-width', 10 * heightScalarP);

      const numElementsP = svg
        .selectAll('svg.dataObject')
        .data([uSettingsP.numElementsP])
        .enter()
        .append('text')
        .attr('class', 'numElements')
        .attr('x', function() {
          return (
            4 * circlePadding +
            6 * circleRadius +
            (textElementWidth - 85 * heightScalarP) *
              (uSettingsP.numElementsP / uSettingsP.maxElementsP) +
            6
          );
        })
        .attr('y', topBoxHeightP - 6 * heightScalarP);

      // const numElementsPText =
      numElementsP
        .text(function(d) {
          const dText =
            uSettingsP.numElementsP !== uSettingsP.maxElementsP
              ? `${d} of ${uSettingsP.maxElementsP}`
              : d;
          return dText;
        })
        .attr('font-family', 'Lato,Arial,Helvetica,sans-serif')
        .attr('font-size', function() {
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
          topBoxHeightP - 1 + circleRadius + circlePadding - circleRadius / 6
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
          topBoxHeightP + circleRadius + circlePadding - circleRadius / 6
        )
        .attr('width', (circleRadius * 2) / 3)
        .attr('height', (circleRadius * 2) / 3);
    }

    function updateCircles() {
      mustCircles
        .style('stroke', d =>
          mustDataP.includes(d) || d === uAnchorP
            ? chosenColorCodeP
            : 'transparent'
        )
        .attr('stroke-width', circleRadius / 5);
      maybeCircles
        .style('stroke', d =>
          !notDataP.includes(d) && !mustDataP.includes(d) && d !== uAnchorP
            ? chosenColorCodeP
            : baseColorCodeP
        )
        .attr('stroke-width', circleRadius / 5);
      notCircles
        .style('stroke', d =>
          notDataP.includes(d) ? chosenColorCodeP : 'transparent'
        )
        .attr('stroke-width', circleRadius / 5);
    }
  }

  handleDropdownChange = (evt, { name, value, index}) => {
    this.props.onHandleDropdownChange(evt, { name, value, index});
  };

  handleInputChange = (evt, { name, value, index }) => {
    this.props.onHandleInputChange(evt, { name, value, index });
  };
  addFilter=()=>{ 
    this.props.onAddFilter();
  };
  removeFilter=(index)=>{
    this.props.onRemoveFilter(index)
  }
  changeHoveredFilter=(index)=>{
    this.props.onChangeHoveredFilter(index);
  }

  render() {
    const {
      selectedOperatorP,
      selectedColP,
      sigValueP,
      uSettingsP
    } = this.props;
    const ColumnsP = uSettingsP.thresholdColsP;
    const OperatorsP = uSettingsP.thresholdOperatorP;
    const SelOpP = selectedOperatorP;
    const SelColP = selectedColP;
    const indexFiltersP = uSettingsP.indexFiltersP;
    const hoveredFilter = uSettingsP.hoveredFilter;
    const removeButtonStyling = {
      position: "absolute",
      marginTop: "15px"
    }

    return (
      <Fragment>
        <Form className="MultisetDropdownContainer">
          <ul style={{padding:"0px"}}>
          {indexFiltersP.map(index =><Form.Group
            key={index} 
            onMouseEnter={()=>this.changeHoveredFilter(index)}
            onMouseLeave={()=>this.changeHoveredFilter(-1)}
            >
            <Form.Field
              control={Select}
              label="Column"
              name="selectedColP"
              className="ThresholdColumnReadOnly"
              index={index}
              // selection
              value={SelColP[index].value}
              options={ColumnsP}
              width={7}
              onChange={this.handleDropdownChange}
            ></Form.Field>
            {hoveredFilter===index && indexFiltersP.length !== 1 &&
            <Button circular icon style={removeButtonStyling} size="mini" compact onClick={()=>this.removeFilter(index)}>
              <Icon name="minus circle" color={"red"}/>
            </Button>}
            <Form.Field
              control={Select}
              label="Operator"
              name="selectedOperatorP"
              className="ThresholdOperatorSelect"
              index={index}
              // selection
              value={SelOpP[index].value}
              options={OperatorsP}
              width={4}
              onChange={this.handleDropdownChange}
            ></Form.Field>
            <Form.Field
              control={Input}
              type="number"
              step="0.01"
              min="0"
              label="Significance"
              name="sigValueP"
              className="SignificantValueInput"
              index={index}
              value={sigValueP[index]}
              width={5}
              onChange={this.handleInputChange}
            ></Form.Field>
          </Form.Group>
        )}</ul>
        <Button circular compact size="mini" icon onClick={this.addFilter}>
          <Icon name="plus circle" color={"green"}/>
        </Button>
        </Form>
        <p id="multiset-query-p" className="MultisetQueryPContainer"></p>
      </Fragment>
    );
  }
}

export default PepplotMultisetFilters;
