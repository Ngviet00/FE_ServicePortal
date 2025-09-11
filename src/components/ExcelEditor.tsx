/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { HotTable } from '@handsontable/react-wrapper';
import { registerAllModules } from 'handsontable/registry';
import { useTranslation } from "react-i18next";
import Modal from "./Modal";
import * as XLSX from "xlsx";
import 'handsontable/styles/handsontable.css';
import 'handsontable/styles/ht-theme-main.css';
import { ShowToast } from "@/lib";
import { Spinner } from "./ui/spinner";

registerAllModules();

type ColConfig = {
	title: string;
	type?: "text" | "numeric" | "date" | "dropdown" | "checkbox";
	source?: string[];
	width?: number;// px
	validator?: (value: any, callback: (valid: boolean) => void) => void | string;
};

type ExcelEditorProps = {
	width?: number | 1000,
	height?: number | 700,
	triggerLabel?: string;
	colTitles?: string[];
	onSave?: (data: any[][]) => void;
	onClose?: () => void;
	colConfigs: ColConfig[];
	validate?: (data: any[][]) => { valid: boolean, message?: string };
	isPending?: boolean,
};

registerAllModules();

export default function ExcelEditor({width, height, triggerLabel, colTitles, onSave, colConfigs, validate, isPending } : ExcelEditorProps) {
	const lang = useTranslation().i18n.language.split('-')[0]
	const [isOpen, setIsOpen] = useState(false);

	const numberRowDefault = 15;
	const emptyRows = Array.from({ length: numberRowDefault }, () => colConfigs.map(() => ""));
	const [data, setData] = useState<any[][]>(emptyRows);

	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (evt) => {
		const bstr = evt.target?.result;
		const wb = XLSX.read(bstr, { type: "binary" });
		const wsname = wb.SheetNames[0];
		const ws = wb.Sheets[wsname];
		const sheetData = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

		const normalizedData = sheetData.map(row => {
			const filled = [...row];
			while (filled.length < colConfigs.length) filled.push("");
			return filled.slice(0, colConfigs.length);
		});

		setData(normalizedData);
		};
		reader.readAsBinaryString(file);
	};

	const handleSave = () => {
		const cleanedData = data.filter(row =>
			row.some(cell => cell !== null && cell !== undefined && cell !== "")
		);

		if (validate) {
			const result = validate(cleanedData);
			if (!result.valid) {
				ShowToast(result.message ?? "Dữ liệu không hợp lệ", "error")
				return; 
			}
		}

		if (onSave) onSave(cleanedData);
		setIsOpen(false);
	};

	const clearData = () => {
		setData(emptyRows);
	}

	return (
		<div>
			<button className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded cursor-pointer text-white font-semibold" onClick={() => setIsOpen(true)}>
				{triggerLabel}
			</button>

			<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} className={`max-w-[${width}px] max-h-[${height}px]`}>
				<h3 className="text-xl font-semibold mb-3">
					{ lang == 'vi' ? 'Nhập dữ liệu' : 'Input data' }
				</h3>
				<div className="mb-2 flex justify-between">
					<div className="">
						<span className="italic font-semibold underline">{ lang == 'vi' ? 'Ghi chú' : 'Note'}:</span>
						<span className="text-orange-700">
						{
							lang == 'vi' ? ' Để thêm dòng mới, nhập dữ liệu rồi ấn Enter' : ' To add a new row, enter data and press Enter'
						}
						</span>
					</div>
					<div>
						<button onClick={clearData} className="bg-red-400 hover:bg-red-500 px-3 py-1 rounded cursor-pointer text-white font-semibold">
							Clear data
						</button>
						<label className="bg-green-400 hover:bg-green-500 hover:cursor-not-allowed px-3 py-1 rounded cursor-pointer text-white font-semibold ml-2">
							Import Excel
							<input
								disabled={true}
								type="file"
								accept=".xlsx,.xls"
								onChange={handleFileUpload}
								className="hidden"
							/>
						</label>
					</div>
				</div>
				<div style={{ width: `${width}px`, height: `${height}px`, overflow: "auto" }}>
					<HotTable
						themeName="ht-theme-main"
						data={data}
						rowHeaders={true}
						columns={colConfigs.map((c) => ({
							type: c.type || "text",
							source: c.source,
							width: c.width,
							dateFormat: c.type === "date" ? "YYYY-MM-DD" : undefined,
							correctFormat: c.type === "date" ? true : undefined,
							allowInvalid: true,
							validator: c.validator
						}))}
						colHeaders={colConfigs.map((c) => c.title)}
						stretchH="all"
						startRows={1}
						startCols={colTitles?.length}
						minSpareRows={1}
						enterMoves={{ row: 1, col: 0 }}
						licenseKey="non-commercial-and-evaluation"
						afterChange={(changes, source) => {
							if (source === "loadData" || !changes) return;

							const newData = [...data];
							changes.forEach(([row, prop, oldValue, newValue]) => {
								if (oldValue !== newValue) {
								newData[row][prop as number] = newValue;
								}
							});
							setData(newData);
						}}
					/>
				</div>
				<div className="w-full text-right">
					<button disabled={isPending} onClick={handleSave} className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded cursor-pointer text-white font-semibold">
						{ isPending ? <Spinner className="text-white"/> : 'Save'}
					</button>
				</div>
			</Modal>
		</div>
	);
}
