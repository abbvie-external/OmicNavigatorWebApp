import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { Grid, Menu } from 'semantic-ui-react';

class TopBar extends Component {
  constructor(props) {
    super(props);
    const path =
      props.location.pathname === '/' ? '/pepplot' : props.location.pathname;
    this.state = {
      activeTab: path
    };
  }
  componentDidMount() {}

  handleTabClick = (e, { name }) => this.setState({ activeTab: name });

  render() {
    const { activeTab } = this.state;
    return (
      <Grid.Column className="TopBar" relaxed width={16}>
        <Menu inverted pointing secondary className="TopBar">
          <Menu.Item className="LogoEl">
            <img
              alt="Phosphoproteomic Analyzer"
              src="/icon.png"
              className="Logo"
            />
          </Menu.Item>
          <Menu.Item className="Title">
            <b>Phosphoproteomic</b>&nbsp;
            <span className="thinItalic">Analyzer</span>
          </Menu.Item>
          <Menu.Item
            as={Link}
            to="/pepplot"
            onClick={this.handleTabClick}
            className="Tab"
            name="/pepplot"
            active={activeTab === '/pepplot'}
          >
            Differential Phosophate Analysis
          </Menu.Item>

          <Menu.Item
            as={Link}
            to="/enrichment"
            onClick={this.handleTabClick}
            className="Tab"
            name="/enrichment"
            active={activeTab === '/enrichment'}
          >
            Enrichment Analysis
          </Menu.Item>
        </Menu>
      </Grid.Column>
    );
  }
}

export default withRouter(TopBar);
