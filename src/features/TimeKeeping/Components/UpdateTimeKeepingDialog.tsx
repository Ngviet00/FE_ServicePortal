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
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                        {selectedData?.date} __ {selectedData?.nvMaNV} __ {selectedData?.nvHoTen}
                        </DialogTitle>
                        <DialogDescription />
                    </DialogHeader>
                    <div className="grid gap-4">
                        <div className="grid gap-3">
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
                    <DialogFooter>
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