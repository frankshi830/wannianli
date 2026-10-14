import type { DayInfo } from '@/lib/almanac'
import { WEEK_NAMES } from '@/lib/almanac'

interface Props {
  weeks: DayInfo[][]
  selected: { y: number; m: number; d: number }
  onSelect: (y: number, m: number, d: number) => void
  scheduleDates?: Set<string>
}

export default function CalendarGrid({ weeks, selected, onSelect, scheduleDates }: Props) {
  return (
    <div className="select-none">
      <div className="grid grid-cols-7 border-b border-[#3a2e22]/10">
        {WEEK_NAMES.map((w, i) => (
          <div
            key={w}
            className={`py-2 text-center text-sm tracking-widest ${
              i === 0 || i === 6 ? 'text-[#9d2933]' : 'text-[#3a2e22]/70'
            }`}
          >
            {w}
          </div>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7">
          {week.map((d) => {
            const isSelected =
              selected.y === d.year && selected.m === d.month && selected.d === d.day
            const isFestival = d.festivals.length > 0 || d.jieQi !== ''
            const good = d.luck.includes('吉')
            const hasSched = scheduleDates?.has(`${d.year}-${d.month}-${d.day}`) ?? false
            return (
              <button
                key={`${d.year}-${d.month}-${d.day}`}
                onClick={() => onSelect(d.year, d.month, d.day)}
                className={`group relative flex h-20 flex-col items-center justify-center gap-0.5 border-b border-r border-[#3a2e22]/8 transition-colors last:border-r-0 hover:bg-[#9d2933]/5 md:h-24 ${
                  d.inMonth ? '' : 'opacity-35'
                } ${isSelected ? 'bg-[#9d2933]/8' : ''}`}
                title={`${d.year}-${d.month}-${d.day} 宜:${d.yi.slice(0, 4).join(' ')} 忌:${d.ji
                  .slice(0, 3)
                  .join(' ')}`}
              >
                <span
                  className={`text-lg font-medium md:text-xl ${
                    d.isToday
                      ? 'flex h-8 w-8 items-center justify-center rounded-full bg-[#9d2933] text-white'
                      : d.week === 0 || d.week === 6
                        ? 'text-[#9d2933]'
                        : 'text-[#2b2118]'
                  }`}
                >
                  {d.day}
                </span>
                <span
                  className={`text-[11px] leading-none md:text-xs ${
                    isFestival ? 'text-[#9d2933]' : 'text-[#3a2e22]/55'
                  }`}
                >
                  {d.jieQi || d.festivals[0] || d.lunarText}
                </span>
                {hasSched && (
                  <span className="absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#2e7d4f]" />
                )}
                <span
                  className={`absolute bottom-1 right-1.5 hidden text-[10px] md:block ${
                    good ? 'text-[#2e7d4f]' : 'text-[#8a8a8a]'
                  }`}
                >
                  {d.luck}
                </span>
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
