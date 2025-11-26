// src/pages/ProjectDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProjectSections, patchSection } from '../services/api';
import SectionEditor from '../components/premium/SectionEditor';
import Loading from '../components/Loading';

export default function ProjectDetail() {
  const { id } = useParams();
  const [sections, setSections] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchSections() {
    setLoading(true);
    try {
      const res = await getProjectSections(id);
      setSections(Array.isArray(res) ? res : res.sections || res.data);
    } catch (err) {
      setError(err?.body?.detail || err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSections();
  }, [id]);

  if (loading) return <Loading />;
  if (error) return <div className="p-6 text-red-600">{String(error)}</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Project</h2>
      <div className="space-y-4">
        {sections && sections.map(s => (
          <SectionEditor key={s.id} projectId={id} section={s} />
        ))}
      </div>
    </div>
  );
}
