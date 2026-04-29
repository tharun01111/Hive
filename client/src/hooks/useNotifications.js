import { useEffect } from 'react'
import { useNotificationStore } from '../store/notification.store.js'
import { getNotificationsApi } from '../api/notification.api.js'

export const useNotifications = () => {
  const { notifications, unreadCount, setNotifications } = useNotificationStore()

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getNotificationsApi()
        setNotifications(data.notifications, data.unreadCount)
      } catch (err) {
        console.error('Failed to load notifications', err)
      }
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { notifications, unreadCount }
}