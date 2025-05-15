import React, { useState, useRef, useEffect } from 'react';
import { Tree, TreeNode } from 'react-organizational-chart';
import { useQuery } from '@tanstack/react-query';
import userApi from '@/api/userApi';
import departmentApi from '@/api/departmentApi';

type Person = {
	id: string;
	name: string;
	position: string;
	level: string;
	level_parent: string;
	code?: string;
};

type OrgChartNode = {
	level: string;
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

const NodeContent: React.FC<{ people: Person[]; level: string }> = ({
	people,
	level,
}) => (
	<div style={nodeStyle} className=''>
		<strong className='dark:text-black'>Level {level}</strong>
		<br />
		{people.map((p) => (
		<div key={p.id} className='dark:text-black'>
			{p?.code} - {p.name} - {p.position}
		</div>
		))}
	</div>
);

const RenderNode: React.FC<{ node: OrgChartNode }> = ({ node }) => (
	<TreeNode label={<NodeContent people={node.people} level={node.level} />}>
		{node.children.map((child, idx) => (
			<RenderNode key={idx} node={child} />
		))}
	</TreeNode>
);

const OrgChartTree: React.FC = () => {
	const [searchQuery, setSearchQuery] = useState<string>('');
	const [zoom, setZoom] = useState<number>(1);
	const [isDragging, setIsDragging] = useState<boolean>(false);
	const [offset, setOffset] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
	const [isHoveringChart, setIsHoveringChart] = useState<boolean>(false);
	const chartRef = useRef<HTMLDivElement | null>(null);
	const [department, setDepartment] = useState<number | null>(null);

	const { data: departments = [] } = useQuery({
		queryKey: ['departments'],
		queryFn: async () => {
			const res = await departmentApi.getAll({ page: 1, page_size: 100 });
			return res.data.data;
		},
	});

	const { data: OrgChartData = [], isPending, refetch: refetchOrgChart } = useQuery({
        queryKey: ['get-org-chart'],
        queryFn: async () => {
			if (department == null) return []

            const res = await userApi.orgChart(department);
            return res.data.data;
        }
    });

	useEffect(() => {
		if (departments.length > 0) {
			const hrDepartment = departments.find((d: {name: string}) => d.name === 'HR');
			setDepartment(hrDepartment.id);
		}
	}, [departments]);

	useEffect(() => {
		if (department) {
			refetchOrgChart();
		}
	}, [department, refetchOrgChart]);

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.target.value);
	};

	const filteredData = OrgChartData.filter((node: OrgChartNode) =>
		node.people.some((person: Person) =>
		person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
		person.position.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	const handleWheel = (e: React.WheelEvent) => {
		if (isHoveringChart) {
		if (e.deltaY < 0) {
			setZoom((prevZoom) => Math.min(prevZoom + 0.1, 2));
		} else {
			setZoom((prevZoom) => Math.max(prevZoom - 0.1, 0.5));
		}
		}
	};

	const handleMouseDown = () => {
		setIsDragging(true);
	};

	const handleMouseMove = (e: React.MouseEvent) => {
		if (isDragging) {
		setOffset((prevOffset) => ({
			x: prevOffset.x + e.movementX,
			y: prevOffset.y + e.movementY,
		}));
		}
	};

	const handleMouseUp = () => {
		setIsDragging(false);
	};

	const handleMouseEnter = () => {
		setIsHoveringChart(true);
	};

	const handleMouseLeave = () => {
		setIsHoveringChart(false);
	};

	if (isPending) return <div>Đang tải sơ đồ tổ chức...</div>;

	return (
		<div style={{ padding: '20px' }}>
			<div className='flex items-center justify-between mb-3'>
				<div>
					<label htmlFor="department_id" className='mb-1 mr-2 font-bold'>Chọn phòng ban:</label>
					<select value={department ?? ''} onChange={(e) => setDepartment(Number(e.target.value), )} name="department_id" id="department_id" className='dark:bg-[#454545] border border-gray-300 px-[20px] py-[5px]'>
						<option value="">--Chọn--</option>
						<option value="1">HR</option>
						<option value="2">MIS/IT</option>
						<option value="3">Sản xuất</option>
						{/* {
							departments.map((dept: {id: number, name: string}) => (
								<option key={dept.id} value={dept.id}>{dept.name}</option>
							))
						} */}
					</select>
				</div>
				<div className='flex-1'>
					<input
						type="text"
						className='border-gray-300 border ml-3 rounded-[3px]'
						value={searchQuery}
						onChange={handleSearch}
						placeholder="Tìm kiếm..."
						style={{ padding: '5px', fontSize: '16px', width: '100%' }}
					/>
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
					label={<NodeContent people={filteredData[0]?.people ?? []} level={filteredData[0]?.level ?? ''} />}
				>
					{filteredData[0]?.children?.map((child: OrgChartNode, idx: number) => (
						<RenderNode key={idx} node={child} />
					))}
				</Tree>
			</div>
		</div>
	);
};

export default OrgChartTree;
