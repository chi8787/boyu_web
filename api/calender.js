// 這個檔案會被 Vercel 自動變成一個 API
import fetch from 'node-fetch';
import ical from 'node-ical';

export default async function handler(request, response) {
  // 請換成你 Booking 的真實 .ics 連結
  const BOOKING_ICAL_URL = 'https://calendar.google.com/calendar/ical/zh-tw.taiwan%23holiday%40group.v.calendar.google.com/public/basic.ics';

  try {
    const res = await fetch(BOOKING_ICAL_URL);
    const text = await res.text();
    const data = await ical.async.parseICS(text);
    
    const bookedDates = [];
    
    // 解析 iCal 找出已被訂走的日期
    for (const k in data) {
      if (data.hasOwnProperty(k)) {
        const ev = data[k];
        if (data[k].type == 'VEVENT') {
            let current = new Date(ev.start);
            const end = new Date(ev.end);
            
            while(current < end) {
                bookedDates.push(current.toISOString().split('T')[0]);
                current.setDate(current.getDate() + 1);
            }
        }
      }
    }
    
    // 回傳給前端
    response.status(200).json([...new Set(bookedDates)]);
  } catch (error) {
    response.status(500).json({ error: '無法讀取日曆' });
  }
}