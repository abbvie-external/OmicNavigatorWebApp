import React, { Component } from 'react';
import { Icon, Popup, Button } from 'semantic-ui-react';
// import { phosphoprotService } from '../services/phosphoprot.service';
import { withRouter } from 'react-router-dom';
// import ButtonActions from './ButtonActions';
import SplitPanesContainer from './SplitPanesContainer';
import SearchingAlt from './SearchingAlt';
import './EnrichmentNetworkGraph.scss';
// import _ from 'lodash';

class EnrichmentNetworkGraph extends Component {
  static defaultProps = {
    enrichmentStudy: '',
    enrichmentModel: '',
    enrichmentAnnotation: '',
    enrichmentResults: [],
    enrichmentColumns: [],
    isTestSelected: false
  };

  constructor(props) {
    super(props);
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
    const { upsetPlotAvailable } = this.props;
    // let upsetPlotPulltab = '';
    // if (upsetPlotAvailable) {
    //   upsetPlotPulltab = (
    //     <Button
    //       className="FloatRight PlotPulltab"
    //       onClick={this.props.onHandleAnimationChange('uncover')}
    //     >
    //       PLOT
    //     </Button>
    //   );
    // }

    const IconPopupStyle = {
      backgroundColor: '2E2E2E',
      borderBottom: '2px solid #FF4400',
      color: '#FFF',
      padding: '1em',
      maxWidth: '50vw',
      fontSize: '13px',
      wordBreak: 'break-all'
    };

    const enrichmentViewToggle = (
      <div className="NetworkGraphToggle">
        <Popup
          trigger={
            <Icon
              bordered
              name="table"
              size="large"
              // type="button"
              color="orange"
              className="NetworkGraphButtons"
              inverted={this.props.enrichmentView === 'table'}
              onClick={this.props.onEnrichmentViewChange({
                enrichmentView: 'table'
              })}
            />
          }
          style={IconPopupStyle}
          inverted
          basic
          position="bottom left"
          content="View Table"
        />
        <Popup
          trigger={
            <Icon
              bordered
              name="chart pie"
              size="large"
              // type="button"
              color="orange"
              className="NetworkGraphButtons"
              inverted={this.props.enrichmentView === 'network'}
              onClick={this.props.onEnrichmentViewChange({
                enrichmentView: 'network'
              })}
            />
          }
          style={IconPopupStyle}
          inverted
          basic
          position="bottom left"
          content="View Network Graph"
        />
      </div>
    );

    var divStyle = {
      marginTop: '100px',
      marginLeft: '200px'
    };
    var divStyle2 = {
      marginTop: '0px',
      marginLeft: '700px'
    };
    var divStyle3 = {
      marginTop: '100px',
      marginLeft: '400px'
    };
    if (!this.state.isTestSelected) {
      return (
        <div className="NetworkGraphContainer">
          {enrichmentViewToggle}
          <div style={divStyle}>
            <Icon
              size="big"
              rotated="clockwise"
              color="orange"
              name="chart pie"
              float="right"
            />
            <Icon size="mini" color="black" name="chart pie" />
            <Icon size="massive" name="chart pie" float="left" />
            <Icon
              size="huge"
              flipped="vertically"
              color="grey"
              name="chart pie"
            />
            <Icon
              size="tiny"
              rotated="counterclockwise"
              color="black"
              name="chart pie"
            />
            <Icon size="small" name="chart pie" />
            <br></br>
            <Icon size="big" color="orange" name="chart pie" />
            <Icon size="tiny" color="grey" name="chart pie" float="right" />
            <Icon size="large" rotated="clockwise" name="chart pie" />
            <Icon
              size="big"
              flipped="horizontally"
              color="orange"
              name="chart pie"
            />
            <Icon size="small" color="black" name="chart pie" float="left" />
            <Icon size="big" name="chart pie" />
          </div>
          <div style={divStyle2}>
            <Icon
              size="big"
              rotated="clockwise"
              color="orange"
              name="chart pie"
              float="right"
            />
            <Icon size="mini" color="black" name="chart pie" />
            <Icon size="massive" name="chart pie" float="left" />
            <Icon
              size="huge"
              flipped="vertically"
              color="grey"
              name="chart pie"
            />
            <Icon
              size="tiny"
              rotated="counterclockwise"
              color="black"
              name="chart pie"
            />
            <Icon size="small" name="chart pie" />
            <br></br>
            <Icon size="big" color="orange" name="chart pie" />
            <Icon size="tiny" color="grey" name="chart pie" float="right" />
            <Icon size="large" rotated="clockwise" name="chart pie" />
            <Icon
              size="big"
              flipped="horizontally"
              color="orange"
              name="chart pie"
            />
            <Icon size="small" color="black" name="chart pie" float="left" />
            <Icon size="big" name="chart pie" />
          </div>
          <div style={divStyle3}>
            <Icon
              size="big"
              rotated="clockwise"
              color="orange"
              name="chart pie"
              float="right"
            />
            <Icon size="mini" color="black" name="chart pie" />
            <Icon size="massive" name="chart pie" float="left" />
            <Icon
              size="huge"
              flipped="vertically"
              color="grey"
              name="chart pie"
            />
            <Icon
              size="tiny"
              rotated="counterclockwise"
              color="black"
              name="chart pie"
            />
            <Icon size="small" name="chart pie" />
            <br></br>
            <Icon size="big" color="orange" name="chart pie" />
            <Icon size="tiny" color="grey" name="chart pie" float="right" />
            <Icon size="large" rotated="clockwise" name="chart pie" />
            <Icon
              size="big"
              flipped="horizontally"
              color="orange"
              name="chart pie"
            />
            <Icon size="small" color="black" name="chart pie" float="left" />
            <Icon size="big" name="chart pie" />
          </div>
          {/* {upsetPlotPulltab} */}
        </div>
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
