import { Tree, TreeNode } from 'react-organizational-chart';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import React, { useState, useRef } from 'react';
import userApi from '@/api/userApi';
import orgUnitApi from '@/api/orgUnitApi';

type Person = {
	userName: string,
	userCode: string;
	orgPositionId: number
	positionName: string
	teamName: string | null | undefined
	parentOrgPositionId: number
};

type OrgChartNode = {
	orgPositionId: number
	teamName: string;
	positionName: string
	people: Person[]
	children: OrgChartNode[]
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
        const orgPositionId = raw.orgPositionId;
        if (!grouped[orgPositionId]) {
            grouped[orgPositionId] = {
                orgPositionId: orgPositionId,
                teamName: raw.teamName,
                positionName: raw.positionName,
                people: [],
                children: [],
            };
        }

        grouped[orgPositionId].people.push({
            userName: raw.userName ?? "--",
            userCode: raw.userCode ?? "--",
            orgPositionId: orgPositionId,
            teamName: raw.teamName,
            parentOrgPositionId: raw.parentOrgPositionId,
            positionName: raw.positionName,
        });

        if (raw.children && raw.children.length > 0) {
            grouped[orgPositionId].children.push(...groupUsersByOrgUnit(raw.children));
        }
    });

    return Object.values(grouped);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertToOrgChartNode(rawRoot: any): OrgChartNode {
	const root: OrgChartNode = {
		orgPositionId: rawRoot.orgPositionId,
		teamName: rawRoot.teamName,
		people: [{
			userName: rawRoot.userName,
			userCode: rawRoot.userCode,
			orgPositionId: rawRoot.orgPositionId,
			teamName: rawRoot.teamName,
			parentOrgPositionId: rawRoot.parentOrgPositionId,
			positionName: rawRoot.positionName,
		}],
		children: [],
		positionName: rawRoot.positionName
	};

	const flatChildren = groupUsersByOrgUnit(rawRoot.children || []);
	root.children = flatChildren;
	return root;
}

const NodeContent: React.FC<{ people: Person[]; orgPositionId: number }> = ({ people }) => {
    if (!people || people.length === 0) return null;
    const firstPerson = people[0];
    const total = people.length;
    const isVacant = !firstPerson.userCode || firstPerson.userCode === 'null';
    
    const isTooCrowded = total > 15;

    return (
        <div style={nodeStyle} className="min-w-[150px] shadow-sm border-t-2 border-blue-500 bg-white p-2">
            <div className={`font-bold text-[13px] uppercase mb-1 ${isVacant ? 'text-red-600' : 'text-blue-700'}`}>
                {firstPerson.positionName}
            </div>

            {isTooCrowded ? (
                <div className="py-3 bg-gray-50 rounded-md border border-dashed border-gray-300">
                    <div className="text-2xl font-black text-gray-700">{total}</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider">Members</div>
                </div>
            ) : (
                <div className="flex flex-col gap-1">
                    {people.map((p) => (
                        <div key={p.userCode} className="text-center">
                            <div className="text-[13px] font-bold text-gray-800 leading-tight">
                                {(!p.userCode || p.userCode === 'null') ? 'Empty' : p.userCode}
                            </div>
                            <div className="text-[13px] text-gray-500 truncate">
                                {(!p.userName || p.userName === 'null') ? '' : p.userName}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {(total > 1 && !isTooCrowded) && (
                <div className="mt-1 text-[9px] text-gray-400 border-t pt-1">
                    Total: {total}
                </div>
            )}
        </div>
    );
};

const RenderNode: React.FC<{ node: OrgChartNode }> = ({ node }) => (
	<TreeNode label={<NodeContent people={node.people} orgPositionId={node.orgPositionId} />}>
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
	const [department, setDepartment] = useState<number | null>(null); 

	const { data: rawData, isLoading } = useQuery({
		queryKey: ['org-chart', department],
		queryFn: async () => {
			if (!department) return null; 
			const res = await userApi.orgChart(department);
			return res?.data?.data?.[0] ?? null; 
		},
		enabled: !!department, 
	});

	const { data: departments = [] } = useQuery({
        queryKey: ['get-all-departments'],
        queryFn: async () => {
            const res = await orgUnitApi.GetAllDepartment()
            return res.data.data
        },
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
		<div>
			<div className="flex items-center mb-3">
				<label htmlFor="department_id" className="mb-1 mr-2 font-bold">{t('org_chart_page.select_department')}:</label>
				<select
					value={department ?? ''}
					onChange={(e) => setDepartment(Number(e.target.value))}
					id="department_id"
					className="dark:bg-[#454545] border border-gray-300 px-[20px] py-[5px]"
				>
					<option value="">--{t('org_chart_page.select')}--</option>
					{
						departments.map((item: {id: number, name: string}) => (
							<option key={item.id} value={item.id}>{item.name}</option>
						))
					}
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
							label={<NodeContent people={orgChartData.people} orgPositionId={orgChartData.orgPositionId} />}
						>
							{orgChartData.children.map((child, idx) => (
								<RenderNode key={idx} node={child} />
							))}
						</Tree>
					) : (
						<div>No results</div>
					)}
				</div>
			}
		</div>
	);
};

export default OrgChartTree;
