import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { 
  FolderKanban, 
  CheckCircle2, 
  Clock, 
  ListTodo,
  Activity
} from 'lucide-react';

interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  projectsInProgress: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard');
        setStats(res.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-pulse flex flex-col items-center"><div className="h-8 w-8 bg-blue-400 rounded-full mb-4"></div><div className="text-gray-500">Loading dashboard...</div></div></div>;
  }

  const statCards = [
    { name: 'Total Projects', value: stats?.totalProjects || 0, icon: <FolderKanban className="text-blue-500" size={24} />, bg: 'bg-blue-50' },
    { name: 'Projects In Progress', value: stats?.projectsInProgress || 0, icon: <Activity className="text-purple-500" size={24} />, bg: 'bg-purple-50' },
    { name: 'Total Tasks', value: stats?.totalTasks || 0, icon: <ListTodo className="text-gray-500" size={24} />, bg: 'bg-gray-50' },
    { name: 'Pending Tasks', value: stats?.pendingTasks || 0, icon: <Clock className="text-orange-500" size={24} />, bg: 'bg-orange-50' },
    { name: 'Completed Tasks', value: stats?.completedTasks || 0, icon: <CheckCircle2 className="text-green-500" size={24} />, bg: 'bg-green-50' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((item) => (
          <div key={item.name} className="bg-white overflow-hidden shadow rounded-xl border border-gray-100 transition-all hover:shadow-md">
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-md ${item.bg}`}>
                  {item.icon}
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
                    <dd className="text-3xl font-semibold text-gray-900">{item.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
