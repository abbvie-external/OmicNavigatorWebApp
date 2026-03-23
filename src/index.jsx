import React from 'react';
import { createRoot } from 'react-dom/client';

import Container from './Container';
import * as serviceWorker from './serviceWorker';
import './components/Shared/QHGrid/index.css';
import './index.css';
import 'semantic-ui-css/semantic.min.css';

const root = createRoot(document.getElementById('root'));
root.render(<Container />);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
