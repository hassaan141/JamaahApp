import React from 'react'
import NotificationItem, {
  type Notification,
} from '@/components/HomeScreen/NotificationItem'

export default function MyNotificationItem({
  notification,
}: {
  notification: Notification
}) {
  return <NotificationItem notification={notification} />
}
