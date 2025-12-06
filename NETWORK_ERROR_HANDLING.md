# Network Error Handling

ระบบจัดการ Network Error สำหรับ Mobile App ที่จะแสดง Modal กลางหน้าจอเมื่อเกิดปัญหาการเชื่อมต่อกับ Server หรือไม่มี Internet

## ไฟล์ที่เกี่ยวข้อง

1. **contexts/NetworkErrorContext.tsx** - Context สำหรับจัดการสถานะ error
2. **components/NetworkErrorModal.tsx** - Modal component สำหรับแสดงข้อความ error
3. **hooks/useApiErrorHandler.ts** - Custom hook สำหรับใช้งานง่าย
4. **services/api.ts** - เพิ่ม `isNetworkError()` function

## วิธีการใช้งาน

### วิธีที่ 1: ใช้ useNetworkError โดยตรง

```typescript
import { useNetworkError } from '@/contexts/NetworkErrorContext';
import { isNetworkError } from '@/services/api';

function MyComponent() {
  const { showError } = useNetworkError();

  const handleApiCall = async () => {
    try {
      const result = await someApiFunction();
      // Handle success
    } catch (error: any) {
      if (isNetworkError(error)) {
        showError(
          'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้\nกรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต',
          handleApiCall // Retry function
        );
      } else {
        // Handle other errors
        Alert.alert('Error', error.message);
      }
    }
  };

  return (
    // Your component JSX
  );
}
```

### วิธีที่ 2: ใช้ useApiErrorHandler (แนะนำ)

```typescript
import { useApiErrorHandler } from '@/hooks/useApiErrorHandler';
import { Alert } from 'react-native';

function MyComponent() {
  const handleApiCall = useApiErrorHandler();

  const fetchData = async () => {
    const result = await handleApiCall(
      async () => {
        return await someApiFunction();
      },
      fetchData, // Retry callback (optional)
      'ข้อความ error แบบกำหนดเอง (optional)'
    );

    if (result) {
      // Handle success
      console.log('Data:', result);
    }
  };

  // หรือใช้แบบนี้ถ้าต้องการจัดการ error เอง
  const submitForm = async () => {
    try {
      await handleApiCall(
        async () => {
          return await createPost(formData);
        },
        submitForm
      );
      // Success handling
      Alert.alert('Success', 'Post created!');
    } catch (error: any) {
      // Handle non-network errors
      Alert.alert('Error', error.message);
    }
  };

  return (
    // Your component JSX
  );
}
```

### วิธีที่ 3: ใช้ใน useEffect

```typescript
import { useApiErrorHandler } from '@/hooks/useApiErrorHandler';
import { useEffect, useState } from 'react';

function MyComponent() {
  const handleApiCall = useApiErrorHandler();
  const [data, setData] = useState(null);

  const loadData = async () => {
    const result = await handleApiCall(
      async () => {
        return await fetchUsers();
      },
      loadData // Retry will call loadData again
    );

    if (result) {
      setData(result);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    // Your component JSX
  );
}
```

## ตัวอย่างการใช้งานในหน้าต่างๆ

### Login Page
ดูตัวอย่างใน `app/login.tsx`

### Chat Page
```typescript
const sendMessage = async () => {
  const result = await handleApiCall(
    async () => {
      return await sendMessage(userId, text, token);
    },
    sendMessage
  );

  if (result) {
    setMessages([...messages, result]);
    setText('');
  }
};
```

### Profile Page
```typescript
const updateProfile = async () => {
  try {
    await handleApiCall(
      async () => {
        return await updateUser(userId, formData, token);
      },
      updateProfile
    );
    Alert.alert('Success', 'Profile updated!');
  } catch (error: any) {
    Alert.alert('Error', error.message);
  }
};
```

## การปรับแต่ง Modal

หากต้องการปรับแต่งข้อความหรือสไตล์ของ Modal สามารถแก้ไขได้ที่:
- **ข้อความ**: `components/NetworkErrorModal.tsx`
- **สไตล์**: `components/NetworkErrorModal.tsx` (styles object)

## Network Error Detection

ระบบจะตรวจจับ error ประเภทต่อไปนี้:
- Network request failed
- Failed to fetch
- Timeout
- Connection errors
- ECONNABORTED, ENOTFOUND, ENETUNREACH

ดูรายละเอียดเพิ่มเติมใน `services/api.ts` function `isNetworkError()`
