import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Tab, Menu, Popup, Icon } from 'semantic-ui-react';
import { omicNavigatorService } from '../services/omicNavigator.service';
import Differential from './Differential/Differential';
import omicNavigatorIcon from '../resources/icon.png';
import Enrichment from './Enrichment/Enrichment';
import { updateUrl } from './Shared/UrlControl';

class Tabs extends Component {
  constructor(props) {
    super(props);
    const baseUrl = window.location.origin || 'http://localhost:3000';
    const pathnameInit = this.props.location.pathname.substring(1) || null;
    const pathname =
      pathnameInit !== null ? pathnameInit.replace(/–/gi, ' ') : pathnameInit;
    const params = pathname ? pathname.split('/') : '';
    const tabFromUrl = params[0] || '';
    const studyFromUrl = params[1] || '';
    const modelFromUrl = params[2] || '';
    const testOrAnnotationFromUrl = params[3] || '';
    const featureOrTestfromUrl = params[4] || '';
    const descriptionFromUrl = params[5] || '';
    const featureOrTestAndDescription =
      descriptionFromUrl !== ''
        ? `${featureOrTestfromUrl}/${descriptionFromUrl}`
        : featureOrTestfromUrl;
    const decodedStudy = decodeURI(studyFromUrl);
    const decodedModel = decodeURI(modelFromUrl);
    const decodedTest = decodeURI(testOrAnnotationFromUrl);
    const decodedFeatureOrTestAndDescription = decodeURI(
      featureOrTestAndDescription,
    );
    const isEnrichment = tabFromUrl === 'enrichment';
    this.state = {
      baseUrl: baseUrl,
      activeIndex: isEnrichment ? 2 : 1,
      tab: tabFromUrl || 'differential',
      enrichmentStudy: isEnrichment ? decodedStudy : '',
      enrichmentModel: isEnrichment ? decodedModel : '',
      enrichmentAnnotation: isEnrichment ? decodedTest : '',
      enrichmentTestAndDescription: isEnrichment
        ? decodedFeatureOrTestAndDescription
        : '',
      differentialStudy: !isEnrichment ? decodedStudy : '',
      differentialModel: !isEnrichment ? decodedModel : '',
      differentialTest: !isEnrichment ? decodedTest : '',
      differentialFeature: !isEnrichment
        ? decodedFeatureOrTestAndDescription
        : '',
      featureToHighlightInDiffTable: '',
      allStudiesMetadata: [],
      differentialFeatureIdKey: '',
      filteredDifferentialFeatureIdKey: '',
      appVersion: '0.3.6',
      packageVersion: '',
    };
  }

  componentDidMount() {
    updateUrl(
      this.props,
      this.state,
      null,
      'tabInit',
      this.setTabIndex,
      false,
      null,
    );
    this.getStudies();
  }

  setTabIndex = tabIndex => {
    this.setState({
      activeIndex: tabIndex,
    });
  };

  handleTabChange = (e, { activeIndex }) => {
    if (activeIndex !== this.state.activeIndex) {
      let newTab = activeIndex === 1 ? 'differential' : 'enrichment';
      this.setState({
        tab: newTab,
      });
      updateUrl(
        this.props,
        this.state,
        null,
        'tabChange',
        this.setTabIndex,
        false,
        null,
      );
    } else {
      return;
    }
  };

  handleUrlChange = (changes, tab) => {
    if (tab === 'differential') {
      this.setState({
        tab: 'differential',
        differentialStudy: changes.differentialStudy || '',
        differentialModel: changes.differentialModel || '',
        differentialTest: changes.differentialTest || '',
        differentialFeature: changes.differentialFeature || '',
      });
    } else if (tab === 'enrichment') {
      this.setState({
        tab: 'enrichment',
        enrichmentStudy: changes.enrichmentStudy || '',
        enrichmentModel: changes.enrichmentModel || '',
        enrichmentAnnotation: changes.enrichmentAnnotation || '',
        enrichmentTestAndDescription:
          changes.enrichmentTestAndDescription || '',
      });
    }
    updateUrl(
      this.props,
      this.state,
      changes,
      'tabInit',
      this.setTabIndex,
      true,
      tab,
    );
  };
  handleDifferentialFeatureIdKey = (name, id) => {
    this.setState({
      [name]: id,
    });
  };
  findDifferentialFeature = (test, featureID) => {
    this.setState({
      activeIndex: 1,
      tab: 'differential',
      differentialStudy: this.state.enrichmentStudy || '',
      differentialModel: this.state.enrichmentModel || '',
      differentialTest: test || '',
      differentialFeature: '',
      featureToHighlightInDiffTable: featureID,
    });
    let changes = {
      differentialStudy: this.state.enrichmentStudy || '',
      differentialModel: this.state.enrichmentModel || '',
      differentialTest: test || '',
      differentialFeature: '',
    };
    updateUrl(
      this.props,
      this.state,
      changes,
      'tabChange',
      this.setTabIndex,
      true,
      'differential',
    );
  };

  getStudies = () => {
    omicNavigatorService
      .listStudies()
      .then(listStudiesResponseData => {
        this.setState({
          allStudiesMetadata: listStudiesResponseData,
        });
        this.getPackageVersion();
      })
      .catch(error => {
        console.error('Error during listStudies', error);
      });
  };

  getPackageVersion = () => {
    omicNavigatorService
      .getPackageVersion()
      .then(packageVersionResponseData => {
        this.setState({
          packageVersion: packageVersionResponseData,
        });
      })
      .catch(error => {
        console.error('Error during packageVersion', error);
      });
  };

  resetFeatureToHighlightInDiffTable = () => {
    this.setState({ featureToHighlightInDiffTable: '' });
  };

  resetApp = () => {
    this.setState(
      {
        activeIndex: 1,
        tab: 'differential',
        enrichmentStudy: '',
        enrichmentModel: '',
        enrichmentAnnotation: '',
        enrichmentTestAndDescription: '',
        differentialStudy: '',
        differentialModel: '',
        differentialTest: '',
        differentialFeature: '',
        featureToHighlightInDiffTable: '',
        allStudiesMetadata: [],
        differentialFeatureIdKey: '',
        filteredDifferentialFeatureIdKey: '',
      },
      function() {
        updateUrl(
          this.props,
          this.state,
          null,
          'tabInit',
          this.setTabIndex,
          false,
          null,
        );
        window.location.reload(false);
      },
    );
  };

  render() {
    const { activeIndex, appVersion, packageVersion } = this.state;
    const panes = [
      {
        menuItem: (
          <Menu.Item key="1" disabled header className="LogoAndTitle">
            <span id="ResetApp" onClick={this.resetApp}>
              <span className="LogoElement">
                <img
                  alt="OmicNavigator"
                  src={omicNavigatorIcon}
                  className="LogoImage"
                />
              </span>
              <span className="Header HeaderFirst">Omic</span>
              <span className="Header HeaderSecond">Navigator</span>
            </span>
          </Menu.Item>
        ),
      },
      {
        menuItem: 'Differential Analysis',
        pane: (
          <Tab.Pane key="2" className="">
            <Differential
              {...this.props}
              {...this.state}
              onHandleUrlChange={this.handleUrlChange}
              onHandleDifferentialFeatureIdKey={
                this.handleDifferentialFeatureIdKey
              }
              onResetFeatureToHighlightInDiffTable={
                this.resetFeatureToHighlightInDiffTable
              }
              // onPagedToFeature={this.handlePagedToFeature}
            />
          </Tab.Pane>
        ),
      },
      {
        menuItem: 'Enrichment Analysis',
        pane: (
          <Tab.Pane key="3" className="">
            <Enrichment
              {...this.props}
              {...this.state}
              onHandleUrlChange={this.handleUrlChange}
              onFindDifferentialFeature={this.findDifferentialFeature}
              onHandleDifferentialFeatureIdKey={
                this.handleDifferentialFeatureIdKey
              }
            />
          </Tab.Pane>
        ),
      },
    ];
    const TableValuePopupStyle = {
      backgroundColor: '2E2E2E',
      borderBottom: '2px solid var(--color-primary)',
      color: '#FFF',
      padding: '1em',
      maxWidth: '50vw',
      fontSize: '13px',
      wordBreak: 'break-all',
    };
    return (
      <>
        <Tab
          onTabChange={this.handleTabChange}
          panes={panes}
          activeIndex={activeIndex}
          renderActiveOnly={false}
          menu={{
            stackable: true,
            secondary: true,
            pointing: true,
            inverted: true,
            className: 'MenuContainer',
          }}
        />
        <span id="AppVersion">
          <Popup
            trigger={<Icon name="info" color="grey" />}
            style={TableValuePopupStyle}
            className="TablePopupValue"
            inverted
            basic
            // on='hover'
            position="left center"
          >
            <Popup.Content>
              App: {`v${appVersion}`}
              <br></br>Package: {`v${packageVersion}`}
            </Popup.Content>
          </Popup>
        </span>
      </>
    );
  }
}

export default withRouter(Tabs);
