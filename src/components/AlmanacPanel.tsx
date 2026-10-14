import type { AlmanacDetail } from '@/lib/almanac'

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-[#3a2e22]/50">{label}</span>
      <span className="text-sm text-[#2b2118]">{value}</span>
    </div>
  )
}

export default function AlmanacPanel({ data }: { data: AlmanacDetail }) {
  const isJiDay = data.tianShenLuck === '凶'
  return (
    <div className="flex flex-col gap-5">
      {/* 日期头部 */}
      <div className="text-center">
        <div className="text-3xl font-bold tracking-wide text-[#2b2118]">
          {data.solarText}
        </div>
        <div className="mt-1 text-sm text-[#3a2e22]/60">
          {data.weekText} · {data.lunarYearText} {data.shengXiao}年
        </div>
        <div className="mt-3 text-2xl font-semibold tracking-[0.2em] text-[#9d2933]">
          农历{data.lunarText}
        </div>
        <div className="mt-2 text-sm text-[#3a2e22]/70">{data.ganzhi}</div>
        {data.festivals.length > 0 && (
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {data.festivals.map((f) => (
              <span
                key={f}
                className="rounded-full bg-[#9d2933]/10 px-3 py-0.5 text-xs text-[#9d2933]"
              >
                {f}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="h-px bg-[#3a2e22]/10" />

      {/* 吉凶总览 */}
      <div
        className={`rounded-lg border py-3 text-center ${
          isJiDay
            ? 'border-[#3a2e22]/20 bg-[#3a2e22]/5'
            : 'border-[#9d2933]/30 bg-[#9d2933]/5'
        }`}
      >
        <div
          className={`text-xl font-bold ${isJiDay ? 'text-[#5a5a5a]' : 'text-[#9d2933]'}`}
        >
          {data.tianShenType} · {data.tianShenLuck}日
        </div>
        <div className="mt-1 text-sm text-[#3a2e22]/70">
          值神：{data.tianShen} · 十二建星：{data.zhiXing}
        </div>
      </div>

      {/* 详情两列 */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <Item label="星宿" value={`${data.xiu}宿（${data.xiuLuck}）· ${data.gong}宫`} />
        <Item label="冲煞" value={`冲${data.chongDesc} 煞${data.sha}`} />
        <Item label="喜神方位" value={data.xi} />
        <Item label="福神方位" value={data.fu} />
        <Item label="财神方位" value={data.cai} />
        <Item label="阳贵 / 阴贵" value={`${data.yangGui} / ${data.yinGui}`} />
        <Item label="五行纳音（年）" value={data.yearNaYin} />
        <Item label="五行纳音（月）" value={data.monthNaYin} />
        <Item label="五行纳音（日）" value={data.dayNaYin} />
        <Item label="节气" value={`${data.prevJieQi} → ${data.nextJieQi}`} />
      </div>

      <div className="rounded-lg bg-[#3a2e22]/5 p-3 text-xs leading-relaxed text-[#3a2e22]/70">
        <span className="font-medium text-[#3a2e22]/90">彭祖百忌：</span>
        {data.pengZuGan} {data.pengZuZhi}
      </div>

      {/* 宜忌 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-[#2e7d4f]/25 bg-[#2e7d4f]/5 p-3">
          <div className="mb-2 text-center text-lg font-bold tracking-[0.3em] text-[#2e7d4f]">
            宜
          </div>
          <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 text-sm text-[#2b2118]">
            {data.yi.map((x) => (
              <span key={x}>{x}</span>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-[#9d2933]/25 bg-[#9d2933]/5 p-3">
          <div className="mb-2 text-center text-lg font-bold tracking-[0.3em] text-[#9d2933]">
            忌
          </div>
          <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 text-sm text-[#2b2118]">
            {data.ji.map((x) => (
              <span key={x}>{x}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
