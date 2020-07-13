import React, { Component } from 'react';
import { Loader, Dimmer, Tab } from 'semantic-ui-react';
import { phosphoprotService } from '../../services/phosphoprot.service';
// import ButtonActions from '../Shared/ButtonActions';
import MetafeaturesTable from './MetafeaturesTable';
// import * as d3 from 'd3';
import '../Shared/SVGPlot.scss';

class SVGPlot extends Component {
  state = {
    metafeaturesData: [],
    arePepplotPlotTabsReady: false,
  };

  componentDidMount() {
    phosphoprotService
      .getMetaFeaturesTable(
        this.props.pepplotStudy,
        this.props.pepplotModel,
        this.props.pepplotProteinSite,
        this.handleGetMetaFeaturesTableError,
      )
      .then(getMetaFeaturesTableResponseData => {
        const metafeaturesData =
          getMetaFeaturesTableResponseData.length > 0
            ? getMetaFeaturesTableResponseData
            : [];
        this.setState({
          metafeaturesData: metafeaturesData,
          arePepplotPlotTabsReady: true,
        });
      })
      .catch(error => {
        console.error('Error during getEnrichmentNetwork', error);
      });
    // .finally(() => {
    //   debugger;
    //   this.setState({
    //     arePepplotPlotTabsReady: true,
    //   });
    // });
  }

  handleGetMetaFeaturesTableError = () => {
    this.setState({
      arePepplotPlotTabsReady: true,
    });
  };

  handleTabChange = (e, { activeIndex }) => {
    this.props.onPepplotPlotTableChange(activeIndex);
  };

  handleDiffTable = evt => {
    const key = this.props.imageInfo.key.split(':');
    const name = key[0] || '';
    const diffProtein = this.props.HighlightedProteins[0].sample;
    this.props.onViewDiffTable(name, diffProtein);
  };

  getSVGPanes(activePepplotPlotTabsIndex) {
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
          menuItem: 'Metafeatures',
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
        activeIndex={activePepplotPlotTabsIndex}
      />
    );
  }

  getButtonActionsClass = () => {
    // if (
    // this.props.activeIndex === 1 &&
    // this.props.activeIndexPepplotView === 0
    // this.props.tab === 'pepplot'
    // ) {
    // return 'export-svg Hide';
    // } else {
    return 'export-svg ShowBlock';
    // }
  };

  render() {
    const { arePepplotPlotTabsReady } = this.state;
    const { activePepplotPlotTabsIndex } = this.props;

    if (!arePepplotPlotTabsReady) {
      return (
        <div>
          <Dimmer active inverted>
            <Loader size="large">Metafeatures Loading</Loader>
          </Dimmer>
        </div>
      );
    } else {
      const svgPanes = this.getSVGPanes(activePepplotPlotTabsIndex);
      return <div className="">{svgPanes}</div>;
    }
  }
}

export default SVGPlot;
