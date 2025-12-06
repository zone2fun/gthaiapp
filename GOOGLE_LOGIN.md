# Google Login - Quick Setup Guide

## ✅ สิ่งที่ทำเสร็จแล้ว

1. ✅ เพิ่ม Google Login logic ใน `app/login.tsx`
2. ✅ ใช้ Expo Auth Session (ไม่ต้องใช้ SHA-1)
3. ✅ **ไม่ได้แก้ไข `services/api.ts`** - ระบบเดิมยังทำงานปกติ
4. ✅ Client ID ใส่ไว้แล้ว

## 🎯 Redirect URI สำหรับ Google Console

ใส่ redirect URI นี้ใน Google Cloud Console:

```
https://auth.expo.io/@zone2fun/gthai-mobile
```

## 📋 Setup (3 ขั้นตอน)

### 1. ตรวจสอบ OAuth Credentials

ไปที่: https://console.cloud.google.com/apis/credentials

ตรวจสอบว่ามี redirect URI:
```
https://auth.expo.io/@zone2fun/gthai-mobile
```

### 2. Build App

```bash
cd mobile-app
eas build --platform android --profile preview
```

### 3. ทดสอบ

- ติดตั้ง APK
- กดปุ่ม "Continue with Google"
- เลือก Google account
- Login สำเร็จ!

## 🔍 สิ่งที่เปลี่ยนแปลง

### ไฟล์ที่แก้ไข:
- ✅ `app/login.tsx` - เพิ่ม Google Login logic

### ไฟล์ที่ไม่ได้แก้ไข:
- ✅ `services/api.ts` - **ไม่ได้แก้ไข** (ระบบเดิมปลอดภัย!)
- ✅ ไฟล์อื่นๆ ทั้งหมด

## 💡 วิธีการทำงาน

1. User กดปุ่ม "Continue with Google"
2. เปิด browser → Google Sign-In
3. User authorize
4. Redirect กลับมา app ผ่าน Expo proxy
5. แลก code เป็น access token
6. ส่ง token ไปยัง backend `/api/auth/google`
7. Login สำเร็จ!

## ⚠️ หมายเหตุ

- Google Login ทำงานได้เฉพาะ **EAS Build** (ไม่ใช่ Expo Go)
- ไม่ต้องใช้ SHA-1 fingerprint
- ไม่ต้อง configure keystore
- Backend API พร้อมใช้งานแล้ว

---

**พร้อมใช้งาน!** 🚀
