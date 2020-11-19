import React, { Component, Fragment } from 'react';
import { Breadcrumb, Icon, Popup } from 'semantic-ui-react';
import '../Shared/Breadcrumbs.scss';
import { getLinkout } from '../Shared/helpers';

class EnrichmentBreadcrumbs extends Component {
  componentDidMount() {}

  getNameAndLink = (
    name,
    enrichmentNameLoaded,
    enrichmentAnnotation,
    enrichmentDataItem,
    enrichmentTerm,
    enrichmentsLinkouts,
    enrichmentFeatureIdKey,
  ) => {
    let linkoutWithIcon = null;
    const enrichmentsLinkoutsKeys = Object.keys(enrichmentsLinkouts);
    if (enrichmentsLinkoutsKeys.includes(enrichmentTerm)) {
      const columnLinkoutsObj = enrichmentsLinkouts[enrichmentTerm];
      const columnLinkoutsIsArray = Array.isArray(columnLinkoutsObj);
      const linkouts = columnLinkoutsIsArray
        ? columnLinkoutsObj
        : [columnLinkoutsObj];
      const itemValue = enrichmentDataItem[enrichmentTerm];
      const TableValuePopupStyle = {
        backgroundColor: '2E2E2E',
        borderBottom: '2px solid var(--color-primary)',
        color: '#FFF',
        padding: '1em',
        maxWidth: '50vw',
        fontSize: '13px',
        wordBreak: 'break-all',
      };
      linkoutWithIcon = getLinkout(itemValue, linkouts, TableValuePopupStyle);
    }

    if (enrichmentNameLoaded === true) {
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
        <Fragment>
          <Popup
            trigger={<span className="BreadcrumbName">{name}</span>}
            style={BreadcrumbPopupStyle}
            inverted
            basic
            position="bottom left"
            content={name}
          />
          {linkoutWithIcon}
        </Fragment>
      );
    }
  };

  render() {
    const {
      enrichmentNameLoaded,
      enrichmentAnnotation,
      enrichmentDataItem,
      enrichmentTerm,
      enrichmentsLinkouts,
      enrichmentFeatureIdKey,
    } = this.props;

    const name = this.props.imageInfo.key;
    const BreadcrumbPopupStyle = {
      backgroundColor: '2E2E2E',
      borderBottom: '2px solid var(--color-primary)',
      color: '#FFF',
      padding: '1em',
      maxWidth: '50vw',
      fontSize: '13px',
      wordBreak: 'break-all',
    };
    const NameAndExternalLink = this.getNameAndLink(
      name,
      enrichmentNameLoaded,
      enrichmentAnnotation,
      enrichmentDataItem,
      enrichmentTerm,
      enrichmentsLinkouts,
      enrichmentFeatureIdKey,
    );

    const EnrichmentViewTabDescription =
      parseInt(sessionStorage.getItem('enrichmentViewTab'), 10) === 0
        ? 'Back To Table'
        : 'Back To Network';
    return (
      <div className="BreadcrumbContainer">
        <div className="deviceMargin">
          <Breadcrumb size="large">
            <Breadcrumb.Section className="BreadcrumbLink">
              <Popup
                trigger={
                  <Icon
                    name="arrow circle left"
                    onClick={this.props.onBackToTable}
                  />
                }
                style={BreadcrumbPopupStyle}
                inverted
                basic
                position="bottom left"
                content={EnrichmentViewTabDescription}
              />
            </Breadcrumb.Section>
            <Breadcrumb.Divider icon="right chevron" />
            <Breadcrumb.Section active={true}>
              {NameAndExternalLink}
            </Breadcrumb.Section>
          </Breadcrumb>
        </div>
      </div>
    );
  }
}

export default EnrichmentBreadcrumbs;
