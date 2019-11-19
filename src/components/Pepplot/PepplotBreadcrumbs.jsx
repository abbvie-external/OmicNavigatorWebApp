import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Breadcrumb, Icon, Popup } from 'semantic-ui-react';
import '../Shared/Breadcrumbs.scss';

class PepplotBreadcrumbs extends Component {
  componentDidMount() {}

  render() {
    const name = this.props.imageInfo.key;
    const BreadcrumbPopupStyle = {
      backgroundColor: '2E2E2E',
      borderBottom: '2px solid #FF4400',
      color: '#FFF',
      padding: '1em',
      maxWidth: '50vw',
      fontSize: '13px',
      wordBreak: 'break-all'
    };

    return (
      <div className="BreadcrumbContainer">
        <div className="deviceMargin">
          <Breadcrumb size="large">
            <Breadcrumb.Section className="BreadcrumbLink">
              <Popup
                trigger={
                  <Icon name="table" onClick={this.props.onBackToTable} />
                }
                style={BreadcrumbPopupStyle}
                inverted
                basic
                position="bottom left"
                content="Back To Table"
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

export default withRouter(PepplotBreadcrumbs);

function splitValue(value) {
  if (value) {
    const firstValue = value.split(';')[0];
    const numberOfSemicolons = (value.match(/;/g) || []).length;
    return numberOfSemicolons > 0
      ? `${firstValue}...(${numberOfSemicolons})`
      : firstValue;
  }
}