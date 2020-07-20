import React, { Component } from 'react';
import { Grid } from 'semantic-ui-react';
import { phosphoprotService } from '../../services/phosphoprot.service';
import './EnrichmentResultsTable.scss';
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

class EnrichmentResultsTable extends Component {
  showPhosphositePlus = dataItem => {
    return function() {
      var protein = (dataItem.Description
        ? dataItem.Description
        : dataItem.MajorityProteinIDsHGNC
      ).split(';')[0];
      let param = { queryId: -1, from: 0, searchStr: protein };
      phosphoprotService.postToPhosphositePlus(
        param,
        'https://www.phosphosite.org/proteinSearchSubmitAction.action',
      );
    };
  };

  render() {
    const {
      enrichmentResults,
      enrichmentColumns,
      enrichmentStudy,
      enrichmentModel,
      enrichmentAnnotation,
      additionalTemplateInfoEnrichmentTable,
    } = this.props;
    // PAUL - ensure this accounts for multiset filters
    const enrichmentCacheKey = `${enrichmentStudy}-${enrichmentModel}-${enrichmentAnnotation}`;
    const quickViews = [];

    return (
      <Grid>
        <Grid.Row>
          <Grid.Column
            className="EnrichmentResultsTable"
            mobile={16}
            tablet={16}
            largeScreen={16}
            widescreen={16}
          >
            <EZGrid
              uniqueCacheKey={enrichmentCacheKey}
              data={enrichmentResults}
              columnsConfig={enrichmentColumns}
              // totalRows={rows}
              // use "rows" for itemsPerPage if you want all results. For dev, keep it lower so rendering is faster
              itemsPerPage={100}
              exportBaseName="Enrichment_Analysis"
              quickViews={quickViews}
              // disableGeneralSearch
              columnReorder={this.props.columnReorder}
              disableColumnReorder
              disableGrouping
              disableColumnVisibilityToggle
              min-height="75vh"
              additionalTemplateInfo={additionalTemplateInfoEnrichmentTable}
              // onInformItemsPerPage={this.informItemsPerPage}
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default EnrichmentResultsTable;
