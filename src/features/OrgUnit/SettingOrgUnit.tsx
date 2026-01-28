import { useState } from "react";
import CreateTeamComponent from "./components/CreateTeamComponent";
import CreateDepartmentComponent from "./components/CreateDepartmentComponent";
import CreateOrgPositionComponent from "./components/CreateOrgPositionComponent";

export default function SettingOrgUnit() {
    const [selectedOption, setSelectedOption] = useState(1)

    return (
        <div className="p-4 pl-1 pt-0 list-role">
            <div className="flex justify-between mb-1">
                <h3 className="font-bold text-2xl m-0 pb-2">Quản lý bộ phận, nhóm, vị trí</h3>
            </div>

            <div className="flex gap-4 mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" className="cursor-pointer accent-black" checked={selectedOption === 1} onChange={() => setSelectedOption(1)} /> Bộ phận
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" className="cursor-pointer accent-black" checked={selectedOption === 2} onChange={() => setSelectedOption(2)} /> Tổ/nhóm
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" className="cursor-pointer accent-black" checked={selectedOption === 3} onChange={() => setSelectedOption(3)} /> Vị trí
                </label>
            </div>
            { selectedOption == 1 && <CreateDepartmentComponent/> }
            { selectedOption == 2 && <CreateTeamComponent/> }
            { selectedOption == 3 && <CreateOrgPositionComponent/> }
        </div>
    )
}