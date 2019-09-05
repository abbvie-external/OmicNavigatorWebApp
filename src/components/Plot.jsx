import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Grid, Dimmer, Loader } from 'semantic-ui-react';
import Breadcrumbs from './Breadcrumbs';
import ButtonActions from './ButtonActions';
import PlotAccordion from './PlotAccordion';
import PlotSVG from './PlotSVG';

class PlotContainer extends Component {
  static defaultProps = {
    isProteinDataLoaded: false
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
  }

  componentDidMount() {}

  render() {
    if (!this.props.isProteinDataLoaded) {
      return (
        <div>
          <Dimmer active inverted>
            <Loader size="large">Plots are Loading</Loader>
          </Dimmer>
        </div>
      );
    } else {
      return (
        <div className="">
          <Grid columns={2} className="">
            <Grid.Row className="ActionsRow">
              <Grid.Column
                className="PlotAccordionContainer"
                mobile={8}
                tablet={8}
                largeScreen={8}
                widescreen={8}
              >
                <Breadcrumbs
                  {...this.props}
                  onNavigateBack={this.props.onBackToGrid}
                />
              </Grid.Column>
              <Grid.Column mobile={8} tablet={8} largeScreen={8} widescreen={8}>
                <ButtonActions {...this.state} />
              </Grid.Column>
            </Grid.Row>
          </Grid>

          <Grid columns={2} className="PlotContainer">
            <Grid.Row className="">
              <Grid.Column
                className="PlotAccordionContainer"
                mobile={16}
                tablet={16}
                largeScreen={5}
                widescreen={5}
              >
                <PlotAccordion {...this.props} />
              </Grid.Column>
              <Grid.Column
                mobile={16}
                tablet={16}
                largeScreen={11}
                widescreen={11}
              >
                <PlotSVG {...this.props} />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
      );
    }
  }
}

export default withRouter(PlotContainer);
