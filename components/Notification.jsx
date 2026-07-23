import { DateTime } from 'luxon';
import { getDataStatus } from '@/lib/db.js';
import NotificationBanner from './NotificationBanner';

export default async function Notification() {
  const status = await getDataStatus();
  const updatedOn = status
    ? DateTime.fromSQL(status.updatedAt, { zone: 'utc' }).toFormat('LLL d, yyyy')
    : null;

  return <NotificationBanner updatedOn={updatedOn} />;
}
