import React, { Component } from 'react';
import { Carousel } from 'antd-mobile';
import styles from './ImagesView.module.scss';
import './ImagesView.scss';
import classNames from 'classnames';

class ImagesView extends Component {
  closeView = () => {
    this.props.handleCloseView();
  };

  render() {
    const { selectedIndex, pictureArray } = this.props;

    return (
      <div className={styles.container} onClick={this.closeView}>
        <Carousel autoplay={false} infinite selectedIndex={selectedIndex || 0} className={styles.carousel}>
          {pictureArray.map((item, index) => (
            <a key={index} className={classNames(styles.carouselItem, 'image-view-item')}>
              <img src={item} alt="图片展示" key={index} style={{ width: '100%', verticalAlign: 'top' }} />
            </a>
          ))}
        </Carousel>
      </div>
    );
  }
}

export default ImagesView;
