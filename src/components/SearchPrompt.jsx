import React from 'react';
import { Segment, Message } from 'semantic-ui-react';

const SearchPrompt = () => (
  <Segment className="Search Prompt">
    <Message info floating>
      <Message.Header>Please Select</Message.Header>
      <Message.List>
        <Message.Item>Differential or Enrichment</Message.Item>
        <Message.Item>Study</Message.Item>
        <Message.Item>Model</Message.Item>
        <Message.Item>Test</Message.Item>
      </Message.List>
    </Message>
  </Segment>
);

export default SearchPrompt;
