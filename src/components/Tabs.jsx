import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Grid, Tab, Menu } from 'semantic-ui-react';
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
    const modelFromUrlAndOr = params[2] || '';
    const modelFromUrl =
      modelFromUrlAndOr !== ''
        ? modelFromUrlAndOr.replace('and+or', 'and/or')
        : modelFromUrlAndOr;
    const testFromUrl = params[3] || '';
    const siteFromUrl = params[4] || '';
    if (tabFromUrl === 'pepplot') {
      this.state = {
        activeIndex: 2,
        tab: tabFromUrl,
        pepplotStudy: studyFromUrl || '',
        pepplotModel: modelFromUrl || '',
        pepplotTest: testFromUrl || '',
        pepplotProteinSite: siteFromUrl || '',
        enrichmentStudy: '',
        enrichmentModel: '',
        enrichmentAnnotation: '',
        pValueType: 'nominal'
      };
    } else {
      this.state = {
        activeIndex: 3,
        tab: tabFromUrl,
        enrichmentStudy: studyFromUrl || '',
        enrichmentModel: modelFromUrl || '',
        enrichmentAnnotation: testFromUrl || '',
        enrichmentDescriptionAndTest: siteFromUrl || '',
        pepplotStudy: '',
        pepplotModel: '',
        pepplotTest: '',
        pepplotProteinSite: '',
        pValueType: 'nominal'
      };
    }
  }

  componentDidMount() {
    updateUrl(
      this.props,
      this.state,
      null,
      'tabInit',
      this.setTabIndex,
      false,
      null
    );
  }

  setTabIndex = tabIndex => {
    this.setState({
      activeIndex: tabIndex
    });
  };

  handlePValueTypeChange = type => {
    this.setState({
      pValueType: type
    });
  };

  handleTabChange = (e, { activeIndex }) => {
    let newTab = activeIndex === 3 ? 'pepplot' : 'enrichment';
    this.setState({
      tab: newTab
    });
    updateUrl(
      this.props,
      this.state,
      null,
      'tabChange',
      this.setTabIndex,
      false,
      null
    );
  };

  handleSearchCriteriaToTop = (changes, tab) => {
    if (tab === 'pepplot') {
      this.setState({
        tab: 'pepplot',
        pepplotStudy: changes.pepplotStudy || '',
        pepplotModel: changes.pepplotModel || '',
        pepplotTest: changes.pepplotTest || '',
        pepplotProteinSite: changes.pepplotProteinSite || ''
      });
    } else if (tab === 'enrichment') {
      this.setState({
        tab: 'enrichment',
        enrichmentStudy: changes.enrichmentStudy || '',
        enrichmentModel: changes.enrichmentModel || '',
        enrichmentAnnotation: changes.enrichmentAnnotation || '',
        enrichmentDescriptionAndTest: changes.enrichmentDescriptionAndTest || ''
      });
    }
    updateUrl(
      this.props,
      this.state,
      changes,
      'tabInit',
      this.setTabIndex,
      true,
      tab
    );
  };

  render() {
    const { activeIndex } = this.state;
    const panes = [
      {
        menuItem: (
          <Menu.Item key="1" disabled className="LogoElement">
            <img
              alt="Phosphoproteomic Analyzer"
              src="/icon.png"
              className="LogoImage"
            />
          </Menu.Item>
        )
      },
      {
        menuItem: (
          <Menu.Item key="2" header disabled className="Title">
            <b>Phosphoproteomic</b>&nbsp;
            <span className="TitleTextStyle">Analyzer</span>
          </Menu.Item>
        )
      },
      {
        menuItem: 'Differential Phosophate Analysis',
        pane: (
          <Tab.Pane key="3" className="">
            <Grid>
              <Pepplot
                {...this.props}
                {...this.state}
                onSearchCriteriaToTop={this.handleSearchCriteriaToTop}
              />
            </Grid>
          </Tab.Pane>
        )
      },
      {
        menuItem: 'Enrichment Analysis',
        pane: (
          <Tab.Pane key="4" className="">
            <Grid>
              <Enrichment
                {...this.props}
                {...this.state}
                onSearchCriteriaToTop={this.handleSearchCriteriaToTop}
                onPValueTypeChange={this.handlePValueTypeChange}
              />
            </Grid>
          </Tab.Pane>
        )
      }
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
          className: 'MenuContainer'
        }}
      />
    );
  }
}

export default withRouter(Tabs);
