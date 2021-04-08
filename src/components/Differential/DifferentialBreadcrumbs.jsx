import React, { Component, PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { Breadcrumb, Icon, Popup } from 'semantic-ui-react';
import { splitValue } from '../Shared/helpers';
import '../Shared/Breadcrumbs.scss';

class DifferentialBreadcrumbs extends PureComponent {
  componentDidMount() {}

  render() {
    const {
      differentialFeature,
      imageInfoDifferential,
      onBackToTable,
      differentialFeatureIdKey,
      featuresString,
    } = this.props;
    let name = splitValue(`${differentialFeatureIdKey} ${differentialFeature}`);
    let longName = `${differentialFeatureIdKey} ${differentialFeature}`;
    if (differentialFeature === '') {
      name = imageInfoDifferential?.title || '';
      longName = featuresString;
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
                trigger={<Icon name="table" onClick={onBackToTable} />}
                style={BreadcrumbPopupStyle}
                inverted
                basic
                position="bottom left"
                content="Back To Table"
                closeOnTriggerClick
              />
            </Breadcrumb.Section>
            <Breadcrumb.Divider icon="right chevron" />
            <Breadcrumb.Section active={true}>
              <Popup
                trigger={<span className="BreadcrumbName">{name}</span>}
                style={BreadcrumbPopupStyle}
                inverted
                basic
                position="bottom left"
                content={longName}
              />
            </Breadcrumb.Section>
          </Breadcrumb>
        </div>
      </div>
    );
  }
}

export default withRouter(DifferentialBreadcrumbs);
