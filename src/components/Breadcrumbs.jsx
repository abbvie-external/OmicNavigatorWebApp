import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb, Icon } from 'semantic-ui-react';

class Breadcrumbs extends Component {
  state = {
    tab: 'pepplot',
    study: '***REMOVED***',
    model: 'donordifferentialphosphorylation',
    test: 'donor1vdonor3',
    protein: 'HMGA1_S44'
  };

  componentDidMount() {}

  render() {
    return (
      <div className="BreadcrumbContainer">
        <div className="deviceMargin">
          <Breadcrumb size="small">
            <Link to={{ pathname: `/pepplot` }}>
              <Breadcrumb.Section>
                <Icon name="home" />
              </Breadcrumb.Section>
            </Link>
            <Breadcrumb.Divider icon="right chevron" />
            <Breadcrumb.Section active={this.state.protein !== ''}>
              {this.state.protein}
            </Breadcrumb.Section>
          </Breadcrumb>
        </div>
      </div>
    );
  }
}

export default Breadcrumbs;
