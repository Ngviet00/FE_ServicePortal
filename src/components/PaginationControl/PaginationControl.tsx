import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";

import { FC, useState } from "react";
import { Label } from "@/components/ui/label";
import React from "react";

import { ListPerPage } from "@/ultils";

type PaginationWithPageSizeProps = {
	currentPage: number;
	totalPages: number;
	pageSize: number; //perpage
	onPageChange: (page: number) => void; //when click button previous, next, page 1 2 5
	onPageSizeChange: (size: number) => void; //onPageSizeChange 5 10 20 50
};

const getVisiblePages = (currentPage: number, totalPages: number): (number | "...")[] => {
	const pages: (number | "...")[] = [];

	pages.push(1);

	if (currentPage > 3) {
		pages.push("...");
	}

	if (currentPage > 2) {
		pages.push(currentPage - 1);
	}

	if (currentPage !== 1 && currentPage !== totalPages) {
		pages.push(currentPage);
	}

	if (currentPage < totalPages - 1) {
		pages.push(currentPage + 1);
	}

	if (currentPage < totalPages - 2) {
		pages.push("...");
	}

	if (totalPages > 1) {
		pages.push(totalPages);
	}

	return pages;
};

const PaginationControl: FC<PaginationWithPageSizeProps> = React.memo(({
	currentPage,
	totalPages,
	pageSize,
	onPageChange,
	onPageSizeChange,
}) => {
	const [editingDotIndex, setEditingDotIndex] = useState<number | null>(null);
	const [inputValue, setInputValue] = useState("");

	const visiblePages = getVisiblePages(currentPage, totalPages);

	return (
		<div className="flex items-center justify-between mt-4">
			<div className="flex-1 flex justify-center">
				<Pagination>
					<PaginationContent>
						<PaginationItem>
							<PaginationPrevious
								onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
								tabIndex={-1}
								className={`${currentPage === 1 ? 'pointer-events-none opacity-50' : ''} hover:cursor-pointer select-none`}
							/>
						</PaginationItem>

						{visiblePages.map((page, idx) => (
							<PaginationItem key={idx}>
								{page === "..." ? (
									editingDotIndex === idx ? (
										<input
											type="text"
											className="w-12 text-center border rounded outline-none"
											value={inputValue}
											autoFocus
											onChange={(e) => {
											const val = e.target.value;
											if (/^\d*$/.test(val)) {
												setInputValue(val);
											}
											}}
											onKeyDown={(e) => {
											if (e.key === "Enter") {
												const page = parseInt(inputValue, 10);
												if (!isNaN(page) && page >= 1 && page <= totalPages) {
												onPageChange(page);
												}
												setEditingDotIndex(null);
												setInputValue("");
											} else if (e.key === "Escape") {
												setEditingDotIndex(null);
												setInputValue("");
											}
											}}
											onBlur={() => {
												setEditingDotIndex(null);
												setInputValue("");
											}}
										/>
									) : (
										<button
											onClick={() => setEditingDotIndex(idx)}
											className="hover:cursor-pointer px-2 hover:bg-gray-300 rounded text-gray-500 select-none"
										>
											...
										</button>
									)
								) : (
									<button
										onClick={() => onPageChange(Number(page))}
										className={`px-3 py-1 rounded-md select-none hover:cursor-pointer ${
											currentPage === page ? "bg-black text-white" : "hover:bg-gray-200"
										}`}
									>
										{page}
									</button>
								)
							}
							</PaginationItem>
						))}

						<PaginationItem>
							<PaginationNext
								onClick={() => onPageChange(currentPage + 1)}
								className={`${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''} hover:cursor-pointer select-none`}
								tabIndex={-1}
							/>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			</div>

			<div className="ml-4 flex items-center space-x-2">
				<Label htmlFor="page-size">Rows per page</Label>
				<Select
					value={pageSize.toString()}
					onValueChange={(val) => {
						onPageSizeChange(Number(val));
					}}
				>
					<SelectTrigger className="w-[70px]" id="page-size">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{ListPerPage.map((size) => (
							<SelectItem key={size} value={size.toString()}>
								{size}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</div>
	);
});

export default PaginationControl;
