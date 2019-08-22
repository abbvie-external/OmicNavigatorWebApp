import React, { Component } from 'react';
// import ButtonActions from './ButtonActions';

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
  }

  componentDidMount() {}

  render() {
    const results = this.props.searchCriteria.enrichmentResults;
    const columns = this.props.searchCriteria.enrichmentColumns;
    return (
      <div>
        {/* <ButtonActions /> */}
        <EZGrid data={[]} height="60vh" columnsConfig={[]} />
      </div>
    );
  }
}

export default EnrichmentResults;
