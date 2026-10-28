import React, { useState } from 'react';
import {
  Database,
  Key,
  ExternalLink,
  Copy,
  Check,
  Play,
  Terminal,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { saveCustomSupabaseConfig } from '../lib/supabase';

interface SetupRequiredProps {
  onContinueDemoPreview: () => void;
}

export const SetupRequired: React.FC<SetupRequiredProps> = ({
  onContinueDemoPreview,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const cleanUrl = urlInput.trim();
    const cleanKey = keyInput.trim();

    if (!cleanUrl || !cleanKey) {
      setValidationError('Please enter both your Supabase Project URL and anon public key.');
      return;
    }

    try {
      const parsed = new URL(cleanUrl);
      if (parsed.protocol !== 'https:') {
        setValidationError('Supabase Project URL must start with https://');
        return;
      }
    } catch {
      setValidationError('Please enter a valid URL (e.g. https://your-project.supabase.co)');
      return;
    }

    if (cleanKey.length < 20) {
      setValidationError('The public anon key provided appears too short.');
      return;
    }

    // Save and reload
    saveCustomSupabaseConfig(cleanUrl, cleanKey);
  };

  const copySqlFileLocation = () => {
    navigator.clipboard.writeText('supabase/schema_and_seed.sql');
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const copyEnvSnippet = () => {
    const snippet = `VITE_SUPABASE_URL=${urlInput || 'https://your-project-id.supabase.co'}\nVITE_SUPABASE_ANON_KEY=${keyInput || 'your-anon-public-key-here'}`;
    navigator.clipboard.writeText(snippet);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-600/15 via-transparent to-transparent blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl px-4 relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-4">
            <Database className="h-3.5 w-3.5" />
            <span>Stage 2: Supabase Integration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Connect FleetOps to Your Supabase Project
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-lg mx-auto">
            Stage 2 connects real PostgreSQL tables, Row Level Security, and Supabase Auth.
            Please connect your Supabase credentials below.
          </p>
        </div>

        {/* Step-by-Step Card */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl space-y-6">
          {/* Validation Notice */}
          {validationError && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Quick Setup Instructions */}
          <div className="space-y-4 text-xs text-slate-300">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-slate-700 pb-2">
              <Terminal className="h-4 w-4 text-blue-400" />
              <span>3 Simple Setup Steps</span>
            </h3>

            {/* Step 1 */}
            <div className="flex items-start space-x-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-[11px]">
                1
              </span>
              <div className="space-y-1">
                <p className="font-semibold text-white">Create a free Supabase project</p>
                <p className="text-slate-400">
                  Go to{' '}
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:text-blue-300 inline-flex items-center underline"
                  >
                    supabase.com <ExternalLink className="h-3 w-3 ml-0.5" />
                  </a>
                  , create a new project (e.g. "fleetops-db") and select region (e.g. Mumbai / India).
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start space-x-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-[11px]">
                2
              </span>
              <div className="space-y-1">
                <p className="font-semibold text-white">Run the SQL Migration & Seed script</p>
                <div className="flex items-center space-x-2 pt-1">
                  <p className="text-slate-400">
                    Open <strong className="text-slate-200">SQL Editor</strong>, open or copy{' '}
                    <code className="bg-slate-900 px-1.5 py-0.5 rounded text-blue-300">
                      supabase/schema_and_seed.sql
                    </code>
                  </p>
                  <button
                    type="button"
                    onClick={copySqlFileLocation}
                    className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 text-[10px] inline-flex items-center space-x-1 cursor-pointer"
                    title="Copy file path"
                  >
                    {copiedSql ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedSql ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 italic">
                  This creates the drivers, vehicles, trips, ordered trip points, and alerts tables with Row Level Security.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start space-x-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-[11px]">
                3
              </span>
              <div className="space-y-1">
                <p className="font-semibold text-white">Copy API credentials</p>
                <p className="text-slate-400">
                  In Supabase, go to <strong className="text-slate-200">Project Settings → API</strong>. Copy the{' '}
                  <strong className="text-slate-200">Project URL</strong> and{' '}
                  <strong className="text-slate-200">anon / public key</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Connect Form */}
          <form onSubmit={handleConnect} className="pt-4 border-t border-slate-700/80 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <Key className="h-3.5 w-3.5 text-blue-400" />
              <span>Enter Credentials Directly (Instant Connect)</span>
            </h4>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                placeholder="https://xyzabcdefg.supabase.co"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Supabase Public Anon Key
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
              <p className="text-[10px] text-slate-500 mt-1 flex items-center">
                <ShieldCheck className="h-3 w-3 mr-1 text-emerald-400" />
                Never enter the service_role key. Only public anon key is safe in frontend clients.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Database className="h-4 w-4" />
                <span>Save Credentials & Connect</span>
              </button>

              <button
                type="button"
                onClick={copyEnvSnippet}
                className="py-2.5 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                title="Copy .env template to clipboard"
              >
                {copiedEnv ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                <span>{copiedEnv ? 'Copied to Clipboard' : 'Copy .env Format'}</span>
              </button>
            </div>
          </form>

          {/* Fallback to Demo Mode */}
          <div className="pt-4 border-t border-slate-700/80 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <HelpCircle className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-medium text-slate-300">
                Want to explore the UI before setting up your database?
              </span>
            </div>
            <button
              onClick={onContinueDemoPreview}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 hover:underline inline-flex items-center space-x-1 cursor-pointer"
            >
              <span>Explore Dashboard in Local Demo Mode</span>
              <Play className="h-3 w-3 ml-1 fill-blue-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
