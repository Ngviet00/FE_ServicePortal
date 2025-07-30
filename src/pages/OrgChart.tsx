import { Tree, TreeNode } from 'react-organizational-chart';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import React, { useState, useRef } from 'react';
import userApi from '@/api/userApi';

type Person = {
	userName: string,
	usercode: string;
	orgUnitId: number;
	orgUnitName: string | null | undefined
	name: string | null | undefined,
};

type OrgChartNode = {
	orgUnitId: number;
	orgUnitName: string;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function groupUsersByOrgUnit(rawNodes: any[]): OrgChartNode[] {
	const grouped: { [key: number]: OrgChartNode } = {};

	rawNodes.forEach((raw) => {
		const orgId = raw.orgUnitId;
		if (!grouped[orgId]) {
			grouped[orgId] = {
				orgUnitId: orgId,
				orgUnitName: raw.orgUnitName,
				people: [],
				children: [],
			};
		}
		grouped[orgId].people.push({
			userName: `${raw.nvHoTen}`,
			usercode: `${raw.nvMaNV}`,
			orgUnitId: orgId,
			orgUnitName: `${raw.orgUnitName}`,
			name:  `${raw.name}`,
		});

		if (raw.children && raw.children.length > 0) {
			grouped[orgId].children.push(...groupUsersByOrgUnit(raw.children));
		}
	});

	return Object.values(grouped);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertToOrgChartNode(rawRoot: any): OrgChartNode {
	const root: OrgChartNode = {
		orgUnitId: rawRoot.orgUnitId,
		orgUnitName: rawRoot.orgUnitName,
		people: [{
			userName: rawRoot.nvHoTen,
			usercode: rawRoot.nvMaNV,
			orgUnitId: rawRoot.orgUnitId,
			orgUnitName: rawRoot.orgUnitName,
			name: rawRoot.name,
		}],
		children: [],
	};

	const flatChildren = groupUsersByOrgUnit(rawRoot.children || []);
	root.children = flatChildren;
	return root;
}

const NodeContent: React.FC<{ people: Person[]; orgUnitId: number }> = ({ people }) => (
	<div style={nodeStyle}>
		{people.map((p) => (
			<div key={p.usercode} className="dark:text-black">
				<strong className="dark:text-red-700 text-blue-600 font-bold">{p.name}</strong> <br />
				<strong className="dark:text-black">{p.usercode == 'null' ? 'Empty' : p.usercode}</strong>
				 	<br/> {p.userName == '' ? 'Empty' : p.userName}
			</div>
		))}
	</div>
);

const RenderNode: React.FC<{ node: OrgChartNode }> = ({ node }) => (
	<TreeNode label={<NodeContent people={node.people} orgUnitId={node.orgUnitId} />}>
		{node.children.map((child, idx) => (
			<RenderNode key={idx} node={child} />
		))}
	</TreeNode>
);

const OrgChartTree: React.FC = () => {
	const { t } = useTranslation();
	const [zoom, setZoom] = useState<number>(1);
	const [offset, setOffset] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
	const [isDragging, setIsDragging] = useState<boolean>(false);
	const [isHoveringChart, setIsHoveringChart] = useState<boolean>(false);
	const chartRef = useRef<HTMLDivElement | null>(null);
	const [department, setDepartment] = useState<number | null>(113); // default = Production

	const { data: rawData, isLoading } = useQuery({
		queryKey: ['org-chart', department],
		queryFn: async () => {
			if (!department) return null;
			const res = await userApi.orgChart(department);
			return res.data.data[0]; // first node is root
		},
		enabled: department !== null,
	});

	const orgChartData: OrgChartNode | null = rawData ? convertToOrgChartNode(rawData) : null;

	const handleWheel = (e: React.WheelEvent) => {
		if (!isHoveringChart) return;
		setZoom((prev) => Math.max(0.5, Math.min(prev + (e.deltaY < 0 ? 0.1 : -0.1), 2)));
	};

	const handleMouseMove = (e: React.MouseEvent) => {
		if (!isDragging) return;
		setOffset((prev) => ({
			x: prev.x + e.movementX,
			y: prev.y + e.movementY,
		}));
	};

	return (
		<div style={{ padding: '20px' }}>
			<div className="flex items-center mb-3">
				<label htmlFor="department_id" className="mb-1 mr-2 font-bold">{t('org_chart_page.select_department')}:</label>
				<select
					value={department ?? ''}
					onChange={(e) => setDepartment(Number(e.target.value))}
					id="department_id"
					className="dark:bg-[#454545] border border-gray-300 px-[20px] py-[5px]"
				>
					<option value="">--{t('org_chart_page.select')}--</option>
					<option value="113">Production</option>
					<option value="110">HR</option>
					<option value="118">MIS/IT</option>
				</select>
			</div>

			{
				isLoading ? <div>{t('org_chart_page.loading')}</div> :
				<div
					ref={chartRef}
					onWheel={handleWheel}
					onMouseDown={() => setIsDragging(true)}
					onMouseMove={handleMouseMove}
					onMouseUp={() => setIsDragging(false)}
					onMouseEnter={() => setIsHoveringChart(true)}
					onMouseLeave={() => setIsHoveringChart(false)}
					style={{
						overflow: 'hidden',
						cursor: isDragging ? 'grabbing' : 'grab',
						transform: `scale(${zoom})`,
						transformOrigin: 'top left',
						marginLeft: offset.x,
						marginTop: offset.y,
						transition: 'transform 0.3s ease',
						position: 'relative',
					}}
				>
					{orgChartData ? (
						<Tree
							lineWidth="2px"
							lineColor="#bbb"
							lineBorderRadius="8px"
							label={<NodeContent people={orgChartData.people} orgUnitId={orgChartData.orgUnitId} />}
						>
							{orgChartData.children.map((child, idx) => (
								<RenderNode key={idx} node={child} />
							))}
						</Tree>
					) : (
						<div>{t('org_chart_page.no_data')}</div>
					)}
				</div>
			}
		</div>
	);
};

export default OrgChartTree;
