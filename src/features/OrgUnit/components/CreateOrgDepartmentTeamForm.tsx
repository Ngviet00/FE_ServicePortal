import { useEffect, useState } from "react"
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import {
    Form,
    FormField,
    FormItem,
    FormControl,
    FormMessage,
} from "@/components/ui/form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { getErrorMessage, ShowToast, UnitEnum } from "@/lib"
import { useTranslation } from "react-i18next"
import orgUnitApi, { OrgUnit } from "@/api/orgUnitApi"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Props = {
    orgUnit?: OrgUnit,
    listDepartmentWithOutTeam?: OrgUnit[]
    onAction?: () => void;
};

export default function CreateOrgDepartmentTeamForm({ orgUnit, listDepartmentWithOutTeam, onAction }: Props) {
    const [open, setOpen] = useState(false)
    const { t } = useTranslation()
    const lang = useTranslation().i18n.language.split('-')[0]

    const createUserSchema = z.object({
        id: z.coerce.number().nullable().optional(),
        name: z.string().min(1, { message: lang == 'vi' ? 'Bắt buộc' : 'Required' }),
        parentOrgUnitId: z.union([z.string(), z.number()]).nullable(),
        unitId: z.number({ required_error: "Vui lòng chọn đơn vị" }),
    })

    type CreateUserFormValues = z.infer<typeof createUserSchema>

    const form = useForm<CreateUserFormValues>({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            id: null,
            name: "",
            parentOrgUnitId: null,
            // unitId: null
        },
    })

    useEffect(() => {
        if (orgUnit && open) {
            form.reset({
                id: orgUnit.id,
                name: orgUnit?.name ?? '',
                parentOrgUnitId: orgUnit?.parentOrgUnitId ?? null,
                unitId: orgUnit?.unitId ?? null
            });
        }
    }, [orgUnit, open, form]);

    const onSubmit = async (values: CreateUserFormValues) => {
        try {
            const payload = {
                id: values?.id ?? null,
                name: values?.name ?? '',
                parentOrgUnitId: values?.parentOrgUnitId ? Number(values.parentOrgUnitId) : null,
                unitId: values?.unitId ?? null
            }
            await orgUnitApi.CreateOrUpdate(payload)
            onAction?.();
            setOpen(false);
            form.reset();
            ShowToast('Success', 'success')
        } catch (err) {
            ShowToast(getErrorMessage(err), "error")
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {
                    orgUnit?.id ? (
                        <button className="hover:cursor-pointer ml-3 rounded-[3px] px-[5px] py-[2px] bg-[#555555] text-white">
                            Sửa
                        </button>
                    ) : (
                        <Button variant="outline" className="bg-black hover:bg-black hover:text-white text-white hover:cursor-pointer">
                            Thêm mới
                        </Button>
                    )
                }
            </DialogTrigger>

            <DialogContent className="sm:max-w-[650px] sm:min-h-[350px] flex flex-col" aria-describedby={undefined} data-aria-hidden={false}>
                <DialogHeader className="flex-none">
                    <DialogTitle>{orgUnit?.id ? t('list_role_page.btn_update_role') : t('list_role_page.btn_create_role')}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <Label htmlFor="name">{t('list_role_page.name')}</Label>
                                    <FormControl>
                                        <Input id="name" placeholder="..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}  
                        />

                        <FormField
                            control={form.control}
                            name="parentOrgUnitId"
                            render={({ field }) => (
                                <FormItem>
                                <Label>Phòng ban cha</Label>
                                <FormControl>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value ? String(field.value) : ""}   // luôn convert về string
                                    >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {listDepartmentWithOutTeam?.map((opt: OrgUnit) => (
                                        <SelectItem key={opt.id} value={String(opt.id)}>
                                            {opt.name}
                                        </SelectItem>
                                        ))}
                                    </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="unitId"
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Loại đơn vị</Label>
                                    <FormControl>
                                        <div className="flex gap-4">
                                            {Object.entries(UnitEnum)
                                                .filter(([, value]) => typeof value === "number")
                                                .map(([key, value]) => (
                                                <label key={value} className="flex items-center space-x-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        value={value}
                                                        checked={field.value === value}
                                                        onChange={() => field.onChange(value)}
                                                        className="cursor-pointer"
                                                    />
                                                    <span>{key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <div className="flex justify-end">
                            <Button type="submit" className="hover:cursor-pointer">
                                {t('list_role_page.submit')}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}