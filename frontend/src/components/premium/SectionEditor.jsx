// src/components/premium/SectionEditor.jsx
import React, { useEffect, useRef, useState } from 'react';
import debounce from 'lodash.debounce';
import { patchSection, generateProject, exportProjectUrl } from '../../services/api';

export default function SectionEditor({ projectId, section }) {
  const [content, setContent] = useState(section?.content || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const saveRef = useRef(null);

  useEffect(() => {
    setContent(section?.content || '');
  }, [section]);

  const doSave = async (value) => {
    setSaving(true);
    try {
      await patchSection(projectId, section.id, { content: value });
      setMessage('Saved');
    } catch (err) {
      setMessage(err?.body?.detail || err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  // debounce saves while typing
  const debouncedSave = useRef(debounce((v) => doSave(v), 800)).current;

  function onChange(e) {
    const v = e.target.value;
    setContent(v);
    debouncedSave(v);
  }

  async function handleGenerate() {
    setMessage('Generating...');
    try {
      const res = await generateProject(projectId);
      setMessage('Generation started');
      // optionally show response data
    } catch (err) {
      setMessage(err?.body?.detail || err.message);
    }
  }

  async function handleExport() {
    setMessage('Preparing export...');
    try {
      const url = await exportProjectUrl(projectId);
      // if the backend returns full url string:
      const downloadUrl = typeof url === 'string' ? url : url.url || url.download_url;
      if (downloadUrl) {
        window.open(downloadUrl, '_blank');
      } else {
        setMessage('Export URL not returned');
      }
    } catch (err) {
      setMessage(err?.body?.detail || err.message);
    }
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="font-semibold mb-2">{section?.title || 'Section'}</h3>
      <textarea
        value={content}
        onChange={onChange}
        rows={8}
        className="w-full border p-2 rounded"
      />
      <div className="flex gap-2 mt-2 items-center">
        <button onClick={handleGenerate} className="px-3 py-1 bg-indigo-600 text-white rounded">
          Generate
        </button>
        <button onClick={handleExport} className="px-3 py-1 border rounded">
          Export
        </button>
        <div className="text-sm text-gray-600">{saving ? 'Saving...' : message}</div>
      </div>
    </div>
  );
}
