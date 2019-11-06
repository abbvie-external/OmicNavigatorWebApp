import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Grid, Dimmer, Loader } from 'semantic-ui-react';
import Breadcrumbs from './Breadcrumbs';
import ButtonActions from './ButtonActions';
import PlotAccordion from './PlotAccordion';
import SVGPlot from './SVGPlot';
import './PlotContainer.scss';

class PlotContainer extends Component {
  static defaultProps = {
    isProteinDataLoaded: false,
    isProteinSVGLoaded: true
  };

  constructor(props) {
    super(props);

    // const tab = props.history.location.pathname;
    // const study = props.study;
    // const model = props.model;
    // const test = props.test;
    // const protein = props.imageInfo.key;
    // const customPath = `${tab + '/' + study + '/' + model + '/' + test + '/' + protein}`;
    // const customPathFriendly = customPath.replace(/[^a-zA-Z0-9-_/]/g, '');
    // const customPathEncodedURI = encodeURIComponent(customPath);
    // props.history.push(customPathFriendly);
    this.state = {
      activeSVGTabIndex: 0,
      excelVisible: true,
      pngVisible: true,
      pdfVisible: true,
      svgVisible: false
      // returningToTable: false,
    };
  }

  componentDidMount() {}

  handleSVGTabChange = activeTabIndex => {
    this.setState({
      activeSVGTabIndex: activeTabIndex
    });
  };

  // tableTransition = () => {
  //   this.setState({
  //     returningToTable: true
  //   });
  //   this.props.onBackToTable();
  // };

  render() {
    // const { returningToTable } = this.state;
    // if (this.state.returningToTable) {
    //   return <LoaderActiveTable />

    if (!this.props.isProteinSVGLoaded) {
      return (
        <div>
          <Dimmer active inverted>
            <Loader size="large">Plots are Loading</Loader>
          </Dimmer>
        </div>
      );
    } else {
      return (
        <div className="PlotWrapper">
          <Grid columns={2} className="">
            <Grid.Row className="ActionsRow">
              <Grid.Column mobile={8} tablet={8} largeScreen={8} widescreen={8}>
                <Breadcrumbs
                  {...this.props}
                  // onNavigateBack={this.tableTransition}
                />
              </Grid.Column>
              <Grid.Column mobile={8} tablet={8} largeScreen={8} widescreen={8}>
                <ButtonActions {...this.props} {...this.state} />
              </Grid.Column>
            </Grid.Row>
          </Grid>

          <Grid columns={2} className="PlotContainer">
            <Grid.Row className="">
              <Grid.Column
                className="PlotAccordionContainer"
                mobile={16}
                tablet={16}
                largeScreen={4}
                widescreen={3}
              >
                <PlotAccordion {...this.props} />
              </Grid.Column>
              <Grid.Column
                mobile={16}
                tablet={16}
                largeScreen={12}
                widescreen={13}
              >
                <SVGPlot
                  {...this.props}
                  {...this.state}
                  onSVGTabChange={this.handleSVGTabChange}
                />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
      );
    }
  }
}

export default withRouter(PlotContainer);
