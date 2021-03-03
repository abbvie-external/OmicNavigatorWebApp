import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Breadcrumb, Icon, Popup } from 'semantic-ui-react';
import { splitValue } from '../Shared/helpers';
import '../Shared/Breadcrumbs.scss';

class DifferentialBreadcrumbs extends Component {
  componentDidMount() {}

  render() {
    const {
      differentialFeature,
      imageInfoDifferential,
      onBackToTable,
      differentialFeatureIdKey,
      activeIndexDifferentialView,
    } = this.props;
    let name = `${differentialFeatureIdKey} ${differentialFeature}`;
    if (differentialFeature === '') {
      name = imageInfoDifferential?.title || '';
    }
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
                      activeIndexDifferentialView === 0 ? 'table' : 'chart area'
                    }
                    onClick={onBackToTable}
                  />
                }
                style={BreadcrumbPopupStyle}
                inverted
                basic
                position="bottom left"
                content={
                  activeIndexDifferentialView === 0
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
                  <span className="BreadcrumbName">{splitValue(name)}</span>
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
