import React, { Component } from 'react';
import { Grid, Popup } from 'semantic-ui-react';
import { withRouter } from 'react-router-dom';
import PepplotSearchCriteria from './PepplotSearchCriteria';
import PepplotResults from './PepplotResults';
import TransitionStill from './TransitionStill';
import TransitionActive from './TransitionActive';
import { formatNumberForDisplay, splitValue } from '../helpers';
import phosphosite_icon from '../resources/phosphosite.ico';
// import { updateUrl } from './UrlControl';

import _ from 'lodash';
import './Pepplot.scss';
import './Table.scss';

class PepplotContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isValidSearchPepplot: false,
      isSearching: false,
      isProteinSelected: false,
      pepplotResults: [],
      pepplotColumns: []
    };
  }

  componentDidMount() {}

  handleSearchTransition = () => {
    this.setState({
      isSearching: true
    });
  };

  handlePepplotSearch = searchResults => {
    const columns = this.getConfigCols(searchResults);
    this.setState({
      pepplotResults: searchResults.pepplotResults,
      pepplotColumns: columns,
      isSearching: false,
      isValidSearchPepplot: true,
      isProteinSelected: false
    });
  };

  handleSearchCriteriaChange = changes => {
    this.props.onSearchCriteriaToTop(changes);
  };

  hidePGrid = () => {
    this.setState({
      isValidSearchPepplot: false
    });
  };

  getConfigCols = testData => {
    const pepResults = testData.pepplotResults;
    const model = testData.model;
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
                <Popup
                  trigger={
                    <span
                      className="TableCellLink"
                      onClick={addParams.showPlot(model, item)}
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
                      onClick={addParams.showPhosphositePlus(item)}
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
              <p>
                <Popup
                  trigger={
                    <span
                      className="TableCellLink"
                      onClick={addParams.showPlot(model, item)}
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
                      onClick={addParams.showPhosphositePlus(item)}
                    />
                  }
                  style={TableValuePopupStyle}
                  className="TablePopupValue"
                  content={iconText}
                  inverted
                  basic
                />
              </p>
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
    let orderedTestData = JSON.parse(
      JSON.stringify(pepResults[0], relevantConfigCols)
    );
    let relevantConfigColumns = _.map(
      _.filter(_.keys(orderedTestData), function(d) {
        return _.includes(relevantConfigCols, d);
      })
    );

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

    return configCols;
  };

  getView = () => {
    if (
      this.state.isValidSearchPepplot &&
      !this.state.isProteinSelected &&
      !this.state.isSearching
    ) {
      return (
        <PepplotResults
          {...this.state}
          {...this.props}
          onSearchCriteriaChange={this.handleSearchCriteriaChange}
        />
      );
    } else if (this.state.isSearching) {
      return <TransitionActive />;
    } else return <TransitionStill />;
  };

  render() {
    const pepplotView = this.getView(this.state);

    return (
      <Grid.Row className="PepplotContainer">
        <Grid.Column
          className="SidebarContainer"
          mobile={16}
          tablet={16}
          largeScreen={4}
          widescreen={4}
        >
          <PepplotSearchCriteria
            {...this.state}
            {...this.props}
            onSearchTransition={this.handleSearchTransition}
            onPepplotSearch={this.handlePepplotSearch}
            onSearchCriteriaChange={this.handleSearchCriteriaChange}
            onSearchCriteriaReset={this.hidePGrid}
          />
        </Grid.Column>
        <Grid.Column
          className="ContentContainer"
          mobile={16}
          tablet={16}
          largeScreen={12}
          widescreen={12}
        >
          {pepplotView}
        </Grid.Column>
      </Grid.Row>
    );
  }
}

export default withRouter(PepplotContainer);
