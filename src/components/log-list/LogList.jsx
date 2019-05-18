import React, { Component } from 'react';
import styles from './LogList.module.scss';
import classNames from 'classnames';
import ImagesView from '@/components/images-view/ImagesView';
import ForMatDateUtil from '@/utils/format-days';

class LogList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imageView: false, // 展示图片组件是否显示
      selectedIndex: 0, // 选择要放大展示的图片
      selectedId: 0, // 根据ID来弹出对应的图片展示页面
    };
  }

  // 改变点赞状态
  changeLike = id => {
    this.props.changeLogLike(id);
  };

  // 点击评论
  clickComment = id => {
    this.props.clickLogComment(id);
  };

  // 点击出现图片展示
  imageClick = (selectedIndex, selectedId) => {
    this.setState({
      imageView: true,
      selectedIndex,
      selectedId,
    });
  };

  // 点击关闭图片展示
  closeView = () => {
    this.setState({
      imageView: false,
    });
  };

  // 渲染性别
  renderSex = sex => {
    if (sex === '1') {
      return <i className={classNames(styles.sexIcon, 'icon-sexm', 'iconfont')} style={{ color: '#0088cc' }} />;
    } else if (sex === '2') {
      return <i className={classNames(styles.sexIcon, 'icon-sexw', 'iconfont')} style={{ color: '#e46993' }} />;
    }
  };

  // 渲染状态
  renderStatus = (private_log, topping) => {
    if (private_log === '1') {
      return (
        <>
          <i className={classNames(styles.privateIcon, 'icon-3701mima', 'iconfont')} />
          <span className={styles.toppingText}>私密</span>
        </>
      );
    } else if (topping === '1') {
      return (
        <>
          <i className={classNames(styles.toppingIcon, 'icon-icon-test', 'iconfont')} />
          <span className={styles.toppingText}>热门</span>
        </>
      );
    }
  };

  // 渲染照片墙
  renderImageWall = (picture, id) => {
    const pictureArray = picture.split(',');
    if (pictureArray.length === 1 && pictureArray[0]) {
      return (
        <img
          src={pictureArray[0]}
          alt="日志图片"
          className={styles.oneLogImage}
          onClick={() => this.imageClick(0, id)}
        />
      );
    } else if (pictureArray.length > 1) {
      return (
        <div className={styles.imageWall}>
          {pictureArray.map((item, index) => (
            <img
              key={index}
              src={item}
              alt="日志图片"
              className={styles.moreLogImage}
              onClick={() => this.imageClick(index, id)}
            />
          ))}
        </div>
      );
    }
  };

  render() {
    const { logInfo } = this.props;
    const { imageView, selectedIndex, selectedId } = this.state;

    return (
      <div>
        {/* 空状态 */}
        {!logInfo || logInfo.length < 1 ? (
          <div className={styles.empty}>
            <i className={classNames(styles.emptyIcon, 'icon-empty', 'iconfont')} />
            <span>还没有日志信息哦~</span>
          </div>
        ) : (
          <div className={styles.logList}>
            {logInfo.map(item => (
              <div className={styles.logItem} key={item.id}>
                {/* 图片展示 */}
                {imageView && selectedId === item.id && (
                  <ImagesView
                    selectedIndex={selectedIndex}
                    handleCloseView={this.closeView}
                    pictureArray={item.picture.split(',')}
                  />
                )}

                <div className={styles.contentContainer}>
                  {/* 日志头部 */}
                  <div className={styles.logHeader}>
                    <div className={styles.author}>
                      <div className={styles.avatar}>
                        {item.avatar ? (
                          <img src={item.avatar} alt="avatar" className={styles.avatarImage} />
                        ) : (
                          <i className={classNames(styles.userIcon, 'icon-touxiang', 'iconfont')} />
                        )}
                      </div>
                      <span className={styles.nickname}>{item.nickname}</span>
                      {/* 性别图标 */}
                      {this.renderSex(item.sex)}
                    </div>

                    <div className={styles.topping}>{this.renderStatus(item.private_log, item.topping)}</div>
                  </div>

                  {/* 坚持习惯 */}
                  <div className={styles.habitContainer}>
                    <span className={styles.habit}>今天已打卡{item.name}习惯</span>
                    <span className={styles.time}>{ForMatDateUtil.timesToNow(item.create_time)}</span>
                  </div>

                  {/* 日志内容 */}
                  <div className={styles.content}>{item.content}</div>

                  {/* 图片容器 */}
                  <div className={styles.imageContainer}>{this.renderImageWall(item.picture, item.id)}</div>
                </div>

                {/* 点赞 + 评论 */}
                <div className={styles.messageContainer}>
                  <div className={styles.message} onClick={() => this.changeLike(item.id)}>
                    {item.pid ? (
                      <i className={classNames(styles.likeIcon, 'icon-bqxin', 'iconfont')} />
                    ) : (
                      <i className={classNames(styles.messageIcon, 'icon-03', 'iconfont')} />
                    )}

                    <span className={styles.messageNum}>{item.like_count}</span>
                  </div>

                  <div className={styles.message} onClick={() => this.clickComment(item.id)}>
                    <i className={classNames(styles.messageIcon, 'icon-comment', 'iconfont')} />
                    <span className={styles.messageNum}>{item.comment_count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}

export default LogList;
