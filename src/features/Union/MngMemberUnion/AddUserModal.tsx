import React, { useState, useEffect } from 'react';
import { XCircle, UserPlus } from 'lucide-react';
import userApi from '@/api/userApi';
import { ShowToast, getErrorMessage } from '@/lib';
import { UnionMember } from './MngMemberUnion';

interface Props {
    onClose: () => void;
    onSubmit: (userCode: string, userName: string, title: string, memberUnionId: number) => void;
    editingMember?: UnionMember | null;
}

const AddUserModal: React.FC<Props> = ({ onClose, onSubmit, editingMember }) => {
    const [userCode, setUserCode] = useState('');
    const [userName, setUserName] = useState('');
    const [title, setTitle] = useState('');
    const [isFinding, setIsFinding] = useState(false);

    useEffect(() => {
        if (editingMember) {
            setUserCode(editingMember.userCode);
            setUserName(editingMember.userName);
            setTitle(editingMember.title);
        }
    }, [editingMember]);

    const isFormValid = userCode.trim() && userName.trim() && title.trim();

    const handleFindUser = async () => {
        if (!userCode.trim()) return;
            setIsFinding(true);
        try {
            const res = await userApi.getByCode(userCode);
            const result = res?.data?.data;
            if (!result?.userCode) return ShowToast("Không tìm thấy nhân viên", "error");
            setUserCode(result?.userCode);
            setUserName(result?.userName);
        } catch (err) {
            ShowToast(getErrorMessage(err), "error");
        } finally { setIsFinding(false); }
    };

    return (
        <div className="fixed inset-0 bg-opacity-70 flex items-center justify-center p-4 z-[1000] backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-2xl font-extrabold text-red-600 flex items-center">
                        <UserPlus className="mr-3 text-red-500" />
                        {editingMember ? 'Chỉnh sửa thành viên' : 'Thêm thành viên'}
                    </h2>
                    <button onClick={onClose} className="hover:bg-gray-100 rounded-full p-1">
                        <XCircle size={28} className="text-gray-500 cursor-pointer" />
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Mã nhân viên (*)</label>
                        <input
                            type="text"
                            value={userCode}
                            onBlur={handleFindUser}
                            onChange={e => setUserCode(e.target.value)}
                            className="mt-1 w-full border px-3 py-2 rounded-lg"
                            placeholder='...'
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Họ và Tên (*)</label>
                        <input type="text" value={userName} disabled className="mt-1 w-full border px-3 py-2 rounded-lg bg-gray-100" placeholder='...' />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Chức vụ (*)</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                        className="mt-1 w-full border px-3 py-2 rounded-lg" placeholder='Phó công đoàn, thành viên,..' />
                    </div>
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300 cursor-pointer">Hủy</button>
                    <button
                        disabled={!isFormValid || isFinding}
                        onClick={() => onSubmit(userCode, userName, title, editingMember?.id ?? -1)}
                        className={`px-4 py-2 text-white rounded-lg font-semibold cursor-pointer
                        ${isFormValid ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400'}`}>
                        {editingMember ? 'Cập nhật' : 'Thêm Người Dùng'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default React.memo(AddUserModal);
