// import { environment } from '../environment';

// export const LOGIN_API_ENDPOINTS = {

//   isUserActive: (username: string, password: string) =>
//     `${environment.apiBaseUrl}/login/${username}/${password}/is-active`,


//   isUsernameExist: (username: string) =>
//     `${environment.apiBaseUrl}/login/${username}/is-exist`,

  
//   isCorrect: (username: string, password: string) =>
//     `${environment.apiBaseUrl}/login/${username}/${password}/is-exist`,
//   saveLogin: `${environment.apiBaseUrl}/login/`,
// };
import { environment } from '../environment';

export const LOGIN_API_ENDPOINTS = {
  // 1. التحقق من حالة نشاط المستخدم (التحقق من الصلاحية والنشاط معاً)
  isUserActive: (username: string, password: string) =>
    `${environment.apiBaseUrl}/login/${username}/${password}/is-active`,

  // 2. التحقق من وجود اسم المستخدم فقط
  isUsernameExist: (username: string) =>
    `${environment.apiBaseUrl}/login/${username}/is-exist`,

  // 3. التحقق من صحة اسم المستخدم وكلمة المرور معاً بداخل النظام
  isCorrect: (username: string, password: string) =>
    `${environment.apiBaseUrl}/login/${username}/${password}/is-exist`,

  // ✅ 4. تصحيح الرابط ليصبح دالة ديناميكية تستقبل الـ userId وتمرره للمسار تماماً كما يتوقعه الـ Controller
  saveLogin: (userId: number) => 
    `${environment.apiBaseUrl}/login/${userId}`,
};