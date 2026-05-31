import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx';
import Button from '../components/ui/button.jsx';
import Badge from '../components/ui/badge.jsx';
import { machines, workspaces, auth } from '../api.js';

function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [machineList, setMachineList] = useState([]);
  const [workspaceMap, setWorkspaceMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [me, machineData] = await Promise.all([
          auth.me(),
          machines.list(),
        ]);
        setUser(me);
        setMachineList(machineData);

        const wsMap = {};
        await Promise.all(
          machineData.map(async (m) => {
            try {
              const ws = await workspaces.list(m.id);
              wsMap[m.id] = ws;
            } catch {
              wsMap[m.id] = [];
            }
          })
        );
        setWorkspaceMap(wsMap);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function handleLogout() {
    auth.logout();
    navigate('/login');
  }

  // Mock data for demo when API is unavailable
  const isMock = error && !loading;

  const displayMachines = isMock
    ? [
        { id: 1, name: 'dev-box-1', status: 'online', ip: '10.0.1.42' },
        { id: 2, name: 'gpu-worker-2', status: 'online', ip: '10.0.1.84' },
        { id: 3, name: 'build-agent-3', status: 'offline', ip: '10.0.1.13' },
      ]
    : machineList;

  const mockWorkspaces = {
    1: [
      { id: 1, name: 'backend-api', status: 'running', sessions: 3 },
      { id: 2, name: 'frontend-app', status: 'running', sessions: 1 },
    ],
    2: [
      { id: 3, name: 'ml-training', status: 'running', sessions: 2 },
    ],
    3: [
      { id: 4, name: 'ci-runner', status: 'stopped', sessions: 0 },
    ],
  };

  const displayWorkspaces = isMock ? mockWorkspaces : workspaceMap;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back{user ? `, ${user.name || user.email}` : ''}
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
          </svg>
          Sign out
        </Button>
      </div>

      {error && !isMock ? (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {isMock && (
        <div className="rounded-md bg-amber-50 dark:bg-amber-950/20 p-4 text-sm text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
          Showing demo data — API server not available. Set <code className="font-mono text-xs bg-amber-100 dark:bg-amber-900/40 px-1 py-0.5 rounded">VITE_API_URL</code> to point to your CoVibe server.
        </div>
      )}

      {/* Machines Grid */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Machines</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayMachines.map((machine) => {
            const wsList = displayWorkspaces[machine.id] || [];
            const isOnline = machine.status === 'online';

            return (
              <Card
                key={machine.id}
                className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
                onClick={() => navigate(`/workspace/${machine.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{machine.name}</CardTitle>
                    <Badge variant={isOnline ? 'success' : 'secondary'}>
                      <span className={`mr-1 inline-block h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                      {isOnline ? 'Online' : 'Offline'}
                    </Badge>
                  </div>
                  {machine.ip && (
                    <CardDescription>{machine.ip}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                    </svg>
                    <span>{wsList.length} workspace{wsList.length !== 1 ? 's' : ''}</span>
                    <span className="text-border">|</span>
                    <span>{wsList.reduce((sum, w) => sum + (w.sessions || 0), 0)} active sessions</span>
                  </div>

                  {wsList.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {wsList.slice(0, 3).map((ws) => (
                        <div
                          key={ws.id}
                          className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-1.5 text-sm"
                        >
                          <span className="font-medium">{ws.name}</span>
                          <Badge variant={ws.status === 'running' ? 'success' : ws.status === 'stopped' ? 'secondary' : 'warning'}>
                            {ws.status}
                          </Badge>
                        </div>
                      ))}
                      {wsList.length > 3 && (
                        <p className="text-xs text-muted-foreground text-center">
                          +{wsList.length - 3} more workspace{wsList.length - 3 !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Quick Stats */}
      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Machines</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{displayMachines.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Online</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {displayMachines.filter((m) => m.status === 'online').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Workspaces</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {Object.values(displayWorkspaces).reduce((sum, arr) => sum + arr.length, 0)}
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export default DashboardPage;