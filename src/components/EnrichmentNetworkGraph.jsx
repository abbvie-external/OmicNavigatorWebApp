import React, { Component } from 'react';
import { Header, Segment, Icon } from 'semantic-ui-react';
// import { phosphoprotService } from '../services/phosphoprot.service';
import { withRouter } from 'react-router-dom';
// import ButtonActions from './ButtonActions';
import SplitPanesContainer from './SplitPanesContainer';
import SearchingAlt from './SearchingAlt';
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
    // const {
    //   enrichmentResults,
    //   enrichmentColumns,
    //   enrichmentStudy,
    //   enrichmentModel,
    //   enrichmentAnnotation
    // } = this.props;
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
        <React.Fragment>
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
        </React.Fragment>
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
