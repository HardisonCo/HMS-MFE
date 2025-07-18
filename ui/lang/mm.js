export default {
  isoName: 'mm',
  nativeName: 'မြန်မာ(ဗမာ)',
  label: {
    clear: 'ရှင်းလင်းမည်',
    ok: 'အဆင်ပြေသည်',
    cancel: 'ပယ်ဖျက်မည်',
    close: 'ပိတ်မည်',
    set: 'သတ်မှတ်မည်',
    select: 'ရွေးမည်',
    reset: 'ပြန်လည်သတ်မှတ်မည်',
    remove: 'ပယ်ဖျက်မည်',
    update: 'အသစ်ပြင်ဆင်မည်',
    create: 'ဖန်တီးမည်',
    search: 'ရှာမည်',
    filter: 'စစ်ထုတ်မည်',
    refresh: 'အသစ်ပြန်လုပ်မည်',
    expand: label => (label ? `"${ label }" ကိုချဲ့ထွင်ပါ။` : 'ချဲ့ထွင်ပါ။'),
    collapse: label => (label ? `"${ label }" ကို ခေါက်သိမ်းပါ` : 'ပြိုကျသည်။')
  },
  date: {
    days: 'တနင်္ဂနွေ_တနင်္လာ_အင်္ဂါ_ဗုဒ္ဓဟူး_ကြာသပတေး_သောကြာ_စနေ'.split('_'),
    daysShort: 'တနင်္ဂနွေ_တနင်္လာ_အင်္ဂါ_ဗုဒ္ဓဟူး_ကြာသပတေး_သောကြာ_စနေ'.split('_'),
    months: 'ဇန်နဝါရီ_ဖေဖော်ဝါရီ_မတ်_ဧပြီ_မေ_ဇွန်_ဇူလိုင်_သြဂုတ်_စက်တင်ဘာ_အောက်တိုဘာ_နိုဝင်ဘာ_ဒီဇင်ဘာ'.split('_'),
    monthsShort: 'ဇန်နဝါရီ_ဖေဖော်ဝါရီ_မတ်_ဧပြီ_မေ_ဇွန်_ဇူလိုင်_သြဂုတ်_စက်တင်ဘာ_အောက်တိုဘာ_နိုဝင်ဘာ_ဒီဇင်ဘာ'.split('_'),
    firstDayOfWeek: 1, // 0-6, 0 - Sunday, 1 Monday, ...
    format24h: false,
    pluralDay: 'ရက်',
    prevMonth: 'အရင်လ',
    nextMonth: 'နောက်လ',
    prevYear: 'အရင်နှစ်',
    nextYear: 'နောက်နှစ်',
    today: 'ဒီနေ့',
    prevRangeYears: range => `ယခင် ${ range } နှစ် များ`,
    nextRangeYears: range => `နောက် ${ range } နှစ် များ`
  },
  table: {
    noData: 'ဒေတာမရှိပါ',
    noResults: 'ကိုက်ညီသောရလဒ်မရှိပါ',
    loading: 'လုပ်ဆောင်နေသည်',
    selectedRecords: rows => (
      rows > 0
        ? rows + ' ကြောင်းရွေးချယ်ထားသည်'
        : 'ဘာမှ မရွေးချယ်ထားပါ'
    ),
    recordsPerPage: 'တစ်မျက်နှာ အကြောင်းရေတွက်',
    allRows: 'အားလုံး',
    // eslint-disable-next-line no-useless-concat
    pagination: (start, end, total) => start + 'မှ' + end + 'ထိ' + 'အားလုံး' + total + 'ရှိ',
    columns: 'ကော်လံ'
  },
  pagination: {
    first: 'ပထမစာမျက်နှာ',
    prev: 'မူရင်းစာမျက်နှာ',
    next: 'နောက်စာမျက်နှာ',
    last: 'နောက်ဆုံးစာမျက်နှာ'
  },
  editor: {
    url: 'URL',
    bold: 'Bold',
    italic: 'Italic',
    strikethrough: 'Strikethrough',
    underline: 'Underline',
    unorderedList: 'Unordered List',
    orderedList: 'Ordered List',
    subscript: 'Subscript',
    superscript: 'Superscript',
    hyperlink: 'Hyperlink',
    toggleFullscreen: 'Toggle Fullscreen',
    quote: 'Quote',
    left: 'Left align',
    center: 'Center align',
    right: 'Right align',
    justify: 'Justify align',
    print: 'Print',
    outdent: 'Decrease indentation',
    indent: 'Increase indentation',
    removeFormat: 'Remove formatting',
    formatting: 'Formatting',
    fontSize: 'Font Size',
    align: 'Align',
    hr: 'Insert Horizontal Rule',
    undo: 'Undo',
    redo: 'Redo',
    heading1: 'Heading 1',
    heading2: 'Heading 2',
    heading3: 'Heading 3',
    heading4: 'Heading 4',
    heading5: 'Heading 5',
    heading6: 'Heading 6',
    paragraph: 'Paragraph',
    code: 'Code',
    size1: 'Very small',
    size2: 'A bit small',
    size3: 'Normal',
    size4: 'Medium-large',
    size5: 'Big',
    size6: 'Very big',
    size7: 'Maximum',
    defaultFont: 'Default Font',
    viewSource: 'View Source'
  },
  tree: {
    noNodes: 'No nodes available',
    noResults: 'No matching nodes found'
  }
}
