import React, { useState, useRef } from 'react';
import { Tree, TreeNode } from 'react-organizational-chart';
import { useQuery } from '@tanstack/react-query';
import userApi from '@/api/userApi';

type Person = {
	usercode: string;
	positionId: number;
};

type OrgChartNode = {
	positionId: number;
	people: Person[];
	children: OrgChartNode[];
};

const nodeStyle: React.CSSProperties = {
	padding: "8px 12px",
	borderRadius: "8px",
	display: "inline-block",
	border: "1px solid #ccc",
	backgroundColor: "#fff",
	fontSize: "14px",
	whiteSpace: "pre-line",
	boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
};

const NodeContent: React.FC<{ people: Person[]; positionId: number }> = ({
	people,
	positionId,
}) => (
	<div style={nodeStyle}>
		<strong>Position - {positionId}</strong>
		<br />
		{people.map((p) => (
		<div key={p.usercode}>
			{p.usercode}
		</div>
		))}
	</div>
);

const RenderNode: React.FC<{ node: OrgChartNode }> = ({ node }) => (
	<TreeNode label={<NodeContent people={node.people} positionId={node.positionId} />}>
		{node.children.map((child, idx) => (
		<RenderNode key={idx} node={child} />
		))}
	</TreeNode>
);

const OrgChartTree: React.FC = () => {
	const [searchQuery] = useState<string>('');
	const [zoom, setZoom] = useState<number>(1);
	const [isDragging, setIsDragging] = useState<boolean>(false);
	const [offset, setOffset] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
	const [isHoveringChart, setIsHoveringChart] = useState<boolean>(false);
	const chartRef = useRef<HTMLDivElement | null>(null);
	const [department, setDepartment] = useState<number | null>(1); // default chọn 1

	const { data: orgChartData, isLoading } = useQuery({
		queryKey: ['get-org-chart', department],
		queryFn: async () => {
		if (department == null || isNaN(department) ) return null;
			const res = await userApi.orgChart(department);
			return res.data.data as OrgChartNode;
		},
		enabled: department != null,
	});

  	// Hàm filter theo usercode hoặc positionId (string)
	const filterTree = (node: OrgChartNode): OrgChartNode | null => {
		const filteredChildren = node.children
			.map(filterTree)
			.filter((child): child is OrgChartNode => child !== null);

		// Kiểm tra người trong node có match search query?
		const matchPeople = node.people.some(p =>
			p.usercode.toLowerCase().includes(searchQuery.toLowerCase()) ||
			p.positionId.toString().includes(searchQuery)
		);

		if (matchPeople || filteredChildren.length > 0) {
			return {
				...node,
				children: filteredChildren,
			};
		}

		return null;
	};

	const filteredData = orgChartData ? filterTree(orgChartData) : null;

	const handleWheel = (e: React.WheelEvent) => {
		if (isHoveringChart) {
		if (e.deltaY < 0) {
			setZoom((prevZoom) => Math.min(prevZoom + 0.1, 2));
		} else {
			setZoom((prevZoom) => Math.max(prevZoom - 0.1, 0.5));
		}
		}
	};

	const handleMouseDown = () => setIsDragging(true);
	const handleMouseMove = (e: React.MouseEvent) => {
		if (isDragging) {
		setOffset((prev) => ({
			x: prev.x + e.movementX,
			y: prev.y + e.movementY,
		}));
		}
	};
	const handleMouseUp = () => setIsDragging(false);
	const handleMouseEnter = () => setIsHoveringChart(true);
	const handleMouseLeave = () => setIsHoveringChart(false);

	if (isLoading) return <div>Đang tải sơ đồ tổ chức...</div>;

	if (!filteredData) {
		//alert("Không tìm thấy dữ liệu phù hợp.")
	}

	// if (!filteredData)  return <div>Không tìm thấy dữ liệu phù hợp.</div>;

	return (
		<div style={{ padding: '20px' }}>
			<div className="flex items-center justify-between mb-3">
				<div>
				<label htmlFor="department_id" className="mb-1 mr-2 font-bold">Chọn phòng ban:</label>
				<select
					value={department ?? ''}
					onChange={(e) => setDepartment(Number(e.target.value))}
					name="department_id"
					id="department_id"
					className="dark:bg-[#454545] border border-gray-300 px-[20px] py-[5px]"
				>
					<option value="">--Chọn--</option>
					<option value="1">HR</option>
					<option value="2">MIS/IT</option>
					<option value="3">Sản xuất</option>
				</select>
				</div>
			</div>

			<div
				ref={chartRef}
				onWheel={handleWheel}
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				style={{
				overflow: 'hidden',
				cursor: isDragging ? 'grabbing' : 'grab',
				position: 'relative',
				transform: `scale(${zoom})`,
				transformOrigin: 'top left',
				transition: 'transform 0.3s ease',
				marginLeft: offset.x,
				marginTop: offset.y,
				}}
			>
				<Tree
				lineWidth="2px"
				lineColor="#bbb"
				lineBorderRadius="8px"
				label={<NodeContent people={filteredData?.people ?? []} positionId={filteredData?.positionId ?? 0} />}
				>
				{
					filteredData?.children ? 
						filteredData.children.map((child, idx) => (
							<RenderNode key={idx} node={child} />
						))
					: "Not data"
				}
				</Tree>
			</div>
		</div>
	);
};

export default OrgChartTree;
