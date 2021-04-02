import React, { Component } from 'react';
import { Popup, Dimmer, Loader } from 'semantic-ui-react';
import { omicNavigatorService } from '../../services/omicNavigator.service';
import _ from 'lodash';
import { formatNumberForDisplay, splitValue } from '../Shared/helpers';
import './FilteredDifferentialTable.scss';
import { CancelToken } from 'axios';
import CustomEmptyMessage from '../Shared/Templates';
// eslint-disable-next-line no-unused-vars
import QHGrid, { EZGrid } from '../Shared/QHGrid';

let cancelRequestFPTGetResultsTable = () => {};
class FilteredDifferentialTable extends Component {
  state = {
    filteredTableConfigCols: [],
    filteredTableData: [],
    filteredBarcodeData: [],
    itemsPerPageFilteredDifferentialTable:
      parseInt(
        localStorage.getItem('itemsPerPageFilteredDifferentialTable'),
        10,
      ) || 10,
    filteredTableLoading: false,
    additionalTemplateInfo: [],
    identifier: null,
    filteredDifferentialTableRowMax: [],
    filteredDifferentialTableRowOther: [],
    rowClicked: false,
  };
  filteredDifferentialGridRef = React.createRef();

  componentDidMount() {
    this.getFilteredTableConfigCols(this.props.barcodeSettings.barcodeData);
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.barcodeSettings.brushedData !==
        prevProps.barcodeSettings.brushedData ||
      !_.isEqual(
        _.sortBy(this.state.filteredBarcodeData),
        _.sortBy(prevState.filteredBarcodeData),
      )

      // this.state.filteredBarcodeData !== prevState.filteredBarcodeData
    ) {
      this.getTableData();
    }

    if (
      this.props.filteredDifferentialFeatureIdKey !==
      prevProps.filteredDifferentialFeatureIdKey
    ) {
      this.setState({
        additionalTemplateInfo: {},
        filteredTableLoading: false,
      });
    }

    if (this.props.HighlightedProteins !== prevProps.HighlightedProteins) {
      this.highlightRows(this.props.HighlightedProteins, this.state.rowClicked);
    }
  }

  pageToFeature = featureToHighlight => {
    if (
      featureToHighlight !== '' &&
      featureToHighlight !== [] &&
      featureToHighlight !== null
    ) {
      const {
        filteredDifferentialFeatureIdKey,
        // differentialResults
      } = this.props;
      const { itemsPerPageFilteredDifferentialTable } = this.state;
      const sortedData =
        this.props.filteredDifferentialGridRef.current?.qhGridRef.current?.getSortedData() ||
        [];
      if (sortedData != null) {
        const Index = _.findIndex(sortedData, function(p) {
          return p[filteredDifferentialFeatureIdKey] === featureToHighlight;
        });
        const pageNumber = Math.ceil(
          (Index + 1) / itemsPerPageFilteredDifferentialTable,
        );
        if (pageNumber > 0) {
          this.props.filteredDifferentialGridRef.current.handlePageChange(
            pageNumber,
          );
          // scrollElement(this, 'filteredDifferentialGridRef', 'rowHighlightMax');
        }
      }
    } else {
      this.props.filteredDifferentialGridRef.current.handlePageChange(1);
    }
  };

  getTableData = () => {
    if (this.props.barcodeSettings.brushedData.length > 0) {
      const brushedMultIds = this.props.barcodeSettings.brushedData.map(
        b => b.featureID,
      );
      let filteredDifferentialData = this.state.filteredBarcodeData.filter(d =>
        brushedMultIds.includes(d[this.props.filteredDifferentialFeatureIdKey]),
      );
      // for sorting, if desired
      if (filteredDifferentialData.length > 0) {
        const statToSort =
          'P.Value' in this.state.filteredBarcodeData[0]
            ? 'P.Value'
            : 'P_Value';
        filteredDifferentialData = filteredDifferentialData.sort(
          (a, b) => a[statToSort] - b[statToSort],
        );
      }
      this.setState({
        filteredTableData: filteredDifferentialData,
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
      const key = this.props.imageInfoEnrichment.key.split(':');
      const name = key[0].trim() || '';
      cancelRequestFPTGetResultsTable();
      let cancelToken = new CancelToken(e => {
        cancelRequestFPTGetResultsTable = e;
      });
      omicNavigatorService
        .getResultsTable(
          this.props.enrichmentStudy,
          this.props.enrichmentModel,
          name,
          null,
          cancelToken,
        )
        .then(dataFromService => {
          if (dataFromService.length > 0) {
            this.setConfigCols(barcodeData, dataFromService, false);
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
    let filteredDifferentialAlphanumericFields = [];
    let filteredDifferentialNumericFields = [];
    const firstObject = dataFromService[0];
    for (let [key, value] of Object.entries(firstObject)) {
      if (typeof value === 'string' || value instanceof String) {
        filteredDifferentialAlphanumericFields.push(key);
      } else {
        filteredDifferentialNumericFields.push(key);
      }
    }
    const alphanumericTrigger = filteredDifferentialAlphanumericFields[0];
    this.props.onHandleDifferentialFeatureIdKey(
      'filteredDifferentialFeatureIdKey',
      alphanumericTrigger,
    );
    this.setState({ identifier: alphanumericTrigger });
    if (!dataAlreadyFiltered) {
      const barcodeMultIds = data.map(b => b.featureID);
      data = dataFromService.filter(d =>
        barcodeMultIds.includes(d[alphanumericTrigger]),
      );
    }
    const filteredDifferentialAlphanumericColumnsMapped = filteredDifferentialAlphanumericFields.map(
      f => {
        return {
          title: f,
          field: f,
          filterable: { type: 'multiFilter' },
          template: value => {
            if (f === alphanumericTrigger) {
              return (
                <div className="NoSelect">
                  <Popup
                    trigger={<span className="">{splitValue(value)}</span>}
                    style={TableValuePopupStyle}
                    className="TablePopupValue"
                    content={value}
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
    const filteredDifferentialNumericColumnsMapped = filteredDifferentialNumericFields.map(
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
    const configCols = filteredDifferentialAlphanumericColumnsMapped.concat(
      filteredDifferentialNumericColumnsMapped,
    );
    this.setState({
      filteredBarcodeData: data,
      filteredTableConfigCols: configCols,
    });
    this.getTableData();
  };

  rowLevelPropsCalc = item => {
    let className;
    const {
      filteredDifferentialTableRowMax,
      filteredDifferentialTableRowOther,
    } = this.state;
    const { filteredDifferentialFeatureIdKey } = this.props;
    /* eslint-disable eqeqeq */
    if (
      item[filteredDifferentialFeatureIdKey] === filteredDifferentialTableRowMax
    ) {
      className = 'rowHighlightMax';
    }

    if (
      filteredDifferentialTableRowOther.includes(
        item[filteredDifferentialFeatureIdKey],
      )
    ) {
      className = 'rowHighlightOther';
    }
    return {
      className,
    };
  };

  highlightRows = (HighlightedProteins, rowClicked) => {
    const MaxLine = HighlightedProteins[0] || null;
    let filteredDifferentialTableRowMaxVar = [];
    if (MaxLine !== {} && MaxLine != null) {
      filteredDifferentialTableRowMaxVar = MaxLine.featureID;
    }
    const HighlightedProteinsCopy = [...HighlightedProteins];
    const SelectedProteins = HighlightedProteinsCopy.slice(1);
    let filteredDifferentialTableRowOtherVar = [];
    if (SelectedProteins.length > 0 && SelectedProteins != null) {
      SelectedProteins.forEach(element => {
        filteredDifferentialTableRowOtherVar.push(element.featureID);
      });
    }
    this.setState({
      filteredDifferentialTableRowMax: filteredDifferentialTableRowMaxVar,
      filteredDifferentialTableRowOther: filteredDifferentialTableRowOtherVar,
    });
    if (!rowClicked) {
      this.pageToFeature(filteredDifferentialTableRowMaxVar);
    }
    this.setState({ rowClicked: false });
  };

  handleItemsPerPageChange = items => {
    this.setState({
      itemsPerPageFilteredDifferentialTable: items,
    });
    localStorage.setItem('itemsPerPageFilteredDifferentialTable', items);
  };

  handleRowClick = (event, item, index) => {
    this.setState({ rowClicked: true });
    if (item !== null && event?.target?.className !== 'ExternalSiteIcon') {
      const { filteredDifferentialFeatureIdKey } = this.props;
      event.stopPropagation();
      const PreviouslyHighlighted = [...this.props.HighlightedProteins];
      if (event.shiftKey) {
        const allTableData =
          this.props.filteredDifferentialGridRef.current?.qhGridRef.current?.getSortedData() ||
          [];
        const indexMaxProtein = _.findIndex(allTableData, function(d) {
          return (
            d[filteredDifferentialFeatureIdKey] ===
            PreviouslyHighlighted[0]?.featureID
          );
        });
        const sliceFirst = index < indexMaxProtein ? index : indexMaxProtein;
        const sliceLast = index > indexMaxProtein ? index : indexMaxProtein;
        const shiftedTableData = allTableData.slice(sliceFirst, sliceLast + 1);
        const shiftedTableDataArray = shiftedTableData.map(function(d) {
          return {
            // sample: d.symbol,
            // sample: d.phosphosite,
            featureID: d[filteredDifferentialFeatureIdKey],
            key: d[filteredDifferentialFeatureIdKey],
            // PAUL - this needs adjustment, looking for d.abs(t) instead of d.T, for example
            // cpm: d[stat],
            // cpm: d.F == null ? d.t : d.F,
          };
        });
        this.props.onHandleProteinSelected(shiftedTableDataArray);
      } else if (event.ctrlKey) {
        const allTableData =
          this.props.filteredDifferentialGridRef.current?.qhGridRef.current?.getSortedData() ||
          [];
        let selectedTableDataArray = [];

        const alreadyHighlighted = PreviouslyHighlighted.some(
          d => d.featureID === item[filteredDifferentialFeatureIdKey],
        );
        // already highlighted, remove it from array
        if (alreadyHighlighted) {
          selectedTableDataArray = PreviouslyHighlighted.filter(
            i => i.featureID !== item[filteredDifferentialFeatureIdKey],
          );
          this.props.onHandleProteinSelected(selectedTableDataArray);
        } else {
          // not yet highlighted, add it to array
          const indexMaxProtein = _.findIndex(allTableData, function(d) {
            return (
              d[filteredDifferentialFeatureIdKey] ===
              PreviouslyHighlighted[0]?.featureID
            );
          });
          // map protein to fix obj entries
          const mappedProtein = {
            // sample: ctrlClickedObj.phosphosite,
            featureID: item[filteredDifferentialFeatureIdKey],
            key: item[filteredDifferentialFeatureIdKey],
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
            featureID: item[filteredDifferentialFeatureIdKey],
            key: item[filteredDifferentialFeatureIdKey],
            // cpm: item[stat],
            // cpm: item.F === undefined ? item.t : item.F,
          },
        ]);
      }
    }
  };

  render() {
    const {
      filteredTableConfigCols,
      filteredTableData,
      itemsPerPageFilteredDifferentialTable,
      filteredTableLoading,
      additionalTemplateInfo,
    } = this.state;

    if (!filteredTableLoading) {
      return (
        <div className="FilteredDifferentialTableDiv">
          <EZGrid
            ref={this.props.filteredDifferentialGridRef}
            data={filteredTableData}
            columnsConfig={filteredTableConfigCols}
            totalRows={15}
            // use "differentialRows" for itemsPerPage if you want all results. For dev, keep it lower so rendering is faster
            itemsPerPage={itemsPerPageFilteredDifferentialTable}
            onItemsPerPageChange={this.handleItemsPerPageChange}
            // exportBaseName="Differential_Analysis_Filtered"
            // quickViews={quickViews}
            // disableGeneralSearch
            disableGrouping
            // disableSort
            disableColumnVisibilityToggle
            disableColumnReorder
            // disableFilters={false}
            min-height="5vh"
            height="auto"
            additionalTemplateInfo={additionalTemplateInfo}
            onRowClick={this.handleRowClick}
            rowLevelPropsCalc={this.rowLevelPropsCalc}
            emptyMessage={CustomEmptyMessage}
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

export default FilteredDifferentialTable;
