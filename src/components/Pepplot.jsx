import React, { Component } from 'react';
import { Grid } from 'semantic-ui-react';

import PepplotSearchCriteria from './PepplotSearchCriteria';
import PepplotResults from './PepplotResults';
// import ButtonActions from './ButtonActions';
import SearchPrompt from './SearchPrompt';

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
  }

  handlePepplotSearch = data => {
    this.setState({
      isValidSearchPepplot: true,
      pepplotResults: data
    });
  };

  render() {
    return (
      <Grid.Row className="PepplotContainer MainContainer">
        <Grid.Column
          className="SearchCriteriaContainer"
          relaxed
          mobile={16}
          tablet={16}
          largeScreen={3}
          widescreen={3}
        >
          <PepplotSearchCriteria
            formProps={this.state}
            onPepplotSearch={this.handlePepplotSearch}
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
          {this.state.isValidSearchPepplot ? (
            <PepplotResults formProps={this.state} />
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
