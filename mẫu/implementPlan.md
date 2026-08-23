# Kế Hoạch Triển Khai: Hệ Thống Battle Arena Học Tiếng Nhật

## 📌 Tóm Tắt Chiến Lược Kiến Trúc (Tối Ưu 100% Cho AI Agent)

Hệ thống được thiết kế theo tư duy **Ponytail / YAGNI (Tối giản - Đúng nơi - Đúng chỗ)**, tối đa hóa khả năng sinh code chính xác của các AI Coding Agent (Cursor, Antigravity, Claude, Copilot):

- **Bỏ hoàn toàn Phaser 3**: Tránh monolithic bloat và lỗi nhầm lẫn API version khi AI sinh code.
- **Air Defense (Game Bắn Súng)**: Dùng **PixiJS + TypeScript** (Game loop 60 FPS siêu nhẹ ~100KB, va chạm AABB đơn giản, AI viết code TypeScript mượt mà không dính bug API).
- **Card Battle & Memory Match**: Dùng **React DOM + Framer Motion + Tailwind CSS** (Render chữ Kanji/Furigana nét tuyệt đối bằng font web, lật bài 3D và drag-drop mượt mà).
- **Backend Realtime (< 20ms)**: **NestJS + Socket.IO v4 Official** (Độ trễ siêu thấp, mượt hơn và ít bug disconnect hơn so with Spring Boot 3rd-party lib).
- **AI Validation Pipeline 4 Tầng**: Exact Match -> Fuzzy Match -> Redis Vector Cache -> Async OpenAI API (Cắt 80% chi phí AI, 90% câu trả lời được xử lý dưới 10ms).
- **Voice Chat 0đ Hạ Tầng**: **WebRTC Mesh P2P** kết hợp STUN/TURN miễn phí cho phòng 2-4 người chơi.

---

## 🛠️ Tech Stack Chuẩn Hóa Toàn Dự Án

| Thành phần | Công nghệ Chọn Lựa | Lý do Tối Ưu & Phù Hợp Cho AI Agent |
| :--- | :--- | :--- |
| **Game Engine 2D** | **PixiJS + TypeScript (Chỉ Air Defense)** | Siêu nhẹ (~100KB), API modular ngắn gọn. AI Agent sinh code TS chuẩn 100% không bao giờ sai API. |
| **DOM Animation** | **Framer Motion** | Đảm nhận 100% UI Animation, Card Flip 3D, Drag & Drop. Giảm 60% bundle size so với GSAP. |
| **Frontend Framework**| **React + Vite + Tailwind CSS** | Vite khởi động siêu nhanh, Tailwind CSS dựng UI Game Anime/Nintendo tốc độ. |
| **State Management**| **Zustand** | Siêu nhẹ (~1KB), đồng bộ State 2 chiều giữa React DOM và PixiJS Canvas mượt mà. |
| **Realtime Engine** | **NestJS + Socket.IO v4 Official** | Socket.IO v4 chính hãng, mượt, tích hợp sẵn `@nestjs/websockets` và `@socket.io/redis-adapter`. |
| **Database** | **PostgreSQL + `pgvector`** | Lưu dữ liệu quan hệ, bảng xếp hạng và hỗ trợ `pgvector` để cache câu trả lời AI. |
| **Caching & Queue** | **Redis (ZSET + Pub/Sub)** | Matchmaking ELO qua Redis ZSET, WebSocket Pub/Sub và Semantic Cache. |
| **Voice Chat** | **WebRTC Mesh P2P + STUN/TURN** | Miễn phí hạ tầng SFU server cho phòng 2-4 người chơi. |
| **AI Engine** | **Pipeline 4 Tầng + OpenAI Fallback**| 90% câu trả lời xử lý < 10ms bằng Exact/Fuzzy Match & Redis Cache. |

---

## 🏗️ Chi Tiết Kiến Trúc 3 Minigame

### 1. Air Defense (Game Bắn Súng / Phòng Thủ Khung Thành - 2 Người)
- **Engine**: **PixiJS + TypeScript** bọc trong React Component (`useRef` Canvas).
- **Physics & Collision**: Kiểm tra va chạm AABB / Radius đơn giản trong Pixi `ticker` loop (không dùng physics engine nặng).
- **Sprite & Animation**: PixiJS `Spritesheet`, `ParticleContainer` cho hiệu ứng nổ 60 FPS.
- **Luồng Realtime**: Pháo A & Pháo B sync tọa độ & đạn qua Socket.IO payload nhẹ (MessagePack delta).

### 2. Card Battle (Game Thẻ Bài Chiến Thuật - 2 đến 4 Người)
- **Engine**: **React DOM + Framer Motion** (Không dùng Canvas).
- **Tính năng**: Thẻ bài Lật 3D (`rotateY`), Drag & Drop bài vào sân đấu, hiệu ứng Fog Card, Bomb Card, Mirror Card bằng CSS/Framer Motion.
- **Chữ Nhật**: Font Kanji chuẩn nét, hỗ trợ tag Furigana `<ruby>漢字<rt>かんじ</rt></ruby>`.

### 3. Memory Match (Lật Thẻ Tìm Cặp - 2 đến 4 Người)
- **Engine**: **React DOM + Tailwind CSS Grid + Framer Motion**.
- **Tính năng**: Lưới 4x4, 6x6 responsive, hiệu ứng lật bài 3D mượt 60 FPS, đồng bộ lượt lật realtime giữa các người chơi.

---

## ⚡ Kiến Trúc AI Validation Pipeline (4 Tầng Tốc Độ & Tiết Kiệm)

```text
User Answer ──> [Tầng 1: Exact & Normalization Match] (0ms) ──Hit──> Chấp nhận ngay
                      │ Miss
                [Tầng 2: Fuzzy String / Levenshtein] (1ms) ──Hit──> Chấp nhận (Lỗi chính tả nhẹ)
                      │ Miss
                [Tầng 3: Redis Vector Semantic Cache] (5-10ms) ──Hit──> Chấp nhận (Đồng nghĩa có sẵn)
                      │ Miss
                [Tầng 4: Gọi OpenAI API GPT-4o-mini] (800ms) ──> Trả kết quả & Lưu vào Cache
```

---

## 🗺️ Lộ Trình Triển Khai (Implementation Roadmap)

### Phase 1: Core Foundation & Infrastructure (Tuần 1 - 2)
- [ ] Khởi tạo Repository Monorepo (React Vite Frontend + NestJS Backend).
- [ ] Dựng Base UI theo Style Anime / Game (Tailwind CSS + Fonts Nhật).
- [ ] Cấu hình Socket.IO Server NestJS + Redis Adapter + Matchmaking Queue.
- [ ] Triển khai AI Validation Pipeline (Exact Match + Fuzzy Match + Redis Cache).

### Phase 2: Game 3 (Memory Match) & Game 2 (Card Battle) (Tuần 3 - 4)
- [ ] Xây dựng Game Memory Match (React DOM + Framer Motion) hoàn chỉnh Realtime 1v1.
- [ ] Xây dựng Game Card Battle (React DOM + Framer Motion 3D Flip & Drag-Drop).
- [ ] Tích hợp Thẻ đặc biệt (Bomb, Mirror, Fog, Time Warp) & Buff.

### Phase 3: Game 1 (Air Defense với PixiJS + TS) (Tuần 5 - 6)
- [ ] Tích hợp PixiJS Canvas vào React Component qua Zustand Sync.
- [ ] Xây dựng Pixi Ticker Loop: Máy bay rơi, Pháo bắn, Nổ particle, AABB Collision.
- [ ] Đồng bộ hóa đạn và HP giữa 2 pháo người chơi qua Socket.IO.

### Phase 4: Voice Chat, Spectator Mode & System Polish (Tuần 7 - 8)
- [ ] Triển khai WebRTC Mesh P2P Voice Chat (Mic toggle, Group audio).
- [ ] Xây dựng Spectator Mode (Khán giả xem trận đấu qua Socket Room `spectate:{id}`).
- [ ] Hệ thống ELO Rating, Level, Achievements & Leaderboard.

---

## 🎨 Định Hướng Thiết Kế UI/UX (Anime / Game Style)

- **Palette**: Màu sắc tương phản cao, lấy cảm hứng từ Persona 5 / Genshin Impact / Nintendo UI.
- **Font**: Noto Sans JP / Zen Maru Gothic cho chữ Nhật, phối hợp cùng Font Game Pixel/Retro cho chỉ số.
- **Hiệu ứng**: Floating Cards, Glow Effect, Screen Shake khi bắn nổ, Victory Banner hào hoa.
