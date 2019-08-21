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

class PepplotResults extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {}

  render() {
    const results = this.props.searchCriteria.pepplotResults;
    return <EZGrid data={results} height="60vh" columnsConfig={mockColumns} />;
  }
}

const mockColumns = [
  {
    title: 'Protein_Site',
    field: 'Protein_Site',
    type: 'number',
    filterable: { type: 'multiFilter' },
    template: (value, item, addParams) => {
      return (
        <p>
          {value}
          <img
            src="phosphosite.ico"
            alt="Phosophosite"
            className="phophositeIcon"
          />
          {/* <img  src="phosphosite.ico" alt="Phosophosite" class="phosphositeIcon" data-manifest={item} onClick={addParams.showPhosphositePlus(item)} /> */}
        </p>
      );
    }
  },
  {
    title: 'logFC',
    field: {
      field: 'logFC',
      sortAccessor: (item, field) => item[field] && item[field].toFixed(2),
      groupByAccessor: (item, field) => item[field] && item[field].toFixed(2),
      accessor: (item, field) => item[field] && item[field].toFixed(2)
    },
    type: 'number',
    filterable: { type: 'multiFilter' }
  },
  {
    title: 't',
    field: {
      field: 't',
      sortAccessor: (item, field) => item[field] && item[field].toFixed(2),
      groupByAccessor: (item, field) => item[field] && item[field].toFixed(2),
      accessor: (item, field) => item[field] && item[field].toFixed(2)
    },
    type: 'number'
  },
  {
    title: 'P_Value',
    field: {
      field: 'P_Value'
    },
    type: 'number',
    filterable: { type: 'multiFilter' }
  },
  {
    title: 'adj_P_Val',
    field: {
      field: 'adj_P_Val',
      sortAccessor: (item, field) => item[field] && item[field].toFixed(4),
      groupByAccessor: (item, field) => item[field] && item[field].toFixed(4),
      accessor: (item, field) => item[field] && item[field].toFixed(4)
    },
    type: 'number'
  }
];

export default PepplotResults;
