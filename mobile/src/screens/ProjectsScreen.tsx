import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, TextInput, Modal, Button } from 'react-native';
import api from '../lib/api';

const ProjectsScreen = ({ navigation }: any) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });

  const fetchProjects = async () => {
    try {
      const res = await api.get(`/projects${search ? `?name=${search}` : ''}`);
      setProjects(res.data);
    } catch (error) {
      console.log('Failed to fetch projects');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [search]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProjects();
    setRefreshing(false);
  }, []);

  const handleCreate = async () => {
    try {
      await api.post('/projects', newProject);
      setModalVisible(false);
      setNewProject({ name: '', description: '' });
      fetchProjects();
    } catch (error) {
      console.log('Failed to create project');
    }
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => setModalVisible(true)} style={{ marginRight: 15 }}>
          <Text style={{ color: '#2563eb', fontWeight: 'bold', fontSize: 24 }}>+</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const renderItem = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.projectCard}
      onPress={() => navigation.navigate('ProjectDetails', { id: item.id, name: item.name })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.projectName}>{item.name}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status.replace('_', ' ')}</Text>
        </View>
      </View>
      <Text style={styles.projectDesc} numberOfLines={2}>{item.description}</Text>
      <Text style={styles.taskCount}>{item._count.tasks} Tasks</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search projects..."
        value={search}
        onChangeText={setSearch}
      />
      
      <FlatList
        data={projects}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>No projects found.</Text>}
      />

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Create New Project</Text>
          <TextInput
            style={styles.input}
            placeholder="Project Name"
            value={newProject.name}
            onChangeText={(text) => setNewProject({ ...newProject, name: text })}
          />
          <TextInput
            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
            placeholder="Description"
            multiline
            value={newProject.description}
            onChangeText={(text) => setNewProject({ ...newProject, description: text })}
          />
          <TouchableOpacity style={styles.button} onPress={handleCreate}>
            <Text style={styles.buttonText}>Create Project</Text>
          </TouchableOpacity>
          <Button title="Cancel" color="#ef4444" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  searchInput: { backgroundColor: '#fff', margin: 15, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  list: { padding: 15, paddingTop: 0 },
  projectCard: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2, borderWidth: 1, borderColor: '#f3f4f6' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  projectName: { fontSize: 18, fontWeight: 'bold', color: '#111827', flex: 1 },
  statusBadge: { backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: 'bold', color: '#4b5563' },
  projectDesc: { color: '#6b7280', fontSize: 14, marginBottom: 10 },
  taskCount: { color: '#9ca3af', fontSize: 12, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#6b7280' },
  modalContainer: { flex: 1, padding: 20, paddingTop: 50, backgroundColor: '#fff' },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { backgroundColor: '#f9fafb', padding: 15, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#d1d5db' },
  button: { backgroundColor: '#2563eb', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default ProjectsScreen;
