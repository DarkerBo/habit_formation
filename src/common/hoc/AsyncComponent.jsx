import React, { Component } from 'react';

// 实现路由懒加载的高阶组件
export default importComponent => {
  class AsyncComponent extends Component {
    constructor(props) {
      super(props);
      this.state = {
        component: null,
      };
    }

    async componentDidMount() {
      // 通过变量解构赋值,把组件元素赋值给变量component
      const { default: component } = await importComponent();
      this.setState({ component });
    }

    render() {
      const { component: Component } = this.state;
      return Component ? <Component {...this.props} /> : null;
    }
  }

  return AsyncComponent;
};
