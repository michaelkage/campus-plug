import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Sparkles, Star, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase, sendBorrowEmail } from '../lib/supabase';
import { toast } from 'sonner';

interface Item {
  id: string;
  name: string;
  description: string;
  category: string;
  image_url: string;
  status: string;
  owner_id: string;
  condition: string;
  borrow_duration: number;
  profiles: {
    full_name: string;
    department: string;
  };
}

export const MarketplaceFeed: React.FC<{ user: any; setView: (v: 'browse' | 'dashboard' | 'profile') => void }> = ({ user, setView }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = ["All", "Lab Equipment", "Textbooks", "Electronics", "Sports Gear", "Art Supplies"];

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('items')
      .select('*, profiles(full_name, department)')
      .eq('status', 'available');

    if (error) {
      toast.error('Failed to fetch items');
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  const handleBorrow = async (item: Item) => {
    if (!user) {
      toast.error('Please login to borrow items');
      return;
    }

    const { error } = await supabase
      .from('requests')
      .insert({
        item_id: item.id,
        borrower_id: user.id,
        status: 'pending'
      });

    if (error) {
      toast.error('Failed to send request');
    } else {
      toast.success('Borrow request sent!');
      sendBorrowEmail(item.profiles.full_name, item.name);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6">
        <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter">Marketplace</h1>
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus-within:border-indigo-500/50 transition-all">
          <Search className="w-5 h-5 text-slate-500" />
          <input 
            placeholder="Search gear..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-lg w-full text-white outline-none" 
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              categoryFilter === cat
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-white/5 text-slate-400 hover:bg-white/10"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-32 text-center">
          <Sparkles className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-500 font-bold text-lg">No items found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <motion.div 
              key={item.id}
              whileHover={{ y: -8 }}
              className="group bg-white/5 border border-white/5 rounded-[32px] overflow-hidden cursor-pointer hover:border-indigo-500/40 transition-all shadow-xl"
            >
              <div className="aspect-[4/5] relative overflow-hidden">
                <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.name} />
                <div className="absolute bottom-4 left-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    Available
                  </span>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">{item.category}</p>
                  <h3 className="font-bold text-xl text-white leading-tight">{item.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">Lender: {item.profiles?.full_name}</p>
                </div>
                
                {item.owner_id === user?.id ? (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setView('dashboard'); }}
                    className="w-full py-3 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-all"
                  >
                    Manage Item
                  </button>
                ) : (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleBorrow(item); }}
                    className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-500 transition-all"
                  >
                    Request to Borrow
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
