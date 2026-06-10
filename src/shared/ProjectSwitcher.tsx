import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { useDeltaStore } from '../store/useDeltaStore';
import { useTheme } from './theme';

export default function ProjectSwitcher() {
  const t = useTheme();
  const {
    currentProjectId,
    projects,
    createProject,
    switchProject,
    renameProject,
    deleteProject,
    saveCurrentProject,
    saveProjectToBackend,
    listBackendProjects,
    loadProjectFromBackend,
  } = useDeltaStore();

  const [open, setOpen] = useState(false);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameText, setRenameText] = useState('');
  const [loadingBackend, setLoadingBackend] = useState(false);

  const projectList = Object.values(projects || {}).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
  const current = currentProjectId ? projects[currentProjectId] : null;
  const displayName = current?.name || 'No project';

  const handleCreate = () => {
    const id = createProject('New Remodel');
    saveCurrentProject();
    Alert.alert('Project created', 'Start in Design Studio — take a photo or load the example.');
    setOpen(false);
    return id;
  };

  const handleSwitch = (id: string) => {
    saveCurrentProject();
    switchProject(id);
    setOpen(false);
  };

  const handleRename = (id: string) => {
    if (!renameText.trim()) return;
    renameProject(id, renameText.trim());
    setRenameId(null);
    setRenameText('');
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete project?', `"${name}" and its design/sourcing/labor data will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteProject(id);
          if (Object.keys(useDeltaStore.getState().projects || {}).length === 0) {
            createProject('My First Project');
          }
        },
      },
    ]);
  };

  const handleSyncBackend = async () => {
    setLoadingBackend(true);
    try {
      saveCurrentProject();
      await saveProjectToBackend();
      const remote = await listBackendProjects();
      if (remote.length === 0) {
        Alert.alert('Cloud sync', 'Current project saved to backend. No other cloud projects yet.');
      } else {
        Alert.alert(
          'Cloud sync',
          `Saved. ${remote.length} project(s) on backend. Tap one below to load.`,
        );
      }
    } catch {
      Alert.alert('Sync failed', 'Is the backend running on port 4000?');
    } finally {
      setLoadingBackend(false);
    }
  };

  const handleLoadRemote = async (id: string, name: string) => {
    setLoadingBackend(true);
    try {
      await loadProjectFromBackend(id);
      Alert.alert('Loaded', `"${name}" loaded from backend.`);
      setOpen(false);
    } catch {
      Alert.alert('Load failed', 'Could not load project from backend.');
    } finally {
      setLoadingBackend(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={[styles.trigger, { backgroundColor: t.colors.surfaceAlt, borderColor: t.colors.border }]}
        accessibilityRole="button"
        accessibilityLabel="Switch project"
      >
        <Text style={[styles.triggerLabel, { color: t.colors.textMuted }]}>Project</Text>
        <Text style={[styles.triggerName, { color: t.colors.text }]} numberOfLines={1}>
          {displayName}
        </Text>
        <Text style={{ color: t.colors.textMuted, fontSize: 10 }}>▼</Text>
      </TouchableOpacity>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: t.colors.surface }]}>
            <Text style={[styles.sheetTitle, { color: t.colors.text }]}>Your Projects</Text>
            <Text style={[styles.sheetSub, { color: t.colors.textSecondary }]}>
              Switch, rename, or sync to the demo cloud backend.
            </Text>

            <ScrollView style={{ maxHeight: 320, marginVertical: 12 }}>
              {projectList.length === 0 ? (
                <Text style={{ color: t.colors.textMuted, padding: 12 }}>
                  No saved projects yet. Create one or load the Example in Design Studio.
                </Text>
              ) : (
                projectList.map((proj) => {
                  const isActive = proj.id === currentProjectId;
                  const hasDesign = !!proj.approvedDesign;
                  const itemCount = (proj.sourcingItems || []).length;
                  return (
                    <View
                      key={proj.id}
                      style={[
                        styles.projectRow,
                        {
                          borderColor: isActive ? t.colors.accent : t.colors.border,
                          backgroundColor: isActive ? t.colors.accentLight : t.colors.surfaceAlt,
                        },
                      ]}
                    >
                      {renameId === proj.id ? (
                        <View style={{ flex: 1, flexDirection: 'row', gap: 8 }}>
                          <TextInput
                            value={renameText}
                            onChangeText={setRenameText}
                            style={[styles.renameInput, { borderColor: t.colors.border, color: t.colors.text }]}
                            autoFocus
                            placeholder="Project name"
                            placeholderTextColor={t.colors.textMuted}
                          />
                          <TouchableOpacity onPress={() => handleRename(proj.id)}>
                            <Text style={{ color: t.colors.accent, fontWeight: '700' }}>Save</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity style={{ flex: 1 }} onPress={() => handleSwitch(proj.id)}>
                          <Text style={[styles.projName, { color: t.colors.text }]}>
                            {proj.name} {isActive ? '• active' : ''}
                          </Text>
                          <Text style={{ fontSize: 12, color: t.colors.textSecondary, marginTop: 2 }}>
                            {hasDesign ? '✓ design' : 'no design'} • {itemCount} sourcing items •{' '}
                            {(proj.laborTasks || []).length} labor tasks
                          </Text>
                        </TouchableOpacity>
                      )}
                      {renameId !== proj.id && (
                        <View style={styles.rowActions}>
                          <TouchableOpacity
                            onPress={() => {
                              setRenameId(proj.id);
                              setRenameText(proj.name);
                            }}
                          >
                            <Text style={{ color: t.colors.textSecondary, fontSize: 12 }}>Rename</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleDelete(proj.id, proj.name)}>
                            <Text style={{ color: '#c62828', fontSize: 12, marginLeft: 10 }}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                })
              )}
            </ScrollView>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: t.colors.accent }]}
              onPress={handleCreate}
            >
              <Text style={styles.actionBtnText}>+ New Project</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: t.colors.dark || '#111', marginTop: 8 }]}
              onPress={handleSyncBackend}
              disabled={loadingBackend}
            >
              <Text style={styles.actionBtnText}>
                {loadingBackend ? 'Syncing…' : '☁️ Save to Cloud (backend)'}
              </Text>
            </TouchableOpacity>

            <BackendProjectList
              onLoad={handleLoadRemote}
              loading={loadingBackend}
              listBackendProjects={listBackendProjects}
              theme={t}
            />

            <TouchableOpacity onPress={() => setOpen(false)} style={{ marginTop: 16, alignItems: 'center' }}>
              <Text style={{ color: t.colors.textSecondary }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

function BackendProjectList({
  onLoad,
  loading,
  listBackendProjects,
  theme: t,
}: {
  onLoad: (id: string, name: string) => void;
  loading: boolean;
  listBackendProjects: () => Promise<any[]>;
  theme: ReturnType<typeof useTheme>;
}) {
  const [remote, setRemote] = React.useState<any[]>([]);
  const [fetched, setFetched] = React.useState(false);

  const refresh = async () => {
    const list = await listBackendProjects();
    setRemote(list);
    setFetched(true);
  };

  if (!fetched) {
    return (
      <TouchableOpacity onPress={refresh} style={{ marginTop: 10, alignItems: 'center' }}>
        <Text style={{ color: t.colors.textSecondary, fontSize: 13 }}>Show cloud projects…</Text>
      </TouchableOpacity>
    );
  }

  if (remote.length === 0) {
    return (
      <Text style={{ color: t.colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: 8 }}>
        No cloud projects on backend yet.
      </Text>
    );
  }

  return (
    <View style={{ marginTop: 10 }}>
      <Text style={{ fontSize: 12, fontWeight: '600', color: t.colors.textSecondary, marginBottom: 6 }}>
        Cloud projects
      </Text>
      {remote.map((p: any) => (
        <TouchableOpacity
          key={p.id}
          onPress={() => !loading && onLoad(p.id, p.name)}
          style={[styles.projectRow, { borderColor: t.colors.border, backgroundColor: t.colors.surfaceAlt }]}
        >
          <Text style={{ color: t.colors.text, fontWeight: '600' }}>{p.name}</Text>
          <Text style={{ fontSize: 11, color: t.colors.textMuted }}>Tap to load from backend</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    maxWidth: 220,
    gap: 6,
  },
  triggerLabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  triggerName: { fontSize: 14, fontWeight: '700', flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
    maxHeight: '85%',
  },
  sheetTitle: { fontSize: 22, fontWeight: '700' },
  sheetSub: { fontSize: 14, marginTop: 4 },
  projectRow: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  projName: { fontSize: 15, fontWeight: '600' },
  rowActions: { flexDirection: 'row', alignItems: 'center' },
  renameInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
  },
  actionBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});