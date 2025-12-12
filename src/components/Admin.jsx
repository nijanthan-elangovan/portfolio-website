import React, { useState, useEffect } from 'react';
import { Octokit } from '@octokit/rest';
import { motion } from 'framer-motion';
import { Lock, Save, LogOut, Github, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import contentData from '../data/content.json';

export default function Admin() {
    const [token, setToken] = useState(localStorage.getItem('github_token') || '');
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('github_token'));
    const [content, setContent] = useState(contentData);
    const [isSaving, setIsSaving] = useState(false);
    const [status, setStatus] = useState(null); // 'success' | 'error'
    const [message, setMessage] = useState('');

    // GitHub Repo Details - UPDATE THESE IF NEEDED
    const OWNER = 'nijanthan-elangovan';
    const REPO = 'portfolio-website';
    const PATH = 'src/data/content.json';

    const handleLogin = (e) => {
        e.preventDefault();
        if (token) {
            localStorage.setItem('github_token', token);
            setIsAuthenticated(true);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('github_token');
        setToken('');
        setIsAuthenticated(false);
    };

    const handleChange = (section, field, value, index = null, subField = null) => {
        const newContent = { ...content };

        if (index !== null) {
            // Handle array updates
            if (subField) {
                newContent[section][index][subField] = value;
            } else {
                newContent[section][index] = value;
            }
        } else if (field) {
            // Handle nested object updates
            newContent[section][field] = value;
        } else {
            // Handle direct section updates (rare for this structure)
            newContent[section] = value;
        }

        setContent(newContent);
    };

    const handleSave = async () => {
        setIsSaving(true);
        setStatus(null);
        setMessage('');

        try {
            const octokit = new Octokit({ auth: token });

            // 1. Get current SHA of the file
            const { data: fileData } = await octokit.repos.getContent({
                owner: OWNER,
                repo: REPO,
                path: PATH,
            });

            // 2. Update the file
            await octokit.repos.createOrUpdateFileContents({
                owner: OWNER,
                repo: REPO,
                path: PATH,
                message: 'chore: update content via CMS',
                content: btoa(JSON.stringify(content, null, 2)),
                sha: fileData.sha,
            });

            setStatus('success');
            setMessage('Content updated successfully! Changes will be live in a few minutes.');
        } catch (error) {
            console.error(error);
            setStatus('error');
            setMessage(`Error: ${error.message}. Make sure your token has 'repo' scope.`);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8 border border-zinc-200 dark:border-zinc-800"
                >
                    <div className="flex justify-center mb-6">
                        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                            <Lock className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-center mb-2 text-zinc-900 dark:text-zinc-50">Admin Access</h2>
                    <p className="text-center text-zinc-600 dark:text-zinc-400 mb-8">Enter your GitHub Personal Access Token to manage content.</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">GitHub Token</label>
                            <input
                                type="password"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 outline-none transition"
                                placeholder="ghp_..."
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
                        >
                            <Github className="w-4 h-4" />
                            Login
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 pb-20">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Mini CMS
                    </h1>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${isSaving
                                    ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                }`}
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Status Message */}
            {status && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`max-w-5xl mx-auto mt-4 px-4 py-3 rounded-lg flex items-center gap-2 ${status === 'success'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                        }`}
                >
                    {status === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {message}
                </motion.div>
            )}

            {/* Content Form */}
            <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">

                {/* Profile Section */}
                <section className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-800">Profile</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Name" value={content.PROFILE.name} onChange={(v) => handleChange('PROFILE', 'name', v)} />
                        <Field label="Location" value={content.PROFILE.location} onChange={(v) => handleChange('PROFILE', 'location', v)} />
                        <Field label="Email" value={content.PROFILE.email} onChange={(v) => handleChange('PROFILE', 'email', v)} />
                        <Field label="Phone" value={content.PROFILE.phone} onChange={(v) => handleChange('PROFILE', 'phone', v)} />
                        <Field label="Availability" value={content.PROFILE.availability} onChange={(v) => handleChange('PROFILE', 'availability', v)} />
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Summary</label>
                            <textarea
                                value={content.PROFILE.summary}
                                onChange={(e) => handleChange('PROFILE', 'summary', e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:ring-2 focus:ring-emerald-500 outline-none transition"
                            />
                        </div>
                    </div>
                </section>

                {/* Experience Section */}
                <section className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-800">Experience</h2>
                    <div className="space-y-6">
                        {content.EXPERIENCE.map((exp, index) => (
                            <div key={index} className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <Field label="Company" value={exp.company} onChange={(v) => handleChange('EXPERIENCE', null, v, index, 'company')} />
                                    <Field label="Title" value={exp.title} onChange={(v) => handleChange('EXPERIENCE', null, v, index, 'title')} />
                                    <Field label="Date Range" value={exp.range} onChange={(v) => handleChange('EXPERIENCE', null, v, index, 'range')} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Bullets (one per line)</label>
                                    <textarea
                                        value={exp.bullets.join('\n')}
                                        onChange={(e) => handleChange('EXPERIENCE', null, e.target.value.split('\n'), index, 'bullets')}
                                        rows={4}
                                        className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-emerald-500 outline-none transition"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Projects Section */}
                <section className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-800">Projects</h2>
                    <div className="space-y-6">
                        {content.PROJECTS.map((proj, index) => (
                            <div key={index} className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                                <div className="mb-4">
                                    <Field label="Title" value={proj.title} onChange={(v) => handleChange('PROJECTS', null, v, index, 'title')} />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Blurb</label>
                                    <textarea
                                        value={proj.blurb}
                                        onChange={(e) => handleChange('PROJECTS', null, e.target.value, index, 'blurb')}
                                        rows={2}
                                        className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-emerald-500 outline-none transition"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

            </main>
        </div>
    );
}

function Field({ label, value, onChange }) {
    return (
        <div>
            <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">{label}</label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:ring-2 focus:ring-emerald-500 outline-none transition"
            />
        </div>
    );
}
