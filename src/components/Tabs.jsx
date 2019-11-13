import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Grid, Tab, Menu } from 'semantic-ui-react';
import PepplotContainer from './Pepplot';
import EnrichmentContainer from './Enrichment';
import { updateUrl } from './UrlControl';

class Tabs extends Component {
  constructor(props) {
    super(props);
    debugger;
    const pathnameInit = this.props.location.pathname.substring(1) || null;
    const pathname =
      pathnameInit !== null ? pathnameInit.replace(/-/gi, ' ') : pathnameInit;
    const params = pathname ? pathname.split('/') : '';
    const tabFromUrl = params[0] || '';
    const studyFromUrl = params[1] || '';
    const modelFromUrl = params[2] || '';
    const testFromUrl = params[3] || '';
    const proteinSiteFromUrl = params[4] || '';
    if (tabFromUrl === 'pepplot') {
      this.state = {
        activeIndex: 2,
        tab: tabFromUrl,
        pepplotStudy: studyFromUrl || '',
        pepplotModel: modelFromUrl || '',
        pepplotTest: testFromUrl || '',
        pepplotProteinSite: proteinSiteFromUrl || '',
        enrichmentStudy: '',
        enrichmentModel: '',
        enrichmentAnnotation: ''
      };
    } else {
      this.state = {
        activeIndex: 3,
        tab: tabFromUrl,
        enrichmentStudy: studyFromUrl || '',
        enrichmentModel: modelFromUrl || '',
        enrichmentAnnotation: testFromUrl || '',
        pepplotStudy: '',
        pepplotModel: '',
        pepplotTest: '',
        pepplotProteinSite: ''
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

  handleTabChange = (e, { activeIndex }) => {
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
        pepplotStudy: changes.pepplotStudy || '',
        pepplotModel: changes.pepplotModel || '',
        pepplotTest: changes.pepplotTest || '',
        pepplotProteinSite: changes.pepplotProteinSite || ''
      });
    } else if (tab === 'enrichment') {
      this.setState({
        enrichmentStudy: changes.enrichmentStudy || '',
        enrichmentModel: changes.enrichmentModel || '',
        enrichmentAnnotation: changes.enrichmentAnnotation || ''
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
              <PepplotContainer
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
              <EnrichmentContainer
                {...this.props}
                {...this.state}
                onSearchCriteriaToTop={this.handleSearchCriteriaToTop}
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
