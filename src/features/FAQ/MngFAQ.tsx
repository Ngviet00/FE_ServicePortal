import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import faqGroupApi, { FAQGroup, useDeleteFAQGroup } from "@/api/faqGroupApi";
import { FAQ, useDeleteFAQItem } from "@/api/faqApi";
import ButtonDeleteComponent from "@/components/ButtonDeleteComponent";
import ModalCreateOrUpdateFAQGroup from "./ModalCreateOrUpdateFAQGroup";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const MngFAQ: React.FC = () => {
    const queryClient = useQueryClient()
	const lang = useTranslation().i18n.language.split("-")[0]
    const user = useAuthStore(u => u.user)
    const navigate = useNavigate()

    const { data: listFAQs, isLoading: isLoadingData } = useQuery({
		queryKey: ['list-faq', user?.userCode],
		queryFn: async () => {
			const res = await faqGroupApi.getAll({page: 1, pageSize: 200})
            return res.data.data;
		}
	});

    const deleteFAQGroup = useDeleteFAQGroup();
    const handleDeleteFAQGroup = async (id: number) => {
        await deleteFAQGroup.mutateAsync(id)
        queryClient.invalidateQueries({ queryKey: ['list-faq', user?.userCode] })
    };

    const deleteFAQItem = useDeleteFAQItem();
    const handleDeleteFAQItem = async (id: number) => {
        await deleteFAQItem.mutateAsync(id)
        queryClient.invalidateQueries({ queryKey: ['list-faq', user?.userCode] })
    }

	if (isLoadingData) {
		return <div>{lang === "vi" ? "Đang tải..." : "Loading..."}</div>;
	}

	return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex flex-col gap-2 mb-2">
                <div className="flex">
                    <h3 className="font-bold text-xl md:text-2xl">
                        <span>{lang == 'vi' ? 'Quản lý FAQ' : 'Manage FAQ'}</span>
                    </h3>
                </div>
            </div>
            <div className="text-right">
                <ModalCreateOrUpdateFAQGroup onAction={() => queryClient.invalidateQueries({ queryKey: ['list-faq'] })}/>
                <Button className="cursor-pointer ml-2 bg-black hover:bg-black" onClick={() => navigate('/faq/create')}>{lang == 'vi' ? 'Tạo mới FAQ' : 'Create new FAQ'}</Button>
            </div>
            <div className="overflow-x-auto bg-white">
                <table className="min-w-full border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100 text-sm font-semibold">
                            <th className="border border-gray-300 p-3 text-center w-40">{lang == 'vi' ? 'Danh mục' : 'Category'}</th>
                            <th className="border border-gray-300 p-3">{lang == 'vi' ? 'Câu hỏi' : 'Question'}</th>
                            <th className="border border-gray-300 p-3">{lang == 'vi' ? 'Câu trả lời' : 'Answer'}</th>
                            <th className="border border-gray-300 p-3 text-center w-35">{lang == 'vi' ? 'Hành động' : 'Action'}</th>
                        </tr>
                    </thead>

                    <tbody className="text-sm">
                        {listFAQs?.map((group: FAQGroup, groupIndex: number) => {
                            const faqs = group.faQs || [];
                            const hasFaq = faqs.length > 0;

                            if (!hasFaq) {
                                return (
                                    <tr key={`group-${groupIndex}`}>
                                        <td className="border border-gray-300 p-3 text-center font-medium">
                                            <span>{lang === "vi" ? group.titleV : group.title}</span>
                                            <p className="mt-2">
                                                <ModalCreateOrUpdateFAQGroup faqGroup={group} onAction={() => queryClient.invalidateQueries({ queryKey: ['list-faq'] })}/>
                                                <ButtonDeleteComponent id={group.id} onDelete={() => handleDeleteFAQGroup(group.id ?? -1)} />
                                            </p>
                                        </td>
                                        <td className="border border-gray-300 p-3 text-gray-400 italic">
                                            —
                                        </td>
                                        <td className="border border-gray-300 p-3 text-gray-400 italic">
                                            —
                                        </td>
                                        <td className="border border-gray-300 p-3 text-center text-gray-300 italic">
                                            —
                                        </td>
                                    </tr>
                                );
                            }
                            return faqs.map((faq: FAQ, faqIndex: number) => (
                                <tr key={`group-${groupIndex}-faq-${faqIndex}`}>
                                    {faqIndex === 0 && (
                                        <td
                                            rowSpan={faqs.length}
                                            className="border border-gray-300 p-3 align-middle text-center font-medium"
                                        >
                                            <span>{lang === "vi" ? group.titleV : group.title}</span>
                                            <p className="mt-2">
                                                <ModalCreateOrUpdateFAQGroup faqGroup={group} onAction={() => queryClient.invalidateQueries({ queryKey: ['list-faq'] })}/>
                                                <ButtonDeleteComponent id={group.id} onDelete={() => handleDeleteFAQGroup(group.id ?? -1)} />
                                            </p>
                                        </td>
                                    )}

                                    <td className="border border-gray-300 p-3">
                                        {lang === "vi" ? faq.questionV : faq.question}
                                    </td>

                                    <td className="border border-gray-300 p-3">
                                        <div
                                            className="ql-editor p-0"
                                            dangerouslySetInnerHTML={{
                                                __html: lang === "vi" ? faq?.answerV ?? '' : faq?.answer ?? '',
                                            }}
                                        />
                                    </td>

                                    <td className="border border-gray-300 p-3 text-center text-blue-600 cursor-pointer">
                                        <button className={`hover:cursor-pointer mx-1 rounded-[3px] px-[5px] py-[2px] bg-gray-700 text-white`}>
                                            <Link to={`/faq/edit/${faq.id}`}>
                                                {lang == 'vi' ? 'Sửa' : 'Edit'}
                                            </Link>
                                        </button>
                                        <ButtonDeleteComponent id={faq.id} onDelete={() => handleDeleteFAQItem(faq.id ?? -1)} />
                                    </td>
                                </tr>
                            ));
                        })}
                    </tbody>
                </table>
            </div>
        </div>
	);
};

export default MngFAQ;
