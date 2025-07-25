export default {
  isoName: 'uz-Cyrl',
  nativeName: 'Ўзбекча (Кирил)',
  label: {
    clear: 'Тозалаш',
    ok: 'ОК',
    cancel: 'Бекор қилиш',
    close: 'Ёпиш',
    set: 'Ўрнатиш',
    select: 'Танлаш',
    reset: 'Қайта ўрнатиш',
    remove: 'Ўчириш',
    update: 'Янгилаш',
    create: 'Яратиш',
    search: 'Қидириш',
    filter: 'Филтрлаш',
    refresh: 'Янгилаш',
    expand: label => (label ? `"${ label }" ни кенгайтириш` : 'ъКенгайтиришъ'),
    collapse: label => (label ? `"${ label }" ни йиғиш` : 'ъЙиқилишъ')
  },
  date: {
    days: 'Якшанба_Душанба_Сешанба_Чоршанба_Пайшанба_Жума_Шанба'.split('_'),
    daysShort: 'Як_Душ_Се_Чор_Пай_Жума_Шанба'.split('_'),
    months:
      'Январь_Февраль_Март_Апрель_Май_Июнь_Июль_Август_Сентябрь_Октябрь_Ноябрь_Декабрь'.split(
        '_'
      ),
    monthsShort: 'Ян_Фев_Март_Апр_Май_Июнь_Июль_Авг_Сен_Окт_Ноя_Дек'.split('_'),
    firstDayOfWeek: 1, // 0-6, 0 - Якшанба, 1 Душанба, ...
    format24h: true,
    pluralDay: 'Кунлар',
    prevMonth: 'Олдинги ой',
    nextMonth: 'Кейинги ой',
    prevYear: 'Ўтган йили',
    nextYear: 'Кейинги йил',
    today: 'Бугун',
    prevRangeYears: range => `Олдинги ${ range } Йиллар`,
    nextRangeYears: range => `Кейинги ${ range } Йиллар`
  },
  table: {
    noData: 'Маълумот топилмади',
    noResults: 'Қидирув бўйича маълумотлар топилмади',
    loading: 'Юкланмоқда...',
    selectedRecords: (rows) =>
      (rows === 1
        ? '1 та маълумот танланди.'
        : (rows === 0 ? 'Хеч қандай' : rows) + ' маълумотла танланмади.'),
    recordsPerPage: 'Сахифадаги қаторлар:',
    allRows: 'Барчаси',
    pagination: (start, end, total) => start + '-' + end + ' жами ' + total,
    columns: 'Устунлар'
  },
  pagination: {
    first: 'Биринчи саҳифа',
    prev: 'Олдинги саҳифа',
    next: 'Кейинги саҳифа',
    last: 'Сўнгги саҳифа'
  },
  editor: {
    url: 'УРЛ',
    bold: 'Қалин',
    italic: 'Курсив',
    strikethrough: 'Чизилган',
    underline: 'Тагига чизилган',
    unorderedList: 'Тартибсиз руйхат',
    orderedList: 'Тартибга киритилган руйхат',
    subscript: 'Сатр остида',
    superscript: 'Сатр устида',
    hyperlink: 'Гиперхавола',
    toggleFullscreen: 'Тўлиқ экран режимига ўтиш',
    quote: 'Иқтибос',
    left: 'Чапга сафлаш',
    center: 'Марказга сафлаш',
    right: 'Ўнгдан сафлаш',
    justify: 'Икки томондан сафлаш',
    print: 'Чоп этиш',
    outdent: 'Чекинишни камайтириш',
    indent: 'Чекинишни кўпайтириш',
    removeFormat: 'Форматлашни ўчириб ташлаш',
    formatting: 'Форматлаш',
    fontSize: 'Шрифт хажми',
    align: 'Сафлаш',
    hr: 'Горизонтал қоидани киритиш',
    undo: 'Бекор қилиш',
    redo: 'Такрорлаш',
    heading1: 'Сарлавха 1',
    heading2: 'Сарлавха 2',
    heading3: 'Сарлавха 3',
    heading4: 'Сарлавха 4',
    heading5: 'Сарлавха 5',
    heading6: 'Сарлавха 6',
    paragraph: 'Параграф',
    code: 'Код',
    size1: 'Ўта кичик',
    size2: 'Бироз кичик',
    size3: 'Оддий',
    size4: 'Ўрта катта',
    size5: 'Катта',
    size6: 'Жуда катта',
    size7: 'Максимал',
    defaultFont: 'Стандарт шрифт',
    viewSource: 'Манбани кўриш'
  },
  tree: {
    noNodes: 'Кесишмалар мавжуд эмас',
    noResults: 'Мос келадиган кесишмалар топилмади'
  }
}
