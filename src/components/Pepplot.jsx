import React, { Component } from 'react';
import { Grid } from 'semantic-ui-react';

import PepplotSearchCriteria from './PepplotSearchCriteria';
import PepplotResults from './PepplotResults';
// import ButtonActions from './ButtonActions';
import SearchPrompt from './SearchPrompt';
import _ from 'lodash';

class PepplotContainer extends Component {
  state = {
    tab: this.props.tab || 'pepplot',
    study: this.props.study || '',
    studies: this.props.studies || [],
    model: this.props.model || '',
    models: this.props.models || [],
    test: this.props.test || '',
    tests: this.props.tests || [],
    modelsDisabled: this.props.modelsDisabled,
    testsDisabled: this.props.testsDisabled || true,
    isValidSearchPepplot: this.props.isValidSearchPepplot || false,
    pepplotResults: []
  };

  componentDidMount() {
    this.phosphorylationData = this.phosphorylationData.bind(this);
    this.handlePepplotSearch = this.handlePepplotSearch.bind(this);
  }

  getCongfigCols = testData => {
    this.testData = testData.pepplotResults;
    var configCols = ['F', 'logFC', 't', 'P_Value', 'adj_P_Val'];
    var orderedTestData = JSON.parse(
      JSON.stringify(this.testData[0], configCols)
    );
    // P_Value: 0.00001367510918
    // adj_P_Val: 0.024064375844
    // logFC: 1.8698479717
    // t: 7.7253981892

    // 0: "logFC"
    // 1: "t"
    // 2: "P_Value"
    // 3: "adj_P_Val"
    this.columns = _.map(
      _.filter(_.keys(orderedTestData), function(d) {
        return _.includes(configCols, d);
      }),
      function(d) {
        return { field: d };
      }
    );
  };

  getConfigColsMock = testData => {
    this.testData = testData.pepplotResults;

    const configCols = [
      {
        title: 'Protein_Site',
        field: 'Protein_Site',
        type: 'number',
        filterable: { type: 'multiFilter' },
        template: (value, item, addParams) => {
          return (
            <p>
              {value}
              <img
                src="phosphosite.ico"
                alt="Phosophosite"
                className="phophositeIcon"
              />
              {/* <img  src="phosphosite.ico" alt="Phosophosite" class="phosphositeIcon" data-manifest={item} onClick={addParams.showPhosphositePlus(item)} /> */}
            </p>
          );
        }
      },
      {
        title: 'logFC',
        field: {
          field: 'logFC',
          sortAccessor: (item, field) => item[field] && item[field].toFixed(2),
          groupByAccessor: (item, field) =>
            item[field] && item[field].toFixed(2),
          accessor: (item, field) => item[field] && item[field].toFixed(2)
        },
        type: 'number',
        filterable: { type: 'multiFilter' }
      },
      {
        title: 't',
        field: {
          field: 't',
          sortAccessor: (item, field) => item[field] && item[field].toFixed(2),
          groupByAccessor: (item, field) =>
            item[field] && item[field].toFixed(2),
          accessor: (item, field) => item[field] && item[field].toFixed(2)
        },
        type: 'number'
      },
      {
        title: 'P_Value',
        field: {
          field: 'P_Value'
        },
        type: 'number',
        filterable: { type: 'multiFilter' }
      },
      {
        title: 'adj_P_Val',
        field: {
          field: 'adj_P_Val',
          sortAccessor: (item, field) => item[field] && item[field].toFixed(4),
          groupByAccessor: (item, field) =>
            item[field] && item[field].toFixed(4),
          accessor: (item, field) => item[field] && item[field].toFixed(4)
        },
        type: 'number'
      }
    ];
  };

  handlePepplotSearch = searchResults => {
    // this.getCongfigCols(data);
    this.setState({
      study: searchResults.study,
      model: searchResults.model,
      test: searchResults.test,
      pepplotResults: searchResults.pepplotResults,
      isValidSearchPepplot: true
    });
  };

  hideGrid = () => {
    this.setState({
      isValidSearchPepplot: false
    });
  };

  render() {
    return (
      <Grid.Row className="PepplotContainer MainContainer">
        <Grid.Column
          className="SearchCriteriaContainer"
          mobile={16}
          tablet={16}
          largeScreen={3}
          widescreen={3}
        >
          <PepplotSearchCriteria
            searchCriteria={this.state}
            onPepplotSearch={this.handlePepplotSearch}
            onSearchCriteriaReset={this.hideGrid}
          />
        </Grid.Column>

        <Grid.Column
          className="ContentContainer"
          mobile={16}
          tablet={16}
          largeScreen={13}
          widescreen={13}
        >
          {this.state.isValidSearchPepplot ? (
            <PepplotResults searchCriteria={this.state} />
          ) : (
            <SearchPrompt />
          )}

          {/* <Switch>
          <Route exact path="/pepplot" component={PepplotContainer} />
          <Route exact path="/plot" component={PlotContainer} />
          <Route exact path="/enrichment" component={EnrichmentContainer} />
          <Route exact path="/charts" component={ChartsContainer} />
          <Route exact path="/" render={() => <Redirect to="/pepplot" />} />
          <Route component={NoMatch} />
        </Switch> */}
        </Grid.Column>
      </Grid.Row>
    );
  }

  phosphorylationData() {
    const result = {
      data: process(this.testData, this.stateExcelExport).data
    };
    return result;
  }
}

export default PepplotContainer;
