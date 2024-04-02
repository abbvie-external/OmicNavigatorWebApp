import React, { Component } from 'react';
import { Popup } from 'semantic-ui-react';
// import _ from 'lodash-es';
import {
  isNotNANullUndefinedEmptyStringInf,
  formatNumberForDisplay,
  splitValue,
} from '../Shared/helpers';
import './MetafeaturesTable.scss';
import { omicNavigatorService } from '../../services/omicNavigator.service';
// import { CancelToken } from 'axios';
// eslint-disable-next-line no-unused-vars
import { EZGrid } from '../Shared/QHGrid/index.module.js';

class MetafeaturesTableDynamic extends Component {
  state = {
    metafeaturesTableConfigCols: [],
    metafeaturesTableData: [],
    itemsPerPageMetafeaturesTable:
      parseInt(localStorage.getItem('itemsPerPageMetafeaturesTable'), 10) || 60,
    additionalTemplateInfo: [],
    metafeaturesLoaded: false,
  };

  componentDidMount() {
    const isMultifeaturePlot =
      this.props.plotSingleFeatureData.key?.includes('features') || false;
    if (
      this.props.modelSpecificMetaFeaturesExist !== false &&
      !isMultifeaturePlot
    ) {
      this.getMetafeaturesDataDynamic();
    }
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.plotSingleFeatureData.key !==
      this.props.plotSingleFeatureData.key
    ) {
      this.getMetafeaturesDataDynamic();
    }
  }

  // componentWillUnmount() {
  //   this.setState({
  //     metafeaturesTableConfigCols: [],
  //     metafeaturesTableData: [],
  //     metafeaturesLoaded: false,
  //   });
  // }

  async getMetafeaturesDataDynamic() {
    const cachedMetafeaturesData = JSON.parse(
      sessionStorage.getItem(
        `MetafeaturesData-${this.props.plotSingleFeatureData.key}`,
      ),
    );
    if (!cachedMetafeaturesData && this.props.plotSingleFeatureData?.key) {
      try {
        const data = await omicNavigatorService.getMetaFeaturesTable(
          this.props.differentialStudy,
          this.props.differentialModel,
          this.props.plotSingleFeatureData.key,
          null,
        );
        let metaFeaturesDataVolcano = data != null ? data : [];
        sessionStorage.setItem(
          `MetafeaturesData-${this.props.plotSingleFeatureData.key}`,
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

  getMetafeaturesTableConfigCols = (data) => {
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
      if (data.length < 1) return;
      // grab first object
      const firstFullObject = data.length > 0 ? [...data][0] : null;
      // if exists, loop through the values of each property,
      // find the first real value,
      // and set the config column types
      if (firstFullObject) {
        let allProperties = Object.keys(firstFullObject);
        const dataCopy = [...data];
        allProperties.forEach((property) => {
          // loop through data, one property at a time
          const notNullObject = dataCopy.find((row) => {
            // find the first value for that property
            return isNotNANullUndefinedEmptyStringInf(row[property]);
          });
          let notNullValue = null;
          if (notNullObject) {
            notNullValue = notNullObject[property] || null;
            // if the property has a value somewhere in the data
            if (
              typeof notNullValue === 'string' ||
              notNullValue instanceof String
            ) {
              // push it to the appropriate field type
              metafeaturesAlphanumericFields.push(property);
            } else {
              metafeaturesNumericFields.push(property);
            }
          } else {
            // otherwise push it to type string
            metafeaturesAlphanumericFields.push(property);
          }
        });
      }
      const metafeaturesAlphanumericColumnsMapped =
        metafeaturesAlphanumericFields.map((f) => {
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
        });
      const metafeaturesNumericColumnsMapped = metafeaturesNumericFields.map(
        (c) => {
          return {
            title: c,
            field: c,
            type: 'number',
            filterable: { type: 'numericFilter' },
            exportTemplate: (value) => (value ? `${value}` : 'N/A'),
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
      this.setState({
        metafeaturesTableConfigCols: configCols,
        metafeaturesTableData: data,
        metafeaturesLoaded: true,
      });
    }
  };

  handleItemsPerPageChange = (items) => {
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
    const ratio = this.props.upperPlotsHeight / window.screen.height;
    const ratioVh = ratio * 100;
    const ratioVhRound = Math.round(ratioVh) - 20;
    const ratioVhString = `${ratioVhRound}vh`;
    console.log(ratioVhString);
    // const { metaFeaturesData } = this.props;
    return (
      <div className="MetafeaturesTableDiv" id="MetafeaturesTableDynamicDiv">
        <EZGrid
          ref={this.props.metafeaturesTableDynamicRef}
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
          height={ratioVhString}
          emptyMessage={'No Feature Data Available'}
          disableQuickViewEditing
          disableQuickViewMenu
        />
      </div>
    );
  }
}

export default React.forwardRef((props, ref) => (
  <MetafeaturesTableDynamic {...props} metafeaturesTableDynamicRef={ref} />
));
