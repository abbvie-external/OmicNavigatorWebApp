import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Icon, Step } from 'semantic-ui-react';

class Steps extends Component {
  state = {
    view: 'pepplot',
    study: '***REMOVED***',
    model: 'donordifferentialphosphorylation',
    test: 'donor1vdonor3',
    protein: 'HMGA1_S44',
    studiesFetched: true,
    testCategoriesFetched: true,
    testsFetched: true,
    selectedView: 'pepplot',
    selectedStudy: '***REMOVED***',
    selectedModel: 'donordifferentialphosphorylation',
    selectedTest: 'donor1vdonor3'
  };

  componentDidMount() {}

  render() {
    return (
      <Step.Group size="mini">
        <Link to={{ pathname: `/pepplot` }}>
          <Step active={this.state.protein === ''}>
            <Icon name="table" />
            <Step.Content>
              <Step.Title>GRID</Step.Title>
              <Step.Description>
                {this.state.view} > {this.state.study} > {this.state.model} >{' '}
                {this.state.test}
              </Step.Description>
            </Step.Content>
          </Step>
        </Link>
        <Step active={this.state.protein !== ''}>
          <Icon name="chart line" />
          <Step.Content>
            <Step.Title>PLOT</Step.Title>
            <Step.Description>{this.state.protein}</Step.Description>
          </Step.Content>
        </Step>
      </Step.Group>
    );
  }
}

export default Steps;
