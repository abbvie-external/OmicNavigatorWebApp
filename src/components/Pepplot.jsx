import React, { Component } from 'react';
import { Grid, Popup } from 'semantic-ui-react';
import { withRouter } from 'react-router-dom';
import PepplotSearchCriteria from './PepplotSearchCriteria';
import PepplotResults from './PepplotResults';
import SearchPrompt from './SearchPrompt';
import Searching from './Searching';
import _ from 'lodash';

class PepplotContainer extends Component {
  static defaultProps = {
    tab: 'pepplot'
  };

  state = {
    isValidSearchPepplot: false,
    isSearching: false,
    isProteinSelected: false,
    pepplotResults: [],
    pepplotColumns: []
  };

  componentDidMount() {}

  handleSearchTransition = () => {
    this.setState({
      isSearching: true
    });
  };

  handlePepplotSearch = searchResults => {
    const columns = this.getConfigCols(searchResults);
    this.setState({
      study: searchResults.study,
      model: searchResults.model,
      test: searchResults.test,
      pepplotResults: searchResults.pepplotResults,
      pepplotColumns: columns,
      isSearching: false,
      isValidSearchPepplot: true,
      isProteinSelected: false
    });
  };

  hidePGrid = () => {
    this.setState({
      isValidSearchPepplot: false
    });
  };

  getConfigCols = testData => {
    this.testData = testData.pepplotResults;
    const model = testData.model;
    let initConfigCols = [];

    if (model === 'Differential Expression') {
      initConfigCols = [
        {
          title: 'MajorityProteinIDsHGNC',
          field: 'MajorityProteinIDsHGNC',
          template: (value, item, addParams) => {
            return (
              <div>
                <Popup
                  trigger={
                    <span
                      className="ProteinNameLink"
                      onClick={addParams.showPlot(model, item)}
                    >
                      {truncateValue(value, 11)}
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
              </div>
            );
          }
        },
        {
          title: 'MajorityProteinIDs',
          field: 'MajorityProteinIDs',
          template: (value, item, addParams) => {
            return (
              <Popup
                trigger={<span>{truncateValue(value, 17)}</span>}
                content={value}
                inverted
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
          headerAttributes: {
            className: 'two wide'
          },
          template: (value, item, addParams) => {
            return (
              <p>
                <Popup
                  trigger={
                    <span
                      className="ProteinNameLink"
                      onClick={addParams.showPlot(model, item)}
                    >
                      {truncateValue(value, 11)}
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
        }
      ];
    }

    let allConfigCols = ['F', 'logFC', 't', 'P_Value', 'adj_P_Val'];
    let orderedTestData = JSON.parse(
      JSON.stringify(this.testData[0], allConfigCols)
    );
    let relevantConfigColumns = _.map(
      _.filter(_.keys(orderedTestData), function(d) {
        return _.includes(allConfigCols, d);
      })
    );

    const additionalConfigColumns = relevantConfigColumns.map(c => {
      return {
        title: c,
        field: c,
        template: (value, item, addParams) => {
          return (
            <p>
              <Popup
                trigger={<span>{formatNumberForDisplay(value)}</span>}
                content={value}
                inverted
              />
            </p>
          );
        },
        type: 'number'
      };
    });

    const configCols = initConfigCols.concat(additionalConfigColumns);

    return configCols;
  };

  getView = () => {
    if (
      this.state.isValidSearchPepplot &&
      !this.state.isProteinSelected &&
      !this.state.isSearching
    ) {
      return <PepplotResults {...this.state} />;
    } else if (this.state.isSearching) {
      return <Searching />;
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
          largeScreen={4}
          widescreen={4}
        >
          <PepplotSearchCriteria
            {...this.state}
            onSearchTransition={this.handleSearchTransition}
            onPepplotSearch={this.handlePepplotSearch}
            onSearchCriteriaReset={this.hidePGrid}
          />
        </Grid.Column>
        <Grid.Column
          className="ContentContainer"
          mobile={16}
          tablet={16}
          largeScreen={12}
          widescreen={12}
        >
          {pepplotView}
        </Grid.Column>
      </Grid.Row>
    );
  }

  phosphorylationData = () => {
    const result = {
      data: process(this.testData, this.stateExcelExport).data
    };
    return result;
  };
}

export default withRouter(PepplotContainer);

function formatNumberForDisplay(num) {
  if (num) {
    const number = Math.abs(num);
    if (number < 0.001 || number >= 1000) {
      return num.toExponential(2);
      // * If a number is < .001 report this value scientific notation with three significant digits
      // * If a number is >= 1000, switch to scientific notation with three sig digits.

      // } else if (number < 1 && number >= 0.001) {
      //   return num.toPrecision(3);
      // * If a number is < 1 & >= .001, report this value with three decimal places
      // PN - what's left is >=1 and <1000, guess that goes to 3 digits too
    } else {
      return num.toPrecision(3);
    }
  } else return null;
}

function truncateValue(value, indexEnd) {
  return value.substr(0, indexEnd);
}
