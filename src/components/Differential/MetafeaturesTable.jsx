import React, { Component } from 'react';
import { Popup } from 'semantic-ui-react';
// import _ from 'lodash';
import { formatNumberForDisplay, splitValue } from '../Shared/helpers';
import './MetafeaturesTable.scss';
// import { CancelToken } from 'axios';
// eslint-disable-next-line no-unused-vars
import QHGrid, { EZGrid } from '../utility/dist';

class MetafeaturesTable extends Component {
  state = {
    metafeaturesTableConfigCols: [],
    metafeaturesTableData: [],
    filteredBarcodeData: [],
    itemsPerPageMetafeaturesTable:
      parseInt(localStorage.getItem('itemsPerPageMetafeaturesTable'), 10) || 60,
    additionalTemplateInfo: [],
  };
  metafeaturesGridRef = React.createRef();

  componentDidMount() {
    this.getMetafeaturesTableConfigCols(this.props.metaFeaturesData);
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.metaFeaturesData.length !== 0 &&
      this.props.metaFeaturesData !== prevProps.metaFeaturesData
    ) {
      this.getMetafeaturesTableConfigCols(this.props.metaFeaturesData);
    }
  }

  getMetafeaturesTableConfigCols = data => {
    let configCols = [];
    if (data.length > 0) {
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
      const firstObject = data[0];
      for (let [key, value] of Object.entries(firstObject)) {
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
    });
  };

  // informItemsPerPageMetafeaturesTable = items => {
  //   this.setState({
  //     itemsPerPageMetafeaturesTable: items,
  //   });
  //   localStorage.setItem('itemsPerPageMetafeaturesTable', items);
  // };

  render() {
    const {
      metafeaturesTableConfigCols,
      itemsPerPageMetafeaturesTable,
      metafeaturesTableData,
    } = this.state;

    // const { metaFeaturesData } = this.props;

    return (
      <div className="MetafeaturesTableDiv">
        <EZGrid
          ref={this.metafeaturesGridRef}
          data={metafeaturesTableData}
          columnsConfig={metafeaturesTableConfigCols}
          totalRows={15}
          // use "differentialRows" for itemsPerPage if you want all results. For dev, keep it lower so rendering is faster
          itemsPerPage={itemsPerPageMetafeaturesTable}
          // onInformItemsPerPage={this.informItemsPerPageMetafeaturesTable}
          exportBaseName="Feature Data"
          // quickViews={quickViews}
          disableGeneralSearch
          // disableGrouping
          // disableSort
          disableColumnVisibilityToggle
          disableColumnReorder
          // disableFilters={false}
          min-height="5vh"
          emptyMessage={'No Feature Data Available'}
        />
      </div>
    );
  }
}

export default MetafeaturesTable;
