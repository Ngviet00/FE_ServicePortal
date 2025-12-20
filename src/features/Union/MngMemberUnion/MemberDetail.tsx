import React from 'react';
import { Save, Edit, Check, UserCheck } from 'lucide-react';
import { Department, UnionMember } from './MngMemberUnion';

interface Props {
    member: UnionMember | null;
    isEditing: boolean;
    setIsEditing: (v: boolean) => void;
    setSelectedMember: (value: UnionMember | null) => void;
    departments: Department[];
    selectedDept: Set<number>;
    toggleDept: (id: number) => void;
    onSave: () => void;
    saveLoading: boolean;
    isUnionAdmin: boolean
}

const MemberDetail: React.FC<Props> = ({
    member,
    isEditing,
    setIsEditing,
    setSelectedMember,
    departments,
    selectedDept,
    toggleDept,
    onSave,
    saveLoading,
    isUnionAdmin
}) => {

    if (!member) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-white rounded-2xl shadow-xl p-8">
                <UserCheck className="w-16 h-16 text-indigo-300 mb-4" />
                <p className="text-xl font-semibold text-gray-500">Vui lòng chọn một thành viên</p>
                <p className="text-sm text-gray-400 mt-2">Để xem & chỉnh sửa trách nhiệm phân công.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-xl h-full flex flex-col">
            <div className="px-6 py-2 border-b flex justify-between items-start">
                <div className='flex'>
                    <div>
                        <p className="text-2xl font-extrabold text-gray-800">{member.userName}</p>
                        <p className="text-sm text-purple-600 mt-1">{member.title}</p>
                    </div>
                    <div className='ml-4'>
                        <button
                            onClick={() => setSelectedMember(null)}
                            className="px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 cursor-pointer"
                        >
                            Bỏ chọn
                        </button>
                    </div>
                </div>

                <div className="flex space-x-3">
                    {isEditing ? (
                        <>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 cursor-pointer"
                            >
                                Hủy
                            </button>

                            <button
                                onClick={onSave}
                                disabled={saveLoading}
                                className={`flex items-center px-4 py-2 text-sm font-bold text-white rounded-lg shadow-md cursor-pointer
                                    ${saveLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}
                                `}
                            >
                                <Save size={16} className="mr-2" />
                                Lưu
                            </button>
                        </>
                    ) : (
                        isUnionAdmin && <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center px-4 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-md cursor-pointer"
                        >
                            <Edit size={16} className="mr-2" />
                            Chỉnh Sửa
                        </button>
                    )}
                </div>
            </div>

            <div className="p-6 pt-3 flex-grow overflow-y-auto">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Bộ phận / Phòng ban phụ trách</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {departments.map(dept => {
                        const isAssigned = selectedDept.has(dept.id);

                        return (
                            <div
                                key={dept.id}
                                onClick={isEditing ? () => toggleDept(dept.id) : undefined}
                                className={`px-4 py-3 border rounded-xl flex justify-between items-center transition cursor-pointer
                                    ${isAssigned
                                        ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                                        : 'border-gray-200 hover:border-indigo-400 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="font-medium text-gray-800">
                                    {dept.name}
                                </div>

                                {isEditing ? (
                                    <div
                                        className={`w-5 h-5 rounded-full border flex items-center justify-center
                                            ${isAssigned ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-300'}
                                        `}
                                    >
                                        {isAssigned && <Check size={14} className="text-white" />}
                                    </div>
                                ) : (
                                    isAssigned && <Check size={20} className="text-green-500" />
                                )}
                            </div>
                        );
                    })}
                </div>

                {!departments.length && (
                    <div className="mt-6 text-center text-gray-500 p-4 border border-dashed rounded-lg">
                        Chưa có bộ phận nào.
                    </div>
                )}
            </div>
        </div>
    );
};

export default React.memo(MemberDetail);
