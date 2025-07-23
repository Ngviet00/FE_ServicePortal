import React, { useState, useEffect } from 'react';
// Nếu bạn có các icon tùy chỉnh, bạn có thể import chúng ở đây
// import { CheckCircleIcon, TimesCircleIcon, ThumbUpIcon, ThumbDownIcon, ClipboardListIcon, PhotographIcon, CursorClickIcon } from '@heroicons/react/solid'; 
// Hoặc sử dụng Font Awesome thông qua CDN trong public/index.html hoặc cài đặt gói Font Awesome React

interface NotificationData {
    id: string;
    title: string;
    content: string;
    departments: string;
    creator: string;
    createdAt: string;
    images?: string[]; // Mảng các URL của ảnh
}

const DetailMemoNotification: React.FC = () => {
    const [notification, setNotification] = useState<NotificationData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Giả lập việc fetch dữ liệu thông báo từ API
    useEffect(() => {
        const fetchNotification = async () => {
            try {
                // Trong ứng dụng thực tế, bạn sẽ fetch từ API dựa trên ID thông báo
                // const notificationId = new URLSearchParams(window.location.search).get('id');
                // const response = await fetch(`/api/notification-details/${notificationId}`);
                // if (!response.ok) {
                //     throw new Error('Failed to fetch notification');
                // }
                // const data: NotificationData = await response.json();

                // Dữ liệu giả lập
                const dummyData: NotificationData = {
                    id: 'NOTIF001',
                    title: 'Kế Hoạch Team Building 2025: Chung Tay Gắn Kết',
                    content: 'Kính gửi toàn thể nhân viên,\n\nBan tổ chức Team Building xin trân trọng thông báo kế hoạch tổ chức sự kiện thường niên 2025 với chủ đề "Chung Tay Gắn Kết".\n\nThời gian: Ngày 28 và 29 tháng 8 năm 2025 (Thứ Năm - Thứ Sáu).\nĐịa điểm: Khu nghỉ dưỡng sinh thái Vườn Vua, Phú Thọ.\nHoạt động chính: Teambuilding Games, Gala Dinner, và các hoạt động tự do.\n\nĐây là cơ hội tuyệt vời để chúng ta cùng nhau thư giãn, tăng cường sự gắn kết và tạo nên những kỷ niệm đáng nhớ. Kính mong toàn thể anh chị em tham gia đầy đủ.\n\nMọi thắc mắc vui lòng liên hệ phòng Hành chính - Nhân sự.\n\nTrân trọng cảm ơn!',
                    departments: 'Toàn bộ công ty',
                    creator: 'Phạm Văn B (Phòng Marketing)',
                    createdAt: '10/07/2025',
                    images: [
                        'https://images.unsplash.com/photo-1542838157-b28e24c6de8f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MDcxMzJ8MHwxfHNlYXJjaHwxfHx0ZWFtYnVpbGRpbmclMjBwZW9wbGV8ZW58MHx8fHwxNzIwOTM2Njg0fDA&ixlib=rb-4.0.3&q=80&w=1080',
                        'https://images.unsplash.com/photo-1549414436-e83d8e58ca68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MDcxMzJ8MHwxfHNlYXJjaHwzfHx0ZWFtYnVpbGRpbmclMjBwZW9wbGV8ZW5lMHx8fHwxNzIwOTM2Njg0fDA&ixlib=rb-4.0.3&q=80&w=1080',
                        'https://images.unsplash.com/photo-1579782500806-036f6d528b1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MDcxMzJ8MHwxfHNlYXJjaHw1fHx0ZWFtYnVpbGRpbmclMjBwZW9wbGV8ZW58MHx8fHwxNzIwOTM2Njg0fDA&ixlib=rb-4.0.3&q=80&w=1080',
                        'https://images.unsplash.com/photo-1628177309990-2646d90d8a57?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MDcxMzJ8MHwxfHNlYXJjaHw3fHx0ZWFtYnVpbGRpbmclMjBwZW9wbGV8ZW58MHx8fHwxNzIwOTM2Njg0fDA&ixlib=rb-4.0.3&q=80&w=1080',
                    ],
                };

                setNotification(dummyData);
            } catch (err) {
                setError('Không thể tải thông báo. Vui lòng thử lại.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchNotification();
    }, []); // Chạy một lần khi component được mount

    const handleApprove = () => {
        if (window.confirm('Bạn có chắc chắn muốn duyệt thông báo này?')) {
            // Logic để gọi API duyệt thông báo
            console.log(`Duyệt thông báo ID: ${notification?.id}`);
            alert('Thông báo đã được duyệt thành công!');
            // Sau khi duyệt, có thể điều hướng người dùng đi nơi khác
            // navigate('/admin/notifications');
        }
    };

    const handleReject = () => {
        const reason = window.prompt('Vui lòng nhập lý do từ chối thông báo:');
        if (reason !== null && reason.trim() !== '') {
            if (window.confirm(`Bạn có chắc chắn muốn từ chối thông báo này với lý do: "${reason}"?`)) {
                // Logic để gọi API từ chối thông báo
                console.log(`Từ chối thông báo ID: ${notification?.id} với lý do: ${reason}`);
                alert(`Thông báo đã bị từ chối với lý do: "${reason}"`);
                // Sau khi từ chối, có thể điều hướng người dùng đi nơi khác
                // navigate('/admin/notifications');
            }
        } else if (reason === '') {
            alert('Lý do từ chối không được để trống.');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p className="text-xl text-gray-700">Đang tải thông báo...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-red-100 text-red-700 p-4 rounded-lg shadow-md">
                <p className="text-xl">{error}</p>
            </div>
        );
    }

    if (!notification) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p className="text-xl text-gray-700">Không tìm thấy thông báo.</p>
            </div>
        );
    }

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <h3 className='font-bold text-xl md:text-2xl'>Duyệt thông báo</h3>
            <div className="min-h-screen flex items-start justify-start py-10 pt-1 pl-0">
                <div className="bg-white p-8 md:p-1 md:py-3 md:px-5  rounded-2xl shadow-xl w-11/12 max-w-4xl border border-gray-200 animate-fade-in-scale">
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-5 pb-3 border-b border-gray-300 flex justify-center items-center">
                            <i className="fas fa-clipboard-list text-blue-500 mr-4 text-xl"></i> Chi Tiết Thông Báo
                        </h2>
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-start p-4 bg-blue-50 rounded-lg shadow-sm border-l-4 border-blue-500 hover:transform hover:-translate-y-1 hover:shadow-md transition-all duration-200">
                                <span className="font-medium text-gray-700 w-full sm:w-56 flex-shrink-0 mr-4">Tiêu đề:</span>
                                <span className="text-gray-900 flex-grow">{notification.title}</span>
                            </div>
                            <div className="flex flex-wrap items-start p-4 bg-blue-50 rounded-lg shadow-sm border-l-4 border-blue-500 hover:transform hover:-translate-y-1 hover:shadow-md transition-all duration-200">
                                <span className="font-medium text-gray-700 w-full sm:w-56 flex-shrink-0 mr-4">Nội dung:</span>
                                <p className="text-gray-900 flex-grow whitespace-pre-wrap">{notification.content}</p>
                            </div>
                            <div className="flex flex-wrap items-start p-4 bg-blue-50 rounded-lg shadow-sm border-l-4 border-blue-500 hover:transform hover:-translate-y-1 hover:shadow-md transition-all duration-200">
                                <span className="font-medium text-gray-700 w-full sm:w-56 flex-shrink-0 mr-4">Phòng ban áp dụng:</span>
                                <span className="text-gray-900 flex-grow">{notification.departments}</span>
                            </div>
                            <div className="flex flex-wrap items-start p-4 bg-blue-50 rounded-lg shadow-sm border-l-4 border-blue-500 hover:transform hover:-translate-y-1 hover:shadow-md transition-all duration-200">
                                <span className="font-medium text-gray-700 w-full sm:w-56 flex-shrink-0 mr-4">Người tạo:</span>
                                <span className="text-gray-900 flex-grow">{notification.creator}</span>
                            </div>
                            <div className="flex flex-wrap items-start p-4 bg-blue-50 rounded-lg shadow-sm border-l-4 border-blue-500 hover:transform hover:-translate-y-1 hover:shadow-md transition-all duration-200">
                                <span className="font-medium text-gray-700 w-full sm:w-56 flex-shrink-0 mr-4">Ngày tạo:</span>
                                <span className="text-gray-900 flex-grow">{notification.createdAt}</span>
                            </div>
                        </div>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-5 pb-3 border-b border-gray-300 flex items-center">
                            <i className="fas fa-images text-blue-500 mr-4 text-xl"></i> Ảnh Đính Kèm
                        </h2>
                        {notification.images && notification.images.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-gray-50 border border-dashed border-gray-300 rounded-xl">
                                {notification.images.map((imageUrl, index) => (
                                    <img
                                        key={index}
                                        src={imageUrl}
                                        alt={`Ảnh đính kèm ${index + 1}`}
                                        loading="lazy"
                                        className="w-full h-40 object-cover rounded-lg shadow-md cursor-pointer transform hover:scale-105 hover:shadow-lg transition-all duration-200 border border-gray-200"
                                        onClick={() => window.open(imageUrl, '_blank')}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 italic p-4 bg-yellow-50 border border-yellow-200 rounded-lg shadow-sm">
                                Không có ảnh đính kèm nào.
                            </p>
                        )}
                    </section>

                    <section>
                        <div className="flex justify-end gap-4 mt-8">
                            <button
                                onClick={handleApprove}
                                className="px-4 py-2 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 text-lg"
                            >
                                Duyệt
                            </button>
                            <button
                                onClick={handleReject}
                                className="flex items-center justify-center px-8 py-4 bg-red-600 text-white font-bold rounded-xl shadow-lg hover:bg-red-700 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 text-lg"
                            >
                                Từ Chối
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
        
    );
};

export default DetailMemoNotification;