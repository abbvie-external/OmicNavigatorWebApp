import React, { Component } from 'react';
import { Grid, Segment, Icon, Header } from 'semantic-ui-react';
import Breadcrumbs from './Breadcrumbs';
import PlotAccordion from './PlotAccordion';

class PlotContainer extends Component {
  // constructor(props) {
  //   super(props);
  //   const path = props.location.pathname === '/' ? '/pepplot' : props.location.pathname;
  //   this.state = {
  //     activeTab: path
  //   };
  // }

  componentDidMount() {}

  render() {
    return (
      <div className="">
        <Breadcrumbs />
        <Segment className="PlotContainer">
          <Grid columns={2}>
            <Grid.Row className="">
              <Grid.Column
                className="PlotAccordionContainer"
                mobile={16}
                tablet={16}
                largeScreen={3}
                widescreen={4}
              >
                <PlotAccordion />
              </Grid.Column>
              <Grid.Column
                mobile={16}
                tablet={16}
                largeScreen={13}
                widescreen={12}
              >
                <Segment className="PlotSVG" placeholder>
                  <Header icon>
                    <Icon name="chart area" />
                    Plot (formerly Dialog) goes here
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

export default PlotContainer;
