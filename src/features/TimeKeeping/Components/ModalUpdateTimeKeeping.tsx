import DotRequireComponent from "@/components/DotRequireComponent";
import Modal from "@/components/Modal";
import { Label } from "@/components/ui/label";
import { AttendanceStatus, UpdateTimeKeeping } from "./types";
import { statusDefine, statusLabels } from "./constants";
import { Button } from "@/components/ui/button";
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";

interface ModalUpdateTimeKeepingProps {
    isOpen: boolean;
    onClose: () => void;
    selectedData: UpdateTimeKeeping | null;
    onSave: (
        currentFormValue: string,
        currentUserCode: string,
        currentDate: string
    ) => void;
}

const ModalUpdateTimeKeeping: React.FC<ModalUpdateTimeKeepingProps> = ({
    isOpen,
    onClose,
    selectedData,
    onSave,
}) => {

    const [typeLeave, setTypeLeave] = useState('');
    const [timeOff, setTimeOff] = useState('1');
    const [valueLateOrEarly, setValueLateOrEarly] = useState('');
    const [selectedOption, setSelectedOption] = useState('type_leave');
    const [currentFormValue, setCurrentFormValue] = useState<string>('');

    useEffect(() => {
        if (isOpen && selectedData) {
            let initialValue = selectedData?.Result ?? '';
            if (initialValue == 'CN_X') {
                initialValue = 'X'
            }

            setCurrentFormValue(initialValue);

            const match = initialValue.match(/^(\d*\.?\d*)([A-Za-z]*)$/);
            const numberPart = match?.[1] ?? '';
            const letterPart = match?.[2] ?? '';

            const hasNumber = numberPart !== '';
            const hasLetter = letterPart !== '';

            if (hasNumber && hasLetter) {
                // VD: 0.5NPL
                setValueLateOrEarly('');
                setTypeLeave(letterPart);
                setSelectedOption('type_leave');
                setTimeOff('2');
            } else if (!hasNumber && hasLetter) {
                // VD: NPL
                setValueLateOrEarly('');
                setTypeLeave(initialValue);
                setSelectedOption('type_leave');
                setTimeOff('1');
            } else if (hasNumber && !hasLetter) {
                // VD: 0.0625
                setValueLateOrEarly(initialValue);
                setTypeLeave('');
                setSelectedOption('go_late_early');
                setTimeOff('');
            } else {
                // fallback
                setValueLateOrEarly('');
                setTypeLeave('');
                setSelectedOption('type_leave');
                setTimeOff('1');
            }
        } else if (!isOpen) {
            setTypeLeave('');
            setTimeOff('1');
            setValueLateOrEarly('');
            setSelectedOption('type_leave');
            setCurrentFormValue('');
        }
    }, [isOpen, selectedData]);

    const handleChangeOption = useCallback((type: string) => {
        setSelectedOption(type);
        if (type === 'type_leave') {
            setValueLateOrEarly('');
            setCurrentFormValue(typeLeave);
        } else {
            setTypeLeave('');
            setTimeOff('1');
            setCurrentFormValue(valueLateOrEarly);
        }
    }, [typeLeave, valueLateOrEarly]);

    const handleOnChangeValue = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
        const newValue = e.target.value;
        setTypeLeave(newValue);
        let updatedResult = newValue;
        if (selectedData?.thu === "CN" && newValue === "X") {
            updatedResult = "CN_X";
        } else if (timeOff === "2" && newValue !== "X" && newValue !== "CN_X" && newValue !== "") {
            updatedResult = "0.5" + newValue;
        }
        setCurrentFormValue(updatedResult);

    }, [selectedData, timeOff]);

    const handleTimeOffChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
        const newTimeOff = e.target.value;
        setTimeOff(newTimeOff);

        let updatedResult = typeLeave;
        if (selectedData?.thu === "CN" && typeLeave === "X") {
            updatedResult = "CN_X";
        } else if (newTimeOff === "2" && typeLeave !== "X" && typeLeave !== "CN_X" && typeLeave !== "") {
            updatedResult = "0.5" + typeLeave;
        }
        setCurrentFormValue(updatedResult);
    }, [typeLeave, selectedData]);

    const handleSaveClick = () => {
        onSave(currentFormValue, selectedData?.UserCode ?? '', selectedData?.CurrentDate ?? '');
    };

    const handleChangeTimeLateAndEarly = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
        const newValue = e.target.value;
        setValueLateOrEarly(newValue);
        setCurrentFormValue(newValue);
    }, []);

    const arrayTimeLateEarly = [
        { value: '0.0625', label: '30 Phút' },
        { value: '0.125', label: '60 Phút' },
        { value: '0.1875', label: '90 Phút' },
        { value: '0.25', label: '120 Phút' },
        { value: '0.3125', label: '150 Phút' },
        { value: '0.375', label: '180 Phút' },
        { value: '0.4375', label: '210 Phút' },
        { value: '0.5', label: '240 Phút' },
        { value: '0.5625', label: '270 Phút' },
        { value: '0.625', label: '300 Phút' },
        { value: '0.6875', label: '330 Phút' },
        { value: '0.75', label: '360 Phút' },
        { value: '0.8125', label: '390 Phút' },
        { value: '0.875', label: '420 Phút' },
        { value: '0.9375', label: '450 Phút' },
        { value: '1', label: '480 Phút' },
    ]

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="min-w-[700px] min-h-[500px]">
            <h2 className="text-2xl font-semibold mb-2">
                {selectedData?.current_date} __ {selectedData?.usercode} __ {selectedData?.name}
            </h2>
            <div className="font-bold mt-2 text-[18px]">
                <span>Giờ vào:</span>{" "}
                <span className="text-red-700">
                    {selectedData?.den == '' ? '--' :  selectedData?.den}
                </span>{" "}
                <br />
                <span className="mt-2 inline-block">Giờ ra:</span>{" "}
                <span className="text-red-700">
                    {selectedData?.ve == '' ? '--' : selectedData?.ve}
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
                            Số giờ đi muộn, về sớm<DotRequireComponent />
                        </Label>
                        <select name="" id="" value={valueLateOrEarly} onChange={handleChangeTimeLateAndEarly} className="border border-gray-300 p-1 hover:cursor-pointer w-[30%]">
                            <option value="">-Chọn-</option>
                            {
                                arrayTimeLateEarly.map((item, idx: number) => (
                                    <option key={idx} value={item.value}>
                                        {item.label}
                                    </option>
                                ))
                            }
                        </select>
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
            </div>
        </Modal>
    );
}

export default React.memo(ModalUpdateTimeKeeping);