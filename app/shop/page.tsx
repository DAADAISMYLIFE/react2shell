"use client";

import { useState, useTransition } from "react";
import { addToCart, submitReview, subscribeNewsletter } from "../actions";

const PRODUCTS = [
  {
    id: "p001", name: "NexBook Pro 16", category: "노트북",
    price: 2890000, originalPrice: 3290000,
    badge: "BEST", rating: 4.8, reviews: 1243, emoji: "💻",
    desc: "M3 Ultra 칩, 36GB RAM, 1TB SSD — 크리에이터를 위한 최강 성능",
    specs: ["M3 Ultra 칩", "36GB 유니파이드 메모리", "1TB NVMe SSD", "16.2인치 Liquid Retina XDR"],
    detail: "NexBook Pro 16은 전문 크리에이터와 개발자를 위한 최고급 노트북입니다. M3 Ultra 칩셋은 업계 최고 성능을 제공하며, 36GB 유니파이드 메모리로 대용량 영상 편집, 3D 렌더링, 머신러닝 작업을 원활하게 처리합니다. 16.2인치 Liquid Retina XDR 디스플레이는 1000nit 지속 밝기와 DCI-P3 색공간을 100% 커버합니다.",
  },
  {
    id: "p002", name: "NexPhone X15 Ultra", category: "스마트폰",
    price: 1590000, originalPrice: 1790000,
    badge: "NEW", rating: 4.9, reviews: 3891, emoji: "📱",
    desc: "6.9인치 AMOLED, 200MP 카메라, 5000mAh 배터리",
    specs: ["Snapdragon 8 Gen 4", "200MP 트리플 카메라", "5000mAh 배터리", "IP68 방수"],
    detail: "NexPhone X15 Ultra는 플래그십의 새로운 기준을 제시합니다. 200MP 트리플 카메라 시스템으로 야간에도 낮처럼 선명한 사진을 담아낼 수 있고, 5000mAh 대용량 배터리와 65W 초고속 충전으로 하루 종일 걱정 없이 사용 가능합니다.",
  },
  {
    id: "p003", name: "NexPad Ultra Tab", category: "태블릿",
    price: 980000, originalPrice: 1100000,
    badge: "SALE", rating: 4.7, reviews: 672, emoji: "📟",
    desc: "12.9인치 OLED, S펜 포함, 전문가급 디스플레이",
    specs: ["12.9인치 OLED", "S펜 포함", "12GB RAM + 256GB", "120Hz ProMotion"],
    detail: "NexPad Ultra Tab은 생산성과 창의성의 완벽한 조화입니다. 12.9인치 OLED 디스플레이는 0.1ms 응답속도와 DCI-P3 100% 색재현율을 자랑하며, 번들 S펜으로 자연스러운 필기와 드로잉이 가능합니다.",
  },
  {
    id: "p004", name: "NexBuds Pro 3", category: "이어폰",
    price: 390000, originalPrice: 450000,
    badge: "HOT", rating: 4.6, reviews: 5210, emoji: "🎧",
    desc: "업계 최고 ANC, 30시간 재생, 공간 음향",
    specs: ["하이브리드 ANC", "30시간 배터리", "공간 음향", "IPX4 방수"],
    detail: "NexBuds Pro 3는 최고 수준의 하이브리드 ANC로 주변 소음을 최대 -42dB까지 차단합니다. 공간 음향 기술로 콘서트홀에 있는 듯한 입체적인 사운드를 경험하세요. IPX4 방수로 운동 중 땀에도 걱정 없습니다.",
  },
  {
    id: "p005", name: "NexWatch Series 10", category: "스마트워치",
    price: 590000, originalPrice: 650000,
    badge: "BEST", rating: 4.8, reviews: 2140, emoji: "⌚",
    desc: "건강 모니터링, 혈당 측정, 50m 방수",
    specs: ["혈당 측정", "ECG + 혈압", "50m 방수", "18일 배터리"],
    detail: "NexWatch Series 10은 손목 위의 주치의입니다. 비침습 혈당 측정, ECG, 혈압 모니터링 등 병원급 건강 데이터를 실시간으로 확인하세요. 18일 배터리 수명으로 충전 걱정이 없습니다.",
  },
  {
    id: "p006", name: "NexStation RTX", category: "데스크탑",
    price: 3490000, originalPrice: 3890000,
    badge: "NEW", rating: 4.9, reviews: 438, emoji: "🖥️",
    desc: "RTX 5090, i9-15900K, 64GB DDR5 — 타협 없는 퍼포먼스",
    specs: ["RTX 5090 24GB", "Intel i9-15900K", "64GB DDR5", "2TB NVMe x2"],
    detail: "NexStation RTX는 크리에이터와 게이머 모두를 위한 최고의 워크스테이션입니다. RTX 5090의 압도적인 GPU 성능으로 8K 영상 편집, AI 렌더링, 최고 화질 게이밍까지 모두 가능합니다.",
  },
];

const CATEGORIES = ["전체", "노트북", "스마트폰", "태블릿", "이어폰", "스마트워치", "데스크탑"];
const SORT_OPTIONS = ["추천순", "가격 낮은순", "가격 높은순", "평점순", "리뷰순"];

const BADGE_COLOR: Record<string, { bg: string; color: string }> = {
  BEST: { bg: "#fef3c7", color: "#92400e" },
  NEW:  { bg: "#dbeafe", color: "#1e40af" },
  SALE: { bg: "#fee2e2", color: "#991b1b" },
  HOT:  { bg: "#fce7f3", color: "#9d174d" },
};

type CartItem = { id: string; name: string; price: number; emoji: string; qty: number };
type Product = typeof PRODUCTS[0];

function Stars({ rating }: { rating: number }) {
  return (
    <span>
      <span style={{ color: "#f59e0b", fontSize: 13 }}>
        {"★".repeat(Math.floor(rating))}{"☆".repeat(5 - Math.floor(rating))}
      </span>
      <span style={{ color: "#888", fontSize: 12, marginLeft: 4 }}>{rating}</span>
    </span>
  );
}

export default function ShopPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState("전체");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("추천순");
  const [toast, setToast] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [, startTransition] = useTransition();

  const filtered = PRODUCTS
    .filter(p => activeFilter === "전체" || p.category === activeFilter)
    .filter(p => !search || p.name.includes(search) || p.desc.includes(search) || p.category.includes(search))
    .sort((a, b) => {
      if (sort === "가격 낮은순") return a.price - b.price;
      if (sort === "가격 높은순") return b.price - a.price;
      if (sort === "평점순") return b.rating - a.rating;
      if (sort === "리뷰순") return b.reviews - a.reviews;
      return 0;
    });

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleAddToCart = (p: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === p.id);
      if (existing) return prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { id: p.id, name: p.name, price: p.price, emoji: p.emoji, qty: 1 }];
    });
    showToast(`🛒 ${p.name} 장바구니에 담겼습니다!`);
    const fd = new FormData();
    fd.set("productId", p.id);
    fd.set("quantity", "1");
    startTransition(() => { addToCart(fd); });
  };

  const toggleWishlist = (id: string) => {
    setWishlist(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); showToast("💔 찜 해제됨"); }
      else { next.add(id); showToast("❤️ 찜 목록에 추가됨"); }
      return next;
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev =>
      prev.map(i => i.id === id ? { ...i, qty: i.qty + delta } : i).filter(i => i.qty > 0)
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", color: "#fff", fontFamily: "system-ui, sans-serif" }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 80, right: 24, zIndex: 9999,
          background: "#1e1e2e", border: "1px solid #6366f1", borderRadius: 12,
          padding: "14px 20px", fontSize: 14, fontWeight: 500,
          boxShadow: "0 8px 32px rgba(99,102,241,0.4)", maxWidth: 320,
        }}>{toast}</div>
      )}

      {/* Cart Sidebar */}
      {cartOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.7)" }}
          onClick={() => setCartOpen(false)}
        >
          <div
            style={{
              position: "absolute", right: 0, top: 0, bottom: 0, width: 400,
              background: "#111", borderLeft: "1px solid #222",
              display: "flex", flexDirection: "column",
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              padding: "20px 24px", borderBottom: "1px solid #222",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>장바구니 ({cartCount})</h2>
              <button onClick={() => setCartOpen(false)} style={{
                background: "none", border: "none", color: "#fff", fontSize: 20, cursor: "pointer"
              }}>✕</button>
            </div>
            <div style={{ flex: 1, overflow: "auto", padding: "16px 24px" }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: "center", color: "#555", paddingTop: 60, fontSize: 14 }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
                  장바구니가 비어있습니다
                </div>
              ) : cart.map(item => (
                <div key={item.id} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "14px 0", borderBottom: "1px solid #1a1a1a"
                }}>
                  <span style={{ fontSize: 36 }}>{item.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: "#666" }}>{(item.price * item.qty).toLocaleString()}원</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button onClick={() => updateQty(item.id, -1)} style={{
                      width: 28, height: 28, background: "#222", border: "1px solid #333",
                      borderRadius: 6, color: "#fff", cursor: "pointer", fontSize: 14
                    }}>−</button>
                    <span style={{ fontSize: 14, minWidth: 20, textAlign: "center" }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} style={{
                      width: 28, height: 28, background: "#222", border: "1px solid #333",
                      borderRadius: 6, color: "#fff", cursor: "pointer", fontSize: 14
                    }}>+</button>
                  </div>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div style={{ padding: "20px 24px", borderTop: "1px solid #222" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <span style={{ color: "#888" }}>합계</span>
                  <span style={{ fontSize: 18, fontWeight: 800 }}>{cartTotal.toLocaleString()}원</span>
                </div>
                <button
                  onClick={() => {
                    showToast("✅ 주문이 완료되었습니다! 감사합니다 🎉");
                    setCart([]);
                    setCartOpen(false);
                  }}
                  style={{
                    width: "100%", padding: "14px",
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    border: "none", borderRadius: 10, color: "#fff",
                    fontSize: 15, fontWeight: 700, cursor: "pointer"
                  }}
                >결제하기</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.85)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 24
          }}
          onClick={() => setSelectedProduct(null)}
        >
          <div
            style={{
              background: "#1a1a1a", borderRadius: 20, border: "1px solid #2a2a2a",
              width: "min(600px, 100%)", maxHeight: "85vh", overflow: "auto",
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: 32 }}>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
                <button onClick={() => setSelectedProduct(null)} style={{
                  background: "#222", border: "1px solid #333", borderRadius: 8,
                  color: "#888", fontSize: 13, cursor: "pointer", padding: "5px 12px"
                }}>✕ 닫기</button>
              </div>
              <div style={{ fontSize: 80, textAlign: "center", marginBottom: 20 }}>{selectedProduct.emoji}</div>
              <div style={{ fontSize: 12, color: "#6366f1", fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
                {selectedProduct.category}
              </div>
              <h2 style={{ margin: "0 0 10px", fontSize: 24, fontWeight: 800 }}>{selectedProduct.name}</h2>
              <div style={{ marginBottom: 16 }}>
                <Stars rating={selectedProduct.rating} />
                <span style={{ fontSize: 12, color: "#555", marginLeft: 8 }}>({selectedProduct.reviews.toLocaleString()}개 리뷰)</span>
              </div>
              <p style={{ color: "#999", lineHeight: 1.8, margin: "0 0 20px", fontSize: 14 }}>{selectedProduct.detail}</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24 }}>
                {selectedProduct.specs.map(s => (
                  <span key={s} style={{
                    background: "#111", border: "1px solid #333", borderRadius: 6,
                    padding: "5px 12px", fontSize: 12, color: "#aaa"
                  }}>{s}</span>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <div>
                  <div style={{ fontSize: 12, color: "#555", textDecoration: "line-through" }}>
                    {selectedProduct.originalPrice.toLocaleString()}원
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800 }}>
                    {selectedProduct.price.toLocaleString()}<span style={{ fontSize: 16 }}>원</span>
                  </div>
                </div>
                <span style={{ background: "#2d1515", color: "#f87171", padding: "6px 16px", borderRadius: 8, fontSize: 14, fontWeight: 700 }}>
                  {Math.round((1 - selectedProduct.price / selectedProduct.originalPrice) * 100)}% OFF
                </span>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => { handleAddToCart(selectedProduct); setSelectedProduct(null); }}
                  style={{
                    flex: 1, padding: "14px",
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    border: "none", borderRadius: 10, color: "#fff",
                    fontSize: 14, fontWeight: 700, cursor: "pointer"
                  }}
                >🛒 장바구니 담기</button>
                <button
                  onClick={() => toggleWishlist(selectedProduct.id)}
                  style={{
                    width: 52, padding: "14px",
                    background: wishlist.has(selectedProduct.id) ? "#2d0a1a" : "#222",
                    border: `1px solid ${wishlist.has(selectedProduct.id) ? "#e11d48" : "#333"}`,
                    borderRadius: 10, fontSize: 20, cursor: "pointer"
                  }}
                >{wishlist.has(selectedProduct.id) ? "❤️" : "🤍"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav style={{
        background: "#111", borderBottom: "1px solid #222",
        padding: "0 40px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100
      }}>
        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -1 }}>
          <span style={{ color: "#fff" }}>NEX</span><span style={{ color: "#6366f1" }}>TECH</span>
        </div>
        <div style={{ display: "flex", gap: 24, fontSize: 14 }}>
          {CATEGORIES.map(c => (
            <span key={c} onClick={() => setActiveFilter(c)} style={{
              cursor: "pointer",
              color: activeFilter === c ? "#6366f1" : "#aaa",
              fontWeight: activeFilter === c ? 700 : 400,
            }}>{c}</span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {wishlist.size > 0 && <span style={{ fontSize: 13, color: "#888" }}>❤️ {wishlist.size}</span>}
          <button onClick={() => setCartOpen(true)} style={{
            background: cartCount > 0 ? "#6366f1" : "#222",
            color: "#fff", padding: "8px 18px", borderRadius: 8,
            fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none"
          }}>🛒 {cartCount > 0 ? `장바구니 ${cartCount}` : "장바구니"}</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        padding: "60px 40px", textAlign: "center"
      }}>
        <div style={{ fontSize: 12, color: "#6366f1", letterSpacing: 4, textTransform: "uppercase", marginBottom: 12 }}>
          2025 Holiday Sale
        </div>
        <h1 style={{ fontSize: 48, fontWeight: 900, margin: "0 0 12px", lineHeight: 1.1 }}>
          최대 <span style={{ color: "#6366f1" }}>30%</span> 할인
        </h1>
        <p style={{ color: "#888", fontSize: 16, margin: "0 0 28px" }}>
          프리미엄 전자기기를 더 합리적인 가격에
        </p>
        <div style={{ maxWidth: 480, margin: "0 auto 24px", position: "relative" }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="상품 검색... (노트북, 카메라, 배터리...)"
            style={{
              width: "100%", padding: "14px 48px 14px 20px",
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(99,102,241,0.5)",
              borderRadius: 40, color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box"
            }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{
              position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", color: "#888", fontSize: 16, cursor: "pointer"
            }}>✕</button>
          )}
        </div>
        <div style={{
          display: "inline-flex", background: "#1a1a1a", borderRadius: 40,
          padding: "4px 8px", gap: 4, border: "1px solid #333"
        }}>
          {CATEGORIES.map(c => (
            <span key={c} onClick={() => setActiveFilter(c)} style={{
              padding: "8px 18px", borderRadius: 32, fontSize: 13, cursor: "pointer",
              background: activeFilter === c ? "#6366f1" : "transparent",
              color: activeFilter === c ? "#fff" : "#888",
              fontWeight: activeFilter === c ? 600 : 400,
            }}>{c}</span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
        background: "#111", borderBottom: "1px solid #222"
      }}>
        {[
          { label: "누적 판매", value: "128,400+" },
          { label: "고객 만족도", value: "98.7%" },
          { label: "당일 출고", value: "3시간 이내" },
          { label: "무료 반품", value: "30일 보장" },
        ].map(s => (
          <div key={s.label} style={{ padding: "20px 0", textAlign: "center", borderRight: "1px solid #222" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#6366f1" }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Products */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>
            {activeFilter === "전체" ? "전체 상품" : activeFilter}
            <span style={{ fontSize: 14, fontWeight: 400, color: "#555", marginLeft: 10 }}>{filtered.length}개</span>
          </h2>
          <select value={sort} onChange={e => setSort(e.target.value)} style={{
            background: "#1a1a1a", border: "1px solid #333", borderRadius: 8,
            color: "#fff", padding: "8px 14px", fontSize: 13, cursor: "pointer"
          }}>
            {SORT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#555" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <div style={{ fontSize: 16 }}>검색 결과가 없습니다</div>
            <div style={{ fontSize: 13, marginTop: 8 }}>다른 검색어를 시도해보세요</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {filtered.map(p => {
              const inCart = cart.find(i => i.id === p.id);
              const inWish = wishlist.has(p.id);
              return (
                <div key={p.id} style={{
                  background: "#1a1a1a", borderRadius: 16, overflow: "hidden",
                  border: `1px solid ${inCart ? "#6366f1" : "#2a2a2a"}`,
                }}>
                  <div onClick={() => setSelectedProduct(p)} style={{
                    height: 180, background: "linear-gradient(135deg, #1e1e2e, #2d2d44)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    position: "relative", cursor: "pointer"
                  }}>
                    <span style={{ fontSize: 72 }}>{p.emoji}</span>
                    <span style={{
                      position: "absolute", top: 12, left: 12,
                      background: BADGE_COLOR[p.badge]?.bg, color: BADGE_COLOR[p.badge]?.color,
                      padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 800
                    }}>{p.badge}</span>
                    <span style={{
                      position: "absolute", bottom: 10, right: 12,
                      fontSize: 11, background: "rgba(0,0,0,0.6)", color: "#aaa",
                      padding: "3px 9px", borderRadius: 10
                    }}>상세보기 →</span>
                    {inCart && (
                      <span style={{
                        position: "absolute", top: 12, right: 12,
                        background: "#6366f1", color: "#fff", width: 22, height: 22,
                        borderRadius: "50%", fontSize: 11, fontWeight: 800,
                        display: "flex", alignItems: "center", justifyContent: "center"
                      }}>{inCart.qty}</span>
                    )}
                  </div>

                  <div style={{ padding: "16px 18px" }}>
                    <div style={{ fontSize: 11, color: "#6366f1", fontWeight: 600, marginBottom: 4, textTransform: "uppercase" }}>
                      {p.category}
                    </div>
                    <h3 onClick={() => setSelectedProduct(p)} style={{
                      margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: "#fff", cursor: "pointer"
                    }}>{p.name}</h3>
                    <p style={{ margin: "0 0 10px", fontSize: 12, color: "#666", lineHeight: 1.5 }}>{p.desc}</p>

                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>
                      {p.specs.slice(0, 2).map(s => (
                        <span key={s} style={{
                          background: "#111", border: "1px solid #333", borderRadius: 4,
                          padding: "2px 7px", fontSize: 10, color: "#777"
                        }}>{s}</span>
                      ))}
                      {p.specs.length > 2 && (
                        <span style={{ fontSize: 10, color: "#555", alignSelf: "center" }}>+{p.specs.length - 2}개</span>
                      )}
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <Stars rating={p.rating} />
                      <span style={{ fontSize: 11, color: "#555", marginLeft: 6 }}>({p.reviews.toLocaleString()})</span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 }}>
                      <div>
                        <div style={{ fontSize: 11, color: "#555", textDecoration: "line-through" }}>
                          {p.originalPrice.toLocaleString()}원
                        </div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>
                          {p.price.toLocaleString()}<span style={{ fontSize: 13 }}>원</span>
                        </div>
                      </div>
                      <span style={{ background: "#2d1515", color: "#f87171", padding: "3px 9px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                        {Math.round((1 - p.price / p.originalPrice) * 100)}% OFF
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => handleAddToCart(p)} style={{
                        flex: 1, padding: "10px 0",
                        background: inCart
                          ? "linear-gradient(135deg, #059669, #10b981)"
                          : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        border: "none", borderRadius: 8, color: "#fff",
                        fontSize: 13, fontWeight: 700, cursor: "pointer"
                      }}>
                        {inCart ? `✓ 담김 (${inCart.qty})` : "장바구니 담기"}
                      </button>
                      <button onClick={() => toggleWishlist(p.id)} style={{
                        width: 40, padding: "10px 0",
                        background: inWish ? "#2d0a1a" : "#111",
                        border: `1px solid ${inWish ? "#e11d48" : "#333"}`,
                        borderRadius: 8, fontSize: 16, cursor: "pointer"
                      }}>{inWish ? "❤️" : "🤍"}</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Review Section */}
      <section style={{ background: "#111", borderTop: "1px solid #222", padding: "48px 0" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px" }}>
          <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 800 }}>리뷰 작성</h2>
          <p style={{ color: "#555", margin: "0 0 28px", fontSize: 14 }}>구매하신 상품의 솔직한 리뷰를 남겨주세요</p>
          {reviewSubmitted ? (
            <div style={{
              background: "#0f2e1a", border: "1px solid #166534", borderRadius: 12,
              padding: "20px 24px", color: "#4ade80", fontSize: 15
            }}>✅ 리뷰가 등록되었습니다. 감사합니다!</div>
          ) : (
            <form
              action={async (fd) => { await submitReview(fd); setReviewSubmitted(true); setTimeout(() => setReviewSubmitted(false), 3000); }}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#666", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>상품 선택</label>
                  <select name="productId" style={{
                    width: "100%", padding: "11px 14px", background: "#1a1a1a",
                    border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 14
                  }}>
                    {PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#666", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>평점</label>
                  <select name="rating" style={{
                    width: "100%", padding: "11px 14px", background: "#1a1a1a",
                    border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 14
                  }}>
                    {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{"★".repeat(r)} {r}점</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "#666", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>리뷰 내용</label>
                <textarea name="content" rows={4} placeholder="솔직한 리뷰를 남겨주세요..." style={{
                  width: "100%", padding: "12px 14px", background: "#1a1a1a",
                  border: "1px solid #333", borderRadius: 8, color: "#fff",
                  fontSize: 14, boxSizing: "border-box", resize: "vertical"
                }} />
              </div>
              <button type="submit" style={{
                alignSelf: "flex-start", padding: "11px 32px",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                border: "none", borderRadius: 8, color: "#fff",
                fontSize: 14, fontWeight: 700, cursor: "pointer"
              }}>리뷰 등록</button>
            </form>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)", padding: "56px 0" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          <h2 style={{ margin: "0 0 8px", fontSize: 26, fontWeight: 800 }}>신상품 알림 구독</h2>
          <p style={{ color: "#666", margin: "0 0 28px" }}>최신 상품과 특가 정보를 이메일로 받아보세요.</p>
          {subscribed ? (
            <div style={{
              background: "#0f2e1a", border: "1px solid #166534", borderRadius: 12,
              padding: "16px 24px", color: "#4ade80"
            }}>✅ 구독이 완료되었습니다!</div>
          ) : (
            <form
              action={async (fd) => { await subscribeNewsletter(fd); setSubscribed(true); }}
              style={{ display: "flex", gap: 8 }}
            >
              <input name="email" type="email" placeholder="이메일 주소 입력" style={{
                flex: 1, padding: "12px 16px", background: "#111",
                border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 14
              }} />
              <button type="submit" style={{
                padding: "12px 24px", background: "#6366f1",
                border: "none", borderRadius: 8, color: "#fff",
                fontSize: 14, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap"
              }}>구독하기</button>
            </form>
          )}
        </div>
      </section>

      <footer style={{
        background: "#0a0a0a", borderTop: "1px solid #1a1a1a",
        padding: "28px 40px", textAlign: "center", color: "#444", fontSize: 13
      }}>
        © 2025 NexTech Store · Next.js 15.2.4 · React 19.1.0
      </footer>
    </div>
  );
}
