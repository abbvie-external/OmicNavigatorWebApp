import React, { Component } from 'react';
import { Grid, Popup } from 'semantic-ui-react';
import { withRouter } from 'react-router-dom';
import EnrichmentSearchCriteria from './EnrichmentSearchCriteria';
import EnrichmentResults from './EnrichmentResults';
import TransitionActive from './TransitionActive';
import TransitionStill from './TransitionStill';
import _ from 'lodash';
import './Enrichment.scss';
import './Table.scss';

class EnrichmentContainer extends Component {
  static defaultProps = {
    tab: 'enrichment'
  };

  state = {
    isValidSearchEnrichment: false,
    isSearching: false,
    enrichmentResults: [],
    enrichmentColumns: []
  };

  componentDidMount() {}

  handleSearchTransition = () => {
    this.setState({
      isSearching: true
    });
  };

  handleEnrichmentSearch = searchResults => {
    const columns = this.getConfigCols(searchResults);
    this.setState({
      study: searchResults.study,
      model: searchResults.model,
      test: searchResults.test,
      enrichmentResults: searchResults.enrichmentResults,
      enrichmentColumns: columns,
      isSearching: false,
      isValidSearchEnrichment: true
    });
  };

  hidePGrid = () => {
    this.setState({
      isValidSearchEnrichment: false
    });
  };

  getConfigCols = annotationData => {
    this.annotationData = annotationData.enrichmentResults;
    let initConfigCols = [];

    const BreadcrumbPopupStyle = {
      backgroundColor: '2E2E2E',
      borderBottom: '2px solid #FF4400',
      color: '#FFF',
      padding: '1em',
      maxWidth: '50vw',
      fontSize: '13px',
      wordBreak: 'break-all'
    };

    // initConfigCols = [
    //   {
    //     title: 'Annotation',
    //     field: 'Annotation',
    //     template: (value, item) => {
    //       return (
    //         <p>
    //           <Popup
    //             trigger={
    //               <span>
    //                 {splitValue(value)}
    //               </span>
    //             }
    //             style={BreadcrumbPopupStyle}
    //             content={value}
    //             inverted
    //             basic
    //           />
    //         </p>
    //       );
    //     }
    //   }
    // ];

    let allKeys = _.keys(annotationData[0]);
    let ***REMOVED***_text_col = _.indexOf(allKeys, 'name_1006');

    if (***REMOVED***_text_col >= 0) {
      const Col_Name_1006 = {
        title: 'name_1006',
        field: 'name_1006',
        filterable: { type: 'alphanumericFilter' },
        template: (value, item) => {
          return (
            <p>
              <Popup
                trigger={<span>{splitValue(value)}</span>}
                style={BreadcrumbPopupStyle}
                content={value}
                inverted
                basic
              />
            </p>
          );
        }
      };
      initConfigCols.push(Col_Name_1006);
      // const configCols = initConfigCols.concat(Col_Name_1006);
      // includeCols.push('name_1006');
    }

    // let allConfigCols = ['F', 'logFC', 't', 'P_Value', 'adj_P_Val', 'adjPVal'];
    // let orderedTestData = JSON.parse(
    //   JSON.stringify(this.testData[0], allConfigCols)
    // );
    let orderedTestData = JSON.parse(JSON.stringify(this.annotationData[0]));
    let relevantConfigColumns = _.map(
      _.filter(_.keys(orderedTestData), function(d) {
        return d;
      })
    );
    // pepp end

    const additionalConfigColumns = relevantConfigColumns.map(c => {
      return {
        title: c,
        field: c,
        type: 'number',
        filterable: { type: 'numericFilter' },
        exportTemplate: value => (value ? `${value}` : 'N/A'),
        template: (value, item) => {
          return (
            <p>
              <Popup
                trigger={
                  <span className="NumericValues">
                    {formatNumberForDisplay(value)}
                  </span>
                }
                style={BreadcrumbPopupStyle}
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

    return configCols;
  };

  getView = () => {
    if (this.state.isValidSearchEnrichment && !this.state.isSearching) {
      return <EnrichmentResults {...this.state} />;
    } else if (this.state.isSearching) {
      return <TransitionActive />;
    } else return <TransitionStill />;
  };

  render() {
    const enrichmentView = this.getView(this.state);
    return (
      <Grid.Row className="EnrichmentContainer">
        <Grid.Column
          className="SidebarContainer"
          mobile={16}
          tablet={16}
          largeScreen={4}
          widescreen={4}
        >
          <EnrichmentSearchCriteria
            {...this.state}
            onSearchTransition={this.handleSearchTransition}
            onEnrichmentSearch={this.handleEnrichmentSearch}
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
          {enrichmentView}
        </Grid.Column>
      </Grid.Row>
    );
  }
}

export default withRouter(EnrichmentContainer);

function formatNumberForDisplay(num) {
  if (num) {
    if (!isNaN(num)) {
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
    } else return num;
  } else return null;
}

function splitValue(value) {
  if (value) {
    const firstValue = value.split(';')[0];
    const numberOfSemicolons = (value.match(/;/g) || []).length;
    return numberOfSemicolons > 0
      ? `${firstValue}...(${numberOfSemicolons})`
      : firstValue;
  }
}
