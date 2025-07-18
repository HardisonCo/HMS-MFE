/* eslint no-fallthrough: 0 */

import { isDate } from '../is/is.js'
import { pad, capitalize } from '../format/format.js'
import { jalaaliMonthLength } from './private.persian.js'
import Lang, { defaultLang } from '../../plugins/lang/Lang.js'

const
  MILLISECONDS_IN_DAY = 86400000,
  MILLISECONDS_IN_HOUR = 3600000,
  MILLISECONDS_IN_MINUTE = 60000,
  defaultMask = 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  token = /\[((?:[^\]\\]|\\]|\\)*)\]|do|d{1,4}|Mo|M{1,4}|m{1,2}|wo|w{1,2}|Qo|Do|DDDo|D{1,4}|YY(?:YY)?|H{1,2}|h{1,2}|s{1,2}|S{1,3}|Z{1,2}|a{1,2}|[AQExX]/g,
  reverseToken = /(\[[^\]]*\])|do|d{1,4}|Mo|M{1,4}|m{1,2}|wo|w{1,2}|Qo|Do|DDDo|D{1,4}|YY(?:YY)?|H{1,2}|h{1,2}|s{1,2}|S{1,3}|Z{1,2}|a{1,2}|[AQExX]|([.*+:?^,\s${}()|\\]+)/g,
  regexStore = {}

function getRegexData (mask, dateLocale) {
  const
    days = '(' + dateLocale.days.join('|') + ')',
    key = mask + days

  if (regexStore[ key ] !== void 0) {
    return regexStore[ key ]
  }

  const
    daysShort = '(' + dateLocale.daysShort.join('|') + ')',
    months = '(' + dateLocale.months.join('|') + ')',
    monthsShort = '(' + dateLocale.monthsShort.join('|') + ')'

  const map = {}
  let index = 0

  const regexText = mask.replace(reverseToken, match => {
    index++
    switch (match) {
      case 'YY':
        map.YY = index
        return '(-?\\d{1,2})'
      case 'YYYY':
        map.YYYY = index
        return '(-?\\d{1,4})'
      case 'M':
        map.M = index
        return '(\\d{1,2})'
      case 'Mo':
        map.M = index++ // bumping to M
        return '(\\d{1,2}(st|nd|rd|th))'
      case 'MM':
        map.M = index // bumping to M
        return '(\\d{2})'
      case 'MMM':
        map.MMM = index
        return monthsShort
      case 'MMMM':
        map.MMMM = index
        return months
      case 'D':
        map.D = index
        return '(\\d{1,2})'
      case 'Do':
        map.D = index++ // bumping to D
        return '(\\d{1,2}(st|nd|rd|th))'
      case 'DD':
        map.D = index // bumping to D
        return '(\\d{2})'
      case 'H':
        map.H = index
        return '(\\d{1,2})'
      case 'HH':
        map.H = index // bumping to H
        return '(\\d{2})'
      case 'h':
        map.h = index
        return '(\\d{1,2})'
      case 'hh':
        map.h = index // bumping to h
        return '(\\d{2})'
      case 'm':
        map.m = index
        return '(\\d{1,2})'
      case 'mm':
        map.m = index // bumping to m
        return '(\\d{2})'
      case 's':
        map.s = index
        return '(\\d{1,2})'
      case 'ss':
        map.s = index // bumping to s
        return '(\\d{2})'
      case 'S':
        map.S = index
        return '(\\d{1})'
      case 'SS':
        map.S = index // bump to S
        return '(\\d{2})'
      case 'SSS':
        map.S = index // bump to S
        return '(\\d{3})'
      case 'A':
        map.A = index
        return '(AM|PM)'
      case 'a':
        map.a = index
        return '(am|pm)'
      case 'aa':
        map.aa = index
        return '(a\\.m\\.|p\\.m\\.)'

      case 'ddd':
        return daysShort
      case 'dddd':
        return days
      case 'Q':
      case 'd':
      case 'E':
        return '(\\d{1})'
      case 'do':
        index++
        return '(\\d{1}(st|nd|rd|th))'
      case 'Qo':
        return '(1st|2nd|3rd|4th)'
      case 'DDD':
      case 'DDDD':
        return '(\\d{1,3})'
      case 'DDDo':
        index++
        return '(\\d{1,3}(st|nd|rd|th))'
      case 'w':
        return '(\\d{1,2})'
      case 'wo':
        index++
        return '(\\d{1,2}(st|nd|rd|th))'
      case 'ww':
        return '(\\d{2})'

      case 'Z': // to split: (?:(Z)()()|([+-])?(\\d{2}):?(\\d{2}))
        map.Z = index
        return '(Z|[+-]\\d{2}:\\d{2})'
      case 'ZZ':
        map.ZZ = index
        return '(Z|[+-]\\d{2}\\d{2})'

      case 'X':
        map.X = index
        return '(-?\\d+)'
      case 'x':
        map.x = index
        return '(-?\\d{4,})'

      default:
        index--
        if (match[ 0 ] === '[') {
          match = match.substring(1, match.length - 1)
        }
        return match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    }
  })

  const res = { map, regex: new RegExp('^' + regexText) }
  regexStore[ key ] = res

  return res
}

function getDateLocale (paramDateLocale, langProps) {
  return paramDateLocale !== void 0
    ? paramDateLocale
    : (
        langProps !== void 0
          ? langProps.date
          : defaultLang.date
      )
}

function formatTimezone (offset, delimeter = '') {
  const
    sign = offset > 0 ? '-' : '+',
    absOffset = Math.abs(offset),
    hours = Math.floor(absOffset / 60),
    minutes = absOffset % 60

  return sign + pad(hours) + delimeter + pad(minutes)
}

function applyYearMonthDayChange (date, mod, sign) {
  let
    year = date.getFullYear(),
    month = date.getMonth()

  const day = date.getDate()

  if (mod.year !== void 0) {
    year += sign * mod.year
    delete mod.year
  }

  if (mod.month !== void 0) {
    month += sign * mod.month
    delete mod.month
  }

  date.setDate(1)
  date.setMonth(2)

  date.setFullYear(year)
  date.setMonth(month)
  date.setDate(Math.min(day, daysInMonth(date)))

  if (mod.date !== void 0) {
    date.setDate(date.getDate() + sign * mod.date)
    delete mod.date
  }

  return date
}

function applyYearMonthDay (date, mod, middle) {
  const
    year = mod.year !== void 0 ? mod.year : date[ `get${ middle }FullYear` ](),
    month = mod.month !== void 0 ? mod.month - 1 : date[ `get${ middle }Month` ](),
    maxDay = (new Date(year, month + 1, 0)).getDate(),
    day = Math.min(maxDay, mod.date !== void 0 ? mod.date : date[ `get${ middle }Date` ]())

  date[ `set${ middle }Date` ](1)
  date[ `set${ middle }Month` ](2)

  date[ `set${ middle }FullYear` ](year)
  date[ `set${ middle }Month` ](month)
  date[ `set${ middle }Date` ](day)

  delete mod.year
  delete mod.month
  delete mod.date

  return date
}

function getChange (date, rawMod, sign) {
  const
    mod = normalizeMod(rawMod),
    d = new Date(date),
    t = mod.year !== void 0 || mod.month !== void 0 || mod.date !== void 0
      ? applyYearMonthDayChange(d, mod, sign) // removes year/month/day
      : d

  for (const key in mod) {
    const op = capitalize(key)
    t[ `set${ op }` ](t[ `get${ op }` ]() + sign * mod[ key ])
  }

  return t
}

function normalizeMod (mod) {
  const acc = { ...mod }

  if (mod.years !== void 0) {
    acc.year = mod.years
    delete acc.years
  }

  if (mod.months !== void 0) {
    acc.month = mod.months
    delete acc.months
  }

  if (mod.days !== void 0) {
    acc.date = mod.days
    delete acc.days
  }
  if (mod.day !== void 0) {
    acc.date = mod.day
    delete acc.day
  }

  if (mod.hour !== void 0) {
    acc.hours = mod.hour
    delete acc.hour
  }

  if (mod.minute !== void 0) {
    acc.minutes = mod.minute
    delete acc.minute
  }

  if (mod.second !== void 0) {
    acc.seconds = mod.second
    delete acc.second
  }

  if (mod.millisecond !== void 0) {
    acc.milliseconds = mod.millisecond
    delete acc.millisecond
  }

  return acc
}

export function adjustDate (date, rawMod, utc) {
  const
    mod = normalizeMod(rawMod),
    middle = utc === true ? 'UTC' : '',
    d = new Date(date),
    t = mod.year !== void 0 || mod.month !== void 0 || mod.date !== void 0
      ? applyYearMonthDay(d, mod, middle) // removes year/month/day
      : d

  for (const key in mod) {
    const op = key.charAt(0).toUpperCase() + key.slice(1)
    t[ `set${ middle }${ op }` ](mod[ key ])
  }

  return t
}

export function extractDate (str, mask, dateLocale) {
  const d = __splitDate(str, mask, dateLocale)

  const date = new Date(
    d.year,
    d.month === null ? null : d.month - 1,
    d.day === null ? 1 : d.day,
    d.hour,
    d.minute,
    d.second,
    d.millisecond
  )

  const tzOffset = date.getTimezoneOffset()

  return d.timezoneOffset === null || d.timezoneOffset === tzOffset
    ? date
    : getChange(date, { minutes: d.timezoneOffset - tzOffset }, 1)
}

export function __splitDate (str, mask, dateLocale, calendar, defaultModel) {
  const date = {
    year: null,
    month: null,
    day: null,
    hour: null,
    minute: null,
    second: null,
    millisecond: null,
    timezoneOffset: null,
    dateHash: null,
    timeHash: null
  }

  defaultModel !== void 0 && Object.assign(date, defaultModel)

  if (
    str === void 0
    || str === null
    || str === ''
    || typeof str !== 'string'
  ) {
    return date
  }

  if (mask === void 0) {
    mask = defaultMask
  }

  const
    langOpts = getDateLocale(dateLocale, Lang.props),
    months = langOpts.months,
    monthsShort = langOpts.monthsShort

  const { regex, map } = getRegexData(mask, langOpts)

  const match = str.match(regex)

  if (match === null) {
    return date
  }

  let tzString = ''

  if (map.X !== void 0 || map.x !== void 0) {
    const stamp = parseInt(match[ map.X !== void 0 ? map.X : map.x ], 10)

    if (isNaN(stamp) === true || stamp < 0) {
      return date
    }

    const d = new Date(stamp * (map.X !== void 0 ? 1000 : 1))

    date.year = d.getFullYear()
    date.month = d.getMonth() + 1
    date.day = d.getDate()
    date.hour = d.getHours()
    date.minute = d.getMinutes()
    date.second = d.getSeconds()
    date.millisecond = d.getMilliseconds()
  }
  else {
    if (map.YYYY !== void 0) {
      date.year = parseInt(match[ map.YYYY ], 10)
    }
    else if (map.YY !== void 0) {
      const y = parseInt(match[ map.YY ], 10)
      date.year = y < 0 ? y : 2000 + y
    }

    if (map.M !== void 0) {
      date.month = parseInt(match[ map.M ], 10)
      if (date.month < 1 || date.month > 12) {
        return date
      }
    }
    else if (map.MMM !== void 0) {
      date.month = monthsShort.indexOf(match[ map.MMM ]) + 1
    }
    else if (map.MMMM !== void 0) {
      date.month = months.indexOf(match[ map.MMMM ]) + 1
    }

    if (map.D !== void 0) {
      date.day = parseInt(match[ map.D ], 10)

      if (date.year === null || date.month === null || date.day < 1) {
        return date
      }

      const maxDay = calendar !== 'persian'
        ? (new Date(date.year, date.month, 0)).getDate()
        : jalaaliMonthLength(date.year, date.month)

      if (date.day > maxDay) {
        return date
      }
    }

    if (map.H !== void 0) {
      date.hour = parseInt(match[ map.H ], 10) % 24
    }
    else if (map.h !== void 0) {
      date.hour = parseInt(match[ map.h ], 10) % 12
      if (
        (map.A && match[ map.A ] === 'PM')
        || (map.a && match[ map.a ] === 'pm')
        || (map.aa && match[ map.aa ] === 'p.m.')
      ) {
        date.hour += 12
      }
      date.hour = date.hour % 24
    }

    if (map.m !== void 0) {
      date.minute = parseInt(match[ map.m ], 10) % 60
    }

    if (map.s !== void 0) {
      date.second = parseInt(match[ map.s ], 10) % 60
    }

    if (map.S !== void 0) {
      date.millisecond = parseInt(match[ map.S ], 10) * 10 ** (3 - match[ map.S ].length)
    }

    if (map.Z !== void 0 || map.ZZ !== void 0) {
      tzString = (map.Z !== void 0 ? match[ map.Z ].replace(':', '') : match[ map.ZZ ])
      date.timezoneOffset = (tzString[ 0 ] === '+' ? -1 : 1) * (60 * tzString.slice(1, 3) + 1 * tzString.slice(3, 5))
    }
  }

  date.dateHash = pad(date.year, 4) + '/' + pad(date.month) + '/' + pad(date.day)
  date.timeHash = pad(date.hour) + ':' + pad(date.minute) + ':' + pad(date.second) + tzString

  return date
}

export function isValid (date) {
  return typeof date === 'number'
    ? true
    : isNaN(Date.parse(date)) === false
}

export function buildDate (mod, utc) {
  return adjustDate(new Date(), mod, utc)
}

export function getDayOfWeek (date) {
  const dow = new Date(date).getDay()
  return dow === 0 ? 7 : dow
}

export function getWeekOfYear (date) {
  // Remove time components of date
  const thursday = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  // Change date to Thursday same week
  thursday.setDate(thursday.getDate() - ((thursday.getDay() + 6) % 7) + 3)

  // Take January 4th as it is always in week 1 (see ISO 8601)
  const firstThursday = new Date(thursday.getFullYear(), 0, 4)

  // Change date to Thursday same week
  firstThursday.setDate(firstThursday.getDate() - ((firstThursday.getDay() + 6) % 7) + 3)

  // Check if daylight-saving-time-switch occurred and correct for it
  const ds = thursday.getTimezoneOffset() - firstThursday.getTimezoneOffset()
  thursday.setHours(thursday.getHours() - ds)

  // Number of weeks between target Thursday and first Thursday
  const weekDiff = (thursday - firstThursday) / (MILLISECONDS_IN_DAY * 7)
  return 1 + Math.floor(weekDiff)
}

function getDayIdentifier (date) {
  return date.getFullYear() * 10000 + date.getMonth() * 100 + date.getDate()
}

function getDateIdentifier (date, onlyDate /* = false */) {
  const d = new Date(date)
  return onlyDate === true ? getDayIdentifier(d) : d.getTime()
}

export function isBetweenDates (date, from, to, opts = {}) {
  const
    d1 = getDateIdentifier(from, opts.onlyDate),
    d2 = getDateIdentifier(to, opts.onlyDate),
    cur = getDateIdentifier(date, opts.onlyDate)

  return (cur > d1 || (opts.inclusiveFrom === true && cur === d1))
    && (cur < d2 || (opts.inclusiveTo === true && cur === d2))
}

export function addToDate (date, mod) {
  return getChange(date, mod, 1)
}
export function subtractFromDate (date, mod) {
  return getChange(date, mod, -1)
}

export function startOfDate (date, unit, utc) {
  const
    t = new Date(date),
    prefix = `set${ utc === true ? 'UTC' : '' }`

  switch (unit) {
    case 'year':
    case 'years':
      t[ `${ prefix }Month` ](0)
    case 'month':
    case 'months':
      t[ `${ prefix }Date` ](1)
    case 'day':
    case 'days':
    case 'date':
      t[ `${ prefix }Hours` ](0)
    case 'hour':
    case 'hours':
      t[ `${ prefix }Minutes` ](0)
    case 'minute':
    case 'minutes':
      t[ `${ prefix }Seconds` ](0)
    case 'second':
    case 'seconds':
      t[ `${ prefix }Milliseconds` ](0)
  }
  return t
}

export function endOfDate (date, unit, utc) {
  const
    t = new Date(date),
    prefix = `set${ utc === true ? 'UTC' : '' }`

  switch (unit) {
    case 'year':
    case 'years':
      t[ `${ prefix }Month` ](11)
    case 'month':
    case 'months':
      t[ `${ prefix }Date` ](daysInMonth(t))
    case 'day':
    case 'days':
    case 'date':
      t[ `${ prefix }Hours` ](23)
    case 'hour':
    case 'hours':
      t[ `${ prefix }Minutes` ](59)
    case 'minute':
    case 'minutes':
      t[ `${ prefix }Seconds` ](59)
    case 'second':
    case 'seconds':
      t[ `${ prefix }Milliseconds` ](999)
  }
  return t
}

export function getMaxDate (date /* , ...args */) {
  let t = new Date(date)
  Array.prototype.slice.call(arguments, 1).forEach(d => {
    t = Math.max(t, new Date(d))
  })
  return t
}

export function getMinDate (date /*, ...args */) {
  let t = new Date(date)
  Array.prototype.slice.call(arguments, 1).forEach(d => {
    t = Math.min(t, new Date(d))
  })
  return t
}

function getDiff (t, sub, interval) {
  return (
    (t.getTime() - t.getTimezoneOffset() * MILLISECONDS_IN_MINUTE)
    - (sub.getTime() - sub.getTimezoneOffset() * MILLISECONDS_IN_MINUTE)
  ) / interval
}

export function getDateDiff (date, subtract, unit = 'days') {
  const
    t = new Date(date),
    sub = new Date(subtract)

  switch (unit) {
    case 'years':
    case 'year':
      return (t.getFullYear() - sub.getFullYear())

    case 'months':
    case 'month':
      return (t.getFullYear() - sub.getFullYear()) * 12 + t.getMonth() - sub.getMonth()

    case 'days':
    case 'day':
    case 'date':
      return getDiff(startOfDate(t, 'day'), startOfDate(sub, 'day'), MILLISECONDS_IN_DAY)

    case 'hours':
    case 'hour':
      return getDiff(startOfDate(t, 'hour'), startOfDate(sub, 'hour'), MILLISECONDS_IN_HOUR)

    case 'minutes':
    case 'minute':
      return getDiff(startOfDate(t, 'minute'), startOfDate(sub, 'minute'), MILLISECONDS_IN_MINUTE)

    case 'seconds':
    case 'second':
      return getDiff(startOfDate(t, 'second'), startOfDate(sub, 'second'), 1000)
  }
}

export function getDayOfYear (date) {
  return getDateDiff(date, startOfDate(date, 'year'), 'days') + 1
}

export function inferDateFormat (date) {
  return isDate(date) === true
    ? 'date'
    : (typeof date === 'number' ? 'number' : 'string')
}

export function getDateBetween (date, min, max) {
  const t = new Date(date)

  if (min) {
    const low = new Date(min)
    if (t < low) {
      return low
    }
  }

  if (max) {
    const high = new Date(max)
    if (t > high) {
      return high
    }
  }

  return t
}

export function isSameDate (date, date2, unit) {
  const
    t = new Date(date),
    d = new Date(date2)

  if (unit === void 0) {
    return t.getTime() === d.getTime()
  }

  switch (unit) {
    case 'second':
    case 'seconds':
      if (t.getSeconds() !== d.getSeconds()) {
        return false
      }
    case 'minute': // intentional fall-through
    case 'minutes':
      if (t.getMinutes() !== d.getMinutes()) {
        return false
      }
    case 'hour': // intentional fall-through
    case 'hours':
      if (t.getHours() !== d.getHours()) {
        return false
      }
    case 'day': // intentional fall-through
    case 'days':
    case 'date':
      if (t.getDate() !== d.getDate()) {
        return false
      }
    case 'month': // intentional fall-through
    case 'months':
      if (t.getMonth() !== d.getMonth()) {
        return false
      }
    case 'year': // intentional fall-through
    case 'years':
      if (t.getFullYear() !== d.getFullYear()) {
        return false
      }
      break
    default:
      throw new Error(`date isSameDate unknown unit ${ unit }`)
  }

  return true
}

export function daysInMonth (date) {
  return (new Date(date.getFullYear(), date.getMonth() + 1, 0)).getDate()
}

function getOrdinal (n) {
  if (n >= 11 && n <= 13) {
    return `${ n }th`
  }
  switch (n % 10) {
    case 1: return `${ n }st`
    case 2: return `${ n }nd`
    case 3: return `${ n }rd`
  }
  return `${ n }th`
}

const formatter = {
  // Year: 00, 01, ..., 99
  YY (date, dateLocale, forcedYear) {
    // workaround for < 1900 with new Date()
    const y = this.YYYY(date, dateLocale, forcedYear) % 100
    return y >= 0
      ? pad(y)
      : '-' + pad(Math.abs(y))
  },

  // Year: 1900, 1901, ..., 2099
  YYYY (date, _dateLocale, forcedYear) {
    // workaround for < 1900 with new Date()
    return forcedYear !== void 0 && forcedYear !== null
      ? forcedYear
      : date.getFullYear()
  },

  // Month: 1, 2, ..., 12
  M (date) {
    return date.getMonth() + 1
  },

  // Month: 1st, 2nd, ..., 12th
  Mo (date) {
    return getOrdinal(date.getMonth() + 1)
  },

  // Month: 01, 02, ..., 12
  MM (date) {
    return pad(date.getMonth() + 1)
  },

  // Month Short Name: Jan, Feb, ...
  MMM (date, dateLocale) {
    return dateLocale.monthsShort[ date.getMonth() ]
  },

  // Month Name: January, February, ...
  MMMM (date, dateLocale) {
    return dateLocale.months[ date.getMonth() ]
  },

  // Quarter: 1, 2, 3, 4
  Q (date) {
    return Math.ceil((date.getMonth() + 1) / 3)
  },

  // Quarter: 1st, 2nd, 3rd, 4th
  Qo (date) {
    return getOrdinal(this.Q(date))
  },

  // Day of month: 1, 2, ..., 31
  D (date) {
    return date.getDate()
  },

  // Day of month: 1st, 2nd, ..., 31st
  Do (date) {
    return getOrdinal(date.getDate())
  },

  // Day of month: 01, 02, ..., 31
  DD (date) {
    return pad(date.getDate())
  },

  // Day of year: 1, 2, ..., 366
  DDD (date) {
    return getDayOfYear(date)
  },

  // Day of year: 1st, 2nd, ..., 366th
  DDDo (date) {
    return getOrdinal(getDayOfYear(date))
  },

  // Day of year: 001, 002, ..., 366
  DDDD (date) {
    return pad(getDayOfYear(date), 3)
  },

  // Day of week: 0, 1, ..., 6
  d (date) {
    return date.getDay()
  },

  // Day of week: 0th, 1st, ..., 6th
  do (date) {
    return getOrdinal(date.getDay())
  },

  // Day of week: Su, Mo, ...
  dd (date, dateLocale) {
    return (dateLocale.days[ date.getDay() ]).slice(0, 2)
  },

  // Day of week: Sun, Mon, ...
  ddd (date, dateLocale) {
    return dateLocale.daysShort[ date.getDay() ]
  },

  // Day of week: Sunday, Monday, ...
  dddd (date, dateLocale) {
    return dateLocale.days[ date.getDay() ]
  },

  // Day of ISO week: 1, 2, ..., 7
  E (date) {
    return date.getDay() || 7
  },

  // Week of Year: 1 2 ... 52 53
  w (date) {
    return getWeekOfYear(date)
  },

  // Week of Year: 1st 2nd ... 52nd 53rd
  wo (date) {
    return getOrdinal(getWeekOfYear(date))
  },

  // Week of Year: 01 02 ... 52 53
  ww (date) {
    return pad(getWeekOfYear(date))
  },

  // Hour: 0, 1, ... 23
  H (date) {
    return date.getHours()
  },

  // Hour: 00, 01, ..., 23
  HH (date) {
    return pad(date.getHours())
  },

  // Hour: 1, 2, ..., 12
  h (date) {
    const hours = date.getHours()
    return hours === 0
      ? 12
      : (hours > 12 ? hours % 12 : hours)
  },

  // Hour: 01, 02, ..., 12
  hh (date) {
    return pad(this.h(date))
  },

  // Minute: 0, 1, ..., 59
  m (date) {
    return date.getMinutes()
  },

  // Minute: 00, 01, ..., 59
  mm (date) {
    return pad(date.getMinutes())
  },

  // Second: 0, 1, ..., 59
  s (date) {
    return date.getSeconds()
  },

  // Second: 00, 01, ..., 59
  ss (date) {
    return pad(date.getSeconds())
  },

  // 1/10 of second: 0, 1, ..., 9
  S (date) {
    return Math.floor(date.getMilliseconds() / 100)
  },

  // 1/100 of second: 00, 01, ..., 99
  SS (date) {
    return pad(Math.floor(date.getMilliseconds() / 10))
  },

  // Millisecond: 000, 001, ..., 999
  SSS (date) {
    return pad(date.getMilliseconds(), 3)
  },

  // Meridiem: AM, PM
  A (date) {
    return date.getHours() < 12 ? 'AM' : 'PM'
  },

  // Meridiem: am, pm
  a (date) {
    return date.getHours() < 12 ? 'am' : 'pm'
  },

  // Meridiem: a.m., p.m.
  aa (date) {
    return date.getHours() < 12 ? 'a.m.' : 'p.m.'
  },

  // Timezone: -01:00, +00:00, ... +12:00
  Z (date, _dateLocale, _forcedYear, forcedTimezoneOffset) {
    const tzOffset = forcedTimezoneOffset === void 0 || forcedTimezoneOffset === null
      ? date.getTimezoneOffset()
      : forcedTimezoneOffset

    return formatTimezone(tzOffset, ':')
  },

  // Timezone: -0100, +0000, ... +1200
  ZZ (date, _dateLocale, _forcedYear, forcedTimezoneOffset) {
    const tzOffset = forcedTimezoneOffset === void 0 || forcedTimezoneOffset === null
      ? date.getTimezoneOffset()
      : forcedTimezoneOffset

    return formatTimezone(tzOffset)
  },

  // Seconds timestamp: 512969520
  X (date) {
    return Math.floor(date.getTime() / 1000)
  },

  // Milliseconds timestamp: 512969520900
  x (date) {
    return date.getTime()
  }
}

export function formatDate (val, mask, dateLocale, __forcedYear, __forcedTimezoneOffset) {
  if (
    (val !== 0 && !val)
    || val === Infinity
    || val === -Infinity
  ) return

  const date = new Date(val)

  if (isNaN(date)) return

  if (mask === void 0) {
    mask = defaultMask
  }

  const locale = getDateLocale(dateLocale, Lang.props)

  return mask.replace(
    token,
    (match, text) => (
      match in formatter
        ? formatter[ match ](date, locale, __forcedYear, __forcedTimezoneOffset)
        : (text === void 0 ? match : text.split('\\]').join(']'))
    )
  )
}

export function clone (date) {
  return isDate(date) === true
    ? new Date(date.getTime())
    : date
}

export default {
  isValid,
  extractDate,
  buildDate,
  getDayOfWeek,
  getWeekOfYear,
  isBetweenDates,
  addToDate,
  subtractFromDate,
  adjustDate,
  startOfDate,
  endOfDate,
  getMaxDate,
  getMinDate,
  getDateDiff,
  getDayOfYear,
  inferDateFormat,
  getDateBetween,
  isSameDate,
  daysInMonth,
  formatDate,
  clone
}
