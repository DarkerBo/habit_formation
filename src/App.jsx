import React, { Component } from 'react';
import store from './store';
import { Provider } from 'react-redux';
import RouterComponent from './routers';
import './assets/styles/index.scss';
import './assets/styles/iconfont.scss';
import './assets/styles/modal.scss';

class App extends Component {
  render() {
    return (
      <Provider store={store} key={Math.random()}>
        <div>
          <RouterComponent />
        </div>
      </Provider>
    );
  }
}

export default App;
