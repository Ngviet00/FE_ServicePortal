import { formatDate } from "@/lib/time";
import { useTranslation } from "react-i18next";

interface IHistoryApplicationForm {
  userNameApproval?: string;
  action?: string;
  note?: string;
  createdAt?: string;
}

export default function HistoryApproval({ historyApplicationForm }: { historyApplicationForm?: IHistoryApplicationForm | null }) {
    const { t } = useTranslation('pendingApproval')
    const { userNameApproval, action, note, createdAt } = historyApplicationForm || {};

    return (
        <div className='history-approval mt-5' style={{ borderTop: '1px dashed #99a1af', borderBottom: '1px dashed #99a1af' }}>
            <h3 className='text-blue-600 text-xl font-semibold mb-2 pt-2'>{ t('history_component.title') }</h3>
            <p className='my-2 text-[15px]'>
                <strong className='mr-2'>{ t('history_component.username_approval') }:</strong>{userNameApproval || '--'}
            </p>
            <p className='my-2 text-[15px]'>
                <strong className='mr-2'>{ t('history_component.action') }:</strong><span className={`${action == 'REJECT' ? 'text-red-600' : 'text-green-600'} font-semibold`}>{action || '--'}</span>
            </p>
            <p className='my-2 text-[15px]'>
                <strong className='mr-2'>{ t('history_component.comment') }:</strong>
                {note === '' || !note ? '--' : note}
            </p>
            <p className='my-2 mb-5 text-[15px]'>
                <strong className='mr-2'>{ t('history_component.approved') }:</strong>{createdAt ? formatDate(createdAt, 'yyyy-MM-dd HH:mm:ss') : '--'}
            </p>
        </div>
    )
}