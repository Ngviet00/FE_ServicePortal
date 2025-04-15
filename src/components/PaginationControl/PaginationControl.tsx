import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";

import { FC } from "react";
import { Label } from "@/components/ui/label"

type PaginationWithPageSizeProps = {
	currentPage: number;
	totalPages: number;
	pageSize: number;
	pageSizes: number[];
	onPageChange: (page: number) => void;
	onPageSizeChange: (size: number) => void;
};

const getVisiblePages = (currentPage: number, totalPages: number): (number | "...")[] => {
    const visible: (number | "...")[] = [];
  
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
  
    if (currentPage <= 4) {
      visible.push(1, 2, 3, 4, 5, "...", totalPages);
    } else if (currentPage >= totalPages - 3) {
      visible.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      visible.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
    }
  
    return visible;
};

const PaginationControl: FC<PaginationWithPageSizeProps> = ({
		currentPage,
		totalPages,
		pageSize,
		pageSizes,
		onPageChange,
		onPageSizeChange,
}) => {
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
		
						{getVisiblePages(currentPage, totalPages).map((page, idx) => (
							<PaginationItem key={idx}>
								{page === "..." ? (
									<span className="px-2 text-gray-500">...</span>
								) : (
									<button
										style={{ userSelect: 'none'}}
										onClick={() => onPageChange(Number(page))}
										className={`px-3 py-1 rounded-md select-none hover:cursor-pointer ${
											currentPage === page ? "bg-black text-white" : "hover:bg-gray-200"
										}`}
										>
										{page}
									</button>
								)}
							</PaginationItem>
						))}
		
						<PaginationItem>
							<PaginationNext
								onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
								className={`${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''} hover:cursor-pointer select-none`}
								tabIndex={-1}
							/>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			</div>
	
			<div className="ml-4 flex">
				<Label className="pr-3">Row per page</Label>
				<Select defaultValue={pageSize.toString()} onValueChange={(val) => onPageSizeChange(Number(val))}>
					<SelectTrigger className="w-[70px]">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{pageSizes.map((size) => (
							<SelectItem key={size} value={size.toString()}>
								{size}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</div>
	);
};
  
  export default PaginationControl;