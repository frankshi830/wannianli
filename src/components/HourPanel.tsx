import type { HourInfo } from '@/lib/almanac'

export default function HourPanel({ hours }: { hours: HourInfo[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {hours.map((h) => (
        <div
          key={h.zhi}
          className={`relative rounded-lg border p-2.5 text-center transition-colors ${
            h.isNow
              ? 'border-[#9d2933] bg-[#9d2933]/10 shadow-sm'
              : h.luck === '吉'
                ? 'border-[#2e7d4f]/20 bg-[#2e7d4f]/5'
                : 'border-[#3a2e22]/10 bg-white/40'
          }`}
          title={`${h.tianShen}（${h.luck}）· 纳音${h.naYin} · 冲${h.chong}`}
        >
          {h.isNow && (
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-[#9d2933] px-2 py-px text-[10px] text-white">
              此时
            </span>
          )}
          <div className="text-base font-semibold text-[#2b2118]">
            {h.zhi}时
            <span className="ml-1 text-xs font-normal text-[#3a2e22]/50">
              {h.ganZhi}
            </span>
          </div>
          <div className="mt-0.5 text-[11px] text-[#3a2e22]/55">{h.range}</div>
          <div
            className={`mt-1 text-xs font-medium ${
              h.luck === '吉' ? 'text-[#2e7d4f]' : 'text-[#8a8a8a]'
            }`}
          >
            {h.tianShen} · {h.luck}
          </div>
        </div>
      ))}
    </div>
  )
}
