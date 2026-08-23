# Kế Hoạch Triển Khai: Hệ Thống Battle Arena Học Tiếng Nhật

## 📌 Tóm Tắt Chiến Lược Kiến Trúc (Tối Ưu 100% Cho AI Agent)

Hệ thống được thiết kế theo tư duy **Ponytail / YAGNI (Tối giản - Đúng nơi - Đúng chỗ)**, tối đa hóa khả năng sinh code chính xác của các AI Coding Agent (Cursor, Antigravity, Claude, Copilot):

- **Bỏ hoàn toàn Phaser 3**: Tránh monolithic bloat và lỗi nhầm lẫn API version khi AI sinh code.
- **Air Defense (Game Bắn Súng)**: Dùng **PixiJS + TypeScript** (Game loop 60 FPS siêu nhẹ ~100KB, va chạm AABB đơn giản, AI viết code TypeScript mượt mà không dính bug API).
- **Card Battle & Memory Match**: Dùng **React DOM + Framer Motion + Tailwind CSS** (Render chữ Kanji/Furigana nét tuyệt đối bằng font web, lật bài 3D và drag-drop mượt mà).
- **Backend Realtime**: **Spring Boot + Java 21 + STOMP over WebSocket/SockJS** (Tận dụng backend Java Web và cơ chế xác thực hiện có).
- **AI Validation Pipeline 4 Tầng**: Exact Match -> Fuzzy Match -> Redis Semantic Cache (vector tùy chọn) -> Async OpenAI API (MVP có thể tắt tầng semantic/vector).
- **Voice Chat**: **WebRTC Mesh P2P** kết hợp STUN/TURN được cấu hình qua environment; WebSocket Java chỉ làm signaling/control.

---

## 🛠️ Tech Stack Chuẩn Hóa Toàn Dự Án

| Thành phần | Công nghệ Chọn Lựa | Lý do Tối Ưu & Phù Hợp Cho AI Agent |
| :--- | :--- | :--- |
| **Game Engine 2D** | **PixiJS + TypeScript (Chỉ Air Defense)** | Siêu nhẹ (~100KB), API modular ngắn gọn. AI Agent sinh code TS chuẩn 100% không bao giờ sai API. |
| **DOM Animation** | **Framer Motion** | Đảm nhận 100% UI Animation, Card Flip 3D, Drag & Drop. Giảm 60% bundle size so với GSAP. |
| **Frontend Framework**| **Thymeleaf + vanilla JS (shell) · React + Vite + Tailwind (bàn chơi)** | Shell Phase 1 đã chạy tốt nên giữ nguyên; chỉ bàn chơi từng minigame là bundle React build sẵn vào `static/arena/app/`. |
| **State Management**| **Zustand (trong bundle React) · GameRoomStore (shell)** | Siêu nhẹ (~1KB), đồng bộ State 2 chiều giữa React DOM và PixiJS Canvas mượt mà. Shell tiếp tục dùng `GameRoomStore` của Phase 1. |
| **Backend Web/Realtime** | **Spring Boot + Java 21 + STOMP/SockJS** | Giữ nguyên backend Java Web, Spring Security/JPA và endpoint WebSocket đã có. |
| **Database** | **MySQL** | Lưu dữ liệu quan hệ, người dùng, vocabulary, match, rating và achievement theo schema hiện tại. Không bắt buộc PostgreSQL hay `pgvector`. |
| **Caching & Queue** | **Redis (ZSET + Pub/Sub + Semantic Cache tùy chọn)** | Matchmaking ELO, cross-instance event fan-out và cache câu trả lời; vector search chỉ bật khi hạ tầng Redis hỗ trợ. |
| **Voice Chat** | **WebRTC Mesh P2P + STUN/TURN** | Audio đi trực tiếp giữa trình duyệt; TURN cần cấu hình triển khai riêng khi cần relay. |
| **AI Engine** | **Pipeline 4 Tầng + OpenAI Fallback**| 90% câu trả lời xử lý < 10ms bằng Exact/Fuzzy Match & Redis Cache. |

---

## 🏗️ Chi Tiết Kiến Trúc 3 Minigame

### 1. Air Defense (Game Bắn Súng / Phòng Thủ Khung Thành - Solo hoặc 2 Người)
- **Engine**: **PixiJS + TypeScript** bọc trong React Component (`useRef` Canvas).
- **Physics & Collision**: Kiểm tra va chạm AABB / Radius đơn giản trong Pixi `ticker` loop (không dùng physics engine nặng).
- **Sprite & Animation**: PixiJS `Spritesheet`, `ParticleContainer` cho hiệu ứng nổ 60 FPS.
- **Luồng Realtime**: Solo hoặc Pháo A & Pháo B đồng bộ state qua STOMP payload nhẹ; không gửi vị trí mỗi frame.

### 2. Card Battle (Game Thẻ Bài Chiến Thuật - 2 đến 4 Người)
- **Engine**: **React DOM + Framer Motion** (Không dùng Canvas).
- **Tính năng**: Thẻ bài Lật 3D (`rotateY`), Drag & Drop bài vào sân đấu, hiệu ứng Fog Card, Bomb Card, Mirror Card bằng CSS/Framer Motion.
- **Chữ Nhật**: Font Kanji chuẩn nét, hỗ trợ tag Furigana `<ruby>漢字<rt>かんじ</rt></ruby>`.

### 3. Memory Match (Lật Thẻ Tìm Cặp - Solo hoặc 2 đến 4 Người)
- **Engine**: **React DOM + Tailwind CSS Grid + Framer Motion**.
- **Tính năng**: Lưới 4x4, 6x6 responsive, hiệu ứng lật bài 3D mượt 60 FPS, đồng bộ lượt lật realtime giữa các người chơi.

---

## ⚡ Kiến Trúc AI Validation Pipeline (4 Tầng Tốc Độ & Tiết Kiệm)

```text
User Answer ──> [Tầng 1: Exact & Normalization Match] (0ms) ──Hit──> Chấp nhận ngay
                      │ Miss
                [Tầng 2: Fuzzy String / Levenshtein] (1ms) ──Hit──> Chấp nhận (Lỗi chính tả nhẹ)
                      │ Miss
                [Tầng 3: Redis Semantic Cache / Vector tùy chọn] (5-10ms) ──Hit──> Chấp nhận (Đồng nghĩa có sẵn)
                      │ Miss
                [Tầng 4: Gọi OpenAI API GPT-4o-mini] (800ms) ──> Trả kết quả & Lưu vào Cache
```

Tầng 3 không yêu cầu PostgreSQL/`pgvector`. Với MVP, Redis có thể dùng cache key theo câu hỏi + câu trả lời đã chuẩn hóa; vector index chỉ là tùy chọn khi Redis Search/Vector Search được triển khai.

---

## 🗺️ Lộ Trình Triển Khai (Implementation Roadmap)

### Phase 1: Core Foundation & Infrastructure (Tuần 1 - 2) — ĐÃ XONG
- [x] Giữ Spring Boot Java Web backend hiện tại; shell Arena (auth / catalog / lobby / room) làm bằng Thymeleaf + vanilla JS + CSS tokens.
- [x] Dựng Base UI theo Style Anime / Game (`arena/css/tokens.css`, `base.css`, `room.css`, `games.css` + font Nhật).
- [x] Spring STOMP/SockJS `/ws-arena` + room registry in-memory, countdown/reconnect/grace, rate limit, phân quyền SUBSCRIBE.
- [ ] Redis Pub/Sub/ZSET + Matchmaking Queue (hoãn: single-instance in-memory là fallback đã ghi trong PHASE/README.md).
- [x] AI Validation Pipeline deterministic (NFKC/Exact/Alias/Kana/Fuzzy bảo thủ) dùng chung cho game nhập text; Redis semantic cache và OpenAI fallback vẫn là phần mở rộng tùy chọn.

### Phase 2: Game 3 (Memory Match) & Game 2 (Card Battle) (Tuần 3 - 4)
- [x] **Phase 2A — Memory Match**: backend server-authoritative (bàn thẻ, lượt, timer, verdict) + bàn chơi React DOM + Framer Motion; hỗ trợ Solo và Realtime 2–4 người.
- [ ] Phase 2B — Card Battle (React DOM + Framer Motion 3D Flip & Drag-Drop).
- [ ] Tích hợp Thẻ đặc biệt (Bomb, Mirror, Fog, Time Warp) & Buff.

### Phase 3: Game 1 (Air Defense với PixiJS + TS) (Tuần 5 - 6) — ĐÃ XONG
- [x] Tích hợp PixiJS Canvas vào React Component qua Zustand Sync cho Solo và 1v1.
- [x] Xây dựng Pixi Ticker Loop: máy bay, pháo, đạn, nổ particle và hiệu ứng impact theo timestamp authoritative.
- [x] Đồng bộ câu hỏi, đáp án, HP, điểm, combo và kết quả qua STOMP; solo dùng cùng engine nhưng không tạo đối thủ giả.
- [x] Persist kết quả vào MySQL, personal best cho solo, phòng 1v1 quay lại `WAITING` để tái đấu.

### Phase 4: Voice Chat, Spectator Mode & System Polish (Tuần 7 - 8)
- [ ] Triển khai WebRTC Mesh P2P Voice Chat (Mic toggle, Group audio).
- [ ] Xây dựng Spectator Mode (Khán giả xem trận đấu qua STOMP destination được server phân quyền).
- [ ] Hệ thống ELO Rating, Level, Achievements & Leaderboard.

---

## ✅ Quy Ước Xác Minh

- Ưu tiên manual QA trên browser và nhiều phiên người dùng thật.
- Không bắt buộc viết unit test, integration test, contract test hoặc testcase tự động mới cho các phase.
- Vẫn phải chạy backend/frontend build và ghi lại các kịch bản manual đã kiểm tra, lỗi còn tồn tại và giới hạn đã biết.

---

## 🎨 Định Hướng Thiết Kế UI/UX (Anime / Game Style)

- **UI rules chung**: Tuân thủ đầy đủ [PHASE/UI_RULES.md](PHASE/UI_RULES.md) cho design tokens, responsive layout, accessibility, trạng thái realtime, Japanese IME, solo/multiplayer và spectator.
- **Reference-based design**: Được nghiên cứu pattern từ game cùng thể loại để cải thiện hierarchy, feedback và interaction; không sao chép asset, trade dress, iconography hoặc animation đặc trưng của game thương mại.
- **Palette**: Màu sắc tương phản cao, lấy cảm hứng từ Persona 5 / Genshin Impact / Nintendo UI.
- **Font**: Noto Sans JP / Zen Maru Gothic cho chữ Nhật, phối hợp cùng Font Game Pixel/Retro cho chỉ số.
- **Hiệu ứng**: Floating Cards, Glow Effect, Screen Shake khi bắn nổ, Victory Banner hào hoa.
