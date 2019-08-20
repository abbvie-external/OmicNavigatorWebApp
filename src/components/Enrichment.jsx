import React, { Component } from 'react';
import { Grid } from 'semantic-ui-react';

import EnrichmentSearchCriteria from './EnrichmentSearchCriteria';
import EnrichmentResults from './EnrichmentResults';
// import ButtonActions from './ButtonActions';
import SearchPrompt from './SearchPrompt';

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
    enrichmentResults: []
  };

  componentDidMount() {}

  handleEnrichmentSearch = data => {
    this.setState({
      isValidSearchEnrichment: true,
      enrichmentResults: data
    });
    debugger;
  };

  render() {
    return (
      <Grid.Row className="MainContainer">
        <Grid.Column
          className="SearchCriteriaContainer"
          relaxed
          mobile={16}
          tablet={16}
          largeScreen={3}
          widescreen={3}
        >
          <EnrichmentSearchCriteria
            formProps={this.state}
            onEnrichmentSearch={this.handleEnrichmentSearch}
          />
        </Grid.Column>

        <Grid.Column
          className="ContentContainer"
          relaxed
          mobile={16}
          tablet={16}
          largeScreen={13}
          widescreen={13}
        >
          {this.state.isValidSearchEnrichment ? (
            <EnrichmentResults formProps={this.state} />
          ) : (
            <SearchPrompt />
          )}
        </Grid.Column>
      </Grid.Row>
    );
  }
}

export default EnrichmentContainer;
