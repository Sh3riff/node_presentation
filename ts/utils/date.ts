import dayjs from 'dayjs'

const extract = '$d' // extracting the normal date format from the entire dayjs object format

export class Date {
  static now () {
    return dayjs()[extract]
  }

  static parse (time) {
    return dayjs(time)[extract]
  }

  static addMinutes (minutes) {
    return dayjs().add(minutes, 'minute')[extract]
  }

  static isBeforeNow (time) {
    return dayjs().isBefore(dayjs(time))
  }

  static aIsBeforeB (timeA, timeB) {
    return dayjs(timeA).isBefore(dayjs(timeB))
  }
}
