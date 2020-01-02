import React, { Component } from 'react';
import { Popup } from 'semantic-ui-react';
import { phosphoprotService } from '../../services/phosphoprot.service';
import _ from 'lodash';
import { formatNumberForDisplay, splitValue } from '../Shared/helpers';
import phosphosite_icon from '../../resources/phosphosite.ico';

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
  constructor(props) {
    super(props);
    this.state = {
      filteredTableConfigCols: [],
      filteredTableData: [],
      filteredBarcodeData: []
    };
  }

  componentDidMount() {
    this.getfilteredTableConfigCols(this.props.barcodeSettings.barcodeData);
    // const filteredPepplotCols = this.getfilteredTableConfigCols(
    //   this.props.barcodeSettings.barcodeData
    // );
    // this.setState({
    //   filteredTableConfigCols: filteredPepplotCols
    // });
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (
      this.props.barcodeSettings.brushedData !==
      prevProps.barcodeSettings.brushedData
    ) {
      this.getTableData();
    }
  };

  getTableData = () => {
    if (this.props.barcodeSettings.brushedData.length > 0) {
      const brushedMultIds = this.props.barcodeSettings.brushedData.map(
        b => b.id_mult
      );
      const filteredPepplotData = this.state.filteredBarcodeData.filter(d =>
        brushedMultIds.includes(d.id_mult)
      );
      // return filteredPepplotData;
      this.setState({
        filteredTableData: filteredPepplotData
      });
    } else {
      // return [];
    }
  };

  getfilteredTableConfigCols = barcodeData => {
    if (this.state.filteredBarcodeData.length > 0) {
      this.setConfigCols(this.state.filteredBarcodeData);
    } else {
      const key = this.props.imageInfo.key.split(':');
      const name = key[0] || '';
      phosphoprotService
        .getTestData(
          this.props.enrichmentModel,
          name,
          this.props.enrichmentStudy + 'plots'
        )
        .then(dataFromService => {
          // const dataParsed = JSON.parse(dataFromService);
          const barcodeMultIds = barcodeData.map(b => b.id_mult);
          const filteredData = dataFromService.filter(d =>
            barcodeMultIds.includes(d.id_mult)
          );
          // const filteredData = _.intersectionWith(datafFromService, allTickIds, _.isEqual);
          // const diffProtein = this.props.proteinForDiffView.lineID;
          // this.props.onViewDiffTable(name, diffProtein);
          const cols = this.setConfigCols(filteredData);
          return cols;
        });
    }
  };

  setConfigCols = filteredData => {
    let self = this;
    const model = this.props.enrichmentModel;
    let initConfigCols = [];

    const TableValuePopupStyle = {
      backgroundColor: '2E2E2E',
      borderBottom: '2px solid #FF4400',
      color: '#FFF',
      padding: '1em',
      maxWidth: '50vw',
      fontSize: '13px',
      wordBreak: 'break-all'
    };

    let icon = phosphosite_icon;
    let iconText = 'PhosphoSitePlus';

    if (model === 'Differential Expression') {
      initConfigCols = [
        {
          title: 'MajorityProteinIDsHGNC',
          field: 'MajorityProteinIDsHGNC',
          filterable: { type: 'alphanumericFilter' },
          template: (value, item, addParams) => {
            return (
              <div>
                {/* ref={this.highlightRef()}> */}
                <Popup
                  trigger={
                    <span
                      className="TableCellLink"
                      // onClick={addParams.showPlot(model, item)}
                    >
                      {splitValue(value)}
                    </span>
                  }
                  content={value}
                  style={TableValuePopupStyle}
                  className="TablePopupValue"
                  inverted
                  basic
                />
                <Popup
                  trigger={
                    <img
                      src={icon}
                      alt="Phosophosite"
                      className="ExternalSiteIcon"
                      // onClick={addParams.showPhosphositePlus(item)}
                    />
                  }
                  style={TableValuePopupStyle}
                  className="TablePopupValue"
                  content={iconText}
                  inverted
                  basic
                />
              </div>
            );
          }
        },
        {
          title: 'MajorityProteinIDs',
          field: 'MajorityProteinIDs',
          filterable: { type: 'alphanumericFilter' },
          template: (value, item, addParams) => {
            return (
              <Popup
                trigger={
                  <span className="TableValue">{splitValue(value)}</span>
                }
                content={value}
                style={TableValuePopupStyle}
                className="TablePopupValue"
                inverted
                basic
              />
            );
          }
        }
      ];
    } else {
      initConfigCols = [
        {
          title: 'Protein_Site',
          field: 'Protein_Site',
          filterable: { type: 'alphanumericFilter' },
          template: (value, item, addParams) => {
            return (
              <div>
                {/* ref={this.highlightRef()} */}
                <Popup
                  trigger={
                    <span
                      className="TableCellLink"
                      // onClick={addParams.showPlot(model, item)}
                    >
                      {splitValue(value)}
                    </span>
                  }
                  style={TableValuePopupStyle}
                  className="TablePopupValue"
                  content={value}
                  inverted
                  basic
                />
                <Popup
                  trigger={
                    <img
                      src={icon}
                      alt="Phosophosite"
                      className="ExternalSiteIcon"
                      // onClick={addParams.showPhosphositePlus(item)}
                    />
                  }
                  style={TableValuePopupStyle}
                  className="TablePopupValue"
                  content={iconText}
                  inverted
                  basic
                />
              </div>
            );
          }
        }
      ];
    }
    let relevantConfigCols = [
      'F',
      'logFC',
      't',
      'P_Value',
      'adj_P_Val',
      'adjPVal'
    ];
    if (filteredData.length !== 0 && filteredData.length !== undefined) {
      let orderedTestData = JSON.parse(
        JSON.stringify(filteredData[0], relevantConfigCols)
      );

      let relevantConfigColumns = _.map(
        _.filter(_.keys(orderedTestData), function(d) {
          return _.includes(relevantConfigCols, d);
        })
      );

      // if using multi-set analysis, show set membership column
      if (this.state.multisetQueried) {
        relevantConfigColumns.splice(0, 0, 'Set_Membership');
      }

      const additionalConfigColumns = relevantConfigColumns.map(c => {
        return {
          title: c,
          field: c,
          type: 'number',
          filterable: { type: 'numericFilter' },
          exportTemplate: value => (value ? `${value}` : 'N/A'),
          template: (value, item, addParams) => {
            return (
              <p>
                <Popup
                  trigger={
                    <span className="TableValue">
                      {formatNumberForDisplay(value)}
                    </span>
                  }
                  style={TableValuePopupStyle}
                  className="TablePopupValue"
                  content={value}
                  inverted
                  basic
                />
              </p>
            );
          }
        };
      });
      const configCols = initConfigCols.concat(additionalConfigColumns);
      self.setState({
        filteredBarcodeData: filteredData,
        filteredTableConfigCols: configCols
      });
      // return configCols;
    }
  };

  render() {
    const { filteredTableConfigCols, filteredTableData } = this.state;

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
          data={filteredTableData}
          columnsConfig={filteredTableConfigCols}
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
