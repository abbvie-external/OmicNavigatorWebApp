import React, { Component } from 'react';

import QHGrid from '../utility/QHGrid';
import EZGrid from '../utility/EZGrid';
import QuickViewModal from '../utility/QuickViewModal';
import { getFieldValue, getField, typeMap } from '../selectors/QHGridSelector';
export * from '../utility/FilterTypeConfig';
export * from '../selectors/quickViewSelector';
export { QHGrid, EZGrid, QuickViewModal };
export { getField, getFieldValue, typeMap };

// import { additionalTemplateInfo } from '../utility/additionalTemplateInfo';

class EnrichmentResults extends Component {
  constructor(props) {
    super(props);
    this.state = {
      enrichmentResults: this.props.formProps.enrichmentResults || []
    };
  }

  componentDidMount() {}

  render() {
    const results = this.state.enrichmentResults.enrichmentResults;
    return <EZGrid data={[]} height="60vh" columnsConfig={[]} />;
  }
}

export default EnrichmentResults;
