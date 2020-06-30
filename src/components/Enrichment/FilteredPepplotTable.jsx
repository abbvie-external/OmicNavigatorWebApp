import React, { Component } from 'react';
import { Popup, Dimmer, Loader } from 'semantic-ui-react';
import { phosphoprotService } from '../../services/phosphoprot.service';
import _ from 'lodash';
import { formatNumberForDisplay, splitValue } from '../Shared/helpers';
import phosphosite_icon from '../../resources/phosphosite.ico';
import './FilteredPepplotTable.scss';
import { CancelToken } from 'axios';
import QHGrid from '../utility/QHGrid';
import EZGrid from '../utility/EZGrid';
import QuickViewModal from '../utility/QuickViewModal';
import {
  getFieldValue,
  getField,
  typeMap,
} from '../utility/selectors/QHGridSelector';
// import { data } from 'pdfkit/js/reference';
export * from '../utility/FilterTypeConfig';
export * from '../utility/selectors/quickViewSelector';
export { QHGrid, EZGrid, QuickViewModal };
export { getField, getFieldValue, typeMap };

let cancelRequestFPTGetResultsTable = () => {};
class FilteredPepplotTable extends Component {
  state = {
    filteredTableConfigCols: [],
    filteredTableData: [],
    filteredBarcodeData: [],
    itemsPerPageFilteredPepplotTable: 15,
    filteredTableLoading: true,
    additionalTemplateInfo: [],
    identifier: null,
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
        prevProps.barcodeSettings.brushedData ||
      // this.props.filteredPepplotFeatureIdKey !== prevState.filteredPepplotFeatureIdKey
      this.state.filteredBarcodeData !== prevState.filteredBarcodeData
    ) {
      this.getTableData();
    }

    if (
      this.props.filteredPepplotFeatureIdKey !==
        prevProps.filteredPepplotFeatureIdKey ||
      this.props.HighlightedProteins !== prevProps.HighlightedProteins
    ) {
      const additionalParameters = this.getTableHelpers(
        this.props.HighlightedProteins,
      );
      this.setState({
        additionalTemplateInfo: additionalParameters,
        filteredTableLoading: false,
      });
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
    if (this.filteredPepplotGridRef?.current !== null) {
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
        b => b.featureID,
      );
      let filteredPepplotData = this.state.filteredBarcodeData.filter(d =>
        brushedMultIds.includes(d[this.props.filteredPepplotFeatureIdKey]),
      );
      // for sorting, if desired
      if (filteredPepplotData.length > 0) {
        const statToSort =
          'P.Value' in this.state.filteredBarcodeData[0]
            ? 'P.Value'
            : 'P_Value';
        filteredPepplotData = filteredPepplotData.sort(
          (a, b) => a[statToSort] - b[statToSort],
        );
      }
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
      this.setConfigCols(this.state.filteredBarcodeData, null, true);
    } else {
      const key = this.props.imageInfo.key.split(':');
      const name = key[0].trim() || '';
      cancelRequestFPTGetResultsTable();
      let cancelToken = new CancelToken(e => {
        cancelRequestFPTGetResultsTable = e;
      });
      phosphoprotService
        .getResultsTable(
          this.props.enrichmentStudy,
          this.props.enrichmentModel,
          name,
          undefined,
          cancelToken,
        )
        .then(dataFromService => {
          if (dataFromService.length > 0) {
            // const filteredData = _.intersectionWith(datafFromService, allTickIds, _.isEqual);
            // const diffProtein = this.props.HighlightedProteins.lineID;
            // this.props.onViewDiffTable(name, diffProtein);
            this.setConfigCols(barcodeData, dataFromService, false);
            // return cols;
          }
        })
        .catch(error => {
          console.error('Error during getResultsTable', error);
        });
    }
  };

  setConfigCols = (data, dataFromService, dataAlreadyFiltered) => {
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
    let filteredPepplotAlphanumericFields = [];
    let filteredPepplotNumericFields = [];
    const firstObject = dataFromService[0];
    for (let [key, value] of Object.entries(firstObject)) {
      if (typeof value === 'string' || value instanceof String) {
        filteredPepplotAlphanumericFields.push(key);
      } else {
        filteredPepplotNumericFields.push(key);
      }
    }
    const alphanumericTrigger = filteredPepplotAlphanumericFields[0];
    this.props.onHandlePepplotFeatureIdKey(
      'filteredPepplotFeatureIdKey',
      alphanumericTrigger,
    );
    this.setState({ identifier: alphanumericTrigger });
    if (!dataAlreadyFiltered) {
      const barcodeMultIds = data.map(b => b.featureID);
      data = dataFromService.filter(d =>
        barcodeMultIds.includes(d[alphanumericTrigger]),
      );
    }
    const filteredPepplotAlphanumericColumnsMapped = filteredPepplotAlphanumericFields.map(
      f => {
        return {
          title: f,
          field: f,
          filterable: { type: 'alphanumericFilter' },
          template: (value, item, addParams) => {
            if (f === alphanumericTrigger) {
              return (
                <div className="NoSelect">
                  <Popup
                    trigger={
                      <span className="NoSelect">{splitValue(value)}</span>
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
            } else {
              return (
                <div className="NoSelect">
                  <Popup
                    trigger={
                      <span className="NoSelect">{splitValue(value)}</span>
                    }
                    style={TableValuePopupStyle}
                    className="TablePopupValue"
                    content={value}
                    inverted
                    basic
                  />
                </div>
              );
            }
          },
        };
      },
    );
    const filteredPepplotNumericColumnsMapped = filteredPepplotNumericFields.map(
      c => {
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
      },
    );
    const configCols = filteredPepplotAlphanumericColumnsMapped.concat(
      filteredPepplotNumericColumnsMapped,
    );
    this.setState({
      filteredBarcodeData: data,
      filteredTableConfigCols: configCols,
    });
    this.getTableData();
  };

  getTableHelpers = HighlightedProteins => {
    const { filteredPepplotFeatureIdKey } = this.props;
    const MaxLine = HighlightedProteins[0] || null;
    let addParams = {};
    addParams.elementId = filteredPepplotFeatureIdKey;
    if (MaxLine !== {} && MaxLine != null) {
      addParams.rowHighlightMax = MaxLine.featureID;
      // addParams.rowHighlightMax = MaxLine[filteredPepplotFeatureIdKey];
    }
    const SelectedProteins = HighlightedProteins.slice(1);
    if (SelectedProteins.length > 0 && SelectedProteins != null) {
      addParams.rowHighlightOther = [];
      SelectedProteins.forEach(element => {
        addParams.rowHighlightOther.push(element.featureID);
      });
    }
    addParams.showPhosphositePlus = dataItem => {
      let protein = dataItem.symbol
        ? dataItem.symbol
        : dataItem[filteredPepplotFeatureIdKey];
      return function() {
        const param = {
          proteinNames: protein,
          queryId: -1,
          from: 0,
        };
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
    const { identifier } = this.state;
    const { filteredPepplotFeatureIdKey } = this.props;
    const PreviouslyHighlighted = this.props.HighlightedProteins;
    // const stat = barcodeSettings.statLabel;
    event.stopPropagation();
    if (event.shiftKey) {
      const allTableData = _.cloneDeep(this.state.filteredTableData);
      const indexMaxProtein = _.findIndex(allTableData, function(d) {
        return (
          d[filteredPepplotFeatureIdKey] === PreviouslyHighlighted[0]?.featureID
        );
      });
      const sliceFirst = index < indexMaxProtein ? index : indexMaxProtein;
      const sliceLast = index > indexMaxProtein ? index : indexMaxProtein;
      const shiftedTableData = allTableData.slice(sliceFirst, sliceLast + 1);
      const shiftedTableDataArray = shiftedTableData.map(function(d) {
        return {
          // sample: d.symbol,
          // sample: d.phosphosite,
          featureID: d[filteredPepplotFeatureIdKey],
          key: d[identifier],
          // PAUL - this needs adjustment, looking for d.abs(t) instead of d.T, for example
          // cpm: d[stat],
          // cpm: d.F == null ? d.t : d.F,
        };
      });
      this.props.onHandleProteinSelected(shiftedTableDataArray);
    } else if (event.ctrlKey) {
      const allTableData = _.cloneDeep(this.state.filteredTableData);
      let selectedTableDataArray = [];

      const ctrlClickedObj = allTableData[index];
      const alreadyHighlighted = PreviouslyHighlighted.some(
        d => d.featureID === ctrlClickedObj[filteredPepplotFeatureIdKey],
      );
      // already highlighted, remove it from array
      if (alreadyHighlighted) {
        selectedTableDataArray = PreviouslyHighlighted.filter(
          i => i.featureID !== ctrlClickedObj[filteredPepplotFeatureIdKey],
        );
        this.props.onHandleProteinSelected(selectedTableDataArray);
      } else {
        // not yet highlighted, add it to array
        const indexMaxProtein = _.findIndex(allTableData, function(d) {
          return (
            d[filteredPepplotFeatureIdKey] === PreviouslyHighlighted[0]?.id.mult
          );
        });
        // map protein to fix obj entries
        const mappedProtein = {
          // sample: ctrlClickedObj.phosphosite,
          featureID: ctrlClickedObj[filteredPepplotFeatureIdKey],
          key: ctrlClickedObj[identifier],
          // PAUL
          // cpm: ctrlClickedObj[stat],
          // cpm: ctrlClickedObj.F == null ? ctrlClickedObj.t : ctrlClickedObj.F,
        };
        const lowerIndexThanMax = index < indexMaxProtein ? true : false;
        if (lowerIndexThanMax) {
          // add to beginning of array if max
          PreviouslyHighlighted.unshift(mappedProtein);
        } else {
          // just add to array if not max
          PreviouslyHighlighted.push(mappedProtein);
        }
        selectedTableDataArray = [...PreviouslyHighlighted];
        this.props.onHandleProteinSelected(selectedTableDataArray);
      }
    } else {
      this.props.onHandleProteinSelected([
        {
          // sample: item.Protein_Site, //lineID,
          // featureID: item.featureID,
          // cpm: item.logFC, //statistic,
          // sample: item.phosphosite,
          featureID: item[filteredPepplotFeatureIdKey],
          key: item[identifier],
          // cpm: item[stat],
          // cpm: item.F === undefined ? item.t : item.F,
        },
      ]);
    }
  };

  render() {
    const {
      filteredTableConfigCols,
      filteredTableData,
      itemsPerPageFilteredPepplotTable,
      filteredTableLoading,
    } = this.state;

    if (!filteredTableLoading) {
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
            additionalTemplateInfo={this.state.additionalTemplateInfo}
            // headerAttributes={<ButtonActions />}
            onRowClick={this.handleRowClick}
          />
        </div>
      );
    } else {
      return (
        <div className="TableLoadingDiv">
          <Dimmer active inverted>
            <Loader size="large">Table Loading</Loader>
          </Dimmer>
        </div>
      );
    }
  }
}

export default FilteredPepplotTable;
