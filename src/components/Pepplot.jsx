import React, { Component } from 'react';
import { Grid } from 'semantic-ui-react';

import { phosphoprotService } from '../services/phosphoprot.service';
import PepplotSearchCriteria from './PepplotSearchCriteria';
import PepplotResults from './PepplotResults';
import SearchPrompt from './SearchPrompt';
import PlotContainer from './Plot';
import _ from 'lodash';

class PepplotContainer extends Component {
  state = {
    tab: this.props.tab || 'pepplot',
    study: this.props.study || '',
    model: this.props.model || '',
    test: this.props.test || '',
    isValidSearchPepplot: this.props.isValidSearchPepplot || false,
    pepplotResults: [],
    pepplotColumns: []
  };

  componentDidMount() {
    this.phosphorylationData = this.phosphorylationData.bind(this);
    this.handlePepplotSearch = this.handlePepplotSearch.bind(this);
  }

  handlePepplotSearch = searchResults => {
    const columns = this.getConfigCols(searchResults);
    this.setState({
      study: searchResults.study,
      model: searchResults.model,
      test: searchResults.test,
      pepplotResults: searchResults.pepplotResults,
      pepplotColumns: columns,
      isValidSearchPepplot: true
    });
  };

  hidePGrid = () => {
    this.setState({
      isValidSearchPepplot: false
    });
  };

  getConfigCols = testData => {
    this.testData = testData.pepplotResults;
    const model = testData.model;
    let configCols = [];
    // var configCols = ['F', 'logFC', 't', 'P_Value', 'adj_P_Val'];
    // var orderedTestData = JSON.parse(
    //   JSON.stringify(this.testData[0], configCols)
    // );
    // this.columns = _.map(
    //   _.filter(_.keys(orderedTestData), function(d) {
    //     return _.includes(configCols, d);
    //   }),
    //   function(d) {
    //     return { field: d };
    //   }
    // );
    if (model === 'Differential Expression') {
      configCols = [
        {
          title: 'MajorityProteinIDsHGNC',
          field: 'MajorityProteinIDsHGNC',
          // type: 'number',
          filterable: { type: 'multiFilter' },
          template: (value, item, addParams) => {
            return (
              <p>
                <span
                  className="ProteinNameLink"
                  onClick={addParams.showPlot(model, item)}
                >
                  {value}
                </span>
                <img
                  src="phosphosite.ico"
                  alt="Phosophosite"
                  className="PhosphositeIcon"
                  // data-manifest={item}
                  onClick={addParams.showPhosphositePlus(item)}
                />
              </p>
            );
          }
        },
        {
          title: 'MajorityProteinIDs',
          field: 'MajorityProteinIDs',
          filterable: { type: 'multiFilter' }
        },
        {
          title: 'logFC',
          field: {
            field: 'logFC',
            sortAccessor: (item, field) =>
              item[field] && item[field].toFixed(2),
            groupByAccessor: (item, field) =>
              item[field] && item[field].toFixed(2),
            accessor: (item, field) => item[field] && item[field].toFixed(2)
          },
          // type: 'number',
          filterable: { type: 'multiFilter' }
        },
        {
          title: 't',
          field: {
            field: 't',
            sortAccessor: (item, field) =>
              item[field] && item[field].toFixed(2),
            groupByAccessor: (item, field) =>
              item[field] && item[field].toFixed(2),
            accessor: (item, field) => item[field] && item[field].toFixed(2)
          },
          // type: 'number'
          filterable: { type: 'multiFilter' }
        },
        {
          title: 'P_Value',
          field: {
            field: 'P_Value'
          },
          // type: 'number',
          filterable: { type: 'multiFilter' }
        },
        {
          title: 'adj_P_Val',
          field: {
            field: 'adj_P_Val',
            sortAccessor: (item, field) =>
              item[field] && item[field].toFixed(4),
            groupByAccessor: (item, field) =>
              item[field] && item[field].toFixed(4),
            accessor: (item, field) => item[field] && item[field].toFixed(4)
          },
          // type: 'number'
          filterable: { type: 'multiFilter' }
        }
      ];
    } else {
      configCols = [
        {
          title: 'Protein_Site',
          field: 'Protein_Site',
          // type: 'number',
          filterable: { type: 'multiFilter' },
          template: (value, item, addParams) => {
            return (
              <p>
                <span
                  className="ProteinNameLink"
                  onClick={addParams.showPlot(model, item)}
                >
                  {value}
                </span>
                <img
                  src="phosphosite.ico"
                  alt="Phosophosite"
                  className="PhosphositeIcon"
                  // data-manifest={item}
                  onClick={addParams.showPhosphositePlus(item)}
                />
              </p>
            );
          }
        },
        {
          title: 'logFC',
          field: {
            field: 'logFC',
            sortAccessor: (item, field) =>
              item[field] && item[field].toFixed(2),
            groupByAccessor: (item, field) =>
              item[field] && item[field].toFixed(2),
            accessor: (item, field) => item[field] && item[field].toFixed(2)
          },
          // type: 'number',
          filterable: { type: 'multiFilter' }
        },
        {
          title: 't',
          field: {
            field: 't',
            sortAccessor: (item, field) =>
              item[field] && item[field].toFixed(2),
            groupByAccessor: (item, field) =>
              item[field] && item[field].toFixed(2),
            accessor: (item, field) => item[field] && item[field].toFixed(2)
          },
          // type: 'number',
          filterable: { type: 'multiFilter' }
        },
        {
          title: 'P_Value',
          field: {
            field: 'P_Value'
          },
          // type: 'number',
          filterable: { type: 'multiFilter' }
        },
        {
          title: 'adj_P_Val',
          field: {
            field: 'adj_P_Val',
            sortAccessor: (item, field) =>
              item[field] && item[field].toFixed(4),
            groupByAccessor: (item, field) =>
              item[field] && item[field].toFixed(4),
            accessor: (item, field) => item[field] && item[field].toFixed(4)
          },
          // type: 'number'
          filterable: { type: 'multiFilter' }
        }
      ];
    }
    return configCols;
  };

  getView = () => {
    if (this.state.isValidSearchPepplot) {
      return <PepplotResults searchCriteria={this.state} />;
    } else return <SearchPrompt />;
  };

  render() {
    const pepplotView = this.getView(this.state);
    return (
      <Grid.Row className="PepplotContainer">
        <Grid.Column
          className="SidebarContainer"
          mobile={16}
          tablet={16}
          largeScreen={3}
          widescreen={3}
        >
          <PepplotSearchCriteria
            searchCriteria={this.state}
            onPepplotSearch={this.handlePepplotSearch}
            onSearchCriteriaReset={this.hidePGrid}
          />
        </Grid.Column>
        <Grid.Column
          className="ContentContainer"
          mobile={16}
          tablet={16}
          largeScreen={13}
          widescreen={13}
        >
          {pepplotView}
        </Grid.Column>
      </Grid.Row>
    );
  }

  /* <Switch>
  <Route exact path="/pepplot" component={PepplotContainer} />
  <Route exact path="/enrichment" component={EnrichmentContainer} />
  <Route exact path="/" render={() => <Redirect to="/pepplot" />} />
  <Route component={NoMatch} />
  </Switch> */

  phosphorylationData() {
    const result = {
      data: process(this.testData, this.stateExcelExport).data
    };
    return result;
  }
}

export default PepplotContainer;
