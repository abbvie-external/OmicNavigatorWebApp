import React, { Component } from 'react';
import { Grid, Popup } from 'semantic-ui-react';
import PepplotSearchCriteria from './PepplotSearchCriteria';
import PepplotResults from './PepplotResults';
import SearchPrompt from './SearchPrompt';

class PepplotContainer extends Component {
  state = {
    tab: this.props.tab || 'pepplot',
    study: this.props.study || '',
    model: this.props.model || '',
    test: this.props.test || '',
    isValidSearchPepplot: this.props.isValidSearchPepplot || false,
    isProteinSelected: false,
    pepplotResults: [],
    pepplotColumns: []
  };

  componentDidMount() {
    this.phosphorylationData = this.phosphorylationData.bind(this);
    this.handlePepplotSearch = this.handlePepplotSearch.bind(this);
  }

  handlePepplotSearch = searchResults => {
    const columns = this.getConfigCols(searchResults);
    this.setState({
      study: searchResults.study,
      model: searchResults.model,
      test: searchResults.test,
      pepplotResults: searchResults.pepplotResults,
      pepplotColumns: columns,
      isValidSearchPepplot: true,
      isProteinSelected: false
    });
  };

  hidePGrid = () => {
    this.setState({
      isValidSearchPepplot: false
    });
  };

  formatNumberForDisplay(num) {
    if (num) {
      if (Math.abs(num) > 0.001) {
        return num.toPrecision(3); //sig dig
      } else {
        return num.toExponential(2); // num after decimal
      }
    } else return null;
  }

  truncateValue(value, indexEnd) {
    return value.substr(0, indexEnd);
  }

  getConfigCols = testData => {
    this.testData = testData.pepplotResults;
    const model = testData.model;
    let configCols = [];

    // var configCols = ['F', 'logFC', 't', 'P_Value', 'adj_P_Val'];
    // var orderedTestData = JSON.parse(
    //   JSON.stringify(this.testData[0], configCols)
    // );
    // this.columns = _.map(
    //   _.filter(_.keys(orderedTestData), function(d) {
    //     return _.includes(configCols, d);
    //   }),
    //   function(d) {
    //     return { field: d };
    //   }
    // );

    if (model === 'Differential Expression') {
      configCols = [
        {
          title: 'MajorityProteinIDsHGNC',
          field: 'MajorityProteinIDsHGNC',
          filterable: { type: 'multiFilter' },
          template: (value, item, addParams) => {
            return (
              <p>
                <Popup
                  trigger={
                    <span
                      className="ProteinNameLink"
                      onClick={addParams.showPlot(model, item)}
                    >
                      {this.truncateValue(value, 11)}
                    </span>
                  }
                  content={value}
                  inverted
                />
                <img
                  src="phosphosite.ico"
                  alt="Phosophosite"
                  className="PhosphositeIcon"
                  // data-manifest={item}
                  onClick={addParams.showPhosphositePlus(item)}
                />
              </p>
            );
          }
        },
        {
          title: 'MajorityProteinIDs',
          field: 'MajorityProteinIDs',
          filterable: { type: 'multiFilter' },
          template: (value, item, addParams) => {
            return (
              <p>
                <Popup
                  trigger={<span>{this.truncateValue(value, 17)}</span>}
                  content={value}
                  inverted
                />
              </p>
            );
          }
        },
        {
          title: 'logFC',
          field: {
            field: 'logFC',
            sortAccessor: (item, field) =>
              item[field] && item[field].toFixed(2),
            groupByAccessor: (item, field) =>
              item[field] && item[field].toFixed(2)
          },
          template: (value, item, addParams) => {
            return (
              <p>
                <Popup
                  trigger={<span>{this.formatNumberForDisplay(value)}</span>}
                  content={value}
                  inverted
                />
              </p>
            );
          },
          filterable: { type: 'multiFilter' }
        },
        {
          title: 't',
          field: {
            field: 't',
            sortAccessor: (item, field) =>
              item[field] && item[field].toFixed(2),
            groupByAccessor: (item, field) =>
              item[field] && item[field].toFixed(2)
          },
          template: (value, item, addParams) => {
            return (
              <p>
                <Popup
                  trigger={<span>{this.formatNumberForDisplay(value)}</span>}
                  content={value}
                  inverted
                />
              </p>
            );
          },
          filterable: { type: 'multiFilter' }
        },
        {
          title: 'P_Value',
          field: {
            field: 'P_Value'
          },
          template: (value, item, addParams) => {
            return (
              <p>
                <Popup
                  trigger={<span>{this.formatNumberForDisplay(value)}</span>}
                  content={value}
                  inverted
                />
              </p>
            );
          },
          filterable: { type: 'multiFilter' }
        },
        {
          title: 'adj_P_Val',
          field: {
            field: 'adj_P_Val',
            sortAccessor: (item, field) =>
              item[field] && item[field].toFixed(4),
            groupByAccessor: (item, field) =>
              item[field] && item[field].toFixed(4)
          },
          template: (value, item, addParams) => {
            return (
              <p>
                <Popup
                  trigger={<span>{this.formatNumberForDisplay(value)}</span>}
                  content={value}
                  inverted
                />
              </p>
            );
          },
          filterable: { type: 'multiFilter' }
        }
      ];
    } else {
      configCols = [
        {
          title: 'Protein_Site',
          field: 'Protein_Site',
          headerAttributes: {
            width: '10%'
          },
          filterable: { type: 'multiFilter' },
          template: (value, item, addParams) => {
            return (
              <p>
                <Popup
                  trigger={
                    <span
                      className="ProteinNameLink"
                      onClick={addParams.showPlot(model, item)}
                    >
                      {this.truncateValue(value, 11)}
                    </span>
                  }
                  content={value}
                  inverted
                />
                <img
                  src="phosphosite.ico"
                  alt="Phosophosite"
                  className="PhosphositeIcon"
                  onClick={addParams.showPhosphositePlus(item)}
                />
              </p>
            );
          }
        },
        {
          title: 'logFC',
          field: {
            field: 'logFC',
            sortAccessor: (item, field) =>
              item[field] && item[field].toFixed(2),
            groupByAccessor: (item, field) =>
              item[field] && item[field].toFixed(2)
          },
          template: (value, item, addParams) => {
            return (
              <p>
                <Popup
                  trigger={<span>{this.formatNumberForDisplay(value)}</span>}
                  content={value}
                  inverted
                />
              </p>
            );
          },
          filterable: { type: 'multiFilter' }
        },
        {
          title: 't',
          field: {
            field: 't',
            sortAccessor: (item, field) =>
              item[field] && item[field].toFixed(2),
            groupByAccessor: (item, field) =>
              item[field] && item[field].toFixed(2)
          },
          template: (value, item, addParams) => {
            return (
              <p>
                <Popup
                  trigger={<span>{this.formatNumberForDisplay(value)}</span>}
                  content={value}
                  inverted
                />
              </p>
            );
          },
          filterable: { type: 'multiFilter' }
        },
        {
          title: 'P_Value',
          field: {
            field: 'P_Value'
          },
          template: (value, item, addParams) => {
            return (
              <p>
                <Popup
                  trigger={<span>{this.formatNumberForDisplay(value)}</span>}
                  content={value}
                  inverted
                />
              </p>
            );
          },
          filterable: { type: 'multiFilter' }
        },
        {
          title: 'adj_P_Val',
          field: {
            field: 'adj_P_Val',
            sortAccessor: (item, field) =>
              item[field] && item[field].toFixed(4),
            groupByAccessor: (item, field) =>
              item[field] && item[field].toFixed(4)
          },
          template: (value, item, addParams) => {
            return (
              <p>
                <Popup
                  trigger={<span>{this.formatNumberForDisplay(value)}</span>}
                  content={value}
                  inverted
                />
              </p>
            );
          },
          filterable: { type: 'multiFilter' }
        }
      ];
    }
    return configCols;
  };

  getView = () => {
    if (this.state.isValidSearchPepplot && !this.state.isProteinSelected) {
      return <PepplotResults {...this.state} />;
    } else return <SearchPrompt />;
  };

  render() {
    const pepplotView = this.getView(this.state);
    return (
      <Grid.Row className="PepplotContainer">
        <Grid.Column
          className="SidebarContainer"
          mobile={16}
          tablet={16}
          largeScreen={3}
          widescreen={3}
        >
          <PepplotSearchCriteria
            {...this.state}
            onPepplotSearch={this.handlePepplotSearch}
            onSearchCriteriaReset={this.hidePGrid}
          />
        </Grid.Column>
        <Grid.Column
          className="ContentContainer"
          mobile={16}
          tablet={16}
          largeScreen={13}
          widescreen={13}
        >
          {pepplotView}
        </Grid.Column>
      </Grid.Row>
    );
  }

  phosphorylationData() {
    const result = {
      data: process(this.testData, this.stateExcelExport).data
    };
    return result;
  }
}

export default PepplotContainer;
