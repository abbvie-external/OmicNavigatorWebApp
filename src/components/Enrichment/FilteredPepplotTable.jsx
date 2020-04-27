import React, { Component } from 'react';
import { Popup } from 'semantic-ui-react';
import { phosphoprotService } from '../../services/phosphoprot.service';
import _ from 'lodash';
import { formatNumberForDisplay, splitValue } from '../Shared/helpers';
import phosphosite_icon from '../../resources/phosphosite.ico';
import './FilteredPepplotTable.scss';

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

class FilteredPepplotTable extends Component {
  state = {
    filteredTableConfigCols: [],
    filteredTableData: [],
    filteredBarcodeData: [],
    itemsPerPageFilteredPepplotTable: 15,
  };
  filteredPepplotGridRef = React.createRef();

  componentDidMount() {
    this.getFilteredTableConfigCols(this.props.barcodeSettings.barcodeData);
    // if (
    //   this.props.tab === 'enrichment' &&
    //   this.props.HighlightedProteins !== '' &&
    //   this.props.HighlightedProteins != null
    // ) {
    //   this.pageToProtein(
    //     this.props.barcodeSettings.brushedData,
    //     this.props.HighlightedProteins,
    //     this.state.itemsPerPageFilteredPepplotTable,
    //   );
    // }
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.barcodeSettings.brushedData !==
      prevProps.barcodeSettings.brushedData
    ) {
      this.getTableData();
    }
    if (this.state.filteredBarcodeData !== prevState.filteredBarcodeData) {
      this.getTableData();
    }
    // let prevValues = prevProps?.barcodeSettings?.brushedData ?? [];
    // let currentValues = this.props.barcodeSettings?.brushedData ?? [];
    // var isSame =
    //   prevValues.length === currentValues.length &&
    //   prevValues.every(
    //     (o, i) =>
    //       Object.keys(o).length === Object.keys(currentValues[i]).length &&
    //       Object.keys(o).every(k => o[k] === currentValues[i][k]),
    //   );
    // if (!isSame) {
    //   this.getTableData();
    // }
    //if (
    // this.props.tab === 'enrichment' &&
    // this.props.HighlightedProteins.sample !== '' &&
    // this.props.HighlightedProteins.sample != null &&
    // (
    // this.props.HighlightedProteins.sample !== prevProps.HighlightedProteins.sample
    // this.props.filteredTableData !== prevProps.filteredTableData)
    // ) {
    //   this.pageToProtein(
    //     this.state.filteredTableData,
    //     this.props.HighlightedProteins.sample,
    //     this.state.itemsPerPageFilteredPepplotTable,
    //   );
    //}
    if (
      this.props.activeViolinTableIndex === 1 &&
      this.props.activeViolinTableIndex !== prevProps.activeViolinTableIndex
    ) {
      this.pageToProtein(
        this.state.filteredTableData,
        this.props.HighlightedProteins[0]?.sample,
        this.state.itemsPerPageFilteredPepplotTable,
      );
    }
  }

  pageToProtein = (data, proteinToHighlight, itemsPerPage) => {
    if (this.filteredPepplotGridRef.current !== null) {
      const Index = _.findIndex(data, function(p) {
        return p.Protein_Site === proteinToHighlight;
      });
      const pageNumber = Math.ceil(Index / itemsPerPage);
      const pageNumberCheck = pageNumber >= 1 ? pageNumber : 1;
      this.filteredPepplotGridRef.current.handlePageChange(
        {},
        { activePage: pageNumberCheck },
      );
    }
  };

  getTableData = () => {
    if (this.props.barcodeSettings.brushedData.length > 0) {
      const brushedMultIds = this.props.barcodeSettings.brushedData.map(
        b => b.id_mult,
      );
      const filteredPepplotData = this.state.filteredBarcodeData.filter(d =>
        brushedMultIds.includes(d.id_mult),
      );
      this.setState({
        filteredTableData: filteredPepplotData,
      });
    } else {
      this.setState({
        filteredTableData: [],
      });
    }
  };

  getFilteredTableConfigCols = barcodeData => {
    if (this.state.filteredBarcodeData.length > 0) {
      this.setConfigCols(this.state.filteredBarcodeData);
    } else {
      const key = this.props.imageInfo.key.split(':');
      const name = key[0].trim() || '';
      phosphoprotService
        .getTestData(
          this.props.enrichmentModel,
          name,
          this.props.enrichmentStudy + 'plots',
        )
        .then(dataFromService => {
          if (dataFromService.length > 0) {
            const barcodeMultIds = barcodeData.map(b => b.id_mult);
            const filteredData = dataFromService.filter(d =>
              barcodeMultIds.includes(d.id_mult),
            );
            // const filteredData = _.intersectionWith(datafFromService, allTickIds, _.isEqual);
            // const diffProtein = this.props.HighlightedProteins.lineID;
            // this.props.onViewDiffTable(name, diffProtein);
            this.setConfigCols(filteredData);
            // return cols;
          }
        });
    }
  };

  setConfigCols = filteredData => {
    let self = this;
    const model = this.props.enrichmentModel;
    let initConfigCols = [];

    const TableValuePopupStyle = {
      backgroundColor: '2E2E2E',
      borderBottom: '2px solid var(--color-primary)',
      color: '#FFF',
      padding: '1em',
      maxWidth: '50vw',
      fontSize: '13px',
      wordBreak: 'break-all',
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
              <div className="NoSelect">
                <Popup
                  trigger={
                    <span
                    // className="TableCellLink"
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
                      onClick={addParams.showPhosphositePlus(item)}
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
          },
        },
        {
          title: 'MajorityProteinIDs',
          field: 'MajorityProteinIDs',
          filterable: { type: 'alphanumericFilter' },
          template: (value, item, addParams) => {
            return (
              <Popup
                trigger={
                  <span className="TableValue NoSelect">
                    {splitValue(value)}
                  </span>
                }
                content={value}
                style={TableValuePopupStyle}
                className="TablePopupValue"
                inverted
                basic
              />
            );
          },
        },
      ];
    } else {
      initConfigCols = [
        {
          title: 'Protein_Site',
          field: 'Protein_Site',
          filterable: { type: 'alphanumericFilter' },
          template: (value, item, addParams) => {
            return (
              <div className="NoSelect">
                <Popup
                  trigger={
                    <span
                    // className="TableCellLink"
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
                      onClick={addParams.showPhosphositePlus(item)}
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
          },
        },
      ];
    }
    let relevantConfigCols = [
      'F',
      'logFC',
      't',
      'P_Value',
      'adj_P_Val',
      'adjPVal',
    ];
    if (filteredData.length !== 0 && filteredData.length !== undefined) {
      let orderedTestData = JSON.parse(
        JSON.stringify(filteredData[0], relevantConfigCols),
      );

      let relevantConfigColumns = _.map(
        _.filter(_.keys(orderedTestData), function(d) {
          return _.includes(relevantConfigCols, d);
        }),
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
                    <span className="TableValue NoSelect">
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
          },
        };
      });
      const configCols = initConfigCols.concat(additionalConfigColumns);
      self.setState({
        filteredBarcodeData: filteredData,
        filteredTableConfigCols: configCols,
      });
      this.getTableData();
    }
  };

  getTableHelpers = HighlightedProteins => {
    const MaxLine = this.props.HighlightedProteins[0];
    // const HighlightedProteins = this.props.HighlightedProteins.slice(1);
    let addParams = {};
    if (MaxLine !== {} && MaxLine != null) {
      addParams.rowHighlightMax = MaxLine.sample;
    }
    // if (HighlightedProteins !== []) {
    //   HighlightedProteins?.forEach(element => {
    //     addParams.rowHightlightOther = element.lineId;
    //   });
    //}
    addParams.showPhosphositePlus = dataItem => {
      return function() {
        var protein = (dataItem.Protein
          ? dataItem.Protein
          : dataItem.MajorityProteinIDsHGNC
        ).split(';')[0];
        let param = { proteinNames: protein, queryId: -1, from: 0 };
        phosphoprotService.postToPhosphositePlus(
          param,
          'https://www.phosphosite.org/proteinSearchSubmitAction.action',
        );
      };
    };
    return addParams;
  };

  informItemsPerPage = items => {
    this.setState({
      itemsPerPageFilteredPepplotTable: items,
    });
  };

  handleRowClick = (event, item, index) => {
    let self = this;
    event.stopPropagation();
    if (event.shiftKey) {
      const allTableData = this.state.filteredTableData;
      const alreadySelectedIndex = _.findIndex(allTableData, function(d) {
        return d.Protein_Site === self.props.HighlightedProteins[0]?.sample;
      });
      const lowerIndex =
        index < alreadySelectedIndex ? index : alreadySelectedIndex;
      const higherIndex =
        index > alreadySelectedIndex ? index : alreadySelectedIndex;
      const selectedTableData = allTableData.slice(lowerIndex, higherIndex + 1);
      const selectedTableDataArray = selectedTableData.map(function(d) {
        return {
          sample: d.Protein_Site,
          id_mult: d.id_mult,
          cpm: d.F === undefined ? d.t : d.F,
        };
      });
      this.props.onHandleProteinSelected(selectedTableDataArray);
      // console.log('shift');
      // document.addEventListener('onkeydown', event => {
      //   console.log('keydown');
      //   console.log(event.code);
      // });
    } else if (event.ctrlKey) {
      console.log('control');
    } else {
      console.log('click');
      this.props.onHandleProteinSelected([
        {
          sample: item.Protein_Site, //lineID,
          id_mult: item.id_mult,
          cpm: item.logFC, //statistic,
        },
      ]);
    }
  };

  render() {
    const { HighlightedProteins } = this.props;
    const {
      filteredTableConfigCols,
      filteredTableData,
      itemsPerPageFilteredPepplotTable,
    } = this.state;
    // const quickViews = [];
    const additionalTemplateInfo = this.getTableHelpers(HighlightedProteins);

    return (
      <div className="FilteredPepplotTableDiv">
        <EZGrid
          ref={this.filteredPepplotGridRef}
          onInformItemsPerPage={this.informItemsPerPage}
          // uniqueCacheKey={pepplotCacheKey}
          data={filteredTableData}
          columnsConfig={filteredTableConfigCols}
          totalRows={15}
          // use "pepplotRows" for itemsPerPage if you want all results. For dev, keep it lower so rendering is faster
          itemsPerPage={itemsPerPageFilteredPepplotTable}
          exportBaseName="Differential_Phosphorylation_Analysis_Filtered"
          // quickViews={quickViews}
          // disableGeneralSearch
          disableGrouping
          // disableSort
          disableColumnVisibilityToggle
          // disableFilters={false}
          min-height="5vh"
          additionalTemplateInfo={additionalTemplateInfo}
          // headerAttributes={<ButtonActions />}
          onRowClick={this.handleRowClick}
        />
      </div>
    );
  }
}

export default FilteredPepplotTable;
