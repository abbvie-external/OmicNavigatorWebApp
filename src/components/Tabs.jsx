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
    const pathnameInit = this.props.location.pathname.substring(1) || null;
    const pathname =
      pathnameInit !== null ? pathnameInit.replace(/–/gi, ' ') : pathnameInit;
    const params = pathname ? pathname.split('/') : '';
    const tabFromUrl = params[0] || '';
    const studyFromUrl = params[1] || '';
    const modelFromUrl = params[2] || '';
    const testFromUrl = params[3] || '';
    const siteFromUrl = params[4] || '';
    const descriptionFromUrl = params[5] || '';
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
              <img alt="Omic Analyzer" src="/icon.png" className="LogoImage" />
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
