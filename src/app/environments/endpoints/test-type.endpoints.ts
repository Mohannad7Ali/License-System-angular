// import { environment } from '../environment';

// export const TEST_TYPE_API_ENDPOINT = {
//   add: `${environment.apiBaseUrl}/testType/`,
//   all: `${environment.apiBaseUrl}/testType/test-types`,
//   read: `${environment.apiBaseUrl}/testType/`,
//   update: `${environment.apiBaseUrl}/testType/`,
//   fee: (id: number) => `${environment.apiBaseUrl}/testType/${id}/fee`,
//   delete: `${environment.apiBaseUrl}/testType/`,
// };
import { environment } from '../environment';

export const TEST_TYPE_API_ENDPOINT = {
  // 1. العمليات العامة والشاملة لأنواع الاختبارات
  all: `${environment.apiBaseUrl}/testType/test-types`,
  add: `${environment.apiBaseUrl}/testType`, // دالة الإنتاج الأساسية (HttpPost)

  // ✅ 2. تحويل جميع العمليات الفردية المعتمدة على الـ ID إلى دالات ديناميكية آمنة ومطابقة للسيرفر
  read: (id: number) => `${environment.apiBaseUrl}/testType/${id}`,
  update: (id: number) => `${environment.apiBaseUrl}/testType/${id}`,
  delete: (id: number) => `${environment.apiBaseUrl}/testType/${id}`,
  fee: (id: number) => `${environment.apiBaseUrl}/testType/${id}/fee`,
  count: `${environment.apiBaseUrl}/test/count`,
  passedPercentage: `${environment.apiBaseUrl}/test/passed-percetage`,
  failedPercentage: `${environment.apiBaseUrl}/test/failed-percetage`,
  readByPersonAndLicenseClass: (
    personId: number,
    testTypeId: number,
    licenseClassId: number,
  ) =>
    `${environment.apiBaseUrl}/test/test-by/test-type/${personId}/${testTypeId}/${licenseClassId}`,
};
