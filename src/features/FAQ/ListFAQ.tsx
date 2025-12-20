import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import { Button } from '@/components/ui/button';
import faqGroupApi, { FAQGroup } from "@/api/faqGroupApi";
import { FAQ } from "@/api/faqApi";
import useHasRole from "@/hooks/useHasRole";
import { RoleEnum } from "@/lib";

const ListFAQ: React.FC = () => {
	const lang = useTranslation().i18n.language.split("-")[0]
	const [expandedId, setExpandedId] = useState<number | null>(null);
    const natigate = useNavigate()
	const user = useAuthStore(u => u.user)

	const { data: formData, isLoading: isLoadingData } = useQuery({
		queryKey: ['list-faq', user?.userCode],
		queryFn: async () => {
			const res = await faqGroupApi.getAll({page: 1, pageSize: 200})
            return res.data.data;
		}
	});

    const isRoleHR = useHasRole([RoleEnum.HR])

	const toggleExpand = (id: number) => {
		setExpandedId(expandedId === id ? null : id);
	};

	if (isLoadingData) {
		return <div>{lang === "vi" ? "Đang tải..." : "Loading..."}</div>;
	}

	return (
		<div className="w-full p-1 space-y-6">
            <div className='flex text-3xl font-semibold text-white mb-2 bg-[#032d42] p-10 rounded-2xl justify-between'>
                <h2 className="">
                    {lang == 'vi' ? 'Câu hỏi thường gặp dành cho người dùng' : 'FAQs for Users'}
                </h2>
                {
                    isRoleHR && (<Button className='cursor-pointer hover:bg-gray-100 bg-white text-black' onClick={() => natigate('/mng-faq')}>{lang == 'vi' ? 'Quản lý FAQ' : 'Manage FAQ'}</Button>)
                }
            </div>



            <div className="pt-5">
                {
                    formData?.map((item: FAQGroup, idx: number) => {
                        return (
                            <div className="mb-8" key={idx}>
                                <h3 className="text-3xl font-bold text-black">
                                    {lang == 'vi' ? item?.titleV : item?.title}
                                </h3>
                                {
                                    item?.faQs?.map((item: FAQ, idxFAQ: number) => {
                                        return (
                                            <div key={idxFAQ} className="bg-white transition-all duration-300 w-full mb-4">
                                                <div
                                                    onClick={() => toggleExpand(item?.id ?? 1)}
                                                    className="flex items-center justify-between sm:flex-row pt-4 pb-2 bg-white transition-all duration-300 gap-2 cursor-pointer select-none border-b"
                                                >
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <h3 className="font-semibold text-[#293e40] line-clamp-1 text-lg">
                                                            {lang == 'vi' ? item?.questionV : item?.question}
                                                        </h3>
                                                    </div>

                                                    <div className="flex items-center gap-3 shrink-0">
                                                        {expandedId == item?.id ? (
                                                            <ChevronUp className="w-7 h-7 text-gray-500 transition-transform" />
                                                        ) : (
                                                            <ChevronDown className="w-7 h-7 text-gray-500 transition-transform" />
                                                        )}
                                                    </div>
                                                </div>

                                                <div className={`overflow-hidden ${	expandedId == (item?.id ?? 1) ? "max-h-[600px] opacity-100 mt-3" : "max-h-0 opacity-0"}`}>
                                                    <div className={`text-gray-700  rounded-md max-h-[400px] overflow-y-auto`}>
                                                        <div className="ql-editor padding-left-0px not-[]:ql-editor leading-relaxed whitespace-pre-line text-[17px]" dangerouslySetInnerHTML={{ __html: lang == 'vi' ? item?.answerV ?? '' : item?.answer ?? '' }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                } 
                            </div>
                        )
                    })
                }
            </div>
		</div>
	);
};

export default ListFAQ;
