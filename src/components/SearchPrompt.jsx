import React from 'react';
import { Header, Image } from 'semantic-ui-react';

const SearchPrompt = () => (
  <div className="SearchPrompt">
    <Header as="h2" textAlign="center">
      No records available
    </Header>
    <Header as="h4" textAlign="center">
      Use the filters to display relevant records
    </Header>
    <Image
      className="EmptySearchImage"
      src="empty_search.png"
      size="medium"
      centered
    />
  </div>
);

export default SearchPrompt;
