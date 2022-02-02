
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

export function formatTimeDuration(time: number, speed: number) {
  return dayjs
    .duration(
      Math.round((time) / 1000 / speed),
      'milliseconds',
    )
    .format('mm:ss.SSS');
}
