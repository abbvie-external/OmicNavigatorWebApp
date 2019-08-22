import React, { Component } from 'react';
import { Grid } from 'semantic-ui-react';

import EnrichmentSearchCriteria from './EnrichmentSearchCriteria';
import EnrichmentResults from './EnrichmentResults';
// import ButtonActions from './ButtonActions';
import SearchPrompt from './SearchPrompt';
import _ from 'lodash';

class EnrichmentContainer extends Component {
  state = {
    tab: this.props.tab || 'enrichment',
    study: this.props.study || '',
    studies: this.props.studies || [],
    model: this.props.model || '',
    models: this.props.models || [],
    test: this.props.test || '',
    tests: this.props.tests || [],
    modelsDisabled: this.props.modelsDisabled,
    testsDisabled: this.props.testsDisabled || true,
    isValidSearchEnrichment: this.props.isValidSearchEnrichment || false,
    enrichmentColumns: [],
    enrichmentResults: []
  };

  componentDidMount() {
    this.handleEnrichmentSearch = this.handleEnrichmentSearch.bind(this);
  }

  handleEnrichmentSearch = searchResults => {
    // const columns = this.getCongfigCols(searchResults);
    this.setState({
      study: searchResults.study,
      model: searchResults.model,
      test: searchResults.test,
      enrichmentResults: searchResults.enrichmentResults,
      // enrichmentColumns: columns,
      isValidSearchEnrichment: true
    });
  };

  hideEGrid = () => {
    this.setState({
      isValidSearchEnrichment: false
    });
  };

  getCongfigCols = testData => {
    this.testData = testData.pepplotResults;
    // var configCols = ['F', 'logFC', 't', 'P_Value', 'adj_P_Val'];
    const model = testData.model;
    let configCols = [];
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
        // {
        //   title: 'Protein_Site',
        //   field: 'Protein_Site',
        //   type: 'number',
        //   filterable: { type: 'multiFilter' },
        //   template: (value, item, addParams) => {
        //     return (
        //       <p>
        //         {value}
        //         <img
        //           src="phosphosite.ico"
        //           alt="Phosophosite"
        //           className="phophositeIcon"
        //         />
        //         {/* <img  src="phosphosite.ico" alt="Phosophosite" class="phosphositeIcon" data-manifest={item} onClick={addParams.showPhosphositePlus(item)} /> */}
        //       </p>
        //     );
        //   }
        // },
        {
          title: 'MajorityProteinIDsHGNC',
          field: 'MajorityProteinIDsHGNC',
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
          title: 'MajorityProteinIDs',
          field: 'MajorityProteinIDs',
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
            sortAccessor: (item, field) =>
              item[field] && item[field].toFixed(2),
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
            sortAccessor: (item, field) =>
              item[field] && item[field].toFixed(2),
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
            sortAccessor: (item, field) =>
              item[field] && item[field].toFixed(4),
            groupByAccessor: (item, field) =>
              item[field] && item[field].toFixed(4),
            accessor: (item, field) => item[field] && item[field].toFixed(4)
          },
          type: 'number'
        }
      ];
    } else {
      configCols = [
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
            sortAccessor: (item, field) =>
              item[field] && item[field].toFixed(2),
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
            sortAccessor: (item, field) =>
              item[field] && item[field].toFixed(2),
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
            sortAccessor: (item, field) =>
              item[field] && item[field].toFixed(4),
            groupByAccessor: (item, field) =>
              item[field] && item[field].toFixed(4),
            accessor: (item, field) => item[field] && item[field].toFixed(4)
          },
          type: 'number'
        }
      ];
    }
    return configCols;
  };

  render() {
    return (
      <Grid.Row className="EnrichmentContainer">
        <Grid.Column
          className="SidebarContainer"
          mobile={16}
          tablet={16}
          largeScreen={3}
          widescreen={3}
        >
          <EnrichmentSearchCriteria
            searchCriteria={this.state}
            onEnrichmentSearch={this.handleEnrichmentSearch}
            onSearchCriteriaReset={this.hideEGrid}
          />
        </Grid.Column>

        <Grid.Column
          className="ContentContainer"
          mobile={16}
          tablet={16}
          largeScreen={13}
          widescreen={13}
        >
          {this.state.isValidSearchEnrichment ? (
            <EnrichmentResults searchCriteria={this.state} />
          ) : (
            <SearchPrompt />
          )}
        </Grid.Column>
      </Grid.Row>
    );
  }
}

export default EnrichmentContainer;
