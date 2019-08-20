import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { Grid } from 'semantic-ui-react';
import TopBar from './TopBar';
import PepplotContainer from './Pepplot';
import EnrichmentContainer from './Enrichment';
import NoMatch from './NoMatch';
import './App.scss';

const App = () => (
  <Grid className="AppContainer">
    <TopBar props />
    <Switch>
      <Route exact path="/pepplot" component={PepplotContainer} />
      <Route exact path="/enrichment" component={EnrichmentContainer} />

      <Route exact path="/" render={() => <Redirect to="/pepplot" />} />

      <Route component={NoMatch} />
    </Switch>
  </Grid>
);

export default App;
