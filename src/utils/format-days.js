import moment from 'moment';

export default class ForMatDateUtil {
  static timesToNow(date) {
    const boundaryTimes = this.buildBoundaryTimesBaseOnNow();
    const dateTimestamp = moment(date);

    for (const boundaryTime of boundaryTimes) {
      if (dateTimestamp >= boundaryTime.start && dateTimestamp < boundaryTime.end) {
        if (boundaryTime.desc === 'justNow') {
          return boundaryTime.format;
        }

        if (boundaryTime.desc === 'inOneHour') {
          const duration = moment.duration(moment().diff(dateTimestamp));
          return boundaryTime.format.replace('x', Number.parseInt(duration.asMinutes()));
        }

        return moment(dateTimestamp).format(boundaryTime.format);
      }
    }
  }

  static buildBoundaryTimesBaseOnNow() {
    const boundaryTimes = [
      {
        desc: 'justNow',
        start: moment().startOf('minute'),
        end: moment().endOf('minute'),
        format: '刚刚',
      },
      {
        desc: 'inOneHour',
        start: moment().startOf('hour'),
        end: moment().endOf('hour'),
        format: 'x分钟前',
      },
      {
        desc: 'today',
        start: moment().startOf('day'),
        end: moment().endOf('day'),
        format: '今天 HH:mm',
      },
      {
        desc: 'yestoday',
        start: moment()
          .subtract(1, 'days')
          .startOf('day'),
        end: moment()
          .subtract(1, 'days')
          .endOf('day'),
        format: '昨天 HH:mm',
      },
      {
        desc: 'beforeYestoday',
        start: moment()
          .subtract(2, 'days')
          .startOf('day'),
        end: moment()
          .subtract(2, 'days')
          .endOf('day'),
        format: '前天 HH:mm',
      },
      {
        desc: 'curYear',
        start: moment().startOf('year'),
        end: moment().endOf('year'),
        format: 'MM月DD日 HH:mm',
      },
      {
        desc: 'anotherYear',
        start: moment(new Date(1970, 1, 1).getTime()).startOf('day'),
        end: moment(new Date(new Date().getFullYear() - 1, 12, 31).getTime()).endOf('day'),
        format: 'YYYY年MM月DD日 HH:mm',
      },
    ];

    return boundaryTimes;
  }
}
