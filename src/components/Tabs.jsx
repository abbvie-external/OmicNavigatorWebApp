import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Tab, Menu } from 'semantic-ui-react';
import { phosphoprotService } from '../services/phosphoprot.service';
import Pepplot from './Pepplot/Pepplot';
import Enrichment from './Enrichment/Enrichment';
import { updateUrl } from './Shared/UrlControl';

class Tabs extends Component {
  constructor(props) {
    super(props);
    console.log('this.props is ', this.props);
    const pathnameInit = this.props.location.pathname.substring(1) || null;
    console.log('pathnameInit is ', pathnameInit);
    const pathname =
      pathnameInit !== null ? pathnameInit.replace(/–/gi, ' ') : pathnameInit;
    const params = pathname ? pathname.split('/') : '';
    console.log('pathname is ', pathname);
    console.log('params are');
    console.log(params);
    let i = 0;
    if (process.env.NODE_ENV === 'production') {
      i = 4;
    }
    const tabFromUrl = params[i] || '';
    console.log('[Tabs.jsx] tabFromUrl is ', tabFromUrl);
    const studyFromUrl = params[i + 1] || '';
    console.log('[Tabs.jsx] studyFromUrl is ', studyFromUrl);
    const modelFromUrl = params[i + 2] || '';
    console.log('[Tabs.jsx] modelFromUrl is ', modelFromUrl);
    const testFromUrl = params[i + 3] || '';
    console.log('[Tabs.jsx] testFromUrl is ', testFromUrl);
    const siteFromUrl = params[i + 4] || '';
    console.log('[Tabs.jsx] siteFromUrl is ', siteFromUrl);
    const descriptionFromUrl = params[i + 5] || '';
    console.log('[Tabs.jsx] descriptionFromUrl is ', descriptionFromUrl);
    const siteAndDescription =
      descriptionFromUrl !== ''
        ? `${siteFromUrl}/${descriptionFromUrl}`
        : siteFromUrl;
    const decodedStudy = decodeURI(studyFromUrl);
    const decodedModel = decodeURI(modelFromUrl);
    const decodedTest = decodeURI(testFromUrl);
    const decodedSiteAndDescription = decodeURI(siteAndDescription);
    const isEnrichment = tabFromUrl === 'enrichment';
    this.state = {
      activeIndex: isEnrichment ? 3 : 2,
      tab: tabFromUrl,
      enrichmentStudy: isEnrichment ? decodedStudy : '',
      enrichmentModel: isEnrichment ? decodedModel : '',
      enrichmentAnnotation: isEnrichment ? decodedTest : '',
      enrichmentDescriptionAndTest: isEnrichment
        ? decodedSiteAndDescription
        : '',
      pepplotStudy: !isEnrichment ? decodedStudy : '',
      pepplotModel: !isEnrichment ? decodedModel : '',
      pepplotTest: !isEnrichment ? decodedTest : '',
      pepplotProteinSite: !isEnrichment ? decodedSiteAndDescription : '',
      pValueType: 'nominal',
      proteinToHighlightInDiffTable: isEnrichment ? false : '',
      allStudiesMetadata: [],
      pepplotFeatureIdKey: '',
    };
  }

  componentDidMount() {
    console.log('[Tabs.jsx] componentDidMountt()');
    console.log('[Tabs.jsx]', window.location.href);
    updateUrl(
      this.props,
      this.state,
      null,
      'tabInit',
      this.setTabIndex,
      false,
      null,
    );
    console.log('[Tabs.jsx] ', this.props);
    console.log('[Tabs.jsx]', this.state);
    console.log('[Tabs.jsx]', window.location.href);
    this.getStudies();
  }

  setTabIndex = tabIndex => {
    this.setState({
      activeIndex: tabIndex,
    });
  };

  handlePValueTypeChange = type => {
    this.setState({
      pValueType: type,
    });
  };

  handleTabChange = (e, { activeIndex }) => {
    let newTab = activeIndex === 3 ? 'pepplot' : 'enrichment';
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
  };

  handleSearchCriteriaToTop = (changes, tab) => {
    if (tab === 'pepplot') {
      this.setState({
        tab: 'pepplot',
        pepplotStudy: changes.pepplotStudy || '',
        pepplotModel: changes.pepplotModel || '',
        pepplotTest: changes.pepplotTest || '',
        pepplotProteinSite: changes.pepplotProteinSite || '',
        proteinHighlightInProgress: false,
      });
    } else if (tab === 'enrichment') {
      this.setState({
        tab: 'enrichment',
        enrichmentStudy: changes.enrichmentStudy || '',
        enrichmentModel: changes.enrichmentModel || '',
        enrichmentAnnotation: changes.enrichmentAnnotation || '',
        enrichmentDescriptionAndTest:
          changes.enrichmentDescriptionAndTest || '',
        proteinHighlightInProgress: false,
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
  handlePepplotFeatureIdKey = id => {
    this.setState({
      pepplotFeatureIdKey: id,
    });
  };
  handleViewDiffTable = (test, protein) => {
    this.setState({
      activeIndex: 1,
      tab: 'pepplot',
      pepplotStudy: this.state.enrichmentStudy || '',
      pepplotModel: this.state.enrichmentModel || '',
      pepplotTest: test || '',
      proteinToHighlightInDiffTable: protein,
      proteinHighlightInProgress: true,
    });
    let changes = {
      pepplotStudy: this.state.enrichmentStudy || '',
      pepplotModel: this.state.enrichmentModel || '',
      pepplotTest: test || '',
    };
    updateUrl(
      this.props,
      this.state,
      changes,
      'tabChange',
      this.setTabIndex,
      true,
      'pepplot',
    );
  };

  getStudies = () => {
    phosphoprotService
      .listStudies()
      .then(listStudiesResponseData => {
        this.setState({
          allStudiesMetadata: listStudiesResponseData,
        });
      })
      .catch(error => {
        console.error('Error during listStudies', error);
      });
  };

  render() {
    const { activeIndex } = this.state;
    const panes = [
      {
        menuItem: (
          <Menu.Item key="1" disabled header className="LogoAndTitle">
            <span className="LogoElement">
              <img alt="Omic Analyzer" src="./icon.png" className="LogoImage" />
            </span>
            <span className="Header HeaderFirst">Omic&nbsp;</span>
            <span className="Header HeaderSecond">Analyzer</span>
          </Menu.Item>
        ),
      },
      {
        menuItem: 'Differential Analysis',
        pane: (
          <Tab.Pane key="2" className="">
            <Pepplot
              {...this.props}
              {...this.state}
              onSearchCriteriaToTop={this.handleSearchCriteriaToTop}
              onHandlePepplotFeatureIdKey={this.handlePepplotFeatureIdKey}
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
              onSearchCriteriaToTop={this.handleSearchCriteriaToTop}
              onPValueTypeChange={this.handlePValueTypeChange}
              onViewDiffTable={this.handleViewDiffTable}
              onHandlePepplotFeatureIdKey={this.handlePepplotFeatureIdKey}
            />
          </Tab.Pane>
        ),
      },
    ];

    return (
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
    );
  }
}

export default withRouter(Tabs);
