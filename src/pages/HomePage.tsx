import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { formatDate } from '@/lib';

export default function HomePage() {
    const { t } = useTranslation();
    const { user } = useAuthStore();

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex justify-between mb-3">
                <h3 className="font-bold text-2xl m-0 pb-2">{t('home_page.home_page')}</h3>
            </div>

            <div className='wrap-home-page h-[230px] rounded-3xl flex'>
                <div className='w-[20%] bg-[#f3f4ff] flex justify-center items-center flex-col' style={{borderRight: '#e1e1e1'}}>
                    <img src="/img-employee.png" className="w-30 h-30  rounded-full"/>
                    <div>
                        <Label className='text-base font-bold'>{user?.sex == 1? t('home_page.sex.male') : t('home_page.sex.female')}</Label>
                    </div>
                </div>
                <div className='py-4 px-2 flex flex-1 bg-[#f3f4ff]'>
                    <div className='w-[50%] flex justify-around'>
                        <div>
                            <div className='mb-5'>
                                <Label className='text-base text-gray-500'>{t('home_page.code')}</Label>
                            </div>
                            <div className='mb-5'>
                                <Label className='text-base text-gray-500'>{t('home_page.dob')}</Label>
                            </div>
                            <div className='mb-5'>
                                <Label className='text-base text-gray-500'>{t('home_page.phone')}</Label>
                            </div>
                            <div className='mb-5'>
                                <Label className='text-base text-gray-500'>{t('home_page.role')}</Label>
                            </div>
                            <div className='mb-5'>
                                <Label className='text-base text-gray-500'>{t('home_page.position')}</Label>
                            </div>
                        </div>
                        <div>
                            <div className='mb-5'>
                                <Label className='text-base font-bold'>{user?.code ?? "undefined"}</Label>
                            </div>
                            <div className='mb-5'>
                                <Label className='text-base font-bold'>{user?.date_of_birth ? formatDate(user?.date_of_birth) : "Not Set"}</Label>
                            </div>
                            <div className='mb-5'>
                                <Label className='text-base font-bold'>{user?.phone}</Label>
                            </div>
                            <div className='mb-5'>
                                <Label className='text-base font-bold'>{user?.role?.name}</Label>
                            </div>
                            <div className='mb-5'>
                                <Label className='text-base font-bold'>{user?.position?.name}</Label>
                            </div>
                        </div>
                    </div>

                    <div className='flex-1 flex justify-around'>
                        <div>
                            <div className='mb-5'>
                                <Label className='text-base text-gray-500'>{t('home_page.name')}</Label>
                            </div>
                            <div className='mb-5'>
                                <Label className='text-base text-gray-500'>{t('home_page.email')}</Label>
                            </div>
                            <div className='mb-5'>
                                <Label className='text-base text-gray-500'>{t('home_page.date_join_company')}</Label>
                            </div>
                            <div className='mb-5'>
                                <Label className='text-base text-gray-500'>{t('home_page.parent_department')}</Label>
                            </div>
                            <div className='mb-5'>
                                <Label className='text-base text-gray-500'>{t('home_page.children_department')}</Label>
                            </div>
                        </div>
                        <div>
                            <div className='mb-5'>
                                <Label className='text-base font-bold'>{user?.name ?? "undefined"}</Label>
                            </div>
                            <div className='mb-5'>
                                <Label className='text-base font-bold'>{user?.email ?? "undefined"}</Label>
                            </div>
                            <div className='mb-5'>
                                <Label className='text-base font-bold'>{user?.date_join_company ? formatDate(user?.date_join_company) : "Not Set"}</Label>
                            </div>
                            <div className='mb-5'>
                                <Label className='text-base font-bold'>{user?.parent_department?.name ?? "-"}</Label>
                            </div>
                            <div className='mb-5'>
                                <Label className='text-base font-bold'>{user?.children_department?.name ? user?.children_department?.name : "-"}</Label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className='flex mt-5'>
                <div className='calendar'>
                    {/* <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-xl border border-gray-300 shadow-md w-[400px] p-4"
                        classNames={{
                            table: "w-full border-collapse",
                            head_row: "flex justify-between",
                            row: "flex justify-between hover:cursor-pointer",
                            cell: "w-full flex justify-center items-center hover:cursor-pointer",
                            day: "rounded-full w-13 h-13 text-sm font-medium text-center hover:bg-blue-100 transition-all hover:cursor-pointer",
                            day_selected: "bg-black text-white hover:bg-gray-500 hover:cursor-pointer",
                            day_today: "border border-gray-500 hover:cursor-pointer",
                        }}
                        /> */}
                </div>

                <div className='link-function ml-5 flex-1'>
                    <Tabs defaultValue="account" className="w-[100%] h-full hover:cursor-pointer">
                        <TabsList className='mb-3'>
                            <TabsTrigger value="account" className="hover:cursor-pointer w-[150px]">Leave</TabsTrigger>
                            <TabsTrigger value="password" className="hover:cursor-pointer w-[150px]">Other</TabsTrigger>
                        </TabsList>
                        <TabsContent value="account">
                            <div className='flex flex-wrap'>
                                <div className='w-[31%] mr-5 border border-gray-300 rounded-2xl'>
                                    <span className="flex justify-between p-1 align-middle">
                                        <span className='p-1'>
                                            <Label className='text-sm'>{t('home_page.total_leave_annual')}</Label>
                                        </span>
                                        <span className='p-1'>
                                            <Label className='text-base'>0</Label>
                                        </span>
                                    </span>

                                    <span className="flex justify-between p-1 align-middle">
                                        <span className='p-1'>
                                            <Label className='text-sm'>{t('home_page.total_leave_used')}</Label>
                                        </span>
                                        <span className='p-1'>
                                            <Label className='text-base'>0</Label>
                                        </span>
                                    </span>

                                    <span className="flex justify-between p-1 align-middle">
                                        <span className='p-1'>
                                            <Label className='text-sm'>{t('home_page.total_leave_remaining')}</Label>
                                        </span>
                                        <span className='p-1'>
                                            <Label className='text-base'>0</Label>
                                        </span>
                                    </span>
                                </div>

                                <div className='w-[31%] mr-5 border border-gray-300 rounded-2xl'>
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
                                            <Link to="/leave/create" className='text-blue-400 underline underline-offset-2'>
                                                <Label className='text-sm hover:cursor-pointer'>{t('home_page.path_register_leave_request')}</Label>
                                            </Link>
                                        </span>
                                        <span className='p-1'>
                                            <Label className='text-base'> </Label>
                                        </span>
                                    </span>

                                    <span className="flex justify-between p-1 align-middle">
                                        <span className='p-1'>
                                            <Link to="/leave" className='text-blue-400 underline underline-offset-2'>
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
                        <TabsContent value="password">

                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}