import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import type { MyWorkItem } from '../../types';

interface AddTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddTask: (task: Omit<MyWorkItem, 'id' | 'status' | 'loggedTimeSeconds' | 'trackingStartTime' | 'type'> & {type: 'ad_hoc'}) => void;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onAddTask }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [dueDate, setDueDate] = useState('');

    const handleSubmit = () => {
        if (!title) return;
        onAddTask({
            title,
            description,
            type: 'ad_hoc',
            priority,
            dueDate: dueDate || undefined,
        });
        // Reset form
        setTitle('');
        setDescription('');
        setPriority('medium');
        setDueDate('');
        onClose();
    };

    const inputClasses = "block w-full text-sm border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md dark:bg-gray-700 dark:border-gray-600";

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Log New Ad-hoc Work"
            footer={
                <>
                    <button onClick={onClose} className="px-4 py-2 border rounded-md">Cancel</button>
                    <button onClick={handleSubmit} className="px-4 py-2 rounded-md text-white bg-primary-600">Add Task</button>
                </>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium">Task Title</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} className={inputClasses} required autoFocus />
                </div>
                <div>
                    <label className="text-sm font-medium">Description</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className={inputClasses}></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-sm font-medium">Priority</label>
                        <select value={priority} onChange={e => setPriority(e.target.value as any)} className={inputClasses}>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Due Date (Optional)</label>
                        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={inputClasses} />
                    </div>
                </div>
            </div>
        </Modal>
    );
};