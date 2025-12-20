import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { RequestTypeEnum } from '@/lib';
import ViewApprovalWarningLetter from '../HR/WarningLetter/ViewApprovalWarningLetter';
import { useTranslation } from 'react-i18next';
import ViewApprovalTermination from '../HR/TerminationLetter/ViewApprovalTermination';
import ViewApprovalRegisnation from '../HR/ResignationLetter/ViewApprovalRegisnation';
import ViewApprovalRequisition from '../HR/RequisitionLetter/ViewApprovalRequisition';
import ViewTimeKeeping from '../TimeKeeping/ViewTimeKeeping';
import ViewApprovalOverTime from '../Overtime/ViewApprovalOverTime';
import ViewApprovalLeaveRequest from '../Leave/ViewApprovalLeaveRequest';
import ViewApprovalInternalMemoHR from '../InternalMemoHR/ViewApprovalInternalMemoHR';

const DetailApproval: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const lang = useTranslation().i18n.language.split('-')[0]

    const [searchParams] = useSearchParams();
    const requestType = searchParams.get("requestType");

    return (
        <div className="p-1 pl-1 pt-0 space-y-4">
            {
                requestType != null && requestType == RequestTypeEnum.WarningLetter.toString() ? <ViewApprovalWarningLetter id={id ?? ''}/> :
                requestType != null && requestType == RequestTypeEnum.TerminationLetter.toString() ? <ViewApprovalTermination id={id ?? ''}/> :
                requestType != null && requestType == RequestTypeEnum.ResignationLetter.toString() ? <ViewApprovalRegisnation id={id ?? ''}/> :
                requestType != null && requestType == RequestTypeEnum.ManpowerRequisitionLetter.toString() ? <ViewApprovalRequisition id={id ?? ''}/> :
                requestType != null && requestType == RequestTypeEnum.Timekeeping.toString() ? <ViewTimeKeeping id={id ?? ''} mode='approval'/> :
                requestType != null && requestType == RequestTypeEnum.Overtime.toString() ? <ViewApprovalOverTime id={id ?? ''}/> :
                requestType != null && requestType == RequestTypeEnum.LeaveRequest.toString() ? <ViewApprovalLeaveRequest id={id ?? ''}/> :
                requestType != null && requestType == RequestTypeEnum.InternalMemoHR.toString() ? <ViewApprovalInternalMemoHR id={id ?? ''}/> :
                (
                    <div className='text-red-500 font-bold'>
                        {lang == 'vi' ? 'Không tìm thấy dữ liệu' : 'Not found data'}
                    </div>
                 )
            }
        </div>
    );
}

export default DetailApproval;