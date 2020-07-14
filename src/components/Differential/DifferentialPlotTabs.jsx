import React, { Component } from 'react';
import { Tab } from 'semantic-ui-react';
import { phosphoprotService } from '../../services/phosphoprot.service';
// import ButtonActions from '../Shared/ButtonActions';
import MetafeaturesTable from './MetafeaturesTable';
// import * as d3 from 'd3';
import '../Shared/SVGPlot.scss';

class SVGPlot extends Component {
  state = {
    metafeaturesData: [],
    areDifferentialPlotTabsReady: false,
  };

  componentDidMount() {
    phosphoprotService
      .getMetaFeaturesTable(
        this.props.differentialStudy,
        this.props.differentialModel,
        this.props.differentialProteinSite,
        this.handleGetMetaFeaturesTableError,
      )
      .then(getMetaFeaturesTableResponseData => {
        const metafeaturesData =
          getMetaFeaturesTableResponseData.length > 0
            ? getMetaFeaturesTableResponseData
            : [];
        this.setState({
          metafeaturesData: metafeaturesData,
          // areDifferentialPlotTabsReady: true,
        });
      })
      .catch(error => {
        console.error('Error during getEnrichmentNetwork', error);
      });
    // .finally(() => {
    //   this.setState({
    //     areDifferentialPlotTabsReady: true,
    //   });
    // });
  }

  // handleGetMetaFeaturesTableError = () => {
  //   this.setState({
  //     areDifferentialPlotTabsReady: true,
  //   });
  // };

  handleTabChange = (e, { activeIndex }) => {
    this.props.onDifferentialPlotTableChange(activeIndex);
  };

  handleDiffTable = evt => {
    const key = this.props.imageInfo.key.split(':');
    const name = key[0] || '';
    const diffProtein = this.props.HighlightedProteins[0].sample;
    this.props.onViewDiffTable(name, diffProtein);
  };

  getSVGPanes(activeDifferentialPlotTabsIndex) {
    let panes = [];
    if (this.props.imageInfo.length !== 0) {
      const svgArray = this.props.imageInfo.svg;
      // const svgArrayReversed = svgArray.reverse();
      const svgPanes = svgArray.map(s => {
        return {
          menuItem: `${s.plotType.plotID}`,
          render: () => (
            <Tab.Pane attached="true" as="div">
              <div
                id="PlotSVG"
                className="svgSpan"
                dangerouslySetInnerHTML={{ __html: s.svg }}
              ></div>
            </Tab.Pane>
          ),
        };
      });
      panes = panes.concat(svgPanes);
    }
    if (this.state.metafeaturesData.length !== 0) {
      let metafeaturesTab = [
        {
          menuItem: 'Feature Data',
          render: () => (
            <Tab.Pane attached="true" as="div">
              <MetafeaturesTable {...this.state} {...this.props} />
            </Tab.Pane>
          ),
        },
      ];
      panes = panes.concat(metafeaturesTab);
    }
    return (
      <Tab
        menu={{ secondary: true, pointing: true, className: 'SVGDiv' }}
        panes={panes}
        onTabChange={this.handleTabChange}
        activeIndex={activeDifferentialPlotTabsIndex}
      />
    );
  }

  render() {
    const { activeDifferentialPlotTabsIndex } = this.props;
    const svgPanes = this.getSVGPanes(activeDifferentialPlotTabsIndex);
    return <div className="">{svgPanes}</div>;
  }
}

export default SVGPlot;
