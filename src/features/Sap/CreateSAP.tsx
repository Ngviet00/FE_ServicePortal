/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import DotRequireComponent from "@/components/DotRequireComponent";
import sapApi, { useCreateSAP } from "@/api/sapApi";
import { Label } from "@/components/ui/label";
import { ShowToast } from "@/lib";
import FileListPreview from "@/components/ComponentCustom/FileListPreviewMemoNotify";
import { Spinner } from "@/components/ui/spinner";
import Select from 'react-select'
import { Textarea } from "@/components/ui/textarea";

export default function CreateSAP() {
    const lang = useTranslation().i18n.language.split('-')[0]
    const user = useAuthStore((state) => state.user)
    const navigate = useNavigate()
    const [sapTypeCode, setSapTypeCode] = useState<string | null>(null);
    const [fileSAP, setFileSAP] = useState<File | null>(null);
    const [otherFiles, setOtherFiles] = useState<File[]>([]);
    const [note, setNote] = useState<string>('');

    const createSAP = useCreateSAP()

    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;
    
    const { data: sapTypes = [] } = useQuery({ 
        queryKey: ['get-all-sap-type'], 
        queryFn: async () => { 
            const res = await sapApi.getAllSAPType();
             return res.data.data; 
        }
    });
    
    const mode = isEdit ? 'edit' : 'create';

    const handleSubmit = async () => {
        if (sapTypeCode == null || sapTypeCode == '') {
            ShowToast(lang == 'vi' ? 'Chưa chọn loại form SAP' : 'Please select SAP type', 'error')
            return
        }

        if (fileSAP == null) {
            ShowToast(lang == 'vi' ? 'Chưa đính kèm file excel theo loại SAP' : 'No excel file attached by SAP type', 'error')
            return
        }

        const formData = new FormData()

        formData.append("UserCode", user?.userCode ?? "");
        formData.append("UserName", user?.userName ?? "");
        formData.append("DepartmentName", user?.departmentName ?? "");
        formData.append("DepartmentId", String(user?.departmentId ?? ""));
        formData.append("OrgPositionId", String(user?.orgPositionId ?? ""));
        formData.append("IsSingleInput", true.toString());    
        formData.append("SAPCode", sapTypeCode);
        formData.append("FileSAP", fileSAP);
        formData.append("Note", note);
        otherFiles?.forEach((file: File) => {
            formData.append("OtherFiles", file);
        });

        if (isEdit) {   
            //await updateOverTime.mutateAsync({applicationFormCode: id, data: formData})
        } else {
            await createSAP.mutateAsync(formData)
        }
        navigate("/sap");
    }

    const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
        if (!file) {
            return
        }

        const allowedExtensions = /(\.xls|\.xlsx)$/i;
        if (!allowedExtensions.exec(file.name)) {
            ShowToast(`Chỉ được đính kèm những file có định dạng .xls, .xlsx`, 'error');
            e.target.value = "";
            return;
        }

        const isTooLarge = file.size > 5 * 1024 * 1024;
        if (isTooLarge) {
            ShowToast(`File "${file.name}" vượt quá 5MB!`, 'error');
            e.target.value = "";
            return;
        }

        setFileSAP(file);
        e.target.value = "";
    };

    const handleFileRemove = () => {
        setFileSAP(null);
    }

    const handleAddOtherFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        if (!files.length) return;

        const totalFiles = otherFiles.length + files.length;
        if (totalFiles > 4) {
            ShowToast("Tổng số file không được vượt quá 4!", 'error');
            e.target.value = "";
            return;
        }

        const invalid = files.find(f => f.size > 2 * 1024 * 1024);
        if (invalid) {
            ShowToast(`File "${invalid.name}" vượt quá 2MB!`, 'error');
            e.target.value = "";
            return;
        }

        setOtherFiles(prev => [...prev, ...files]);
        e.target.value = "";
    };

    const handleOtherFileRemove = (index: number) => {
        setOtherFiles(prev => prev.filter((_, i) => i !== index));
    }

    const filesToPreview = fileSAP ? [{ name: fileSAP.name, type: fileSAP.type }] : [];

    const sapTypeOptions = useMemo(() => {
        return sapTypes.map((item: any) => ({
            value: item?.code ?? '',
            label: item?.name ?? '',
        })).filter((o: any) => o.value !== '');
    }, [sapTypes]);

    const currentSapType = sapTypeOptions.find((o: any) => o.value === sapTypeCode) || null;

    if (isEdit) { //isFormDataLoading
        return <div>{lang == 'vi' ? 'Loading' : 'Đang tải'}...</div>;
    }

    return (
        <div className="p-4 pl-1 pt-0 space-y-4 leave-request-form">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-2">
                <div className="flex flex-col gap-2">
                    <div className="flex">
                        <h3 className="font-bold text-xl md:text-2xl">
                            <span>{ mode == 'create' ? (lang == 'vi' ? 'Tạo mới yêu cầu SAP' : 'Create SAP request') : (lang == 'vi' ? 'Sửa' : 'Edit') } </span>
                        </h3>
                    </div>
                </div>
            </div>
            <div className="mb-0">
                 <div className="mb-2">
                    <label className="">{lang == 'vi' ? 'Người làm đơn' : 'Requester'}: <span className="font-semibold text-xl text-pink-700">{user?.userName} - {user?.userCode} - {user?.departmentName}</span></label> <br />
                </div>
                <div className="max-w-[35%]">
                    <label className="block mb-2 font-semibold text-gray-700">{lang == 'vi' ? 'Chọn loại SAP' : 'Choose SAP type'} <DotRequireComponent/></label>
                    <Select
                        className="cursor-pointer"
                        options={sapTypeOptions}
                        value={currentSapType}
                        onChange={(selectedOption: any) => {
                            setSapTypeCode(selectedOption ? selectedOption.value : null);
                        }}
                        styles={{
                            control: (base: any) => ({
                                ...base,
                                minHeight: '36px',
                                background: '#ffffff',
                                borderColor: '#d1d5dc',
                                boxShadow: 'none',
                                cursor:  "pointer"
                            }),
                        }}
                    />
                </div>

                <div className="flex flex-col">
                    <Label className="text-[16px] block mb-2 font-semibold text-gray-700 mt-2">
                        File SAP <span className="text-red-500">(.xls, .xlsx)</span><DotRequireComponent/>
                    </Label>

                    <div>
                        <input
                            disabled={fileSAP != null}
                            id="file-excel-sap"
                            type="file"
                            accept=".xls,.xlsx"
                            onChange={handleAddFiles}
                            className="hidden"
                        />
                        <label
                            htmlFor="file-excel-sap"
                            className={`inline-flex items-center gap-2 border px-3 py-1 rounded-md text-sm font-medium ${
                                fileSAP != null
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 cursor-pointer'
                            }`}
                        >
                            {lang === 'vi' ? 'Chọn file' : 'Choose file'} 
                        </label> <br />
                    </div>
                    {fileSAP != null && (
                        <FileListPreview
                            files={filesToPreview}
                            uploadedFiles={[]}
                            onRemove={handleFileRemove}
                        />
                    )}
                </div>
                
                <div className="">
                    <Label className="text-[16px] block font-semibold text-gray-700 mt-2">
                        {lang == 'vi' ? 'Ghi chú' : 'Note '}
                    </Label>
                    <Textarea className="w-[50%]" name="note" id="note" placeholder={lang == 'vi' ? 'Nhập ghi chú' : 'Enter note'} value={note} onChange={(e) => setNote(e.target.value)} rows={2}/>
                </div>

                <div className="flex flex-col">
                    <Label className="text-[16px] block mb-2 font-semibold text-gray-700 mt-2">
                        {lang == 'vi' ? 'Đính kèm file khác' : 'Attach other file '} <span className="italic text-gray-500 text-[14px]">{lang == 'vi' ? '(Không bắt buộc)' : '(Optional)'}</span>
                    </Label>

                    <div>
                        <input
                            id="other-file-excel"
                            multiple
                            disabled={otherFiles.length >= 3}
                            type="file"
                            accept=".xls,.xlsx"
                            onChange={handleAddOtherFiles}
                            className="hidden"
                        />
                        <label
                            htmlFor="other-file-excel"
                            className={`inline-flex items-center gap-2 border px-3 py-1 rounded-md text-sm font-medium ${
                                otherFiles.length >= 3
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 cursor-pointer'
                            }`}
                        >
                            {lang === 'vi' ? 'Chọn file' : 'Choose file'} 
                        </label> <br />
                    </div>
                    {otherFiles.length > 0 && (
                        <FileListPreview
                            files={otherFiles.map((f: any) => ({ name: f.name, type: f.type }))}
                            uploadedFiles={[]}
                            onRemove={handleOtherFileRemove}
                        />
                    )}
                </div>

                <div className="mt-5">
                    <Button onClick={handleSubmit} disabled={createSAP.isPending} className="text-sm cursor-pointer">
                        {createSAP.isPending ? <Spinner/> : lang == 'vi' ? 'Xác nhận' : 'Submit'}
                    </Button>
                </div>
            </div>
        </div>
    );
}