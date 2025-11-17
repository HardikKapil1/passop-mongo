// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        nav("/"); // go to Manager page
      } else {
        alert(data.error || "Login failed");
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl mb-4">Login</h2>
      <form onSubmit={handleLogin} className="flex flex-col gap-3">
        <input name="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" className="p-3 border rounded" />
        <input name="password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password" className="p-3 border rounded" />
        <button type="submit" className="p-3 bg-green-500 rounded text-white">Login</button>
      </form>
      <p className="mt-3">Don't have an account? <a href="/register" className="text-green-600">Register</a></p>
    </div>
  );
}
