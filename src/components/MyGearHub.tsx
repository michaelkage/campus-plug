import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Camera, Loader2, Eye, Trash2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface Item {
  id: string;
  name: string;
  description: string;
  category: string;
  image_url: string;
  status: string;
  views: number;
}

export const MyGearHub: React.FC<{ user: any }> = ({ user }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'Lab Equipment', description: '', image_url: '' });

  const categories = ["Lab Equipment", "Textbooks", "Electronics", "Sports Gear", "Art Supplies"];

  useEffect(() => {
    if (user) fetchMyItems();
  }, [user]);

  const fetchMyItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('owner_id', user.id)
      .neq('status', 'delisted');

    if (error) {
      toast.error('Failed to fetch your gear');
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  const handlePublish = async () => {
    if (!form.name || !form.description || !form.image_url) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsPublishing(true);
    const { error } = await supabase
      .from('items')
      .insert({
        ...form,
        owner_id: user.id,
        status: 'available',
        views: 0
      });

    if (error) {
      toast.error('Failed to list item');
    } else {
      toast.success('Item listed successfully!');
      setShowModal(false);
      setForm({ name: '', category: 'Lab Equipment', description: '', image_url: '' });
      fetchMyItems();
    }
    setIsPublishing(false);
  };

  const handleDelist = async (id: string) => {
    const { error } = await supabase
      .from('items')
      .update({ status: 'delisted' })
      .eq('id', id);

    if (error) {
      toast.error('Failed to de-list item');
    } else {
      toast.success('Item de-listed');
      fetchMyItems();
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div>
          <h2 className="text-6xl font-black text-white italic uppercase tracking-tighter">My Gear Hub</h2>
          <p className="text-slate-400 mt-2">Manage your listings and track performance</p>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          className="bg-indigo-600 px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all w-fit text-white"
        >
          <Plus className="w-5 h-5" /> Post New Gear
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        </div>
      ) : items.length === 0 ? (
        <div className="py-32 text-center border-2 border-dashed border-white/5 rounded-[40px] bg-white/2">
          <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-600 font-bold uppercase tracking-widest italic text-xl">No gear listed yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map(item => (
            <motion.div 
              key={item.id} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/5 p-6 rounded-[32px] flex items-center gap-6 group hover:border-white/10 transition-all"
            >
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-800 flex-shrink-0">
                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-1 block">{item.category}</span>
                    <h3 className="text-xl font-black text-white italic uppercase leading-none">{item.name}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-slate-400 text-xs">
                      <Eye className="w-3 h-3" /> {item.views}
                    </div>
                    <button 
                      onClick={() => handleDelist(item.id)}
                      className="p-2 text-slate-500 hover:text-rose-500 transition-colors"
                      title="De-list Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-slate-400 text-sm mt-2 line-clamp-1">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6 overflow-y-auto">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="bg-[#161b2a] w-full max-w-lg p-12 rounded-[48px] border border-white/10 shadow-3xl my-8"
          >
            <h3 className="text-4xl font-black italic uppercase text-white mb-8 tracking-tighter">Post Listing</h3>
            <div className="space-y-5">
              <input 
                placeholder="Image URL (e.g. https://picsum.photos/400)" 
                value={form.image_url}
                onChange={e => setForm({...form, image_url: e.target.value})}
                className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-indigo-500 transition-all text-white" 
              />
              
              <input 
                placeholder="Gear Name" 
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-indigo-500 transition-all text-white" 
              />

              <select 
                value={form.category}
                onChange={e => setForm({...form, category: e.target.value})}
                className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-indigo-500 transition-all text-white"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
                ))}
              </select>

              <textarea 
                placeholder="Description & Condition" 
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl h-32 outline-none focus:border-indigo-500 transition-all text-white resize-none" 
              />

              <button 
                onClick={handlePublish}
                disabled={isPublishing}
                className="w-full py-5 rounded-2xl bg-indigo-600 text-white font-black text-xl uppercase italic shadow-2xl hover:bg-indigo-500 transition-all disabled:opacity-50"
              >
                {isPublishing ? <Loader2 className="animate-spin mx-auto" /> : "Publish Listing"}
              </button>

              <button 
                onClick={() => setShowModal(false)}
                className="w-full text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
