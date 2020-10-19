import React from 'react';
import { Message } from 'semantic-ui-react';

const CustomEmptyMessage = (
  <Message
    className=""
    icon="search"
    header="No Results"
    content="Please Adjust Filters"
  />
);

export default CustomEmptyMessage;
