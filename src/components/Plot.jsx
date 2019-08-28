import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Grid, Segment, Icon, Header, Dimmer, Loader } from 'semantic-ui-react';
// import Breadcrumbs from './Breadcrumbs';
import PlotAccordion from './PlotAccordion';

class PlotContainer extends Component {
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
      tab: this.props.tab || 'pepplot',
      study: this.props.study || '',
      model: this.props.model || '',
      test: this.props.test || '',
      pepplotResults: this.props.pepplotResults || [],
      pepplotColumns: this.props.pepplotColumns || [],
      treeDataRaw: this.props.treeDataRaw || [],
      treeData: this.props.treeData || [],
      treeDataColumns: this.props.treeDataColumns || [],
      plotType: this.props.plotType || [],
      imageInfo: this.props.imageInfo || {
        title: '',
        svg: []
      },
      currentSVGs: this.props.currentSVGs || [],
      isProteinDataLoaded: this.props.isProteinDataLoaded || false
    };
  }

  componentDidMount() {}

  render() {
    const imageInfo = this.props.imageInfo;
    if (!this.props.isProteinDataLoaded) {
      return (
        <div>
          <Dimmer active inverted>
            <Loader size="large">Data and Plots are Loading</Loader>
          </Dimmer>
        </div>
      );
    } else {
      return (
        <div className="">
          {/* <Breadcrumbs /> */}
          <Segment className="PlotContainer">
            <Grid columns={2}>
              <Grid.Row className="">
                <Grid.Column
                  className="PlotAccordionContainer"
                  mobile={16}
                  tablet={16}
                  largeScreen={3}
                  widescreen={4}
                >
                  <PlotAccordion {...this.state} />
                </Grid.Column>
                <Grid.Column
                  mobile={16}
                  tablet={16}
                  largeScreen={13}
                  widescreen={12}
                >
                  <Segment className="PlotSVG" placeholder>
                    <Header icon>
                      <Icon name="chart area" />
                      Plot (formerly Dialog) goes here
                    </Header>
                  </Segment>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Segment>
        </div>
      );
    }
  }
}

export default withRouter(PlotContainer);
