import { Capacitor } from '@capacitor/core'
import type { ScheduleItem } from './schedule'
import { dateKey, loadSchedules } from './schedule'

/**
 * 提醒引擎：
 * - 网页版：页面打开期间，通过浏览器 Notification 弹出提醒
 * - 安卓 APK：通过 Capacitor 本地通知，即使 App 关闭也能按时提醒
 */

const FIRED_KEY = 'wl_fired_v1'
const isNative = Capacitor.isNativePlatform()

function loadFired(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(FIRED_KEY) || '[]'))
  } catch {
    return new Set()
  }
}

function markFired(key: string) {
  const s = loadFired()
  s.add(key)
  // 只保留最近 200 条
  const arr = [...s].slice(-200)
  localStorage.setItem(FIRED_KEY, JSON.stringify(arr))
}

export function clearFired(key: string) {
  const s = loadFired()
  s.delete(key)
  localStorage.setItem(FIRED_KEY, JSON.stringify([...s]))
}

export async function requestReminderPermission(): Promise<boolean> {
  try {
    if (isNative) {
      const { LocalNotifications } = await import('@capacitor/local-notifications')
      const res = await LocalNotifications.requestPermissions()
      return res.display === 'granted'
    }
    if ('Notification' in window) {
      const p = await Notification.requestPermission()
      return p === 'granted'
    }
  } catch {
    /* ignore */
  }
  return false
}

export async function hasReminderPermission(): Promise<boolean> {
  try {
    if (isNative) {
      const { LocalNotifications } = await import('@capacitor/local-notifications')
      const res = await LocalNotifications.checkPermissions()
      return res.display === 'granted'
    }
    return 'Notification' in window && Notification.permission === 'granted'
  } catch {
    return false
  }
}

async function fireNotification(title: string, body: string) {
  try {
    if (isNative) {
      const { LocalNotifications } = await import('@capacitor/local-notifications')
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Math.floor(Math.random() * 2147483647),
            title,
            body,
            schedule: { at: new Date(Date.now() + 500) },
          },
        ],
      })
    } else if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/icon-192.png' })
    }
  } catch {
    /* ignore */
  }
}

/** App 打开期间周期性检查到点提醒（网页版依赖页面在线；APK 由系统触发） */
export function startReminderLoop(onFire?: (item: ScheduleItem) => void): () => void {
  const tick = async () => {
    const now = new Date()
    const y = now.getFullYear()
    const m = now.getMonth() + 1
    const d = now.getDate()
    const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`
    const dk = dateKey(y, m, d)
    const items = loadSchedules(y, m, d).filter((x) => x.remind && !x.done)
    for (const item of items) {
      if (!item.time || item.time > hhmm) continue
      const fkey = `${dk}#${item.id}`
      if (loadFired().has(fkey)) continue
      markFired(fkey)
      await fireNotification('行程提醒', `${item.time ? item.time + ' ' : ''}${item.title}`)
      onFire?.(item)
    }
  }
  void tick()
  const timer = window.setInterval(tick, 20000)
  return () => window.clearInterval(timer)
}

/** 安卓端：为某条行程调度系统本地通知（App 关闭也能提醒） */
export async function scheduleNativeNotification(
  y: number,
  m: number,
  d: number,
  item: ScheduleItem
): Promise<void> {
  if (!isNative || !item.remind || item.done || !item.time) return
  const at = new Date(y, m - 1, d, +item.time.slice(0, 2), +item.time.slice(3), 0)
  if (at.getTime() <= Date.now()) return
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    await LocalNotifications.schedule({
      notifications: [
        {
          id: Math.abs(hashCode(`${y}-${m}-${d}#${item.id}`)),
          title: '行程提醒',
          body: `${item.time} ${item.title}`,
          schedule: { at },
        },
      ],
    })
  } catch {
    /* ignore */
  }
}

export async function cancelNativeNotification(
  y: number,
  m: number,
  d: number,
  item: ScheduleItem
): Promise<void> {
  if (!isNative) return
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    await LocalNotifications.cancel({
      notifications: [{ id: Math.abs(hashCode(`${y}-${m}-${d}#${item.id}`)) }],
    })
  } catch {
    /* ignore */
  }
}

function hashCode(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0
  }
  return h
}
