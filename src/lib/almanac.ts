import { Solar, Lunar } from 'lunar-typescript'

export interface DayInfo {
  year: number
  month: number
  day: number
  week: number // 0=周日
  solar: Solar
  lunar: Lunar
  inMonth: boolean
  isToday: boolean
  lunarText: string // 农历日显示文字
  festivals: string[]
  yi: string[]
  ji: string[]
  luck: string // 黄道/黑道 + 吉凶
  jieQi: string // 当日节气（如有）
}

export interface HourInfo {
  ganZhi: string
  zhi: string
  range: string
  tianShen: string
  luck: string // 吉 / 凶
  naYin: string
  chong: string
  isNow: boolean
}

export interface AlmanacDetail {
  solarText: string
  weekText: string
  lunarYearText: string
  lunarText: string
  shengXiao: string
  ganzhi: string
  tianShen: string
  tianShenLuck: string
  tianShenType: string
  zhiXing: string
  xiu: string
  xiuLuck: string
  gong: string
  xiuSong: string
  chongDesc: string
  sha: string
  pengZuGan: string
  pengZuZhi: string
  xi: string
  fu: string
  cai: string
  yangGui: string
  yinGui: string
  yearNaYin: string
  monthNaYin: string
  dayNaYin: string
  yi: string[]
  ji: string[]
  festivals: string[]
  prevJieQi: string
  nextJieQi: string
  hours: HourInfo[]
}

export function today(): { y: number; m: number; d: number } {
  const n = new Date()
  return { y: n.getFullYear(), m: n.getMonth() + 1, d: n.getDate() }
}

function buildDayInfo(solar: Solar, inMonth: boolean): DayInfo {
  const lunar = solar.getLunar()
  const now = today()
  const isToday =
    solar.getYear() === now.y && solar.getMonth() === now.m && solar.getDay() === now.d

  // 农历日文字：初一显示月份名
  let lunarText = lunar.getDayInChinese()
  if (lunarText === '初一') {
    lunarText = lunar.getMonthInChinese() + '月'
  }

  const festivals = [
    ...solar.getFestivals(),
    ...lunar.getFestivals(),
    ...lunar.getOtherFestivals(),
  ]

  const luck = `${lunar.getDayTianShenType()}·${lunar.getDayTianShenLuck()}`

  return {
    year: solar.getYear(),
    month: solar.getMonth(),
    day: solar.getDay(),
    week: solar.getWeek(),
    solar,
    lunar,
    inMonth,
    isToday,
    lunarText,
    festivals,
    yi: lunar.getDayYi(),
    ji: lunar.getDayJi(),
    luck,
    jieQi: lunar.getJieQi(),
  }
}

/** 构建某月的日历网格（含上下月补齐），按周排列 */
export function buildMonthGrid(year: number, month: number): DayInfo[][] {
  const first = Solar.fromYmd(year, month, 1)
  const leadDays = first.getWeek() // 周日开头
  const start = first.next(-leadDays)
  const weeks: DayInfo[][] = []
  let cursor = start
  for (let w = 0; w < 6; w++) {
    const week: DayInfo[] = []
    for (let i = 0; i < 7; i++) {
      week.push(buildDayInfo(cursor, cursor.getMonth() === month))
      cursor = cursor.next(1)
    }
    weeks.push(week)
    if (cursor.getMonth() !== month && cursor.getDay() > 7) break
  }
  return weeks
}

export function getAlmanacDetail(year: number, month: number, day: number): AlmanacDetail {
  const solar = Solar.fromYmd(year, month, day)
  const lunar = solar.getLunar()
  const now = new Date()
  const nowHour = now.getHours()
  const nowShiIndex = Math.floor(((nowHour + 1) % 24) / 2)

  const hours: HourInfo[] = lunar.getTimes().map((t) => {
    const zhi = t.getZhi()
    const idx = '子丑寅卯辰巳午未申酉戌亥'.indexOf(zhi)
    return {
      ganZhi: t.getGanZhi(),
      zhi,
      range: `${t.getMinHm()}-${t.getMaxHm()}`,
      tianShen: t.getTianShen(),
      luck: t.getTianShenLuck(),
      naYin: t.getNaYin(),
      chong: t.getChongDesc(),
      isNow:
        year === now.getFullYear() &&
        month === now.getMonth() + 1 &&
        day === now.getDate() &&
        idx === nowShiIndex,
    }
  })

  const prevJq = lunar.getPrevJieQi(true)
  const nextJq = lunar.getNextJieQi(true)

  return {
    solarText: `${solar.getYear()}年${solar.getMonth()}月${solar.getDay()}日`,
    weekText: '星期' + solar.getWeekInChinese(),
    lunarYearText: lunar.getYearInChinese() + '年',
    lunarText:
      lunar.getMonthInChinese() + '月' + lunar.getDayInChinese(),
    shengXiao: lunar.getYearShengXiao(),
    ganzhi: `${lunar.getYearInGanZhi()}年 ${lunar.getMonthInGanZhi()}月 ${lunar.getDayInGanZhi()}日`,
    tianShen: lunar.getDayTianShen(),
    tianShenLuck: lunar.getDayTianShenLuck(),
    tianShenType: lunar.getDayTianShenType(),
    zhiXing: lunar.getZhiXing(),
    xiu: lunar.getXiu(),
    xiuLuck: lunar.getXiuLuck(),
    gong: lunar.getGong(),
    xiuSong: lunar.getXiuSong(),
    chongDesc: lunar.getDayChongDesc(),
    sha: lunar.getDaySha(),
    pengZuGan: lunar.getPengZuGan(),
    pengZuZhi: lunar.getPengZuZhi(),
    xi: lunar.getDayPositionXiDesc(),
    fu: lunar.getDayPositionFuDesc(),
    cai: lunar.getDayPositionCaiDesc(),
    yangGui: lunar.getDayPositionYangGuiDesc(),
    yinGui: lunar.getDayPositionYinGuiDesc(),
    yearNaYin: lunar.getYearNaYin(),
    monthNaYin: lunar.getMonthNaYin(),
    dayNaYin: lunar.getDayNaYin(),
    yi: lunar.getDayYi(),
    ji: lunar.getDayJi(),
    festivals: [
      ...solar.getFestivals(),
      ...lunar.getFestivals(),
      ...lunar.getOtherFestivals(),
    ],
    prevJieQi: `${prevJq.getName()} ${prevJq.getSolar().getMonth()}月${prevJq.getSolar().getDay()}日`,
    nextJieQi: `${nextJq.getName()} ${nextJq.getSolar().getMonth()}月${nextJq.getSolar().getDay()}日`,
    hours,
  }
}

export const WEEK_NAMES = ['日', '一', '二', '三', '四', '五', '六']
