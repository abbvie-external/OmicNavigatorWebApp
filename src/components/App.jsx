import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import Tabs from './Tabs';
import './App.scss';

const App = () => (
  <div className="AppContainer">
    <ToastContainer autoClose={5000} />
    <div className="TopBar">
      <Tabs></Tabs>
    </div>
  </div>
);

export default App;
