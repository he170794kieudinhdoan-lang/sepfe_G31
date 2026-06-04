/** Các trường bắt buộc trong Hồ sơ lao động trước khi ứng tuyển */
const WORKER_PROFILE_REQUIRED_FIELDS = [
  {
    key: 'occupationId',
    label: 'Nghề nghiệp',
    isFilled: (p) => !!p?.occupationId,
  },
  {
    key: 'shift',
    label: 'Ca làm việc',
    isFilled: (p) => !!p?.shift,
  },
  {
    key: 'province',
    label: 'Tỉnh/thành phố làm việc',
    isFilled: (p) => !!String(p?.province ?? '').trim(),
  },
  {
    key: 'ward',
    label: 'Phường/xã',
    isFilled: (p) => !!String(p?.ward ?? '').trim(),
  },
  {
    key: 'gender',
    label: 'Giới tính',
    isFilled: (p) => !!p?.gender,
  },
  {
    key: 'expectedSalary',
    label: 'Mức lương mong muốn',
    isFilled: (p) => {
      const n = Number(p?.expectedSalary);
      return Number.isFinite(n) && n >= 1_000_000;
    },
  },
  {
    key: 'experienceYear',
    label: 'Số năm kinh nghiệm',
    isFilled: (p) => {
      const n = Number(p?.experienceYear);
      return Number.isFinite(n) && n >= 0;
    },
  },
];

export function hasWorkerPhone(user) {
  return !!String(user?.phone ?? '').trim();
}

export function getMissingWorkerProfileLabels(workerProfile) {
  if (!workerProfile) {
    return WORKER_PROFILE_REQUIRED_FIELDS.map((f) => f.label);
  }
  return WORKER_PROFILE_REQUIRED_FIELDS.filter((f) => !f.isFilled(workerProfile)).map(
    (f) => f.label,
  );
}

export function getApplyEligibilityIssues({ user, workerProfile }) {
  const issues = [];

  if (!hasWorkerPhone(user)) {
    issues.push({
      type: 'basic',
      title: 'Thông tin cá nhân',
      message:
        'Bạn chưa cập nhật số điện thoại trong mục Chỉnh sửa hồ sơ (Thông tin cá nhân).',
      actionLabel: 'Cập nhật số điện thoại',
      actionPath: '/profile?tab=edit',
    });
  }

  const missingWorkerLabels = getMissingWorkerProfileLabels(workerProfile);
  if (missingWorkerLabels.length > 0) {
    issues.push({
      type: 'worker',
      title: 'Hồ sơ lao động',
      message:
        'Bạn chưa hoàn thành đầy đủ Hồ sơ lao động. Vui lòng bổ sung các mục sau:',
      missingFields: missingWorkerLabels,
      actionLabel: workerProfile ? 'Hoàn thiện hồ sơ lao động' : 'Tạo hồ sơ lao động',
      actionPath: workerProfile
        ? '/profile?tab=worker-profile'
        : '/worker/setup-profile',
    });
  }

  return issues;
}

export function canWorkerApply({ user, workerProfile }) {
  return getApplyEligibilityIssues({ user, workerProfile }).length === 0;
}
