# 📘 TÀI LIỆU YÊU CẦU PHẦN MỀM (SRS) - AIR DEFENCE
**Dự Án:** Japanese Learning Arena System (J-LAS)  
**Tựa Game:** Air Defence (Phòng Thủ Không Trung / Bắn Súng Vũ Trụ Sci-Fi)  
**Phiên Bản:** 2.0 (Endless Roguelike, Mywords Mechanics & PvP Edition)  
**Ngày Cập Nhật:** 23/08/2026  

---

## 📌 1. GIỚI THIỆU & MỤC TIÊU DỰ ÁN (INTRODUCTION & OBJECTIVES)

### 1.1 Tóm Tắt Tựa Game
**Air Defence** là tựa game bắn súng phòng thủ 2D kết hợp học tiếng Nhật thời gian thực (Realtime Japanese Learning Arcade). Người chơi nhập vai vào người điều khiển **Tàu Chiến Vũ Trụ**, có nhiệm vụ bảo vệ **Hành Tinh Mẹ** khỏi sự xâm lược của các quái vật không gian, phi thuyền địch và các thiên thạch mang từ vựng tiếng Nhật (Kanji / Hiragana / Nghĩa).

Game được phát triển theo hai chế độ chính:
1. **Endless Roguelike (Chơi Đơn Vô Tận):** Thử thách sinh tồn qua các Wave quái vật ngày càng dồn dập, tích lũy Coin và chọn các **Lõi Nâng Cấp (Augments)** ngẫu nhiên sau mỗi 3 Wave (cơ chế tương tự TFT).
2. **Multiplayer PvP Survival (Thi Đấu 1v1 Realtime):** Hai người chơi bảo vệ 2 hành tinh riêng biệt. Người gõ chính xác và tạo chuỗi Combo cao sẽ gửi thêm quái vật/chướng ngại vật sang quấy rối đối thủ. Người chơi nào cạn HP trước sẽ thất bại.

### 1.2 Mục Tiêu Thiết Kế
* **Tính Giáo Dục Cao:** Ép phản xạ gõ tiếng Nhật (Kanji $\rightarrow$ Reading / Meaning) dưới áp lực thời gian thực 60 FPS.
* **Tính Giải Trí & Khả Năng Chơi Lại (Replayability):** Nhờ cơ chế Roguelike ngẫu nhiên hóa các Lõi nâng cấp và bộ sưu tập Tàu chiến đa dạng.
* **Server-Authoritative:** Server quản lý 100% logic HP, đếm sóng, tính điểm và xác thực đáp án để chống gian lận tuyệt đối.

---

## 🏗️ 2. KHUNG CÔNG NGHỆ (TECH STACK ARCHITECTURE)

Dự án áp dụng khung công nghệ chuẩn hóa đã quy hoạch tại [`implementPlan.md`](file:///d:/FPT/FA26/Web_Game/game/game/implementPlan.md):

| Thành Phần | Công Nghệ Lựa Chọn | Vai Trò & Tối Ưu Kỹ Thuật |
| :--- | :--- | :--- |
| **Game Render Engine** | **PixiJS 8 (WebGL 2D) + TypeScript** | Render 60 FPS mượt mà cho 100+ sprite (Tàu chiến, đạn laser, nổ hạt, quái vật không gian). Tải siêu nhẹ (~100KB). |
| **UI & DOM Animation** | **React 19 + Framer Motion + Tailwind CSS** | Quản lý HUD (HP, Shield, Coin), Modal chọn Lõi nâng cấp (3D Flip Card), Shop tàu chiến. |
| **State Management** | **Zustand** | Lưu trữ Local Game State, làm cầu nối đồng bộ 2 chiều cực mượt giữa PixiJS Ticker và React UI. |
| **Realtime Transport** | **Spring WebSocket + STOMP over SockJS** | Điểm kết nối `/ws-arena`, giao thức nhẹ, bù độ lệch đồng hồ mạng (`clockSkewMs`). |
| **Backend Framework** | **Java 21 + Spring Boot 3.5.7** | Xử lý logic phòng, đếm đợt sóng (Wave Manager), Server Snapshot & Room Sweeper. |
| **Database & Cache** | **MySQL 8.4 + Redis** | MySQL lưu Tiến trình/Tàu chiến/Lịch sử; Redis lưu ELO Leaderboard (ZSET) & Session State. |
| **AI Validation** | **Pipeline 4 Tầng (Exact -> Fuzzy -> Cache)** | Phân tích đáp án gõ tiếng Nhật của người chơi với tốc độ $< 10\text{ms}$. |

---

## 🎮 3. YÊU CẦU CHỨC NĂNG CHI TIẾT (FUNCTIONAL REQUIREMENTS)

### 3.1 Core Gameplay & Chế Độ Vô Tận (Endless Survival Mode)

#### A. Cơ Chế Nhắm Bắn Chuẩn Mywords & Tiêu Diệt Quái Vat
* **Hiển thị Từ Vựng:** Mỗi Quái vật / Phi thuyền / Thiên thạch xuất hiện trên màn hình sẽ mang 1 thẻ từ vựng tiếng Nhật (Ví dụ: Kanji `猫`, người chơi cần gõ `ねこ` hoặc `neko`).
* **Tia Laser Ngắm Bắn (Lock-on Reticle):** Khi người chơi gõ từ vựng đúng $\rightarrow$ Tia Laser màu xanh Neon chiếu thẳng ngắm mục tiêu trong tích tắc trước khi pháo giật (recoil) và phóng đạn tiêu diệt quái.
* **Thanh Nạp Tuyệt Chiêu Combo (Hyper Beam Gauge):** Chuỗi gõ đúng (Combo x3, x5, x10) nạp đầy thanh năng lượng. Đạt 100% $\rightarrow$ Tự động phóng **Tia Pháo Siêu Cấp (Hyper Beam)** quét sạch toàn bộ quái vật.
* **Vùng Cảnh Báo Danger Zone 75%:** Khi quái vật rơi quá 75% chiều cao màn hình $\rightarrow$ Màn hình viền đỏ nhấp nháy liên tục kèm còi cảnh báo nguy hiểm (Warning Siren SFX).
* **Cơ chế Sát Thương (Damage Mechanics):**
  * Quái vật di chuyển từ rìa màn hình tiến về phía **Hành Tinh / Tàu Chiến** ở trung tâm.
  * Nếu người chơi không kịp gõ đúng từ trước khi Quái vật va chạm vào Hành tinh $\rightarrow$ Hành tinh bị trừ HP, màn hình bị rung (Screen Shake) và tạo hiệu ứng cảnh báo đỏ.
  * Nếu HP Hành tinh giảm về `0` $\rightarrow$ Kết thúc ván chơi (**GAME OVER**).

#### B. Đợt Sóng Quái Vật (Wave Progression)
* Game không có điểm dừng, chia thành các **Wave** (Làn sóng).
* Mỗi Wave chứa số lượng quái nhất định. Càng về các Wave sau:
  * Tốc độ di chuyển của Quái vật tăng lên.
  * Từ vựng xuất hiện có độ dài lớn hơn hoặc thuộc cấp độ JLPT cao hơn (N5 $\rightarrow$ N4 $\rightarrow$ N3).
  * Mật độ quái xuất hiện dày đặc hơn.

---

### 3.2 Hệ Thống Lõi Nâng Cấp Dạng TFT (Roguelike Augments System)

#### A. Quy Trình Kích Hoạt (Augment Trigger)
* **Tần suất:** Sau khi hoàn thành xuất sắc mỗi **3 Wave** (Ví dụ: Sau Wave 3, Wave 6, Wave 9...), game sẽ tự động tạm dừng (Pause Wave) và hiển thị **Modal Chọn Lõi Nâng Cấp**.
* **Giao diện:** Hiển thị 3 Thẻ Lõi Nâng Cấp ngẫu nhiên với hiệu ứng lật bài 3D.

#### B. Cơ Chế Reroll (Đổi Bài)
* Người chơi được cấp **3 lần Reroll (Đổi lại bài)** miễn phí trong mỗi ván chơi.
* Nhấp nút `Reroll` $\rightarrow$ Hệ thống xáo trộn và rút lại 3 Lõi nâng cấp mới từ Kho Lõi (Augment Pool).

#### C. Phân Loại Lõi Nâng Cấp (Augment Pool Categories)
1. **Lõi Sát Thương & Tốc Độ (Offensive Cores):**
   * *Đạn Xuyên Thấu:* Đạn bắn ra xuyên qua mục tiêu, tiêu diệt thêm 1 quái phía sau.
   * *Pháo Đôi (Dual Cannon):* Bắn 2 viên đạn cùng lúc.
   * *Đạn Băng Giá:* Làm chậm 20% tốc độ di chuyển của tất cả quái vật.
2. **Lõi Phòng Thủ & Hồi Phục (Defensive Cores):**
   * *Lá Chắn Năng Lượng:* Tạo giáp ảo hấp thụ 3 lần va chạm quái.
   * *Sửa Chữa Vũ Trụ:* Hồi phục 30% HP cho Hành tinh ngay lập tức.
3. **Lõi Kinh Tế & Tiện Ích (Utility Cores):**
   * *Nam Châm Vàng:* Tăng 50% số lượng Coin rớt ra từ quái.
   * *Thời Gian Ngưng Đọng:* Tăng thời gian đếm ngược của quái thêm 1.5 giây.

*Lưu ý quan trọng:* Tất cả các Lõi Nâng Cấp này **chỉ có hiệu lực trong ván chơi hiện tại**. Khi Game Over, toàn bộ Lõi nâng cấp sẽ bị reset về 0.

---

### 3.3 Hệ Thống Kinh Tế & Cửa Hàng Out-of-Game (In-Game Economy & Shop)

#### A. Thu Thập Tiền Tệ (In-Game Coin)
* Khi Quái vật bị tiêu diệt, Coin sẽ rớt ra và tự động bay về phía Tàu chiến (Auto-magnet).
* Số Coin thu thập được sẽ cộng thẳng vào **Số Dư Coin Tài Khoản Vĩnh Viễn** của người chơi sau khi kết thúc trận đấu.

#### B. Cửa Hàng Tàu Chiến & Nâng Cấp Vĩnh Viễn (Out-of-Game Shop)
Người chơi dùng Coin tích lũy để mở khóa trong trang Cửa Hàng:
1. **Mua Tàu Chiến Mới (Ship Unlocks):** Mở khóa các mẫu tàu chiến mới với ngoại hình và chỉ số căn bản vượt trội.
2. **Nâng Cấp Vĩnh Viễn (Permanent Talent Tree):**
   * *Tăng HP Cơ Bản Hành Tinh:* Tăng HP tối đa ban đầu khi bắt đầu ván mới.
   * *Tăng Tỉ Lệ Rớt Coin:* Tăng % thưởng Coin cho mọi trận đấu.
   * *Khởi Đầu Nhanh (Fast Start):* Bắt đầu ván chơi với 1 Lõi nâng cấp ngẫu nhiên.

---

### 3.4 Hệ Thống Tàu Chiến Khác Biệt (Spaceship Class & Traits)

Mỗi Tàu chiến sở hữu các đặc điểm và **Kỹ Năng Nội Tại (Passive Skill)** riêng biệt:

| Tên Tàu Chiến | Loại / Vai Trò | Chỉ Số Đặc Biệt | Kỹ Năng Nội Tại (Passive Ability) |
| :--- | :--- | :--- | :--- |
| **Vanguard Alpha** *(Default)* | Cân bằng | HP: 100 \| Speed: 1.0x | KHÔNG có. Tàu tân thủ dễ điều khiển. |
| **Frostbyte Sentinel** | Khống chế | HP: 120 \| Speed: 0.8x | **Băng Tuyết:** Mỗi khi gõ đúng 5 từ liên tiếp, tự động đóng băng toàn bộ quái trong 2 giây. |
| **Hyperion Phantom** | Tốc độ / Combo | HP: 80 \| Speed: 1.4x | **Siêu Xung Lực:** Nhận thêm +100% điểm Combo khi gõ tốc độ $> 1.5$ từ/giây. |
| **Aegis Defender** | Phòng thủ | HP: 180 \| Speed: 0.7x | **Giáp Trọng Lực:** Giảm 30% sát thương nhận vào khi quái va chạm hành tinh. |

---

### 3.5 Vật Phẩm Tạm Thời Trong Trận (In-Match Power-up Items)

Trong quá trình tiêu diệt quái, sẽ có tỉ lệ ngẫu nhiên rớt ra các **Vật phẩm bổ trợ (Power-up Items)** trôi trên màn hình Canvas:

* **Cơ chế thu thập:** **Tự động thu thập (Auto-magnet)** — Ngay khi quái nổ, vật phẩm tự động hút về Tàu chiến và kích hoạt hiệu ứng ngay lập tức.
* **Các loại Power-up:**
  * 🧊 **Freeze Bomb (Bom Băng):** Đóng băng toàn bộ quái vật trên màn hình trong 3 giây.
  * 💣 **Nuke (Bom Hạt Nhân):** Tiêu diệt sạch toàn bộ quái vật hiện có trên màn hình.
  * 🛡️ **Energy Shield (Khiên Năng Lượng):** Chặn 1 lần va chạm quái kế tiếp.
  * ⚡ **Overclock (Bắn Siêu Tốc):** Tự động bắn nổ 3 quái vật gần nhất mà không cần gõ từ vựng.

---

### 3.6 Chế Độ Đa Người Chơi (Multiplayer PvP 1v1 Survival)

#### A. Quy Trình Thi Đấu
1. Hai người chơi kết nối vào cùng 1 Phòng chơi qua WebSocket (`/ws-arena`).
2. Màn hình chia làm 2 góc view độc lập: **Hành tinh Người chơi A (Bên trái)** và **Hành tinh Đối thủ B (Bên phải)**.
3. Cả 2 cùng đối mặt với các đợt sóng quái vật riêng. Người chơi nào để Hành tinh bị cạn HP trước $\rightarrow$ **THUA TRẬN (DEFEAT)**; người còn lại giành **CHIẾN THẮNG (VICTORY)**.

#### B. Cơ Chế Tấn Công Đối Thủ (Disruption Combo)
* Khi người chơi đạt **Chuỗi Combo gõ đúng 10, 15, 20 từ liên tiếp** $\rightarrow$ Kích hoạt hiệu ứng Tấn Công:
  * Gửi thêm **1 Quái Vật Khổng Lồ (Mini-Boss)** sang màn hình đối thủ.
  * Hoặc triệu hồi **Sương Mù (Fog Effect)** che phủ 2 từ vựng trên màn hình đối thủ trong 4 giây.

#### C. Đồng Bộ Chọn Lõi Nâng Cấp Trong PvP
* Sau mỗi 3 Wave, màn hình cả 2 người chơi cùng dừng lại để chọn Lõi nâng cấp.
* Mỗi người chơi có **15 giây đếm ngược** để chọn Lõi riêng cho mình mà không ảnh hưởng tới người kia.

---

### 3.7 Bảng Ôn Tập Từ Vựng Yếu & Xếp Hạng (Weak Words Review & Leaderboards)

* **Bảng Ôn Tập Từ Vựng Yếu (Weak Words Review Summary):** Màn hình Game Over / Victory tổng kết chi tiết danh sách các từ vựng người chơi **gõ sai hoặc phản ứng chậm** để giúp ôn tập từ vựng tiếng Nhật hiệu quả cao như ứng dụng Mywords.
* **Bảng Xếp Hạng Chơi Đơn (Endless Leaderboard):** Xếp hạng dựa trên Điểm Số Cao Nhất (High Score) và Wave Cao Nhất đạt được.
* **Bảng Xếp Hạng PvP Ranked (ELO Rating System):**
  * Thắng trận PvP: $+\Delta\text{ELO}$ (Phụ thuộc vào ELO đối thủ).
  * Thua trận PvP: $-\Delta\text{ELO}$.
  * Phân hạng Rank: Đồng $\rightarrow$ Bạc $\rightarrow$ Vàng $\rightarrow$ Kim Cương $\rightarrow$ Tinh Anh Vũ Trụ.

---

## 📐 4. YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS)

### 4.1 Hiệu Năng & Độ Trễ (Performance & Latency)
* **Canvas Frame Rate:** Canvas PixiJS bắt buộc duy trì **$\ge 60$ FPS** ổn định trên cả máy tính bàn và laptop phổ thông.
* **WebSocket Latency:** Thời gian phản hồi gửi/nhận packet STOMP WebSocket giữa Client và Server **$< 30\text{ms}$**.

### 4.2 UI/UX & Chuẩn Tiếng Nhật (Japanese IME Compatibility)
* **Giao diện Visual:** Phong cách **Ngoài Không Gian (Deep Space / Sci-Fi Arcade)** rực rỡ với nền không gian vũ trụ huyền ảo, tinh vân (Nebula), các dải sao lấp lánh (Starfield) và hiệu ứng HUD Sci-Fi hiện đại. Màu chủ đạo: Space Void Black (`#0B0E14`), Deep Cosmic Blue (`#101827`), Neon Cyan (`#00F0FF`), Electric Violet (`#8A2BE2`), kết hợp các khung kính mờ Glassmorphism 20px với viền phát sáng Neon (Glow Effect).
* **Japanese IME:** Ô `<input>` gõ từ vựng bắt buộc kiểm tra thuộc tính `event.isComposing`. Không được phép tự động submit hoặc xóa ký tự khi người chơi đang trong quá trình biến đổi Hiragana/Kanji.

### 4.3 Chống Gian Lận (Server-Authoritative)
* Client tuyệt đối **KHÔNG được tự tính HP, Score hay kiểm tra từ vựng đúng/sai**.
* Toàn bộ hành vi gõ từ vựng của người chơi chỉ gửi chuỗi ký tự (`rawInput`) về Server. Server thực thi `JapaneseAnswerValidationService` và broadcast kết quả về Client.

### 4.4 Yêu Cầu Thiết Kế Responsive & Tối Ưu Mobile (Mobile Responsive & Touch UX)

#### A. Thích Ứng Màn Hình & Layout Bố Cục (Screen Adaptability & Viewport)
1. **Chế Độ Màn Hình Dọc (Mobile Portrait Mode):**
   * **Bố cục Canvas PixiJS:** Tự động chuyển đổi tỷ lệ Viewport. Hành tinh Mẹ / Tàu chiến nằm ở dưới đáy màn hình (`y = 85%`), các đợt Quái vật xâm lược rơi từ đỉnh màn hình (`y = 0%`) xuống theo chiều dọc.
   * **Tự Động Scale Khung Nhìn (Dynamic Resizing):** Sử dụng `window.visualViewport` API để lắng nghe sự kiện Bàn Phím Ảo (Native Virtual Keyboard) mở lên. Canvas tự động co giãn (Rescale) hoặc đẩy cụm Tàu chiến lên phía trên phần bàn phím, đảm bảo **quái vật và tàu không bị bàn phím ảo che khuất**.
2. **Chế Độ Màn Hình Ngang (Mobile Landscape Mode):**
   * Giữ nguyên giao diện chuẩn PC (16:9), tự động căn giữa viewport và ẩn các thanh điều hướng của trình duyệt web di động (`fullscreen` mode prompt).
3. **Bố Cục Chế Độ Multiplayer 1v1 Trên Mobile:**
   * Màn hình chính tập trung 100% diện tích cho **Góc nhìn của Người chơi A**.
   * **Thanh Trạng Thái Đối Thủ (Opponent HUD Mini-Bar):** Hiển thị ở góc trên màn hình dưới dạng Mini-Card nhỏ (HP bar đối thủ, số Combo và biểu tượng Cảnh báo Tấn công) thay vì chia đôi màn hình dọc gây chật chội.

#### B. Bàn Phím Ảo & Xử Lý Nhập Liệu Tiếng Nhật (Touch IME & Custom Virtual Keyboard)
1. **Tự Động Mở Bàn Phím Native:**
   * Khi bắt đầu ván chơi, thẻ `<input>` ẩn/hiện được tự động `focus()` để kích hoạt Bàn phím ảo tiếng Nhật của điện thoại (iOS Japanese Flick Keyboard / Android Gboard).
2. **Bàn Phím Ảo On-Screen Tùy Chọn (In-Game Soft Keyboard Fallback):**
   * Cung cấp tùy chọn bật **Bàn phím ảo Flick Input Tiếng Nhật** ngay trên màn hình Canvas (Thiết kế phẳng mờ Anime Style).
   * Giúp người chơi có thể gõ nhanh Romaji / Hiragana mà không bị bàn phím mặc định của hệ điều hành chiếm diện tích màn hình.

#### C. Tương Tác Cảm Ứng & Trải Nghiệm Người Dùng Mobile (Touch UX & Gestures)
* **Kích Thước Nút Chấm Cảm Ứng (Touch Target Size):** Tất cả các nút bấm React UI (Chọn Lõi Nâng Cấp, Reroll, Shop, Ready) trên thiết bị di động phải đạt kích thước tối thiểu **$48 \times 48\text{px}$** với khoảng cách padding an toàn để tránh chạm nhầm.
* **Chống Cuộn & Phóng To Trái Phép (Gesture Locks):**
  * Thêm thuộc tính CSS `touch-action: manipulation;` và meta tag `user-scalable=no` ngăn chặn thao tác double-tap zoom hoặc vuốt trang làm trôi canvas khi đang gõ nhanh.

#### D. Giới Hạn Phần Cứng & Hiệu Năng Pin / GPU Di Động (Mobile Performance & Battery Optimization)
* **Giới Hạn Device Pixel Ratio (DPR Capping):** Đối với các dòng điện thoại có màn hình Retina/OLED độ phân giải cực cao (DPR $\ge 3.0$), Canvas PixiJS tự động giới hạn `resolution: Math.min(window.devicePixelRatio, 2.0)` để tránh quá tải GPU di động gây nóng máy và sụt FPS.
* **Tối Ưu Hóa Bộ Nhớ (Asset Compression & Memory Limits):**
  * Tải Sprite Sheets dưới định dạng `.webp` được nén tối ưu.
  * Khi ứng dụng di động chuyển sang trạng thái chạy ngầm (Tab Blur / App Switch), PixiJS Ticker tự động `stop()` để tiết kiệm pin tối đa cho thiết bị di động.

---

## 🗄️ 5. MÔ HÌNH DỮ LIỆU & API DESIGN (DATABASE & API)

### 5.1 Bảng Cơ Sở Dữ Liệu Bổ Sung (MySQL Flyway Migration)

Bổ sung bảng lưu trữ Tàu chiến và Tiến trình người chơi vào `sql/migrations/V20260823_01__air_defense_v2_roguelike.sql`:

```sql
-- Bảng danh sách Tàu chiến trong game
CREATE TABLE IF NOT EXISTS `air_defense_spaceships` (
    `ship_id` VARCHAR(64) PRIMARY KEY,
    `name` VARCHAR(128) NOT NULL,
    `description` TEXT,
    `price_coins` INT NOT NULL DEFAULT 0,
    `base_hp` INT NOT NULL DEFAULT 100,
    `passive_skill_code` VARCHAR(64),
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bảng sở hữu Tàu chiến của Người dùng
CREATE TABLE IF NOT EXISTS `user_spaceships` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `ship_id` VARCHAR(64) NOT NULL,
    `purchased_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
    FOREIGN KEY (`ship_id`) REFERENCES `air_defense_spaceships`(`ship_id`),
    UNIQUE KEY `uk_user_ship` (`user_id`, `ship_id`)
);

-- Bảng Tiến trình Nâng cấp Vĩnh viễn (Talent Tree)
CREATE TABLE IF NOT EXISTS `user_permanent_upgrades` (
    `user_id` BIGINT PRIMARY KEY,
    `coins_balance` INT NOT NULL DEFAULT 0,
    `extra_base_hp_level` INT NOT NULL DEFAULT 0,
    `coin_bonus_level` INT NOT NULL DEFAULT 0,
    `reroll_count_level` INT NOT NULL DEFAULT 0,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
);
```

### 5.2 Các REST API Mới
* `GET /api/air-defense/shop/ships`: Lấy danh sách Tàu chiến & trạng thái sở hữu của User.
* `POST /api/air-defense/shop/buy-ship/{shipId}`: Mua Tàu chiến mới bằng Coin.
* `POST /api/air-defense/shop/upgrade-talent`: Nâng cấp chỉ số vĩnh viễn bằng Coin.
* `GET /api/air-defense/leaderboard/endless`: Lấy Bảng xếp hạng Endless Top Score.
* `GET /api/air-defense/leaderboard/ranked`: Lấy Bảng xếp hạng ELO PvP.

### 5.3 Payload Realtime WebSocket STOMP

#### Client $\rightarrow$ Server: Gõ Đáp Án
`Destination: /app/air-defense/{sessionId}/answer`
```json
{
  "targetId": "aircraft_102",
  "rawInput": "ねこ",
  "clientTimestamp": 1755998000000
}
```

#### Client $\rightarrow$ Server: Chọn Lõi Nâng Cấp
`Destination: /app/air-defense/{sessionId}/select-augment`
```json
{
  "waveIndex": 3,
  "augmentId": "AUG_DUAL_CANNON",
  "isReroll": false
}
```

#### Server $\rightarrow$ Client: Broadcast State Snapshot (30 Hz)
`Subscription: /topic/air-defense/{sessionId}`
```json
{
  "sessionId": "sess_89123",
  "wave": 4,
  "hpRemaining": 85,
  "maxHp": 100,
  "score": 450,
  "coinsCollected": 35,
  "activeBuffs": ["AUG_DUAL_CANNON"],
  "targets": [
    {
      "id": "aircraft_105",
      "kanji": "犬",
      "type": "MONSTER_FAST",
      "posX": 450.5,
      "posY": 120.0,
      "speed": 2.5
    }
  ]
}
```

---

## 🏆 6. TỔNG KẾT & QUY TRÌNH KIỂM THỬ (VERIFICATION & SUMMARY)

Tài liệu SRS này quy định 100% chi tiết tính năng cho **Air Defence Edition 2.0**. Khi triển khai, cần nghiệm thu theo các tiêu chí:
1. **Kiểm thử Endless Wave & Augment:** Đảm bảo cứ sau 3 Wave màn hình hiện chọn Lõi, nút Reroll hoạt động tối đa 3 lần.
2. **Kiểm thử Multiplayer PvP:** Đảm bảo khi Player A cạn HP thì màn hình GameOver hiển thị lập tức và tính kết quả Thắng/Thua chính xác cho 2 bên.
3. **Kiểm thử Canvas & Performance:** Chạy thử nghiệm trên trình duyệt Chrome/Edge duy trì 60 FPS trong suốt 20 Wave liên tục mà không rò rỉ RAM.
