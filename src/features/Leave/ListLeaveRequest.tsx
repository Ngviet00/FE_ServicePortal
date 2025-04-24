import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"

import PaginationControl from "@/components/PaginationControl/PaginationControl"
import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import departmentApi from "@/api/departmentApi"
import { ShowToast, useDebounce } from "@/lib"
import ButtonDeleteComponent from "@/components/ButtonDeleteComponent"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"

  const invoices = [
    {
      code: "22757",
      name: "Nguyễn Văn Viẹt",
      department: "IT/MIS",
      position: "Staff IT",
      from: "2025-04-24 08:00",
      to: "2025-04-24 17:00",
      type_leave: "Phép năm",
      time_leave: "Buổi sáng",
      reason: "Có cỗ",
    },
    // {
    //   invoice: "INV002",
    //   paymentStatus: "Pending",
    //   totalAmount: "$150.00",
    //   paymentMethod: "PayPal",
    // },
    // {
    //   invoice: "INV003",
    //   paymentStatus: "Unpaid",
    //   totalAmount: "$350.00",
    //   paymentMethod: "Bank Transfer",
    // },
    // {
    //   invoice: "INV004",
    //   paymentStatus: "Paid",
    //   totalAmount: "$450.00",
    //   paymentMethod: "Credit Card",
    // },
    // {
    //   invoice: "INV005",
    //   paymentStatus: "Paid",
    //   totalAmount: "$550.00",
    //   paymentMethod: "PayPal",
    // },
    // {
    //   invoice: "INV006",
    //   paymentStatus: "Pending",
    //   totalAmount: "$200.00",
    //   paymentMethod: "Bank Transfer",
    // },
    // {
    //   invoice: "INV007",
    //   paymentStatus: "Unpaid",
    //   totalAmount: "$300.00",
    //   paymentMethod: "Credit Card",
    // },
    // {
    //     invoice: "INV005",
    //     paymentStatus: "Paid",
    //     totalAmount: "$550.00",
    //     paymentMethod: "PayPal",
    //   },
    //   {
    //     invoice: "INV006",
    //     paymentStatus: "Pending",
    //     totalAmount: "$200.00",
    //     paymentMethod: "Bank Transfer",
    //   },
    //   {
    //     invoice: "INV007",
    //     paymentStatus: "Unpaid",
    //     totalAmount: "$300.00",
    //     paymentMethod: "Credit Card",
    //   }
  ]
interface departments {
    id: number,
    name: string
    note: string | null
    parent_id: number | null
    parent: departments
}



export default function ListLeaveRequest () {
    const [name, setName] = useState("") //search by name
    const [totalPage, setTotalPage] = useState(0) //search by name
    const [page, setPage] = useState(1) //current page
    const [pageSize, setPageSize] = useState(5) //per page 5 item

    const queryClient = useQueryClient();

    const debouncedName = useDebounce(name, 300);
    
    //get list department, parent department 
    const { data: response, isPending, isError, error } = useQuery({
        queryKey: ['get-all-department', debouncedName, page, pageSize],
        queryFn: async () => {
            const res = await departmentApi.getAll({
                page: page,
                page_size: pageSize,
                name: debouncedName
            });
            console.log('goij api ne');
            setTotalPage(res.data.total_pages)
            return [];
            return res.data;
        }
    });

    const departments = response?.data || [];

    useEffect(() => {
        setPage(1);
    }, [debouncedName]);

    function handleSuccessDelete(shouldGoBack?: boolean) {
        if (shouldGoBack && page > 1) {
            setPage(prev => prev - 1);
        } else {
            queryClient.invalidateQueries({ queryKey: ['get-all-department'] });
        }
    }

    const handleSearchByName = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value)
    }

    function setCurrentPage(page: number): void {
        setPage(page)
    }

    function handlePageSizeChange(size: number): void {
        setPage(1)
        setPageSize(size)
    }

    const mutation = useMutation({
        mutationFn: async (id: number) => {
            await departmentApi.delete(id);
        },
        onSuccess: () => {
            ShowToast("Delete department success", "success");
        },
        onError: (error) => {
            console.error("Delete failed:", error);
            ShowToast("Delete department failed", "error");
        }
    });

    const handleDelete = async (id: number) => {
        try {
            const shouldGoBack = departments.length === 1;
            await mutation.mutateAsync(id);
            handleSuccessDelete(shouldGoBack);
        } catch (error) {
            console.error("Failed to delete:", error);
        }
    };

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex justify-between mb-1">
                <h3 className="font-bold text-2xl m-0 pb-2">List leave request</h3>
                <Button>
                    <Link to="/leave/create">Create leave request</Link>
                </Button>
            </div>

            <div className="flex items-center justify-between">
            
            </div>

            <div className="mb-5 relative shadow-md sm:rounded-lg pb-3">
                <div className="max-h-[450px]">
                    {/*   onValueChange={setTab} */}
                    <Tabs defaultValue="Pending" className="w-full" >
                        <TabsList style={{margin: '0px auto'}} className="mb-5 h-[40px]">
                            <TabsTrigger className="w-[150px] hover:cursor-pointer bg-gray-200 text-gray-600" value="Pending">Pending</TabsTrigger>
                            <TabsTrigger className="w-[150px] hover:cursor-pointer bg-yellow-200 text-yellow-600" value="In-Process">In-Process</TabsTrigger>
                            <TabsTrigger className="w-[150px] hover:cursor-pointer bg-green-200 text-green-600" value="Complete">Complete</TabsTrigger>
                            <TabsTrigger className="w-[150px] hover:cursor-pointer bg-red-200 text-red-600" value="Reject">Reject</TabsTrigger>
                        </TabsList>
                        {/* <TabsContent value="account"> */}
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[120px]">Mã nhân viên</TableHead>
                                        <TableHead className="w-[180px]">Họ tên</TableHead>
                                        <TableHead className="w-[130px]">Phòng ban</TableHead>
                                        <TableHead className="w-[100px]">Vị trí</TableHead>
                                        <TableHead className="w-[150px]">Nghỉ từ ngày</TableHead>
                                        <TableHead className="w-[150px]">Đến ngày</TableHead>
                                        <TableHead className="w-[120px]">Loại phép</TableHead>
                                        <TableHead className="w-[120px]">Thời gian</TableHead>
                                        <TableHead className="text-center w-[200px]">Lý do</TableHead>
                                        <TableHead className="w-[50px]">Hành động</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoices.map((invoice) => (
                                    <TableRow key={invoice.code}>
                                        <TableCell className="font-medium">{invoice.code}</TableCell>
                                        <TableCell>{invoice.name}</TableCell>
                                        <TableCell>{invoice.department}</TableCell>
                                        <TableCell>{invoice.position}</TableCell>
                                        <TableCell>{invoice.from}</TableCell>
                                        <TableCell>{invoice.to}</TableCell>
                                        <TableCell>{invoice.type_leave}</TableCell>
                                        <TableCell>{invoice.time_leave}</TableCell>
                                        <TableCell className="text-center">{invoice.reason}</TableCell>
                                        <TableCell><Button  className="p-1 text-xs h-[30px] hover:cursor-pointer">Approval</Button></TableCell>
                                    </TableRow>
                                    ))}
                                </TableBody>
                                {/* <TableFooter>
                                    <TableRow>
                                    <TableCell colSpan={3}>Total</TableCell>
                                    <TableCell className="text-right">$2,500.00</TableCell>
                                    </TableRow>
                                </TableFooter> */}
                            </Table>
                        
                        {/* </TabsContent>
                        <TabsContent value="password">
                            
                        </TabsContent> */}
                    </Tabs>
                        
                    {/* <table style={{ tableLayout:'fixed'}} className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-10">
                            <tr className="border-b border-gray-200">
                                <th scope="col" className="w-[5%] p-4 bg-gray-50 dark:bg-gray-700">
                                    <div className="flex items-center">
                                        <Checkbox className="hover:cursor-pointer"/>
                                    </div>
                                </th>
                            <th scope="col" className="w-[25%] px-6 py-3 bg-gray-50 dark:bg-gray-700">Name</th>
                            <th scope="col" className="w-[25%] px-6 py-3 bg-gray-50 dark:bg-gray-700">Parent Department</th>
                            <th scope="col" className="w-[30%] px-6 py-3 bg-gray-50 dark:bg-gray-700">Note</th>
                            <th scope="col" className="px-6 py-3 bg-gray-50 dark:bg-gray-700">Action</th>
                            </tr>
                        </thead>
                        <tbody>

                            <tr className="h-[57px] bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-opacity duration-300 opacity-0 animate-fade-in">
                                <td className="p-4 w-[57px]">
                                    <Checkbox className="hover:cursor-pointer" />
                                </td>
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    a
                                </th>
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    b
                                </th>
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    b
                                </th>
                                <td className="px-4 py-4">  
                                    <Link to={`/department/edit/`}>Edit</Link> */}
                                    {/* <ButtonDeleteComponent id={item.id} onDelete={() => handleDelete(item.id)}/> */}
                                {/* </td>
                            </tr> */}


                        {/* {isPending ? (
                            Array.from({ length: pageSize }).map((_, index) => (
                                <tr key={index} className="h-[57px] bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="w-[57px] p-4">
                                        <Skeleton className="h-4 w-[15px]" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <Skeleton className="h-4 w-[80px]" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <Skeleton className="h-4 w-[80px]" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <Skeleton className="h-4 w-[90px]" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <Skeleton className="h-4 w-[80px]" />
                                    </td>
                                </tr>
                            ))
                        ) : isError || departments.length === 0 ? (
                            <tr className="h-[57px] bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                                <td colSpan={5} className={`text-center py-4 font-bold ${isError ? 'text-red-700' : 'text-black'}`}>
                                    {error?.message || "No results"}
                                </td>
                            </tr>
                        ) : (
                            departments.map((item: departments, index: number) => (
                                <tr key={index} className="h-[57px] bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-opacity duration-300 opacity-0 animate-fade-in">
                                    <td className="p-4 w-[57px]">
                                        <Checkbox className="hover:cursor-pointer" />
                                    </td>
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {item.name}
                                    </th>
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {item?.parent ? item.parent.name : "-" }
                                    </th>
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        { item?.note }
                                    </th>
                                    <td className="px-4 py-4">  
                                        <Link to={`/department/edit/${item.id}`}>Edit</Link>
                                        <ButtonDeleteComponent id={item.id} onDelete={() => handleDelete(item.id)}/>
                                    </td>
                                </tr>
                            ))
                        )} */}
                        {/* </tbody>
                    </table> */}
                </div>
            </div>
            {
                departments.length > 0 ? (<PaginationControl
                    currentPage={page}
                    totalPages={totalPage}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={handlePageSizeChange}
                />) : (null)
            }
        </div>
    )
}
