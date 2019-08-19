import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { Grid, Message } from 'semantic-ui-react';
import TopBar from './TopBar';
import SearchCriteria from './SearchCriteria';
import SearchPrompt from './SearchPrompt';
import PepplotContainer from './Pepplot';
import PlotContainer from './Plot';
import EnrichmentContainer from './Enrichment';
import ChartsContainer from './Charts';
// import StudyHTMLContainer from './StudyHTML'
import './App.scss';

const App = () => (
  <div className="AppContainer">
    <Grid className="">
      <TopBar />
      <Grid.Row className="MainContainer">
        <Grid.Column
          className="SearchCriteriaContainer"
          relaxed
          mobile={16}
          tablet={16}
          largeScreen={3}
          widescreen={3}
        >
          <SearchCriteria />
        </Grid.Column>

        <Grid.Column
          className="ContentContainer"
          relaxed
          mobile={16}
          tablet={16}
          largeScreen={13}
          widescreen={13}
        >
          <Switch>
            <Route exact path="/pepplot" component={PepplotContainer} />
            <Route exact path="/plot" component={PlotContainer} />
            <Route exact path="/enrichment" component={EnrichmentContainer} />
            <Route exact path="/charts" component={ChartsContainer} />
            <Route exact path="/" component={SearchPrompt} />
            {/* <Route exact path="/public/***REMOVED***.html" component={StudyHTMLContainer} />
        <Route exact path="/public/***REMOVED***.html" component={StudyHTMLContainer} />
        <Route exact path="/public/***REMOVED***.html" component={StudyHTMLContainer} /> */}
            <Route component={NoMatch} />
          </Switch>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  </div>
);

const NoMatch = ({ location }) => (
  <div className="NoMatchContainer">
    <Message
      error
      compact
      icon="exclamation"
      header="ROUTE ERROR"
      content="Please enter a valid URL"
    />
  </div>
);

export default App;
