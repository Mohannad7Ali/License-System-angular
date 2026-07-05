// import { environment } from '../environment';

// export const TESTS_API_ENDPOINTS = {
//   read: (id: number) => `${environment.apiBaseUrl}/test/${id}`,
//   add: `${environment.apiBaseUrl}/test/new`,
//   all: `${environment.apiBaseUrl}/test/tests`,
//   count: `${environment.apiBaseUrl}/test/count`,
//   passedPercentage: `${environment.apiBaseUrl}/test/passed-percetage`,
//   faieldPercentage: `${environment.apiBaseUrl}/test/failed-percetage`,
// };

import { environment } from '../environment';

export const TESTS_API_ENDPOINTS = {
  // 1. العمليات الأساسية لجلب وإضافة الاختبارات
  all: `${environment.apiBaseUrl}/test/tests`,
  add: `${environment.apiBaseUrl}/test/new`,

  // ✅ 2. تحويل العمليات الفردية إلى دالات ديناميكية آمنة ومطابقة للسيرفر تماماً
  read: (id: number) => `${environment.apiBaseUrl}/test/${id}`,
  update: (id: number) => `${environment.apiBaseUrl}/test/${id}`,
  delete: (id: number) => `${environment.apiBaseUrl}/test/${id}`,

  // ✅ 3. مطابقة مسار البحث المركب بالترتيب الصحيح للمعاملات كما هو معتمد لديك في السيرفر
  readByPersonAndLicenseClass: (personId: number, testTypeId: number, licenseClassId: number) => 
    `${environment.apiBaseUrl}/test/test-by/test-type/${personId}/${testTypeId}/${licenseClassId}`,

  // 4. الإحصائيات والعدادات الخاصة بالاختبارات
  count: `${environment.apiBaseUrl}/test/count`,
  passedPercentage: `${environment.apiBaseUrl}/test/passed-percetage`,
  failedPercentage: `${environment.apiBaseUrl}/test/failed-percetage`, // تصحيح إملائي بسيط لـ failed ليتطابق مع السيرفر
};