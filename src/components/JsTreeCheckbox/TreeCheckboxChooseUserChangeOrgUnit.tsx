import { Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { PropsTreeCbLeaveRequest, SmartCheckbox, TreeNode } from "./TreeCheckbox";

export function TreeCheckboxChooseUserChangeOrgUnit({ data, onChange, loadChildren }: PropsTreeCbLeaveRequest) {
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

	const getAllChildren = (node: TreeNode): string[] => {
		let result: string[] = [];
		if (node.children) {
			for (const child of node.children) {
				result.push(child.id);
				result = result.concat(getAllChildren(child));
			}
		}
		return result;
	};

	const findNodeById = (nodes: TreeNode[], id: string): TreeNode | null => {
		for (const node of nodes) {
			if (node.id === id) return node;
			if (node.children) {
				const found = findNodeById(node.children, id);
				if (found)
					return found;
			}
		}
		return null;
	};

	const getParentMap = (nodes: TreeNode[], parentId: string | null = null, map = new Map<string, string | null>()) => {
		for (const node of nodes) {
			map.set(node.id, parentId);
			if (node.children) getParentMap(node.children, node.id, map);
		}
		return map;
	};

  	const parentMap = getParentMap(treeData);

	const updateParentState = (id: string, updated = new Set(checkedSet)) => {
		let parentId = parentMap.get(id);
		while (parentId) {
			const parentNode = findNodeById(treeData, parentId);
			if (!parentNode?.children) return updated;
			const childIds = parentNode.children.map((c) => c.id);
			const allChecked = childIds.every((cid) => updated.has(cid));
			if (allChecked) {
				updated.add(parentId);
			} else {
				updated.delete(parentId);
			}
			parentId = parentMap.get(parentId);
		}
		return updated;
	};

	const handleToggle = (node: TreeNode) => {
		const newSet = new Set(checkedSet);
		const isChecked = newSet.has(node.id);
		const isCheckedNext = !isChecked;
		const allChildren = getAllChildren(node);

		if (isChecked) {
			newSet.delete(node.id);
			allChildren.forEach((id) => newSet.delete(id));
		} else {
			newSet.add(node.id);
			allChildren.forEach((id) => newSet.add(id));
		}

		const updated = updateParentState(node.id, newSet);
		setCheckedSet(updated);

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

				const preChecked = new Set(checkedSet);
				for (const child of children) {
					if (child.type === "user" && child.metaData?.hasRoleSAP === 1) {
						preChecked.add(child.id);
					}
				}
				const updated = updateParentState(node.id, preChecked);
				setCheckedSet(updated);

				if (checkedSet.has(node.id)) {
					const newSet = new Set(checkedSet);
					const collectAllChildIds = (nodes: TreeNode[]): string[] => {
						let ids: string[] = [];
						for (const c of nodes) {
							ids.push(c.id);
							if (c.children) {
								ids = ids.concat(collectAllChildIds(c.children));
							}
						}
						return ids;
					};

					const childIds = collectAllChildIds(children);
					childIds.forEach((id) => newSet.add(id));

					const updated = updateParentState(node.id, newSet);
					setCheckedSet(updated);
				}
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
						{((hasChildren || loadChildren) && node.type != "user") ? (
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
						<label className={`flex items-center space-x-2 select-none ${node.type == 'user' ? 'cursor-pointer' : ''}`}>
							{
								node.type == "user" ? (
									<>
										<SmartCheckbox
											checked={checkedSet.has(node.id)}
											onChange={() => handleToggle(node)}
										/>
									</>
								) : (<></>)
							}
							<span>
								{
									node.type == "user" ? (<span className="font-bold pr-2">({node.id})</span>) : ""
								}
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