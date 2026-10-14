// 行程备注：按日期存储在 localStorage
export interface ScheduleItem {
  id: string
  title: string
  time: string // "HH:mm"，可为空
  remind: boolean // 是否提醒
  done: boolean
  createdAt: number
}

export function dateKey(y: number, m: number, d: number): string {
  return `${y}-${m}-${d}`
}

const PREFIX = 'wl_sched_'

export function loadSchedules(y: number, m: number, d: number): ScheduleItem[] {
  try {
    const raw = localStorage.getItem(PREFIX + dateKey(y, m, d))
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

export function saveSchedules(
  y: number,
  m: number,
  d: number,
  items: ScheduleItem[]
): void {
  localStorage.setItem(PREFIX + dateKey(y, m, d), JSON.stringify(items))
}

export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

/** 所有有行程的日期 key（用于月历标记） */
export function allScheduleDates(): Set<string> {
  const set = new Set<string>()
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(PREFIX)) {
        const items: ScheduleItem[] = JSON.parse(localStorage.getItem(k) || '[]')
        if (items.some((x) => !x.done)) set.add(k.slice(PREFIX.length))
      }
    }
  } catch {
    /* ignore */
  }
  return set
}
