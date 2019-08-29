import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Breadcrumb, Icon } from 'semantic-ui-react';

class Breadcrumbs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      protein: this.props.imageInfo.key
    };
  }

  componentDidMount() {}

  render() {
    return (
      <div className="BreadcrumbContainer">
        <div className="deviceMargin">
          <Breadcrumb size="large">
            <Link to={this.props.history.location.pathname}>
              <Breadcrumb.Section>
                <Icon name="table" />
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

export default withRouter(Breadcrumbs);
