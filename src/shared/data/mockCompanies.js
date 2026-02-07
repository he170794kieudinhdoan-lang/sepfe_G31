export const MOCK_COMPANIES = [
  { id: 1, name: 'LogiFast', location: 'TP.HCM', sector: 'Kho vận', size: '50-100', rating: 4.2, logoUrl: 'https://placehold.co/80x80/fef3c7/d97706', description: 'Công ty logistics.', jobCount: 5 },
  { id: 2, name: 'Bistro 29', location: 'Đà Nẵng', sector: 'Nhà hàng', size: '10-50', rating: 4.5, logoUrl: 'https://placehold.co/80x80/fef9e7/c9a227', description: 'Nhà hàng cao cấp.', jobCount: 2 },
  { id: 3, name: 'Freshmart', location: 'Hà Nội', sector: 'Bán lẻ', size: '100-500', rating: 4.0, logoUrl: 'https://placehold.co/80x80/fffbeb/b45309', description: 'Chuỗi siêu thị.', jobCount: 8 },
  { id: 4, name: 'QuickShip', location: 'Bình Dương', sector: 'Giao hàng', size: '50-100', rating: 3.8, logoUrl: 'https://placehold.co/80x80/fef3c7/92400e', description: 'Dịch vụ giao hàng.', jobCount: 10 },
];

export const getCompanyById = (id) => MOCK_COMPANIES.find((c) => c.id === Number(id));

export const MOCK_REVIEWS = [
  { id: 1, userId: 1, userName: 'Nguyễn A', rating: 5, content: 'Môi trường làm việc tốt, lương đúng hẹn.', createdAt: '2025-01-15' },
  { id: 2, userId: 2, userName: 'Trần B', rating: 4, content: 'Có cơ hội thăng tiến.', createdAt: '2025-02-01' },
];
