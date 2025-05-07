import React, { useState, useRef } from 'react';
import { Tree, TreeNode } from 'react-organizational-chart';
import { useQuery } from '@tanstack/react-query';
import userApi from '@/api/userApi';

type Person = {
	id: string;
	name: string;
	position: string;
	level: string;
	level_parent: string;
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
	<div style={nodeStyle}>
		<strong>Level {level}</strong>
		<br />
		{people.map((p) => (
		<div key={p.id}>
			{p.name} - {p.position}
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

	const { data: OrgChartData = [], isPending } = useQuery({
        queryKey: ['get-org-chart'],
        queryFn: async () => {
            const res = await userApi.orgChart(3);
            return res.data.data;
        }
    });

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
	if (!OrgChartData || OrgChartData.length === 0) return <div>Không có dữ liệu</div>;

	return (
		<div style={{ padding: '20px' }}>
		<input
			type="text"
			value={searchQuery}
			onChange={handleSearch}
			placeholder="Tìm kiếm..."
			style={{ marginBottom: '20px', padding: '8px', fontSize: '16px', width: '100%' }}
		/>

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



// import axios from 'axios';
// import React, { useEffect, useState } from 'react';
// import { Tree, TreeNode } from 'react-organizational-chart';

// type Person = {
// 	id: string;
// 	name: string;
// 	position: string;
// 	level: string;
// 	levelParent: string;
//   };
  
//   type OrgChartNode = {
// 	level_code: string;
// 	people: Person[];
// 	children: OrgChartNode[];
//   };

//   const nodeStyle: React.CSSProperties = {
// 	padding: "8px 12px",
// 	borderRadius: "8px",
// 	display: "inline-block",
// 	border: "1px solid #ccc",
// 	backgroundColor: "#fff",
// 	fontSize: "14px",
// 	whiteSpace: "pre-line",
// 	boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
//   };

//   const NodeContent: React.FC<{ people: Person[]; level_code: string }> = ({
// 	people,
// 	level_code,
//   }) => (
// 	<div style={nodeStyle}>
// 	  <strong>Level {level_code}</strong>
// 	  <br />
// 	  {people.map((p) => (
// 		<div key={p.id}>
// 		  {p.name} - {p.position}
// 		</div>
// 	  ))}
// 	</div>
//   );

//   // Đệ quy vẽ cây
// const RenderNode: React.FC<{ node: OrgChartNode }> = ({ node }) => (
// 	<TreeNode label={<NodeContent people={node.people} level_code={node.level_code} />}>
// 	  {node.children.map((child) => (
// 		<RenderNode key={child.level_code} node={child} />
// 	  ))}
// 	</TreeNode>
//   );

//   const OrgChartTree: React.FC = () => {
// 	const [data, setData] = useState<OrgChartNode[]>([]);
// 	const [loading, setLoading] = useState(true);
  
// 	useEffect(() => {
// 	  axios
// 		.get("https://localhost:7006/api/user/org-chart?department_id=3") // 🔁 Đổi URL API tại đây
// 		.then((res) => {
// 		  setData(res.data.data); // Đảm bảo API trả về đúng định dạng
// 		  setLoading(false);
// 		})
// 		.catch((err) => {
// 		  console.error("Lỗi tải dữ liệu sơ đồ:", err);
// 		  setLoading(false);
// 		});
// 	}, []);
  
// 	if (loading) return <div>Đang tải sơ đồ tổ chức...</div>;
// 	if (!data || data.length === 0) return <div>Không có dữ liệu</div>;
  
// 	return (
// 	  <div style={{ overflowX: "auto", padding: 20 }}>
// 		<Tree
// 		  lineWidth={"2px"}
// 		  lineColor={"#bbb"}
// 		  lineBorderRadius={"8px"}
// 		  label={<NodeContent people={data[0].people} level_code={data[0].level_code} />}
// 		>
// 		  {data[0].children.map((child) => (
// 			<RenderNode key={child.level_code} node={child} />
// 		  ))}
// 		</Tree>
// 	  </div>
// 	);
//   };
  
// export default OrgChartTree;

