import DotRequireComponent from "@/components/DotRequireComponent";
import Modal from "@/components/Modal";
import { Label } from "@/components/ui/label";
import { AttendanceStatus, UpdateTimeKeeping } from "./types";
import { statusDefine, statusLabels } from "./constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import { formatDate } from "@/lib/time";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IRole } from "@/api/roleApi";
import ButtonDeleteComponent from "@/components/ButtonDeleteComponent";
import { Skeleton } from "@/components/ui/skeleton";
import CreateRoleComponent from "@/features/Role/CreateRoleForm";
import { error } from "console";
import { t } from "i18next";
import { isError } from "util";

interface ModalListHistoryEditTimeKeepingProps {
    isOpen: boolean;
    onClose: () => void;
    // onSave: (
    //     currentFormValue: string,
    // ) => void;
}

const ModalListHistoryEditTimeKeeping: React.FC<ModalListHistoryEditTimeKeepingProps> = ({
    isOpen,
    onClose,
    // onSave,
}) => {

    // const [typeLeave, setTypeLeave] = useState('');
    // const [timeOff, setTimeOff] = useState('1');
    // const [valueLateOrEarly, setValueLateOrEarly] = useState('');
    // const [selectedOption, setSelectedOption] = useState('type_leave');
    // const [currentFormValue, setCurrentFormValue] = useState<string>('');

    // useEffect(() => {
    //     if (isOpen && selectedData) {
    //         let initialValue = selectedData?.currentValue ?? '';
    //         if (initialValue == 'CN_X') {
    //             initialValue = 'X'
    //         }
    //         setCurrentFormValue(initialValue);

    //         const match = initialValue.match(/^(\d*\.?\d*)([A-Za-z]*)$/);
    //         const numberPart = match?.[1] ?? '';
    //         const letterPart = match?.[2] ?? '';

    //         const hasNumber = numberPart !== '';
    //         const hasLetter = letterPart !== '';

    //         if (hasNumber && hasLetter) {
    //             // VD: 0.5NPL
    //             setValueLateOrEarly('');
    //             setTypeLeave(letterPart);
    //             setSelectedOption('type_leave');
    //             setTimeOff('2');
    //         } else if (!hasNumber && hasLetter) {
    //             // VD: NPL
    //             setValueLateOrEarly('');
    //             setTypeLeave(initialValue);
    //             setSelectedOption('type_leave');
    //             setTimeOff('1');
    //         } else if (hasNumber && !hasLetter) {
    //             // VD: 0.0625
    //             setValueLateOrEarly(initialValue);
    //             setTypeLeave('');
    //             setSelectedOption('go_late_early');
    //             setTimeOff('');
    //         } else {
    //             // fallback
    //             setValueLateOrEarly('');
    //             setTypeLeave('');
    //             setSelectedOption('type_leave');
    //             setTimeOff('1');
    //         }
    //     } else if (!isOpen) {
    //         setTypeLeave('');
    //         setTimeOff('1');
    //         setValueLateOrEarly('');
    //         setSelectedOption('type_leave');
    //         setCurrentFormValue('');
    //     }
    // }, [isOpen, selectedData]);

    // const handleChangeOption = useCallback((type: string) => {
    //     setSelectedOption(type);
    //     if (type === 'type_leave') {
    //         setValueLateOrEarly('');
    //         setCurrentFormValue(typeLeave);
    //     } else {
    //         setTypeLeave('');
    //         setTimeOff('1');
    //         setCurrentFormValue(valueLateOrEarly);
    //     }
    // }, [typeLeave, valueLateOrEarly]);

    // const handleOnChangeValue = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    //     const newValue = e.target.value;
    //     setTypeLeave(newValue);
    //     let updatedResult = newValue;
    //     if (selectedData?.thu === "CN" && newValue === "X") {
    //         updatedResult = "CN_X";
    //     } else if (timeOff === "2" && newValue !== "X" && newValue !== "CN_X" && newValue !== "") {
    //         updatedResult = "0.5" + newValue;
    //     }
    //     setCurrentFormValue(updatedResult);

    // }, [selectedData, timeOff]);

    // const handleChangeTimeLateAndEarly = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    //     const val = e.target.value;
    //     if (val === '') {
    //         setValueLateOrEarly('');
    //         setCurrentFormValue('');
    //         return;
    //     }
    //     const regex = /^(?:0(?:\.\d*)?|1(?:\.0*)?)$/; 
    //     if (regex.test(val)) {
    //         const numericVal = parseFloat(val);
    //         if (numericVal >= 0 && numericVal <= 1) {
    //             setValueLateOrEarly(val);
    //             setCurrentFormValue(val);
    //         }
    //     }
    // }, []);

    // const handleTimeOffChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    //     const newTimeOff = e.target.value;
    //     setTimeOff(newTimeOff);

    //     let updatedResult = typeLeave;
    //     if (selectedData?.thu === "CN" && typeLeave === "X") {
    //         updatedResult = "CN_X";
    //     } else if (newTimeOff === "2" && typeLeave !== "X" && typeLeave !== "CN_X" && typeLeave !== "") {
    //         updatedResult = "0.5" + typeLeave;
    //     }
    //     setCurrentFormValue(updatedResult);
    // }, [typeLeave, selectedData]);

    // const handleSaveClick = () => {
    //     onSave(currentFormValue);
    // };

    // // const handleSaveClick = useCallback(() => {
    // //     onSave(currentFormValue); 
    // // }, [onSave, currentFormValue]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="min-w-[80em] min-h-[40em]">
            <h2 className="text-2xl font-semibold mb-2">
                Lịch sử chỉnh sửa
            </h2>
            <div className="my-5 relative shadow-md sm:rounded-lg pb-3">
                <div className="max-h-[450px] w-full overflow-x-auto">
                    <Table className="min-w-[1024px] w-full">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px] text-left">Ngày</TableHead>
                                <TableHead className="w-[100px] text-left">Mã nhân viên</TableHead>
                                <TableHead className="w-[100px] text-left">Tên</TableHead>
                                <TableHead className="w-[100px] text-left">Giá trị cũ</TableHead>
                                <TableHead className="w-[100px] text-left">Giá trị mới</TableHead>
                                <TableHead className="w-[100px] text-left">Người cập nhật</TableHead>
                                <TableHead className="w-[100px] text-left">Cập nhật lúc</TableHead>
                                <TableHead className="w-[100px] text-left">Trạng thái</TableHead>
                                <TableHead className="w-[100px] text-left">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow key="1">
                                <TableCell className="font-medium text-left">2025-05-07</TableCell>
                                <TableCell className="font-medium text-left">16239</TableCell>
                                <TableCell className="font-medium text-left">Bùi Văn Phong</TableCell>
                                <TableCell className="font-medium text-left">ABC</TableCell>
                                <TableCell className="font-medium text-left">0.5COMP</TableCell>
                                <TableCell className="font-medium text-left">Nguyễn Văn Việt</TableCell>
                                <TableCell className="font-medium text-left">2025-05-07 10:00:22</TableCell>
                                <TableCell className="font-medium text-left">Đã gửi HR</TableCell>
                                <TableCell className="font-medium text-left">
                                    <Button>1</Button>
                                    <Button>1</Button>
                                </TableCell>
                                {/* <TableCell className="text-right">
                                    <CreateRoleComponent role={item} onAction={() => queryClient.invalidateQueries({ queryKey: ['get-all-role'] })}/>
                                    <ButtonDeleteComponent id={item.id} onDelete={() => handleDelete(item.id)}/>
                                </TableCell> */}
                            </TableRow>
                            {/* {isPending ? (
                                    Array.from({ length: 3 }).map((_, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="w-[50px] text-left"><div className="flex justify-start"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                            <TableCell className="w-[50px] text-left"><div className="flex justify-start"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                            <TableCell className="w-[100px] text-right"><div className="flex justify-end"><Skeleton className="h-4 w-[100px] bg-gray-300 text-center"/></div></TableCell>
                                        </TableRow>
                                    ))
                                ) : isError || roles.length == 0 ? (
                                    <TableRow>
                                        <TableCell className={`${isError ? "text-red-700" : "text-black"} font-medium text-center dark:text-white`} colSpan={4}>{error?.message ?? "No results"}</TableCell>
                                    </TableRow>
                                ) : (
                                    roles.map((item: IRole) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium text-left">{item?.name}</TableCell>
                                            <TableCell className="font-medium text-left">{item?.code}</TableCell>
                                            <TableCell className="text-right">
                                                <CreateRoleComponent role={item} onAction={() => queryClient.invalidateQueries({ queryKey: ['get-all-role'] })}/>
                                                <ButtonDeleteComponent id={item.id} onDelete={() => handleDelete(item.id)}/>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )
                            } */}
                        </TableBody>
                    </Table>
                </div>
            </div>
            {/* {
                roles.length > 0 ? (<PaginationControl
                    currentPage={page}
                    totalPages={totalPage}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={handlePageSizeChange}
                />) : (null)
            } */}
            {/* <div className="font-bold mt-2 text-[18px]">
                <span>Giờ vào:</span>{" "}
                <span className="text-red-700">
                    {selectedData?.vao ? formatDate(selectedData.vao, "yyyy-MM-dd HH:mm:ss") : "--"}
                </span>{" "}
                <br />
                <span className="mt-2 inline-block">Giờ ra:</span>{" "}
                <span className="text-red-700">
                    {selectedData?.ra ? formatDate(selectedData.ra, "yyyy-MM-dd HH:mm:ss") : "--"}
                </span>{" "}
                <br />
            </div>

            <Label className="text-[20px] mt-3 mb-2 text-blue-800">Chọn loại nghỉ phép</Label>
            <div className="flex mt-0 mb-3">
                <div className="mr-8">
                    <input
                        id="type_leave"
                        type="radio"
                        className="mr-1"
                        value="type_leave"
                        checked={selectedOption === 'type_leave'}
                        onChange={() => handleChangeOption('type_leave')}
                    />
                    <label htmlFor="type_leave" className="hover:cursor-pointer text-[18px]">
                        Nghỉ phép
                    </label>
                </div>
                <div>
                    <input
                        id="go_late_early"
                        value="go_late_early"
                        checked={selectedOption === 'go_late_early'}
                        type="radio"
                        className="mr-1"
                        onChange={() => handleChangeOption('go_late_early')}
                    />
                    <label htmlFor="go_late_early" className="hover:cursor-pointer text-[18px]">
                        Đi trễ, về sớm
                    </label>
                </div>
            </div>

            {selectedOption === 'type_leave' ? (
                <>
                    <div className="flex">
                        <div className="mr-4">
                            <Label className="mb-1">
                                Chọn <DotRequireComponent />
                            </Label>
                            <select
                                id="data-time-keeping"
                                value={typeLeave}
                                onChange={handleOnChangeValue}
                                className="border border-gray-300 p-1 hover:cursor-pointer"
                            >
                                <option value="">--Chọn--</option>
                                {Object.entries(statusLabels).map(([key]) => {
                                    const define = statusDefine[key as AttendanceStatus];
                                    const label = statusLabels[key as AttendanceStatus];
                                    return (
                                        <option key={key} value={key}>
                                            {define} - {label}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        <div>
                            <Label className="mb-1">
                                Thời gian <DotRequireComponent />
                            </Label>
                            <select
                                // disabled={true}
                                id="select-time"
                                value={timeOff}
                                onChange={handleTimeOffChange}
                                className="border border-gray-300 p-1 hover:cursor-pointer"
                            >
                                <option value="1">Cả ngày</option>
                                <option value="2">Nửa ngày</option>
                            </select>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className="mt-4">
                        <Label className="mb-1">
                            Số giờ đi muộn (Ex: 0.0625, 0,125) <DotRequireComponent />
                        </Label>
                        <Input
                            value={valueLateOrEarly}
                            onChange={handleChangeTimeLateAndEarly}
                            type="text"
                            placeholder="Số giờ đi muộn"
                            className="w-[40%]"
                            required
                        />
                    </div>
                </>
            )}

            <div className="flex justify-end">
                <Button className="mt-4 mr-2 px-4 py-2 bg-red-500 text-white rounded hover:cursor-pointer hover:bg-red-700" onClick={onClose}>
                    Hủy
                </Button>
                <Button className="mt-4 px-4 py-2 bg-blue-700 text-white rounded hover:cursor-pointer hover:bg-blue-900" onClick={handleSaveClick}>
                    Lưu
                </Button>
            </div> */}
        </Modal>
    );
}

export default React.memo(ModalListHistoryEditTimeKeeping);