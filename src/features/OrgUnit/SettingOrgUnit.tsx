import positionApi, { IOrgPosition } from "@/api/orgPositionApi";
import orgUnitApi, { OrgUnit } from "@/api/orgUnitApi";
import ButtonDeleteComponent from "@/components/ButtonDeleteComponent";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import CreateOrgDepartmentTeamForm from "./components/CreateOrgDepartmentTeamForm";
import CreateOrgPositionForm from "./components/CreateOrgPositionForm";
import { getErrorMessage, ShowToast } from "@/lib";

export default function SettingOrgUnit() {
    const { t: tCommon } = useTranslation('common')
    const lang = useTranslation().i18n.language.split('-')[0]
    const queryClient = useQueryClient()
    const [selectedDepartmentOrgPosition, setSelectedDepartmentOrgPosition] = useState('')
    const [selectedDepartmentTeam, setSelectedDepartmentTeam] = useState('')

	const { data: getAllWithOutTeam = [], isPending: isPendingAllWithOutTean, isError: isErrorAllWithOutTean, error: errorAllWithOutTean } = useQuery({
		queryKey: ['get-all-without-team'],
		queryFn: async () => {
			const res = await orgUnitApi.GetAllWithOutTeam()
			return res.data.data
		},
	});

    const { data: getAllDepartments = [] } = useQuery({
		queryKey: ['get-all-departments', selectedDepartmentTeam],
		queryFn: async () => {
			const res = await orgUnitApi.GetAllDepartment()
			return res.data.data
		},
	});

    const { data: getAllTeams = [], isPending: isPendingTeam, isError: isErrorTeam, error: errorTeam } = useQuery({
		queryKey: ['get-all-teams'],
		queryFn: async () => {
			const res = await orgUnitApi.GetAllTeam({
                departmentId: selectedDepartmentTeam == '' ? null : Number(selectedDepartmentTeam)
            })
			return res.data.data
		},
	});

    const { data: getAllOrgPositions = [], isPending: isPendingOrgPosition, isError: isErrorOrgPosition, error: errorOrgPosition } = useQuery({
		queryKey: ['get-all-org-positions', selectedDepartmentOrgPosition],
		queryFn: async () => {
			const res = await positionApi.GetOrgPositionsByDepartmentId({
                departmentId: selectedDepartmentOrgPosition == '' ? null : Number(selectedDepartmentOrgPosition)
            })
			return res.data.data
		},
	});

    const handleDeleteDepartment = async (id: number | null | undefined) => {
        try {
            await orgUnitApi.Delete(id)
            ShowToast('Success', 'success')
            queryClient.invalidateQueries({ queryKey: ['get-all-without-team'] })
            queryClient.invalidateQueries({ queryKey: ['get-all-teams'] })
        } catch (error) {
            ShowToast(getErrorMessage(error), "error");
        }
    };

    const handleDeleteOrgPosition = (id?: number | null) => {
        console.log(id);
    }

    return (
        <div className="p-4 pl-1 pt-0 list-role">
            <div className="flex justify-between mb-1">
                <h3 className="font-bold text-2xl m-0 pb-2">Bộ phận/Phòng ban</h3>
                <CreateOrgDepartmentTeamForm listDepartmentWithOutTeam={getAllWithOutTeam} onAction={() => queryClient.invalidateQueries({ queryKey: ['get-all-without-team'] })}/>
            </div>

            <div className="mt-5">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm border border-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 border w-[70px]">Id</th>
                                <th className="px-4 py-2 border w-[400px]">Tên</th>
                                <th className="px-4 py-2 border w-[300px]">Phòng ban cha</th>
                                <th className="px-4 py-2 border w-[300px]">Đơn vị</th>
                                <th className="px-4 py-2 border">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                isPendingAllWithOutTean ? (
                                    Array.from({ length: 3 }).map((_, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[30px] bg-gray-300" /></div></td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[80px] bg-gray-300" /></div></td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[80px] bg-gray-300" /></div></td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[90px] bg-gray-300" /></div></td>
                                        </tr>  
                                    ))
                                ) : isErrorAllWithOutTean || getAllWithOutTeam.length == 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-2 text-center font-bold text-red-700">
                                            { errorAllWithOutTean?.message ?? tCommon('no_results') } 
                                        </td>
                                    </tr>
                                ) : (
                                    getAllWithOutTeam?.map((item: OrgUnit) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 border whitespace-nowrap text-center">
                                                {item.id}
                                            </td>
                                            <td className="px-4 py-2 border whitespace-nowrap">{item?.name}</td>
                                            <td className="px-4 py-2 border whitespace-nowrap">{item?.parentOrgUnit?.name ?? '--'}</td>
                                            <td className="px-4 py-2 border whitespace-nowrap">{item?.unit?.name ?? '--'}</td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center">
                                                <CreateOrgDepartmentTeamForm listDepartmentWithOutTeam={getAllWithOutTeam} orgUnit={item} onAction={() => queryClient.invalidateQueries({ queryKey: ['get-all-without-team'] })}/>
                                                <ButtonDeleteComponent id={item?.id} onDelete={() => handleDeleteDepartment(item?.id)}/>
                                            </td>
                                        </tr>
                                    ))
                                )
                            }
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex justify-between mb-1 border-t border-dashed mt-5 pt-3 border-gray-400">
                <h3 className="font-bold text-2xl m-0 pb-2">Team</h3>
                <CreateOrgDepartmentTeamForm listDepartmentWithOutTeam={getAllWithOutTeam} onAction={() => queryClient.invalidateQueries({ queryKey: ['get-all-teams'] })}/>
            </div>

            <div className="w-[12%]">
                <Label className="mb-2">Bộ phận/Phòng ban</Label>
                <select value={selectedDepartmentTeam} onChange={(e) => setSelectedDepartmentTeam(e.target.value)} className="border p-1 rounded w-full cursor-pointer">
                    <option value="">
                        { lang == 'vi' ? 'Tất cả' : 'All' }
                    </option>
                    {
                        getAllDepartments.map((item: { id: number, name: string }, idx: number) => (
                            <option key={idx} value={item.id}>{item.name}</option>
                        ))
                    }
                </select>
            </div>

            <div className="mt-5">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm border border-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 border w-[70px]">Id</th>
                                <th className="px-4 py-2 border w-[400px]">Tên</th>
                                <th className="px-4 py-2 border w-[300px]">Phòng ban</th>
                                <th className="px-4 py-2 border">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                isPendingTeam ? (
                                    Array.from({ length: 3 }).map((_, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[30px] bg-gray-300" /></div></td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[80px] bg-gray-300" /></div></td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[90px] bg-gray-300" /></div></td>
                                        </tr>  
                                    ))
                                ) : isErrorTeam || getAllTeams.length == 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-2 text-center font-bold text-red-700">
                                            { errorTeam?.message ?? tCommon('no_results') } 
                                        </td>
                                    </tr>
                                ) : (
                                    getAllTeams?.map((item: OrgUnit) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 border whitespace-nowrap text-center">
                                                {item.id}
                                            </td>
                                            <td className="px-4 py-2 border whitespace-nowrap">{item?.name}</td>
                                            <td className="px-4 py-2 border whitespace-nowrap">{item?.parentOrgUnit?.name}</td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center">
                                                <CreateOrgDepartmentTeamForm listDepartmentWithOutTeam={getAllWithOutTeam} orgUnit={item} onAction={() => queryClient.invalidateQueries({ queryKey: ['get-all-teams'] })}/>
                                                <ButtonDeleteComponent id={item?.id} onDelete={() => handleDeleteDepartment(item.id)}/>
                                            </td>
                                        </tr>
                                    ))
                                )
                            }
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex justify-between mb-1 border-t border-dashed mt-5 pt-3 border-gray-400">
                <h3 className="font-bold text-2xl m-0 pb-2">Vị trí</h3>
                <CreateOrgPositionForm onAction={() => queryClient.invalidateQueries({ queryKey: ['get-all-role'] })}/>
            </div>

            <div className="w-[12%]">
                <Label className="mb-2">Bộ phận/Phòng ban</Label>
                <select value={selectedDepartmentOrgPosition} onChange={(e) => setSelectedDepartmentOrgPosition(e.target.value)} className="border p-1 rounded w-full cursor-pointer">
                    <option value="">
                        { lang == 'vi' ? 'Tất cả' : 'All' }
                    </option>
                    {
                        getAllDepartments.map((item: { id: number, name: string }, idx: number) => (
                            <option key={idx} value={item.id}>{item.name}</option>
                        ))
                    }
                </select>
            </div>

            <div className="mt-5">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm border border-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 border w-[70px]">Id</th>
                                <th className="px-4 py-2 border w-[400px]">Tên</th>
                                <th className="px-4 py-2 border w-[400px]">Vị trí cha</th>
                                <th className="px-4 py-2 border w-[300px]">Bộ phận</th>
                                <th className="px-4 py-2 border">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                isPendingOrgPosition ? (
                                    Array.from({ length: 3 }).map((_, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[30px] bg-gray-300" /></div></td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[80px] bg-gray-300" /></div></td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[90px] bg-gray-300" /></div></td>
                                        </tr>  
                                    ))
                                ) : isErrorOrgPosition || getAllOrgPositions.length == 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-2 text-center font-bold text-red-700">
                                            { errorOrgPosition?.message ?? tCommon('no_results') } 
                                        </td>
                                    </tr>
                                ) : (
                                    getAllOrgPositions?.map((item: IOrgPosition) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 border whitespace-nowrap text-center">
                                                { item.id }
                                            </td>
                                            <td className="px-4 py-2 border whitespace-nowrap">{item?.name}</td>
                                            <td className="px-4 py-2 border whitespace-nowrap">{item?.parentOrgPosition?.name ?? "--"}</td>
                                            <td className="px-4 py-2 border whitespace-nowrap">{item?.orgUnit?.name} {item?.orgUnit?.parentOrgUnit != null ? `____${item?.orgUnit?.parentOrgUnit?.name}` : ''}</td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center">
                                                <CreateOrgPositionForm orgPosition={item} listOrgPositionParent={getAllOrgPositions} onAction={() => queryClient.invalidateQueries({ queryKey: ['get-all-org-positions'] })}/>
                                                <ButtonDeleteComponent id={item?.id} onDelete={() => handleDeleteOrgPosition(item.id)}/>
                                            </td>
                                        </tr>
                                    ))
                                )
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}