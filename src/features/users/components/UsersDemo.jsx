
import React from 'react';
import { useUsers } from '../api/getUsers';

/**
 * UsersDemo Component
 * 
 * This component serves as a TEMPLATE for other developers.
 * It demonstrates:
 * 1. How to use the API hook (useUsers).
 * 2. How to handle loading and error states.
 * 3. How to display list data.
 */
export const UsersDemo = () => {
    // 1. Use the custom hook defined in api/getUsers.js
    const { data: usersData, isLoading, isError, error } = useUsers();

    // Ensure users is always an array to prevent "map is not a function" errors
    const users = Array.isArray(usersData) ? usersData : [];

    // Debug: Log complete error object
    if (isError) {
        console.error("UseUsers Hook Error:", error);
    }

    // 2. Handle Loading State
    if (isLoading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <span className="text-gray-500 font-medium">Đang tải dữ liệu...</span>
                </div>
            </div>
        );
    }

    // 3. Handle Error State
    if (isError) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
                <h3 className="flex items-center gap-2 font-bold text-lg">
                    <span>⚠️</span> Không thể tải dữ liệu
                </h3>
                <p className="mt-2 text-sm">{error.message}</p>
                <div className="mt-4 p-4 bg-white/60 rounded text-xs font-mono text-gray-800 border border-gray-200">
                    <p><strong>Debug Info:</strong></p>
                    <p>API URL Env: {import.meta.env.VITE_API_URL}</p>
                    <p>Endpoint: /auth/users</p>
                </div>
            </div>
        );
    }

    // 4. Render Data (TopCV Style)
    return (
        <div className="max-w-7xl mx-auto py-8">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-primary pl-4">
                    Danh sách ứng viên WorkLink
                </h2>
                <p className="mt-2 text-gray-500 pl-5">
                    Hiển thị danh sách nhân tài từ hệ thống WorkLink.
                </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {users.map((user) => (
                    <div
                        key={user.id}
                        className="group bg-white rounded-lg border border-gray-200 hover:border-primary hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden relative"
                    >
                        {/* Top Decoration */}
                        <div className="h-2 bg-gradient-to-r from-primary/80 to-primary w-full"></div>

                        <div className="p-6 flex flex-col items-center text-center">
                            {/* Avatar Placeholder */}
                            <div className="relative mb-4">
                                <div className="h-20 w-20 rounded-full bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center text-2xl font-bold text-primary">
                                    {user.email?.charAt(0).toUpperCase()}
                                </div>
                                <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-white"></span>
                            </div>

                            {/* Info */}
                            <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                                {user.name || 'Người dùng ẩn danh'}
                            </h3>
                            <p className="text-gray-500 text-sm mb-4 line-clamp-1" title={user.email}>
                                {user.email}
                            </p>

                            {/* Tags/Skills (Mock) */}
                            <div className="flex flex-wrap justify-center gap-2 mb-6">
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">JavaScript</span>
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">ReactJS</span>
                            </div>

                            {/* Action Button */}
                            <button className="mt-auto w-full py-2 px-4 bg-primary/10 text-primary font-semibold rounded hover:bg-primary hover:text-white transition-all text-sm">
                                Xem hồ sơ
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {users.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                    <div className="text-6xl mb-4">📭</div>
                    <p className="text-gray-800 font-semibold text-lg">Chưa có ứng viên nào</p>
                    <p className="text-gray-500">Cơ sở dữ liệu hiện tại đang trống.</p>
                </div>
            )}
        </div>
    );
};
