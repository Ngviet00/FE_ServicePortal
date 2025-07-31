import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AttendanceStatus, UpdateTimeKeeping } from "./types";
import { statusDefine, statusLabels } from "./constants";
import { formatDate } from "@/lib/time";
import { ChangeEvent, useEffect, useState } from "react";
import DateTimePicker from "@/components/ComponentCustom/Flatpickr";

export const UpdateTimeKeepingDialog = ({
    open,
    onOpenChange,
    selectedData,
    setSelectedData,
    onSave,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    selectedData: UpdateTimeKeeping | null
    setSelectedData: React.Dispatch<React.SetStateAction<UpdateTimeKeeping | null>>
    onSave: () => void
}) => {
    useEffect(() => {
        if (open) {
            setSelectedOption('type_leave')
        }
    }, [open])
    const [selectedOption, setSelectedOption] = useState('type_leave');

    const handleOnChangeValue = (e: ChangeEvent<HTMLSelectElement>) => {
        setSelectedData((prev) => ({
            ...prev!,
            currentValue: e.target.value,
        }))
    }

    const handleChangeOption = (type: string) => {
        setSelectedOption(type)
    }

    // const handleDateTimeChange = (field: 'vao' | 'ra', dateStr: string) => {
    //     setSelectedData(prev => ({
    //         ...prev!,
    //         [field]: dateStr // Cập nhật giờ vào/ra
    //     }));
    // };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>

            <form onSubmit={(e) => { e.preventDefault(); onSave(); }}>
                            <DateTimePicker
                // disabled={true}
                enableTime={true}
                dateFormat="Y-m-d H:i"
                initialDateTime={selectedData?.date}
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                onChange={(_selectedDates, dateStr, _instance) => {
                    //rhfField.onChange(dateStr);
                }}
                className={`dark:bg-[#454545] shadow-xs border p-1 rounded-[5px] hover:cursor-pointer`}
            />
                <DialogContent className="block sm:max-w-[900px] min-h-[700px]">
                    <DialogHeader><DialogTitle/><DialogDescription /></DialogHeader>
                    <h2 className="text-2xl h-[40px]">{selectedData?.date} __ {selectedData?.nvMaNV} __ {selectedData?.nvHoTen}</h2>
                    <div className="grid gap-4">
                        <div className="grid gap-3">
                            <div className="flex mt-3">
                                <Label htmlFor="data-time-keeping">Giờ vào:</Label>
                                <span className="text-base ml-2 font-bold text-red-700">
                                    {
                                        selectedData?.vao ? formatDate(selectedData?.vao, "yyyy-MM-dd HH:mm:ss") : "--"
                                    }
                                </span>
                            </div>

                            <div className="flex">
                                <Label htmlFor="data-time-keeping">Giờ ra:</Label>
                                <span className="text-base ml-2 font-bold text-red-700">
                                    {
                                        selectedData?.ra ? formatDate(selectedData?.ra, "yyyy-MM-dd HH:mm:ss") : "--"
                                    }
                                </span>
                            </div>
                            
                            <Label className="text-[17px] text-blue-600">Chọn loại nghỉ phép</Label>
                            <div className="flex mt-0">
                                <div className="mr-5">
                                    <input
                                        id='type_leave'
                                        type="radio" 
                                        className="mr-1" 
                                        value={selectedOption}
                                        checked={selectedOption == 'type_leave'}
                                        onChange={() => handleChangeOption('type_leave')}
                                    />
                                    <label htmlFor="type_leave" className="hover:cursor-pointer">Loại phép</label>
                                </div>
                                <div>
                                    <input
                                        id='go_late_early'
                                        onChange={() => handleChangeOption('go_late_early')}
                                        value={selectedOption}
                                        checked={selectedOption == 'go_late_early'}
                                        type="radio"
                                        className="mr-1"
                                    />
                                    <label htmlFor="go_late_early" className="hover:cursor-pointer">Đi trễ, về sớm</label>
                                </div>
                            </div>

                            {
                                selectedOption == 'type_leave' ? 
                                (
                                    <>
                                        <Label htmlFor="data-time-keeping">Chọn:</Label>
                                        <select
                                            id="data-time-keeping"
                                            value={selectedData?.currentValue == 'X' || selectedData?.currentValue == 'CN_X' ? 'X' : selectedData?.currentValue}
                                            onChange={(e) => handleOnChangeValue(e)

                                            }
                                            className="border border-gray-300 p-1 hover:cursor-pointer"
                                        >
                                            <option value="">--Chọn--</option>
                                            {
                                                Object.entries(statusLabels).map(([key]) => {
                                                    const define = statusDefine[key as AttendanceStatus];
                                                    const label = statusLabels[key as AttendanceStatus];
                                                    return (
                                                        <option key={key} value={key}>
                                                            {define} - {label}
                                                        </option>
                                                    );
                                                })
                                            }
                                        </select>
                                    </>
                                ) 
                                :
                                (
                                    <>
                                        <div className="flex mt-2">
                                            <div className="mr-5">
                                                <Label className="mb-1">Từ ngày</Label>
                                                <DateTimePicker
                                                    // disabled={true}
                                                    enableTime={true}
                                                    dateFormat="Y-m-d H:i"
                                                    initialDateTime={selectedData?.date}
                                                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                                    onChange={(_selectedDates, dateStr, _instance) => {
                                                        //rhfField.onChange(dateStr);
                                                    }}
                                                    className={`dark:bg-[#454545] shadow-xs border p-1 rounded-[5px] hover:cursor-pointer`}
                                                />
                                            </div>

                                            <div className="">
                                                <Label className="mb-1">Đến ngày</Label>
                                                <DateTimePicker
                                                    enableTime={true}
                                                    dateFormat="Y-m-d H:i"
                                                    initialDateTime={selectedData?.date}
                                                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                                    onChange={(_selectedDates, dateStr, _instance) => {
                                                        //rhfField.onChange(dateStr);
                                                    }}
                                                    className={`dark:bg-[#454545] shadow-xs border p-1 rounded-[5px] hover:cursor-pointer`}

                                                />
                                            </div>
                                        </div>
                                    </>
                                )
                            }

                            <Label htmlFor="other-value" className="mt-3">Giá trị khác:</Label>
                            <Input
                                id="other-value"
                                onChange={(e) =>
                                    setSelectedData((prev) => ({
                                        ...prev!,
                                        currentValue: e.target.value,
                                    }))
                                }
                                value={selectedData?.currentValue === '?' ? '?' : ''}
                            />
                        </div>
                    </div>
                    <DialogFooter className="mt-3">
                        <DialogClose asChild>
                            <Button variant="outline" className="hover:cursor-pointer">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" onClick={onSave} className="hover:cursor-pointer">
                            Save changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    );
};