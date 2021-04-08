import React, { Component, Fragment, PureComponent } from 'react';
import { Breadcrumb, Icon, Popup } from 'semantic-ui-react';
import '../Shared/Breadcrumbs.scss';
import { Linkout } from '../Shared/helpers';

class EnrichmentBreadcrumbs extends PureComponent {
  componentDidMount() {}

  getNameAndLink = (
    name,
    enrichmentNameLoaded,
    enrichmentAnnotation,
    enrichmentDataItem,
    enrichmentTerm,
    enrichmentsLinkouts,
    enrichmentsFavicons,
    enrichmentFeatureIdKey,
  ) => {
    let linkoutWithIcon = null;
    const linkoutsIsArray = Array.isArray(enrichmentsLinkouts);
    const linkouts = linkoutsIsArray
      ? enrichmentsLinkouts
      : [enrichmentsLinkouts];
    if (linkouts.length > 0) {
      let favicons = [];
      if (enrichmentsFavicons.length !== 0) {
        const columnFaviconsIsArray = Array.isArray(enrichmentsFavicons);
        favicons = columnFaviconsIsArray
          ? enrichmentsFavicons
          : [enrichmentsFavicons];
      }
      const itemValue = enrichmentTerm;
      linkoutWithIcon = <Linkout {...{ itemValue, linkouts, favicons }} />;
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
      enrichmentsFavicons,
      enrichmentFeatureIdKey,
    } = this.props;

    const name = this.props.imageInfoEnrichment.key;
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
      enrichmentsFavicons,
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
                closeOnTriggerClick
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
