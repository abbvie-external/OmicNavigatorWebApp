import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'semantic-ui-react';
// import ButtonActions from './ButtonActions'

import QHGrid from '../utility/QHGrid';
import EZGrid from '../utility/EZGrid';
import QuickViewModal from '../utility/QuickViewModal';
import { getFieldValue, getField, typeMap } from '../selectors/QHGridSelector';
export * from '../utility/FilterTypeConfig';
export * from '../selectors/quickViewSelector';
export { QHGrid, EZGrid, QuickViewModal };
export { getField, getFieldValue, typeMap };

// import { additionalTemplateInfo } from '../utility/additionalTemplateInfo';

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
            class="phophositeIcon"
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

class PepplotContainer extends Component {
  state = {};
  componentDidMount() {
    this.phosphorylationData = this.phosphorylationData.bind(this);
  }

  render() {
    return (
      <div className="PepplotResultsContainer">
        {/* <ButtonActions /> */}
        <EZGrid
          // data={this.state.data}
          data={mockData}
          height="60vh"
          columnsConfig={mockColumns}
        />
        <br></br>
        <Link
          to={{
            pathname: `/plot`,
            state: {
              view: this.state.view
            }
          }}
        >
          <Button primary content="Mock Protein Site Click"></Button>
        </Link>
      </div>
    );
  }

  phosphorylationData() {
    const result = {
      data: process(this.testData, this.stateExcelExport).data
    };
    return result;
  }
}

const mockData = [
  {
    id_mult: '4292_1',
    logFC: -2.4788567965,
    AveExpr: 2.4799130311,
    t: -11.964366736,
    P_Value: 2.3375205662e-7,
    adj_P_Val: 0.00071434628503,
    B: 7.2057604666,
    Protein_Site: 'HMGA1_S44',
    Protein: 'HMGA1'
  },
  {
    id_mult: '10650_1',
    logFC: 2.2921599139,
    AveExpr: -0.389000147,
    t: 8.5563533881,
    P_Value: 0.0000054546430055,
    adj_P_Val: 0.0061567113876,
    B: 4.4760721007,
    Protein_Site: 'MYC_S77',
    Protein: 'MYC'
  },
  {
    id_mult: '1535_1',
    logFC: 1.8421577284,
    AveExpr: 1.49231679,
    t: 8.3720835331,
    P_Value: 0.0000066474824674,
    adj_P_Val: 0.0061567113876,
    B: 4.294794214,
    Protein_Site: 'BUD13_S271',
    Protein: 'BUD13'
  },
  {
    id_mult: '8291_1',
    logFC: -1.8952771841,
    AveExpr: 2.2840774789,
    t: -8.0060302463,
    P_Value: 0.0000099462260753,
    adj_P_Val: 0.0061567113876,
    B: 3.9224898241,
    Protein_Site: 'C9orf142_S152',
    Protein: 'C9orf142'
  },
  {
    id_mult: '165_1',
    logFC: 1.6738047959,
    AveExpr: -0.087916852287,
    t: 7.8203824423,
    P_Value: 0.0000122664878,
    adj_P_Val: 0.0061567113876,
    B: 3.7272688763,
    Protein_Site: 'ESF1_S198',
    Protein: 'ESF1'
  },
  {
    id_mult: '3118_2',
    logFC: 1.7456674339,
    AveExpr: 8.4924279461,
    t: 7.6900327316,
    P_Value: 0.00001424352777,
    adj_P_Val: 0.0061567113876,
    B: 3.5875463274,
    Protein_Site: 'HMGA1_S102',
    Protein: 'HMGA1'
  },
  {
    id_mult: '3119_2',
    logFC: 1.7456674339,
    AveExpr: 8.4924279461,
    t: 7.6900327316,
    P_Value: 0.00001424352777,
    adj_P_Val: 0.0061567113876,
    B: 3.5875463274,
    Protein_Site: 'HMGA1_S103',
    Protein: 'HMGA1'
  },
  {
    id_mult: '928_1',
    logFC: 1.6856602294,
    AveExpr: 0.45474471629,
    t: 7.5495270883,
    P_Value: 0.00001676786067,
    adj_P_Val: 0.0061567113876,
    B: 3.4344407428,
    Protein_Site: 'RIF1_S2144',
    Protein: 'RIF1'
  },
  {
    id_mult: '3292_1',
    logFC: -2.4959168557,
    AveExpr: 1.3973998512,
    t: -7.4828515835,
    P_Value: 0.000018131676207,
    adj_P_Val: 0.0061567113876,
    B: 3.3608670709,
    Protein_Site: 'DBN1_S142',
    Protein: 'DBN1'
  },
  {
    id_mult: '9146_1',
    logFC: -1.9652707138,
    AveExpr: 0.6631486409,
    t: -7.3729803013,
    P_Value: 0.000020647910422,
    adj_P_Val: 0.0063100014251,
    B: 3.2383215111,
    Protein_Site: 'ASMTL_S181',
    Protein: 'ASMTL'
  },
  {
    id_mult: '8743_2',
    logFC: 2.3045546317,
    AveExpr: 1.2362679235,
    t: 7.1092774653,
    P_Value: 0.000028366452023,
    adj_P_Val: 0.0070670628496,
    B: 2.9374439868,
    Protein_Site: 'MDC1_S329;MDC1_T331',
    Protein: 'MDC1;MDC1'
  },
  {
    id_mult: '931_1',
    logFC: -3.1131232981,
    AveExpr: -0.35371763241,
    t: -7.0717572714,
    P_Value: 0.000031372954219,
    adj_P_Val: 0.0070670628496,
    B: 2.8472337857,
    Protein_Site: 'BATF3_S2',
    Protein: 'BATF3'
  },
  {
    id_mult: '8762_2',
    logFC: 1.3283660124,
    AveExpr: 3.0694288504,
    t: 6.9706419125,
    P_Value: 0.000033631837954,
    adj_P_Val: 0.0070670628496,
    B: 2.7753641559,
    Protein_Site: 'MDC1_S299',
    Protein: 'MDC1'
  },
  {
    id_mult: '12649_2',
    logFC: 1.3283660124,
    AveExpr: 3.0694288504,
    t: 6.9706419125,
    P_Value: 0.000033631837954,
    adj_P_Val: 0.0070670628496,
    B: 2.7753641559,
    Protein_Site: 'MDC1_T301',
    Protein: 'MDC1'
  },
  {
    id_mult: '1102_1',
    logFC: -1.8071248104,
    AveExpr: 0.32663898448,
    t: -6.945670503,
    P_Value: 0.00003468780849,
    adj_P_Val: 0.0070670628496,
    B: 2.7458796497,
    Protein_Site: 'ARHGEF6_S530',
    Protein: 'ARHGEF6'
  },
  {
    id_mult: '1872_2',
    logFC: 1.7467784259,
    AveExpr: 3.1615913377,
    t: 6.6757720704,
    P_Value: 0.000048687347689,
    adj_P_Val: 0.0087522667375,
    B: 2.4214611478,
    Protein_Site: 'ACIN1_S386',
    Protein: 'ACIN1'
  },
  {
    id_mult: '1873_2',
    logFC: 1.7467784259,
    AveExpr: 3.1615913377,
    t: 6.6757720704,
    P_Value: 0.000048687347689,
    adj_P_Val: 0.0087522667375,
    B: 2.4214611478,
    Protein_Site: 'ACIN1_S388',
    Protein: 'ACIN1'
  },
  {
    id_mult: '1720_2',
    logFC: -1.6367098951,
    AveExpr: 0.30186597673,
    t: -6.5708814622,
    P_Value: 0.000055680757034,
    adj_P_Val: 0.0091465792144,
    B: 2.2925081257,
    Protein_Site: 'SPAG9_S733;SPAG9_S730',
    Protein: 'SPAG9;SPAG9'
  },
  {
    id_mult: '2116_1',
    logFC: 1.9229008117,
    AveExpr: 1.6828363876,
    t: 6.4980416269,
    P_Value: 0.000061170392068,
    adj_P_Val: 0.0091465792144,
    B: 2.2019983207,
    Protein_Site: 'STRN_S245',
    Protein: 'STRN'
  },
  {
    id_mult: '611_1',
    logFC: 2.4744682374,
    AveExpr: 4.5637563543,
    t: 6.5557654038,
    P_Value: 0.000064362616231,
    adj_P_Val: 0.0091465792144,
    B: 2.1688554342,
    Protein_Site: 'BCLAF1_S383',
    Protein: 'BCLAF1'
  },
  {
    id_mult: '4986_1',
    logFC: 1.5260223946,
    AveExpr: 4.0864541532,
    t: 6.4068406823,
    P_Value: 0.000068879429617,
    adj_P_Val: 0.0091465792144,
    B: 2.0875546886,
    Protein_Site: 'RBMX_S208',
    Protein: 'RBMX'
  },
  {
    id_mult: '7063_1',
    logFC: -1.6283246418,
    AveExpr: 1.2211877694,
    t: -6.3967739175,
    P_Value: 0.000069792402449,
    adj_P_Val: 0.0091465792144,
    B: 2.0748457925,
    Protein_Site: 'GFPT1_S243',
    Protein: 'GFPT1'
  },
  {
    id_mult: '545_3',
    logFC: 1.817781499,
    AveExpr: 3.8467793895,
    t: 6.3760620076,
    P_Value: 0.000071712019768,
    adj_P_Val: 0.0091465792144,
    B: 2.0486497529,
    Protein_Site: 'CCDC86_S69;CCDC86_S58',
    Protein: 'CCDC86;CCDC86'
  },
  {
    id_mult: '546_3',
    logFC: 1.9968274822,
    AveExpr: 3.7414043356,
    t: 6.3747897352,
    P_Value: 0.000071831773935,
    adj_P_Val: 0.0091465792144,
    B: 2.0470384957,
    Protein_Site: 'CCDC86_S66',
    Protein: 'CCDC86'
  }
];

export default PepplotContainer;
