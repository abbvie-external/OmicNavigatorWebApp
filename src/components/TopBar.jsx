import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
// import { client } from '../Client';
import { Grid, Menu } from 'semantic-ui-react';

class TopBar extends Component {
  state = { activeTab: 'pepplot' };

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
          <Link to={{ pathname: `/pepplot` }}>
            <Menu.Item
              onClick={this.handleTabClick}
              className="Tab"
              name="pepplot"
              active={activeTab === 'pepplot'}
            >
              Differential Phosophate Analysis
            </Menu.Item>
          </Link>

          <Link to={{ pathname: `/enrichment` }}>
            <Menu.Item
              onClick={this.handleTabClick}
              className="Tab"
              name="enrichment"
              active={activeTab === 'enrichment'}
            >
              Enrichment Analysis
            </Menu.Item>
          </Link>
        </Menu>
      </Grid.Column>
    );
  }
}

export default TopBar;
