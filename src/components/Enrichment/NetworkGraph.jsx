import React, { Component } from 'react';
import { Icon, Popup, Grid, Search, Radio } from 'semantic-ui-react';

export default class NetworkGraph extends Component {
  state = {
    chartSettings: {
      title: '',
      data: null,
      id: 'chart-network',
      chartSize: { height: '900', width: '1600' },
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      statLabel: '',
      statistic: '',
      formattedData: {},
      facets: [],
      propLabel: []
    }
  };
  render() {
    const IconPopupStyle = {
      backgroundColor: '2E2E2E',
      borderBottom: '2px solid var(--color-primary)',
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
            {/* LINE LINKS */}
            <g className="prefix__links" stroke="#0080ff" strokeOpacity={0.3}>
              <path
                opacity={0.5}
                strokeWidth={1.268}
                d="M746.499 280.228l-113.421-87.21"
              />
            </g>
            {/* NODES */}
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
              {/* NODE TEXT */}
              <text
                className="prefix__node-label"
                x={6}
                y={3}
                fontSize="1em"
                transform="translate(712.615 317.22)"
              >
                {'enzyme binding'}
              </text>
            </g>
          </svg>
        </div>
      </div>
    );
  }
}
