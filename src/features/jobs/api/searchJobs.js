import { apiClient, apiClientCustom } from '@/shared/api/apiClient';

/**
 * Search jobs via backend API
 * GET /api/job/search?keyword=abc&workingShift=MORNING&occupationId=2&...
 *
 * @param {Object} params - Search parameters
 * @param {string} [params.keyword] - Tìm theo title/description
 * @param {string} [params.province] - Tỉnh/Thành phố
 * @param {string} [params.district] - Quận/Huyện
 * @param {string} [params.workingShift] - MORNING | AFTERNOON | NIGHT | FULL_DAY | FLEXIBLE
 * @param {number} [params.occupationId] - ID ngành nghề
 * @param {number} [params.companyId] - ID công ty
 * @param {string} [params.genderRequirement] - MALE | FEMALE | OTHER
 * @param {string} [params.sortBy] - newest | salary_desc | salary_asc | view
 * @param {number} [params.page] - Trang (default 1)
 * @param {number} [params.limit] - Số lượng/trang (default 10)
 */
export const searchJobs = async (params = {}) => {
  // Loại bỏ các key có value undefined/null/''
  const cleanParams = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      cleanParams[key] = value;
    }
  });

  const response = await apiClient.get('/job/search', { params: cleanParams });
  return response;
};
export const getProvinces = async () => {
  const response = await apiClientCustom(
    'https://provinces.open-api.vn/api/p/',
  ).get();
  return { provinces: response };
};
export const getWards = async (wardsId) => {
  const response = await apiClientCustom(
    `https://provinces.open-api.vn/api/p/${wardsId}?depth=2`,
  ).get();
  return { communes: response.districts };
};
