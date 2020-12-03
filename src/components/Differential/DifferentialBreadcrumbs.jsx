import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Breadcrumb, Icon, Popup } from 'semantic-ui-react';
import { splitValue } from '../Shared/helpers';
import '../Shared/Breadcrumbs.scss';

class DifferentialBreadcrumbs extends Component {
  componentDidMount() {}

  render() {
    // let name = this.props.imageInfo.title;
    // if (name === '') {
    let name = `${this.props.differentialFeatureIdKey} ${this.props.differentialFeature}`;
    // }
    const BreadcrumbPopupStyle = {
      backgroundColor: '2E2E2E',
      borderBottom: '2px solid var(--color-primary)',
      color: '#FFF',
      padding: '1em',
      maxWidth: '50vw',
      fontSize: '13px',
      wordBreak: 'break-all',
    };

    return (
      <div className="BreadcrumbContainer">
        <div className="deviceMargin">
          <Breadcrumb size="large">
            <Breadcrumb.Section className="BreadcrumbLink">
              <Popup
                trigger={
                  <Icon
                    name={
                      this.props.activeIndexDifferentialView === 0
                        ? 'table'
                        : 'chart area'
                    }
                    onClick={this.props.onBackToTable}
                  />
                }
                style={BreadcrumbPopupStyle}
                inverted
                basic
                position="bottom left"
                content={
                  this.props.activeIndexDifferentialView === 0
                    ? 'Back To Table'
                    : 'Back To Plot'
                }
                closeOnTriggerClick
              />
            </Breadcrumb.Section>
            <Breadcrumb.Divider icon="right chevron" />
            <Breadcrumb.Section active={true}>
              <Popup
                trigger={
                  <span className="BreadcrumbName NoSelect">
                    {splitValue(name)}
                  </span>
                }
                style={BreadcrumbPopupStyle}
                inverted
                basic
                position="bottom left"
                content={name}
              />
            </Breadcrumb.Section>
          </Breadcrumb>
        </div>
      </div>
    );
  }
}

export default withRouter(DifferentialBreadcrumbs);
