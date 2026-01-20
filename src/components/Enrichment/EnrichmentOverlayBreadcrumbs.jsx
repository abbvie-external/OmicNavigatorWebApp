import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Breadcrumb, Icon, Popup } from 'semantic-ui-react';
import { splitValue } from '../Shared/helpers';
import '../Shared/Breadcrumbs.scss';

/**
 * Breadcrumbs component for Enrichment fullscreen overlay.
 * Shows a back button to return to split panes view and a label for the plot/feature.
 */
class EnrichmentOverlayBreadcrumbs extends Component {
  render() {
    const { plotOverlayData, onBackToTable, featuresString, backLabel } = this.props;

    const name = splitValue(plotOverlayData?.key || plotOverlayData?.title || '');
    const longName = featuresString || plotOverlayData?.key || plotOverlayData?.title || '';

    const BreadcrumbPopupStyle = {
      backgroundColor: '#2E2E2E',
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
                trigger={<Icon name="arrow circle left" onClick={onBackToTable} />}
                style={BreadcrumbPopupStyle}
                inverted
                basic
                position="bottom left"
                content={backLabel || 'Back to Plots'}
                closeOnTriggerClick
              />
            </Breadcrumb.Section>
            <Breadcrumb.Divider icon="right chevron" />
            <Breadcrumb.Section active>
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

export default withRouter(EnrichmentOverlayBreadcrumbs);
