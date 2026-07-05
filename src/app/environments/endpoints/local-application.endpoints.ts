// import { env } from 'process';
// import { environment } from '../environment';

// export const LOCAL_APPLICATION_API_ENDPOINT = {
//   all: `${environment.apiBaseUrl}/localApplication/local-applications`,
//   create: `${environment.apiBaseUrl}/localApplication/`,
//   read: `${environment.apiBaseUrl}/localApplication/`,
//   readPersonID: (id: number) =>
//     `${environment.apiBaseUrl}/localApplication/${id}/person`,
//   readView: (id: number) =>
//     `${environment.apiBaseUrl}/localApplication/${id}/view`,
//   passedTestCount: (id: number) =>
//     `${environment.apiBaseUrl}/localApplication/${id}/passed-test-count`,
//   isTestAttended: (id: number, testID: number) =>
//     `${environment.apiBaseUrl}/localApplication/${id}/is-test-attended/${testID}`,
//   isLicenseIssued: (id: number) =>
//     `${environment.apiBaseUrl}/localApplication/${id}/license-issued`,

//   cancel: (id: number) =>
//     `${environment.apiBaseUrl}/localApplication/${id}/cancel`,
//   issueLicense: (id: number, notes: string | null, userID: number) =>
//     `${environment.apiBaseUrl}/localApplication/${id}/issue-license/${notes}/${userID}`,
//   licenseID: (id: number) =>
//     `${environment.apiBaseUrl}/localApplication/${id}/license-id`,
// };

import { environment } from '../environment';

export const LOCAL_APPLICATION_API_ENDPOINT = {
  // 1. العمليات العامة والشاملة لطلبات الرخص المحلية
  all: `${environment.apiBaseUrl}/localApplication/local-applications`,
  create: `${environment.apiBaseUrl}/localApplication`,

  // ✅ 2. تحويل العمليات الفردية إلى دالات ديناميكية آمنة ومطابقة للسيرفر تماماً
  read: (id: number) => `${environment.apiBaseUrl}/localApplication/${id}`,
  update: (id: number) => `${environment.apiBaseUrl}/localApplication/${id}`,
  delete: (id: number) => `${environment.apiBaseUrl}/localApplication/${id}`,
  
  readPersonID: (id: number) => `${environment.apiBaseUrl}/localApplication/${id}/person`,
  readView: (id: number) => `${environment.apiBaseUrl}/localApplication/${id}/view`,
  
  // 3. عمليات الفحص والتحقق من حالات الاختبارات
  isAllTestsPassed: (id: number) => `${environment.apiBaseUrl}/localApplication/${id}/does-passed-all-tests`,
  passedTestCount: (id: number) => `${environment.apiBaseUrl}/localApplication/${id}/passed-test-count`,
  isTestPassed: (id: number, testType: number) => `${environment.apiBaseUrl}/localApplication/${id}/is-test-passed/test-type/${testType}`,
  isTestAttended: (id: number, testID: number) => `${environment.apiBaseUrl}/localApplication/${id}/is-test-attended/${testID}`,
  lastTestPerTestType: (id: number, testId: number) => `${environment.apiBaseUrl}/localApplication/${id}/last-test-per-test-type/test-type/${testId}`,

  // 4. عمليات التحقق من حالة الطلب وإصدار الرخص
  isCancelled: (id: number) => `${environment.apiBaseUrl}/localApplication/${id}/canceled`,
  isCompleted: (id: number) => `${environment.apiBaseUrl}/localApplication/${id}/completed`,
  isLicenseIssued: (id: number) => `${environment.apiBaseUrl}/localApplication/${id}/license-issued`,
  activeLicenseID: (id: number) => `${environment.apiBaseUrl}/localApplication/${id}/active-license-id`,
  licenseID: (id: number) => `${environment.apiBaseUrl}/localApplication/${id}/license-id`,

  // 5. عمليات تعديل الحالة (HttpPatch) والإصدار الأول للرخصة
  complete: (id: number) => `${environment.apiBaseUrl}/localApplication/${id}/complete`,
  cancel: (id: number) => `${environment.apiBaseUrl}/localApplication/${id}/cancel`,
  
  // ✅ مطابقة المسار بدقة متناهية مع ترتيب الـ Route في الـ Controller المكتوب بالسيرفر
  issueLicense: (id: number, notes: string | null, byUserId: number) =>
    `${environment.apiBaseUrl}/localApplication/${id}/issue-license/${notes ? encodeURIComponent(notes) : 'null'}/${byUserId}`,
};