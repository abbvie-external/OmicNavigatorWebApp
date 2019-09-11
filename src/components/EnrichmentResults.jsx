import React, { Component } from 'react';
import { phosphoprotService } from '../services/phosphoprot.service';
import { withRouter } from 'react-router-dom';
import { Grid } from 'semantic-ui-react';
import ButtonActions from './ButtonActions';
import _ from 'lodash';

import QHGrid from '../utility/QHGrid';
import EZGrid from '../utility/EZGrid';
import QuickViewModal from '../utility/QuickViewModal';
import { getFieldValue, getField, typeMap } from '../selectors/QHGridSelector';
export * from '../utility/FilterTypeConfig';
export * from '../selectors/quickViewSelector';
export { QHGrid, EZGrid, QuickViewModal };
export { getField, getFieldValue, typeMap };

class EnrichmentResults extends Component {
  static defaultProps = {
    study: '',
    model: '',
    test: '',
    enrichmentResults: [],
    enrichmentColumns: []
  };

  constructor(props) {
    super(props);
    this.state = {
      isProteinDataLoaded: false
    };
  }

  componentDidMount() {}

  render() {
    const results = this.props.enrichmentResults;
    const columns = this.props.enrichmentColumns;
    const rows = this.props.enrichmentResults.length;
    const quickViews = [];
    return (
      <div>
        <EZGrid
          data={results}
          columnsConfig={columns}
          // totalRows={rows}
          // use "rows" for itemsPerPage if you want all results. For dev, keep it lower so rendering is faster
          itemsPerPage={1000}
          exportBaseName="Enrichment_Analysis"
          quickViews={quickViews}
          disableGeneralSearch
          disableGrouping
          disableColumnVisibilityToggle
          height="75vh"
          headerAttributes={<ButtonActions />}
        />
      </div>
    );
  }
}

export default withRouter(EnrichmentResults);
