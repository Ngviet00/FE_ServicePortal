/* eslint-disable @typescript-eslint/no-explicit-any */
import { formatDate } from "@/lib/time";
import { useTranslation } from "react-i18next";

interface IHistoryApplicationForm {
    actionBy?: string;
    action?: string;
    note?: string;
    actionAt?: string;
}

export default function HistoryApproval({ historyApplicationForm }: { historyApplicationForm?: IHistoryApplicationForm[] | null }) {
    const { t } = useTranslation('pendingApproval')

    return (
        <div className='history-approval mt-5' style={{ borderTop: '1px dashed #99a1af' }}>
            <h3 className='text-blue-600 text-xl font-semibold mb-2 pt-2'>{ t('history_component.title') }</h3>
            {
                historyApplicationForm?.map((item: any, idx: number) => {
                    return (
                        <div key={idx} style={{ borderBottom: '1px dashed #99a1af' }}>
                            <p className='my-2 text-[15px]'>
                                <strong className='mr-2'>{ t('history_component.username_approval') }:</strong>{item?.userNameAction || '--'}
                            </p>
                            <p className='my-2 text-[15px]'>
                                <strong className='mr-2'>{ t('history_component.action') }:</strong>
                                <span 
                                    className={`${item?.action?.startsWith('Reje') ? 'text-red-600' : (item?.action == 'Approved' || item?.action == 'Resolved') ? 'text-green-600' : 'text-yellow-600'} font-bold`}>
                                        {item?.action || '--'}
                                </span>
                            </p>
                            <p className='my-2 text-[15px]'>
                                <strong className='mr-2'>{ t('history_component.comment') }:</strong>
                                {item?.note === '' || !item?.note ? '--' :item?. note}
                            </p>
                            <p className='my-2 mb-5 text-[15px]'>
                                <strong className='mr-2'>{ t('history_component.approved') }:</strong>{item?.actionAt ? formatDate(item?.actionAt, 'yyyy-MM-dd HH:mm:ss') : '--'}
                            </p>
                        </div>
                    )
                })
            }
        </div>
    )
}