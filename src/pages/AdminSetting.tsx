import { useState } from "react";
import { Button } from "@/components/ui/button";
import systemConfigApi, { SystemConfig, useCreateOrUpdateConfig, useDeleteConfig } from "@/api/systemConfigApi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ShowToast } from "@/lib";

export default function AdminSetting() {
    const [configs, setConfigs] = useState<SystemConfig[]>([]);
    const queryClient = useQueryClient();

    useQuery({
        queryKey: ["system-configs"],
        queryFn: async () => {
            const data = await systemConfigApi.getAll();
            const result = data.data.data as SystemConfig[];
            setConfigs(result.map(c => ({ ...c })));
            return result;
        },
    });

    const createOrUpdateConfig = useCreateOrUpdateConfig()
    const delelteConfig = useDeleteConfig()

    const handleChange = (
        index: number,
        field: "key" | "value",
        newValue: string
    ) => {
        setConfigs(prev => {
            const updated = [...prev];
            const current = updated[index];

            if (field === "key") {
                const isDuplicate = prev.some(
                    (c, i) => c.configKey === newValue && i !== index
                );
                if (isDuplicate) {
                    ShowToast("Key đã tồn tại", "error");
                    return prev;
                }
                updated[index] = { ...current, configKey: newValue };
            } else {
                updated[index] = { ...current, configValue: newValue };
            }
            return updated;
        });
    };

    const handleDelete = async (setting: SystemConfig, index: number) => {
        if (setting?.id) {
            await delelteConfig.mutateAsync(setting.configKey ?? '')
            queryClient.invalidateQueries({ queryKey: ['system-configs'] });
        }
        else {
            setConfigs(prev => prev.filter((_, i) => i !== index));
        }
    };

    const handleSave = async (config: SystemConfig) => {
        if (!config.configKey || !config.configValue) {
            ShowToast("Không được để trống", "error");
            return;
        }

        await createOrUpdateConfig.mutateAsync(config);
        queryClient.invalidateQueries({ queryKey: ['system-configs'] });
    };

    return (
        <>
            <div className="flex min-h-full flex-1 flex-col justify-start pb-12 lg:px-1 bg-white dark:bg-[#454545]">
                <h2 className="font-bold text-2xl mb-3">Cài đặt dữ liệu</h2>

                <div className="mb-4">
                    <Button
                        onClick={() => {
                            setConfigs(prev => [
                                ...prev,
                                { configKey: "", configValue: "" } as SystemConfig,
                            ]);
                        }}
                        className="bg-green-600 text-white cursor-pointer"
                    >
                        + Thêm cài đặt mới
                    </Button>
                </div>

                <div className="space-y-4">
                    {configs.map((setting, index) => (
                        <div key={index} className="flex items-center space-x-3">
                            <Input
                                className="w-64"
                                type="text"
                                placeholder="Nhập key..."
                                value={setting.configKey}
                                onChange={(e) =>
                                    handleChange(index, "key", e.target.value)
                                }
                            />

                            <Input
                                className="w-100"
                                type="text"
                                placeholder="Nhập value..."
                                value={setting.configValue ?? ""}
                                onChange={(e) =>
                                    handleChange(index, "value", e.target.value)
                                }
                            />

                            <Button
                                disabled={createOrUpdateConfig.isPending}
                                onClick={() => handleSave(setting)}
                                className="cursor-pointer"
                            >
                                {createOrUpdateConfig.isPending ? (
                                    <Spinner className="text-white" size="small" />
                                ) : (
                                    "Lưu"
                                )}
                            </Button>

                            <Button
                                className="bg-red-600 text-white cursor-pointer"
                                onClick={() => handleDelete(setting, index)}
                            >
                                Xóa
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
