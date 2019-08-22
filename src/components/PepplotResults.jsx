import React, { Component } from 'react';
import { phosphoprotService } from '../services/phosphoprot.service';
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

class PepplotResults extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {}

  render() {
    const results = this.props.searchCriteria.pepplotResults;
    const columns = this.props.searchCriteria.pepplotColumns;
    const rows = this.props.searchCriteria.pepplotResults.length;
    const additionalTemplateInfo = {
      showPhosphositePlus: dataItem => {
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
      }
    };

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
