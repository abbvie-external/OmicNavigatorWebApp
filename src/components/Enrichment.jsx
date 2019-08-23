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

  getCongfigCols = testData => {};

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
