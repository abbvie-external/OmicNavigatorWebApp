import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { Grid, Message } from 'semantic-ui-react';
import TopBar from './TopBar';
import PepplotContainer from './Pepplot';
import EnrichmentContainer from './Enrichment';
import './App.scss';

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

const App = () => (
  <Grid className="AppContainer">
    <TopBar />
    <Switch>
      <Route exact path="/pepplot" component={PepplotContainer} />
      <Route exact path="/enrichment" component={EnrichmentContainer} />

      <Route exact path="/" render={() => <Redirect to="/pepplot" />} />

      <Route component={NoMatch} />
    </Switch>
  </Grid>
);

export default App;
