import React from "react";

interface Note {
    note: string;
}

const NoteApprovalFlow: React.FC<Note> = React.memo(({ note }) => {
    return  <div className='mt-4 text-base text-black bg-orange-100 p-3 rounded-lg font-semibold border border-orange-300'>
        <span>
            {note}
        </span>
    </div>
});

export default NoteApprovalFlow;