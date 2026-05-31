import { useState, useEffect } from 'react';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx';
import Button from '../components/ui/button.jsx';
import Input from '../components/ui/input.jsx';
import Badge from '../components/ui/badge.jsx';
import Dialog, { DialogClose } from '../components/ui/dialog.jsx';
import Tabs, { TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs.jsx';
import { auth, apiKeys, profile } from '../api.js';

function SettingsPage() {
  const [user, setUser] = useState(null);
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Profile form
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // API key management
  const [showKeyDialog, setShowKeyDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [creatingKey, setCreatingKey] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [me, k] = await Promise.all([
          auth.me(),
          apiKeys.list(),
        ]);
        setUser(me);
        setName(me.name || '');
        setKeys(k);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Mock data fallback
  const isMock = error && !loading;
  const displayUser = isMock
    ? { id: 1, name: 'Alex Johnson', email: 'alex@covibe.ai', tier: 'pro', created_at: '2025-01-15T00:00:00Z' }
    : user;

  const mockKeys = [
    { id: 1, name: 'Development', key: 'cvb_dev_••••••a3f2', created_at: '2025-03-10T00:00:00Z', last_used: '2025-06-01T10:00:00Z' },
    { id: 2, name: 'CI/CD Pipeline', key: 'cvb_ci_••••••b7c1', created_at: '2025-04-05T00:00:00Z', last_used: '2025-05-30T14:00:00Z' },
  ];

  const displayKeys = isMock ? mockKeys : keys;

  async function handleSaveProfile(e) {
    e.preventDefault();
    setSaving(true);
    setSaveMessage('');
    try {
      await profile.update({ name });
      setSaveMessage('Profile updated successfully');
    } catch (err) {
      setSaveMessage(`Error: ${err.message}`);
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  }

  async function handleCreateKey(e) {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    setCreatingKey(true);
    try {
      const data = await apiKeys.create(newKeyName);
      setNewKeyValue(data.key || data.api_key || 'API key created');
      setKeys([data, ...keys]);
      setNewKeyName('');
    } catch (err) {
      setNewKeyValue(`Error: ${err.message}`);
    } finally {
      setCreatingKey(false);
    }
  }

  async function handleRevokeKey(keyId) {
    try {
      await apiKeys.revoke(keyId);
      setKeys(keys.filter((k) => k.id !== keyId));
    } catch (err) {
      setSaveMessage(`Error revoking key: ${err.message}`);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      {error && !isMock ? (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
      ) : null}

      {isMock && (
        <div className="rounded-md bg-amber-50 dark:bg-amber-950/20 p-4 text-sm text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
          Showing demo data — API server not available.
        </div>
      )}

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="plan">Plan & Quotas</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your account details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
                <div className="flex items-center gap-4 pb-4 border-b mb-2">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                    {displayUser?.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-medium">{displayUser?.name || 'User'}</p>
                    <p className="text-sm text-muted-foreground">{displayUser?.email || 'No email'}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="name">Display Name</label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="email">Email</label>
                  <Input
                    id="email"
                    value={displayUser?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>

                {saveMessage && (
                  <div className={`rounded-md p-3 text-sm ${
                    saveMessage.startsWith('Error')
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400'
                  }`}>
                    {saveMessage}
                  </div>
                )}

                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api-keys">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>API Keys</CardTitle>
                  <CardDescription>Manage keys for programmatic access</CardDescription>
                </div>
                <Button onClick={() => setShowKeyDialog(true)}>
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Create Key
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {displayKeys.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border border-dashed rounded-md">
                  <svg className="mx-auto h-8 w-8 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
                  </svg>
                  <p>No API keys yet</p>
                  <p className="text-xs mt-1">Create your first key to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {displayKeys.map((k) => (
                    <div
                      key={k.id}
                      className="flex items-center justify-between rounded-md border px-4 py-3"
                    >
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{k.name}</p>
                        <p className="text-xs font-mono text-muted-foreground">{k.key}</p>
                        <p className="text-xs text-muted-foreground">
                          Created {new Date(k.created_at).toLocaleDateString()}
                          {k.last_used && ` — Last used ${new Date(k.last_used).toLocaleDateString()}`}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleRevokeKey(k.id)}
                      >
                        Revoke
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Create Key Dialog */}
          <Dialog open={showKeyDialog} onOpenChange={setShowKeyDialog} title="Create API Key" description="Give your key a descriptive name">
            <form onSubmit={handleCreateKey} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="key-name">Key Name</label>
                <Input
                  id="key-name"
                  placeholder="e.g., CI/CD Pipeline"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  required
                />
              </div>

              {newKeyValue && (
                <div className="rounded-md bg-muted p-3">
                  <p className="text-xs font-medium mb-1">Your API Key (copy now — won't be shown again)</p>
                  <code className="text-sm font-mono break-all bg-background px-2 py-1 rounded block">
                    {newKeyValue}
                  </code>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <DialogClose onClick={() => { setShowKeyDialog(false); setNewKeyValue(''); setNewKeyName(''); }} />
                <Button type="submit" disabled={creatingKey || !newKeyName.trim()}>
                  {creatingKey ? 'Creating...' : newKeyValue ? 'Close' : 'Create Key'}
                </Button>
              </div>
            </form>
          </Dialog>
        </TabsContent>

        {/* Plan & Quotas Tab */}
        <TabsContent value="plan">
          <Card>
            <CardHeader>
              <CardTitle>Plan & Usage</CardTitle>
              <CardDescription>Your current tier and resource quotas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current plan */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="text-sm font-medium">Current Plan</p>
                  <p className="text-2xl font-bold mt-1 capitalize">
                    {displayUser?.tier || 'free'}
                  </p>
                </div>
                <Badge variant={displayUser?.tier === 'pro' ? 'default' : 'secondary'} className="text-sm px-3 py-1">
                  {displayUser?.tier === 'pro' ? 'Active' : 'Free Tier'}
                </Badge>
              </div>

              {/* Quota bars */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Machines</span>
                    <span className="text-muted-foreground">3 / 5</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full w-[60%] rounded-full bg-primary" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Workspaces</span>
                    <span className="text-muted-foreground">8 / 20</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full w-[40%] rounded-full bg-primary" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Storage</span>
                    <span className="text-muted-foreground">45 GB / 100 GB</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full w-[45%] rounded-full bg-amber-500" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Concurrent Sessions</span>
                    <span className="text-muted-foreground">4 / 10</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full w-[40%] rounded-full bg-primary" />
                  </div>
                </div>
              </div>

              <div className="rounded-md bg-muted/50 p-4">
                <p className="text-sm font-medium mb-1">Need more resources?</p>
                <p className="text-sm text-muted-foreground">
                  Upgrade to a higher tier for increased quotas and priority support.
                </p>
                <Button className="mt-3" variant="outline">
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                  </svg>
                  View Upgrade Options
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SettingsPage;