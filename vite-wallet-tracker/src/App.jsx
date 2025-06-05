import React, { useEffect, useState } from "react";
import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");

export default function App() {
  const [wallets, setWallets] = useState([]);
  const [form, setForm] = useState({ address: "", label: "", group: "", legit: true });
  const [balances, setBalances] = useState({});

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    const { data } = await supabase.from("wallets").select("*");
    setWallets(data);
    fetchBalances(data);
  };

  const fetchBalances = async (walletList) => {
    const result = {};
    for (let wallet of walletList) {
      try {
        const pubkey = new PublicKey(wallet.address);
        const lamports = await connection.getBalance(pubkey);
        result[wallet.address] = lamports / 1e9;
      } catch {
        result[wallet.address] = "Error";
      }
    }
    setBalances(result);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async () => {
    await fetch("/api/sync_wallets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallets: [form] })
    });
    setWallets([...wallets, form]);
    setForm({ address: "", label: "", group: "", legit: true });
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Vite Wallet Tracker</h1>
      <input placeholder="Address" name="address" value={form.address} onChange={handleChange} />
      <input placeholder="Label" name="label" value={form.label} onChange={handleChange} />
      <input placeholder="Group" name="group" value={form.group} onChange={handleChange} />
      <label>
        <input type="checkbox" name="legit" checked={form.legit} onChange={handleChange} /> Legit
      </label>
      <button onClick={handleSubmit}>Sync</button>

      <div className="mt-6">
        {wallets.map((w, i) => (
          <div key={i} style={{ border: "1px solid #ccc", padding: 8, marginBottom: 8 }}>
            <div>{w.address}</div>
            <div>{w.label} | {w.group} | Legit: {w.legit ? "Yes" : "No"}</div>
            <div><strong>Balance:</strong> {balances[w.address] ?? "..."} SOL</div>
          </div>
        ))}
      </div>
    </div>
  );
}