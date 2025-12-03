import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import {
  Tab,
  Menu,
  Popup,
  Icon,
  Modal,
  Button,
  Header,
} from 'semantic-ui-react';
import { omicNavigatorService } from '../services/omicNavigator.service';
import Differential from './Differential/Differential';
import omicNavigatorIcon from '../resources/icon.png';
import Enrichment from './Enrichment/Enrichment';
import { updateUrl } from './Shared/UrlControl';
class Tabs extends Component {
  constructor(props) {
    super(props);
    const baseUrlVar =
      process.env.NODE_ENV === 'development'
        ? process.env.REACT_APP_DEVSERVER
        : window.location.origin;
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
      appLoading: false,
      baseUrl: baseUrlVar,
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
      differentialFeatureIdKey: '',
      filteredDifferentialFeatureIdKey: '',
      // when updating the app version, change one line in 3 files: package.json, mzanifest.json and Tabs.jsx
      appVersion: '2.2.6',
      packageVersion: '',
      infoOpen: false,
      screenWidth: window.innerWidth,
    };
    this.handleResize = this.handleResize.bind(this);
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
    this.getPackageVersion();
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    // Remove the event listener when the component is unmounted
    window.removeEventListener('resize', this.handleResize);
  }

  handleResize() {
    // Update the state with the new screen width when the resize event occurs
    this.setState({
      screenWidth: window.innerWidth,
    });
  }

  setTabIndex = (tabIndex) => {
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

  getPackageVersion = () => {
    omicNavigatorService
      .getPackageVersion()
      .then((packageVersionResponseData) => {
        this.setState({
          packageVersion: packageVersionResponseData,
        });
      })
      .catch((error) => {
        console.error('Error during packageVersion', error);
      });
  };

  resetFeatureToHighlightInDiffTable = () => {
    this.setState({ featureToHighlightInDiffTable: '' });
  };

  toggleInfoFirst = (bool) => {
    this.setState({
      infoOpen: bool,
    });
  };

  getInfoButton = () => {
    const { appVersion, packageVersion } = this.state;
    const self = this;
    const TableValuePopupStyle = {
      backgroundColor: '2E2E2E',
      borderBottom: '2px solid var(--color-primary)',
      color: '#FFF',
      padding: '1em',
      maxWidth: '50vw',
      fontSize: '13px',
      wordBreak: 'break-all',
    };
    const MailToString = `mailto:OmicNavigator@abbvie.com?body=App: v${appVersion}, Package: v${packageVersion}`;
    return (
      <span>
        <Popup
          trigger={
            <Icon
              className="CursorPointer"
              id="HelpButton"
              color="grey"
              name="info"
              onClick={() => self.toggleInfoFirst(true)}
            />
          }
          style={TableValuePopupStyle}
          className="TablePopupValue"
          inverted
          basic
        >
          <Popup.Content>
            App: {`v${appVersion}`}
            <br></br>Package: {`v${packageVersion}`}
            <br></br>
            <span className="MarginRight">
              Click <Icon name="info" size="small" />
              to open an issue
            </span>{' '}
          </Popup.Content>
        </Popup>
        <Modal
          size="small"
          closeOnDimmerClick={true}
          closeOnEscape={true}
          closeIcon
          centered={false}
          open={self.state.infoOpen}
          onOpen={() => self.toggleInfoFirst(true)}
          onClose={() => self.toggleInfoFirst(false)}
        >
          <Modal.Header>Issues or questions?</Modal.Header>
          <Modal.Content image>
            <Modal.Description>
              <Header size="small">
                <span className="MarginRight">App: {`v${appVersion}`}</span>
                <span className="MarginRight">
                  Package: {`v${packageVersion}`}
                </span>
              </Header>
              <p>
                To report a bug, please email the developers at{' '}
                <a
                  href={MailToString}
                  rel="noreferrer"
                  alt="Email OmicNavigator Team"
                  target="_blank"
                  onClick={() => (window.location.href = MailToString)}
                >
                  OmicNavigator@abbvie.com
                </a>
                . Please include the app and package versions listed above.
              </p>
            </Modal.Description>
          </Modal.Content>
          <Modal.Actions>
            <Button
              primary
              onClick={() => (window.location.href = MailToString)}
            >
              Email OmicNavigator
            </Button>
          </Modal.Actions>
        </Modal>
      </span>
    );
  };

  getSmallScreenMessage = () => {
    const { screenWidth } = this.state;
    return (
      <span id="SmallScreenOverlay">
        <span className="LogoElement">
          <img
            alt="OmicNavigator"
            src={omicNavigatorIcon}
            id="SmallScreenLogoImage"
          />
        </span>
        <span id="SmallScreenHeaderFirst">Omic</span>
        <span id="SmallScreenHeaderSecond">Navigator</span>
        <span id="SmallScreenText">
          For an optimal experience, Omic Navigator is best viewed on screens
          1024+ pixels wide. Your screen is {screenWidth} pixels wide.
        </span>
      </span>
    );
  };

  getLoadingMessage = () => {
    return (
      <span id="AppLoadingOverlay">
        <div id="AppLoadingLogoDiv">
          <span className="LogoElement">
            <img
              alt="OmicNavigator"
              src={omicNavigatorIcon}
              id="AppLoadingLogoImage"
            />
          </span>
          <span id="AppLoadingHeaderFirst">Omic</span>
          <span id="AppLoadingHeaderSecond">Navigator</span>
        </div>
        <div id="AppLoadingText">Loading Studies...</div>
      </span>
    );
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
        differentialFeatureIdKey: '',
        filteredDifferentialFeatureIdKey: '',
      },
      function () {
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
    const { appLoading, activeIndex, screenWidth } = this.state;
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
    const InfoButton = this.getInfoButton();
    const SmallScreenMessage = this.getSmallScreenMessage();
    const LoadingMessage = this.getLoadingMessage();
    return (
      <>
        {screenWidth < 1024 ? SmallScreenMessage : null}
        {appLoading ? LoadingMessage : null}
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
        <span id="AppVersion">{InfoButton}</span>
      </>
    );
  }
}

export default withRouter(Tabs);
