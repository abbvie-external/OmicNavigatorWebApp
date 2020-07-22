import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import ButtonActions from '../Shared/ButtonActions';
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

class DifferentialResults extends Component {
  state = {
    itemsPerPageInformed: 100,
    differentialRows: this.props.differentialResults.length || 1000,
  };
  differentialGridRef = React.createRef();
  informItemsPerPage = items => {
    this.setState({
      itemsPerPageInformed: items,
    });
  };

  componentDidMount() {
    // this.props.differentialResultsMounted(true);
  }

  render() {
    const {
      differentialStudy,
      differentialModel,
      differentialTest,
      differentialColumns,
      differentialResults,
      featureToHighlightInDiffTable,
      proteinHighlightInProgress,
      isItemSelected,
      additionalTemplateInfoDifferentialTable,
    } = this.props;

    const { differentialRows, itemsPerPageInformed } = this.state;
    // PAUL - ensure this accounts for multiset filters
    let differentialCacheKey = `${differentialStudy}-${differentialModel}-${differentialTest}`;
    if (
      featureToHighlightInDiffTable !== '' &&
      featureToHighlightInDiffTable != null
    ) {
      differentialCacheKey = `${differentialStudy}-${differentialModel}-${differentialTest}-${featureToHighlightInDiffTable}`;
    }
    // const quickViews = [];
    if (!isItemSelected || proteinHighlightInProgress) {
      return (
        <div id="DifferentialGrid">
          <EZGrid
            ref={this.differentialGridRef}
            onInformItemsPerPage={this.informItemsPerPage}
            uniqueCacheKey={differentialCacheKey}
            data={differentialResults}
            columnsConfig={differentialColumns}
            totalRows={differentialRows}
            // use "differentialRows" for itemsPerPage if you want all results. For dev, keep it lower so rendering is faster
            itemsPerPage={itemsPerPageInformed}
            exportBaseName="Differential_Analysis"
            // quickViews={quickViews}
            disableGeneralSearch
            disableGrouping
            disableColumnVisibilityToggle
            disableColumnReorder
            // disableFilters
            min-height="75vh"
            additionalTemplateInfo={additionalTemplateInfoDifferentialTable}
            headerAttributes={<ButtonActions />}
          />
        </div>
      );
    }
  }
}

export default withRouter(DifferentialResults);
