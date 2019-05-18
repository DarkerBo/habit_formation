import React, { Component } from 'react';
import { NavBar, Icon, Modal, Popover, Toast } from 'antd-mobile';
import '@/assets/styles/navbar.scss';
import styles from './LogDetail.module.scss';
import classNames from 'classnames';
import ImagesView from '@/components/images-view/ImagesView';
import validateForm from '@/utils/form-validation';
import {
  getLogDetail,
  createLogLike,
  deleteLogLike,
  createLogComment,
  getLogCommentList,
  getLogCommentBySort,
  deleteLogComment,
  changeLogPrivate,
  deleteLog,
} from '@/services/log';
import ForMatDateUtil from '@/utils/format-days';

class LogDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imageView: false, // 展示图片组件是否显示
      selectedIndex: 0, // 选择要放大展示的图片
      isAtFirst: false, // 是否按最初时间排序
      visible: false, // 是否显示气泡组件
      logDetailInfo: null, // 日志详情信息
      commentInfo: null, // 评论信息
      uid: window.localStorage.getItem('uid'), // 当前用户的ID
      isPrivate: false, //是否为私密日志
    };
  }

  componentDidMount() {
    this.getDetailInfo();
  }

  // 获取日志详情和评论列表信息
  getDetailInfo = async () => {
    const { match } = this.props;
    const id = match.params.id;
    const result = await getLogDetail({ id });
    if (result.data.code === '1') return Toast.info(result.data.message, 1);

    const commentResult = await getLogCommentList({ log_id: id, pageNo: 1, pageSize: 1000000 });
    if (commentResult.data.code === '1') return Toast.info(commentResult.data.message, 1);

    this.setState({
      logDetailInfo: result.data.data[0],
      isPrivate: result.data.data[0].private_log === '1',
      commentInfo: commentResult.data.data.result,
    });
  };

  // 改变特定日志的状态
  setLogStatus = async id => {
    let { logDetailInfo } = this.state;
    const logReq = { id };
    const logResult = await getLogDetail(logReq);
    if (logResult.data.code === '1') return Toast.info(logResult.data.message, 1);
    logDetailInfo = logResult.data.data[0];
    this.setState({
      logDetailInfo,
    });
  };

  // 改变点赞状态
  changeLike = async () => {
    const { logDetailInfo } = this.state;
    const { match } = this.props;
    const id = match.params.id;

    // 只改变状态变化的那天日志数据，而不是整个日志数组
    if (!logDetailInfo.pid) {
      const req = { log_id: id };
      const result = await createLogLike(req);
      if (result.data.code === '1') return Toast.info(result.data.message, 1);
      this.setLogStatus(id);
      Toast.info('点赞成功！', 1);
    } else {
      const req = { log_id: id };
      const result = await deleteLogLike(req);
      if (result.data.code === '1') return Toast.info(result.data.message, 1);
      this.setLogStatus(id);
      Toast.info('取消点赞成功！', 1);
    }
  };

  // 点击出现图片展示
  imageClick = selectedIndex => {
    this.setState({
      imageView: true,
      selectedIndex,
    });
  };

  // 点击关闭图片展示
  closeView = () => {
    this.setState({
      imageView: false,
    });
  };

  // 回退按钮
  clickBack = () => {
    const { history } = this.props;
    history.goBack();
  };

  // 改变排序
  changeSort = async () => {
    const { isAtFirst } = this.state;
    const { match } = this.props;
    const id = match.params.id;

    const req = { log_id: id, sort: isAtFirst ? '0' : '1', pageNo: 1, pageSize: 100000 };
    const result = await getLogCommentBySort(req);
    if (result.data.code === '1') return Toast.info(result.data.message, 1);

    this.setState({
      isAtFirst: !isAtFirst,
      commentInfo: result.data.data.result,
    });
  };

  // 删除评论
  deleteComment = id => {
    const { match } = this.props;
    const log_id = match.params.id;

    // 需要用promise才不会报错
    Modal.alert('Delete', '确定要删除该评论？', [
      {
        text: '取消',
        onPress: () =>
          new Promise(resolve => {
            setTimeout(() => {
              resolve();
            }, 0);
          }),
      },
      {
        text: '确定',
        onPress: () =>
          new Promise((resolve, reject) => {
            setTimeout(async () => {
              const result = await deleteLogComment({ id, log_id });
              if (result.data.code === '0') {
                resolve();
                Toast.info('删除评论成功', 1);
                this.getDetailInfo();
              } else {
                reject();
                Toast.info(result.data.message, 1);
              }
            }, 0);
          }),
      },
    ]);
  };

  // 点击评论
  clickComment = () => {
    const { match } = this.props;
    const id = match.params.id;

    // 需要用promise才不会报错
    Modal.prompt('请输入评论', '不超过100字', [
      {
        text: '关闭',
        onPress: value =>
          new Promise(resolve => {
            setTimeout(() => {
              resolve();
            }, 0);
          }),
      },
      {
        text: '确认',
        onPress: value =>
          new Promise((resolve, reject) => {
            setTimeout(async () => {
              const validateMessage = validateForm([{ value, name: '评论内容', required: true, maxLength: 100 }]);
              if (validateMessage) {
                reject();
                return Toast.info(validateMessage, 1);
              }

              const req = { content: value, status: '0', log_id: id };
              const result = await createLogComment(req);
              if (result.data.code === '1') {
                reject();
                return Toast.info(result.data.message, 1);
              }
              this.getDetailInfo();
              resolve();
            }, 0);
          }),
      },
    ]);
  };

  // 选择气泡框操作
  onSelect = async opt => {
    const { match, history } = this.props;
    const id = match.params.id;
    const { isPrivate } = this.state;

    if (opt.props.value === 'clickPrivate') {
      // 点击设为私密/公开
      const req = { id, private_log: isPrivate ? '0' : '1' };
      const result = await changeLogPrivate(req);
      if (result.data.code === '1') return Toast.info(result.data.message, 1);
      this.getDetailInfo();
      Toast.info('更改日志状态成功', 1);
    } else {
      // 点击删除日志
      // 需要用promise才不会报错
      Modal.alert('Delete', '确定要删除该日志？', [
        {
          text: '取消',
          onPress: () =>
            new Promise(resolve => {
              setTimeout(() => {
                resolve();
              }, 0);
            }),
        },
        {
          text: '确定',
          onPress: () =>
            new Promise((resolve, reject) => {
              setTimeout(async () => {
                const result = await deleteLog({ id });
                if (result.data.code === '0') {
                  resolve();
                  Toast.info('删除日志成功', 1);
                  history.goBack();
                } else {
                  reject();
                  Toast.info(result.data.message, 1);
                }
              }, 0);
            }),
        },
      ]);
    }

    this.setState({
      visible: false,
    });
  };

  // 显示/关闭气泡框
  handleVisibleChange = visible => {
    this.setState({
      visible,
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
  renderImageWall = picture => {
    const pictureArray = picture.split(',');
    if (pictureArray.length === 1 && pictureArray[0]) {
      return (
        <img src={pictureArray[0]} alt="日志图片" className={styles.oneLogImage} onClick={() => this.imageClick(0)} />
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
              onClick={() => this.imageClick(index)}
            />
          ))}
        </div>
      );
    }
  };

  render() {
    const { imageView, selectedIndex, isAtFirst, logDetailInfo, commentInfo, uid, isPrivate } = this.state;

    return (
      <div className={styles.container}>
        {/* 图片展示 */}
        {imageView && (
          <ImagesView
            pictureArray={logDetailInfo.picture.split(',')}
            selectedIndex={selectedIndex}
            handleCloseView={this.closeView}
          />
        )}

        {/* 顶部栏 */}
        <NavBar
          icon={<Icon type="left" size="lg" />}
          onLeftClick={this.clickBack}
          rightContent={
            logDetailInfo &&
            logDetailInfo.user_id === Number(uid) && (
              <Popover
                overlayClassName="fortest"
                overlayStyle={{ color: 'currentColor' }}
                visible={this.state.visible}
                overlay={[
                  <Popover.Item key="0" value="clickPrivate" data-seed="logId">
                    设为{isPrivate ? '公开' : '私密'}
                  </Popover.Item>,
                  <Popover.Item key="1" value="clickDelete" style={{ whiteSpace: 'nowrap' }}>
                    删除日志
                  </Popover.Item>,
                ]}
                align={{
                  overflow: { adjustY: 0, adjustX: 20 },
                  offset: [-10, 0],
                }}
                onVisibleChange={this.handleVisibleChange}
                onSelect={this.onSelect}
              >
                <div
                  style={{
                    height: '100%',
                    padding: '0 15px',
                    marginRight: '-15px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Icon type="ellipsis" />
                </div>
              </Popover>
            )
          }
          mode="dark"
          style={{ position: 'sticky', top: 0, zIndex: 2 }}
        >
          日志详情
        </NavBar>

        {/* 日志内容 */}
        {logDetailInfo && (
          <div className={styles.logContainer}>
            <div className={styles.logHeader}>
              <div className={styles.author}>
                <div className={styles.avatar}>
                  {logDetailInfo.avatar ? (
                    <img src={logDetailInfo.avatar} alt="avatar" className={styles.avatarImage} />
                  ) : (
                    <i className={classNames(styles.userIcon, 'icon-touxiang', 'iconfont')} />
                  )}
                </div>
                <div className={styles.user}>
                  <div className={styles.nicknameContainer}>
                    <span className={styles.nickname}>{logDetailInfo.nickname}</span>
                    {/* 性别图标 */}
                    {this.renderSex(logDetailInfo.sex)}
                  </div>
                  <span className={styles.time}>{ForMatDateUtil.timesToNow(logDetailInfo.create_time)}</span>
                </div>
              </div>

              <div className={styles.topping}>
                {this.renderStatus(logDetailInfo.private_log, logDetailInfo.topping)}
              </div>
            </div>

            {/* 日志内容 */}
            <div className={styles.logContent}>{logDetailInfo.content}</div>

            {/* 图片容器 */}
            <div className={styles.imageContainer}>{this.renderImageWall(logDetailInfo.picture)}</div>

            {/* 点赞数和评论数 */}
            <div className={styles.record}>
              <span className={styles.likeCount}>赞 {logDetailInfo.like_count}</span>
              <span className={styles.commentCount}>评论 {logDetailInfo.comment_count}</span>
            </div>
          </div>
        )}

        {/* 评论内容 */}
        <div className={styles.comment}>
          {/* 评论 */}
          <div className={styles.commentHeader}>
            <span className={styles.text}>评论</span>
            <div
              className={styles.sort}
              onClick={this.changeSort}
              style={{ color: isAtFirst ? '#624196e3' : '#aaa', fontWeight: isAtFirst ? 'bold' : 'initial' }}
            >
              最初
              <Icon type="up" color={isAtFirst ? '#624196e3' : '#aaa'} />
            </div>
          </div>

          {!commentInfo || commentInfo.length < 1 ? (
            // 空状态
            <div className={styles.empty}>
              <i className={classNames(styles.emptyIcon, 'icon-empty', 'iconfont')} />
              <span>评论空空如也~</span>
            </div>
          ) : (
            // 评论内容
            <div className={styles.commentList}>
              {commentInfo.map(item => (
                <div className={styles.commentItem} key={item.id}>
                  {/* 评论顶部栏 */}
                  <div className={styles.logHeader}>
                    <div className={styles.author}>
                      <div className={styles.avatar}>
                        {item.avatar ? (
                          <img src={item.avatar} alt="avatar" className={styles.avatarImage} />
                        ) : (
                          <i className={classNames(styles.userIcon, 'icon-touxiang', 'iconfont')} />
                        )}
                      </div>
                      <div className={styles.user}>
                        <div className={styles.nicknameContainer}>
                          <span className={styles.nickname}>{item.nickname}</span>
                          {/* 性别图标 */}
                          {this.renderSex(item.sex)}
                        </div>
                        <span className={styles.time}>{ForMatDateUtil.timesToNow(item.create_time)}</span>
                      </div>
                    </div>

                    {/* 是否是置顶评论 */}
                    {item.status === '1' && (
                      <div className={styles.topping}>
                        <i className={classNames(styles.toppingIcon, 'icon-icon-test', 'iconfont')} />
                      </div>
                    )}

                    {/* 只能自己或管理员删除自己发的评论 */}
                    {item.user_id === Number(uid) && (
                      <i
                        className={classNames(styles.deleteIcon, 'icon-shanchu', 'iconfont')}
                        onClick={() => this.deleteComment(item.id)}
                      />
                    )}
                  </div>

                  <div className={styles.commentContent}>{item.content}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部点赞和评论功能 */}
        <div className={styles.messageContainer}>
          <div className={styles.message} onClick={this.changeLike}>
            {logDetailInfo && logDetailInfo.pid ? (
              <i className={classNames(styles.likeIcon, 'icon-bqxin', 'iconfont')} />
            ) : (
              <i className={classNames(styles.messageIcon, 'icon-03', 'iconfont')} />
            )}
          </div>

          <div className={styles.message} onClick={this.clickComment}>
            <i className={classNames(styles.messageIcon, 'icon-comment', 'iconfont')} />
          </div>
        </div>
      </div>
    );
  }
}

export default LogDetail;
