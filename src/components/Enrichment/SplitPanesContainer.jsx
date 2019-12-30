import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Grid, Dimmer, Loader, Button, Tab, Popup } from 'semantic-ui-react';
import EnrichmentBreadcrumbs from './EnrichmentBreadcrumbs';
import ButtonActions from '../Shared/ButtonActions';
// import PlotSVG from './PlotSVG';
import SplitPane from 'react-split-pane';
import './SplitPanesContainer.scss';
import SVGPlot from '../Shared/SVGPlot';
import BarcodePlot from './BarcodePlot';
import ViolinPlot from './ViolinPlot';
import FilteredPepplotTable from './FilteredPepplotTable';

import { phosphoprotService } from '../../services/phosphoprot.service';
import _ from 'lodash';
import { formatNumberForDisplay, splitValue } from '../Shared/helpers';
import phosphosite_icon from '../../resources/phosphosite.ico';

import QHGrid from '../utility/QHGrid';
import EZGrid from '../utility/EZGrid';
import QuickViewModal from '../utility/QuickViewModal';
import {
  getFieldValue,
  getField,
  typeMap
} from '../utility/selectors/QHGridSelector';
export * from '../utility/FilterTypeConfig';
export * from '../utility/selectors/quickViewSelector';
export { QHGrid, EZGrid, QuickViewModal };
export { getField, getFieldValue, typeMap };

class SplitPanesContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeSVGTabIndex: 0,
      proteinForDiffView: '',
      barcodeSplitPaneSize:
        parseInt(localStorage.getItem('barcodeSplitPos'), 10) || 250,
      activeViolinTableIndex: 0,
      filteredBarcodeData: [],
      filteredPepplotConfigCols: []
    };
  }

  componentDidMount() {
    // this.getFilteredPepplotConfigCols(this.props.barcodeSettings.barcodeData);
    const filteredPepplotConfigCols = this.getFilteredPepplotConfigCols(
      this.props.barcodeSettings.barcodeData
    );
    this.setState({
      filteredPepplotColumns: filteredPepplotConfigCols
    });
  }

  handleSVGTabChange = activeTabIndex => {
    this.setState({
      activeSVGTabIndex: activeTabIndex
    });
  };

  setProteinForDiffView = proteinSite => {
    this.setState({
      proteinForDiffView: proteinSite
    });
  };

  getBarcodePlot = () => {
    const { isTestDataLoaded } = this.props;

    if (!isTestDataLoaded) {
      return (
        <div>
          <Dimmer active inverted>
            <Loader size="large">Barcode Plot is Loading</Loader>
          </Dimmer>
        </div>
      );
    } else {
      return (
        <BarcodePlot
          className="BarcodePlotContainer"
          {...this.state}
          {...this.props}
          onSetProteinForDiffView={this.setProteinForDiffView}
        />
      );
    }
  };

  getTableData = () => {
    if (this.props.barcodeSettings.brushedData.length > 0) {
      const brushedMultIds = this.props.barcodeSettings.brushedData.map(
        b => b.id_mult
      );
      const filteredPepplotData = this.state.filteredBarcodeData.filter(d =>
        brushedMultIds.includes(d.id_mult)
      );
      return filteredPepplotData;
    } else {
      return [];
    }
  };

  getViolinPlot = () => {
    const {
      isViolinPlotLoading,
      isViolinPlotLoaded,
      violinData,
      violinSettings
    } = this.props;
    // isViolinPlotLoaded
    if (!isViolinPlotLoading && !isViolinPlotLoaded) {
      return (
        <div className="PlotInstructionsDiv">
          <h4 className="PlotInstructionsText">
            Select barcode line/s to display Violin Plot
          </h4>
        </div>
      );
    } else if (isViolinPlotLoading) {
      return (
        <Dimmer active inverted>
          <Loader size="large">Violin Plot is Loading</Loader>
        </Dimmer>
      );
    } else {
      return (
        <ViolinPlot
          className="ViolinPlotContainer"
          {...this.state}
          {...this.props}
        />
      );
    }
  };

  handleViolinTableTabChange = (e, { activeIndex }) => {
    this.setState({
      activeViolinTableIndex: activeIndex
    });
  };

  getFilteredPepplotConfigCols = barcodeData => {
    if (this.state.filteredBarcodeData.length > 0) {
      this.setConfigCols(this.state.filteredBarcodeData);
    } else {
      const key = this.props.imageInfo.key.split(':');
      const name = key[0] || '';
      phosphoprotService
        .getTestData(
          this.props.enrichmentModel,
          name,
          this.props.enrichmentStudy + 'plots'
        )
        .then(dataFromService => {
          // const dataParsed = JSON.parse(dataFromService);
          const barcodeMultIds = barcodeData.map(b => b.id_mult);
          const filteredData = dataFromService.filter(d =>
            barcodeMultIds.includes(d.id_mult)
          );
          // const filteredData = _.intersectionWith(datafFromService, allTickIds, _.isEqual);
          // const diffProtein = this.props.proteinForDiffView.lineID;
          // this.props.onViewDiffTable(name, diffProtein);
          const cols = this.setConfigCols(filteredData);
          return cols;
        });
    }
  };

  setConfigCols = filteredData => {
    let self = this;
    const model = this.props.enrichmentModel;
    let initConfigCols = [];

    const TableValuePopupStyle = {
      backgroundColor: '2E2E2E',
      borderBottom: '2px solid #FF4400',
      color: '#FFF',
      padding: '1em',
      maxWidth: '50vw',
      fontSize: '13px',
      wordBreak: 'break-all'
    };

    let icon = phosphosite_icon;
    let iconText = 'PhosphoSitePlus';

    if (model === 'Differential Expression') {
      initConfigCols = [
        {
          title: 'MajorityProteinIDsHGNC',
          field: 'MajorityProteinIDsHGNC',
          filterable: { type: 'alphanumericFilter' },
          template: (value, item, addParams) => {
            return (
              <div>
                {/* ref={this.highlightRef()}> */}
                <Popup
                  trigger={
                    <span
                      className="TableCellLink"
                      // onClick={addParams.showPlot(model, item)}
                    >
                      {splitValue(value)}
                    </span>
                  }
                  content={value}
                  style={TableValuePopupStyle}
                  className="TablePopupValue"
                  inverted
                  basic
                />
                <Popup
                  trigger={
                    <img
                      src={icon}
                      alt="Phosophosite"
                      className="ExternalSiteIcon"
                      // onClick={addParams.showPhosphositePlus(item)}
                    />
                  }
                  style={TableValuePopupStyle}
                  className="TablePopupValue"
                  content={iconText}
                  inverted
                  basic
                />
              </div>
            );
          }
        },
        {
          title: 'MajorityProteinIDs',
          field: 'MajorityProteinIDs',
          filterable: { type: 'alphanumericFilter' },
          template: (value, item, addParams) => {
            return (
              <Popup
                trigger={
                  <span className="TableValue">{splitValue(value)}</span>
                }
                content={value}
                style={TableValuePopupStyle}
                className="TablePopupValue"
                inverted
                basic
              />
            );
          }
        }
      ];
    } else {
      initConfigCols = [
        {
          title: 'Protein_Site',
          field: 'Protein_Site',
          filterable: { type: 'alphanumericFilter' },
          template: (value, item, addParams) => {
            return (
              <div>
                {/* ref={this.highlightRef()} */}
                <Popup
                  trigger={
                    <span
                      className="TableCellLink"
                      // onClick={addParams.showPlot(model, item)}
                    >
                      {splitValue(value)}
                    </span>
                  }
                  style={TableValuePopupStyle}
                  className="TablePopupValue"
                  content={value}
                  inverted
                  basic
                />
                <Popup
                  trigger={
                    <img
                      src={icon}
                      alt="Phosophosite"
                      className="ExternalSiteIcon"
                      // onClick={addParams.showPhosphositePlus(item)}
                    />
                  }
                  style={TableValuePopupStyle}
                  className="TablePopupValue"
                  content={iconText}
                  inverted
                  basic
                />
              </div>
            );
          }
        }
      ];
    }
    let relevantConfigCols = [
      'F',
      'logFC',
      't',
      'P_Value',
      'adj_P_Val',
      'adjPVal'
    ];
    if (filteredData.length !== 0 && filteredData.length !== undefined) {
      let orderedTestData = JSON.parse(
        JSON.stringify(filteredData[0], relevantConfigCols)
      );

      let relevantConfigColumns = _.map(
        _.filter(_.keys(orderedTestData), function(d) {
          return _.includes(relevantConfigCols, d);
        })
      );

      // if using multi-set analysis, show set membership column
      if (this.state.multisetQueried) {
        relevantConfigColumns.splice(0, 0, 'Set_Membership');
      }

      const additionalConfigColumns = relevantConfigColumns.map(c => {
        return {
          title: c,
          field: c,
          type: 'number',
          filterable: { type: 'numericFilter' },
          exportTemplate: value => (value ? `${value}` : 'N/A'),
          template: (value, item, addParams) => {
            return (
              <p>
                <Popup
                  trigger={
                    <span className="TableValue">
                      {formatNumberForDisplay(value)}
                    </span>
                  }
                  style={TableValuePopupStyle}
                  className="TablePopupValue"
                  content={value}
                  inverted
                  basic
                />
              </p>
            );
          }
        };
      });
      const configCols = initConfigCols.concat(additionalConfigColumns);
      debugger;
      self.setState({
        filteredBarcodeData: filteredData
        // filteredPepplotConfigCols: configCols
      });
      return configCols;
    }
  };

  getViolinAndTable = () => {
    const { activeViolinTableIndex } = this.state;
    const violinPlot = this.getViolinPlot();
    const tableData = this.getTableData();
    const violinAndTablePanes = [
      {
        menuItem: 'Violin Plot',
        pane: (
          <Tab.Pane
            attached="true"
            key="1"
            id="ViolinPlotTab"
            className="ViolinPlotTab"
            // as="div"
          >
            <div id="" className="">
              {violinPlot}
            </div>
          </Tab.Pane>
        )
      },
      {
        menuItem: 'Table Results',
        pane: (
          <Tab.Pane
            attached="true"
            key="2"
            id="TableResultsTab"
            className="TableResultsTab"
            // as="div"
          >
            <FilteredPepplotTable {...this.state} {...this.props} />
          </Tab.Pane>
        )
      }
    ];

    return (
      <Tab
        onTabChange={this.handleViolinTableTabChange}
        panes={violinAndTablePanes}
        activeIndex={activeViolinTableIndex}
        renderActiveOnly={false}
        menu={{
          stackable: true,
          secondary: true,
          pointing: true,
          className: 'ViolinAndTableMenu'
        }}
      />
    );
  };

  getSVGPlot = () => {
    const tabChangeCb = this.handleSVGTabChange;
    const { SVGPlotLoaded, SVGPlotLoading } = this.props;
    if (!SVGPlotLoaded & !SVGPlotLoading) {
      return (
        <div className="PlotInstructionsDiv">
          <h4 className="PlotInstructionsText">
            Select barcode line/s to display SVG Plot
          </h4>
        </div>
      );
    } else if (!SVGPlotLoaded & SVGPlotLoading) {
      return (
        <Dimmer active inverted>
          <Loader size="large">SVG Plot is Loading</Loader>
        </Dimmer>
      );
    } else {
      return (
        <SVGPlot {...this.props} {...this.state} onSVGTabChange={tabChangeCb} />
      );
    }
  };

  barcodeSplitPaneResized(size) {
    this.setState({
      barcodeSplitPaneSize: size
    });
    localStorage.setItem('barcodeSplitPos', size);
  }

  render() {
    const BarcodePlot = this.getBarcodePlot();
    const ViolinAndTable = this.getViolinAndTable();
    const SVGPlot = this.getSVGPlot();

    // if (!isTestDataLoaded) {
    //   return (
    //     <div>
    //       <Dimmer active inverted>
    //         <Loader size="large">Barcode, Violin, Dot Plots are Loading</Loader>
    //       </Dimmer>
    //     </div>
    //   );
    // } else {
    if (this.props.displayViolinPlot) {
      return (
        <div className="PlotsWrapper">
          <Grid className="">
            <Grid.Row className="ActionsRow">
              <Grid.Column
                mobile={16}
                tablet={16}
                largeScreen={12}
                widescreen={12}
              >
                <EnrichmentBreadcrumbs {...this.props} />
              </Grid.Column>
              {/* <Grid.Column mobile={16} tablet={16} largeScreen={4} widescreen={4}>
                <Button primary className="ViewDiffTableButton" onClick={this.props.onViewDiffTable}>
                  View Differential Table
                </Button>
              </Grid.Column> */}
              {/* <Grid.Column mobile={8} tablet={8} largeScreen={8} widescreen={8}>
                <ButtonActions {...this.props} {...this.state} />
              </Grid.Column> */}

              <Grid.Column
                mobile={16}
                tablet={16}
                largeScreen={16}
                widescreen={16}
              >
                <SplitPane
                  className="ThreePlotsDiv SplitPanesWrapper"
                  split="horizontal"
                  defaultSize={this.state.barcodeSplitPaneSize}
                  minSize={200}
                  maxSize={300}
                  onChange={size => this.barcodeSplitPaneResized(size)}
                >
                  {BarcodePlot}
                  <SplitPane
                    split="vertical"
                    defaultSize={400}
                    minSize={300}
                    maxSize={700}
                  >
                    <div id="ViolinAndTableSplitContainer">
                      {ViolinAndTable}
                    </div>
                    <div id="SVGSplitContainer">{SVGPlot}</div>
                  </SplitPane>
                </SplitPane>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
      );
    } else {
      return (
        <div className="PlotsWrapper">
          <Grid className="">
            <Grid.Row className="ActionsRow">
              <Grid.Column
                mobile={16}
                tablet={16}
                largeScreen={16}
                widescreen={16}
              >
                <EnrichmentBreadcrumbs {...this.props} />
              </Grid.Column>
              {/* <Grid.Column mobile={8} tablet={8} largeScreen={8} widescreen={8}>
                <ButtonActions {...this.props} {...this.state} />
              </Grid.Column> */}
              <Grid.Column
                mobile={16}
                tablet={16}
                largeScreen={16}
                widescreen={16}
              >
                <SplitPane
                  className="TwoPlotsDiv SplitPanesWrapper"
                  split="horizontal"
                  defaultSize={this.state.barcodeSplitPaneSize}
                  minSize={200}
                  maxSize={300}
                  onChange={size => this.barcodeSplitPaneResized(size)}
                >
                  {BarcodePlot}
                  <div id="SVGSplitContainer">{SVGPlot}</div>
                </SplitPane>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
      );
    }
  }
}

export default withRouter(SplitPanesContainer);
