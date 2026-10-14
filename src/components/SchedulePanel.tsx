import { useEffect, useState } from 'react'
import { Bell, BellOff, Plus, Trash2 } from 'lucide-react'
import type { ScheduleItem } from '@/lib/schedule'
import { loadSchedules, newId, saveSchedules } from '@/lib/schedule'
import {
  cancelNativeNotification,
  hasReminderPermission,
  requestReminderPermission,
  scheduleNativeNotification,
} from '@/lib/reminder'

interface Props {
  y: number
  m: number
  d: number
  onChanged: () => void
}

export default function SchedulePanel({ y, m, d, onChanged }: Props) {
  const [items, setItems] = useState<ScheduleItem[]>([])
  const [title, setTitle] = useState('')
  const [time, setTime] = useState('')
  const [remind, setRemind] = useState(true)
  const [permGranted, setPermGranted] = useState(false)

  const reload = () => setItems(loadSchedules(y, m, d))

  useEffect(() => {
    reload()
    void hasReminderPermission().then(setPermGranted)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [y, m, d])

  const persist = (next: ScheduleItem[]) => {
    saveSchedules(y, m, d, next)
    setItems(next)
    onChanged()
  }

  const addItem = async () => {
    const t = title.trim()
    if (!t) return
    const item: ScheduleItem = {
      id: newId(),
      title: t,
      time,
      remind,
      done: false,
      createdAt: Date.now(),
    }
    persist([...items, item])
    setTitle('')
    setTime('')
    if (remind && !permGranted) {
      const ok = await requestReminderPermission()
      setPermGranted(ok)
    }
    await scheduleNativeNotification(y, m, d, item)
  }

  const toggleDone = (id: string) => {
    const next = items.map((x) => (x.id === id ? { ...x, done: !x.done } : x))
    const item = next.find((x) => x.id === id)
    if (item?.done && item) void cancelNativeNotification(y, m, d, item)
    persist(next)
  }

  const toggleRemind = async (id: string) => {
    const next = items.map((x) => (x.id === id ? { ...x, remind: !x.remind } : x))
    const item = next.find((x) => x.id === id)!
    if (item.remind) {
      if (!permGranted) setPermGranted(await requestReminderPermission())
      await scheduleNativeNotification(y, m, d, item)
    } else {
      await cancelNativeNotification(y, m, d, item)
    }
    persist(next)
  }

  const removeItem = (id: string) => {
    const item = items.find((x) => x.id === id)
    if (item) void cancelNativeNotification(y, m, d, item)
    persist(items.filter((x) => x.id !== id))
  }

  return (
    <div>
      {/* 添加行程 */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && void addItem()}
          placeholder="添加行程备注，回车保存"
          className="min-w-0 flex-1 rounded-md border border-[#3a2e22]/15 bg-white/60 px-3 py-2 text-sm outline-none placeholder:text-[#3a2e22]/35 focus:border-[#9d2933]/50"
        />
        <div className="flex items-center gap-2">
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="rounded-md border border-[#3a2e22]/15 bg-white/60 px-2 py-2 text-sm outline-none focus:border-[#9d2933]/50"
          />
          <button
            onClick={() => setRemind(!remind)}
            title={remind ? '提醒已开启' : '提醒已关闭'}
            className={`rounded-md border p-2 transition-colors ${
              remind
                ? 'border-[#9d2933]/40 bg-[#9d2933]/10 text-[#9d2933]'
                : 'border-[#3a2e22]/15 text-[#3a2e22]/40'
            }`}
          >
            {remind ? <Bell size={16} /> : <BellOff size={16} />}
          </button>
          <button
            onClick={() => void addItem()}
            className="flex items-center gap-1 rounded-md bg-[#9d2933] px-3 py-2 text-sm text-white transition-colors hover:bg-[#8a2430]"
          >
            <Plus size={16} /> 添加
          </button>
        </div>
      </div>

      {/* 列表 */}
      {items.length > 0 && (
        <ul className="mt-3 flex flex-col divide-y divide-[#3a2e22]/8">
          {items.map((x) => (
            <li key={x.id} className="flex items-center gap-3 py-2">
              <input
                type="checkbox"
                checked={x.done}
                onChange={() => toggleDone(x.id)}
                className="h-4 w-4 accent-[#9d2933]"
              />
              <span
                className={`min-w-0 flex-1 truncate text-sm ${
                  x.done ? 'text-[#3a2e22]/35 line-through' : 'text-[#2b2118]'
                }`}
              >
                {x.title}
              </span>
              {x.time && (
                <span className="shrink-0 text-xs text-[#3a2e22]/55">{x.time}</span>
              )}
              <button
                onClick={() => void toggleRemind(x.id)}
                title={x.remind ? '点击关闭提醒' : '点击开启提醒'}
                className={`shrink-0 rounded p-1 transition-colors ${
                  x.remind ? 'text-[#9d2933]' : 'text-[#3a2e22]/25'
                }`}
              >
                {x.remind ? <Bell size={15} /> : <BellOff size={15} />}
              </button>
              <button
                onClick={() => removeItem(x.id)}
                title="删除"
                className="shrink-0 rounded p-1 text-[#3a2e22]/30 transition-colors hover:text-[#9d2933]"
              >
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}
      {items.length === 0 && (
        <p className="mt-3 text-center text-xs text-[#3a2e22]/40">
          当日暂无行程。输入事项并可选时间，到点自动提醒（App 打开时网页版即可提醒，安装手机版后关闭也能提醒）。
        </p>
      )}
    </div>
  )
}
