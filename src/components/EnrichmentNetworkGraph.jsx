import React, { Component } from 'react';
import { Header } from 'semantic-ui-react';
import { phosphoprotService } from '../services/phosphoprot.service';
import { withRouter } from 'react-router-dom';
import ButtonActions from './ButtonActions';
import SplitPanesContainer from './SplitPanesContainer';
import SearchingAlt from './SearchingAlt';
import _ from 'lodash';

class EnrichmentNetworkGraph extends Component {
  static defaultProps = {
    enrichmentStudy: '',
    enrichmentModel: '',
    annotation: '',
    enrichmentResults: [],
    enrichmentColumns: [],
    isTestSelected: false
  };

  constructor(props) {
    super(props);
    debugger;
    this.state = {
      treeDataRaw: [],
      treeData: [],
      treeDataColumns: [],
      plotType: [],
      imageInfo: {
        key: null,
        title: '',
        svg: []
      },
      currentSVGs: [],
      isTestDataLoaded: false
    };
  }

  componentDidMount() {}

  showBarcodePlot = (dataItem, barcode, test, largest) => {
    // this.bData = barcode;
    // this.bSettings = {
    //   lineID: "",
    //   statLabel: barcode[0].statLabel,
    //   statistic: 'statistic',
    //   highLabel: barcode[0].highLabel,
    //   lowLabel: barcode[0].lowLabel,
    //   highStat: largest,
    //   enableBrush: true
    // }
    this.setState({
      isTestDataLoaded: true
    });
  };

  testSelectedTransition = () => {
    this.setState({
      isTestSelected: true
    });
  };

  render() {
    const {
      enrichmentResults,
      enrichmentColumns,
      enrichmentStudy,
      enrichmentModel,
      annotation
    } = this.props;

    if (!this.state.isTestSelected) {
      return (
        <Header as="h2" textAlign="center">
          Network Graph Goes Here...
        </Header>
      );
    } else if (this.state.isTestSelected && !this.state.isTestDataLoaded) {
      return (
        <div>
          <SearchingAlt />
        </div>
      );
    } else {
      return (
        <div>
          <SplitPanesContainer
            {...this.props}
            {...this.state}
            onBackToTable={this.backToTable}
          ></SplitPanesContainer>
        </div>
      );
    }
  }
}

export default withRouter(EnrichmentNetworkGraph);
