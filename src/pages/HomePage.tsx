import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import memoNotificationApi, { IMemoNotify } from '@/api/memoNotificationApi';
import { formatDate } from '@/lib/time';
import "./css/Homepage.css"

export default function HomePage() {
    const { t } = useTranslation();
    const { user } = useAuthStore();

    const { data } = useQuery({
        queryKey: ['get-all-memo-notify-in-homepage'],
        queryFn: async () => {
            const res = await memoNotificationApi.getAllInHomePage();
            return res.data.data;
        },
    });

    return (
        <div className="p-1 pt-0 home-page">
            <div className="flex justify-between mb-3">
                <h3 className="title font-bold text-2xl m-0 pb-2">{t('home_page.title')}</h3>
            </div>
            <div className='mb-3'>
                {
                    data && data.length > 0 && data.map((item: IMemoNotify, idx: number) => (
                        <Link key={idx} to={`/detail-memo-notify/${item.id}`}>
                            <div
                                className="bg-[#eff6ff] py-4 px-5 mb-3 rounded-md font-inter shadow-sm hover:shadow-md transition dark:bg-[#1e1e1e69]"
                            >
                                <div className="flex flex-wrap justify-between items-center gap-x-2 gap-y-1 title-memo-notify">
                                    <span className="text-sm sm:text-base font-bold leading-snug text-[oklch(48.8%_.243_264.376)] dark:text-white">
                                        {item.title}
                                    </span>
                                    <span className="flex items-center text-sm font-medium whitespace-nowrap">
                                        <span className="hidden sm:inline text-[oklch(48.8%_.243_264.376)] dark:text-white">Details</span>
                                        <ArrowRight size={16} className="ml-1 text-[oklch(48.8%_.243_264.376)] dark:text-white" />
                                    </span>
                                </div>

                                <div className="pt-3 text-sm line-clamp-5 content-memo-notify" dangerouslySetInnerHTML={{ __html: item.content }}/>

                                <div className="flex flex-nowrap items-center mt-4 text-xs text-gray-600 gap-2">
                                    <span className="whitespace-nowrap dark:text-white">
                                        Created By <strong className="text-gray-800 dark:text-white">{item.createdBy}</strong>
                                    </span>
                                    <span className="whitespace-nowrap dark:text-white">-</span>
                                    <span className="whitespace-nowrap dark:text-white">
                                        Created At <strong className="text-black dark:text-white">{formatDate(item?.createdAt, "yyyy/MM/dd HH:mm")}</strong>
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))
                }
            </div>

            <div className="wrap-home-page rounded-3xl bg-[#f3f4ff] flex flex-col md:flex-row md:h-[240px]">
                <div className="wrap-avatar w-[20%] dark:bg-[#454545]">
                    <div className='bg-[#f3f4ff] dark:bg-[#454545] flex justify-center items-center flex-col' style={{borderRight: '#e1e1e1'}}>
                        <img src="/img-employee.png" className="w-30 h-30  rounded-full"/>
                        <div>
                            <Label className='text-base font-bold dark:text-white'>{t('home_page.sex.male')}</Label>
                        </div>
                    </div>
                </div>
                <div className="py-4 px-2 flex-1 bg-[#f3f4ff] dark:bg-[#454545] flex flex-col md:flex-row gap-4">
                    <div className="flex-1 flex justify-around wrap-info-1">
                        <div>
                            <div className='mb-5'>
                                <label className='text-base text-gray-500 dark:text-white'>{t('home_page.code')}</label>
                            </div>
                            <div className='mb-5'>
                                <label className='text-base text-gray-500 dark:text-white'>{t('home_page.dob')}</label>
                            </div>
                            <div className='mb-5'>
                                <label className='text-base text-gray-500 dark:text-white'>{t('home_page.phone')}</label>
                            </div>
                            <div className='mb-5'>
                                <label className='text-base text-gray-500 dark:text-white'>{t('home_page.position')}</label>
                            </div>
                        </div>
                        <div>
                            <div className='mb-5 truncate max-w-[200px]'>
                                <label className='text-base font-bold'>{user?.userCode ?? "--"}</label>
                            </div>
                            <div className='mb-5 truncate max-w-[200px]'>
                                <label className='truncate max-w-[150px] text-base font-bold'>{"02/05/2000"}</label>
                            </div>
                            <div className='mb-5 truncate max-w-[200px]'>
                                <label className='text-base font-bold'>{"0345248120"}</label>
                            </div>
                            <div className='mb-5 truncate max-w-[200px]'>
                                <label className='text-base font-bold'>{"Staff"}</label>
                            </div>
                        </div>
                    </div>

                    <div className='flex-1 flex justify-around wrap-info-2'>
                        <div>
                            <div className='mb-5'>
                                <label className='text-base text-gray-500 dark:text-white'>{t('home_page.name')}</label>
                            </div>
                            <div className='mb-5'>
                                <label className='text-base text-gray-500 dark:text-white'>{t('home_page.email')}</label>
                            </div>
                            <div className='mb-5'>
                                <label className='text-base text-gray-500 dark:text-white'>{t('home_page.date_join_company')}</label>
                            </div>
                            <div className='mb-5'>
                                <label className='text-base text-gray-500 dark:text-white'>{t('home_page.department')}</label>
                            </div>
                        </div>
                        <div>
                            <div className='mb-5 truncate max-w-[200px]'>
                                <label className='text-base font-bold'>{"Nguyen Van Viet"}</label>
                            </div>
                            <div className='mb-5 truncate max-w-[200px]'>
                                <label className='text-base font-bold'>{"nguyenviet@vsvn.com.vn"}</label>
                            </div>
                            <div className='mb-5 truncate max-w-[200px]'>
                                <label className='text-base font-bold'>{"01/04/2025"}</label>
                            </div>
                            <div className='mb-5 truncate max-w-[200px]'>
                                <label className='text-base font-bold'>{"MIS/IT"}</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className='flex mt-5'>
                <div className='link-function flex-1'>
                    <Tabs defaultValue="account" className="w-[100%] h-full hover:cursor-pointer">
                        <TabsList className='mb-3'>
                            <TabsTrigger value="account" className="hover:cursor-pointer w-[150px]">Leave</TabsTrigger>
                        </TabsList>
                        <TabsContent value="account">
                            <div className='flex flex-wrap'>
                                <div className="w-full sm:w-[48%] md:w-[31%] mb-4 mr-0 md:mr-5 border border-gray-300 rounded-2xl">
                                    <span className="flex justify-between p-1 align-middle">
                                        <span className='p-1'>
                                            <Label className='text-sm'>{t('home_page.path')}</Label>
                                        </span>
                                        <span className='p-1'>
                                            <Label className='text-base'> </Label>
                                        </span>
                                    </span>

                                    <span className="flex justify-between p-1 align-middle">
                                        <span className='p-1'>
                                            <Link to="/leave/create" className='text-blue-400 underline underline-offset-2 dark:text-white'>
                                                <Label className='text-sm hover:cursor-pointer'>{t('home_page.path_register_leave_request')}</Label>
                                            </Link>
                                        </span>
                                        <span className='p-1'>
                                            <Label className='text-base'> </Label>
                                        </span>
                                    </span>

                                    <span className="flex justify-between p-1 align-middle">
                                        <span className='p-1'>
                                            <Link to="/leave" className='text-blue-400 underline underline-offset-2 dark:text-white'>
                                                <Label className='text-sm hover:cursor-pointer'>{t('home_page.path_list_leave_request')}</Label>
                                            </Link>
                                        </span>
                                        <span className='p-1'>
                                            <Label className='text-base'> </Label>
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}