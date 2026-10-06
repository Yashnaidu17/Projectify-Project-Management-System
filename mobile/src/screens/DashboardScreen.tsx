import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  projectsInProgress: number;
}

const DashboardScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard');
      setStats(res.data);
    } catch (error) {
      console.log('Failed to fetch dashboard');
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  }, []);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={logout} style={{ marginRight: 15 }}>
          <Text style={{ color: '#ef4444', fontWeight: 'bold' }}>Logout</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome, {user?.fullName}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.card, { borderLeftColor: '#3b82f6', borderLeftWidth: 4 }]}>
          <Text style={styles.cardTitle}>Total Projects</Text>
          <Text style={styles.cardValue}>{stats?.totalProjects || 0}</Text>
        </View>
        <View style={[styles.card, { borderLeftColor: '#8b5cf6', borderLeftWidth: 4 }]}>
          <Text style={styles.cardTitle}>Projects In Progress</Text>
          <Text style={styles.cardValue}>{stats?.projectsInProgress || 0}</Text>
        </View>
        <View style={[styles.card, { borderLeftColor: '#6b7280', borderLeftWidth: 4 }]}>
          <Text style={styles.cardTitle}>Total Tasks</Text>
          <Text style={styles.cardValue}>{stats?.totalTasks || 0}</Text>
        </View>
        <View style={[styles.card, { borderLeftColor: '#f97316', borderLeftWidth: 4 }]}>
          <Text style={styles.cardTitle}>Pending Tasks</Text>
          <Text style={styles.cardValue}>{stats?.pendingTasks || 0}</Text>
        </View>
        <View style={[styles.card, { borderLeftColor: '#22c55e', borderLeftWidth: 4 }]}>
          <Text style={styles.cardTitle}>Completed Tasks</Text>
          <Text style={styles.cardValue}>{stats?.completedTasks || 0}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => navigation.navigate('Projects')}
      >
        <Text style={styles.actionButtonText}>View All Projects</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 15 },
  header: { marginBottom: 20 },
  welcome: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  statsContainer: { gap: 15 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardTitle: { fontSize: 16, color: '#4b5563', fontWeight: '500' },
  cardValue: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  actionButton: { backgroundColor: '#2563eb', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20, marginBottom: 40 },
  actionButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default DashboardScreen;
