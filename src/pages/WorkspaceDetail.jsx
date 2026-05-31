import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx';
import Button from '../components/ui/button.jsx';
import Badge from '../components/ui/badge.jsx';
import { machines, workspaces, sessions } from '../api.js';

const statusColors = {
  running: 'success',
  stopped: 'secondary',
  error: 'destructive',
  pending: 'warning',
};

function WorkspaceDetailPage() {
  const { machineId } = useParams();
  const navigate = useNavigate();
  const [machine, setMachine] = useState(null);
  const [workspaceList, setWorkspaceList] = useState([]);
  const [sessionMap, setSessionMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedWs, setExpandedWs] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [m, ws] = await Promise.all([
          machines.get(machineId),
          workspaces.list(machineId),
        ]);
        setMachine(m);
        setWorkspaceList(ws);

        const sessMap = {};
        await Promise.all(
          ws.map(async (w) => {
            try {
              const s = await sessions.list(w.id);
              sessMap[w.id] = s;
            } catch {
              sessMap[w.id] = [];
            }
          })
        );
        setSessionMap(sessMap);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [machineId]);

  // Mock data fallback
  const isMock = error && !loading;
  const displayMachine = isMock
    ? { id: machineId, name: `Machine ${machineId}`, status: 'online', ip: '10.0.1.42', specs: '8 vCPU, 32 GB RAM, 256 GB SSD' }
    : machine;

  const mockWorkspaces = [
    { id: 1, name: 'backend-api', status: 'running', type: 'development', image: 'ubuntu:22.04' },
    { id: 2, name: 'frontend-app', status: 'running', type: 'development', image: 'node:20' },
    { id: 3, name: 'ml-training', status: 'stopped', type: 'training', image: 'nvidia/cuda:12.1' },
  ];

  const displayWorkspaces = isMock ? mockWorkspaces : workspaceList;

  const mockSessions = {
    1: [
      { id: 101, user: 'alice@covibe.ai', started_at: '2025-06-01T10:00:00Z', status: 'active', duration: '2h 15m' },
      { id: 102, user: 'bob@covibe.ai', started_at: '2025-06-01T11:30:00Z', status: 'active', duration: '45m' },
    ],
    2: [
      { id: 103, user: 'alice@covibe.ai', started_at: '2025-06-01T09:00:00Z', status: 'active', duration: '3h 15m' },
    ],
    3: [],
  };

  const displaySessions = isMock ? mockSessions : sessionMap;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading workspace details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" className="mb-2 -ml-2" onClick={() => navigate('/')}>
        <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
        Back to Dashboard
      </Button>

      {/* Machine info */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {displayMachine?.name || `Machine ${machineId}`}
          </h1>
          <p className="text-muted-foreground mt-1">
            {displayMachine?.ip && `${displayMachine.ip} — `}
            {displayMachine?.specs || 'Machine details'}
          </p>
        </div>
        <Badge variant={displayMachine?.status === 'online' ? 'success' : 'secondary'} className="text-sm px-3 py-1">
          <span className={`mr-1.5 inline-block h-2 w-2 rounded-full ${displayMachine?.status === 'online' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
          {displayMachine?.status || 'Unknown'}
        </Badge>
      </div>

      {error && !isMock ? (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
      ) : null}

      {isMock && (
        <div className="rounded-md bg-amber-50 dark:bg-amber-950/20 p-4 text-sm text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
          Showing demo data — API server not available.
        </div>
      )}

      {/* Workspaces */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Workspaces ({displayWorkspaces.length})</h2>
        <div className="space-y-4">
          {displayWorkspaces.map((ws) => {
            const sessList = displaySessions[ws.id] || [];
            const isExpanded = expandedWs === ws.id;

            return (
              <Card key={ws.id}>
                <CardHeader
                  className="cursor-pointer select-none"
                  onClick={() => setExpandedWs(isExpanded ? null : ws.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <svg
                        className={`h-5 w-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                      </svg>
                      <div>
                        <CardTitle className="text-lg">{ws.name}</CardTitle>
                        <CardDescription>
                          {ws.type && `${ws.type} — `}
                          {ws.image && `Image: ${ws.image}`}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={statusColors[ws.status] || 'default'}>
                      {ws.status}
                    </Badge>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent>
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium">Active Sessions ({sessList.length})</h4>
                      </div>

                      {sessList.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center border rounded-md border-dashed">
                          No active sessions for this workspace
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {sessList.map((sess) => (
                            <div
                              key={sess.id}
                              className="flex items-center justify-between rounded-md border px-4 py-2.5 text-sm"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                  {sess.user?.charAt(0).toUpperCase() || '?'}
                                </div>
                                <div>
                                  <p className="font-medium">{sess.user || 'Unknown user'}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Started {sess.started_at ? new Date(sess.started_at).toLocaleString() : 'N/A'}
                                    {sess.duration && ` — ${sess.duration}`}
                                  </p>
                                </div>
                              </div>
                              <Badge variant={sess.status === 'active' ? 'success' : 'secondary'}>
                                {sess.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default WorkspaceDetailPage;