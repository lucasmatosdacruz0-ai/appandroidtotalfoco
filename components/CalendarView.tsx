import React, { useState } from 'react';
import { WeeklySchedule, CustomWorkoutPlan, DayOfWeek } from '../types.ts';
import { ChevronLeftIcon, ChevronRightIcon } from './icons.tsx';

interface CalendarViewProps {
    schedule: WeeklySchedule;
    customWorkouts: CustomWorkoutPlan[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ schedule, customWorkouts }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    // Changed state to track individual cells by a unique key (date string)
    const [expandedCells, setExpandedCells] = useState<Set<string>>(new Set());

    const toggleCellExpansion = (cellKey: string) => {
        setExpandedCells(prev => {
            const newSet = new Set(prev);
            if (newSet.has(cellKey)) {
                newSet.delete(cellKey);
            } else {
                newSet.add(cellKey);
            }
            return newSet;
        });
    };

    const changeMonth = (offset: number) => {
        setCurrentDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
        setExpandedCells(new Set()); // Reset expansion on month change
    };

    const renderHeader = () => {
        const dateFormat = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' });
        return (
            <div className="flex justify-between items-center py-2 px-1">
                <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <div className="text-xl font-bold capitalize">
                    {dateFormat.format(currentDate)}
                </div>
                <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <ChevronRightIcon className="w-6 h-6" />
                </button>
            </div>
        );
    };

    const renderDays = () => {
        const days = [];
        const dateFormat = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' });
        for (let i = 1; i <= 7; i++) { // Start from Monday
            const day = new Date(2024, 0, i);
            days.push(
                <div className="text-center font-semibold text-sm text-gray-500 dark:text-gray-400" key={i}>
                    {dateFormat.format(day).slice(0, 3)}
                </div>
            );
        }
        return <div className="grid grid-cols-7 mt-4">{days}</div>;
    };

    const renderCells = () => {
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const startDate = new Date(monthStart);
        const dayOfWeekOfFirstDay = startDate.getDay(); // 0 = Sunday, 1 = Monday
        startDate.setDate(startDate.getDate() - (dayOfWeekOfFirstDay === 0 ? 6 : dayOfWeekOfFirstDay - 1));

        const rows = [];
        let day = new Date(startDate); // Use a new Date object to avoid mutation issues

        const today = new Date();
        const isToday = (d: Date) => 
            d.getDate() === today.getDate() && 
            d.getMonth() === today.getMonth() && 
            d.getFullYear() === today.getFullYear();

        // Always render 6 rows for a consistent calendar layout
        for (let r = 0; r < 6; r++) {
            let days = [];
            for (let i = 0; i < 7; i++) {
                const formattedDate = String(day.getDate());
                const cellKey = day.toISOString().split('T')[0];

                const dayOfWeekIndex = day.getDay();
                const dayOfWeekName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayOfWeekIndex] as DayOfWeek;
                
                const planId = schedule[dayOfWeekName];
                const plan = planId ? customWorkouts.find(p => p.id === planId) : null;
                const isCurrentMonth = day.getMonth() === monthStart.getMonth();
                const isCellExpanded = expandedCells.has(cellKey);

                days.push(
                    <div
                        className={`p-2 border-t border-l border-gray-200 dark:border-gray-700 flex flex-col ${!isCurrentMonth ? 'bg-gray-800/50' : 'bg-gray-800'}`}
                        style={{minHeight: '8rem'}}
                        key={cellKey}
                    >
                        <span className={`font-semibold text-sm self-start ${isCurrentMonth ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'} ${isToday(day) ? 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>
                            {formattedDate}
                        </span>
                        {plan && isCurrentMonth ? (
                             <div className="mt-1 text-xs flex-grow flex flex-col justify-between overflow-hidden">
                                <div>
                                    <p className="font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/70 dark:text-blue-200 p-1 rounded overflow-hidden text-ellipsis whitespace-nowrap">{plan.name}</p>
                                    
                                    <div className={`mt-1 overflow-hidden transition-all ease-in-out duration-300 ${isCellExpanded ? 'max-h-48' : 'max-h-5'}`}>
                                        {/* Always render the list for smooth animation */}
                                        <ul className="space-y-0.5">
                                            {plan.exercises.length > 0 ? plan.exercises.map(ex => (
                                                <li key={ex.id} className="text-gray-600 dark:text-gray-400 whitespace-nowrap text-ellipsis overflow-hidden">
                                                    {ex.name}
                                                </li>
                                            )) : <p className="text-gray-500 dark:text-gray-500 italic">Plano vazio</p>}
                                        </ul>
                                    </div>
                                </div>
                                
                                {plan.exercises.length > 1 && (
                                    <button 
                                        onClick={() => toggleCellExpansion(cellKey)}
                                        className="text-blue-600 dark:text-blue-400 font-semibold mt-1 text-xs self-start"
                                    >
                                        {isCellExpanded ? 'Ver menos' : `Ver mais`}
                                    </button>
                                )}
                             </div>
                        ) : (
                            <div className="flex-grow"></div>
                        )}
                    </div>
                );
                day.setDate(day.getDate() + 1);
            }
            rows.push(
                <div className="grid grid-cols-7" key={r}>{days}</div>
            );
        }

        return <div className="border-r border-b border-gray-200 dark:border-gray-700">{rows}</div>;
    };


    return (
        <div className="calendar">
            {renderHeader()}
            {renderDays()}
            {renderCells()}
        </div>
    );
};

export default CalendarView;