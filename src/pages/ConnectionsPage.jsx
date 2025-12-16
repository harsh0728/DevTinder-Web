import { useEffect, useState } from "react";
import { apiFetch } from "../api/apiFetch";
import { Loader, Users } from "lucide-react";



export default function ConnectionsPage({ setPage }) {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const res = await apiFetch('/user/connections');
      if (res.success) {
        setConnections(res.data);
      }
    } catch {
      alert('Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96"><Loader className="animate-spin text-indigo-400" size={48} /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 mb-2">Your Connections</h1>
        <p className="text-slate-400">{connections.length} developer{connections.length !== 1 ? 's' : ''} connected</p>
      </div>

      {connections.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Users size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg">No connections yet. Start swiping to connect!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {connections.map((conn) => (
            <div key={conn._id} className="bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-xl overflow-hidden hover:border-indigo-500/40 transition duration-200 group cursor-pointer">
              <div className="h-40 bg-gradient-to-br from-indigo-600 to-cyan-600 flex items-center justify-center text-6xl overflow-hidden">
                {conn.photoUrl ? <img src={conn.photoUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition duration-300" /> : '👤'}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-white mb-3">{conn.firstName}</h3>
                {conn.skills && conn.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {conn.skills.slice(0, 3).map((skill) => (
                      <span key={skill} className="px-2 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                    {conn.skills.length > 3 && <span className="px-2 py-1 rounded-full bg-slate-700/50 text-slate-400 text-xs font-medium">+{conn.skills.length - 3}</span>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}