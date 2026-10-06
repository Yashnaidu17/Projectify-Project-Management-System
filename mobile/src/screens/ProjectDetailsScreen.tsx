import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Modal, TextInput, Button, Alert } from 'react-native';
import api from '../lib/api';

const ProjectDetailsScreen = ({ route, navigation }: any) => {
  const { id, name } = route.params;
  const [project, setProject] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTask, setNewTask] = useState({ name: '', description: '', priority: 'MEDIUM', status: 'PENDING' });

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: name,
      headerRight: () => (
        <TouchableOpacity onPress={() => setModalVisible(true)} style={{ marginRight: 15 }}>
          <Text style={{ color: '#2563eb', fontWeight: 'bold', fontSize: 24 }}>+</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, name]);

  const fetchProjectDetails = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
    } catch (error) {
      console.log('Failed to fetch project details');
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProjectDetails();
    setRefreshing(false);
  }, []);

  const handleCreateTask = async () => {
    try {
      await api.post('/tasks', { ...newTask, projectId: id });
      setModalVisible(false);
      setNewTask({ name: '', description: '', priority: 'MEDIUM', status: 'PENDING' });
      fetchProjectDetails();
    } catch (error) {
      Alert.alert('Error', 'Failed to create task');
    }
  };

  const handleUpdateStatus = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'PENDING' ? 'IN_PROGRESS' : currentStatus === 'IN_PROGRESS' ? 'COMPLETED' : 'PENDING';
    try {
      await api.put(`/tasks/${taskId}`, { status: nextStatus });
      fetchProjectDetails();
    } catch (error) {
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchProjectDetails();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete task');
    }
  };

  const renderTask = ({ item }: any) => {
    const priorityColor = item.priority === 'HIGH' ? '#ef4444' : item.priority === 'MEDIUM' ? '#f59e0b' : '#10b981';
    
    return (
      <View style={styles.taskCard}>
        <View style={styles.taskHeader}>
          <Text style={styles.taskName}>{item.name}</Text>
          <TouchableOpacity onPress={() => handleDeleteTask(item.id)}>
            <Text style={{ color: '#ef4444' }}>Delete</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.taskDesc}>{item.description}</Text>
        <View style={styles.taskFooter}>
          <Text style={[styles.priorityBadge, { color: priorityColor, borderColor: priorityColor }]}>
            {item.priority}
          </Text>
          <TouchableOpacity 
            style={[styles.statusButton, item.status === 'COMPLETED' ? styles.statusCompleted : null]}
            onPress={() => handleUpdateStatus(item.id, item.status)}
          >
            <Text style={[styles.statusText, item.status === 'COMPLETED' ? { color: '#fff' } : null]}>
              {item.status.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {project && (
        <View style={styles.projectInfo}>
          <Text style={styles.projectDesc}>{project.description}</Text>
        </View>
      )}

      <FlatList
        data={project?.tasks || []}
        renderItem={renderTask}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>No tasks found.</Text>}
      />

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Create New Task</Text>
          <TextInput
            style={styles.input}
            placeholder="Task Name"
            value={newTask.name}
            onChangeText={(text) => setNewTask({ ...newTask, name: text })}
          />
          <TextInput
            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
            placeholder="Description"
            multiline
            value={newTask.description}
            onChangeText={(text) => setNewTask({ ...newTask, description: text })}
          />
          <View style={styles.prioritySelector}>
            {['LOW', 'MEDIUM', 'HIGH'].map(p => (
              <TouchableOpacity 
                key={p} 
                style={[styles.pOption, newTask.priority === p ? styles.pSelected : null]}
                onPress={() => setNewTask({ ...newTask, priority: p })}
              >
                <Text style={newTask.priority === p ? { color: '#fff', fontWeight: 'bold' } : {}}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.button} onPress={handleCreateTask}>
            <Text style={styles.buttonText}>Create Task</Text>
          </TouchableOpacity>
          <Button title="Cancel" color="#ef4444" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  projectInfo: { padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e5e7eb' },
  projectDesc: { color: '#4b5563', fontSize: 16 },
  list: { padding: 15 },
  taskCard: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2, borderWidth: 1, borderColor: '#f3f4f6' },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  taskName: { fontSize: 16, fontWeight: 'bold', color: '#111827', flex: 1 },
  taskDesc: { color: '#6b7280', fontSize: 14, marginBottom: 15 },
  taskFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priorityBadge: { fontSize: 10, fontWeight: 'bold', borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  statusButton: { backgroundColor: '#e5e7eb', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15 },
  statusCompleted: { backgroundColor: '#10b981' },
  statusText: { fontSize: 12, fontWeight: 'bold', color: '#4b5563' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#6b7280' },
  modalContainer: { flex: 1, padding: 20, paddingTop: 50, backgroundColor: '#fff' },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { backgroundColor: '#f9fafb', padding: 15, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#d1d5db' },
  button: { backgroundColor: '#2563eb', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  prioritySelector: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  pOption: { flex: 1, padding: 10, borderWidth: 1, borderColor: '#d1d5db', alignItems: 'center', marginHorizontal: 5, borderRadius: 8 },
  pSelected: { backgroundColor: '#2563eb', borderColor: '#2563eb' }
});

export default ProjectDetailsScreen;
