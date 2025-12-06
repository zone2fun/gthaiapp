# Real-time Online Status Implementation

## สรุปการทำงาน

ระบบ real-time online status ได้ถูกนำมาใช้แล้วในทุกหน้าที่เกี่ยวข้อง

## ส่วนประกอบ

### 1. Backend (server.js)
- ✅ เมื่อ user เชื่อมต่อ → ตั้งค่า `isOnline: true` และ emit event `user status`
- ✅ เมื่อ user disconnect → ตั้งค่า `isOnline: false` และ emit event `user status`

### 2. Frontend Hook (hooks/useOnlineStatus.ts)
- ✅ Custom hook สำหรับ track online status แบบ real-time
- ✅ Listen socket event `user status` และอัปเดต state
- ✅ มี helper function `getOnlineStatus(userId, fallback)` สำหรับดึงสถานะ

### 3. หน้าที่ใช้ Real-time Online Status

#### ✅ User Profile (`/user/[id]`)
- แสดงจุดสีเขียว/เทาข้าง avatar
- แสดงข้อความ "Online" หรือ "Offline"
- อัปเดตแบบ real-time เมื่อ user เปลี่ยนสถานะ

#### ✅ Chat 1:1 (`/chat/[id]`)
- แสดงสถานะ "Online" ใน header
- อัปเดตแบบ real-time

#### ✅ Chat List (`/(tabs)/chat`)
- แสดงจุดสีเขียวข้าง avatar ของ user ที่ online
- อัปเดตแบบ real-time

#### ✅ Home Page (`/(tabs)/index`)
- มี filter "Online Only" ที่ใช้ `user.isOnline`
- ข้อมูลจาก API จะถูกอัปเดตตาม backend

#### ✅ Search Page (`/search`)
- แสดงสถานะ online ของผู้ใช้ในผลการค้นหา

## วิธีการใช้งาน

```typescript
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

function MyComponent() {
  const { getOnlineStatus } = useOnlineStatus();
  
  // ใช้ getOnlineStatus พร้อม fallback
  const isOnline = getOnlineStatus(userId, user.isOnline);
  
  return (
    <View>
      {isOnline && <Text>Online</Text>}
    </View>
  );
}
```

## การทำงาน

1. **เมื่อ user login/connect**:
   - Socket emit `setup` event
   - Backend ตั้งค่า `isOnline: true` ใน database
   - Backend broadcast `user status` event ไปยัง clients ทั้งหมด

2. **เมื่อ user logout/disconnect**:
   - Socket disconnect
   - Backend ตั้งค่า `isOnline: false` ใน database
   - Backend broadcast `user status` event ไปยัง clients ทั้งหมด

3. **เมื่อ client รับ `user status` event**:
   - `useOnlineStatus` hook อัปเดต state
   - Component ที่ใช้ `getOnlineStatus()` จะ re-render อัตโนมัติ
   - UI แสดงสถานะใหม่ทันที

## ข้อดี

- ✅ อัปเดตแบบ real-time ไม่ต้อง refresh
- ✅ ใช้งานง่าย ผ่าน custom hook
- ✅ มี fallback เป็นค่าจาก API
- ✅ ประหยัด bandwidth (ส่งเฉพาะเมื่อมีการเปลี่ยนแปลง)
- ✅ ใช้งานได้ทุกหน้าที่ต้องการ

## หมายเหตุ

- หน้า My Profile (`/(tabs)/profile`) ไม่จำเป็นต้องใช้ real-time tracking เพราะเป็นโปรไฟล์ของตัวเอง ซึ่งจะ online เสมอ
- ระบบจะทำงานได้ดีที่สุดเมื่อ backend server กำลังทำงาน
