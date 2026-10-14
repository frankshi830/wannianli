import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { buildMonthGrid, getAlmanacDetail, today } from '@/lib/almanac'
import { allScheduleDates } from '@/lib/schedule'
import { startReminderLoop } from '@/lib/reminder'
import CalendarGrid from '@/components/CalendarGrid'
import AlmanacPanel from '@/components/AlmanacPanel'
import HourPanel from '@/components/HourPanel'
import SchedulePanel from '@/components/SchedulePanel'

const YEARS: number[] = []
for (let y = 1901; y <= 2100; y++) YEARS.push(y)

export default function Home() {
  const t = today()
  const [cursor, setCursor] = useState({ y: t.y, m: t.m }) // 当前显示的月份
  const [selected, setSelected] = useState({ y: t.y, m: t.m, d: t.d })

  const weeks = useMemo(
    () => buildMonthGrid(cursor.y, cursor.m),
    [cursor.y, cursor.m]
  )
  const detail = useMemo(
    () => getAlmanacDetail(selected.y, selected.m, selected.d),
    [selected.y, selected.m, selected.d]
  )

  // 有未完成行程的日期（月历打点）
  const [schedDates, setSchedDates] = useState<Set<string>>(() => allScheduleDates())
  const refreshSchedDates = () => setSchedDates(allScheduleDates())

  // 到点提醒循环
  useEffect(() => startReminderLoop(), [])

  const shiftMonth = (n: number) => {
    setCursor((c) => {
      let { y, m } = c
      m += n
      while (m < 1) { m += 12; y -= 1 }
      while (m > 12) { m -= 12; y += 1 }
      return { y, m }
    })
  }

  const goToday = () => {
    setCursor({ y: t.y, m: t.m })
    setSelected({ y: t.y, m: t.m, d: t.d })
  }

  const onSelect = (y: number, m: number, d: number) => {
    setSelected({ y, m, d })
    if (y !== cursor.y || m !== cursor.m) setCursor({ y, m })
  }

  return (
    <div className="min-h-screen bg-[#f5f0e6] text-[#2b2118]">
      {/* 顶栏 */}
      <header className="border-b border-[#3a2e22]/10 bg-[#f5f0e6]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#9d2933] text-lg text-white">
              历
            </span>
            <h1 className="text-xl font-bold tracking-widest">中华万年历</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => shiftMonth(-1)}
              className="rounded-md p-1.5 text-[#3a2e22]/70 transition-colors hover:bg-[#3a2e22]/8"
              aria-label="上月"
            >
              <ChevronLeft size={20} />
            </button>
            <select
              value={cursor.y}
              onChange={(e) => setCursor({ y: +e.target.value, m: cursor.m })}
              className="rounded-md border border-[#3a2e22]/15 bg-transparent px-2 py-1.5 text-sm outline-none"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}年</option>
              ))}
            </select>
            <select
              value={cursor.m}
              onChange={(e) => setCursor({ y: cursor.y, m: +e.target.value })}
              className="rounded-md border border-[#3a2e22]/15 bg-transparent px-2 py-1.5 text-sm outline-none"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>{m}月</option>
              ))}
            </select>
            <button
              onClick={() => shiftMonth(1)}
              className="rounded-md p-1.5 text-[#3a2e22]/70 transition-colors hover:bg-[#3a2e22]/8"
              aria-label="下月"
            >
              <ChevronRight size={20} />
            </button>
            <button
              onClick={goToday}
              className="ml-2 rounded-md bg-[#9d2933] px-4 py-1.5 text-sm text-white transition-colors hover:bg-[#8a2430]"
            >
              返回今天
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row">
        {/* 左：黄历详情 */}
        <aside className="w-full shrink-0 rounded-xl border border-[#3a2e22]/10 bg-[#faf6ec] p-5 shadow-sm lg:w-[380px]">
          <AlmanacPanel data={detail} />
        </aside>

        {/* 右：月历 + 时辰 */}
        <section className="min-w-0 flex-1">
          <div className="rounded-xl border border-[#3a2e22]/10 bg-[#faf6ec] shadow-sm">
            <CalendarGrid
              weeks={weeks}
              selected={selected}
              onSelect={onSelect}
              scheduleDates={schedDates}
            />
          </div>

          <div className="mt-6 rounded-xl border border-[#3a2e22]/10 bg-[#faf6ec] p-5 shadow-sm">
            <div className="mb-3 flex items-baseline gap-3">
              <h2 className="text-lg font-bold tracking-widest text-[#9d2933]">
                时辰吉凶
              </h2>
              <span className="text-xs text-[#3a2e22]/50">
                十二时辰 · 值神吉凶 · 悬停查看纳音与冲煞
              </span>
            </div>
            <HourPanel hours={detail.hours} />
          </div>

          <div className="mt-6 rounded-xl border border-[#3a2e22]/10 bg-[#faf6ec] p-5 shadow-sm">
            <div className="mb-3 flex items-baseline gap-3">
              <h2 className="text-lg font-bold tracking-widest text-[#9d2933]">
                行程备注
              </h2>
              <span className="text-xs text-[#3a2e22]/50">
                {selected.y}年{selected.m}月{selected.d}日 · 数据保存在本机
              </span>
            </div>
            <SchedulePanel
              y={selected.y}
              m={selected.m}
              d={selected.d}
              onChanged={refreshSchedDates}
            />
          </div>

          <p className="mt-4 text-center text-xs text-[#3a2e22]/45">
            本程序黄历吉凶宜忌等内容源自传统历法推算，仅供民俗文化交流参考。
          </p>
        </section>
      </main>
    </div>
  )
}
