import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Grid, Tab, Menu } from 'semantic-ui-react';
import PepplotContainer from './Pepplot';
import EnrichmentContainer from './Enrichment';
import { updateUrl } from './UrlControl';

class Tabs extends Component {
  constructor(props) {
    super(props);
    const pathname = this.props.location.pathname.substring(1) || null;
    const params = pathname ? pathname.split('/') : '';
    const tabFromUrl = params[0] || '';
    const pepplotStudyFromUrl = params[1] || '';
    const pepplotModelFromUrl = params[2] || '';
    const pepplotTestFromUrl = params[3] || '';
    const pepplotProteinSiteFromUrl = params[4] || '';

    this.state = {
      activeIndex: 2,
      tab: tabFromUrl || 'pepplot',
      pepplotStudy: pepplotStudyFromUrl || '',
      pepplotModel: pepplotModelFromUrl || '',
      pepplotTest: pepplotTestFromUrl || '',
      pepplotProteinSite: pepplotProteinSiteFromUrl || ''
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

  handleSearchCriteriaToTop = changes => {
    this.setState({
      pepplotStudy: changes.pepplotStudy || '',
      pepplotModel: changes.pepplotModel || '',
      pepplotTest: changes.pepplotTest || '',
      pepplotProteinSite: changes.pepplotProteinSite || ''
    });
    updateUrl(
      this.props,
      this.state,
      changes,
      'tabInit',
      this.setTabIndex,
      true,
      'pepplot'
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
              <EnrichmentContainer {...this.props} {...this.state} />
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
