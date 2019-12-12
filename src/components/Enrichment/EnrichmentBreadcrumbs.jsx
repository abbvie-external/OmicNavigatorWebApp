import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { Breadcrumb, Icon, Popup } from 'semantic-ui-react';
import '../Shared/Breadcrumbs.scss';
import { phosphoprotService } from '../../services/phosphoprot.service';

// import msig_icon from '../../resources/msig.ico';
// import phosphosite_icon from '../../resources/phosphosite.ico';
// import reactome_icon from '../../resources/reactome.jpg';
// import go_icon from '../../resources/go.png';

class Breadcrumbs extends Component {
  componentDidMount() {}

  getLink = (enrichmentStudy, enrichmentAnnotation, dataItem, term) => {
    return function() {
      if (enrichmentAnnotation === 'REACTOME') {
        window.open('https://reactome.org/content/detail/' + term, '_blank');
      } else if (enrichmentAnnotation.substring(0, 2) === 'GO') {
        window.open(
          'http://amigo.geneontology.org/amigo/term/' + term,
          '_blank'
        );
      } else if (enrichmentAnnotation.substring(0, 4) === 'msig') {
        window.open(
          'http://software.broadinstitute.org/gsea/msigdb/cards/' + term,
          '_blank'
        );
      } else if (enrichmentAnnotation === 'PSP') {
        this.showPhosphositePlus('', dataItem);
      }
      // });
    };
  };

  showPhosphositePlus = dataItem => {
    return function() {
      var protein = (dataItem.Description
        ? dataItem.Description
        : dataItem.MajorityProteinIDsHGNC
      ).split(';')[0];
      let param = { queryId: -1, from: 0, searchStr: protein };
      phosphoprotService.postToPhosphositePlus(
        param,
        'https://www.phosphosite.org/proteinSearchSubmitAction.action'
      );
    };
  };

  //   getExternalLink = () => {
  //     if (this.props.tab === 'pepplot') {
  //       return;
  //     } else {
  //       return (
  //         <img
  //           src={this.props.enrichmentIcon}
  //           alt={this.props.enrichmentIconText}
  //           className="ExternalSiteIcon"
  //           onClick={this.getLink(
  //             this.props.enrichmentStudy,
  //             this.props.enrichmentAnnotation,
  //             this.props.enrichmentDataItem,
  //             this.props.enrichmentTerm
  //           )}
  //         />
  //       )
  //     }
  //   };

  getNameAndLink = (
    name,
    BreadcrumbPopupStyle,
    enrichmentNameLoaded,
    enrichmentIcon,
    enrichmentIconText,
    enrichmentStudy,
    enrichmentAnnotation,
    enrichmentDataItem,
    enrichmentTerm
  ) => {
    if (enrichmentNameLoaded === true) {
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
        <Fragment>
          <Popup
            trigger={<span className="BreadcrumbName">{name}</span>}
            style={BreadcrumbPopupStyle}
            inverted
            basic
            position="bottom left"
            content={name}
          />
          <span>
            <Popup
              trigger={
                <img
                  src={enrichmentIcon}
                  alt={enrichmentIconText}
                  className="ExternalSiteIcon"
                  onClick={this.getLink(
                    enrichmentStudy,
                    enrichmentAnnotation,
                    enrichmentDataItem,
                    enrichmentTerm
                  )}
                />
              }
              style={BreadcrumbPopupStyle}
              className="TablePopupValue"
              content={enrichmentIconText}
              inverted
              basic
            />
          </span>
        </Fragment>
      );
    }
  };

  handleDiffTable = (evt, {}) => {
    const key = this.props.imageInfo.key.split(':');
    const name = key[0] || '';
    this.props.onViewDiffTable(name);
  };

  render() {
    const {
      enrichmentNameLoaded,
      enrichmentIcon,
      enrichmentIconText,
      enrichmentStudy,
      enrichmentAnnotation,
      enrichmentDataItem,
      enrichmentTerm
    } = this.props;

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
    const NameAndExternalLink = this.getNameAndLink(
      name,
      BreadcrumbPopupStyle,
      enrichmentNameLoaded,
      enrichmentIcon,
      enrichmentIconText,
      enrichmentStudy,
      enrichmentAnnotation,
      enrichmentDataItem,
      enrichmentTerm
    );
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
              {NameAndExternalLink}
            </Breadcrumb.Section>
            <Breadcrumb.Divider icon="" />
            <Breadcrumb.Section className="BreadcrumbLink">
              <Popup
                trigger={<Icon name="random" onClick={this.handleDiffTable} />}
                style={BreadcrumbPopupStyle}
                inverted
                basic
                position="bottom left"
                content="View Differential Table"
              />
            </Breadcrumb.Section>
          </Breadcrumb>
        </div>
      </div>
    );
  }
}

export default withRouter(Breadcrumbs);
