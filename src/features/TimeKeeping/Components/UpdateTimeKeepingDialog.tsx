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
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <form onSubmit={(e) => { e.preventDefault(); onSave(); }}>
                <DialogContent className="block sm:max-w-[700px] min-h-[500px]">
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

                            <Label htmlFor="data-time-keeping">Chọn:</Label>
                            <select
                                id="data-time-keeping"
                                value={selectedData?.currentValue}
                                onChange={(e) =>
                                setSelectedData((prev) => ({
                                    ...prev!,
                                    currentValue: e.target.value,
                                }))
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