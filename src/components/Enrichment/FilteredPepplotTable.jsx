import React, { Component } from 'react';
import QHGrid from '../utility/QHGrid';
import EZGrid from '../utility/EZGrid';
import QuickViewModal from '../utility/QuickViewModal';
import {
  getFieldValue,
  getField,
  typeMap
} from '../utility/selectors/QHGridSelector';
export * from '../utility/FilterTypeConfig';
export * from '../utility/selectors/quickViewSelector';
export { QHGrid, EZGrid, QuickViewModal };
export { getField, getFieldValue, typeMap };

class FilteredPepplotTable extends Component {
  componentDidMount() {}

  render() {
    debugger;
    const { barcodeSettings, filteredPepplotColumns } = this.props;
    // const enrichmentCacheKey = `${enrichmentStudy}-${enrichmentModel}-${enrichmentAnnotation}`;
    const quickViews = [];
    // const additionalTemplateInfo = this.getTableHelpers(
    //   this.testSelectedTransition,
    //   this.showBarcodePlot
    // );

    // if (!this.state.isTestSelected) {
    return (
      <div>
        <EZGrid
          // ref={this.filteredPepplotGridRef}
          // proteinToHighlight={proteinToHighlightInDiffTable}
          // onInformItemsPerPage={this.informItemsPerPage}
          // proteinToHighlightRow={highlightedRowRef}
          // uniqueCacheKey={pepplotCacheKey}
          data={barcodeSettings.brushedData}
          columnsConfig={filteredPepplotColumns}
          // totalRows={pepplotRows}
          // use "pepplotRows" for itemsPerPage if you want all results. For dev, keep it lower so rendering is faster
          // itemsPerPage={itemsPerPageInformed}
          // exportBaseName="Differential_Phosphorylation_Analysis"
          // quickViews={quickViews}
          disableGeneralSearch
          disableGrouping
          disableColumnVisibilityToggle
          // min-height="75vh"
          // additionalTemplateInfo={additionalTemplateInfo}
          // headerAttributes={<ButtonActions />}
        />
      </div>
    );
    // }
  }
}

export default FilteredPepplotTable;
