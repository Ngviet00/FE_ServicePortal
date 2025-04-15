import {
    Input,
} from "@/components/ui/input"

import {
    Checkbox
} from "@/components/ui/checkbox"

import {
    Button
} from "@/components/ui/button"

import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import PaginationControl from "@/components/PaginationControl/PaginationControl"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"

import { ShowToast } from "@/ultils"

type Role = {
    id: number
    name: string
    description: string
}

const allRolesMock: Role[] = Array.from({ length: 47 }, (_, i) => ({
    id: i + 1,
    name: `Role ${i + 1}`,
    description: `Description for role ${i + 1}`,
}))
  

export default function CreatePosition () {
    const navigate = useNavigate();

    const [filter, setFilter] = useState("")
    const [pageSize, setPageSize] = useState(10)
    const [currentPage, setCurrentPage] = useState(1)

    const filteredRoles = useMemo(() => {
        return allRolesMock.filter(role =>
            role.name.toLowerCase().includes(filter.toLowerCase())
        )
    }, [filter])

    const totalPages = Math.ceil(filteredRoles.length / pageSize)

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(1)
        }
    }, [totalPages, currentPage])

    return (
        <div className="p-4 pt-0 space-y-4">
            <div className="flex justify-between mb-1">
                <h3 className="font-bold text-2xl m-0 pb-2">Roles</h3>
                <Button className="hover:cursor-pointer" onClick={() => navigate("/role")}>List Position</Button>
            </div>

            <div className="flex items-center justify-between">
                <Input
                    placeholder="Tìm kiếm role..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            <div className="mb-5 relative overflow-x-auto shadow-md sm:rounded-lg pb-3">
                <div className="max-h-[450px] overflow-y-auto">
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-10">
                            <tr>
                                <th scope="col" className="p-4 bg-gray-50 dark:bg-gray-700">
                                    <div className="flex items-center">
                                        <Checkbox className="hover:cursor-pointer"/>
                                    </div>
                                </th>
                            <th scope="col" className="w-[85%] px-6 py-3 bg-gray-50 dark:bg-gray-700">Name</th>
                            <th scope="col" className="px-6 py-3 bg-gray-50 dark:bg-gray-700">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: 5 }, (i: number) => (
                                <tr key={i} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="w-4 p-4">
                                        <div className="flex items-center">
                                            <Checkbox className="hover:cursor-pointer"/>
                                        </div>
                                    </td>
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        Super Admin
                                    </th>
                                    <td className="flex items-center px-6 py-4">
                                        <Link to="/role/1" className="font-medium text-black">
                                            Edit
                                        </Link>
                                        <AlertDialog>
                                            <AlertDialogTrigger
                                                className="hover:cursor-pointer ml-3 rounded-[3px] px-[5px] py-[2px] bg-black text-white">
                                                Delete
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Do you want to delete?</AlertDialogTitle>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel className="hover:cursor-pointer">Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => {ShowToast("Thành công!", "success")}} className="hover:cursor-pointer">Continue</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
                            
            <PaginationControl
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                pageSizes={[5, 10, 20, 50]}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
            />
    </div>
    )
}