// src/pages/Register.jsx
import  { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const nav = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const base = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
      const res = await fetch(`${base}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Registered! Please login.");
        nav("/login");
      } else {
        alert(data.error || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl mb-4">Register</h2>
      <form onSubmit={handleRegister} className="flex flex-col gap-3">
        <input value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="Username" className="p-3 border rounded" />
        <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" className="p-3 border rounded" />
        <div className="relative">
          <input value={password} type={showPassword ? 'text' : 'password'} onChange={(e)=>setPassword(e.target.value)} placeholder="Password" className="p-3 border rounded w-full" />
          <button type="button" aria-label={showPassword? 'Hide password':'Show password'} onClick={()=>setShowPassword(s=>!s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600">{showPassword ? '🙈' : '👁️'}</button>
        </div>
        <button type="submit" className="p-3 bg-green-500 rounded text-white">Register</button>
      </form>
      <p className="mt-3">Already have an account? <Link to="/login" className="text-green-600">Login</Link></p>
    </div>
  );
}
