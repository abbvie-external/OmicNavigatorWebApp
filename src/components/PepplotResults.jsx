import React, { Component, useMemo } from 'react';
import { phosphoprotService } from '../services/phosphoprot.service';
// import ButtonActions from './ButtonActions';
// import TableHelpers from '../utility/TableHelpers';
// import { additionalTemplateInfo } from '../utility/additionalTemplateInfo';

import QHGrid from '../utility/QHGrid';
import EZGrid from '../utility/EZGrid';
import QuickViewModal from '../utility/QuickViewModal';
import { getFieldValue, getField, typeMap } from '../selectors/QHGridSelector';
export * from '../utility/FilterTypeConfig';
export * from '../selectors/quickViewSelector';
export { QHGrid, EZGrid, QuickViewModal };
export { getField, getFieldValue, typeMap };

class PepplotResults extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {}

  getTableHelpers = () => {
    let addParams = {};

    addParams.showPhosphositePlus = dataItem => {
      return function() {
        var protein = (dataItem.Protein
          ? dataItem.Protein
          : dataItem.MajorityProteinIDsHGNC
        ).split(';')[0];
        let param = { proteinNames: protein, queryId: -1, from: 0 };
        phosphoprotService.postToPhosphositePlus(
          param,
          'https://www.phosphosite.org/proteinSearchSubmitAction.action'
        );
      };
    };

    addParams.showPlot = (model, dataItem) => {
      return function() {
        debugger;
        let imageInfo = { title: '', svg: [] };
        if (dataItem.id_mult) {
          // const selectedId = dataItem.id_mult;
          switch (model) {
            case 'Differential Expression':
              imageInfo.title =
                'Protein Intensity - ' + dataItem.MajorityProteinIDs;
              break;
            default:
              imageInfo.title =
                'Phosphosite Intensity - ' + dataItem.Protein_Site;
          }
          console.log(
            'now we need to get the plot, and title it' + imageInfo.title
          );
          // this.getPlot(dataItem.id_mult ? dataItem.id_mult : dataItem.id, dataItem);
        }
      };
    };
    return addParams;
  };

  render() {
    const results = this.props.searchCriteria.pepplotResults;
    const columns = this.props.searchCriteria.pepplotColumns;
    const rows = this.props.searchCriteria.pepplotResults.length;
    const additionalTemplateInfo = this.getTableHelpers();

    return (
      <div>
        <EZGrid
          data={results}
          columnsConfig={columns}
          totalRows={rows}
          // use "rows" for itemsPerPage if you want all results. For dev, keep it at 500 so rendering doesn't take too long
          itemsPerPage={500}
          height="65vh"
          additionalTemplateInfo={additionalTemplateInfo}
        />
      </div>
    );
  }
}

export default PepplotResults;
