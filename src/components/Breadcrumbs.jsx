import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb, Button } from 'semantic-ui-react';

class Breadcrumbs extends Component {
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
      <div className="BreadcrumbContainer">
        <div className="deviceMargin">
          <Breadcrumb size="large">
            <Link to={{ pathname: `/` }}>
              <Breadcrumb.Section>
                {this.state.view} {this.state.study} {this.state.model}{' '}
                {this.state.test}
              </Breadcrumb.Section>
            </Link>
            <Breadcrumb.Divider icon="right chevron" />
            <Breadcrumb.Section>{this.state.protein}</Breadcrumb.Section>
          </Breadcrumb>

          <Link to={{ pathname: `/` }}>
            <Button className="BackToGrid" size="small" floated="right">
              Back
            </Button>
          </Link>
        </div>
      </div>
    );
  }
}

export default Breadcrumbs;
