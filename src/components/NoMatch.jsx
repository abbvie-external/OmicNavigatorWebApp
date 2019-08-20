import React from 'react';
import { Grid, Header, Message, Image } from 'semantic-ui-react';

const NoMatch = () => (
  <Grid.Row className="MainContainer">
    <Grid.Column
      className="SearchCriteriaContainer"
      relaxed
      mobile={16}
      tablet={16}
      largeScreen={3}
      widescreen={3}
    ></Grid.Column>

    <Grid.Column
      className="ContentContainer"
      relaxed
      mobile={16}
      tablet={16}
      largeScreen={13}
      widescreen={13}
    >
      <Image src="invalid_url.png" size="medium" centered />
      <Header as="h2" textAlign="center">
        ROUTE ERROR
      </Header>
      <Header as="h4" textAlign="center">
        <Message error compact header="Please enter a valid URL" />
      </Header>
    </Grid.Column>
  </Grid.Row>
);

export default NoMatch;
