import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import { Plus, ArrowLeft, MoreVertical, Trash2 } from 'lucide-react';

interface Task {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  tasks: Task[];
}

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ name: '', description: '', priority: 'MEDIUM', status: 'PENDING' });

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
    } catch (error) {
      console.error('Failed to fetch project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tasks', { ...newTask, projectId: id });
      setIsTaskModalOpen(false);
      setNewTask({ name: '', description: '', priority: 'MEDIUM', status: 'PENDING' });
      fetchProjectDetails();
    } catch (error) {
      console.error('Failed to create task');
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      fetchProjectDetails();
    } catch (error) {
      console.error('Failed to update task');
    }
  };
  
  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchProjectDetails();
    } catch (error) {
      console.error('Failed to delete task');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-pulse flex flex-col items-center"><div className="h-8 w-8 bg-blue-400 rounded-full mb-4"></div><div className="text-gray-500">Loading project details...</div></div></div>;
  }

  if (!project) return <div>Project not found</div>;

  const priorityColors: Record<string, string> = { LOW: 'bg-green-100 text-green-800', MEDIUM: 'bg-yellow-100 text-yellow-800', HIGH: 'bg-red-100 text-red-800' };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <Link to="/projects" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Projects
        </Link>
      </div>
      
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="mt-1 text-sm text-gray-500">{project.description}</p>
          </div>
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Add Task
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['PENDING', 'IN_PROGRESS', 'COMPLETED'].map((statusColumn) => (
          <div key={statusColumn} className="bg-gray-100 p-4 rounded-xl">
            <h3 className="font-semibold text-gray-700 mb-4">{statusColumn.replace('_', ' ')}</h3>
            <div className="space-y-4">
              {project.tasks.filter(t => t.status === statusColumn).map(task => (
                <div key={task.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{task.name}</h4>
                    <button onClick={() => handleDeleteTask(task.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{task.description}</p>
                  <div className="flex justify-between items-center text-xs">
                    <span className={`px-2 py-1 rounded-full font-medium ${priorityColors[task.priority]}`}>{task.priority}</span>
                    <select 
                      className="border-none bg-gray-50 rounded text-gray-700 text-xs py-1"
                      value={task.status}
                      onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Task Creation Modal */}
      {isTaskModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsTaskModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Create New Task</h3>
              <form onSubmit={handleCreateTask} className="mt-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Task Name</label>
                  <input type="text" required value={newTask.name} onChange={(e) => setNewTask({ ...newTask, name: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea rows={3} value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">Create Task</button>
                  <button type="button" onClick={() => setIsTaskModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
