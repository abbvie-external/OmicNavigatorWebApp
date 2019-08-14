import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Grid, Segment, Icon, Header, Button } from 'semantic-ui-react';
import Steps from './Steps';

class ChartsContainer extends Component {
  state = {};

  componentDidMount() {}

  render() {
    return (
      <div className="">
        <Steps />
        <Segment className="ChartsContainer">
          <Grid divided="vertically">
            <Grid.Row columns={1}>
              <Grid.Column
                relaxed
                mobile={16}
                tablet={16}
                largeScreen={16}
                widescreen={16}
              >
                <Segment className="" placeholder>
                  <Header icon>
                    <Icon name="chart bar" />
                    e.g Bar Chart
                  </Header>
                </Segment>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row columns={2}>
              <Grid.Column
                relaxed
                mobile={16}
                tablet={16}
                largeScreen={8}
                widescreen={8}
              >
                <Segment className="" placeholder>
                  <Header icon>
                    <Icon name="chart area" />
                    LEFT PANE (e.g. Line Chart)
                  </Header>
                </Segment>
              </Grid.Column>
              <Grid.Column
                relaxed
                mobile={16}
                tablet={16}
                largeScreen={8}
                widescreen={8}
              >
                <Segment className="" placeholder>
                  <Header icon textAlign="center">
                    <Icon name="chart pie" circular />
                    <Header.Content>
                      RIGHT PANE (e.g. Area Chart)
                    </Header.Content>
                    <br></br>
                    <Header.Subheader>
                      <Link
                        to={{
                          pathname: `/plot`,
                          state: {}
                        }}
                      >
                        <Button primary content="to PLOT click"></Button>
                      </Link>
                    </Header.Subheader>
                  </Header>
                </Segment>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      </div>
    );
  }
}

export default ChartsContainer;
