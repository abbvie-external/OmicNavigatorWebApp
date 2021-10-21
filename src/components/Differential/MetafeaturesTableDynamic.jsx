import React, { Component } from 'react';
import { Popup } from 'semantic-ui-react';
// import _ from 'lodash';
import { formatNumberForDisplay, splitValue } from '../Shared/helpers';
import './MetafeaturesTable.scss';
import { omicNavigatorService } from '../../services/omicNavigator.service';
// import { CancelToken } from 'axios';
// eslint-disable-next-line no-unused-vars
import QHGrid, { EZGrid } from '../Shared/QHGrid';

class MetafeaturesTableDynamic extends Component {
  state = {
    metafeaturesTableConfigCols: [],
    metafeaturesTableData: [],
    filteredBarcodeData: [],
    itemsPerPageMetafeaturesTable:
      parseInt(localStorage.getItem('itemsPerPageMetafeaturesTable'), 10) || 60,
    additionalTemplateInfo: [],
    metafeaturesLoaded: false,
  };
  metafeaturesGridRef = React.createRef();

  componentDidMount() {
    const isMultifeaturePlot =
      this.props.imageInfoVolcano.key?.includes('features') || false;
    if (
      this.props.modelSpecificMetaFeaturesExist !== false &&
      !isMultifeaturePlot
    ) {
      this.getMetafeaturesDataDynamic();
    }
  }

  async getMetafeaturesDataDynamic() {
    const cachedMetafeaturesData = JSON.parse(
      sessionStorage.getItem(
        `MetafeaturesData-${this.props.imageInfoVolcano.key}`,
      ),
    );
    if (!cachedMetafeaturesData) {
      try {
        const data = await omicNavigatorService.getMetaFeaturesTable(
          this.props.differentialStudy,
          this.props.differentialModel,
          this.props.imageInfoVolcano.key,
          null,
        );
        let metaFeaturesDataVolcano = data != null ? data : [];
        sessionStorage.setItem(
          `MetafeaturesData-${this.props.imageInfoVolcano.key}`,
          JSON.stringify(metaFeaturesDataVolcano),
        );
        this.getMetafeaturesTableConfigCols(metaFeaturesDataVolcano);
      } catch (error) {
        throw error;
      }
    } else {
      this.getMetafeaturesTableConfigCols(cachedMetafeaturesData);
    }
  }

  async getMetafeaturesTableConfigCols(data) {
    let configCols = [];
    if (data?.length > 0) {
      const TableValuePopupStyle = {
        backgroundColor: '2E2E2E',
        borderBottom: '2px solid var(--color-primary)',
        color: '#FFF',
        padding: '1em',
        maxWidth: '50vw',
        fontSize: '13px',
        wordBreak: 'break-all',
      };
      let metafeaturesAlphanumericFields = [];
      let metafeaturesNumericFields = [];
      function isNotNANorNullNorUndefined(o) {
        return typeof o !== 'undefined' && o !== null && o !== 'NA';
      }
      function everyIsNotNANorNullNorUndefined(arr) {
        return arr.every(isNotNANorNullNorUndefined);
      }
      const objectValuesArr = [...data].map(f => Object.values(f));
      const firstFullObjectIndex = objectValuesArr.findIndex(
        everyIsNotNANorNullNorUndefined,
      );
      const firstFullObject = data[firstFullObjectIndex];
      for (let [key, value] of Object.entries(firstFullObject)) {
        if (typeof value === 'string' || value instanceof String) {
          metafeaturesAlphanumericFields.push(key);
        } else {
          metafeaturesNumericFields.push(key);
        }
      }
      const metafeaturesAlphanumericColumnsMapped = metafeaturesAlphanumericFields.map(
        f => {
          return {
            title: f,
            field: f,
            filterable: { type: 'multiFilter' },
            template: (value, item, addParams) => {
              return (
                <div className="">
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
            },
          };
        },
      );
      const metafeaturesNumericColumnsMapped = metafeaturesNumericFields.map(
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
            },
          };
        },
      );
      configCols = metafeaturesAlphanumericColumnsMapped.concat(
        metafeaturesNumericColumnsMapped,
      );
    }
    this.setState({
      metafeaturesTableConfigCols: configCols,
      metafeaturesTableData: data,
      metafeaturesLoaded: true,
    });
  }

  handleItemsPerPageChange = items => {
    this.setState({
      itemsPerPageMetafeaturesTable: items,
    });
    localStorage.setItem('itemsPerPageMetafeaturesTable', items);
  };

  render() {
    const {
      metafeaturesTableConfigCols,
      itemsPerPageMetafeaturesTable,
      metafeaturesTableData,
      metafeaturesLoaded,
    } = this.state;

    // const { metaFeaturesData } = this.props;
    return (
      <div className="MetafeaturesTableDiv">
        <EZGrid
          ref={this.metafeaturesGridRef}
          data={metafeaturesTableData}
          columnsConfig={metafeaturesTableConfigCols}
          totalRows={15}
          loading={!metafeaturesLoaded}
          // use "differentialRows" for itemsPerPage if you want all results. For dev, keep it lower so rendering is faster
          itemsPerPage={itemsPerPageMetafeaturesTable}
          onItemsPerPageChange={this.handleItemsPerPageChange}
          // exportBaseName="Feature Data"
          // quickViews={quickViews}
          // disableGeneralSearch
          // disableGrouping
          // disableSort
          disableColumnVisibilityToggle
          disableColumnReorder
          // disableFilters={false}
          min-height="5vh"
          emptyMessage={'No Feature Data Available'}
          disableQuickViewEditing
          disableQuickViewMenu
        />
      </div>
    );
  }
}

export default MetafeaturesTableDynamic;
