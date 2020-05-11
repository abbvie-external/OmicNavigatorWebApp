import React, { Component } from 'react';
import './PepplotVolcanoPlot.scss';
import * as d3 from 'd3';

class PepplotVolcanoPlot extends Component{
    state = {
        volcanoWidth: 600,
        volcanoHeight: 400,
        plotName:"pepplotVolcanoPlot",
        xAxisLabel:null,
        yAxisLabel:null,
        identifier:null,
        hoveredCircleData:{
            position: [],
            id: null,
            xstat: null,
            ystat: null
        },
        hovering: false,
        hoveredTextScalar: 12,
        tooltipPosition:null,
        brushedCirclesData:[],
        brushing: false
    };

    volcanoSVGRef = React.createRef();

    componentDidMount(){
        const{pepplotResults}= this.props;
        if(pepplotResults.length!==0){
        const pepKeys = Object.keys(pepplotResults[0])
        var id = null
        var xAxis = null
        var yAxis = null
        //Temporarily hard coded for testing purposes.
        //Will change to dynamic selection later.
        if(pepKeys.includes("id")){id = "id"}
        else if(pepKeys.includes("id_mult")){id = "id_mult"}
        if(pepKeys.includes("logFC")){xAxis = "logFC"}
        else if(pepKeys.includes("F")){xAxis = "F"}
        else if(pepKeys.includes("t")){xAxis = "t"}
        if(pepKeys.includes("adj_P_Val")){yAxis = "adj_P_Val"}
        else if(pepKeys.includes("P_Value")){yAxis = "P_Value"}
        this.setState({
            identifier: id,
            xAxisLabel: xAxis,
            yAxisLabel: yAxis
        })
        }
    }

    componentDidUpdate(){
        const{selectedFromTableData} = this.props;
        const circles = d3.selectAll('circle.volcanoPlot-dataPoint');
        circles.classed('highlighted', false);
        selectedFromTableData.forEach(element => {
            const circleid = `${element.id_mult}`;
            const highlightedLine = d3.select(`#volcanoDataPoint-${circleid}`);
            highlightedLine
              .classed('highlighted', true)
        });
    }

    getMaxAndMin(element){
        const{pepplotResults} = this.props;
        var values = [pepplotResults[0][element],pepplotResults[0][element]];
        for(var i = 1; i<pepplotResults.length; i++){
            if(pepplotResults[i][element]> values[1]){
                values[1] = pepplotResults[i][element];
            }else if(pepplotResults[i][element]< values[0]){
                values[0] = pepplotResults[i][element]
            }
        }
        return(values)
    }

    unhighlightBrushedCircles = () => {
        const circles = d3.selectAll('circle.volcanoPlot-dataPoint');
        circles.classed('selected', false);
        circles.classed('highlighted', false);
    };
    handleCircleHover = e =>{
        const {brushing} = this.state;
        if(!brushing){
            const hoveredData = {
                id: e.target.attributes["circleid"].value,
                xstat: e.target.attributes["xstatistic"].value,
                ystat: e.target.attributes["ystatistic"].value,
                position: [e.target.attributes["cx"].value,e.target.attributes["cy"].value]
            }
            const circle = d3.selectAll('circle.volcanoPlot-dataPoint')
                .filter(function(){
                    return(d3.select(this).attr('id')===e.target.attributes["id"].value)
                })
            circle.classed("hovered", true)
            this.setState({
                hoveredCircleData:hoveredData,
                hovering:true
            });
        }
    }
    handleCircleLeave(){
        const circles = d3
            .selectAll('circle.volcanoPlot-dataPoint')
            .classed('hovered', false);
        this.setState({
            hoveredCircleData:{
                position: [],
                id: null,
                xstat: null,
                ystat: null
            },
            hovering: false
        });
    }
    getToolTip(){
        const{
            hoveredCircleData,
            hovering,
            hoveredTextScalar,
            identifier,
            xAxisLabel,
            yAxisLabel
        } = this.state;
        if(hovering){
            const idText = identifier+": "+hoveredCircleData.id;
            const xText = xAxisLabel+": "+hoveredCircleData.xstat;
            const yText = yAxisLabel+": "+hoveredCircleData.ystat;
            return(
                    <text fontSize="14px" fontWeight="bold">
                        <tspan x={hoveredCircleData.position[0]*1+10} y={hoveredCircleData.position[1]}>{idText}</tspan>
                        <tspan x={hoveredCircleData.position[0]*1+10} y={hoveredCircleData.position[1]*1+hoveredTextScalar}>{xText}</tspan>
                        <tspan x={hoveredCircleData.position[0]*1+10} y={hoveredCircleData.position[1]*1+2*hoveredTextScalar}>{yText}</tspan>
                    </text>
                    )
        }else{
            return(null);
        }        
    }
    
    setupBrush(width, height){
        const self = this;
        let objsBrush = {};

        const brushingStart = function() {
            self.setState({
                brushing: true,
                hoveredCircleData:{
                    position: [],
                    id: null,
                    xstat: null,
                    ystat: null
                },
            });
        };
        const highlightBrushedCircles = function(){
            if (d3.event.selection !== undefined && d3.event.selection !== null) {
                const brushedCircles = d3.brushSelection(this);
                const isBrushed = function(x, y) {
                    const brushTest = (brushedCircles[0][0] <= x && x <= brushedCircles[1][0])&&(brushedCircles[0][1] <= y && y <= brushedCircles[1][1]);
                    return brushTest;
                };

                const circles = d3
                    .selectAll('circle.volcanoPlot-dataPoint')
                    .classed('selected', false);

                const brushed = circles
                    .filter(function() {
                      const x = d3.select(this).attr('cx');
                      const y = d3.select(this).attr('cy');
                      return isBrushed(x,y);
                    })
                    .classed('selected', true);

                const brushedDataArr = brushed._groups[0].map(a=>{
                    return (JSON.parse(a.attributes.data.value));
                    
                });
                if(brushedDataArr.length > 0){
                    self.setState({brushedCirclesData: brushedDataArr})
                }
            }
        };
        const endBrush = function(){
            const selection = d3.event.selection;
            if (selection == null) {
              self.handleSVGClick();
            } else {
              self.props.handleVolcanoPlotSelectionChange(self.state.brushedCirclesData);
            }
        };

        if (d3.selectAll('.brush').nodes().length > 0) {
            d3.selectAll('.brush').remove();
        }

        objsBrush = d3
            .brush()
            .extent([
                [0, 0],
                [width, height]
            ])
            .on('start', brushingStart)
            .on('brush', highlightBrushedCircles)
            .on('end', endBrush);
        d3.selectAll(".volcanoPlotD3BrushSelection").call(objsBrush);
    }

    handleSVGClick(){
        this.unhighlightBrushedCircles();
        this.props.handleVolcanoPlotSelectionChange([]);
        this.setState({brushing: false})
    }

    render(){
        const{
            volcanoWidth,
            volcanoHeight,
            xAxisLabel,
            yAxisLabel,
            identifier
        } = this.state;
        const{pepplotResults} = this.props;

        const xScale = d3
            .scaleLinear()
            .domain(this.getMaxAndMin(xAxisLabel))
            .range([volcanoWidth*.1, volcanoWidth]);

        const yScale = d3
            .scaleLinear()
            .domain(this.getMaxAndMin(yAxisLabel))
            .range([volcanoHeight*.9, 0]);

        const yAxis = <line
            className="volcanoPlotYAxis"
            x1={volcanoWidth*.1}
            x2={volcanoWidth*.1}
            y1={0}
            y2={volcanoHeight - volcanoHeight*.05}
        />;
        const xAxis = <line
            className="volcanoPlotXAxis"
            x1={0}
            x2={volcanoWidth}
            y1={volcanoHeight - volcanoHeight*.1}
            y2={volcanoHeight - volcanoHeight*.1}
        />;

        const xAxisTicks = xScale.ticks().map(value => ({
            value,
            xOffset: xScale(value)
          }));
      
          const xPlotTicks = xAxisTicks.map(({ value, xOffset }) => (
            <g
              key={value}
              className="individualTick"
              transform={`translate(${xOffset}, ${volcanoHeight - volcanoHeight*.1})`}
            >
              <line y2="8" stroke="currentColor" />
              <text
                key={value}
                style={{
                  fontSize: '12px',
                  textAnchor: 'middle',
                  transform: 'translateY(20px)'
                }}
              >
                {value}
              </text>
            </g>
          ));
          const yAxisTicks = yScale.ticks().map(value => ({
            value,
            yOffset: yScale(value)
          }));
      
          const yPlotTicks = yAxisTicks.map(({ value, yOffset }) => (
            <g
              key={value}
              className="individualTick"
              transform={`translate(0,${yOffset})`}
            >
              <line 
                    x1={volcanoWidth*.085}
                    x2={volcanoWidth*.1}
                    stroke="currentColor" />
              <text
                key={value}
                style={{
                  fontSize: '12px',
                  textAnchor: 'middle',
                  transform: `translate(20px, 3px)`
                }}
              >
                {value}
              </text>
            </g>
          ));
        
        const plotCircles = pepplotResults.map(val => (<circle
                r={2}
                className="volcanoPlot-dataPoint"
                id={`volcanoDataPoint-${val[identifier]}`}
                circleid={`${val[identifier]}`}
                key={`${val[identifier]}`}
                data={`${JSON.stringify(val)}`}
                onMouseEnter={e => this.handleCircleHover(e)}
                onMouseLeave={()=>this.handleCircleLeave()}
                xstatistic={`${val[xAxisLabel]}`}
                ystatistic={`${val[yAxisLabel]}`}
                cx={`${xScale(val[xAxisLabel])}`}
                cy={`${yScale(val[yAxisLabel])}`}
                cursor="crosshair"
        ></circle>
        ));

        const hoveredCircleTooltip = this.getToolTip();

        this.setupBrush(volcanoWidth, volcanoHeight);
        
        if(identifier !== null && xAxisLabel !== null && yAxisLabel !== null){
        return(
        <div className="volcanoPlotContainer">
            <svg id="pepplotVolcanoPlot"
                className="volcanoPlotSVG"
                width={volcanoWidth} 
                height={volcanoHeight}
                ref={this.volcanoSVGRef}
                onClick={()=>this.handleSVGClick()}
                >
                <g className="volcanoPlotD3BrushSelection"/>
                {yAxis}
                {xAxis}
                {/*X Axis Label*/}
                <text className="axisLabel" transform={`translate(${volcanoWidth / 2}, ${volcanoHeight})`}>
                    {xAxisLabel}
                </text>
                {/*Y Axis Label*/}
                <text className="axisLabel" transform={`rotate(-90,0,${volcanoHeight*.5})`} x="0" y={`${volcanoHeight*.5}`}>
                    {yAxisLabel}
                </text>

                {xPlotTicks}
                {yPlotTicks}
                {plotCircles}
                {hoveredCircleTooltip}
            </svg>
        </div>
        )
        }else{
            return(null)
        }
    }
}
export default PepplotVolcanoPlot;