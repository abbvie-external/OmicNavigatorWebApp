import React from 'react';
import ReactDOM from 'react-dom';
import Container from './Container';
import * as serviceWorker from './serviceWorker';
import './index.css';
import 'semantic-ui-css/semantic.min.css';

import { createRoot } from 'react-dom/client';
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<Container />);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
