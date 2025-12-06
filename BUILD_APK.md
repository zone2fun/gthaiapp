# สร้าง APK สำหรับ Test

## ขั้นตอนการสร้าง APK

### 1. ติดตั้ง EAS CLI (ถ้ายังไม่มี)
```bash
npm install -g eas-cli
```

### 2. Login เข้า Expo Account
```bash
eas login
```
หากยังไม่มี account ให้สร้างที่: https://expo.dev/signup

### 3. Configure Project
```bash
eas build:configure
```

### 4. Build APK สำหรับ Test
```bash
eas build --platform android --profile preview
```

คำสั่งนี้จะ:
- สร้าง APK file (ไม่ใช่ AAB)
- ใช้เวลาประมาณ 10-20 นาที
- Build บน cloud ของ Expo (ไม่ต้องมี Android Studio)
- ได้ลิงก์ดาวน์โหลด APK เมื่อ build เสร็จ

### 5. ดาวน์โหลดและติดตั้ง
เมื่อ build เสร็จ:
1. จะได้ลิงก์ดาวน์โหลด APK
2. ส่งลิงก์ไปยังมือถือ Android
3. ดาวน์โหลดและติดตั้ง APK
4. อนุญาต "Install from Unknown Sources" ถ้าจำเป็น

## Alternative: Build แบบ Local (ถ้าต้องการ)

### ถ้าต้องการ build บนเครื่องตัวเอง:
```bash
eas build --platform android --profile preview --local
```

**หมายเหตุ:** Local build ต้องมี:
- Android Studio ติดตั้งแล้ว
- Android SDK
- Java Development Kit (JDK)

## ตรวจสอบสถานะ Build

```bash
eas build:list
```

## ดู Build Log
```bash
eas build:view [BUILD_ID]
```

## Tips:
- ใช้ profile "preview" สำหรับ test APK
- ใช้ profile "production" สำหรับ AAB (Google Play Store)
- APK สามารถแชร์และติดตั้งได้โดยตรง
- AAB ต้องอัพโหลดผ่าน Google Play Console

## ปัญหาที่อาจพบ:

### 1. ถ้า build ล้มเหลว
- ตรวจสอบ app.json configuration
- ดู build logs เพื่อหาสาเหตุ
- ตรวจสอบว่า dependencies ครบถ้วน

### 2. ถ้าติดตั้ง APK ไม่ได้
- เปิด "Install from Unknown Sources" ในการตั้งค่า Android
- ตรวจสอบว่า APK ไม่เสียหาย

### 3. ถ้า app crash เมื่อเปิด
- ตรวจสอบ API URL ใน services/api.ts
- ตรวจสอบ permissions ใน app.json
