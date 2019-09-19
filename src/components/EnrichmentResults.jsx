import React, { Component } from 'react';
import { phosphoprotService } from '../services/phosphoprot.service';
import { withRouter } from 'react-router-dom';
import ButtonActions from './ButtonActions';
import _ from 'lodash';

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

  showPhosphositePlus = dataItem => {
    return function() {
      var protein = (dataItem.Description
        ? dataItem.Description
        : dataItem.MajorityProteinIDsHGNC
      ).split(';')[0];
      let param = { queryId: -1, from: 0, searchStr: dataItem.Description };
      phosphoprotService.postToPhosphositePlus(
        param,
        'https://www.phosphosite.org/proteinSearchSubmitAction.action'
      );
    };
  };

  getTableHelpers = () => {
    let addParams = {};
    addParams.getLink = (study, test, dataItem) => {
      return function() {
        phosphoprotService
          .getDatabaseInfo(study + 'plots', test)
          .then(databaseDataResponse => {
            const databaseData = JSON.parse(databaseDataResponse);
            dataItem.Annotation = _.find(databaseData, {
              Description: dataItem.Description
            }).Key;
            const database = test;
            if (database === 'REACTOME') {
              window.open(
                'https://reactome.org/content/detail/' + dataItem.Annotation,
                '_blank'
              );
            } else if (database.substring(0, 2) === 'GO') {
              window.open(
                'http://amigo.geneontology.org/amigo/term/' +
                  dataItem.Annotation,
                '_blank'
              );
            } else if (database.substring(0, 4) === 'msig') {
              window.open(
                'http://software.broadinstitute.org/gsea/msigdb/cards/' +
                  dataItem.Annotation,
                '_blank'
              );
            } else if (database === 'PSP') {
              this.showPhosphositePlus('', dataItem);
            }
          });
      };
    };

    return addParams;
  };

  render() {
    const results = this.props.enrichmentResults;
    const columns = this.props.enrichmentColumns;
    // const rows = this.props.enrichmentResults.length;
    const quickViews = [];
    const additionalTemplateInfo = this.getTableHelpers(this.props);
    return (
      <div>
        <EZGrid
          data={results}
          columnsConfig={columns}
          // totalRows={rows}
          // use "rows" for itemsPerPage if you want all results. For dev, keep it lower so rendering is faster
          itemsPerPage={100}
          exportBaseName="Enrichment_Analysis"
          quickViews={quickViews}
          disableGeneralSearch
          disableGrouping
          disableColumnVisibilityToggle
          height="75vh"
          additionalTemplateInfo={additionalTemplateInfo}
          headerAttributes={<ButtonActions />}
        />
      </div>
    );
  }
}

export default withRouter(EnrichmentResults);
