import React, { Component } from 'react';
import { Icon, Popup, Grid, Search, Radio } from 'semantic-ui-react';
// import { phosphoprotService } from '../services/phosphoprot.service';
import { withRouter } from 'react-router-dom';
// import ButtonActions from './ButtonActions';
import SplitPanesContainer from './SplitPanesContainer';
import SearchingAlt from '../Transitions/SearchingAlt';
import './EnrichmentNetworkGraph.scss';
// import _ from 'lodash';

class EnrichmentNetworkGraph extends Component {
  static defaultProps = {
    enrichmentStudy: '',
    enrichmentModel: '',
    enrichmentAnnotation: '',
    enrichmentResults: [],
    enrichmentColumns: [],
    isTestSelected: false,
    showNetworkLabels: true
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
          <Grid>
            <Grid.Row>
              <Grid.Column
                className="NetworkGraphFilters"
                mobile={6}
                tablet={6}
                largeScreen={3}
                widescreen={2}
              ></Grid.Column>
              <Grid.Column
                className="NetworkGraphFilters"
                mobile={6}
                tablet={6}
                largeScreen={4}
                widescreen={4}
              >
                <Search
                  placeholder="Search Network"
                  // loading={isLoading}
                  // onResultSelect={this.handleResultSelect}
                  // onSearchChange={_.debounce(this.handleSearchChange, 500, {
                  //   leading: true,
                  // })}
                  // results={results}
                  // value={value}
                  // {...this.props}
                />
              </Grid.Column>
              <Grid.Column
                className="NetworkGraphFilters"
                id="NetworkGraphLabelsToggle"
                mobile={6}
                tablet={6}
                largeScreen={3}
                widescreen={4}
              >
                <Radio
                  toggle
                  label="Show Labels"
                  checked={this.state.showNetworkLabels}
                />
              </Grid.Column>
              <Grid.Column
                className="NetworkGraphFilters"
                mobile={6}
                tablet={6}
                largeScreen={3}
                widescreen={3}
              >
                <h3>toggle tbd</h3>
              </Grid.Column>
              <Grid.Column
                className="NetworkGraphFilters"
                mobile={6}
                tablet={6}
                largeScreen={3}
                widescreen={3}
              >
                <h3>legend</h3>
              </Grid.Column>
            </Grid.Row>
          </Grid>
          <div className="NetworkChartWrapper">
            <svg
              className="prefix__network-chart-area prefix__nwChart"
              viewBox="0 0 1600 900"
              preserveAspectRatio="xMinYMin meet"
              // {...this.props}
            >
              <path
                fill="#fdfcfb"
                strokeOpacity={0.25}
                stroke="gray"
                d="M0 0h1600v900H0z"
              />
              <g className="prefix__links" stroke="#0080ff" strokeOpacity={0.3}>
                <path strokeWidth={1.027} d="M1031.884 497.966l96.913 20.481" />
                <path strokeWidth={1.632} d="M649.973 771.026l-44.936-69.665" />
                <path strokeWidth={1.564} d="M649.973 771.026l45.302-73.519" />
                <path strokeWidth={1.769} d="M533.854 183.61l87.049-66.093" />
                <path strokeWidth={1.6} d="M1042.034 693.484l86.763-175.037" />
                <path
                  strokeWidth={1.496}
                  d="M990.239 280.454l138.558 237.993"
                />
                <path
                  strokeWidth={3.242}
                  d="M822.556 540.819L712.615 317.221"
                />
                <path
                  strokeWidth={1.769}
                  d="M822.556 540.819l167.683-260.365"
                />
                <path
                  strokeWidth={1.632}
                  d="M822.556 540.819L605.037 701.361"
                />
                <path strokeWidth={1.837} d="M822.556 540.819L695.628 178.47" />
                <path strokeWidth={1.823} d="M822.556 540.819l-92.142 78.78" />
                <path
                  strokeWidth={1.855}
                  d="M822.556 540.819l219.478 152.665"
                />
                <path
                  strokeWidth={3.288}
                  d="M822.556 540.819l228.077-325.955"
                />
                <path
                  strokeWidth={2.578}
                  d="M822.556 540.819L620.903 117.517"
                />
                <path strokeWidth={1.136} d="M822.556 540.819l41.139 142.508" />
                <path strokeWidth={1.041} d="M822.556 540.819l-69.301 25.011" />
                <path strokeWidth={3.097} d="M822.556 540.819L533.854 183.61" />
                <path
                  strokeWidth={1.236}
                  d="M822.556 540.819l220.738-252.976"
                />
                <path
                  strokeWidth={1.728}
                  d="M822.556 540.819L695.275 697.507"
                />
                <path strokeWidth={3.237} d="M822.556 540.819l306.241-22.372" />
                <path
                  strokeWidth={2.642}
                  d="M822.556 540.819L649.973 771.026"
                />
                <path strokeWidth={1.209} d="M822.556 540.819l52.301 211.933" />
                <path
                  opacity={0.5}
                  strokeWidth={2.501}
                  d="M822.556 540.819L489.193 421.018"
                />
                <path strokeWidth={1.4} d="M822.556 540.819l-36.727 70.799" />
                <path strokeWidth={1.032} d="M822.556 540.819l209.328-42.853" />
                <path strokeWidth={1.35} d="M489.193 421.018l115.844 280.343" />
                <path strokeWidth={1.177} d="M1043.294 287.843l7.339-72.979" />
                <path
                  opacity={0.5}
                  strokeWidth={1.85}
                  d="M775.178 197.879l47.378 342.94"
                />
                <path strokeWidth={1.55} d="M695.628 178.47l-161.774 5.14" />
                <path
                  strokeWidth={1.023}
                  d="M869.269 266.223l-46.713 274.596"
                />
                <path strokeWidth={1.018} d="M869.269 266.223l32.192-152.944" />
                <path
                  strokeWidth={1.223}
                  d="M644.134 676.945l178.422-136.126"
                />
                <path strokeWidth={1.282} d="M637.815 607.122l6.319 69.823" />
                <path strokeWidth={1.487} d="M637.815 607.122l184.741-66.303" />
                <path strokeWidth={1.491} d="M761.78 683.96l60.776-143.141" />
                <path
                  strokeWidth={1.077}
                  d="M698.048 403.014l124.508 137.805"
                />
                <path strokeWidth={1.059} d="M698.048 403.014l14.567-85.793" />
                <path strokeWidth={2.251} d="M901.461 113.279l-280.558 4.238" />
                <path strokeWidth={1.541} d="M901.461 113.279l88.778 167.175" />
                <path
                  strokeWidth={2.501}
                  d="M901.461 113.279l149.172 101.585"
                />
                <path strokeWidth={1.864} d="M901.461 113.279l-126.283 84.6" />
                <path strokeWidth={5.607} d="M901.461 113.279l-78.905 427.54" />
                <path strokeWidth={2.846} d="M901.461 113.279L533.854 183.61" />
                <path
                  strokeWidth={1.177}
                  d="M901.461 113.279l141.833 174.564"
                />
                <path
                  opacity={0.5}
                  strokeWidth={2.328}
                  d="M901.461 113.279l227.336 405.168"
                />
                <path strokeWidth={1.782} d="M901.461 113.279L695.628 178.47" />
                <path strokeWidth={1.045} d="M902.457 484.16l-79.901 56.659" />
                <path strokeWidth={2.123} d="M524.71 595.937l297.846-55.118" />
                <path strokeWidth={1.114} d="M571.623 698.628l33.414 2.733" />
                <path strokeWidth={1.15} d="M571.623 698.628l78.35 72.398" />
                <path
                  strokeWidth={1.182}
                  d="M571.623 698.628l250.933-157.809"
                />
                <path
                  strokeWidth={1.155}
                  d="M926.984 577.765l-104.428-36.946"
                />
                <path strokeWidth={1.023} d="M829.023 305.259l72.438-191.98" />
                <path strokeWidth={1.036} d="M829.023 305.259l-6.467 235.56" />
                <path
                  strokeWidth={1.091}
                  d="M884.781 330.361l16.68-217.082M884.781 330.361l-62.225 210.458"
                />
                <path strokeWidth={1.305} d="M527.946 691.569l36.574-62.862" />
                <path strokeWidth={1.937} d="M527.946 691.569l294.61-150.75" />
                <path strokeWidth={1.523} d="M527.946 691.569l-3.236-95.632" />
                <path
                  strokeWidth={1.596}
                  d="M564.52 628.707l-39.81-32.77M564.52 628.707l258.036-87.888"
                />
                <path strokeWidth={1.873} d="M729.937 210.795l171.524-97.516" />
                <path strokeWidth={1.541} d="M729.937 210.795L673.654 74.712" />
                <path strokeWidth={1.873} d="M729.937 210.795l92.619 330.024" />
                <path strokeWidth={1.814} d="M729.937 210.795L533.854 183.61" />
                <path strokeWidth={1.628} d="M673.654 74.712l21.974 103.758" />
                <path strokeWidth={2.373} d="M673.654 74.712l-139.8 108.898" />
                <path strokeWidth={1.7} d="M673.654 74.712l101.524 123.167" />
                <path strokeWidth={3.674} d="M673.654 74.712l227.807 38.567" />
                <path strokeWidth={2.128} d="M673.654 74.712l-52.751 42.805" />
                <path strokeWidth={4.62} d="M673.654 74.712l148.902 466.107" />
                <path strokeWidth={1.837} d="M547.84 447.331l274.716 93.488" />
                <path strokeWidth={1.86} d="M547.84 447.331l-58.647-26.313" />
                <path strokeWidth={1.223} d="M739.489 488.77l135.368 263.982" />
                <path strokeWidth={1.596} d="M739.489 488.77L564.52 628.707" />
                <path strokeWidth={1.032} d="M739.489 488.77l292.395 9.196" />
                <path strokeWidth={1.091} d="M739.489 488.77l145.292-158.409" />
                <path strokeWidth={10} d="M739.489 488.77l83.067 52.049" />
                <path strokeWidth={3.406} d="M739.489 488.77l389.308 29.677" />
                <path strokeWidth={1.191} d="M739.489 488.77L571.623 698.628" />
                <path strokeWidth={1.582} d="M739.489 488.77L637.815 607.122" />
                <path strokeWidth={1.036} d="M739.489 488.77l89.534-183.511" />
                <path strokeWidth={4.62} d="M739.489 488.77L673.654 74.712" />
                <path strokeWidth={1.414} d="M739.489 488.77l46.34 122.848" />
                <path strokeWidth={1.023} d="M739.489 488.77l129.78-222.547" />
                <path strokeWidth={2.16} d="M739.489 488.77l195.972-192.034" />
                <path strokeWidth={1.873} d="M739.489 488.77l-9.552-277.975" />
                <path strokeWidth={3.683} d="M739.489 488.77l248.837-158.093" />
                <path strokeWidth={1.118} d="M739.489 488.77l82.392-101.951" />
                <path strokeWidth={5.698} d="M739.489 488.77l161.972-375.491" />
                <path strokeWidth={2.123} d="M739.489 488.77L524.71 595.937" />
                <path strokeWidth={1.769} d="M739.489 488.77l344.07 186.497" />
                <path strokeWidth={1.509} d="M739.489 488.77l22.291 195.19" />
                <path strokeWidth={1.823} d="M739.489 488.77l-9.075 130.829" />
                <path strokeWidth={2.587} d="M739.489 488.77L620.903 117.517" />
                <path strokeWidth={1.045} d="M739.489 488.77l162.968-4.61" />
                <path strokeWidth={1.077} d="M739.489 488.77l-41.441-85.756" />
                <path strokeWidth={2.537} d="M739.489 488.77l-250.296-67.752" />
                <path strokeWidth={1.8} d="M739.489 488.77l250.75-208.316" />
                <path strokeWidth={1.632} d="M739.489 488.77L605.037 701.361" />
                <path strokeWidth={1.86} d="M739.489 488.77L547.84 447.331" />
                <path strokeWidth={3.342} d="M739.489 488.77l-26.874-171.549" />
                <path strokeWidth={1.86} d="M739.489 488.77l35.689-290.891" />
                <path strokeWidth={1.164} d="M739.489 488.77l187.495 88.995" />
                <path strokeWidth={1.928} d="M739.489 488.77l302.545 204.714" />
                <path strokeWidth={1.236} d="M739.489 488.77l303.805-200.927" />
                <path
                  opacity={0.5}
                  strokeWidth={1.837}
                  d="M739.489 488.77l-43.861-310.3"
                />
                <path strokeWidth={1.305} d="M739.489 488.77l-95.355 188.175" />
                <path strokeWidth={2.642} d="M739.489 488.77l-89.516 282.256" />
                <path strokeWidth={1.75} d="M739.489 488.77l-44.214 208.737" />
                <path strokeWidth={2.001} d="M739.489 488.77L527.946 691.569" />
                <path strokeWidth={1.041} d="M739.489 488.77l13.766 77.06" />
                <path strokeWidth={3.106} d="M739.489 488.77L533.854 183.61" />
                <path strokeWidth={1.164} d="M739.489 488.77l124.206 194.557" />
                <path strokeWidth={3.401} d="M739.489 488.77l311.144-273.906" />
                <path
                  strokeWidth={1.273}
                  d="M926.434 696.709l-103.878-155.89"
                />
                <path strokeWidth={1.327} d="M926.434 696.709L739.489 488.77" />
                <path strokeWidth={1.045} d="M926.434 696.709L902.457 484.16" />
                <path strokeWidth={1.164} d="M926.434 696.709l-62.739-13.382" />
                <path strokeWidth={1.873} d="M935.461 296.736l-34-183.457" />
                <path strokeWidth={2.16} d="M935.461 296.736L822.556 540.819" />
                <path strokeWidth={2.182} d="M575.739 153.313l325.722-40.034" />
                <path
                  strokeWidth={2.455}
                  d="M575.739 153.313l246.817 387.506"
                />
                <path strokeWidth={2.023} d="M575.739 153.313l97.915-78.601" />
                <path
                  opacity={0.5}
                  strokeWidth={2.455}
                  d="M575.739 153.313l163.75 335.457"
                />
                <path strokeWidth={1.828} d="M575.739 153.313l45.164-35.796" />
                <path strokeWidth={1.782} d="M575.739 153.313l-41.885 30.297" />
                <path
                  strokeWidth={1.646}
                  d="M1083.559 675.267L822.556 540.819"
                />
                <path
                  strokeWidth={1.364}
                  d="M1083.559 675.267l-41.525 18.217"
                />
                <path strokeWidth={1.468} d="M1083.559 675.267l45.238-156.82" />
                <path
                  strokeWidth={1.036}
                  d="M948.437 213.58L739.489 488.77M948.437 213.58L822.556 540.819"
                />
                <path
                  strokeWidth={1.023}
                  d="M948.437 213.58l-46.976-100.301M948.437 213.58l102.196 1.284"
                />
                <path
                  strokeWidth={2.246}
                  d="M1148.682 434.756l-98.049-219.892"
                />
                <path
                  strokeWidth={4.379}
                  d="M1148.682 434.756L739.489 488.77"
                />
                <path
                  strokeWidth={1.568}
                  d="M1148.682 434.756l-65.123 240.511"
                />
                <path
                  strokeWidth={2.828}
                  d="M1148.682 434.756L901.461 113.279"
                />
                <path
                  strokeWidth={2.314}
                  d="M1148.682 434.756L988.326 330.677"
                />
                <path
                  strokeWidth={4.197}
                  d="M1148.682 434.756L822.556 540.819"
                />
                <path
                  strokeWidth={1.191}
                  d="M1148.682 434.756l-105.388-146.913"
                />
                <path
                  strokeWidth={1.027}
                  d="M1148.682 434.756l-116.798 63.21"
                />
                <path
                  strokeWidth={3.269}
                  d="M1148.682 434.756l-19.885 83.691"
                />
                <path
                  strokeWidth={1.737}
                  d="M1148.682 434.756l-106.648 258.728"
                />
                <path
                  strokeWidth={1.628}
                  d="M1148.682 434.756L990.239 280.454"
                />
                <path strokeWidth={2.11} d="M988.326 330.677l-275.711-13.456" />
                <path
                  strokeWidth={2.496}
                  d="M988.326 330.677l-86.865-217.398"
                />
                <path
                  strokeWidth={1.932}
                  d="M988.326 330.677l-367.423-213.16"
                />
                <path
                  strokeWidth={3.592}
                  d="M988.326 330.677l-165.77 210.142"
                />
                <path
                  strokeWidth={1.118}
                  d="M988.326 330.677l-61.342 247.088"
                />
                <path strokeWidth={2.01} d="M1125.325 651.894L739.489 488.77" />
                <path strokeWidth={1.928} d="M1125.325 651.894l-83.291 41.59" />
                <path
                  strokeWidth={1.796}
                  d="M1125.325 651.894l23.357-217.138"
                />
                <path
                  strokeWidth={1.377}
                  d="M1125.325 651.894l-41.766 23.373"
                />
                <path strokeWidth={1.655} d="M1125.325 651.894l3.472-133.447" />
                <path
                  strokeWidth={1.928}
                  d="M1125.325 651.894L822.556 540.819"
                />
                <path strokeWidth={2.219} d="M741.63 366.462l80.926 174.357" />
                <path strokeWidth={2.251} d="M741.63 366.462l-2.141 122.308" />
                <path strokeWidth={1.155} d="M659.764 244.516l328.562 86.161" />
                <path strokeWidth={1.177} d="M659.764 244.516l79.725 244.254" />
                <path
                  strokeWidth={1.141}
                  d="M659.764 244.516l-38.861-126.999"
                />
                <path
                  strokeWidth={1.127}
                  d="M659.764 244.516l13.89-169.804M659.764 244.516l-26.686-51.498"
                />
                <path
                  strokeWidth={1.173}
                  d="M659.764 244.516l162.792 296.303"
                />
                <path strokeWidth={1.932} d="M633.078 193.018l-143.885 228" />
                <path strokeWidth={1.509} d="M633.078 193.018l357.161 87.436" />
                <path strokeWidth={2.137} d="M633.078 193.018l-57.339-39.705" />
                <path strokeWidth={1.614} d="M633.078 193.018l62.55-14.548" />
                <path strokeWidth={2.137} d="M633.078 193.018l-99.224-9.408" />
                <path strokeWidth={2.319} d="M633.078 193.018l417.555 21.846" />
                <path strokeWidth={1.759} d="M633.078 193.018L741.63 366.462" />
                <path strokeWidth={2.123} d="M633.078 193.018l-12.175-75.501" />
                <path strokeWidth={3.233} d="M633.078 193.018l40.576-118.306" />
                <path
                  strokeWidth={1.027}
                  d="M633.078 193.018l398.806 304.948"
                />
                <path strokeWidth={1.655} d="M633.078 193.018l142.1 4.861" />
                <path
                  strokeWidth={5.425}
                  d="M633.078 193.018l189.478 347.801"
                />
                <path strokeWidth={2.41} d="M633.078 193.018l79.537 124.203" />
                <path strokeWidth={5.561} d="M633.078 193.018L739.489 488.77" />
                <path
                  strokeWidth={2.787}
                  d="M633.078 193.018l515.604 241.738"
                />
                <path strokeWidth={3.792} d="M633.078 193.018l268.383-79.739" />
                <path
                  strokeWidth={2.419}
                  d="M633.078 193.018l355.248 137.659"
                />
                <path
                  strokeWidth={2.087}
                  d="M975.006 430.911l-152.45 109.908"
                />
                <path strokeWidth={1.778} d="M975.006 430.911L838.71 181.504" />
                <path strokeWidth={2.192} d="M975.006 430.911L739.489 488.77" />
                <path strokeWidth={1.75} d="M975.006 430.911l173.676 3.845" />
                <path
                  strokeWidth={1.032}
                  d="M586.03 338.077l47.048-145.059M586.03 338.077L739.489 488.77"
                />
                <path strokeWidth={1.027} d="M586.03 338.077l315.431-224.798" />
                <path strokeWidth={1.032} d="M586.03 338.077l236.526 202.742" />
                <path strokeWidth={2.537} d="M838.71 181.504L712.615 317.221" />
                <path strokeWidth={1.032} d="M838.71 181.504l63.747 302.656" />
                <path strokeWidth={1.678} d="M838.71 181.504l151.529 98.95" />
                <path strokeWidth={1.85} d="M838.71 181.504l-63.532 16.375" />
                <path strokeWidth={1.014} d="M838.71 181.504l30.559 84.719" />
                <path strokeWidth={1.059} d="M838.71 181.504l-140.662 221.51" />
                <path strokeWidth={1.832} d="M838.71 181.504l-143.082-3.034" />
                <path
                  opacity={0.5}
                  strokeWidth={7.358}
                  d="M838.71 181.504L739.489 488.77"
                />
                <path strokeWidth={2.692} d="M838.71 181.504l211.923 33.36" />
                <path strokeWidth={1.8} d="M838.71 181.504l-97.08 184.958" />
                <path strokeWidth={2.423} d="M838.71 181.504l-262.971-28.191" />
                <path strokeWidth={2.537} d="M838.71 181.504l-217.807-63.987" />
                <path strokeWidth={3.069} d="M838.71 181.504l-304.856 2.106" />
                <path strokeWidth={1.023} d="M838.71 181.504l109.727 32.076" />
                <path strokeWidth={1.2} d="M838.71 181.504l204.584 106.339" />
                <path strokeWidth={2.66} d="M838.71 181.504l290.087 336.943" />
                <path strokeWidth={5.207} d="M838.71 181.504l62.751-68.225" />
                <path
                  opacity={0.5}
                  strokeWidth={7.358}
                  d="M838.71 181.504l-16.154 359.315"
                />
                <path strokeWidth={4.474} d="M838.71 181.504l-205.632 11.514" />
                <path strokeWidth={1.082} d="M838.71 181.504l46.071 148.857" />
                <path strokeWidth={1.628} d="M838.71 181.504L547.84 447.331" />
                <path strokeWidth={2.16} d="M838.71 181.504l96.751 115.232" />
                <path strokeWidth={1.869} d="M838.71 181.504l-108.773 29.291" />
                <path strokeWidth={2.996} d="M838.71 181.504l149.616 149.173" />
                <path strokeWidth={1.027} d="M838.71 181.504l-9.687 123.755" />
                <path strokeWidth={2.173} d="M838.71 181.504L489.193 421.018" />
                <path strokeWidth={3.306} d="M838.71 181.504l309.972 253.252" />
                <path strokeWidth={1.15} d="M838.71 181.504l-178.946 63.012" />
                <path strokeWidth={4.62} d="M838.71 181.504L673.654 74.712" />
                <path strokeWidth={2.819} d="M1115.047 571.53l-375.558-82.76" />
                <path
                  strokeWidth={1.523}
                  d="M1115.047 571.53l-31.488 103.737"
                />
                <path strokeWidth={2.282} d="M1115.047 571.53l33.635-136.774" />
                <path strokeWidth={1.023} d="M1115.047 571.53l-83.163-73.564" />
                <path
                  strokeWidth={2.605}
                  d="M1115.047 571.53l-292.491-30.711"
                />
                <path strokeWidth={2.101} d="M1115.047 571.53l13.75-53.083" />
                <path
                  strokeWidth={2.051}
                  d="M1115.047 571.53l-64.414-356.666"
                />
                <path
                  strokeWidth={1.082}
                  d="M771.508 419.372l-32.019 69.398M771.508 419.372l51.048 121.447"
                />
                <path strokeWidth={1.059} d="M771.508 419.372l67.202-237.868" />
                <path strokeWidth={1.919} d="M773.412 102.467L739.489 488.77" />
                <path strokeWidth={1.582} d="M773.412 102.467l-152.509 15.05" />
                <path
                  strokeWidth={1.687}
                  d="M773.412 102.467l277.221 112.397"
                />
                <path
                  strokeWidth={1.537}
                  d="M773.412 102.467l-197.673 50.846"
                />
                <path strokeWidth={1.873} d="M773.412 102.467l65.298 79.037" />
                <path strokeWidth={1.919} d="M773.412 102.467l128.049 10.812" />
                <path strokeWidth={1.555} d="M773.412 102.467l-99.758-27.755" />
                <path
                  strokeWidth={1.614}
                  d="M773.412 102.467l-140.334 90.551"
                />
                <path strokeWidth={1.905} d="M773.412 102.467l49.144 438.352" />
                <path strokeWidth={1.282} d="M662.768 337.382l-29.69-144.364" />
                <path
                  strokeWidth={1.382}
                  d="M662.768 337.382l159.788 203.437"
                />
                <path strokeWidth={1.287} d="M662.768 337.382L838.71 181.504" />
                <path strokeWidth={1.391} d="M662.768 337.382l76.721 151.388" />
                <path strokeWidth={1.118} d="M931.752 524.643l56.574-193.966" />
                <path
                  strokeWidth={1.159}
                  d="M931.752 524.643l-109.196 16.176"
                />
                <path strokeWidth={1.173} d="M931.752 524.643L739.489 488.77" />
                <path
                  strokeWidth={1.6}
                  d="M1066.277 444.292L739.489 488.77M1066.277 444.292l82.405-9.536"
                />
                <path
                  strokeWidth={1.587}
                  d="M1066.277 444.292l-243.721 96.527"
                />
                <path
                  strokeWidth={1.459}
                  d="M1066.277 444.292L838.71 181.504"
                />
                <path strokeWidth={1.45} d="M1066.277 444.292l62.52 74.155" />
                <path strokeWidth={1.65} d="M576.102 230.288l97.552-155.576" />
                <path
                  strokeWidth={1.869}
                  d="M576.102 230.288l246.454 310.531M576.102 230.288l262.608-48.784"
                />
                <path
                  strokeWidth={1.755}
                  d="M576.102 230.288l325.359-117.009"
                />
                <path strokeWidth={1.518} d="M576.102 230.288l44.801-112.771" />
                <path strokeWidth={1.719} d="M576.102 230.288l56.976-37.27" />
                <path strokeWidth={1.869} d="M576.102 230.288L739.489 488.77" />
                <path strokeWidth={1.582} d="M576.102 230.288l-42.248-46.678" />
                <path strokeWidth={1.869} d="M576.102 230.288l-.363-76.975" />
                <path strokeWidth={1.687} d="M1053.42 605.938l95.262-171.182" />
                <path strokeWidth={1.346} d="M1053.42 605.938l71.905 45.956" />
                <path
                  strokeWidth={1.646}
                  d="M1053.42 605.938l-230.864-65.119"
                />
                <path strokeWidth={1.555} d="M1053.42 605.938l75.377-87.491" />
                <path strokeWidth={1.682} d="M1053.42 605.938L739.489 488.77" />
                <path strokeWidth={1.146} d="M782.254 786.417L739.489 488.77" />
                <path strokeWidth={1.136} d="M782.254 786.417l40.302-245.598" />
                <path strokeWidth={1.118} d="M782.254 786.417l92.603-33.665" />
                <path strokeWidth={1.005} d="M656.686 507.331l82.803-18.561" />
                <path d="M656.686 507.331l55.929-190.11" />
                <path strokeWidth={1.005} d="M656.686 507.331l165.87 33.488" />
                <path
                  strokeWidth={1.05}
                  d="M827.241 636.933L739.489 488.77M827.241 636.933l-4.685-96.114"
                />
                <path strokeWidth={1.323} d="M984.45 553.532L739.489 488.77" />
                <path strokeWidth={1.236} d="M984.45 553.532l164.232-118.776" />
                <path strokeWidth={1.309} d="M984.45 553.532l-161.894-12.713" />
                <path strokeWidth={3.961} d="M598.6 503.406l223.956 37.413" />
                <path strokeWidth={3.024} d="M598.6 503.406l240.11-321.902" />
                <path strokeWidth={1.027} d="M598.6 503.406l-12.57-165.329" />
                <path strokeWidth={3.961} d="M598.6 503.406l140.889-14.636" />
                <path
                  strokeWidth={1.318}
                  d="M857.839 593.861L739.489 488.77M857.839 593.861L741.63 366.462"
                />
                <path strokeWidth={1.309} d="M857.839 593.861l-35.283-53.042" />
                <path strokeWidth={1.118} d="M821.881 386.819l.675 154" />
                <path strokeWidth={1.086} d="M821.881 386.819l16.829-205.315" />
                <path strokeWidth={1.828} d="M1090.693 312.163l-40.06-97.299" />
                <path
                  strokeWidth={1.914}
                  d="M1090.693 312.163L901.461 113.279"
                />
                <path
                  strokeWidth={1.955}
                  d="M1090.693 312.163l57.989 122.593"
                />
                <path
                  strokeWidth={2.514}
                  d="M1090.693 312.163L739.489 488.77"
                />
                <path
                  strokeWidth={1.796}
                  d="M1090.693 312.163l-102.367 18.514"
                />
                <path
                  strokeWidth={2.091}
                  d="M1090.693 312.163L838.71 181.504"
                />
                <path
                  strokeWidth={2.414}
                  d="M1090.693 312.163L822.556 540.819"
                />
                <path strokeWidth={1.045} d="M733.113 737.396l89.443-196.577" />
                <path
                  strokeWidth={1.032}
                  d="M733.113 737.396l395.684-218.949M733.113 737.396l-205.167-45.827"
                />
                <path strokeWidth={1.05} d="M733.113 737.396l6.376-248.626" />
                <path strokeWidth={1.032} d="M733.113 737.396L598.6 503.406" />
                <path strokeWidth={1.05} d="M733.113 737.396l28.667-53.436" />
                <path strokeWidth={1.423} d="M881.367 412.033L739.489 488.77" />
                <path
                  strokeWidth={1.418}
                  d="M881.367 412.033l-58.811 128.786"
                />
                <path strokeWidth={1.387} d="M881.367 412.033L838.71 181.504" />
                <path strokeWidth={1.191} d="M844.133 817.772l30.724-65.02" />
                <path
                  strokeWidth={1.482}
                  d="M844.133 817.772l-21.577-276.953"
                />
                <path strokeWidth={1.091} d="M844.133 817.772l-61.879-31.355" />
                <path strokeWidth={1.491} d="M844.133 817.772L739.489 488.77" />
                <path
                  strokeWidth={1.127}
                  d="M1041.799 397.587L822.556 540.819"
                />
                <path
                  strokeWidth={1.109}
                  d="M1041.799 397.587L838.71 181.504"
                />
                <path
                  strokeWidth={1.123}
                  d="M1041.799 397.587L826.242 446.27"
                />
                <path
                  strokeWidth={1.105}
                  d="M1041.799 397.587l106.883 37.169"
                />
                <path
                  strokeWidth={1.086}
                  d="M1041.799 397.587l-329.184-80.366"
                />
                <path
                  strokeWidth={1.127}
                  d="M1041.799 397.587l-302.31 91.183"
                />
                <path strokeWidth={1.086} d="M1041.799 397.587l86.998 120.86" />
                <path strokeWidth={2.037} d="M826.242 446.27l148.764-15.359" />
                <path strokeWidth={1.869} d="M826.242 446.27l-250.14-215.982" />
                <path strokeWidth={4.62} d="M826.242 446.27L673.654 74.712" />
                <path strokeWidth={2.16} d="M826.242 446.27l109.219-149.534" />
                <path strokeWidth={1.132} d="M826.242 446.27l105.51 78.373" />
                <path strokeWidth={1.346} d="M826.242 446.27l-40.413 165.348" />
                <path strokeWidth={1.032} d="M826.242 446.27l205.642 51.696" />
                <path strokeWidth={2.123} d="M826.242 446.27L524.71 595.937" />
                <path strokeWidth={1.291} d="M826.242 446.27l31.597 147.591" />
                <path strokeWidth={2.11} d="M826.242 446.27l-84.612-79.808" />
                <path strokeWidth={1.719} d="M826.242 446.27L695.275 697.507" />
                <path strokeWidth={1.227} d="M826.242 446.27l217.052-158.427" />
                <path strokeWidth={3.383} d="M826.242 446.27l162.084-115.593" />
                <path strokeWidth={1.464} d="M826.242 446.27L637.815 607.122" />
                <path strokeWidth={1.414} d="M826.242 446.27l55.125-34.237" />
                <path strokeWidth={1.191} d="M826.242 446.27L571.623 698.628" />
                <path strokeWidth={1.045} d="M826.242 446.27l-93.129 291.126" />
                <path strokeWidth={3.083} d="M826.242 446.27L533.854 183.61" />
                <path strokeWidth={1.309} d="M826.242 446.27L984.45 553.532" />
                <path strokeWidth={1.005} d="M826.242 446.27l-169.556 61.061" />
                <path strokeWidth={1.85} d="M826.242 446.27l299.083 205.624" />
                <path strokeWidth={1.114} d="M826.242 446.27l-43.988 340.147" />
                <path strokeWidth={1.823} d="M826.242 446.27l-95.828 173.329" />
                <path strokeWidth={1.027} d="M826.242 446.27l122.195-232.69" />
                <path strokeWidth={3.71} d="M826.242 446.27L598.6 503.406" />
                <path strokeWidth={1.045} d="M826.242 446.27l76.215 37.89" />
                <path strokeWidth={1.468} d="M826.242 446.27L761.78 683.96" />
                <path
                  opacity={0.5}
                  strokeWidth={2.455}
                  d="M826.242 446.27L575.739 153.313"
                />
                <path strokeWidth={1.85} d="M826.242 446.27l-51.064-248.391" />
                <path strokeWidth={1.268} d="M826.242 446.27l100.192 250.439" />
                <path strokeWidth={1.023} d="M826.242 446.27l43.027-180.047" />
                <path strokeWidth={1.568} d="M826.242 446.27l240.035-1.978" />
                <path strokeWidth={9.377} d="M826.242 446.27l-86.753 42.5" />
                <path strokeWidth={1.632} d="M826.242 446.27L605.037 701.361" />
                <path strokeWidth={2.478} d="M826.242 446.27l288.805 125.26" />
                <path strokeWidth={3.065} d="M826.242 446.27L712.615 317.221" />
                <path strokeWidth={1.869} d="M826.242 446.27l-96.305-235.475" />
                <path strokeWidth={3.183} d="M826.242 446.27l224.391-231.406" />
                <path strokeWidth={2.337} d="M826.242 446.27l264.451-134.107" />
                <path strokeWidth={1.814} d="M826.242 446.27l-278.402 1.061" />
                <path strokeWidth={1.05} d="M826.242 446.27l.999 190.663" />
                <path
                  strokeWidth={1.032}
                  d="M826.242 446.27l2.781-141.011M826.242 446.27L586.03 338.077"
                />
                <path strokeWidth={1.396} d="M826.242 446.27l17.891 371.502" />
                <path strokeWidth={2.46} d="M826.242 446.27l-337.049-25.252" />
                <path
                  opacity={0.5}
                  strokeWidth={4.029}
                  d="M826.242 446.27l322.44-11.514"
                />
                <path strokeWidth={1.118} d="M826.242 446.27l-4.361-59.451" />
                <path strokeWidth={1.364} d="M826.242 446.27L662.768 337.382" />
                <path strokeWidth={5.461} d="M826.242 446.27l75.219-332.991" />
                <path strokeWidth={2.642} d="M826.242 446.27L649.973 771.026" />
                <path strokeWidth={1.628} d="M826.242 446.27l227.178 159.668" />
                <path strokeWidth={1.591} d="M826.242 446.27l257.317 228.997" />
                <path strokeWidth={1.141} d="M826.242 446.27l37.453 237.057" />
                <path strokeWidth={1.878} d="M826.242 446.27L527.946 691.569" />
                <path strokeWidth={1.041} d="M826.242 446.27l-72.987 119.56" />
                <path strokeWidth={3.151} d="M826.242 446.27l302.555 72.177" />
                <path strokeWidth={1.168} d="M826.242 446.27l48.615 306.482" />
                <path strokeWidth={1.896} d="M826.242 446.27l-52.83-343.803" />
                <path strokeWidth={1.596} d="M826.242 446.27L564.52 628.707" />
                <path strokeWidth={1.164} d="M826.242 446.27L659.764 244.516" />
                <path strokeWidth={1.073} d="M826.242 446.27l-128.194-43.256" />
                <path
                  opacity={0.5}
                  strokeWidth={2.569}
                  d="M826.242 446.27L620.903 117.517"
                />
                <path strokeWidth={1.077} d="M826.242 446.27l-54.734-26.898" />
                <path strokeWidth={1.837} d="M826.242 446.27l-130.614-267.8" />
                <path strokeWidth={1.778} d="M826.242 446.27l215.792 247.214" />
                <path strokeWidth={9.359} d="M826.242 446.27l-3.686 94.549" />
                <path strokeWidth={5.266} d="M826.242 446.27L633.078 193.018" />
                <path strokeWidth={1.132} d="M826.242 446.27l100.742 131.495" />
                <path strokeWidth={7.358} d="M826.242 446.27l12.468-264.766" />
                <path strokeWidth={1.755} d="M826.242 446.27l163.997-165.816" />
                <path strokeWidth={1.091} d="M826.242 446.27l58.539-115.909" />
                <path
                  strokeWidth={1.764}
                  d="M697.851 569.293l124.705-28.474M697.851 569.293L826.242 446.27M697.851 569.293l41.638-80.523"
                />
                <path strokeWidth={1.223} d="M826.292 236.352L739.489 488.77" />
                <path strokeWidth={1.186} d="M826.292 236.352l75.169-123.073" />
                <path strokeWidth={1.218} d="M826.292 236.352l12.418-54.848" />
                <path strokeWidth={1.223} d="M826.292 236.352l-3.736 304.467" />
                <path strokeWidth={1.218} d="M826.292 236.352l-.05 209.918" />
                <path strokeWidth={1.323} d="M911.648 249.65L739.489 488.77" />
                <path strokeWidth={1.3} d="M911.648 249.65l-72.938-68.146" />
                <path strokeWidth={1.314} d="M911.648 249.65l-89.092 291.169" />
                <path strokeWidth={1.241} d="M911.648 249.65l23.813 47.086" />
                <path
                  opacity={0.5}
                  strokeWidth={1.309}
                  d="M911.648 249.65l-85.406 196.62"
                />
                <path strokeWidth={1.291} d="M911.648 249.65l-10.187-136.371" />
                <path
                  strokeWidth={1.223}
                  d="M507.085 317.779l125.993-124.761"
                />
                <path
                  strokeWidth={1.246}
                  d="M507.085 317.779l113.818-200.262"
                />
                <path strokeWidth={1.3} d="M507.085 317.779L739.489 488.77" />
                <path strokeWidth={1.209} d="M507.085 317.779l68.654-164.466" />
                <path strokeWidth={1.296} d="M507.085 317.779L826.242 446.27" />
                <path
                  strokeWidth={1.273}
                  d="M507.085 317.779l-17.892 103.239"
                />
                <path strokeWidth={1.259} d="M507.085 317.779L838.71 181.504" />
                <path strokeWidth={1.223} d="M507.085 317.779l40.755 129.552" />
                <path strokeWidth={1.3} d="M507.085 317.779l315.471 223.04" />
                <path strokeWidth={1.05} d="M805.88 737.329l38.253 80.443" />
                <path
                  strokeWidth={1.041}
                  d="M805.88 737.329L739.489 488.77M805.88 737.329l16.676-196.51"
                />
                <path strokeWidth={1.246} d="M582.13 414.153l157.359 74.617" />
                <path strokeWidth={1.032} d="M582.13 414.153l3.9-76.076" />
                <path strokeWidth={1.177} d="M582.13 414.153l50.948-221.135" />
                <path
                  strokeWidth={1.246}
                  d="M582.13 414.153l240.426 126.666M582.13 414.153l244.112 32.117"
                />
                <path strokeWidth={3.006} d="M629.88 421.285l109.609 67.485" />
                <path strokeWidth={2.874} d="M629.88 421.285l196.362 24.985" />
                <path strokeWidth={1.127} d="M629.88 421.285l-58.257 277.343" />
                <path strokeWidth={2.296} d="M629.88 421.285l208.83-239.781" />
                <path strokeWidth={2.956} d="M629.88 421.285l192.676 119.534" />
                <path strokeWidth={2.237} d="M629.88 421.285l3.198-228.267" />
                <path strokeWidth={1.373} d="M746.499 280.228l-7.01 208.542" />
                <path strokeWidth={1.35} d="M746.499 280.228l79.743 166.042" />
                <path strokeWidth={1.123} d="M746.499 280.228l79.793-43.876" />
                <path strokeWidth={1.359} d="M746.499 280.228l76.057 260.591" />
                <path strokeWidth={1.277} d="M746.499 280.228l92.211-98.724" />
                <path
                  opacity={0.5}
                  strokeWidth={1.268}
                  d="M746.499 280.228l-113.421-87.21"
                />
              </g>
              <g className="prefix__nodes">
                <path
                  d="M712.615 288.599a28.622 28.622 0 0118.397 6.696l-18.397 21.926z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#b5b5ff"
                />
                <path
                  d="M731.012 295.295a28.622 28.622 0 019.79 16.956l-28.187 4.97z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#0202ff"
                />
                <path
                  d="M740.802 312.25a28.622 28.622 0 01-3.4 19.282l-24.787-14.311z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#0404ff"
                />
                <path
                  d="M737.402 331.532a28.622 28.622 0 01-14.998 12.584l-9.79-26.895z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#0202ff"
                />
                <path
                  d="M722.404 344.116a28.622 28.622 0 01-19.579 0l9.79-26.895z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#2121ff"
                />
                <path
                  d="M702.825 344.116a28.622 28.622 0 01-14.998-12.584l24.788-14.311z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#2727ff"
                />
                <path
                  d="M687.827 331.532a28.622 28.622 0 01-3.4-19.281l28.188 4.97z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#ff4949"
                />
                <path
                  d="M684.428 312.25a28.622 28.622 0 019.789-16.955l18.398 21.926z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#0202ff"
                />
                <path
                  d="M694.217 295.295a28.622 28.622 0 0118.398-6.696v28.622z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#3131ff"
                />
                <text
                  className="prefix__node-label"
                  x={6}
                  y={3}
                  fontSize="1em"
                  transform="translate(712.615 317.22)"
                >
                  {'enzyme binding'}
                </text>
                <path
                  d="M695.275 677.799a19.708 19.708 0 0112.668 4.61l-12.668 15.098z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#ff5757"
                />
                <path
                  d="M707.943 682.41a19.708 19.708 0 016.74 11.675l-19.408 3.422z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#9696ff"
                />
                <path
                  d="M714.684 694.085a19.708 19.708 0 01-2.341 13.276l-17.068-9.854z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#9797ff"
                />
                <path
                  d="M712.343 707.361a19.708 19.708 0 01-10.327 8.666l-6.74-18.52z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#8484ff"
                />
                <path
                  d="M702.016 716.027a19.708 19.708 0 01-13.481 0l6.74-18.52z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#4747ff"
                />
                <path
                  d="M688.535 716.027a19.708 19.708 0 01-10.328-8.666l17.068-9.854z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#d4d4ff"
                />
                <path
                  d="M678.207 707.361a19.708 19.708 0 01-2.34-13.276l19.408 3.422z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#3030ff"
                />
                <path
                  d="M675.866 694.085a19.708 19.708 0 016.74-11.675l12.67 15.097z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#7575ff"
                />
                <path
                  d="M682.607 682.41a19.708 19.708 0 0112.668-4.611v19.708z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#ff3535"
                />
                <text
                  className="prefix__node-label"
                  x={6}
                  y={3}
                  fontSize="1em"
                  transform="translate(695.275 697.507)"
                >
                  {'cytoskeletal protein binding'}
                </text>
                <path
                  d="M1128.797 489.688a28.758 28.758 0 0118.485 6.729l-18.485 22.03z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#bcbcff"
                />
                <path
                  d="M1147.282 496.417a28.758 28.758 0 019.836 17.036l-28.321 4.994z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#55f"
                />
                <path
                  d="M1157.118 513.453a28.758 28.758 0 01-3.416 19.373l-24.905-14.38z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#ceceff"
                />
                <path
                  d="M1153.702 532.826a28.758 28.758 0 01-15.07 12.645l-9.835-27.024z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#8a8aff"
                />
                <path
                  d="M1138.633 545.47a28.758 28.758 0 01-19.672 0l9.836-27.023z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#1e1eff"
                />
                <path
                  d="M1118.96 545.47a28.758 28.758 0 01-15.069-12.644l24.906-14.38z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#ff6767"
                />
                <path
                  d="M1103.891 532.826a28.758 28.758 0 01-3.416-19.373l28.322 4.994z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#c6c6ff"
                />
                <path
                  d="M1100.475 513.453a28.758 28.758 0 019.836-17.036l18.486 22.03z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#e9e9ff"
                />
                <path
                  d="M1110.311 496.417a28.758 28.758 0 0118.486-6.729v28.759z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#efefff"
                />
                <text
                  className="prefix__node-label"
                  x={6}
                  y={3}
                  fontSize="1em"
                  transform="translate(1128.797 518.447)"
                >
                  {'cell differentiation'}
                </text>
                <path
                  d="M1031.884 486.995a10.971 10.971 0 017.052 2.567l-7.052 8.404z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#6d6dff"
                />
                <path
                  d="M1038.936 489.562a10.971 10.971 0 013.753 6.5l-10.805 1.904z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#bebeff"
                />
                <path
                  d="M1042.689 496.061a10.971 10.971 0 01-1.304 7.39l-9.5-5.485z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#fdfdff"
                />
                <path
                  d="M1041.385 503.452a10.971 10.971 0 01-5.748 4.824l-3.753-10.31z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#efefff"
                />
                <path
                  d="M1035.637 508.276a10.971 10.971 0 01-7.505 0l3.752-10.31z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#1818ff"
                />
                <path
                  d="M1028.132 508.276a10.971 10.971 0 01-5.749-4.824l9.501-5.486z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#f7f7ff"
                />
                <path
                  d="M1022.383 503.452a10.971 10.971 0 01-1.303-7.39l10.804 1.904z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#a6a6ff"
                />
                <path
                  d="M1021.08 496.061a10.971 10.971 0 013.752-6.5l7.052 8.405z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#c4c4ff"
                />
                <path
                  d="M1024.832 489.562a10.971 10.971 0 017.052-2.567v10.971z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#ff5656"
                />
                <text
                  className="prefix__node-label"
                  x={6}
                  y={3}
                  fontSize="1em"
                  transform="translate(1031.884 497.966)"
                >
                  {'extracellular matrix organization'}
                </text>
                <path
                  d="M785.829 594.868a16.75 16.75 0 0110.766 3.92l-10.766 12.83z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#a0a0ff"
                />
                <path
                  d="M796.595 598.787a16.75 16.75 0 015.73 9.923l-16.496 2.908z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#8787ff"
                />
                <path
                  d="M802.324 608.71a16.75 16.75 0 01-1.99 11.283l-14.505-8.375z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#cbcbff"
                />
                <path
                  d="M800.335 619.993a16.75 16.75 0 01-8.778 7.365l-5.728-15.74z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#fffbfb"
                />
                <path
                  d="M791.557 627.358a16.75 16.75 0 01-11.457 0l5.729-15.74z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#c3c3ff"
                />
                <path
                  d="M780.1 627.358a16.75 16.75 0 01-8.777-7.365l14.506-8.375z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#e5e5ff"
                />
                <path
                  d="M771.323 619.993a16.75 16.75 0 01-1.99-11.283l16.496 2.908z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#6b6bff"
                />
                <path
                  d="M769.333 608.71a16.75 16.75 0 015.729-9.923l10.767 12.831z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#9797ff"
                />
                <path
                  d="M775.062 598.787a16.75 16.75 0 0110.767-3.919v16.75z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#bdbdff"
                />
                <text
                  className="prefix__node-label"
                  x={6}
                  y={3}
                  fontSize="1em"
                  transform="translate(785.829 611.618)"
                >
                  {'lipid metabolic process'}
                </text>
                <path
                  d="M620.903 92.641a24.876 24.876 0 0115.99 5.82l-15.99 19.056z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#d3d3ff"
                />
                <path
                  d="M636.893 98.461a24.876 24.876 0 018.508 14.736l-24.498 4.32z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#cfcfff"
                />
                <path
                  d="M645.4 113.197a24.876 24.876 0 01-2.954 16.758l-21.543-12.438z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#cdcdff"
                />
                <path
                  d="M642.446 129.955a24.876 24.876 0 01-13.035 10.938l-8.508-23.376z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#fff7f7"
                />
                <path
                  d="M629.41 140.893a24.876 24.876 0 01-17.015 0l8.508-23.376z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#faa"
                />
                <path
                  d="M612.395 140.893a24.876 24.876 0 01-13.035-10.938l21.543-12.438z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#c2c2ff"
                />
                <path
                  d="M599.36 129.955a24.876 24.876 0 01-2.955-16.758l24.498 4.32z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="red"
                />
                <path
                  d="M596.405 113.197a24.876 24.876 0 018.508-14.736l15.99 19.056z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#e7e7ff"
                />
                <path
                  d="M604.913 98.461a24.876 24.876 0 0115.99-5.82v24.876z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#1919ff"
                />
                <text
                  className="prefix__node-label"
                  x={6}
                  y={3}
                  fontSize="1em"
                  transform="translate(620.903 117.517)"
                >
                  {'chromosome organization'}
                </text>
                <path
                  d="M605.037 682.624a18.737 18.737 0 0112.045 4.384l-12.045 14.353z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#1212ff"
                />
                <path
                  d="M617.082 687.008a18.737 18.737 0 016.408 11.1l-18.453 3.253z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#c2c2ff"
                />
                <path
                  d="M623.49 698.108a18.737 18.737 0 01-2.225 12.622l-16.228-9.369z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#0a0aff"
                />
                <path
                  d="M621.265 710.73a18.737 18.737 0 01-9.819 8.239l-6.409-17.608z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#0404ff"
                />
                <path
                  d="M611.446 718.969a18.737 18.737 0 01-12.817 0l6.408-17.608z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#a2a2ff"
                />
                <path
                  d="M598.629 718.969a18.737 18.737 0 01-9.819-8.239l16.227-9.369z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#0707ff"
                />
                <path
                  d="M588.81 710.73a18.737 18.737 0 01-2.225-12.622l18.452 3.253z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#ff8585"
                />
                <path
                  d="M586.585 698.108a18.737 18.737 0 016.408-11.1l12.044 14.353z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#b5b5ff"
                />
                <path
                  d="M592.993 687.008a18.737 18.737 0 0112.044-4.384v18.737z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#0606ff"
                />
                <text
                  className="prefix__node-label"
                  x={6}
                  y={3}
                  fontSize="1em"
                  transform="translate(605.037 701.361)"
                >
                  {'microtubule organizing center'}
                </text>
                <path
                  d="M649.973 745.866a25.16 25.16 0 0116.173 5.886l-16.173 19.274z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#bdbdff"
                />
                <path
                  d="M666.146 751.752a25.16 25.16 0 018.605 14.905l-24.778 4.37z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#1919ff"
                />
                <path
                  d="M674.751 766.657a25.16 25.16 0 01-2.989 16.95l-21.79-12.58z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#0909ff"
                />
                <path
                  d="M671.762 783.606a25.16 25.16 0 01-13.184 11.063l-8.605-23.643z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#0505ff"
                />
                <path
                  d="M658.578 794.67a25.16 25.16 0 01-17.21 0l8.605-23.644z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#7272ff"
                />
                <path
                  d="M641.368 794.67a25.16 25.16 0 01-13.185-11.064l21.79-12.58z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#0c0cff"
                />
                <path
                  d="M628.183 783.606a25.16 25.16 0 01-2.988-16.949l24.778 4.37z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#ff5757"
                />
                <path
                  d="M625.195 766.657a25.16 25.16 0 018.605-14.905l16.173 19.274z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#2b2bff"
                />
                <path
                  d="M633.8 751.752a25.16 25.16 0 0116.173-5.886v25.16z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#0f0fff"
                />
                <text
                  className="prefix__node-label"
                  x={6}
                  y={3}
                  fontSize="1em"
                  transform="translate(649.973 771.026)"
                >
                  {'cytoskeleton'}
                </text>
                <path
                  d="M863.695 669.652a13.674 13.674 0 018.79 3.2l-8.79 10.475z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#ff1313"
                />
                <path
                  d="M872.485 672.851a13.674 13.674 0 014.677 8.101l-13.467 2.375z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#3a3aff"
                />
                <path
                  d="M877.162 680.952a13.674 13.674 0 01-1.624 9.212l-11.843-6.837z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#ff3b3b"
                />
                <path
                  d="M875.538 690.164a13.674 13.674 0 01-7.166 6.012l-4.677-12.85z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#ffb8b8"
                />
                <path
                  d="M868.372 696.176a13.674 13.674 0 01-9.354 0l4.677-12.85z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#99f"
                />
                <path
                  d="M859.018 696.176a13.674 13.674 0 01-7.165-6.012l11.842-6.837z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#ff0404"
                />
                <path
                  d="M851.853 690.164a13.674 13.674 0 01-1.625-9.212l13.467 2.375z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#a2a2ff"
                />
                <path
                  d="M850.228 680.952a13.674 13.674 0 014.677-8.1l8.79 10.475z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#dbdbff"
                />
                <path
                  d="M854.905 672.851a13.674 13.674 0 018.79-3.199v13.675z"
                  opacity={0.75}
                  stroke="#000"
                  cursor="pointer"
                  fill="#ff0707"
                />
                <text
                  className="prefix__node-label"
                  x={6}
                  y={3}
                  fontSize="1em"
                  transform="translate(863.695 683.327)"
                >
                  {'extracellular space'}
                </text>
                <g>
                  <path
                    d="M533.854 156.177a27.433 27.433 0 0117.633 6.418l-17.633 21.015z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#a5a5ff"
                  />
                  <path
                    d="M551.487 162.595a27.433 27.433 0 019.383 16.251l-27.016 4.764z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#5151ff"
                  />
                  <path
                    d="M560.87 178.846a27.433 27.433 0 01-3.259 18.48l-23.757-13.716z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff3737"
                  />
                  <path
                    d="M557.611 197.326a27.433 27.433 0 01-14.374 12.062l-9.383-25.778z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ffb1b1"
                  />
                  <path
                    d="M543.237 209.388a27.433 27.433 0 01-18.765 0l9.382-25.778z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#dcdcff"
                  />
                  <path
                    d="M524.472 209.388a27.433 27.433 0 01-14.375-12.062l23.757-13.716z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#f7f7ff"
                  />
                  <path
                    d="M510.097 197.326a27.433 27.433 0 01-3.259-18.48l27.016 4.764z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#b5b5ff"
                  />
                  <path
                    d="M506.838 178.846a27.433 27.433 0 019.383-16.251l17.633 21.015z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#e1e1ff"
                  />
                  <path
                    d="M516.22 162.595a27.433 27.433 0 0117.634-6.418v27.433z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#efefff"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(533.854 183.61)"
                  >
                    {'DNA binding'}
                  </text>
                </g>
                <g>
                  <path
                    d="M874.857 738.097a14.655 14.655 0 019.42 3.429l-9.42 11.226z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#c9c9ff"
                  />
                  <path
                    d="M884.277 741.526a14.655 14.655 0 015.013 8.682l-14.433 2.544z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#0d0dff"
                  />
                  <path
                    d="M889.29 750.208a14.655 14.655 0 01-1.74 9.872l-12.693-7.328z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#c3c3ff"
                  />
                  <path
                    d="M887.55 760.08a14.655 14.655 0 01-7.68 6.444l-5.013-13.772z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#66f"
                  />
                  <path
                    d="M879.87 766.524a14.655 14.655 0 01-10.025 0l5.012-13.772z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#afafff"
                  />
                  <path
                    d="M869.845 766.524a14.655 14.655 0 01-7.68-6.444l12.692-7.328z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#babaff"
                  />
                  <path
                    d="M862.165 760.08a14.655 14.655 0 01-1.74-9.872l14.432 2.544z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ffdbdb"
                  />
                  <path
                    d="M860.424 750.208a14.655 14.655 0 015.013-8.682l9.42 11.226z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#0c0cff"
                  />
                  <path
                    d="M865.437 741.526a14.655 14.655 0 019.42-3.43v14.656z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#cfcfff"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(874.857 752.752)"
                  >
                    {'carbohydrate metabolic process'}
                  </text>
                </g>
                <g>
                  <path
                    d="M1042.034 672.533a20.952 20.952 0 0113.468 4.901l-13.468 16.05z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#4545ff"
                  />
                  <path
                    d="M1055.502 677.434a20.952 20.952 0 017.165 12.412l-20.633 3.638z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#1e1eff"
                  />
                  <path
                    d="M1062.667 689.846a20.952 20.952 0 01-2.488 14.114l-18.145-10.476z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff5b5b"
                  />
                  <path
                    d="M1060.179 703.96a20.952 20.952 0 01-10.98 9.213l-7.165-19.689z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#fcfcff"
                  />
                  <path
                    d="M1049.2 713.173a20.952 20.952 0 01-14.332 0l7.166-19.689z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#0101ff"
                  />
                  <path
                    d="M1034.868 713.173a20.952 20.952 0 01-10.979-9.213l18.145-10.476z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff0101"
                  />
                  <path
                    d="M1023.889 703.96a20.952 20.952 0 01-2.489-14.114l20.634 3.638z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#9f9fff"
                  />
                  <path
                    d="M1021.4 689.846a20.952 20.952 0 017.166-12.412l13.468 16.05z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#4b4bff"
                  />
                  <path
                    d="M1028.566 677.434a20.952 20.952 0 0113.468-4.901v20.951z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff0101"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(1042.034 693.484)"
                  >
                    {'cell motility'}
                  </text>
                </g>
                <g>
                  <path
                    d="M753.255 554.599a11.23 11.23 0 017.22 2.627l-7.22 8.604z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#4545ff"
                  />
                  <path
                    d="M760.474 557.226a11.23 11.23 0 013.841 6.653l-11.06 1.95z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#7c7cff"
                  />
                  <path
                    d="M764.315 563.88a11.23 11.23 0 01-1.334 7.565l-9.726-5.615z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#2d2dff"
                  />
                  <path
                    d="M762.981 571.445a11.23 11.23 0 01-5.885 4.938l-3.84-10.553z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#3737ff"
                  />
                  <path
                    d="M757.096 576.383a11.23 11.23 0 01-7.682 0l3.841-10.553z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#6464ff"
                  />
                  <path
                    d="M749.414 576.383a11.23 11.23 0 01-5.885-4.938l9.726-5.615z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#7272ff"
                  />
                  <path
                    d="M743.529 571.445a11.23 11.23 0 01-1.334-7.566l11.06 1.95z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff0303"
                  />
                  <path
                    d="M742.195 563.88a11.23 11.23 0 013.841-6.654l7.22 8.604z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#a2a2ff"
                  />
                  <path
                    d="M746.036 557.226a11.23 11.23 0 017.22-2.627v11.23z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#9898ff"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(753.255 565.83)"
                  >
                    {'lipid droplet'}
                  </text>
                </g>
                <g>
                  <path
                    d="M990.239 260.406a20.048 20.048 0 0112.886 4.69l-12.886 15.358z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#f1f1ff"
                  />
                  <path
                    d="M1003.125 265.097a20.048 20.048 0 016.857 11.876l-19.743 3.481z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#e6e6ff"
                  />
                  <path
                    d="M1009.982 276.973a20.048 20.048 0 01-2.381 13.505l-17.362-10.024z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#f1f1ff"
                  />
                  <path
                    d="M1007.6 290.478a20.048 20.048 0 01-10.505 8.815l-6.856-18.839z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#fffbfb"
                  />
                  <path
                    d="M997.095 299.293a20.048 20.048 0 01-13.713 0l6.857-18.839z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#a2a2ff"
                  />
                  <path
                    d="M983.382 299.293a20.048 20.048 0 01-10.505-8.815l17.362-10.024z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#c2c2ff"
                  />
                  <path
                    d="M972.877 290.478a20.048 20.048 0 01-2.382-13.505l19.744 3.481z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff1212"
                  />
                  <path
                    d="M970.495 276.973a20.048 20.048 0 016.857-11.876l12.887 15.357z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff1010"
                  />
                  <path
                    d="M977.352 265.097a20.048 20.048 0 0112.887-4.69v20.047z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#3030ff"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(990.239 280.454)"
                  >
                    {'reproduction'}
                  </text>
                </g>
                <g>
                  <path
                    d="M822.556 492.808a48.011 48.011 0 0130.86 11.233l-30.86 36.778z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#6363ff"
                  />
                  <path
                    d="M853.416 504.04a48.011 48.011 0 0116.421 28.442l-47.281 8.337z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#6c6cff"
                  />
                  <path
                    d="M869.837 532.482a48.011 48.011 0 01-5.703 32.343l-41.578-24.006z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#9696ff"
                  />
                  <path
                    d="M864.134 564.825a48.011 48.011 0 01-25.158 21.11l-16.42-45.116z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#eaeaff"
                  />
                  <path
                    d="M838.976 585.935a48.011 48.011 0 01-32.841 0l16.42-45.116z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff9292"
                  />
                  <path
                    d="M806.135 585.935a48.011 48.011 0 01-25.158-21.11l41.579-24.006z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#7979ff"
                  />
                  <path
                    d="M780.977 564.825a48.011 48.011 0 01-5.703-32.343l47.282 8.337z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ababff"
                  />
                  <path
                    d="M775.274 532.482a48.011 48.011 0 0116.42-28.441l30.862 36.778z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#8f8fff"
                  />
                  <path
                    d="M791.695 504.04a48.011 48.011 0 0130.86-11.232v48.011z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#88f"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(822.556 540.82)"
                  >
                    {'intracellular'}
                  </text>
                </g>
                <g>
                  <path
                    d="M1050.633 186.105a28.758 28.758 0 0118.486 6.729l-18.486 22.03z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#efefff"
                  />
                  <path
                    d="M1069.119 192.834a28.758 28.758 0 019.836 17.036l-28.322 4.994z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#7979ff"
                  />
                  <path
                    d="M1078.955 209.87a28.758 28.758 0 01-3.416 19.373l-24.906-14.38z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#f5f5ff"
                  />
                  <path
                    d="M1075.539 229.243a28.758 28.758 0 01-15.07 12.645l-9.836-27.024z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#e2e2ff"
                  />
                  <path
                    d="M1060.47 241.888a28.758 28.758 0 01-19.672 0l9.835-27.024z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#6a6aff"
                  />
                  <path
                    d="M1040.798 241.888a28.758 28.758 0 01-15.07-12.645l24.905-14.38z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff1414"
                  />
                  <path
                    d="M1025.728 229.243a28.758 28.758 0 01-3.416-19.373l28.321 4.994z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff1010"
                  />
                  <path
                    d="M1022.312 209.87a28.758 28.758 0 019.836-17.036l18.485 22.03z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#c9c9ff"
                  />
                  <path
                    d="M1032.148 192.834a28.758 28.758 0 0118.485-6.729v28.759z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff0d0d"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(1050.633 214.864)"
                  >
                    {'response to stress'}
                  </text>
                </g>
                <g>
                  <path
                    d="M489.193 396.383a24.635 24.635 0 0115.835 5.764l-15.835 18.87z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#0303ff"
                  />
                  <path
                    d="M505.028 402.147a24.635 24.635 0 018.425 14.593l-24.26 4.278z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#2121ff"
                  />
                  <path
                    d="M513.453 416.74a24.635 24.635 0 01-2.926 16.595l-21.334-12.317z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#8686ff"
                  />
                  <path
                    d="M510.527 433.335a24.635 24.635 0 01-12.909 10.832l-8.425-23.15z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#4343ff"
                  />
                  <path
                    d="M497.618 444.167a24.635 24.635 0 01-16.85 0l8.425-23.15z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#7373ff"
                  />
                  <path
                    d="M480.767 444.167a24.635 24.635 0 01-12.909-10.832l21.335-12.317z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#e8e8ff"
                  />
                  <path
                    d="M467.858 433.335a24.635 24.635 0 01-2.926-16.595l24.26 4.278z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff0b0b"
                  />
                  <path
                    d="M464.932 416.74a24.635 24.635 0 018.426-14.593l15.835 18.87z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#3232ff"
                  />
                  <path
                    d="M473.358 402.147a24.635 24.635 0 0115.835-5.764v24.635z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#f0f0ff"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(489.193 421.018)"
                  >
                    {'cell cycle'}
                  </text>
                </g>
                <g>
                  <path
                    d="M1043.294 273.127a14.716 14.716 0 019.46 3.443l-9.46 11.273z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#fefeff"
                  />
                  <path
                    d="M1052.753 276.57a14.716 14.716 0 015.033 8.717l-14.492 2.556z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#b6b6ff"
                  />
                  <path
                    d="M1057.786 285.287a14.716 14.716 0 01-1.748 9.914l-12.744-7.358z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff1616"
                  />
                  <path
                    d="M1056.038 295.2a14.716 14.716 0 01-7.71 6.471l-5.034-13.828z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff2d2d"
                  />
                  <path
                    d="M1048.327 301.671a14.716 14.716 0 01-10.066 0l5.033-13.828z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#f3f3ff"
                  />
                  <path
                    d="M1038.261 301.671a14.716 14.716 0 01-7.711-6.47l12.744-7.358z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff1717"
                  />
                  <path
                    d="M1030.55 295.2a14.716 14.716 0 01-1.748-9.913l14.492 2.556z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff0404"
                  />
                  <path
                    d="M1028.802 285.287a14.716 14.716 0 015.033-8.717l9.46 11.273z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff9393"
                  />
                  <path
                    d="M1033.835 276.57a14.716 14.716 0 019.46-3.443v14.716z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#d3d3ff"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(1043.294 287.843)"
                  >
                    {'aging'}
                  </text>
                </g>
                <g>
                  <path
                    d="M775.178 177.371a20.508 20.508 0 0113.183 4.798l-13.183 15.71z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ca***REMOVED***f"
                  />
                  <path
                    d="M788.36 182.17a20.508 20.508 0 017.015 12.148l-20.197 3.561z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff0707"
                  />
                  <path
                    d="M795.375 194.318a20.508 20.508 0 01-2.436 13.815l-17.76-10.254z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#fcfcff"
                  />
                  <path
                    d="M792.939 208.133a20.508 20.508 0 01-10.746 9.018l-7.015-19.272z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#dadaff"
                  />
                  <path
                    d="M782.193 217.15a20.508 20.508 0 01-14.029 0l7.014-19.27z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ffc7c7"
                  />
                  <path
                    d="M768.164 217.15a20.508 20.508 0 01-10.746-9.017l17.76-10.254z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#dadaff"
                  />
                  <path
                    d="M757.418 208.133a20.508 20.508 0 01-2.436-13.815l20.196 3.561z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#a3a3ff"
                  />
                  <path
                    d="M754.982 194.318a20.508 20.508 0 017.014-12.149l13.182 15.71z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff0303"
                  />
                  <path
                    d="M761.996 182.17a20.508 20.508 0 0113.182-4.799v20.508z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#e6e6ff"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(775.178 197.88)"
                  >
                    {'mRNA processing'}
                  </text>
                </g>
                <g>
                  <path
                    d="M695.628 158.157a20.313 20.313 0 0113.057 4.752l-13.057 15.561z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#aaf"
                  />
                  <path
                    d="M708.685 162.91a20.313 20.313 0 016.947 12.033l-20.004 3.527z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#0909ff"
                  />
                  <path
                    d="M715.632 174.943a20.313 20.313 0 01-2.412 13.684l-17.592-10.157z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#fafaff"
                  />
                  <path
                    d="M713.22 188.627a20.313 20.313 0 01-10.644 8.931l-6.948-19.088z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ddf"
                  />
                  <path
                    d="M702.576 197.558a20.313 20.313 0 01-13.895 0l6.947-19.088z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ffe9e9"
                  />
                  <path
                    d="M688.68 197.558a20.313 20.313 0 01-10.644-8.931l17.592-10.157z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff2b2b"
                  />
                  <path
                    d="M678.036 188.627a20.313 20.313 0 01-2.412-13.684l20.004 3.527z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#6969ff"
                  />
                  <path
                    d="M675.624 174.943a20.313 20.313 0 016.947-12.034l13.057 15.561z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#3e3eff"
                  />
                  <path
                    d="M682.571 162.91a20.313 20.313 0 0113.057-4.753v20.313z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#fefeff"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(695.628 178.47)"
                  >
                    {'transcription factor binding'}
                  </text>
                </g>
                <g>
                  <path
                    d="M730.414 599.385a20.214 20.214 0 0112.993 4.73l-12.993 15.484z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#5353ff"
                  />
                  <path
                    d="M743.407 604.114a20.214 20.214 0 016.914 11.975l-19.907 3.51z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#2a2aff"
                  />
                  <path
                    d="M750.321 616.09a20.214 20.214 0 01-2.401 13.616L730.414 619.6z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#7474ff"
                  />
                  <path
                    d="M747.92 629.706a20.214 20.214 0 01-10.592 8.889l-6.914-18.996z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#6969ff"
                  />
                  <path
                    d="M737.328 638.595a20.214 20.214 0 01-13.828 0l6.914-18.996z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#9a9aff"
                  />
                  <path
                    d="M723.5 638.595a20.214 20.214 0 01-10.592-8.889l17.506-10.107z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#d7d7ff"
                  />
                  <path
                    d="M712.908 629.706a20.214 20.214 0 01-2.401-13.617l19.907 3.51z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#8181ff"
                  />
                  <path
                    d="M710.507 616.09a20.214 20.214 0 016.913-11.976l12.994 15.485z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#1313ff"
                  />
                  <path
                    d="M717.42 604.114a20.214 20.214 0 0112.994-4.729V619.6z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ffacac"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(730.414 619.6)"
                  >
                    {'endoplasmic reticulum'}
                  </text>
                </g>
                <g>
                  <path
                    d="M869.269 255.537a10.687 10.687 0 016.869 2.5l-6.87 8.186z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#a9a9ff"
                  />
                  <path
                    d="M876.138 258.037a10.687 10.687 0 013.655 6.33l-10.524 1.856z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#d5d5ff"
                  />
                  <path
                    d="M879.793 264.368a10.687 10.687 0 01-1.27 7.199l-9.254-5.344z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff3f3f"
                  />
                  <path
                    d="M878.524 271.567a10.687 10.687 0 01-5.6 4.698l-3.655-10.042z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#f88"
                  />
                  <path
                    d="M872.924 276.265a10.687 10.687 0 01-7.31 0l3.655-10.042z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#f2f2ff"
                  />
                  <path
                    d="M865.614 276.265a10.687 10.687 0 01-5.6-4.698l9.255-5.344z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff6868"
                  />
                  <path
                    d="M860.014 271.567a10.687 10.687 0 01-1.27-7.2l10.525 1.856z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#c0c0ff"
                  />
                  <path
                    d="M858.745 264.368a10.687 10.687 0 013.655-6.331l6.869 8.186z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ddf"
                  />
                  <path
                    d="M862.4 258.037a10.687 10.687 0 016.869-2.5v10.686z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff2828"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(869.269 266.223)"
                  >
                    {'sulfur compound metabolic process'}
                  </text>
                </g>
                <g>
                  <path
                    d="M644.134 661.382a15.563 15.563 0 0110.004 3.64l-10.004 11.923z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#9a9aff"
                  />
                  <path
                    d="M654.138 665.023a15.563 15.563 0 015.323 9.22l-15.327 2.702z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#e2e2ff"
                  />
                  <path
                    d="M659.461 674.242a15.563 15.563 0 01-1.848 10.484l-13.479-7.781z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#2323ff"
                  />
                  <path
                    d="M657.613 684.726a15.563 15.563 0 01-8.156 6.843l-5.323-14.624z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#2929ff"
                  />
                  <path
                    d="M649.457 691.57a15.563 15.563 0 01-10.645 0l5.322-14.625z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ffa3a3"
                  />
                  <path
                    d="M638.812 691.57a15.563 15.563 0 01-8.156-6.844l13.478-7.781z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#0202ff"
                  />
                  <path
                    d="M630.656 684.726a15.563 15.563 0 01-1.848-10.484l15.326 2.703z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#0101ff"
                  />
                  <path
                    d="M628.808 674.242a15.563 15.563 0 015.323-9.22l10.003 11.923z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#9d9dff"
                  />
                  <path
                    d="M634.13 665.023a15.563 15.563 0 0110.004-3.641v15.563z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#0404ff"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(644.134 676.945)"
                  >
                    {'transmembrane transporter activity'}
                  </text>
                </g>
                <g>
                  <path
                    d="M637.815 588.806a18.316 18.316 0 0111.773 4.285l-11.773 14.031z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ffa1a1"
                  />
                  <path
                    d="M649.588 593.091a18.316 18.316 0 016.265 10.85l-18.038 3.181z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#2b2bff"
                  />
                  <path
                    d="M655.853 603.942a18.316 18.316 0 01-2.176 12.338l-15.862-9.158z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#1616ff"
                  />
                  <path
                    d="M653.677 616.28a18.316 18.316 0 01-9.597 8.053l-6.265-17.21z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#0707ff"
                  />
                  <path
                    d="M644.08 624.333a18.316 18.316 0 01-12.53 0l6.265-17.21z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#77f"
                  />
                  <path
                    d="M631.55 624.333a18.316 18.316 0 01-9.597-8.053l15.862-9.158z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#2626ff"
                  />
                  <path
                    d="M621.953 616.28a18.316 18.316 0 01-2.175-12.338l18.037 3.18z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#2323ff"
                  />
                  <path
                    d="M619.778 603.942a18.316 18.316 0 016.264-10.85l11.773 14.03z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#5252ff"
                  />
                  <path
                    d="M626.042 593.091a18.316 18.316 0 0111.773-4.285v18.316z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#88f"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(637.815 607.122)"
                  >
                    {'transmembrane transport'}
                  </text>
                </g>
                <g>
                  <path
                    d="M761.78 666.29a17.67 17.67 0 0111.358 4.134L761.78 683.96z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff7a7a"
                  />
                  <path
                    d="M773.138 670.424a17.67 17.67 0 016.043 10.468l-17.401 3.068z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#9090ff"
                  />
                  <path
                    d="M779.181 680.892a17.67 17.67 0 01-2.099 11.903l-15.302-8.835z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#fdfdff"
                  />
                  <path
                    d="M777.082 692.795a17.67 17.67 0 01-9.259 7.77l-6.043-16.605z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#9f9fff"
                  />
                  <path
                    d="M767.823 700.564a17.67 17.67 0 01-12.087 0l6.044-16.604z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#2525ff"
                  />
                  <path
                    d="M755.736 700.564a17.67 17.67 0 01-9.259-7.77l15.303-8.834z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#c6c6ff"
                  />
                  <path
                    d="M746.477 692.795a17.67 17.67 0 01-2.099-11.903l17.402 3.068z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#c4c4ff"
                  />
                  <path
                    d="M744.378 680.892a17.67 17.67 0 016.044-10.468l11.358 13.536z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#9f9fff"
                  />
                  <path
                    d="M750.422 670.424a17.67 17.67 0 0111.358-4.134v17.67z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ffd1d1"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(761.78 683.96)"
                  >
                    {'membrane organization'}
                  </text>
                </g>
                <g>
                  <path
                    d="M698.048 390.809a12.206 12.206 0 017.845 2.855l-7.845 9.35z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ccf"
                  />
                  <path
                    d="M705.893 393.664a12.206 12.206 0 014.175 7.231l-12.02 2.12z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#6464ff"
                  />
                  <path
                    d="M710.068 400.895a12.206 12.206 0 01-1.45 8.222l-10.57-6.103z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#7070ff"
                  />
                  <path
                    d="M708.618 409.117a12.206 12.206 0 01-6.396 5.367l-4.174-11.47z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#7070ff"
                  />
                  <path
                    d="M702.222 414.484a12.206 12.206 0 01-8.349 0l4.175-11.47z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#b4b4ff"
                  />
                  <path
                    d="M693.873 414.484a12.206 12.206 0 01-6.396-5.367l10.57-6.103z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#5353ff"
                  />
                  <path
                    d="M687.477 409.117a12.206 12.206 0 01-1.45-8.222l12.02 2.12z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff6c6c"
                  />
                  <path
                    d="M686.027 400.895a12.206 12.206 0 014.175-7.23l7.846 9.35z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#1e1eff"
                  />
                  <path
                    d="M690.202 393.664a12.206 12.206 0 017.846-2.855v12.205z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#9b9bff"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(698.048 403.014)"
                  >
                    {'ubiquitin-like protein binding'}
                  </text>
                </g>
                <g>
                  <path
                    d="M901.461 76.195a37.084 37.084 0 0123.838 8.676L901.46 113.28z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#4040ff"
                  />
                  <path
                    d="M925.299 84.871a37.084 37.084 0 0112.683 21.969l-36.52 6.44z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ffeaea"
                  />
                  <path
                    d="M937.982 106.84a37.084 37.084 0 01-4.405 24.982l-32.116-18.543z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ffa7a7"
                  />
                  <path
                    d="M933.577 131.822a37.084 37.084 0 01-19.432 16.305L901.46 113.28z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#b1b1ff"
                  />
                  <path
                    d="M914.145 148.127a37.084 37.084 0 01-25.367 0l12.683-34.848z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ededff"
                  />
                  <path
                    d="M888.778 148.127a37.084 37.084 0 01-19.433-16.305l32.116-18.543z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff7b7b"
                  />
                  <path
                    d="M869.345 131.822a37.084 37.084 0 01-4.405-24.982l36.521 6.44z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#fdd"
                  />
                  <path
                    d="M864.94 106.84a37.084 37.084 0 0112.684-21.969l23.837 28.408z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff2a2a"
                  />
                  <path
                    d="M877.624 84.871a37.084 37.084 0 0123.837-8.676v37.084z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ffcbcb"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(901.461 113.28)"
                  >
                    {'cellular nitrogen compound metabolic process'}
                  </text>
                </g>
                <g>
                  <path
                    d="M902.457 472.807a11.353 11.353 0 017.298 2.656l-7.298 8.697z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#6969ff"
                  />
                  <path
                    d="M909.755 475.463a11.353 11.353 0 013.883 6.726l-11.18 1.97z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#4d4dff"
                  />
                  <path
                    d="M913.638 482.189a11.353 11.353 0 01-1.348 7.647l-9.833-5.676z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff0808"
                  />
                  <path
                    d="M912.29 489.836a11.353 11.353 0 01-5.95 4.992l-3.883-10.668z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff0303"
                  />
                  <path
                    d="M906.34 494.828a11.353 11.353 0 01-7.766 0l3.883-10.668z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#5959ff"
                  />
                  <path
                    d="M898.574 494.828a11.353 11.353 0 01-5.949-4.992l9.832-5.676z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff0404"
                  />
                  <path
                    d="M892.625 489.836a11.353 11.353 0 01-1.348-7.647l11.18 1.97z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#c9c9ff"
                  />
                  <path
                    d="M891.277 482.189a11.353 11.353 0 013.883-6.726l7.297 8.697z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#d6d6ff"
                  />
                  <path
                    d="M895.16 475.463a11.353 11.353 0 017.297-2.656v11.353z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff0b0b"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(902.457 484.16)"
                  >
                    {'extracellular matrix'}
                  </text>
                </g>
                <g>
                  <path
                    d="M524.71 573.708a22.229 22.229 0 0114.289 5.2l-14.289 17.029z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#5656ff"
                  />
                  <path
                    d="M538.999 578.909a22.229 22.229 0 017.602 13.168l-21.89 3.86z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#7373ff"
                  />
                  <path
                    d="M546.601 592.077a22.229 22.229 0 01-2.64 14.974l-19.25-11.114z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#f5f5ff"
                  />
                  <path
                    d="M543.961 607.051a22.229 22.229 0 01-11.648 9.774l-7.603-20.888z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ededff"
                  />
                  <path
                    d="M532.313 616.825a22.229 22.229 0 01-15.205 0l7.602-20.888z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#7070ff"
                  />
                  <path
                    d="M517.108 616.825a22.229 22.229 0 01-11.648-9.774l19.25-11.114z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ffc2c2"
                  />
                  <path
                    d="M505.46 607.051a22.229 22.229 0 01-2.64-14.974l21.89 3.86z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#dfdfff"
                  />
                  <path
                    d="M502.82 592.077a22.229 22.229 0 017.602-13.168l14.288 17.028z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#6969ff"
                  />
                  <path
                    d="M510.422 578.909a22.229 22.229 0 0114.288-5.2v22.228z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff5c5c"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(524.71 595.937)"
                  >
                    {'cytoplasmic vesicle'}
                  </text>
                </g>
                <g>
                  <path
                    d="M571.623 684.542a14.086 14.086 0 019.055 3.296l-9.055 10.79z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#5959ff"
                  />
                  <path
                    d="M580.678 687.838a14.086 14.086 0 014.817 8.344l-13.872 2.446z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#f9f9ff"
                  />
                  <path
                    d="M585.495 696.182a14.086 14.086 0 01-1.673 9.489l-12.199-7.043z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#0b0bff"
                  />
                  <path
                    d="M583.822 705.67a14.086 14.086 0 01-7.38 6.194l-4.819-13.236z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#0808ff"
                  />
                  <path
                    d="M576.441 711.864a14.086 14.086 0 01-9.635 0l4.817-13.236z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff6b6b"
                  />
                  <path
                    d="M566.806 711.864a14.086 14.086 0 01-7.381-6.193l12.198-7.043z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#0606ff"
                  />
                  <path
                    d="M559.425 705.67a14.086 14.086 0 01-1.673-9.488l13.871 2.446z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#b2b2ff"
                  />
                  <path
                    d="M557.752 696.182a14.086 14.086 0 014.817-8.344l9.054 10.79z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#8383ff"
                  />
                  <path
                    d="M562.57 687.838a14.086 14.086 0 019.053-3.296v14.086z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#1616ff"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(571.623 698.628)"
                  >
                    {'cilium'}
                  </text>
                </g>
                <g>
                  <path
                    d="M926.984 564.091a13.674 13.674 0 018.79 3.2l-8.79 10.474z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#b8b8ff"
                  />
                  <path
                    d="M935.774 567.29a13.674 13.674 0 014.677 8.1l-13.467 2.375z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#2525ff"
                  />
                  <path
                    d="M940.45 575.39a13.674 13.674 0 01-1.624 9.213l-11.842-6.838z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#fdfdff"
                  />
                  <path
                    d="M938.826 584.603a13.674 13.674 0 01-7.165 6.012l-4.677-12.85z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#d3d3ff"
                  />
                  <path
                    d="M931.661 590.615a13.674 13.674 0 01-9.354 0l4.677-12.85z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#5353ff"
                  />
                  <path
                    d="M922.307 590.615a13.674 13.674 0 01-7.165-6.012l11.842-6.838z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff4343"
                  />
                  <path
                    d="M915.142 584.603a13.674 13.674 0 01-1.625-9.212l13.467 2.374z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#a8a8ff"
                  />
                  <path
                    d="M913.517 575.39a13.674 13.674 0 014.677-8.1l8.79 10.475z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#adadff"
                  />
                  <path
                    d="M918.194 567.29a13.674 13.674 0 018.79-3.199v13.674z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff6464"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(926.984 577.765)"
                  >
                    {'phosphatase activity'}
                  </text>
                </g>
                <g>
                  <path
                    d="M829.023 294.155a11.104 11.104 0 017.137 2.598l-7.137 8.506z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#8787ff"
                  />
                  <path
                    d="M836.16 296.753a11.104 11.104 0 013.798 6.578l-10.935 1.928z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#a7a7ff"
                  />
                  <path
                    d="M839.958 303.33a11.104 11.104 0 01-1.32 7.48l-9.615-5.551z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#c7c7ff"
                  />
                  <path
                    d="M838.639 310.81a11.104 11.104 0 01-5.819 4.883l-3.797-10.434z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#9595ff"
                  />
                  <path
                    d="M832.82 315.693a11.104 11.104 0 01-7.595 0l3.798-10.434z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ffafaf"
                  />
                  <path
                    d="M825.225 315.693a11.104 11.104 0 01-5.818-4.882l9.616-5.552z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#b8b8ff"
                  />
                  <path
                    d="M819.407 310.81a11.104 11.104 0 01-1.32-7.48l10.936 1.929z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#e6e6ff"
                  />
                  <path
                    d="M818.088 303.33a11.104 11.104 0 013.797-6.577l7.138 8.506z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#e3e3ff"
                  />
                  <path
                    d="M821.885 296.753a11.104 11.104 0 017.138-2.598v11.104z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ffefef"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(829.023 305.259)"
                  >
                    {'cofactor metabolic process'}
                  </text>
                </g>
                <g>
                  <path
                    d="M884.78 317.968a12.393 12.393 0 017.967 2.9l-7.966 9.493z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#7575ff"
                  />
                  <path
                    d="M892.747 320.867a12.393 12.393 0 014.239 7.342l-12.205 2.152z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#b4b4ff"
                  />
                  <path
                    d="M896.986 328.209a12.393 12.393 0 01-1.472 8.349l-10.733-6.197z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#3c3cff"
                  />
                  <path
                    d="M895.514 336.558a12.393 12.393 0 01-6.494 5.449l-4.24-11.646z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#3737ff"
                  />
                  <path
                    d="M889.02 342.007a12.393 12.393 0 01-8.478 0l4.239-11.646z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#3232ff"
                  />
                  <path
                    d="M880.542 342.007a12.393 12.393 0 01-6.494-5.45l10.733-6.196z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#eaeaff"
                  />
                  <path
                    d="M874.048 336.558a12.393 12.393 0 01-1.472-8.349l12.205 2.152z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ffe4e4"
                  />
                  <path
                    d="M872.576 328.209a12.393 12.393 0 014.239-7.342l7.966 9.494z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#9292ff"
                  />
                  <path
                    d="M876.815 320.867a12.393 12.393 0 017.966-2.9v12.394z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#adadff"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(884.78 330.361)"
                  >
                    {'nuclease activity'}
                  </text>
                </g>
                <g>
                  <path
                    d="M527.946 670.128a21.441 21.441 0 0113.782 5.016l-13.782 16.425z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ffaeae"
                  />
                  <path
                    d="M541.728 675.144a21.441 21.441 0 017.334 12.702l-21.116 3.723z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#0909ff"
                  />
                  <path
                    d="M549.062 687.846a21.441 21.441 0 01-2.547 14.444l-18.569-10.72z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#fbfbff"
                  />
                  <path
                    d="M546.515 702.29a21.441 21.441 0 01-11.236 9.427l-7.333-20.148z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#b7b7ff"
                  />
                  <path
                    d="M535.28 711.717a21.441 21.441 0 01-14.667 0l7.333-20.148z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#0404ff"
                  />
                  <path
                    d="M520.613 711.717a21.441 21.441 0 01-11.235-9.427l18.568-10.72z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff2929"
                  />
                  <path
                    d="M509.378 702.29a21.441 21.441 0 01-2.547-14.444l21.115 3.723z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#6d6dff"
                  />
                  <path
                    d="M506.83 687.846a21.441 21.441 0 017.334-12.702l13.782 16.425z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#3434ff"
                  />
                  <path
                    d="M514.164 675.144a21.441 21.441 0 0113.782-5.016v21.441z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff3a3a"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(527.946 691.57)"
                  >
                    {'vesicle-mediated transport'}
                  </text>
                </g>
                <g>
                  <path
                    d="M564.52 610.275a18.433 18.433 0 0111.848 4.312l-11.848 14.12z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#c3c3ff"
                  />
                  <path
                    d="M576.368 614.587a18.433 18.433 0 016.305 10.92l-18.153 3.2z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#88f"
                  />
                  <path
                    d="M582.673 625.507a18.433 18.433 0 01-2.19 12.417l-15.963-9.217z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#e2e2ff"
                  />
                  <path
                    d="M580.483 637.924a18.433 18.433 0 01-9.659 8.104l-6.304-17.32z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#9a9aff"
                  />
                  <path
                    d="M570.824 646.028a18.433 18.433 0 01-12.608 0l6.304-17.32z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#d4d4ff"
                  />
                  <path
                    d="M558.216 646.028a18.433 18.433 0 01-9.659-8.104l15.963-9.217z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#b0b0ff"
                  />
                  <path
                    d="M548.557 637.924a18.433 18.433 0 01-2.19-12.417l18.153 3.2z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#9696ff"
                  />
                  <path
                    d="M546.368 625.507a18.433 18.433 0 016.304-10.92l11.848 14.12z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#9d9dff"
                  />
                  <path
                    d="M552.672 614.587a18.433 18.433 0 0111.848-4.312v18.432z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ffc3c3"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(564.52 628.707)"
                  >
                    {'endosome'}
                  </text>
                </g>
                <g>
                  <path
                    d="M729.937 190.223a20.572 20.572 0 0113.223 4.813l-13.223 15.76z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#6b6bff"
                  />
                  <path
                    d="M743.16 195.036a20.572 20.572 0 017.036 12.187l-20.26 3.572z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#7171ff"
                  />
                  <path
                    d="M750.196 207.223a20.572 20.572 0 01-2.443 13.859l-17.816-10.287z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ffd1d1"
                  />
                  <path
                    d="M747.753 221.082a20.572 20.572 0 01-10.78 9.045l-7.036-19.332z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ceceff"
                  />
                  <path
                    d="M736.973 230.127a20.572 20.572 0 01-14.073 0l7.037-19.332z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#77f"
                  />
                  <path
                    d="M722.9 230.127a20.572 20.572 0 01-10.78-9.045l17.817-10.287z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#eef"
                  />
                  <path
                    d="M712.12 221.082a20.572 20.572 0 01-2.443-13.859l20.26 3.572z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#0707ff"
                  />
                  <path
                    d="M709.677 207.223a20.572 20.572 0 017.036-12.187l13.224 15.76z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#e1e1ff"
                  />
                  <path
                    d="M716.713 195.036a20.572 20.572 0 0113.224-4.813v20.572z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ffe6e6"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(729.937 210.795)"
                  >
                    {'DNA-binding transcription factor activity'}
                  </text>
                </g>
                <g>
                  <path
                    d="M673.654 41.302a33.41 33.41 0 0121.475 7.816l-21.475 25.594z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#3b3bff"
                  />
                  <path
                    d="M695.13 49.118a33.41 33.41 0 0111.426 19.792l-32.902 5.802z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#fefeff"
                  />
                  <path
                    d="M706.556 68.91a33.41 33.41 0 01-3.968 22.507l-28.934-16.705z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ffb0b0"
                  />
                  <path
                    d="M702.588 91.417a33.41 33.41 0 01-17.507 14.69l-11.427-31.395z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#faa"
                  />
                  <path
                    d="M685.08 106.107a33.41 33.41 0 01-22.853 0l11.427-31.395z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#fcfcff"
                  />
                  <path
                    d="M662.227 106.107a33.41 33.41 0 01-17.507-14.69l28.934-16.705z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ededff"
                  />
                  <path
                    d="M644.72 91.417a33.41 33.41 0 01-3.968-22.507l32.902 5.802z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#fffefe"
                  />
                  <path
                    d="M640.752 68.91a33.41 33.41 0 0111.426-19.792l21.476 25.594z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#c8c8ff"
                  />
                  <path
                    d="M652.178 49.118a33.41 33.41 0 0121.476-7.816v33.41z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#f5f5ff"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(673.654 74.712)"
                  >
                    {'nucleoplasm'}
                  </text>
                </g>
                <g>
                  <path
                    d="M547.84 426.855a20.476 20.476 0 0113.161 4.79l-13.161 15.686z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#0101ff"
                  />
                  <path
                    d="M561.001 431.645a20.476 20.476 0 017.004 12.13l-20.165 3.556z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#2121ff"
                  />
                  <path
                    d="M568.005 443.775a20.476 20.476 0 01-2.433 13.794L547.84 447.33z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#1e1eff"
                  />
                  <path
                    d="M565.572 457.569a20.476 20.476 0 01-10.729 9.003l-7.003-19.241z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#2323ff"
                  />
                  <path
                    d="M554.843 466.572a20.476 20.476 0 01-14.006 0l7.003-19.241z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#66f"
                  />
                  <path
                    d="M540.837 466.572a20.476 20.476 0 01-10.73-9.003l17.733-10.238z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#5757ff"
                  />
                  <path
                    d="M530.107 457.569a20.476 20.476 0 01-2.432-13.794l20.165 3.556z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff5151"
                  />
                  <path
                    d="M527.675 443.775a20.476 20.476 0 017.003-12.13l13.162 15.686z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#1616ff"
                  />
                  <path
                    d="M534.678 431.645a20.476 20.476 0 0113.162-4.79v20.476z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#5a5aff"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(547.84 447.33)"
                  >
                    {'mitotic cell cycle'}
                  </text>
                </g>
                <g>
                  <path
                    d="M739.49 438.77a50 50 0 0132.138 11.698L739.49 488.77z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ffe0e0"
                  />
                  <path
                    d="M771.628 450.468a50 50 0 0117.101 29.62l-49.24 8.682z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#bbf"
                  />
                  <path
                    d="M788.73 480.088a50 50 0 01-5.94 33.682l-43.3-25z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ffcbcb"
                  />
                  <path
                    d="M782.79 513.77a50 50 0 01-26.2 21.985l-17.1-46.985z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#d5d5ff"
                  />
                  <path
                    d="M756.59 535.755a50 50 0 01-34.202 0l17.101-46.985z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#efefff"
                  />
                  <path
                    d="M722.388 535.755a50 50 0 01-26.2-21.985l43.301-25z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ffb3b3"
                  />
                  <path
                    d="M696.188 513.77a50 50 0 01-5.94-33.682l49.241 8.682z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#e3e3ff"
                  />
                  <path
                    d="M690.249 480.088a50 50 0 0117.1-29.62l32.14 38.302z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ffc7c7"
                  />
                  <path
                    d="M707.35 450.468a50 50 0 0132.14-11.698v50z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ffa9a9"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(739.49 488.77)"
                  >
                    {'cellular_component'}
                  </text>
                </g>
                <g>
                  <path
                    d="M926.434 680.883a15.825 15.825 0 0110.173 3.703l-10.173 12.123z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ffb9b9"
                  />
                  <path
                    d="M936.607 684.586a15.825 15.825 0 015.412 9.375l-15.585 2.748z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#5151ff"
                  />
                  <path
                    d="M942.02 693.96a15.825 15.825 0 01-1.88 10.661l-13.706-7.912z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff4646"
                  />
                  <path
                    d="M940.14 704.621a15.825 15.825 0 01-8.293 6.958l-5.413-14.87z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#f7f7ff"
                  />
                  <path
                    d="M931.847 711.58a15.825 15.825 0 01-10.825 0l5.412-14.871z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#dbdbff"
                  />
                  <path
                    d="M921.022 711.58a15.825 15.825 0 01-8.293-6.959l13.705-7.912z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff1212"
                  />
                  <path
                    d="M912.73 704.621a15.825 15.825 0 01-1.88-10.66l15.584 2.748z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ceceff"
                  />
                  <path
                    d="M910.85 693.96a15.825 15.825 0 015.412-9.374l10.172 12.123z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#d2d2ff"
                  />
                  <path
                    d="M916.262 684.586a15.825 15.825 0 0110.172-3.703v15.826z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff1818"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(926.434 696.709)"
                  >
                    {'extracellular region'}
                  </text>
                </g>
                <g>
                  <path
                    d="M935.461 274.282a22.454 22.454 0 0114.433 5.253l-14.433 17.2z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#7474ff"
                  />
                  <path
                    d="M949.894 279.535a22.454 22.454 0 017.68 13.302l-22.113 3.899z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#f2f2ff"
                  />
                  <path
                    d="M957.574 292.837a22.454 22.454 0 01-2.667 15.126l-19.446-11.227z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff0a0a"
                  />
                  <path
                    d="M954.907 307.963a22.454 22.454 0 01-11.766 9.872l-7.68-21.1z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff0c0c"
                  />
                  <path
                    d="M943.14 317.835a22.454 22.454 0 01-15.359 0l7.68-21.1z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#c5c5ff"
                  />
                  <path
                    d="M927.781 317.835a22.454 22.454 0 01-11.766-9.872l19.446-11.227z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff6161"
                  />
                  <path
                    d="M916.015 307.963a22.454 22.454 0 01-2.667-15.126l22.113 3.899z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ffb4b4"
                  />
                  <path
                    d="M913.348 292.837a22.454 22.454 0 017.68-13.302l14.433 17.2z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff2424"
                  />
                  <path
                    d="M921.028 279.535a22.454 22.454 0 0114.433-5.253v22.454z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff9090"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(935.461 296.736)"
                  >
                    {'nucleolus'}
                  </text>
                </g>
                <g>
                  <path
                    d="M575.739 129.146a24.167 24.167 0 0115.534 5.654l-15.534 18.513z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#babaff"
                  />
                  <path
                    d="M591.273 134.8a24.167 24.167 0 018.266 14.316l-23.8 4.197z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#d6d6ff"
                  />
                  <path
                    d="M599.539 149.116a24.167 24.167 0 01-2.87 16.28l-20.93-12.083z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff7171"
                  />
                  <path
                    d="M596.668 165.396a24.167 24.167 0 01-12.664 10.627l-8.265-22.71z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff7c7c"
                  />
                  <path
                    d="M584.004 176.023a24.167 24.167 0 01-16.531 0l8.266-22.71z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#fff9f9"
                  />
                  <path
                    d="M567.473 176.023a24.167 24.167 0 01-12.664-10.627l20.93-12.083z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff7a7a"
                  />
                  <path
                    d="M554.81 165.396a24.167 24.167 0 01-2.871-16.28l23.8 4.197z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff0909"
                  />
                  <path
                    d="M551.939 149.116a24.167 24.167 0 018.265-14.316l15.535 18.513z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#bcbcff"
                  />
                  <path
                    d="M560.204 134.8a24.167 24.167 0 0115.535-5.654v24.167z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#cbcbff"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(575.739 153.313)"
                  >
                    {'chromosome'}
                  </text>
                </g>
                <g>
                  <path
                    d="M1083.56 655.455a19.811 19.811 0 0112.734 4.635l-12.735 15.177z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#9696ff"
                  />
                  <path
                    d="M1096.294 660.09a19.811 19.811 0 016.775 11.736l-19.51 3.44z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#1919ff"
                  />
                  <path
                    d="M1103.07 671.826a19.811 19.811 0 01-2.354 13.346l-17.157-9.905z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#8282ff"
                  />
                  <path
                    d="M1100.716 685.172a19.811 19.811 0 01-10.381 8.711l-6.776-18.616z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#5858ff"
                  />
                  <path
                    d="M1090.335 693.883a19.811 19.811 0 01-13.552 0l6.776-18.616z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#00f"
                  />
                  <path
                    d="M1076.783 693.883a19.811 19.811 0 01-10.38-8.71l17.156-9.906z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff2f2f"
                  />
                  <path
                    d="M1066.402 685.172a19.811 19.811 0 01-2.353-13.346l19.51 3.44z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#fdfdff"
                  />
                  <path
                    d="M1064.049 671.826a19.811 19.811 0 016.776-11.736l12.734 15.177z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#3535ff"
                  />
                  <path
                    d="M1070.825 660.09a19.811 19.811 0 0112.734-4.635v19.812z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff1616"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(1083.56 675.267)"
                  >
                    {'cell adhesion'}
                  </text>
                </g>
                <g>
                  <path
                    d="M948.437 202.476a11.104 11.104 0 017.138 2.598l-7.138 8.506z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#fcfcff"
                  />
                  <path
                    d="M955.575 205.074a11.104 11.104 0 013.797 6.577l-10.935 1.929z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#5a5aff"
                  />
                  <path
                    d="M959.372 211.651a11.104 11.104 0 01-1.319 7.48l-9.616-5.551z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#e6e6ff"
                  />
                  <path
                    d="M958.053 219.131a11.104 11.104 0 01-5.818 4.883l-3.798-10.434z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ffc8c8"
                  />
                  <path
                    d="M952.235 224.014a11.104 11.104 0 01-7.595 0l3.797-10.434z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff0303"
                  />
                  <path
                    d="M944.64 224.014a11.104 11.104 0 01-5.819-4.883l9.616-5.551z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#fbfbff"
                  />
                  <path
                    d="M938.821 219.131a11.104 11.104 0 01-1.319-7.48l10.935 1.929z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#f5f5ff"
                  />
                  <path
                    d="M937.502 211.651a11.104 11.104 0 013.798-6.577l7.137 8.506z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ddf"
                  />
                  <path
                    d="M941.3 205.074a11.104 11.104 0 017.137-2.598v11.104z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#5050ff"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(948.437 213.58)"
                  >
                    {'lyase activity'}
                  </text>
                </g>
                <g>
                  <path
                    d="M1148.682 402.17a32.586 32.586 0 0120.946 7.624l-20.946 24.962z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#d5d5ff"
                  />
                  <path
                    d="M1169.628 409.794a32.586 32.586 0 0111.145 19.304l-32.091 5.658z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#3e3eff"
                  />
                  <path
                    d="M1180.773 429.098a32.586 32.586 0 01-3.87 21.952l-28.221-16.294z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#cdcdff"
                  />
                  <path
                    d="M1176.903 451.05a32.586 32.586 0 01-17.076 14.328l-11.145-30.622z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#d6d6ff"
                  />
                  <path
                    d="M1159.827 465.378a32.586 32.586 0 01-22.29 0l11.145-30.622z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#3838ff"
                  />
                  <path
                    d="M1137.537 465.378a32.586 32.586 0 01-17.076-14.328l28.221-16.294z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff7a7a"
                  />
                  <path
                    d="M1120.461 451.05a32.586 32.586 0 01-3.87-21.952l32.091 5.658z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#eaeaff"
                  />
                  <path
                    d="M1116.59 429.098a32.586 32.586 0 0111.146-19.304l20.946 24.962z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#a5a5ff"
                  />
                  <path
                    d="M1127.736 409.794a32.586 32.586 0 0120.946-7.624v32.586z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#fafaff"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(1148.682 434.756)"
                  >
                    {'anatomical structure development'}
                  </text>
                </g>
                <g>
                  <path
                    d="M988.326 300.69a29.986 29.986 0 0119.275 7.016l-19.275 22.97z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#1818ff"
                  />
                  <path
                    d="M1007.601 307.706a29.986 29.986 0 0110.256 17.764l-29.53 5.207z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#00f"
                  />
                  <path
                    d="M1017.857 325.47a29.986 29.986 0 01-3.562 20.2l-25.969-14.993z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#00f"
                  />
                  <path
                    d="M1014.295 345.67a29.986 29.986 0 01-15.713 13.184l-10.256-28.177z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#00f"
                  />
                  <path
                    d="M998.582 358.854a29.986 29.986 0 01-20.511 0l10.255-28.177z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#cdcdff"
                  />
                  <path
                    d="M978.07 358.854a29.986 29.986 0 01-15.712-13.184l25.968-14.993z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#1010ff"
                  />
                  <path
                    d="M962.358 345.67a29.986 29.986 0 01-3.562-20.2l29.53 5.207z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff9c9c"
                  />
                  <path
                    d="M958.796 325.47a29.986 29.986 0 0110.256-17.764l19.274 22.97z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#00f"
                  />
                  <path
                    d="M969.052 307.706a29.986 29.986 0 0119.274-7.015v29.986z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#0808ff"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(988.326 330.677)"
                  >
                    {'cellular protein modification process'}
                  </text>
                </g>
                <g>
                  <path
                    d="M1125.325 630.393a21.501 21.501 0 0113.82 5.03l-13.82 16.471z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#6c6cff"
                  />
                  <path
                    d="M1139.146 635.423a21.501 21.501 0 017.353 12.737l-21.174 3.734z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#3030ff"
                  />
                  <path
                    d="M1146.5 648.16a21.501 21.501 0 01-2.555 14.485l-18.62-10.751z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff0f0f"
                  />
                  <path
                    d="M1143.945 662.645a21.501 21.501 0 01-11.266 9.453l-7.354-20.204z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ffacac"
                  />
                  <path
                    d="M1132.679 672.098a21.501 21.501 0 01-14.708 0l7.354-20.204z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#0404ff"
                  />
                  <path
                    d="M1117.971 672.098a21.501 21.501 0 01-11.267-9.453l18.62-10.751z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff0404"
                  />
                  <path
                    d="M1106.704 662.645a21.501 21.501 0 01-2.553-14.485l21.174 3.734z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#babaff"
                  />
                  <path
                    d="M1104.15 648.16a21.501 21.501 0 017.354-12.737l13.82 16.471z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#8b8bff"
                  />
                  <path
                    d="M1111.504 635.423a21.501 21.501 0 0113.82-5.03v21.501z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff0101"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(1125.325 651.894)"
                  >
                    {'locomotion'}
                  </text>
                </g>
                <g>
                  <path
                    d="M741.63 343.406a23.056 23.056 0 0114.82 5.394l-14.82 17.662z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#88f"
                  />
                  <path
                    d="M756.45 348.8a23.056 23.056 0 017.885 13.658l-22.705 4.004z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#7d7dff"
                  />
                  <path
                    d="M764.335 362.458a23.056 23.056 0 01-2.738 15.532l-19.967-11.528z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#5757ff"
                  />
                  <path
                    d="M761.597 377.99a23.056 23.056 0 01-12.082 10.137l-7.885-21.665z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#22f"
                  />
                  <path
                    d="M749.515 388.127a23.056 23.056 0 01-15.77 0l7.885-21.665z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#0202ff"
                  />
                  <path
                    d="M733.744 388.127a23.056 23.056 0 01-12.08-10.137l19.966-11.528z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#3f3fff"
                  />
                  <path
                    d="M721.663 377.99a23.056 23.056 0 01-2.738-15.532l22.705 4.004z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff4141"
                  />
                  <path
                    d="M718.925 362.458a23.056 23.056 0 017.885-13.658l14.82 17.662z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#2e2eff"
                  />
                  <path
                    d="M726.81 348.8a23.056 23.056 0 0114.82-5.394v23.056z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#1c1cff"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(741.63 366.462)"
                  >
                    {'catabolic process'}
                  </text>
                </g>
                <g>
                  <path
                    d="M659.764 230.633a13.884 13.884 0 018.924 3.248l-8.924 10.635z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#1010ff"
                  />
                  <path
                    d="M668.688 233.88a13.884 13.884 0 014.749 8.226l-13.673 2.41z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#4c4cff"
                  />
                  <path
                    d="M673.437 242.106a13.884 13.884 0 01-1.65 9.352l-12.023-6.942z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#0909ff"
                  />
                  <path
                    d="M671.788 251.458a13.884 13.884 0 01-7.276 6.105l-4.748-13.047z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#1919ff"
                  />
                  <path
                    d="M664.512 257.563a13.884 13.884 0 01-9.497 0l4.749-13.047z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#4b4bff"
                  />
                  <path
                    d="M655.015 257.563a13.884 13.884 0 01-7.275-6.105l12.024-6.942z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#11f"
                  />
                  <path
                    d="M647.74 251.458a13.884 13.884 0 01-1.649-9.352l13.673 2.41z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff7272"
                  />
                  <path
                    d="M646.091 242.106a13.884 13.884 0 014.749-8.225l8.924 10.635z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#1d1dff"
                  />
                  <path
                    d="M650.84 233.88a13.884 13.884 0 018.924-3.247v13.883z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#0a0aff"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(659.764 244.516)"
                  >
                    {'transferase activity, transferring acyl groups'}
                  </text>
                </g>
                <g>
                  <path
                    d="M633.078 156.508a36.51 36.51 0 0123.468 8.542l-23.468 27.968z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ffb1b1"
                  />
                  <path
                    d="M656.546 165.05a36.51 36.51 0 0112.487 21.628l-35.955 6.34z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#4242ff"
                  />
                  <path
                    d="M669.033 186.678a36.51 36.51 0 01-4.336 24.594l-31.619-18.254z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#9292ff"
                  />
                  <path
                    d="M664.697 211.272a36.51 36.51 0 01-19.132 16.053l-12.487-34.307z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#55f"
                  />
                  <path
                    d="M645.565 227.325a36.51 36.51 0 01-24.974 0l12.487-34.307z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#f2f2ff"
                  />
                  <path
                    d="M620.591 227.325a36.51 36.51 0 01-19.13-16.053l31.617-18.254z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#d2d2ff"
                  />
                  <path
                    d="M601.46 211.272a36.51 36.51 0 01-4.337-24.594l35.955 6.34z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#f3f3ff"
                  />
                  <path
                    d="M597.123 186.678a36.51 36.51 0 0112.487-21.628l23.468 27.968z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#c5c5ff"
                  />
                  <path
                    d="M609.61 165.05a36.51 36.51 0 0123.468-8.542v36.51z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#7f7fff"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(633.078 193.018)"
                  >
                    {'protein-containing complex'}
                  </text>
                </g>
                <g>
                  <path
                    d="M975.006 408.263a22.648 22.648 0 0114.558 5.298l-14.558 17.35z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff4f4f"
                  />
                  <path
                    d="M989.564 413.561a22.648 22.648 0 017.746 13.417l-22.304 3.933z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#dadaff"
                  />
                  <path
                    d="M997.31 426.978a22.648 22.648 0 01-2.69 15.257l-19.614-11.324z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#cbcbff"
                  />
                  <path
                    d="M994.62 442.235a22.648 22.648 0 01-11.868 9.958l-7.746-21.282z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#77f"
                  />
                  <path
                    d="M982.752 452.193a22.648 22.648 0 01-15.492 0l7.746-21.282z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#6969ff"
                  />
                  <path
                    d="M967.26 452.193a22.648 22.648 0 01-11.868-9.958l19.614-11.324z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#bdbdff"
                  />
                  <path
                    d="M955.392 442.235a22.648 22.648 0 01-2.69-15.257l22.304 3.933z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#4848ff"
                  />
                  <path
                    d="M952.702 426.978a22.648 22.648 0 017.746-13.417l14.558 17.35z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff9898"
                  />
                  <path
                    d="M960.448 413.561a22.648 22.648 0 0114.558-5.298v22.648z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#a3a3ff"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(975.006 430.91)"
                  >
                    {'homeostatic process'}
                  </text>
                </g>
                <g>
                  <path
                    d="M586.03 327.106a10.971 10.971 0 017.052 2.567l-7.052 8.404z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#5050ff"
                  />
                  <path
                    d="M593.082 329.673a10.971 10.971 0 013.752 6.499l-10.804 1.905z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#7a7aff"
                  />
                  <path
                    d="M596.834 336.172a10.971 10.971 0 01-1.303 7.39l-9.501-5.485z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#c9c9ff"
                  />
                  <path
                    d="M595.53 343.563a10.971 10.971 0 01-5.748 4.824l-3.752-10.31z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#cfcfff"
                  />
                  <path
                    d="M589.782 348.387a10.971 10.971 0 01-7.505 0l3.753-10.31z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#a0a0ff"
                  />
                  <path
                    d="M582.277 348.387a10.971 10.971 0 01-5.749-4.824l9.502-5.486z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff6060"
                  />
                  <path
                    d="M576.528 343.563a10.971 10.971 0 01-1.303-7.391l10.805 1.905z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#c1c1ff"
                  />
                  <path
                    d="M575.225 336.172a10.971 10.971 0 013.753-6.5l7.052 8.405z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#1616ff"
                  />
                  <path
                    d="M578.978 329.673a10.971 10.971 0 017.052-2.567v10.971z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#e3e3ff"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(586.03 338.077)"
                  >
                    {'structural constituent of ribosome'}
                  </text>
                </g>
                <g>
                  <path
                    d="M838.71 139.863a41.641 41.641 0 0126.766 9.742l-26.766 31.9z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#7979ff"
                  />
                  <path
                    d="M865.476 149.605a41.641 41.641 0 0114.243 24.668l-41.01 7.231z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#8686ff"
                  />
                  <path
                    d="M879.719 174.273a41.641 41.641 0 01-4.947 28.052l-36.062-20.82z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff3535"
                  />
                  <path
                    d="M874.772 202.325a41.641 41.641 0 01-21.82 18.31l-14.242-39.13z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff3f3f"
                  />
                  <path
                    d="M852.952 220.634a41.641 41.641 0 01-28.484 0l14.242-39.13z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#fafaff"
                  />
                  <path
                    d="M824.468 220.634a41.641 41.641 0 01-21.82-18.309l36.062-20.82z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff3737"
                  />
                  <path
                    d="M802.647 202.325a41.641 41.641 0 01-4.946-28.052l41.009 7.231z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#bfbfff"
                  />
                  <path
                    d="M797.701 174.273a41.641 41.641 0 0114.242-24.668l26.767 31.9z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#e5e5ff"
                  />
                  <path
                    d="M811.943 149.605a41.641 41.641 0 0126.767-9.742v41.641z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff3434"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(838.71 181.504)"
                  >
                    {'nucleus'}
                  </text>
                </g>
                <g>
                  <path
                    d="M1115.047 545.453a26.077 26.077 0 0116.762 6.101l-16.762 19.976z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff4e4e"
                  />
                  <path
                    d="M1131.81 551.554a26.077 26.077 0 018.918 15.448l-25.68 4.528z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#3d3dff"
                  />
                  <path
                    d="M1140.728 567.002a26.077 26.077 0 01-3.098 17.566l-22.583-13.038z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff8c8c"
                  />
                  <path
                    d="M1137.63 584.568a26.077 26.077 0 01-13.664 11.466l-8.919-24.504z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#c8c8ff"
                  />
                  <path
                    d="M1123.966 596.034a26.077 26.077 0 01-17.837 0l8.918-24.504z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#0606ff"
                  />
                  <path
                    d="M1106.129 596.034a26.077 26.077 0 01-13.665-11.466l22.583-13.038z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff0e0e"
                  />
                  <path
                    d="M1092.464 584.568a26.077 26.077 0 01-3.097-17.566l25.68 4.528z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#6363ff"
                  />
                  <path
                    d="M1089.367 567.002a26.077 26.077 0 018.919-15.448l16.761 19.976z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#f7f7ff"
                  />
                  <path
                    d="M1098.286 551.554a26.077 26.077 0 0116.761-6.1v26.076z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff0303"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(1115.047 571.53)"
                  >
                    {'immune system process'}
                  </text>
                </g>
                <g>
                  <path
                    d="M771.508 407.072a12.3 12.3 0 017.906 2.878l-7.906 9.422z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#1e1eff"
                  />
                  <path
                    d="M779.414 409.95a12.3 12.3 0 014.207 7.286l-12.113 2.136z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#3c3cff"
                  />
                  <path
                    d="M783.621 417.236a12.3 12.3 0 01-1.46 8.287l-10.653-6.15z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ffd1d1"
                  />
                  <path
                    d="M782.16 425.523a12.3 12.3 0 01-6.445 5.408l-4.207-11.559z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ffa6a6"
                  />
                  <path
                    d="M775.715 430.931a12.3 12.3 0 01-8.414 0l4.207-11.559z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#8585ff"
                  />
                  <path
                    d="M767.3 430.931a12.3 12.3 0 01-6.445-5.408l10.653-6.15z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#f5f5ff"
                  />
                  <path
                    d="M760.855 425.523a12.3 12.3 0 01-1.461-8.287l12.114 2.136z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ddf"
                  />
                  <path
                    d="M759.394 417.236a12.3 12.3 0 014.207-7.286l7.907 9.422z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#7070ff"
                  />
                  <path
                    d="M763.6 409.95a12.3 12.3 0 017.908-2.878v12.3z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#fdfdff"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(771.508 419.372)"
                  >
                    {'protein folding'}
                  </text>
                </g>
                <g>
                  <path
                    d="M773.412 81.577a20.89 20.89 0 0113.428 4.888l-13.428 16.002z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#fefeff"
                  />
                  <path
                    d="M786.84 86.465a20.89 20.89 0 017.144 12.374l-20.572 3.628z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#4a4aff"
                  />
                  <path
                    d="M793.984 98.84a20.89 20.89 0 01-2.48 14.072l-18.092-10.445z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff2626"
                  />
                  <path
                    d="M791.503 112.912a20.89 20.89 0 01-10.946 9.184l-7.145-19.63z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ffabab"
                  />
                  <path
                    d="M780.557 122.096a20.89 20.89 0 01-14.29 0l7.145-19.63z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#fafaff"
                  />
                  <path
                    d="M766.268 122.096a20.89 20.89 0 01-10.946-9.184l18.09-10.445z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff0303"
                  />
                  <path
                    d="M755.322 112.912a20.89 20.89 0 01-2.482-14.073l20.572 3.628z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff0808"
                  />
                  <path
                    d="M752.84 98.84a20.89 20.89 0 017.145-12.375l13.427 16.002z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#d0d0ff"
                  />
                  <path
                    d="M759.985 86.465a20.89 20.89 0 0113.427-4.888v20.89z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#f55"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(773.412 102.467)"
                  >
                    {'DNA metabolic process'}
                  </text>
                </g>
                <g>
                  <path
                    d="M662.768 320.866a16.516 16.516 0 0110.616 3.864l-10.616 12.652z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#acacff"
                  />
                  <path
                    d="M673.384 324.73a16.516 16.516 0 015.65 9.784l-16.266 2.868z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#d2d2ff"
                  />
                  <path
                    d="M679.033 334.514a16.516 16.516 0 01-1.962 11.126l-14.303-8.258z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#b5b5ff"
                  />
                  <path
                    d="M677.071 345.64a16.516 16.516 0 01-8.654 7.263l-5.65-15.52z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#8f8fff"
                  />
                  <path
                    d="M668.417 352.903a16.516 16.516 0 01-11.298 0l5.649-15.52z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#22f"
                  />
                  <path
                    d="M657.119 352.903a16.516 16.516 0 01-8.655-7.263l14.304-8.258z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#c9c9ff"
                  />
                  <path
                    d="M648.464 345.64a16.516 16.516 0 01-1.962-11.126l16.266 2.868z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff0707"
                  />
                  <path
                    d="M646.502 334.514a16.516 16.516 0 015.65-9.784l10.616 12.652z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#c5c5ff"
                  />
                  <path
                    d="M652.151 324.73a16.516 16.516 0 0110.617-3.864v16.516z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ccf"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(662.768 337.382)"
                  >
                    {'symbiont process'}
                  </text>
                </g>
                <g>
                  <path
                    d="M931.752 510.828a13.815 13.815 0 018.88 3.232l-8.88 10.583z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#1515ff"
                  />
                  <path
                    d="M940.632 514.06a13.815 13.815 0 014.725 8.184l-13.605 2.399z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#7979ff"
                  />
                  <path
                    d="M945.357 522.244a13.815 13.815 0 01-1.641 9.306l-11.964-6.907z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#1717ff"
                  />
                  <path
                    d="M943.716 531.55a13.815 13.815 0 01-7.239 6.075l-4.725-12.982z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#2f2fff"
                  />
                  <path
                    d="M936.477 537.625a13.815 13.815 0 01-9.45 0l4.725-12.982z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#55f"
                  />
                  <path
                    d="M927.027 537.625a13.815 13.815 0 01-7.239-6.075l11.964-6.907z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#4646ff"
                  />
                  <path
                    d="M919.788 531.55a13.815 13.815 0 01-1.64-9.306l13.604 2.399z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#f11"
                  />
                  <path
                    d="M918.147 522.244a13.815 13.815 0 014.725-8.184l8.88 10.583z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#8282ff"
                  />
                  <path
                    d="M922.872 514.06a13.815 13.815 0 018.88-3.232v13.815z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#0404ff"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(931.752 524.643)"
                  >
                    {'peptidase activity'}
                  </text>
                </g>
                <g>
                  <path
                    d="M1066.277 425.82a18.471 18.471 0 0111.873 4.322l-11.873 14.15z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#eef"
                  />
                  <path
                    d="M1078.15 430.142a18.471 18.471 0 016.318 10.943l-18.19 3.207z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#0e0eff"
                  />
                  <path
                    d="M1084.468 441.085a18.471 18.471 0 01-2.194 12.443l-15.997-9.236z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#faa"
                  />
                  <path
                    d="M1082.274 453.528a18.471 18.471 0 01-9.68 8.121l-6.317-17.357z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#c3c3ff"
                  />
                  <path
                    d="M1072.595 461.65a18.471 18.471 0 01-12.635 0l6.317-17.358z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#3838ff"
                  />
                  <path
                    d="M1059.96 461.65a18.471 18.471 0 01-9.68-8.122l15.997-9.236z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#f2f2ff"
                  />
                  <path
                    d="M1050.28 453.528a18.471 18.471 0 01-2.193-12.443l18.19 3.207z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#1919ff"
                  />
                  <path
                    d="M1048.087 441.085a18.471 18.471 0 016.317-10.943l11.873 14.15z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#2d2dff"
                  />
                  <path
                    d="M1054.404 430.142a18.471 18.471 0 0111.873-4.321v18.471z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff4242"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(1066.277 444.292)"
                  >
                    {'anatomical structure formation involved in morphogenesis'}
                  </text>
                </g>
                <g>
                  <path
                    d="M576.102 209.748a20.54 20.54 0 0113.203 4.805l-13.203 15.735z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#b8b8ff"
                  />
                  <path
                    d="M589.305 214.553a20.54 20.54 0 017.025 12.168l-20.228 3.567z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#3939ff"
                  />
                  <path
                    d="M596.33 226.721a20.54 20.54 0 01-2.44 13.837l-17.788-10.27z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff4040"
                  />
                  <path
                    d="M593.89 240.558a20.54 20.54 0 01-10.763 9.032l-7.025-19.302z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ffbebe"
                  />
                  <path
                    d="M583.127 249.59a20.54 20.54 0 01-14.05 0l7.025-19.302z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff5c5c"
                  />
                  <path
                    d="M569.077 249.59a20.54 20.54 0 01-10.764-9.032l17.789-10.27z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff1e1e"
                  />
                  <path
                    d="M558.313 240.558a20.54 20.54 0 01-2.44-13.837l20.229 3.567z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff9f9f"
                  />
                  <path
                    d="M555.874 226.721a20.54 20.54 0 017.025-12.168l13.203 15.735z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#4040ff"
                  />
                  <path
                    d="M562.899 214.553a20.54 20.54 0 0113.203-4.805v20.54z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#f44"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(576.102 230.288)"
                  >
                    {'nuclear chromosome'}
                  </text>
                </g>
                <g>
                  <path
                    d="M1053.42 586.76a19.18 19.18 0 0112.328 4.486l-12.328 14.692z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#1010ff"
                  />
                  <path
                    d="M1065.748 591.246a19.18 19.18 0 016.56 11.362l-18.888 3.33z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#8a8aff"
                  />
                  <path
                    d="M1072.308 602.608a19.18 19.18 0 01-2.279 12.92l-16.61-9.59z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#4b4bff"
                  />
                  <path
                    d="M1070.03 615.528a19.18 19.18 0 01-10.05 8.433l-6.56-18.023z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#bbf"
                  />
                  <path
                    d="M1059.98 623.961a19.18 19.18 0 01-13.12 0l6.56-18.023z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#2020ff"
                  />
                  <path
                    d="M1046.86 623.961a19.18 19.18 0 01-10.05-8.433l16.61-9.59z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#e5e5ff"
                  />
                  <path
                    d="M1036.81 615.528a19.18 19.18 0 01-2.278-12.92l18.888 3.33z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ffa7a7"
                  />
                  <path
                    d="M1034.532 602.608a19.18 19.18 0 016.56-11.362l12.328 14.692z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#3d3dff"
                  />
                  <path
                    d="M1041.091 591.246a19.18 19.18 0 0112.329-4.487v19.18z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#d5d5ff"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(1053.42 605.938)"
                  >
                    {'cell morphogenesis'}
                  </text>
                </g>
                <g>
                  <path
                    d="M782.254 772.887a13.53 13.53 0 018.697 3.165l-8.697 10.365z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#9696ff"
                  />
                  <path
                    d="M790.95 776.052a13.53 13.53 0 014.628 8.016l-13.324 2.35z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#55f"
                  />
                  <path
                    d="M795.578 784.068a13.53 13.53 0 01-1.607 9.115l-11.717-6.766z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ececff"
                  />
                  <path
                    d="M793.971 793.183a13.53 13.53 0 01-7.09 5.949l-4.627-12.715z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#9b9bff"
                  />
                  <path
                    d="M786.881 799.132a13.53 13.53 0 01-9.255 0l4.628-12.715z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#b3b3ff"
                  />
                  <path
                    d="M777.626 799.132a13.53 13.53 0 01-7.09-5.95l11.718-6.765z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#d3d3ff"
                  />
                  <path
                    d="M770.536 793.183a13.53 13.53 0 01-1.607-9.115l13.325 2.35z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff6161"
                  />
                  <path
                    d="M768.929 784.068a13.53 13.53 0 014.627-8.016l8.698 10.365z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#44f"
                  />
                  <path
                    d="M773.556 776.052a13.53 13.53 0 018.698-3.165v13.53z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#e6e6ff"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(782.254 786.417)"
                  >
                    {'generation of precursor metabolites and energy'}
                  </text>
                </g>
                <g>
                  <path
                    d="M656.686 497.33a10 10 0 016.428 2.34l-6.428 7.66z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#22f"
                  />
                  <path
                    d="M663.114 499.67a10 10 0 013.42 5.924l-9.848 1.737z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#2b2bff"
                  />
                  <path
                    d="M666.534 505.594a10 10 0 01-1.188 6.737l-8.66-5z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ebebff"
                  />
                  <path
                    d="M665.346 512.33a10 10 0 01-5.24 4.397l-3.42-9.396z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#dcdcff"
                  />
                  <path
                    d="M660.106 516.727a10 10 0 01-6.84 0l3.42-9.396z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#bdbdff"
                  />
                  <path
                    d="M653.266 516.727a10 10 0 01-5.24-4.396l8.66-5z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#f4f4ff"
                  />
                  <path
                    d="M648.026 512.33a10 10 0 01-1.188-6.736l9.848 1.737z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#1d1dff"
                  />
                  <path
                    d="M646.838 505.594a10 10 0 013.42-5.924l6.428 7.66z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#0c0cff"
                  />
                  <path
                    d="M650.258 499.67a10 10 0 016.428-2.34v10z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff7272"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(656.686 507.33)"
                  >
                    {'secondary metabolic process'}
                  </text>
                </g>
                <g>
                  <path
                    d="M827.241 625.461a11.471 11.471 0 017.374 2.684l-7.374 8.788z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#5e5eff"
                  />
                  <path
                    d="M834.615 628.145a11.471 11.471 0 013.923 6.796l-11.297 1.992z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#c9c9ff"
                  />
                  <path
                    d="M838.538 634.94a11.471 11.471 0 01-1.362 7.728l-9.935-5.735z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff0e0e"
                  />
                  <path
                    d="M837.176 642.668a11.471 11.471 0 01-6.011 5.044l-3.924-10.78z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff0b0b"
                  />
                  <path
                    d="M831.165 647.712a11.471 11.471 0 01-7.847 0l3.923-10.78z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#f3f3ff"
                  />
                  <path
                    d="M823.318 647.712a11.471 11.471 0 01-6.01-5.044l9.933-5.735z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#fffbfb"
                  />
                  <path
                    d="M817.307 642.668a11.471 11.471 0 01-1.362-7.727l11.296 1.992z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff0505"
                  />
                  <path
                    d="M815.945 634.94a11.471 11.471 0 013.923-6.795l7.373 8.788z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ffd9d9"
                  />
                  <path
                    d="M819.868 628.145a11.471 11.471 0 017.373-2.684v11.472z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#e7e7ff"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(827.241 636.933)"
                  >
                    {'isomerase activity'}
                  </text>
                </g>
                <g>
                  <path
                    d="M984.45 537.759a15.774 15.774 0 0110.139 3.69l-10.14 12.083z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#5858ff"
                  />
                  <path
                    d="M994.589 541.45a15.774 15.774 0 015.394 9.343l-15.533 2.74z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#6060ff"
                  />
                  <path
                    d="M999.983 550.793a15.774 15.774 0 01-1.873 10.626l-13.66-7.887z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#2626ff"
                  />
                  <path
                    d="M998.11 561.42a15.774 15.774 0 01-8.266 6.935l-5.394-14.823z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#4848ff"
                  />
                  <path
                    d="M989.844 568.355a15.774 15.774 0 01-10.79 0l5.396-14.823z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ffebeb"
                  />
                  <path
                    d="M979.055 568.355a15.774 15.774 0 01-8.266-6.936l13.66-7.887z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#fdfdff"
                  />
                  <path
                    d="M970.79 561.42a15.774 15.774 0 01-1.874-10.627l15.534 2.74z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#d3d3ff"
                  />
                  <path
                    d="M968.916 550.793a15.774 15.774 0 015.394-9.344l10.14 12.083z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#4747ff"
                  />
                  <path
                    d="M974.31 541.45a15.774 15.774 0 0110.14-3.691v15.773z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#99f"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(984.45 553.532)"
                  >
                    {'nervous system process'}
                  </text>
                </g>
                <g>
                  <path
                    d="M598.6 472.415a30.991 30.991 0 0119.92 7.25l-19.92 23.741z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#4646ff"
                  />
                  <path
                    d="M618.52 479.666a30.991 30.991 0 0110.6 18.359l-30.52 5.381z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#0a0aff"
                  />
                  <path
                    d="M629.12 498.025a30.991 30.991 0 01-3.681 20.877l-26.84-15.496z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#0808ff"
                  />
                  <path
                    d="M625.439 518.902a30.991 30.991 0 01-16.24 13.626l-10.6-29.122z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#0a0aff"
                  />
                  <path
                    d="M609.2 532.528a30.991 30.991 0 01-21.2 0l10.6-29.122z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#3737ff"
                  />
                  <path
                    d="M588 532.528a30.991 30.991 0 01-16.24-13.626l26.84-15.496z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#7171ff"
                  />
                  <path
                    d="M571.76 518.902a30.991 30.991 0 01-3.68-20.877l30.52 5.381z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff9696"
                  />
                  <path
                    d="M568.08 498.025a30.991 30.991 0 0110.599-18.36l19.92 23.741z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#1717ff"
                  />
                  <path
                    d="M578.679 479.666a30.991 30.991 0 0119.92-7.251v30.991z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#6868ff"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(598.6 503.406)"
                  >
                    {'cytosol'}
                  </text>
                </g>
                <g>
                  <path
                    d="M857.84 578.14a15.721 15.721 0 0110.105 3.677l-10.106 12.044z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#5d5dff"
                  />
                  <path
                    d="M867.945 581.817a15.721 15.721 0 015.377 9.314l-15.483 2.73z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#f7f7ff"
                  />
                  <path
                    d="M873.322 591.13a15.721 15.721 0 01-1.867 10.591l-13.616-7.86z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#4c4cff"
                  />
                  <path
                    d="M871.455 601.721a15.721 15.721 0 01-8.238 6.913l-5.378-14.773z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#1f1fff"
                  />
                  <path
                    d="M863.217 608.634a15.721 15.721 0 01-10.755 0l5.377-14.773z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#c5c5ff"
                  />
                  <path
                    d="M852.462 608.634a15.721 15.721 0 01-8.238-6.913l13.615-7.86z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#1d1dff"
                  />
                  <path
                    d="M844.224 601.721a15.721 15.721 0 01-1.867-10.59l15.482 2.73z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#f55"
                  />
                  <path
                    d="M842.357 591.13a15.721 15.721 0 015.377-9.313l10.105 12.044z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#5656ff"
                  />
                  <path
                    d="M847.734 581.817a15.721 15.721 0 0110.105-3.678v15.722z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#2929ff"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(857.84 593.86)"
                  >
                    {'autophagy'}
                  </text>
                </g>
                <g>
                  <path
                    d="M821.88 373.825a12.994 12.994 0 018.353 3.04l-8.352 9.954z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff9393"
                  />
                  <path
                    d="M830.233 376.865a12.994 12.994 0 014.444 7.698l-12.796 2.256z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#dcdcff"
                  />
                  <path
                    d="M834.677 384.563a12.994 12.994 0 01-1.543 8.753l-11.253-6.497z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff5858"
                  />
                  <path
                    d="M833.134 393.316a12.994 12.994 0 01-6.81 5.714l-4.443-12.21z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#e1e1ff"
                  />
                  <path
                    d="M826.325 399.03a12.994 12.994 0 01-8.889 0l4.445-12.21z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#6a6aff"
                  />
                  <path
                    d="M817.436 399.03a12.994 12.994 0 01-6.809-5.714l11.254-6.497z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#aaf"
                  />
                  <path
                    d="M810.627 393.316a12.994 12.994 0 01-1.543-8.753l12.797 2.256z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#7474ff"
                  />
                  <path
                    d="M809.084 384.563a12.994 12.994 0 014.444-7.698l8.353 9.954z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff2a2a"
                  />
                  <path
                    d="M813.528 376.865a12.994 12.994 0 018.353-3.04v12.994z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#d5d5ff"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(821.88 386.82)"
                  >
                    {'oxidoreductase activity'}
                  </text>
                </g>
                <g>
                  <path
                    d="M1090.693 287.625a24.538 24.538 0 0115.772 5.74l-15.772 18.798z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#3636ff"
                  />
                  <path
                    d="M1106.465 293.366a24.538 24.538 0 018.392 14.536l-24.164 4.26z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#2020ff"
                  />
                  <path
                    d="M1114.857 307.902a24.538 24.538 0 01-2.914 16.53l-21.25-12.27z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#f6f6ff"
                  />
                  <path
                    d="M1111.943 324.431a24.538 24.538 0 01-12.858 10.79l-8.392-23.058z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#9494ff"
                  />
                  <path
                    d="M1099.085 335.22a24.538 24.538 0 01-16.785 0l8.393-23.057z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#e2e2ff"
                  />
                  <path
                    d="M1082.3 335.22a24.538 24.538 0 01-12.857-10.789l21.25-12.268z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#f11"
                  />
                  <path
                    d="M1069.443 324.431a24.538 24.538 0 01-2.915-16.53l24.165 4.262z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#f1f1ff"
                  />
                  <path
                    d="M1066.528 307.902a24.538 24.538 0 018.392-14.536l15.773 18.797z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#6767ff"
                  />
                  <path
                    d="M1074.92 293.366a24.538 24.538 0 0115.773-5.741v24.538z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff0c0c"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(1090.693 312.163)"
                  >
                    {'cell death'}
                  </text>
                </g>
                <g>
                  <path
                    d="M733.113 725.925a11.471 11.471 0 017.373 2.684l-7.373 8.787z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#f8f8ff"
                  />
                  <path
                    d="M740.486 728.609a11.471 11.471 0 013.924 6.795l-11.297 1.992z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#66f"
                  />
                  <path
                    d="M744.41 735.404a11.471 11.471 0 01-1.363 7.728l-9.934-5.736z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff0909"
                  />
                  <path
                    d="M743.047 743.132a11.471 11.471 0 01-6.01 5.044l-3.924-10.78z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#f55"
                  />
                  <path
                    d="M737.036 748.176a11.471 11.471 0 01-7.847 0l3.924-10.78z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#3b3bff"
                  />
                  <path
                    d="M729.19 748.176a11.471 11.471 0 01-6.012-5.044l9.935-5.736z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff0101"
                  />
                  <path
                    d="M723.178 743.132a11.471 11.471 0 01-1.362-7.728l11.297 1.992z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff4141"
                  />
                  <path
                    d="M721.816 735.404a11.471 11.471 0 013.923-6.795l7.374 8.787z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#dcdcff"
                  />
                  <path
                    d="M725.74 728.609a11.471 11.471 0 017.373-2.684v11.471z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="red"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(733.113 737.396)"
                  >
                    {'plasma membrane organization'}
                  </text>
                </g>
                <g>
                  <path
                    d="M881.367 395.191a16.842 16.842 0 0110.825 3.94l-10.825 12.902z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#8c8cff"
                  />
                  <path
                    d="M892.192 399.132a16.842 16.842 0 015.76 9.977l-16.585 2.924z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#1010ff"
                  />
                  <path
                    d="M897.953 409.109a16.842 16.842 0 01-2 11.345l-14.586-8.42z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#6363ff"
                  />
                  <path
                    d="M895.952 420.454a16.842 16.842 0 01-8.825 7.405l-5.76-15.826z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#6d6dff"
                  />
                  <path
                    d="M887.127 427.86a16.842 16.842 0 01-11.52 0l5.76-15.827z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#3131ff"
                  />
                  <path
                    d="M875.607 427.86a16.842 16.842 0 01-8.826-7.406l14.586-8.42z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#e6e6ff"
                  />
                  <path
                    d="M866.781 420.454a16.842 16.842 0 01-2-11.345l16.586 2.924z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#3c3cff"
                  />
                  <path
                    d="M864.78 409.109a16.842 16.842 0 015.761-9.977l10.826 12.901z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#1010ff"
                  />
                  <path
                    d="M870.541 399.132a16.842 16.842 0 0110.826-3.94v16.841z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff8f8f"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(881.367 412.033)"
                  >
                    {'nucleocytoplasmic transport'}
                  </text>
                </g>
                <g>
                  <path
                    d="M844.133 800.186a17.586 17.586 0 0111.304 4.114l-11.304 13.472z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#fff6f6"
                  />
                  <path
                    d="M855.437 804.3a17.586 17.586 0 016.014 10.418l-17.318 3.054z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#0202ff"
                  />
                  <path
                    d="M861.451 814.718a17.586 17.586 0 01-2.088 11.847l-15.23-8.793z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#a7a7ff"
                  />
                  <path
                    d="M859.363 826.565a17.586 17.586 0 01-9.216 7.733l-6.014-16.526z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#6c6cff"
                  />
                  <path
                    d="M850.147 834.298a17.586 17.586 0 01-12.03 0l6.016-16.526z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#2d2dff"
                  />
                  <path
                    d="M838.118 834.298a17.586 17.586 0 01-9.215-7.733l15.23-8.793z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#d2d2ff"
                  />
                  <path
                    d="M828.903 826.565a17.586 17.586 0 01-2.09-11.847l17.32 3.054z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#d3d3ff"
                  />
                  <path
                    d="M826.814 814.718a17.586 17.586 0 016.014-10.418l11.305 13.472z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#0808ff"
                  />
                  <path
                    d="M832.828 804.3a17.586 17.586 0 0111.305-4.114v17.586z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#aeaeff"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(844.133 817.772)"
                  >
                    {'small molecule metabolic process'}
                  </text>
                </g>
                <g>
                  <path
                    d="M1041.799 384.513a13.074 13.074 0 018.404 3.058l-8.404 10.016z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#0d0dff"
                  />
                  <path
                    d="M1050.203 387.571a13.074 13.074 0 014.471 7.746l-12.875 2.27z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#2525ff"
                  />
                  <path
                    d="M1054.674 395.317a13.074 13.074 0 01-1.553 8.807l-11.322-6.537z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#00f"
                  />
                  <path
                    d="M1053.121 404.124a13.074 13.074 0 01-6.85 5.749l-4.472-12.286z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#0101ff"
                  />
                  <path
                    d="M1046.27 409.873a13.074 13.074 0 01-8.943 0l4.472-12.286z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff1616"
                  />
                  <path
                    d="M1037.327 409.873a13.074 13.074 0 01-6.85-5.749l11.322-6.537z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#1313ff"
                  />
                  <path
                    d="M1030.476 404.124a13.074 13.074 0 01-1.553-8.807l12.876 2.27z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#22f"
                  />
                  <path
                    d="M1028.923 395.317a13.074 13.074 0 014.472-7.746l8.404 10.016z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#0b0bff"
                  />
                  <path
                    d="M1033.395 387.571a13.074 13.074 0 018.404-3.058v13.074z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#0303ff"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(1041.799 397.587)"
                  >
                    {'circulatory system process'}
                  </text>
                </g>
                <g>
                  <path
                    d="M826.242 399.667a46.604 46.604 0 0129.956 10.903l-29.956 35.7z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ababff"
                  />
                  <path
                    d="M856.198 410.57a46.604 46.604 0 0115.94 27.608l-45.896 8.092z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#e0e0ff"
                  />
                  <path
                    d="M872.138 438.178a46.604 46.604 0 01-5.536 31.394l-40.36-23.302z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff6060"
                  />
                  <path
                    d="M866.602 469.572a46.604 46.604 0 01-24.42 20.492l-15.94-43.794z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff0d0d"
                  />
                  <path
                    d="M842.182 490.064a46.604 46.604 0 01-31.88 0l15.94-43.794z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#d0d0ff"
                  />
                  <path
                    d="M810.303 490.064a46.604 46.604 0 01-24.421-20.492l40.36-23.302z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#fff"
                  />
                  <path
                    d="M785.882 469.572a46.604 46.604 0 01-5.536-31.394l45.896 8.092z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#cbcbff"
                  />
                  <path
                    d="M780.346 438.178a46.604 46.604 0 0115.94-27.608l29.956 35.7z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ffefef"
                  />
                  <path
                    d="M796.286 410.57a46.604 46.604 0 0129.956-10.903v46.603z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#f8f8ff"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(826.242 446.27)"
                  >
                    {'organelle'}
                  </text>
                </g>
                <g>
                  <path
                    d="M697.85 549.516a19.777 19.777 0 0112.713 4.627l-12.712 15.15z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#acacff"
                  />
                  <path
                    d="M710.563 554.143a19.777 19.777 0 016.764 11.716l-19.476 3.434z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#0c0cff"
                  />
                  <path
                    d="M717.327 565.859a19.777 19.777 0 01-2.349 13.322l-17.127-9.888z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff7676"
                  />
                  <path
                    d="M714.978 579.181a19.777 19.777 0 01-10.363 8.696l-6.764-18.584z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#e6e6ff"
                  />
                  <path
                    d="M704.615 587.877a19.777 19.777 0 01-13.528 0l6.764-18.584z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#2828ff"
                  />
                  <path
                    d="M691.087 587.877a19.777 19.777 0 01-10.364-8.696l17.128-9.888z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#fff2f2"
                  />
                  <path
                    d="M680.723 579.181a19.777 19.777 0 01-2.349-13.322l19.477 3.434z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#4e4eff"
                  />
                  <path
                    d="M678.374 565.859a19.777 19.777 0 016.764-11.716l12.713 15.15z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#3636ff"
                  />
                  <path
                    d="M685.138 554.143a19.777 19.777 0 0112.713-4.627v19.777z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff5353"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(697.85 569.293)"
                  >
                    {'Golgi apparatus'}
                  </text>
                </g>
                <g>
                  <path
                    d="M826.292 221.757a14.595 14.595 0 019.381 3.415l-9.381 11.18z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ccf"
                  />
                  <path
                    d="M835.673 225.172a14.595 14.595 0 014.992 8.646l-14.373 2.534z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#bcbcff"
                  />
                  <path
                    d="M840.665 233.818a14.595 14.595 0 01-1.734 9.831l-12.64-7.297z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#cdcdff"
                  />
                  <path
                    d="M838.931 243.65a14.595 14.595 0 01-7.648 6.416l-4.991-13.714z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#f0f0ff"
                  />
                  <path
                    d="M831.283 250.066a14.595 14.595 0 01-9.983 0l4.992-13.714z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#9b9bff"
                  />
                  <path
                    d="M821.3 250.066a14.595 14.595 0 01-7.647-6.417l12.639-7.297z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff9b9b"
                  />
                  <path
                    d="M813.653 243.65a14.595 14.595 0 01-1.734-9.832l14.373 2.534z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff4c4c"
                  />
                  <path
                    d="M811.919 233.818a14.595 14.595 0 014.992-8.646l9.38 11.18z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#5656ff"
                  />
                  <path
                    d="M816.91 225.172a14.595 14.595 0 019.382-3.415v14.595z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#d1d1ff"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(826.292 236.352)"
                  >
                    {'helicase activity'}
                  </text>
                </g>
                <g>
                  <path
                    d="M911.648 233.824a15.825 15.825 0 0110.172 3.703l-10.172 12.123z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#6767ff"
                  />
                  <path
                    d="M921.82 237.527a15.825 15.825 0 015.413 9.375l-15.585 2.748z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#3232ff"
                  />
                  <path
                    d="M927.233 246.902a15.825 15.825 0 01-1.88 10.66l-13.705-7.912z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ffdbdb"
                  />
                  <path
                    d="M925.353 257.562a15.825 15.825 0 01-8.292 6.959l-5.413-14.871z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff6262"
                  />
                  <path
                    d="M917.06 264.52a15.825 15.825 0 01-10.824 0l5.412-14.87z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ffa2a2"
                  />
                  <path
                    d="M906.236 264.52a15.825 15.825 0 01-8.293-6.958l13.705-7.912z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff1e1e"
                  />
                  <path
                    d="M897.943 257.562a15.825 15.825 0 01-1.88-10.66l15.585 2.748z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#a9a9ff"
                  />
                  <path
                    d="M896.063 246.902a15.825 15.825 0 015.413-9.375l10.172 12.123z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#7474ff"
                  />
                  <path
                    d="M901.476 237.527a15.825 15.825 0 0110.172-3.703v15.826z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ededff"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(911.648 249.65)"
                  >
                    {'ribosome biogenesis'}
                  </text>
                </g>
                <g>
                  <path
                    d="M507.085 302.27a15.51 15.51 0 019.97 3.628l-9.97 11.881z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#0101ff"
                  />
                  <path
                    d="M517.055 305.898a15.51 15.51 0 015.304 9.188l-15.274 2.693z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#d6d6ff"
                  />
                  <path
                    d="M522.36 315.086a15.51 15.51 0 01-1.843 10.448l-13.432-7.755z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#eef"
                  />
                  <path
                    d="M520.517 325.534a15.51 15.51 0 01-8.127 6.82l-5.305-14.575z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ffa4a4"
                  />
                  <path
                    d="M512.39 332.353a15.51 15.51 0 01-10.61 0l5.305-14.574z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#4848ff"
                  />
                  <path
                    d="M501.78 332.353a15.51 15.51 0 01-8.126-6.82l13.431-7.754z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#e3e3ff"
                  />
                  <path
                    d="M493.654 325.534a15.51 15.51 0 01-1.842-10.448l15.273 2.693z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff0303"
                  />
                  <path
                    d="M491.812 315.086a15.51 15.51 0 015.304-9.188l9.97 11.881z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff8484"
                  />
                  <path
                    d="M497.116 305.898a15.51 15.51 0 019.97-3.629v15.51z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#5d5dff"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(507.085 317.779)"
                  >
                    {'chromosome segregation'}
                  </text>
                </g>
                <g>
                  <path
                    d="M805.88 725.858a11.471 11.471 0 017.374 2.684l-7.374 8.787z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#6363ff"
                  />
                  <path
                    d="M813.254 728.542a11.471 11.471 0 013.923 6.795l-11.297 1.992z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#3f3fff"
                  />
                  <path
                    d="M817.177 735.337a11.471 11.471 0 01-1.362 7.728l-9.935-5.736z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#4f4fff"
                  />
                  <path
                    d="M815.815 743.065a11.471 11.471 0 01-6.011 5.044l-3.924-10.78z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#5353ff"
                  />
                  <path
                    d="M809.804 748.109a11.471 11.471 0 01-7.847 0l3.923-10.78z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff6f6f"
                  />
                  <path
                    d="M801.957 748.109a11.471 11.471 0 01-6.01-5.044l9.933-5.736z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#9494ff"
                  />
                  <path
                    d="M795.946 743.065a11.471 11.471 0 01-1.362-7.728l11.296 1.992z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#0f0fff"
                  />
                  <path
                    d="M794.584 735.337a11.471 11.471 0 013.923-6.795l7.373 8.787z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#2828ff"
                  />
                  <path
                    d="M798.507 728.542a11.471 11.471 0 017.373-2.684v11.471z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#2c2cff"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(805.88 737.33)"
                  >
                    {'cellular amino acid metabolic process'}
                  </text>
                </g>
                <g>
                  <path
                    d="M582.13 399.318a14.835 14.835 0 019.536 3.47l-9.536 11.365z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#d7d7ff"
                  />
                  <path
                    d="M591.666 402.789a14.835 14.835 0 015.074 8.788l-14.61 2.576z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#1c1cff"
                  />
                  <path
                    d="M596.74 411.577a14.835 14.835 0 01-1.762 9.993l-12.848-7.417z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#8181ff"
                  />
                  <path
                    d="M594.978 421.57a14.835 14.835 0 01-7.774 6.523l-5.074-13.94z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#c4c4ff"
                  />
                  <path
                    d="M587.204 428.093a14.835 14.835 0 01-10.148 0l5.074-13.94z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#f11"
                  />
                  <path
                    d="M577.056 428.093a14.835 14.835 0 01-7.773-6.523l12.847-7.417z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff7b7b"
                  />
                  <path
                    d="M569.283 421.57a14.835 14.835 0 01-1.762-9.993l14.61 2.576z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#d5d5ff"
                  />
                  <path
                    d="M567.52 411.577a14.835 14.835 0 015.075-8.788l9.535 11.364z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#5d5dff"
                  />
                  <path
                    d="M572.595 402.789a14.835 14.835 0 019.535-3.471v14.835z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ca***REMOVED***f"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(582.13 414.153)"
                  >
                    {'structural molecule activity'}
                  </text>
                </g>
                <g>
                  <path
                    d="M629.88 394.315a26.97 26.97 0 0117.336 6.31l-17.336 20.66z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff6d6d"
                  />
                  <path
                    d="M647.216 400.625a26.97 26.97 0 019.225 15.977l-26.56 4.683z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#8484ff"
                  />
                  <path
                    d="M656.44 416.602a26.97 26.97 0 01-3.203 18.168l-23.357-13.485z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#2e2eff"
                  />
                  <path
                    d="M653.237 434.77a26.97 26.97 0 01-14.132 11.859l-9.225-25.344z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#2323ff"
                  />
                  <path
                    d="M639.105 446.629a26.97 26.97 0 01-18.449 0l9.224-25.344z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#dfdfff"
                  />
                  <path
                    d="M620.656 446.629a26.97 26.97 0 01-14.132-11.859l23.356-13.485z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#5858ff"
                  />
                  <path
                    d="M606.524 434.77a26.97 26.97 0 01-3.204-18.168l26.56 4.683z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#bbf"
                  />
                  <path
                    d="M603.32 416.602a26.97 26.97 0 019.224-15.977l17.336 20.66z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#4343ff"
                  />
                  <path
                    d="M612.544 400.625a26.97 26.97 0 0117.336-6.31v26.97z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#33f"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(629.88 421.285)"
                  >
                    {'cellular component assembly'}
                  </text>
                </g>
                <g>
                  <path
                    d="M746.499 263.904a16.325 16.325 0 0110.493 3.819L746.5 280.228z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#6969ff"
                  />
                  <path
                    d="M756.992 267.723a16.325 16.325 0 015.583 9.67l-16.076 2.835z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#bdbdff"
                  />
                  <path
                    d="M762.575 277.394a16.325 16.325 0 01-1.939 10.997l-14.137-8.163z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ffd8d8"
                  />
                  <path
                    d="M760.636 288.39a16.325 16.325 0 01-8.554 7.179l-5.583-15.34z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff4949"
                  />
                  <path
                    d="M752.082 295.569a16.325 16.325 0 01-11.167 0l5.584-15.34z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#9d9dff"
                  />
                  <path
                    d="M740.915 295.569a16.325 16.325 0 01-8.554-7.178l14.138-8.163z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ffb6b6"
                  />
                  <path
                    d="M732.361 288.39a16.325 16.325 0 01-1.94-10.996l16.078 2.834z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#ff0505"
                  />
                  <path
                    d="M730.422 277.394a16.325 16.325 0 015.583-9.671l10.494 12.505z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#a8a8ff"
                  />
                  <path
                    d="M736.005 267.723a16.325 16.325 0 0110.494-3.82v16.325z"
                    opacity={0.75}
                    stroke="#000"
                    cursor="pointer"
                    fill="#8b8bff"
                  />
                  <text
                    className="prefix__node-label"
                    x={6}
                    y={3}
                    fontSize="1em"
                    transform="translate(746.499 280.228)"
                  >
                    {'ATPase activity'}
                  </text>
                </g>
              </g>
            </svg>
          </div>
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
