import React, { Component } from 'react';
import './PepplotVolcanoPlot.scss';
import * as d3 from 'd3';

class PepplotVolcanoPlot extends Component{
    state = {
        volcanoWidth: 500,
        volcanoHeight: 300,
        plotName:"pepplotVolcanoPlot",
        xAxisLabel:"pValue",
        yAxisLabel:"logFC"
    };
    volcanoContainerRef = React.createRef();
    volcanoSVGRef = React.createRef();

    render(){
        const{
            volcanoWidth,
            volcanoHeight,
            xAxisLabel,
            yAxisLabel
        } = this.state;
        const{volcanoPlotData} = this.props;

        const xScale = d3
            .scaleLinear()
            .domain([0, 1])
            .range([volcanoWidth*.05, volcanoWidth]);

        const yScale = d3
            .scaleLinear()
            .domin([Math.min([-10]),Math.max([10])])
            .range([volcanoHeight*.05, volcanoHeight])

        const yAxis = <line
            className="volcanoPlotYAxis"
            x1={volcanoWidth*.1}
            x2={volcanoWidth*.1}
            y1={volcanoHeight*.05}
            y2={volcanoHeight - volcanoHeight*.05}
        />;
        const xAxis = <line
            className="volcanoPlotXAxis"
            x1={volcanoWidth*.05}
            x2={volcanoWidth - volcanoWidth*.05}
            y1={volcanoHeight - volcanoHeight*.1}
            y2={volcanoHeight - volcanoHeight*.1}
        />;

        const xAxisTicks = <line/>;
        
        return(
        <div className="volcanoPlotContainer">
            <svg id="pepplotVolcanoPlot"
                className="volcanoPlotSVG"
                width={volcanoWidth} 
                height={volcanoHeight}
                >
                <rect
                    className="volcanoRect"
                    width={volcanoWidth} 
                    height={volcanoHeight}
                >
                </rect>
                {yAxis}
                {xAxis}
                {/*X Axis Label*/}
                <text className="axisLabel" transform={`translate(${volcanoWidth / 2}, ${volcanoHeight})`}>
                    {xAxisLabel}
                </text>
                {/*Y Axis Label*/}
                <text className="axisLabel" transform={`translate(${0}, ${volcanoHeight/2})`}>
                    {yAxisLabel}
                </text>
            </svg>
        </div>
        )
    }
}
export default PepplotVolcanoPlot;