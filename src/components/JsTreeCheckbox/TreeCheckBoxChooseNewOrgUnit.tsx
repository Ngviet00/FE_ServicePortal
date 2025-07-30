import { Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { PropsTreeCbLeaveRequest, SmartCheckbox, TreeNode } from "./TreeCheckbox";

export function TreeCheckBoxChooseNewOrgUnit({ data, onChange, loadChildren }: PropsTreeCbLeaveRequest) {
	const [checkedSet, setCheckedSet] = useState<Set<string>>(new Set());
	const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});
	const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
	const [treeData, setTreeData] = useState<TreeNode[]>(data);

	useEffect(() => {
		setTreeData(data);
		const initExpanded: Record<string, boolean> = {};
		const collapseAll = (nodes: TreeNode[]) => {
			for (const node of nodes) {
				if (node.children) {
				initExpanded[node.id] = true;
				collapseAll(node.children);
				}
			}
		};
		collapseAll(data);
		setExpandedMap(initExpanded);
	}, [data]);

	const handleToggle = (node: TreeNode) => {
		const newSet = new Set<string>();
		const isCurrentlyChecked = checkedSet.has(node.id);
		let isCheckedNext = false;

		if (!isCurrentlyChecked) {
            newSet.add(node.id); 
            isCheckedNext = true;
        }

		setCheckedSet(newSet);

		if (onChange) {
            onChange(node.id, isCheckedNext);
        }
	};

	const toggleExpand = async (node: TreeNode) => {
		const wasExpanded = expandedMap[node.id] ?? false;

		setExpandedMap((prev) => ({
			...prev,
			[node.id]: !wasExpanded,
		}));

		if (!wasExpanded && loadChildren) {
			setLoadingMap((prev) => ({ ...prev, [node.id]: true }));
			try {
				const children = await loadChildren(node);
				setTreeData((prev) => {
					const attachChildren = (nodes: TreeNode[]): TreeNode[] =>
						nodes.map((n) => {
							if (n.id === node.id) {
								return { ...n, children };
							} else if (n.children) {
								return { ...n, children: attachChildren(n.children) };
							}
							return n;
						});
					return attachChildren(prev);
				});

			} finally {
				setLoadingMap((prev) => ({ ...prev, [node.id]: false }));
			}
		}
	};

	const renderTree = (nodes: TreeNode[], level = 0): React.ReactNode => {
		return nodes.map((node, idx) => {
			const isExpanded = expandedMap[node.id] ?? false;
			const hasChildren = node.children && node.children.length > 0;

			return (
				<div key={idx} className={`relative py-1 pl-${level === 0 ? 0 : 4}`}>
					<div className="flex items-center space-x-2">
						{((hasChildren || loadChildren) && node.type != "org_unit_user") ? (
						<button
							type="button"
							onClick={() => toggleExpand(node)}
							className="w-4 text-xs text-muted-foreground hover:cursor-pointer"
						>
							{isExpanded ? <Minus size={14} className="text-black" /> : <Plus size={14} className="text-black" />}
						</button>
						) : (
						<div className="w-4" />
						)}
						<label className={`flex items-center space-x-2 select-none ${node.type == 'org_unit_user' ? 'cursor-pointer' : ''}`}>
							{
								node.type == "org_unit_user" ? (
									<>
										<SmartCheckbox
											checked={checkedSet.has(node.id)}
											onChange={() => handleToggle(node)}
										/>
									</>
								) : (<></>)
							}
							<span>
								{node.label}
							</span>
						</label>
					</div>

					{hasChildren && isExpanded && (
						<div className="ml-4">{renderTree(node.children!, level + 1)}</div>
					)}

					{loadingMap[node.id] && (
						<div className="ml-8 text-sm text-gray-500 italic">Đang tải...</div>
					)}

					{isExpanded && !loadingMap[node.id] && !hasChildren && (
						<div className="ml-8 text-sm text-red-500 italic">Không có kết quả</div>
					)}
				</div>
			);
		});
	};

	return <div>{renderTree(treeData)}</div>;
}