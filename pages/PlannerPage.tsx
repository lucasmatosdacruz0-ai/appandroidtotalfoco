import React, { useState, useEffect } from 'react';
import { CustomWorkoutPlan, WeeklySchedule, DayOfWeek } from '../types.ts';
import { getCustomWorkouts, saveCustomWorkouts, getWeeklySchedule, saveWeeklySchedule } from '../services/storageService.ts';
import { PlusCircleIcon, EditIcon, Trash2Icon } from '../components/icons.tsx';
import CustomWorkoutModal from '../components/CustomWorkoutModal.tsx';
import CalendarView from '../components/CalendarView.tsx';
import Spinner from '../components/Spinner.tsx';

const weekDays: { key: DayOfWeek; label: string }[] = [
    { key: 'monday', label: 'Segunda' },
    { key: 'tuesday', label: 'Terça' },
    { key: 'wednesday', label: 'Quarta' },
    { key: 'thursday', label: 'Quinta' },
    { key: 'friday', label: 'Sexta' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' },
];

const PlannerPage: React.FC = () => {
    const [customWorkouts, setCustomWorkouts] = useState<CustomWorkoutPlan[]>([]);
    const [schedule, setSchedule] = useState<WeeklySchedule>({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<CustomWorkoutPlan | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const [workouts, savedSchedule] = await Promise.all([
                getCustomWorkouts(),
                getWeeklySchedule()
            ]);
            setCustomWorkouts(workouts);
            setSchedule(savedSchedule);
            setIsLoading(false);
        };
        loadData();
    }, []);

    const handleSavePlan = async (plan: CustomWorkoutPlan) => {
        let updatedWorkouts;
        if (editingPlan) {
            updatedWorkouts = customWorkouts.map(p => p.id === plan.id ? plan : p);
        } else {
            updatedWorkouts = [...customWorkouts, plan];
        }
        setCustomWorkouts(updatedWorkouts);
        await saveCustomWorkouts(updatedWorkouts);
        setIsModalOpen(false);
        setEditingPlan(null);
    };

    const handleDeletePlan = async (planId: string) => {
        if (window.confirm("Tem certeza que deseja excluir este plano? Ele será removido da sua agenda.")) {
            const updatedWorkouts = customWorkouts.filter(p => p.id !== planId);
            setCustomWorkouts(updatedWorkouts);
            await saveCustomWorkouts(updatedWorkouts);

            const updatedSchedule = { ...schedule };
            let scheduleChanged = false;
            Object.keys(updatedSchedule).forEach(day => {
                if (updatedSchedule[day] === planId) {
                    updatedSchedule[day] = undefined;
                    scheduleChanged = true;
                }
            });
            if(scheduleChanged) {
                setSchedule(updatedSchedule);
                await saveWeeklySchedule(updatedSchedule);
            }
        }
    };
    
    const handleAssignPlan = async (day: DayOfWeek, planId: string) => {
        const updatedSchedule = { ...schedule, [day]: planId || undefined };
        setSchedule(updatedSchedule);
        await saveWeeklySchedule(updatedSchedule);
    };

    const openModalToCreate = () => {
        setEditingPlan(null);
        setIsModalOpen(true);
    };
    
    const openModalToEdit = (plan: CustomWorkoutPlan) => {
        setEditingPlan(plan);
        setIsModalOpen(true);
    };

    if(isLoading) {
        return (
            <div className="flex justify-center items-center p-8">
                <Spinner />
            </div>
        )
    }

    return (
        <div className="animate-fade-in space-y-8">
            {isModalOpen && (
                <CustomWorkoutModal
                    plan={editingPlan}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSavePlan}
                />
            )}

            <div className="bg-gray-800 p-6 rounded-2xl shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Meus Planos de Treino</h2>
                    <button 
                        onClick={openModalToCreate}
                        className="flex items-center gap-2 bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        <PlusCircleIcon className="w-5 h-5"/>
                        Criar Plano
                    </button>
                </div>
                <div className="space-y-3">
                    {customWorkouts.length > 0 ? customWorkouts.map(plan => (
                        <div key={plan.id} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="font-bold text-gray-900 dark:text-gray-100">{plan.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{plan.exercises.length} exercícios</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => openModalToEdit(plan)} className="p-2 text-gray-500 hover:text-blue-500 dark:hover:text-blue-400">
                                    <EditIcon className="w-5 h-5"/>
                                </button>
                                <button onClick={() => handleDeletePlan(plan.id)} className="p-2 text-gray-500 hover:text-red-500 dark:hover:text-red-400">
                                    <Trash2Icon className="w-5 h-5"/>
                                </button>
                            </div>
                        </div>
                    )) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-4">Você ainda não criou nenhum plano. Clique em "Criar Plano" para começar!</p>
                    )}
                </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Agenda Semanal</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {weekDays.map(({key, label}) => (
                        <div key={key} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                            <label htmlFor={`select-${key}`} className="font-bold text-lg text-gray-900 dark:text-gray-100">{label}</label>
                            <select 
                                id={`select-${key}`}
                                value={schedule[key] || ''}
                                onChange={(e) => handleAssignPlan(key, e.target.value)}
                                disabled={customWorkouts.length === 0}
                                className="mt-2 w-full p-2 bg-gray-800 border border-gray-500 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                            >
                                <option value="">Nenhum treino</option>
                                {customWorkouts.map(plan => (
                                    <option key={plan.id} value={plan.id}>{plan.name}</option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Seu Calendário</h2>
                <CalendarView schedule={schedule} customWorkouts={customWorkouts} />
            </div>
        </div>
    );
};

export default PlannerPage;