import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import memoNotificationApi, { IMemoNotify } from '@/api/memoNotificationApi'
import { formatDate } from '@/lib/time'

export default function DetailMemoNotification() {
    const { id } = useParams()
    const [memo, setMemo] = useState<IMemoNotify | null>(null)

    useEffect(() => {
        const fetchMemo = async () => {
            const result = await memoNotificationApi.getById(id!);
            setMemo(result.data.data)
        }
        fetchMemo()
    }, [id])

    if (!memo) {
        return <div className="p-6">Đang tải...</div>
    }

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <h2 className="text-[24px] sm:text-[30px] font-bold mb-1">{memo.title}</h2>
            <div className="text-sm text-gray-600 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className='dark:text-white'>
                    Created by: <span className="font-bold text-black dark:text-white">{memo.createdBy}</span>
                </span>
                <span className='dark:text-white'>•</span>
                <span className='dark:text-white'>
                    Created At:{" "}
                    <span className="font-bold text-black dark:text-white">
                        {formatDate(memo.createdAt, "yyyy/MM/dd HH:mm:ss")}
                    </span>
                </span>
            </div>

            <div className="w-full overflow-x-auto">
                <div
                    className="text-left text-gray-800 leading-relaxed prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: memo.content }}
                />
            </div>
        </div>
    )
}
