// import { Input } from "@/components/ui/input"
// import { Checkbox } from "@/components/ui/checkbox"
// import { useCallback, useEffect, useState } from "react"
// import { Skeleton } from "@/components/ui/skeleton"
// // import { debounce } from "lodash"
// import { Link } from "react-router-dom"
// import { Button } from "@/components/ui/button"
// import { useQuery } from '@tanstack/react-query';

// import PaginationControl from "@/components/PaginationControl/PaginationControl"


// // import roleApi from "@/api/roleApi"

// // import DeleteRoleComponent from "../Role/components/DeleteRoleComponent"
// // import UpdateRoleComponent from "../Role/components/UpdateRoleComponent"
// import deparmentApi from "@/api/deparmentApi"
// import { AlertDialogHeader, AlertDialogFooter } from "@/components/ui/alert-dialog"
// import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle, AlertDialogCancel, AlertDialogDescription, AlertDialogAction } from "@radix-ui/react-alert-dialog"
// import { ShowToast } from "@/ultils"


// type Deparment = {
//     id: number;
//     name: string;
//     note: string,
//     parentId: number
// };

// export default function ListDeparment () {
//     // const [name, setName] = useState("")
//     // const [page, setPage] = useState(1) //current page
//     // const [pageSize, setPageSize] = useState(5);

//     // const [totalPages, setTotalPages] = useState(0);

//     // const [filter, setFilter] = useState("");
//     // const [debouncedFilter, setDebouncedFilter] = useState(filter);

//     // const [roles, setRoles] = useState<Role[]>([]);
//     // const [loading, setLoading] = useState(true);
//     // const [error, setError] = useState<string | null>(null);

//     // const getRoles = useCallback(async () => {
//     //     setLoading(true);
//     //     try {
//     //         const res = await roleApi.getAll({
//     //             page: currentPage,
//     //             page_size: pageSize,
//     //             name: debouncedFilter,
//     //         });
//     //         setRoles(res.data.data);
//     //         setTotalPages(res.data.total_pages);
//     //         setError(null);
//     //     } catch (error) {
//     //         console.error("error get list role:", error);
//     //         setError("Cannot load data, server error");
//     //     } finally {
//     //         setTimeout(() => setLoading(false), 100);
//     //     }
//     // }, [currentPage, pageSize, debouncedFilter]);

//     // const handleSearchByName = (e: React.ChangeEvent<HTMLInputElement>) => {
//     //     const value = e.target.value;
//     //     setPage(1)
//     //     setName(value);
//     //     // debounceFilter(value);
//     // };

//     // // eslint-disable-next-line react-hooks/exhaustive-deps
//     // const debounceFilter = useCallback(
//     //     debounce((val: string) => {
//     //         setDebouncedFilter(val);
//     //     }, 300),
//     //     []
//     // );

//     // const handlePageSizeChange = (perpage: number) => {
//     //     setPageSize(perpage)
//     //     setCurrentPage(1)
//     // }

//     // useEffect(() => {
//     //     return () => {
//     //         debounceFilter.cancel();
//     //     };
//     // }, [debounceFilter]);

//     // useEffect(() => {
        
//     //     getRoles();
        
//     // }, [getRoles]);

//     const [name, setName] = useState("")
//     const [page, setPage] = useState(1) //current page
//     const [pageSize, setPageSize] = useState(5); // 5 10 20 50

//     const [totalPages, setTotalPages] = useState(0);

//     const [errorMessage, setErrorMessage] = useState("");

//     const [open, setOpen] = useState(false)

//     const handleDelete = async () => {
//         try {
//             await deparmentApi.delete(-1)
//             ShowToast(`Delete role successfully`, "success")
//             setOpen(false)
//             // onSuccess?.();
//         }
//         catch (err) {
//             console.log(err);
//         }
//     }

//     const handleSearchByName = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const value = e.target.value;
//         setPage(1)
//         setName(value);
//         // debounceFilter(value);
//     };

//     const handlePageSizeChange = (perpage: number) => {
//         setPageSize(perpage)
//         setPage(1)
//     }

//     const { data, isPending, isError, error } = useQuery({
//         queryKey: ['deparments', page, pageSize, name],
//         queryFn: async () => {
//             const res = await deparmentApi.getAll({
//                 page: page,
//                 page_size: pageSize,
//                 name: name
//             });
//             setTotalPages(res.data.total_pages)
//             return res.data;
//         }
//     });

//     console.log(data);

//     const deparments = data?.data as Deparment[];

//     return (
//         <div className="p-4 pl-1 pt-0 space-y-4">
//             <div className="flex justify-between mb-1">
//                 <h3 className="font-bold text-2xl m-0 pb-2">Deparments</h3>
//                 <Button>
//                     <Link to="/deparment/create">
//                             Create new deparment
//                     </Link>
//                 </Button>
//             </div>

//             <div className="flex items-center justify-between">
//                 <Input
//                     placeholder="Tìm kiếm deparment..."
//                     value={name}
//                     onChange={handleSearchByName}
//                     className="max-w-sm"
//                 />
//             </div>

//             <div className="mb-5 relative overflow-x-auto shadow-md sm:rounded-lg pb-3">
//                 <div className="max-h-[450px] overflow-y-auto">
//                     <table style={{ tableLayout:'fixed'}} className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
//                         <thead className="text-xs text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-10">
//                             <tr className="border-b border-gray-200">
//                                 <th scope="col" className="w-[5%] p-4 bg-gray-50 dark:bg-gray-700">
//                                     <div className="flex items-center">
//                                         <Checkbox className="hover:cursor-pointer"/>
//                                     </div>
//                                 </th>
//                             <th scope="col" className="w-[75%] px-6 py-3 bg-gray-50 dark:bg-gray-700">Name</th>
//                             <th scope="col" className="px-6 py-3 bg-gray-50 dark:bg-gray-700">Action</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                         {isPending ? (
//                             Array.from({ length: pageSize }).map((_, index) => (
//                                 <tr key={index} className="h-[57px] bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
//                                     <td className="w-[57px] p-4">
//                                         <Skeleton className="h-4 w-[15px]" />
//                                     </td>
//                                     <td className="px-6 py-4">
//                                         <Skeleton className="h-4 w-[250px]" />
//                                     </td>
//                                     <td className="px-6 py-4">
//                                         <Skeleton className="h-4 w-[80px]" />
//                                     </td>
//                                 </tr>
//                             ))
//                         ) : isError || deparments.length === 0 ? (
//                             <tr className="h-[57px] bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
//                                 <td colSpan={3} className={`text-center py-4 font-bold ${isError ? 'text-red-700' : 'text-black'}`}>
//                                     {error?.message || "No results"}
//                                 </td>
//                             </tr>
//                         ) : (
//                             deparments.map((item, index) => (
//                                 <tr key={index} className="h-[57px] bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-opacity duration-300 opacity-0 animate-fade-in">
//                                     <td className="p-4 w-[57px]">
//                                         <Checkbox className="hover:cursor-pointer" />
//                                     </td>
//                                     <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
//                                         {item.name}
//                                     </th>
//                                     <td className="flex items-center px-4 py-4">
//                                         <Link to="/eee">Edit</Link>
//                                         <DeleteCom/>
//                                         {/* <AlertDialog open={open} onOpenChange={setOpen}>
//                                             <AlertDialogTrigger asChild>
//                                                 <button className="hover:cursor-pointer ml-3 rounded-[3px] px-[5px] py-[2px] bg-black text-white">
//                                                     Delete
//                                                 </button>
//                                             </AlertDialogTrigger>

//                                             <AlertDialogContent>
//                                                 <AlertDialogHeader>
//                                                     <AlertDialogTitle>Do you want to delete deparment <span className="text-red-700">{item ? item.name : ""}</span>?</AlertDialogTitle>
//                                                 </AlertDialogHeader>
//                                                 <AlertDialogFooter>
//                                                     <AlertDialogCancel className="hover:cursor-pointer">Cancel</AlertDialogCancel>
//                                                     <button onClick={handleDelete} className="hover:cursor-pointer inline-flex items-center justify-center rounded-md bg-black text-white px-4 py-2 text-sm font-medium">
//                                                         Confirm
//                                                     </button>
//                                                 </AlertDialogFooter>
//                                             </AlertDialogContent>
//                                         </AlertDialog> */}
//                                     </td>
//                                 </tr>
//                             ))
//                         )}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//             {
//                 data?.data.length > 0 ? (<PaginationControl
//                     currentPage={page}
//                     totalPages={totalPages}
//                     pageSize={pageSize}
//                     onPageChange={setPage}
//                     onPageSizeChange={handlePageSizeChange}
//                 />) : (null)
//             }
//         </div>
//     )
// }

// export function DeleteCom() {
//     return <>
//         <AlertDialog>
//         <AlertDialogTrigger asChild>
//             <Button variant="outline">Show Dialog</Button>
//         </AlertDialogTrigger>
//         <AlertDialogContent>
//             <AlertDialogHeader>
//             <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
//             <AlertDialogDescription>
//                 This action cannot be undone. This will permanently delete your
//                 account and remove your data from our servers.
//             </AlertDialogDescription>
//             </AlertDialogHeader>
//             <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction>Continue</AlertDialogAction>
//             </AlertDialogFooter>
//         </AlertDialogContent>
//         </AlertDialog>
//     </>
// }



import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useEffect, useState, useCallback } from "react"
import { Skeleton } from "@/components/ui/skeleton"

import roleApi from "@/api/roleApi"

import PaginationControl from "@/components/PaginationControl/PaginationControl"
import { debounce } from "lodash";
import React from "react"
import CreateRoleComponent from "../Role/components/CreateRoleComponent"
import DeleteRoleComponent from "../Role/components/DeleteRoleComponent"
import UpdateRoleComponent from "../Role/components/UpdateRoleComponent"
import { AlertDialogHeader, AlertDialogFooter } from "@/components/ui/alert-dialog"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle, AlertDialogCancel, AlertDialogAction } from "@radix-ui/react-alert-dialog"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import TestModal from "./components/DeleteDepartment"
// import TestModal from "./test"

type Role = {
    id: number;
    name: string;
};

export default function ListDepartment () {
    const [filter, setFilter] = useState("");
    const [debouncedFilter, setDebouncedFilter] = useState(filter);

    const [pageSize, setPageSize] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getRoles = useCallback(async () => {
        setLoading(true);
        try {
            const res = await roleApi.getAll({
                page: currentPage,
                page_size: pageSize,
                name: debouncedFilter,
            });
            setRoles(res.data.data);
            setTotalPages(res.data.total_pages);
            setError(null);
        } catch (error) {
            console.error("error get list role:", error);
            setError("Cannot load data, server error");
        } finally {
            setTimeout(() => setLoading(false), 100);
        }
    }, [currentPage, pageSize, debouncedFilter]);

    const handleFindRoleName = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setCurrentPage(1)
        setFilter(value);
        debounceFilter(value);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debounceFilter = useCallback(
        debounce((val: string) => {
            setDebouncedFilter(val);
        }, 300),
        []
    );

    const handlePageSizeChange = (perpage: number) => {
        setPageSize(perpage)
        setCurrentPage(1)
    }

    useEffect(() => {
        return () => {
            debounceFilter.cancel();
        };
    }, [debounceFilter]);

    useEffect(() => {
        
        getRoles();
        
    }, [getRoles]);

    const [open, setOpen] = useState(false)


    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex justify-between mb-1">
                <h3 className="font-bold text-2xl m-0 pb-2">Deparments</h3>
                <Button>
                    <Link to="/department/create">Create Deparment</Link>
                </Button>
            </div>

            <div className="flex items-center justify-between">
                <Input
                    placeholder="Tìm kiếm department..."
                    value={filter}
                    onChange={handleFindRoleName}
                    className="max-w-sm"
                />
            </div>

            <div className="mb-5 relative overflow-x-auto shadow-md sm:rounded-lg pb-3">
                <div className="max-h-[450px] overflow-y-auto">
                    <table style={{ tableLayout:'fixed'}} className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-10">
                            <tr className="border-b border-gray-200">
                                <th scope="col" className="w-[5%] p-4 bg-gray-50 dark:bg-gray-700">
                                    <div className="flex items-center">
                                        <Checkbox className="hover:cursor-pointer"/>
                                    </div>
                                </th>
                            <th scope="col" className="w-[75%] px-6 py-3 bg-gray-50 dark:bg-gray-700">Name</th>
                            <th scope="col" className="px-6 py-3 bg-gray-50 dark:bg-gray-700">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            Array.from({ length: pageSize }).map((_, index) => ( // Bạn có thể thay 5 bằng số cố định hoặc roles.length tuỳ mục đích
                                <tr key={index} className="h-[57px] bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="w-[57px] p-4">
                                        <Skeleton className="h-4 w-[15px]" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <Skeleton className="h-4 w-[250px]" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <Skeleton className="h-4 w-[80px]" />
                                    </td>
                                </tr>
                            ))
                        ) : error || roles.length === 0 ? (
                            <tr className="h-[57px] bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                                <td colSpan={3} className={`text-center py-4 font-bold ${error ? 'text-red-700' : 'text-black'}`}>
                                    {error || "No results"}
                                </td>
                            </tr>
                        ) : (
                            roles.map((role, index) => (
                                <tr key={index} className="h-[57px] bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-opacity duration-300 opacity-0 animate-fade-in">
                                    <td className="p-4 w-[57px]">
                                        <Checkbox className="hover:cursor-pointer" />
                                    </td>
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {role.name}
                                    </th>
                                    <td className="px-4 py-4">
                                        
                                        <UpdateRoleComponent role={role} onSuccess={getRoles} />
                                        {/* <DeleteRoleComponent role={role} onSuccess={getRoles} /> */}
                                        <TestModal />
                                        {/* <AlertDialog open={open} onOpenChange={setOpen}>
                                        <AlertDialogTrigger asChild>
                                            <button className="hover:cursor-pointer ml-3 rounded-[3px] px-[5px] py-[2px] bg-black text-white">
                                                Delete
                                            </button>
                                        </AlertDialogTrigger>

                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Do you want to delete role <span className="text-red-700">{role ? role.name : ""}</span>?</AlertDialogTitle>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className="hover:cursor-pointer">Cancel</AlertDialogCancel>
                                                <button className="hover:cursor-pointer inline-flex items-center justify-center rounded-md bg-black text-white px-4 py-2 text-sm font-medium">
                                                    Confirm
                                                </button>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog> */}
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
            {
                roles.length > 0 ? (<PaginationControl
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={handlePageSizeChange}
                />) : (null)
            }
        </div>
    )
}
