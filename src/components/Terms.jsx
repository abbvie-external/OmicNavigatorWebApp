import React, { Component } from 'react';
import { Modal, Button, Header } from 'semantic-ui-react';

class Terms extends Component {
  state = {
    terms: null,
    termsOpen: false,
  };

  componentDidMount() {
    this.getTerms();
  }

  async getTerms() {
    try {
      let terms = await this.fetchTerms();
      this.setState({
        terms: terms,
      });
    } catch (e) {
      alert(e.message);
    }
  }

  async fetchTerms() {
    //   switch response to test file not that doesn't exist in public folder
    let response = await fetch('/Terms.html');
    // let response = await fetch('/Terms.txt');
    // read response stream as text
    let textData = await response.text();
    // we need to look for some specific string in the T&Cs because
    // if the .txt file doesn't exist, it prints out the html as a string
    if (textData.includes('OmicNavigator')) {
      return textData;
    } else return null;
  }

  toggleTerms = bool => {
    this.setState({
      termsOpen: bool,
    });
  };

  getTermsButton = () => {
    const { terms } = this.state;
    const self = this;
    return (
      <>
        <Button
          className="CursorPointer"
          id="TermsButton"
          name="file"
          onClick={() => self.toggleTerms(true)}
        >
          Terms
        </Button>
        <Modal
          size="small"
          closeOnDimmerClick={true}
          closeOnEscape={true}
          closeIcon
          centered={false}
          open={self.state.termsOpen}
          onOpen={() => self.toggleTerms(true)}
          onClose={() => self.toggleTerms(false)}
        >
          <Modal.Header>Terms &#38; Conditions</Modal.Header>
          <Modal.Content image>
            <Modal.Description>
              <div dangerouslySetInnerHTML={{ __html: terms }} />
            </Modal.Description>
          </Modal.Content>
        </Modal>
      </>
    );
  };

  render() {
    const { terms } = this.state;
    const termsButton = this.getTermsButton();
    return <>{terms && <span id="TermsButtonContainer">{termsButton}</span>}</>;
  }
}

export default Terms;
