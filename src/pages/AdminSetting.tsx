import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import systemConfigApi, { SystemConfig, useUpdateConfig } from "@/api/systemConfigApi";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ShowToast } from "@/lib";

export default function AdminSetting() {
    const [maxUploadFileMemo, setMaxUploadFileMemo] = useState("")

    useQuery({
        queryKey: ['system-configs'],
        queryFn: async () => {
            const data = await systemConfigApi.getAll();
            const result = data.data.data;
            setMaxUploadFileMemo(result?.find((c: SystemConfig) => c.configKey === "MaxUploadMemoNotifyFileSizeMB")?.configValue ?? "")
            return result;
        },
    });

    const updateConfig = useUpdateConfig();
    const handleSaveValueMaxFileUploadMemoNotify = async () => {

        if (maxUploadFileMemo == '') {
            return
        }

        if (parseInt(maxUploadFileMemo) > 10) {
            ShowToast("Giới hạn nhỏ hơn 10MB", "error")
            return
        }

        await updateConfig.mutateAsync({
            configKey: 'MaxUploadMemoNotifyFileSizeMB',
            data: {
                configValue: maxUploadFileMemo
            }
        })
    }

    return <>
        <div className="flex min-h-full flex-1 flex-col justify-start pb-12 lg:px-1 bg-white change-password-page dark:bg-[#454545]">
            <h2 className="font-bold text-2xl mb-3">Admin Setting</h2>

            <div className="mb-6 space-y-1 flex">
                    <Label htmlFor="maxUploadMemoNotify">Giới hạn dung lượng file gửi memo (MB)</Label>
                    <Input
                        required
                        className="w-[15%] mx-3"
                        id="maxUploadMemoNotify"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={maxUploadFileMemo}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (/^\d*$/.test(value)) {
                                setMaxUploadFileMemo(value);
                            }
                        }}
                    />
                    <Button disabled={updateConfig.isPending} className="hover:cursor-pointer" onClick={handleSaveValueMaxFileUploadMemoNotify}>
                        {updateConfig.isPending ? <Spinner className="text-white" size="small"/> : "Lưu"}
                    </Button>
            </div>
        </div>
    </>
}