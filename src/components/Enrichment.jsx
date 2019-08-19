import React, { Component } from 'react';
import { Segment, Header, Icon, Grid, Divider } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { Button } from 'semantic-ui-react';

class EnrichmentContainer extends Component {
  state = {};

  componentDidMount() {}

  render() {
    return (
      <Segment className="EnrichmentResultsContainer">
        <Grid columns={2} relaxed stackable>
          <Grid.Column>
            <Header icon textAlign="center">
              <Icon name="chart pie" circular />
              <Header.Content>Pie Chart</Header.Content>
              <br></br>
              <Header.Subheader>
                <Link
                  to={{
                    pathname: `/charts`,
                    state: {}
                  }}
                >
                  <Button primary content="Mock Chart Click"></Button>
                </Link>
              </Header.Subheader>
            </Header>
          </Grid.Column>

          <Grid.Column verticalAlign="middle">
            <Header icon textAlign="center">
              <Icon name="table" circular />
              <Header.Content>Grid</Header.Content>
            </Header>
          </Grid.Column>
        </Grid>

        <Divider vertical>Or</Divider>
      </Segment>
    );
  }
}

export default EnrichmentContainer;
