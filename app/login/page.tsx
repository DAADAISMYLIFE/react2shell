"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (id === "web" && pw === "web") {
      router.push("/shop");
    } else {
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 100%)"
    }}>
      <div style={{ width: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1 }}>
            <span style={{ color: "#fff" }}>NEX</span>
            <span style={{ color: "#6366f1" }}>TECH</span>
          </div>
          <div style={{ color: "#555", fontSize: 13, marginTop: 6 }}>Premium Electronics Store</div>
        </div>

        {/* Card */}
        <div style={{
          background: "#1a1a1a", borderRadius: 16, padding: 40,
          border: "1px solid #2a2a2a", boxShadow: "0 25px 50px rgba(0,0,0,0.5)"
        }}>
          <h2 style={{ margin: "0 0 28px", fontSize: 20, fontWeight: 700, color: "#fff" }}>로그인</h2>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, color: "#888", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
                아이디
              </label>
              <input
                value={id} onChange={e => setId(e.target.value)}
                placeholder="아이디 입력"
                style={{
                  width: "100%", padding: "12px 16px", background: "#111",
                  border: "1px solid #333", borderRadius: 8, color: "#fff",
                  fontSize: 14, boxSizing: "border-box", outline: "none"
                }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 12, color: "#888", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
                비밀번호
              </label>
              <input
                type="password" value={pw} onChange={e => setPw(e.target.value)}
                placeholder="비밀번호 입력"
                style={{
                  width: "100%", padding: "12px 16px", background: "#111",
                  border: "1px solid #333", borderRadius: 8, color: "#fff",
                  fontSize: 14, boxSizing: "border-box", outline: "none"
                }}
              />
            </div>

            {error && (
              <div style={{
                background: "#2d1515", border: "1px solid #5c2020", borderRadius: 8,
                padding: "10px 14px", fontSize: 13, color: "#f87171", marginBottom: 16
              }}>
                {error}
              </div>
            )}

            <button type="submit" style={{
              width: "100%", padding: "13px 0",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              border: "none", borderRadius: 8, color: "#fff",
              fontSize: 15, fontWeight: 700, cursor: "pointer",
              letterSpacing: 0.5
            }}>
              로그인
            </button>
          </form>

          <div style={{ marginTop: 20, textAlign: "center", fontSize: 12, color: "#444" }}>
            © 2025 NexTech Store. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
