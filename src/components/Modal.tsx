import { X } from 'lucide-react';
import React, { ReactNode } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    width?: string;
    height?: string;
	className?: string
}

const Modal: React.FC<ModalProps> = ({
	isOpen,
	onClose,
	children,
	className,
}) => {
  	if (!isOpen) {
		return null;
	}

	return (
		<div
			className="fixed inset-0 flex items-center justify-center bg-black/80 bg-opacity-30 backdrop-blur-sm z-300"
			style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
			onClick={onClose}
		>
			<div className='relative'>
				<span className='absolute right-2 top-2 hover:cursor-pointer hover:bg-gray-100' onClick={onClose}>
					<X/>
				</span>
				<div className={`bg-white rounded-lg shadow-lg p-6 pt-4 ${className}`} onClick={(e) => e.stopPropagation()}>
					{children}
				</div>
			</div>

		</div>
	);
};

export default Modal;
