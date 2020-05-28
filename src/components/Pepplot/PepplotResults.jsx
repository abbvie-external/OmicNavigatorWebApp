import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import ButtonActions from '../Shared/ButtonActions';
import _ from 'lodash';
import QHGrid from '../utility/QHGrid';
import EZGrid from '../utility/EZGrid';
import QuickViewModal from '../utility/QuickViewModal';
import {
  getFieldValue,
  getField,
  typeMap,
} from '../utility/selectors/QHGridSelector';
export * from '../utility/FilterTypeConfig';
export * from '../utility/selectors/quickViewSelector';
export { QHGrid, EZGrid, QuickViewModal };
export { getField, getFieldValue, typeMap };

class PepplotResults extends Component {
  state = {
    itemsPerPageInformed: 100,
    pepplotRows: this.props.pepplotResults.length || 1000,
  };
  pepplotGridRef = React.createRef();
  informItemsPerPage = items => {
    this.setState({
      itemsPerPageInformed: items,
    });
  };

  render() {
    const {
      pepplotStudy,
      pepplotModel,
      pepplotTest,
      pepplotColumns,
      pepplotResults,
      proteinToHighlightInDiffTable,
      proteinHighlightInProgress,
      isItemSelected,
      additionalTemplateInfoPepplotTable
    } = this.props;

    const {
      pepplotRows,
      itemsPerPageInformed,
    } = this.state;

    let pepplotCacheKey = `${pepplotStudy}-${pepplotModel}-${pepplotTest}`;
    if (
      proteinToHighlightInDiffTable !== '' &&
      proteinToHighlightInDiffTable !== null &&
      proteinToHighlightInDiffTable !== undefined
    ) {
      pepplotCacheKey = `${pepplotStudy}-${pepplotModel}-${pepplotTest}-${proteinToHighlightInDiffTable}`;
    }
    // const quickViews = [];
    if (!isItemSelected || proteinHighlightInProgress) {
      return (
        <div id="PepplotGrid">
          <EZGrid
            ref={this.pepplotGridRef}
            onInformItemsPerPage={this.informItemsPerPage}
            uniqueCacheKey={pepplotCacheKey}
            data={pepplotResults}
            columnsConfig={pepplotColumns}
            totalRows={pepplotRows}
            // use "pepplotRows" for itemsPerPage if you want all results. For dev, keep it lower so rendering is faster
            itemsPerPage={itemsPerPageInformed}
            exportBaseName="Differential_Phosphorylation_Analysis"
            // quickViews={quickViews}
            disableGeneralSearch
            disableGrouping
            disableColumnVisibilityToggle
            // disableFilters
            min-height="75vh"
            additionalTemplateInfo={additionalTemplateInfoPepplotTable}
            headerAttributes={<ButtonActions />}
          />
        </div>
      );
    } 
  }
}

export default withRouter(PepplotResults);
