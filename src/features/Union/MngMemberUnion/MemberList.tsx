import React from 'react';
import { Loader2, Pencil, Trash2, UserPlus } from 'lucide-react';
import { UnionMember } from './MngMemberUnion';

interface Props {
    members: UnionMember[];
    isLoading: boolean;
    selectedMember: UnionMember | null;
    onSelectMember: (member: UnionMember) => void;
    onOpenAddModal: () => void;
    onEditMember: (member: UnionMember) => void;
    onDeleteMember: (id: number) => void;
    isUnionAdmin: boolean
}

const MemberList: React.FC<Props> = ({
    members, isLoading, selectedMember, onSelectMember, onOpenAddModal,
    onEditMember, onDeleteMember, isUnionAdmin
}) => (
    <div className="bg-white rounded-2xl shadow-xl h-full overflow-hidden flex flex-col">
        <h2 className="py-2 px-5 text-xl font-extrabold text-indigo-700 border-b sticky top-0 bg-white">
            Danh sách thành viên ({members.length})
        </h2>

        {isLoading && <div className="p-4 flex justify-center items-center text-indigo-600">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Đang tải dữ liệu...
        </div>}

        <div className="flex-grow overflow-y-auto">
            {!isLoading && members.length === 0 && (
                <div className="p-4 text-center text-gray-500">Chưa có Quản lý nào. Vui lòng thêm thành viên mới.</div>
            )}

            {!isLoading && members.map(member => (
                <div key={member.id} className={`flex justify-between items-center px-4 py-2 border-b transition
                    ${selectedMember?.id === member.id ? 'bg-indigo-50 border-indigo-500 border-l-4' : 'hover:bg-gray-50'}`}>
                    <button onClick={() => onSelectMember(member)} className="text-left flex-1 cursor-pointer">
                        <p className={`font-semibold ${selectedMember?.id === member.id ? 'text-indigo-700' : 'text-gray-800'}`}>
                            {member.userName} ({member.userCode})
                        </p>
                        <p className="text-xs text-gray-500">{member.title}</p>
                    </button>
                    {
                        isUnionAdmin &&
                            <div className="flex items-center space-x-2 ml-3">
                                <button onClick={() => onEditMember(member)} className="p-2 rounded-lg hover:bg-indigo-100 text-indigo-600 transition cursor-pointer">
                                    <Pencil size={18} />
                                </button>
                                <button onClick={() => onDeleteMember(member.id)} className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition cursor-pointer">
                                <   Trash2 size={18} />
                                </button>
                            </div>
                    }
                </div>
            ))}
        </div>
        {
            isUnionAdmin && 
            <div className="p-4 border-t bg-gray-50">
                <button onClick={onOpenAddModal} className="w-full flex items-center justify-center px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 shadow-lg cursor-pointer">
                    <UserPlus size={18} className="mr-2" /> Thêm Thành Viên Công Đoàn
                </button>
            </div>
        }
    </div>
);

export default React.memo(MemberList);
