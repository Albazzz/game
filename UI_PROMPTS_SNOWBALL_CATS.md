# Snowball Cats — prompt bộ UI cho Stitch / Figma

Tài liệu này là bộ prompt thiết kế lại các màn hình hiện có của J-LAS Game Arena theo hướng game đấu tuyết 2D dễ thương. Dùng prompt bằng tiếng Anh để Stitch/Figma hiểu bố cục tốt hơn; phần copy hiển thị trong game giữ nguyên tiếng Việt như bên dưới.

## Cách dùng

- Dán `01 — Master art direction` trước mỗi prompt trang.
- Dùng đúng prompt trang tương ứng với route; không gộp gameplay với lobby hoặc màn kết quả.
- Hãy tạo component và text layer thật, không rasterize chữ vào background.
- Giữ nguyên route, API, session state và tên game type hiện tại; chỉ thay đổi visual/UI.
- Dùng ảnh `mẫu/ChatGPT Image 18_48_40 22 thg 8, 2026.png` như reference mood/layout, không sao chép nhân vật, logo, icon, composition hoặc asset độc quyền.

## 01 — Master art direction

```text
Design an original polished 2D casual game UI for J-LAS Game Arena, a Japanese-learning multiplayer arcade product. The game world is “Snowball Cats”: two cute chibi cats throw snowballs across soft snowy hills in a turn-based parabolic projectile battle. Take only the broad interaction idea from friendly 2D artillery games; do not copy any commercial game, logo, trademark, exact screen composition, character, icon, or asset.

Visual style: cheerful winter anime illustration, clean modern game HUD, soft cel shading, rounded glassy panels, thick white outline, subtle inner highlight, soft drop shadow, snow sparkle particles, layered blue sky and distant lavender mountains. Use a bright but controlled palette: ice blue #43B9F5, sky #8CD9FF, deep navy #163B69, snow #F7FCFF, royal blue #287ED5, coral red #F05B68, warm orange #FF9D2E, mint green #67D68B, gold #FFD75A. Use Noto Sans JP or a similar rounded sans-serif for text; use a bold condensed display face only for large numbers.

Character bible: Player 1 is an original orange tabby chibi cat wearing a cobalt-blue scarf; Player 2 is an original charcoal-gray tabby wearing a coral-red scarf. Both have expressive oversized eyes, tiny paws, readable silhouettes, and a playful competitive pose. Never make them look aggressive or realistic. Snowballs are round, bright white, slightly translucent with blue shadow, and leave a dotted white parabolic trail.

UI language: friendly arcade hierarchy, very high contrast, white labels on blue panels, green HP bars, orange primary CTA, red danger state, blue secondary controls. Use 20–28 px corner radii, 2–3 px white borders, 8–18 px spacing rhythm, layered panels with 85–94% opacity. Every state must have text plus icon/shape, never color alone. Keep player HP, turn owner, timer, action feedback and primary CTA visible without covering the battlefield.

Canvas: 16:9 desktop first at 1920x1080, also provide a responsive 1366x768 and mobile landscape variant. Keep the playfield visually dominant. Use safe-area padding, no horizontal overflow, keyboard-visible focus, reduced-motion variant, loading/connecting/reconnecting/error states, and accessible real HTML controls outside any canvas.

Do not include a logo, watermark, brand name from another game, photorealism, guns, blood, horror, military UI, excessive neon, tiny unreadable text, or baked-in Japanese-learning answers.
```

## 02 — Đăng nhập / đăng ký (`/login`, `/register`)

```text
Create a high-fidelity 16:9 desktop login and registration screen for the original Snowball Cats version of J-LAS Game Arena. Use a calm illustrated winter backdrop: pale blue sky, rounded snowy hills, a small cabin, falling snow, and two tiny cat silhouettes playing in the far background. Keep the form readable and dominant over the artwork.

Layout: centered 440 px wide frosted-glass card, generous padding, 28 px radius, white 2 px border, navy text, soft blue shadow. Add a small original snowflake paw emblem (not a logo) above the title. Title: “Vào Snowball Cats”. Subtitle: “Đấu tuyết, học tiếng Nhật, chơi cùng bạn bè.” Add a segmented tab switch with “Đăng nhập” active and “Đăng ký” inactive. Login fields: “Email”, “Mật khẩu”, optional “Ghi nhớ tôi”; registration additionally shows “Tên hiển thị”. Primary button: “Đăng nhập” / “Tạo tài khoản”, full width, orange gradient with snowflake icon. Secondary Google sign-in button is white with subtle border and text “Tiếp tục với Google”. Add a thin divider “hoặc tiếp tục với”.

Include the local demo shortcut as a clearly marked low-emphasis panel: “Đăng nhập nhanh (demo)” with two small buttons “demo1” and “demo2”; do not let it visually compete with the primary CTA. Include inline validation, disabled submitting state, error message near the field, and a small “Quên mật khẩu?” text link placeholder. On narrow landscape, card becomes a two-column composition: illustration left, form right; preserve minimum 16 px text size and visible focus rings.
```

## 03 — Sảnh game / game catalog (`/games`)

```text
Design the Snowball Cats game hub as a bright winter arcade lobby, 16:9, desktop 1920x1080. The shared top navigation is a compact frosted white/ice-blue bar with the original “J-LAS Arena” text, links “Sảnh game” and “Lobby”, a small circular avatar, display name and “Đăng xuất”. Keep the navigation functional and visually lighter than the game content.

Hero section: wide rounded blue gradient banner with a playful orange tabby cat sliding down a snow hill on the left and a gray tabby cat holding a snowball on the right. Headline: “Học tiếng Nhật bằng đối kháng”. Supporting line: “Chọn chế độ, mời bạn bè và luyện Kanji – từ vựng trong các trận đấu thời gian thực.” Place three compact stats in translucent pills: “Người chơi online”, “Phòng đang mở”, “Chế độ chơi”. Primary CTA “Chơi nhanh” is orange; secondary CTA “Tạo phòng” is blue-white. Add a join-code input with placeholder “AB-CD12” and button “Vào phòng”.

Below hero, create a responsive 3-card game grid. Each card has a unique original mini-illustration but the same component system: title, one-line tagline, description, player range/mode tags and actions. The implemented Snowball Cat battle card should be the featured card with a blue snowy battlefield thumbnail, label “Snowball Duel”, tagline “Tuyết bay · Solo / 1v1”, buttons “Chơi solo”, “Tạo phòng”, “Xem lobby”. The Memory Match card uses cozy blue cards and cat paw motifs with “Chơi solo”, “Tạo phòng”, “Xem lobby”. The unavailable Card Duel card is visibly muted with “Sắp ra mắt”, never pretending it is playable. Add hover/focus/pressed/disabled states and a small “Đang tải…” skeleton for live stats.
```

## 04 — Modal cấu hình chơi solo (mở từ `/games`)

```text
Create a centered modal for configuring a solo Snowball Cats mission, over a dimmed winter game hub. The modal is 520 px wide, navy-to-blue frosted panel, 28 px radius, white outline, close button “×” with accessible label “Đóng”. Header badge: “Solo · Unranked”. Title: “Nhiệm vụ Snowball Duel”.

Use a two-column form on desktop and one column on mobile landscape. Fields: “Nhiệm vụ” with options “Practice · luyện đường đạn”, “Survival · giữ HP”, “Score Challenge · đạt mục tiêu”; “Độ khó” with “Dễ”, “Thường”, “Khó”; “Kiểu câu hỏi” with “Kanji → Hiragana” and “Kanji → Nghĩa”; “JLPT” with N5–N1; “Số mục tiêu”. For the snowball variation, add compact optional controls “HP ban đầu”, “Thời gian mỗi lượt”, “Độ phá hủy địa hình”. Each field has a clear label, helper text and keyboard focus state. Primary full-width button: “Bắt đầu nhiệm vụ”. Show validating/submitting and inline error states; never close the modal while submitting.
```

## 05 — Lobby (`/games/lobby`)

```text
Design a friendly multiplayer lobby for Snowball Cats. Keep the shared winter navigation at the top. Main layout is a 360 px “Tạo phòng” card on the left and a wide “Phòng công khai” list on the right, with 24 px gap and generous white space.

Left card: snowy blue panel with cat-paw accent, heading “Tạo phòng”, fields “Chế độ”, “Hiển thị”, “Cấp độ câu hỏi”, and a large orange button “Tạo phòng”. Beneath a divider, add “Vào bằng mã phòng”, input placeholder “AB-CD12”, button “Vào phòng”. Show host/settings helper copy without jargon.

Right card: heading “Phòng công khai”, a small refresh button “Làm mới”, and room rows. Each row contains an original avatar pair, room name, game badge (“Snowball Duel” / “Memory Match”), player count such as “1/2”, difficulty tag, status “Đang chờ”, and a right-aligned CTA “Tham gia”. Include loading skeleton rows, empty state “Chưa có phòng đang mở”, and error state with “Thử lại”. On mobile landscape, stack cards; room actions remain reachable without horizontal scrolling.
```

## 06 — Phòng chờ / room (`/games/room/{roomId}`)

```text
Create a polished pre-match room screen for a two-player Snowball Cats battle. Use a wide top bar: left “← Rời phòng”, center room code “AB-CD12” with a small “Copy” button, connection badge “Đang kết nối / Trực tuyến / Mất kết nối”, right “Cấu hình” and “Thông tin” drawer buttons. Keep the code easy to read and copy.

Desktop layout: left settings drawer (320 px), central versus stage, right room-info drawer (300 px). Center stage shows two large original cat avatar cards facing each other on small snowy pedestals: “Player 1” orange cat and “Player 2” gray cat. Empty slot says “Đang chờ người chơi…”, with a plus/paw icon. Under the avatars show room title, game type, “Sẵn sàng” status and a small turn-based snowball icon.

Left settings: “Cấu hình trận”, host badge, “Cấp độ”, “Nguồn câu hỏi”, “Chế độ trả lời”, “Số câu”, “Giây mỗi câu”; Snowball Duel-specific compact settings “HP ban đầu”, “Loại địa hình”, “Thời tiết”. Visibly mark guest controls as read-only with helper “Chỉ chủ phòng thay đổi được cấu hình.” Right info: “Thông tin phòng”, mode, status, player count, visibility, invite-link field and “Sao chép link”. Bottom center actions: text hint, secondary “Sẵn sàng”, primary “Bắt đầu”.

Create explicit visual variants for waiting, both-ready, host-start-enabled, countdown 3–2–1, reconnecting overlay and failed connection. Countdown is a large white number in a translucent blue circle over the stage; reconnect overlay says “Mất kết nối” and “Tải lại trang”. Drawers become bottom sheets on narrow screens and preserve focus trapping.
```

## 07 — Snowball Duel gameplay (`/games/air-defense/{sessionId}`)

```text
Create the main 16:9 side-view gameplay screen for an original turn-based game called “Snowball Duel”. It is a cute winter battlefield inspired by the broad readability of 2D artillery games, but it must be an original design with no copied UI or assets.

Battlefield: full-width layered snowy hills with soft rounded edges, blue shadows, pine trees, distant lavender mountains, a tiny cabin, clouds and subtle falling snow. Place Player 1 orange tabby cat with blue scarf on the left hill and Player 2 gray tabby with red scarf on the right hill. Cats are chibi, readable at a glance, each holding a small snowball launcher or throwing pose; no guns, blood or realistic violence. Show a dotted parabolic trajectory from the active cat to the target, with a bright snowball and a small powder burst at impact. Leave the center clear for the projectile arc.

Top HUD: left player panel with avatar, “Player 1”, green HP bar “100 / 100”, small score and combo; right mirror panel for “Player 2” with red accent and HP “80 / 100”. Center has a rounded badge “TURN 7” and a larger pill “Player 1’s Turn”. Include a compact connection badge and pause/exit controls in the top-right corner.

Bottom action dock: centered dark-blue glass panel with a circular gauge. Left readout “ANGLE 45°” with a small angle icon; right readout “POWER 70%” with segmented green meter. Below it, three large skill cards with original snowball icons: “Triple Shot” / “3 snowballs in one turn”, “Spread Shot” / “Fan-shaped attack”, “Piercing Snowball” / “Penetrates soft terrain”. Selected skill receives a thick white/gold outline, disabled skill is desaturated with a reason tooltip. On the right, oversized orange primary button “❄ FIRE!” and a smaller blue “END TURN” button. On the left, square blue buttons for “Cài đặt” and “Tạm dừng”.

Show answer-learning integration without hiding the gameplay: a compact question card may appear above the action dock with “KANJI → HIRAGANA”, the Japanese prompt, a real accessible answer input and “KHAI HỎA”; never bake hidden answers into the illustration. The server remains authoritative for turn, HP, score, timer and hit result. While resolving, disable duplicate input and show “ĐANG TÍNH ĐƯỜNG ĐẠN…”.

Required visual states: initial loading “Đang kết nối đài chỉ huy…”, online/connecting/reconnecting, waiting for target, active turn, angle/power adjustment, skill selected, projectile in flight, hit/miss feedback, paused overlay, connection-failed overlay, and finished result. Use small motion/screen shake only for confirmed impacts and provide a reduced-motion variant. Keep all essential HUD and controls outside the canvas for keyboard and screen-reader access.
```

## 08 — Gameplay pause / reconnect overlay

```text
Design an overlay state for Snowball Duel. Dim the snowy battlefield to 55%, preserve the visible cat silhouettes and HP bars, then center a 400 px navy glass card with a snowflake-paw emblem. For pause: title “Trận đấu đang tạm dừng”, body “Mọi thời gian phía máy chủ đã được đóng băng.”, primary button “Tiếp tục”, secondary “Rời trận”. For reconnect: title “Đang nối lại chiến trường”, animated but reduced-motion-safe spinner, body “Khai hỏa bị khóa cho tới khi snapshot được đồng bộ.”, secondary “Tải lại trang”. For server error, use an inline red alert with text and “Thử lại”, never a browser alert().
```

## 09 — Snowball Duel result (`/games/air-defense/{sessionId}` khi FINISHED)

```text
Create a celebratory result screen after a Snowball Duel match. Use a full-screen winter gradient with drifting snow and soft confetti, but keep the information architecture calm. Center a 680 px result card with a large original snowflake seal: “WIN” / “DRAW” / “DEFEAT” rendered as text plus an icon, not color alone. Kicker: “MISSION REPORT · RANKED 1V1” or “UNRANKED SOLO”. Titles: “Chiến thắng!”, “Bất phân thắng bại”, “Thất bại”, or for solo “Phòng tuyến vững vàng!” / “Kết thúc nhiệm vụ”.

Show two compact cat portraits and a clear score comparison. Statistics grid: “Điểm”, “HP còn lại”, “Snowballs trúng”, “Độ chính xác”, “Combo tốt nhất”, “Thời gian”. If applicable, show a gold badge “KỶ LỤC CÁ NHÂN MỚI”. Add a “Mục tiêu cần ôn lại” review panel with Japanese prompt, expected answer and submitted answer; keep it readable and server-confirmed. Bottom actions: orange “CHƠI LẠI” for solo, blue “TÁI ĐẤU TRONG PHÒNG” when roomId exists, and quiet “VỀ SẢNH”. Include loading state “ĐANG CHUẨN BỊ…” for replay.
```

## 10 — Memory Match board (`/games/memory/{sessionId}`)

```text
Design the existing Memory Match game as a calm snowy study table that shares the Snowball Cats visual system without turning it into an artillery screen. Use a deep navy-to-ice background, frosted panels, snowflake-paw card backs, rounded 18–22 px cards, and soft blue shadows. Keep the Japanese-learning content as real text.

Header: kicker “記憶合わせ · Solo practice / Multiplayer”, title “Memory Match”, connection badge “Trực tuyến / Đang nối / Mất kết nối”, optional “Tạm dừng / Tiếp tục”, and “Rời bàn”. HUD below: progress “Tiến độ 4 / 10 cặp” with a wide progress bar, “Lượt đã dùng”, optional “Lượt còn lại”, and urgent timer. Main area is a large responsive card grid (4, 5 or 6 columns based on board size) and a right sidebar.

Cards need three explicit states: face-down with snowflake-paw crest and index, revealed with face label “Từ Nhật / Cách đọc / Nghĩa” and large readable content, matched with mint highlight and text “✓ Đã ghép”. Show turn banner “Lượt của bạn — chọn một thẻ” or “Đang chờ [tên]”. Sidebar contains “Thành tích” or “Bảng điểm”, avatar chips, pairs found, streak, accuracy and a “Mẹo ghi nhớ” panel. Provide loading, resolving, paused, reconnecting, invalid move and reduced-motion states. Never reveal hidden card content in the initial DOM or in the visual design.
```

## 11 — Memory Match result (`/games/memory/{sessionId}` khi FINISHED)

```text
Create a warm Memory Match result screen using the same winter palette but a quieter study mood. Center a frosted navy card with an original “勝” snow seal, kicker “Kết quả Memory Match”, and title “Hoàn thành!” or “Ván chơi kết thúc”. Subtitle changes for time-up, moves exhausted or all pairs matched.

Show three prominent statistics: “Cặp đúng”, “Lượt lật”, “Thời gian”. If strugglingTerms exist, show a review section titled “Từ nên ôn lại”, each row containing Japanese term, reading and Vietnamese meaning. Actions: orange “Chơi lại” for solo and blue “Về phòng” or “Về sảnh game”. Add loading state “Đang tạo ván…” and error state near the button. Use positive animation only after server-confirmed completion, with reduced-motion fallback.
```

## 12 — Loading, lỗi và trang không tồn tại (`/error`)

```text
Create a reusable J-LAS Arena winter error and loading system. Background is a soft blue radial winter gradient with faint snow particles and a small original cat paw/snowflake illustration. Center a 560 px glass card with a clear status code, friendly heading, one-sentence explanation and actions.

404 copy: “Không thể mở trang này” and “Đường dẫn không tồn tại hoặc đã được thay đổi.” Actions “Về sảnh game” and “Thử lại”. Generic service error copy: “Phiên truy cập hoặc dịch vụ vừa gặp sự cố. Hãy quay về sảnh và thử lại.”

For page loading, use a simple snowball spinner plus “Đang chuẩn bị…” and a short live-region status. For network failure, show a red/orange status icon plus text “Mất kết nối”, preserve any safe local context, and offer “Thử lại”. Do not use alert(), browser prompts, watermark or a fake game result. Maintain visible focus and mobile landscape readability.
```

## 13 — Negative prompt dùng chung

```text
No Tiny Tanks logo, no Steam logo, no watermark, no copied screenshot, no copyrighted character, no military tank, no firearm, no blood, no horror, no photorealistic cat, no dark gritty war UI, no excessive neon, no illegible microtext, no flat unstyled form, no hidden answer baked into artwork, no color-only status, no fixed desktop-only crop, no horizontal overflow, no giant title covering the battlefield, no unrelated Japanese text, no extra game modes that do not exist in the product.
```

## 14 — Button spec chi tiết cho từng trang

Chèn đoạn này sau prompt của từng trang khi Stitch/Figma cần dựng cả prototype tương tác, không chỉ mockup tĩnh:

```text
For every button, create a real component with five visible states: default, hover, keyboard focus, pressed, and disabled. Add a sixth loading state whenever the action waits for the server. Preserve the same label while loading and add a small spinner or progress indicator; do not replace the label with an unexplained icon. Use a 44 x 44 px minimum hit area, visible 2–3 px focus ring, text plus icon where useful, and a short inline success/error message after the action. Never communicate disabled or danger by color alone.
```

### Shared navigation buttons

| Nút | Action | Visual / trạng thái |
|---|---|---|
| `Sảnh game` | Điều hướng tới `/games` | Active: filled ice-blue pill; hover: white glow; focus: gold ring; loading không cần vì navigation tức thời. |
| `Lobby` | Điều hướng tới `/games/lobby` | Cùng component với `Sảnh game`; active state riêng. |
| Avatar / tên người dùng | Mở menu tài khoản nếu có; nếu chưa có menu thì chỉ là identity chip | Không giả lập action nếu backend chưa có menu. |
| `Đăng xuất` | Gọi logout, xóa session rồi về login | Loading: `Đang đăng xuất…`; thành công: toast `Đã đăng xuất`; lỗi: inline toast `Không thể đăng xuất`. |

### Login / register buttons

| Nút | Action | Visual / trạng thái |
|---|---|---|
| `Đăng nhập` tab | Chuyển form sang login, giữ layout không nhảy | Active: orange underline + light-blue fill; focus rõ; không gọi API. |
| `Đăng ký` tab | Hiện thêm trường `Tên hiển thị`, đổi submit label | Tab animation 140–220 ms; focus chuyển tới trường đầu tiên mới hiện. |
| `Đăng nhập` / `Tạo tài khoản` | Validate form, gọi auth API | Disabled khi field bắt buộc rỗng; loading `Đang xác thực…`; success chuyển `/games`; error hiển thị ngay dưới field liên quan. |
| `Tiếp tục với Google` | Gọi Google Sign-In khi provider được bật | Disabled nếu provider chưa cấu hình; loading `Đang kết nối Google…`; không hiển thị nút giả nếu feature unavailable. |
| `demo1`, `demo2` | Điền tài khoản demo và tự submit theo mode hiện tại | Pressed có checkmark `Đã chọn`; loading dùng chung với submit; giữ nhãn demo rõ ràng. |
| `Quên mật khẩu?` | Placeholder link, chưa triển khai | Dùng muted text link và tooltip `Tính năng sắp có`, không tạo flow giả. |

### Game hub (`/games`) buttons

| Nút | Action | Visual / trạng thái |
|---|---|---|
| `Chơi nhanh` | Tìm phòng public phù hợp; nếu không có thì tạo flow phù hợp | Loading `Đang tìm trận…`; disabled trong lúc request; lỗi hiển thị banner gần nút, có `Thử lại`. |
| `Tạo phòng` (hero) | Mở lobby hoặc mở form tạo phòng đã chọn mode | Primary orange; hover nâng 2 px; focus ring; không submit hai lần. |
| `Vào phòng` (join code) | Chuẩn hóa room code rồi join | Disabled khi chưa đủ format; lỗi nằm dưới input; success chuyển room. |
| `Chơi solo` (game card) | Tạo session solo tương ứng | Loading `Đang tạo ván…`; chỉ hiện cho game `soloSupported`; sau success chuyển board. |
| `Tạo phòng` (game card) | Tạo room với game type đã chọn | Loading trên đúng card, các card khác vẫn không bị khóa nếu không cần. |
| `Xem lobby` | Mở lobby và giữ game type filter nếu có | Secondary button, không dùng màu orange. |
| `× Đóng` solo modal | Đóng modal, trả focus về nút đã mở | Disabled khi đang submit; Escape và click backdrop chỉ đóng khi không pending. |
| `Bắt đầu nhiệm vụ` | Validate cấu hình, tạo session solo | Loading `ĐANG CHUẨN BỊ…`; inline validation; không đóng modal trước khi server xác nhận. |

### Lobby (`/games/lobby`) buttons

| Nút | Action | Visual / trạng thái |
|---|---|---|
| `Tạo phòng` | Gửi cấu hình tạo public/private room | Primary orange; loading `Đang tạo phòng…`; lỗi nằm trong card; success chuyển room. |
| `Vào phòng` | Join theo mã nhập tay | Disabled khi mã rỗng; loading `Đang vào phòng…`; lỗi `Mã phòng không hợp lệ` dưới input. |
| `Làm mới` | Tải lại danh sách public rooms | Icon refresh + label; loading xoay icon nhưng giữ label; thành công cập nhật timestamp nhỏ `Vừa cập nhật`. |
| `Tham gia` trên room row | Join đúng room row | Chỉ row đang click hiển thị loading `Đang vào…`; các row khác giữ nguyên. |
| `Thử lại` empty/error | Gọi lại endpoint room list | Primary/secondary tùy lỗi; announce kết quả qua aria-live. |

### Room (`/games/room/{roomId}`) buttons

| Nút | Action | Visual / trạng thái |
|---|---|---|
| `← Rời phòng` | Rời room và về lobby | Dùng quiet/danger-confirm styling; nếu pending hiển thị `Đang rời phòng…`; không dùng browser confirm. |
| `Cấu hình` | Mở/đóng settings drawer | Active có caret đổi hướng; mobile mở bottom sheet; focus trap và nút close rõ ràng. |
| `Thông tin` | Mở/đóng room info drawer | Cùng drawer behavior, không che room code khi desktop. |
| `Copy` room code | Copy code vào clipboard | Pressed → icon check + `Đã sao chép`; lỗi clipboard → toast `Không thể sao chép`. |
| `Sao chép link` | Copy invite link | Feedback giống room code nhưng message `Đã sao chép link mời`. |
| `Sẵn sàng` | Gửi ready/unready intent | Toggle label `Hủy sẵn sàng`; pending khóa nút; chỉ đổi trạng thái sau server event. |
| `Bắt đầu` | Host bắt đầu countdown khi đủ người/ready | Disabled nếu guest, thiếu người hoặc chưa ready; tooltip giải thích điều kiện; loading `Đang bắt đầu…`. |
| `Tải lại trang` reconnect | Reload sau connection failure | Loading `Đang tải lại…`; giữ overlay cho tới khi navigation bắt đầu. |

### Snowball Duel gameplay (`/games/air-defense/{sessionId}`) buttons

| Nút | Action | Visual / trạng thái |
|---|---|---|
| `Cài đặt` | Mở game settings/audio panel | Icon-only nhưng có tooltip và aria-label; focus ring trắng; panel không làm mất turn. |
| `Tạm dừng` / `PAUSE` | Pause solo qua server | Loading `Đang tạm dừng…`; overlay chỉ hiện sau snapshot xác nhận; multiplayer không tự ý pause nếu rule không cho phép. |
| `Tiếp tục` / `RESUME` | Resume paused session | Primary orange; loading `Đang tiếp tục…`; không tự bật lại khi offline. |
| `EXIT` / `Rời trận` | Về room hoặc sảnh tùy `roomId` | Quiet button; nếu có pending shot phải khóa cho tới khi action resolve hoặc hiển thị modal rời trận. |
| Điều chỉnh `ANGLE` | Tăng/giảm góc hoặc kéo angle control | Nút/slider có step, min/max, giá trị text `45°`; keyboard arrows hoạt động; không gửi server cho từng pixel, chỉ gửi khi `FIRE`. |
| Điều chỉnh `POWER` | Tăng/giảm lực hoặc kéo power control | Hiển thị phần trăm và segmented meter; disabled khi không phải lượt mình; có tooltip `Chọn lực ném`. |
| `Triple Shot` | Chọn skill bắn 3 snowballs | Selected có viền gold + check; disabled khi hết charge với text `Hết lượt`; không tự bắn ngay khi chọn. |
| `Spread Shot` | Chọn skill fan-shaped | Selected hiển thị preview ba cung parabolic mờ; tooltip mô tả trade-off; trạng thái xác nhận từ server. |
| `Piercing Snowball` | Chọn đạn xuyên địa hình | Selected có icon xuyên lớp tuyết; disabled nếu chưa mở khóa; reason text luôn hiển thị, không chỉ màu xám. |
| `❄ FIRE!` / `KHAI HỎA` | Validate answer + angle + power + skill rồi gửi shot intent | Primary orange lớn nhất; disabled khi không phải turn, answer rỗng, offline hoặc đang resolving; loading `ĐANG TÍNH ĐƯỜNG ĐẠN…`; chỉ hiện hit/miss sau server event. |
| `END TURN` | Kết thúc lượt nếu luật cho phép | Secondary blue, confirmation microcopy nếu còn action chưa dùng; disabled trong flight/resolving. |
| Input answer `Enter` | Submit answer sau khi IME composition kết thúc | Không submit khi `isComposing`; focus không bị giật khi server event tới; error nằm ngay dưới input. |
| `Thử lại` server error | Gửi lại/resync action an toàn | Chỉ retry command idempotent; loading `Đang đồng bộ…`; không nhân đôi snowball. |

### Gameplay result buttons

| Nút | Action | Visual / trạng thái |
|---|---|---|
| `CHƠI LẠI` | Tạo session solo mới với config cũ | Primary orange; loading `ĐANG CHUẨN BỊ…`; disable duplicate click; chỉ hiện cho solo. |
| `TÁI ĐẤU TRONG PHÒNG` | Quay về room hiện tại | Secondary blue; giữ `roomId`; không hiển thị nếu session không thuộc room. |
| `VỀ SẢNH` | Về `/games` | Quiet/outline; luôn hoạt động kể cả result load lỗi. |

### Memory Match buttons

| Nút | Action | Visual / trạng thái |
|---|---|---|
| Card face-down | Gửi flip intent cho đúng card | Native button; hover nâng nhẹ; focus ring; disabled khi không phải lượt, đang resolve, offline hoặc card đã revealed. |
| `Tạm dừng` / `Tiếp tục` | Pause/resume solo session | Loading `Đang cập nhật…`; label chỉ đổi sau server snapshot; multiplayer không hiện nếu không hỗ trợ. |
| `Rời bàn` | Về room hoặc sảnh | Quiet button; preserve room context; pending state nếu cần xác nhận rời. |
| `Chơi lại` | Tạo Memory session mới với config cũ | Primary orange; loading `Đang tạo ván…`; lỗi inline tại nút. |
| `Về phòng` / `Về sảnh game` | Navigation sau result | Secondary; label phụ thuộc `roomId`; luôn giữ focus visible. |

### Error / loading buttons

| Nút | Action | Visual / trạng thái |
|---|---|---|
| `Về sảnh game` | Về `/games` | Primary orange, luôn khả dụng. |
| `Thử lại` | Reload data hoặc page theo context | Loading `Đang thử lại…`; không tạo thêm session; lỗi mới thay thế lỗi cũ ở cùng vị trí. |
| `×` đóng toast/alert | Ẩn thông báo không nghiêm trọng | Không dùng cho lỗi bắt buộc xử lý; aria-label đầy đủ. |

### Button acceptance checklist

```text
For the prototype, demonstrate at least these interaction stories: login validation and success, solo modal submit, lobby refresh, room copy-code feedback, ready then host start, gameplay skill selection then FIRE loading, pause then resume, reconnect retry, Memory card disabled/revealed/matched states, replay loading, and error retry. Every story must show the server-pending state and a clear success or error feedback. Keep button labels in Vietnamese exactly as specified above; do not invent extra actions that are not present in the current product.
```

## 15 — Coverage map: toàn bộ trang hiện có trong project

Đây là danh sách route thật để không bỏ sót màn hình khi vẽ lại. `section` là prompt tương ứng trong file này.

| Route / template hiện tại | Prompt dùng để vẽ lại | State cần xuất thêm |
|---|---|---|
| `/` | Không có UI riêng; route redirect sang `/games` | Có thể vẽ splash chuyển trang 300–500 ms nếu cần, không tạo homepage thứ hai. |
| `/login`, `/register` → `auth/login.html` | `02 — Đăng nhập / đăng ký` | Login, register, Google disabled, demo login, validation error, submitting. |
| Shared `fragments/layout.html` | Master art direction + `03` top navigation | Active nav, avatar loading, logout pending, toast success/error. |
| `/games` → `arena/games.html` | `03 — Sảnh game / game catalog` | Live stats loading, empty/error stats, card hover/disabled/coming soon. |
| Air solo modal trong `/games` | `04 — Modal cấu hình chơi solo` | Closed, open, validation error, submitting, server error, Escape/backdrop close. |
| `/games/lobby` → `arena/lobby.html` | `05 — Lobby` | Room list loading, populated, empty, refresh pending, join/create error. |
| `/games/room/{roomId}` → `arena/room.html` | `06 — Phòng chờ / room` | Loading room, waiting, ready, host start enabled, countdown 3–2–1, reconnect, failed connection, drawer open. |
| `/games/air-defense/{sessionId}` loading | `07` phần `initial loading` | Radar/snowball loader, error + `Về sảnh`, retry/resync. |
| `/games/air-defense/{sessionId}` active | `07 — Snowball Duel gameplay` | Online, connecting, active turn, answer card, angle/power, skill selected, resolving, projectile flight, hit/miss. |
| Air Defense pause/reconnect | `08 — Gameplay pause / reconnect overlay` | Paused, offline, resume pending, reconnecting, reload. |
| Air Defense FINISHED/ABORTED | `09 — Snowball Duel result` | Win, draw, defeat, solo mission success/fail, personal best, review list, replay pending. |
| `/games/memory/{sessionId}` loading | `10` + loading rules trong `12` | Card loader, API error, `Về sảnh game`. |
| `/games/memory/{sessionId}` active | `10 — Memory Match board` | Online, connecting, waiting turn, my turn, card hidden/revealed/matched, resolving, invalid move, timer urgent. |
| Memory pause/reconnect | `10` + `08` visual language | Paused overlay, reconnect overlay, resume pending, offline locked board. |
| Memory FINISHED/ABORTED | `11 — Memory Match result` | Complete, time-up, moves exhausted, struggling terms, replay pending, room/sảnh return. |
| `/error` → `error.html` | `12 — Loading, lỗi và trang không tồn tại` | 404, generic 500/service error, retry, return lobby. |
| Card Duel | Chỉ nằm trong card “Sắp ra mắt” của `03` | Không vẽ gameplay, lobby riêng hoặc nút chơi thật khi backend chưa có route. |

## 16 — Prompt cho shared shell, toast và connection status

```text
Create a reusable shared shell for every J-LAS Snowball Cats page. The desktop shell has a 64 px frosted ice-blue navigation bar with the text “J-LAS Arena”, a small original snowflake-paw mark, links “Sảnh game” and “Lobby”, flexible spacer, user avatar, display name and “Đăng xuất”. Do not make the shell look like the battlefield; it must stay calm and readable so each game can own its visual scene.

Create a toast stack anchored to the top-right below the navigation. Toasts have an icon, short Vietnamese message, optional close button and an accessible live region. Success uses a check-in-circle plus mint accent, warning uses an exclamation plus gold accent, error uses an alert triangle plus coral accent, and info uses a snowflake plus cyan accent. Never put the only copy of a critical error in a toast; repeat it beside the affected control.

Create a compact connection status component with text and a shaped indicator: “Đang kết nối”, “Trực tuyến”, “Đang nối lại”, “Mất kết nối”. Use a pulsing dot only while connecting; stop continuous animation when online or when reduced motion is preferred. The component must work in nav, room, Memory Match and Snowball Duel without changing its meaning.

Create responsive states for desktop, tablet and mobile landscape. On narrow screens, move secondary navigation into a drawer, respect safe-area insets, keep focus inside open dialogs, and never allow a toast or status badge to cover a primary action.
```

## 17 — Quy tắc dùng prompt để vẽ đủ một trang

```text
For each route, generate one complete page frame plus all listed state variants, not only the happy path. Keep the same player cat designs, color tokens, border treatment, button heights, icon language and typography across every frame. Use real text layers for every label and button. Keep the page route and state name in the Figma frame title, for example “/games/room/{roomId} · COUNTDOWN” or “/games/memory/{sessionId} · FINISHED”.

For a gameplay frame, show the battlefield, HUD, question/answer area and action dock together. For a non-game frame, do not add angle, power, HP or snowball skills. For Memory Match, do not add a projectile battlefield. For Card Duel, show only the disabled catalog card until a real route exists. Use the same two original cats everywhere, but change their pose to match context: welcoming on login, playful in catalog, waiting in room, throwing in gameplay, celebrating on result, and studying beside the Memory board.
```

## 18 — Prompt độc lập theo từng trang/file UI trong project (Kèm chi tiết tất cả các nút)

Phần này là bản prompt copy-paste độc lập cho từng file template HTML trong thư mục `templates/`. Mỗi phần bao gồm:
1. **Target template file & script/style bundle** liên quan.
2. **Prompt AI độc lập** (tiếng Anh) dán trực tiếp vào Stitch / Figma / AI generation tools để vẽ lại UI.
3. **Bảng liệt kê chi tiết tất cả các nút (Buttons & Interactive Controls)** trên trang đó để không bỏ sót bất kỳ tương tác nào khi thiết kế prototype.

---

### 18.1 Shared web shell (`src/main/resources/templates/fragments/layout.html`)

**Target template file:** `src/main/resources/templates/fragments/layout.html`  
**Related assets:** `src/main/resources/static/arena/css/tokens.css`, `base.css`, `nav.js`, `toast.js`, `api-client.js`.

```text
Redesign the shared J-LAS Arena web shell for the Snowball Cats product as a complete responsive navbar and toast layout system.

Header bar: 64 px height, frosted ice-blue container (#EBF7FF, 90% opacity, 18 px glass blur, 1 px bottom border #BDE3FF). 
Left side: Brand link with a small original dark-blue cat paw / snowflake icon, text "J-LAS" in heavy bold navy (#163B69) and "Arena" in ice-blue gradient pill badge. Next to brand: primary navigation links "Sảnh game" (active: filled ice-blue pill #43B9F5, white text, 18 px radius) and "Lobby" (inactive: navy text, hover background #D9F0FF).
Right side: User profile identity chip showing a circular 36 px avatar with thick white border, user display name "Đang tải…" / "Player 1" in navy text, and a ghost button "Đăng xuất" with red hover highlight. On narrow landscape screens, collapse navigation links into a collapsible slide-out menu drawer with an accessible burger button.

Toast notification stack: Anchored at top-right below navigation (20 px offset). Floating glass cards with 16 px rounded corners, 2 px border, subtle shadow. Variants:
- Success: Mint green icon (check in snowflake), text copy, mint border (#67D68B).
- Warning: Gold icon (exclamation mark), text copy, gold border (#FFD75A).
- Error: Coral red icon (alert triangle), text copy, coral border (#F05B68).
- Info: Cyan icon (snowflake), text copy, cyan border (#8CD9FF).
Every toast includes a small "×" dismiss button on the right.

Preserve exact class and attribute hooks: data-arena-user, data-arena-user-name, data-arena-user-avatar, data-arena-logout, and class toast-stack.
```

#### Chi tiết các nút trên template `fragments/layout.html`:

| Nút / Interactive Element | Selector / Attribute | Loại / State | Visual & Trạng thái UI |
|---|---|---|---|
| **Brand Link (`J-LAS Arena`)** | `a.arena-nav__brand` | Nav link | Nền trong suốt, icon 闘 / paw crest, chữ navy. Hover: glow nhẹ; Focus: viền xanh #43B9F5. |
| **Link `Sảnh game`** | `a[href="/games"]` | Nav link | Active khi ở `/games`: pill xanh #43B9F5 chữ trắng. Inactive: chữ navy, hover background #D9F0FF. |
| **Link `Lobby`** | `a[href="/games/lobby"]` | Nav link | Active khi ở `/games/lobby`: pill xanh. Inactive: chữ navy, hover background #D9F0FF. |
| **Chip người dùng (Avatar + Name)** | `[data-arena-user]` | Profile chip | Hiển thị avatar tròn 36px và tên người dùng. Trạng thái `Đang tải…` khi chưa load xong session. |
| **Nút `Đăng xuất`** | `button[data-arena-logout]` | Ghost button | Button viền mảnh/ghost, chữ navy. Hover: chuyển chữ đỏ #F05B68 + nền hồng nhạt. Loading: `Đang đăng xuất…` + spinner nhỏ. Lỗi: toast báo `Không thể đăng xuất`. |
| **Nút `×` Đóng Toast** | `.toast-close` | Icon button | Icon `×` góc phải toast notification, hover đổi màu dark navy, click ẩn toast khỏi stack. |

---

### 18.2 Màn hình Đăng nhập / Đăng ký (`src/main/resources/templates/auth/login.html`)

**Target template file:** `src/main/resources/templates/auth/login.html`  
**Related assets:** `src/main/resources/static/arena/js/auth-page.js`, `api-client.js`, `toast.js`.

```text
Redesign the complete /login and /register authentication screen for Snowball Cats.

Background: 16:9 full-screen illustrated winter scenery. Pale ice-blue gradient sky, soft rounded snowy hills, a cozy small wooden cabin with chimney smoke on the left hill, subtle falling snow particles. Two cute original chibi cat silhouettes (orange tabby P1 and gray tabby P2) waving playfully on distant hills.

Form Container: Centered 440 px wide frosted glass card. 28 px rounded corners, 2 px white outline (#FFFFFF 80%), navy text (#163B69), soft drop shadow (0 16px 48px rgba(22, 59, 105, 0.15)). Top crest: small original snowflake-paw emblem. Title: "Vào Snowball Cats". Subtitle: "Đấu tuyết, học tiếng Nhật, chơi cùng bạn bè."

Form Controls & Buttons:
1. Segmented Tab Switch: Two full-width segmented tab buttons at the top of the card. "Đăng nhập" active (orange gradient #FF9D2E to #FF8000, white bold text, rounded 20 px) and "Đăng ký" inactive (ice-blue background #EBF7FF, navy text).
2. Input Fields: Rounded 16 px inputs with 2 px border. Field "Tên hiển thị" (only shown when Đăng ký active), "Email", and "Mật khẩu". Active focus shows a 3 px cyan focus ring (#43B9F5).
3. Primary Submit Button: Full-width 52 px height orange gradient button with a snowflake icon. Label dynamically changes between "Đăng nhập" and "Tạo tài khoản". Loading state: label becomes "Đang xác thực…" with a spinning snowflake.
4. Google Sign-In Container: Thin divider line with text "hoặc tiếp tục với". White outlined Google button with colorful G logo and text "Tiếp tục với Google" (disabled/hidden state handled gracefully if googleClientId is empty).
5. Quick Demo Login Panel: Low-emphasis glass panel titled "đăng nhập nhanh (demo)". Contains two equal-width ghost buttons: "demo1" (fills demo1@jlas.local) and "demo2" (fills demo2@jlas.local). Active/pressed state highlights with a green checkmark icon.

Preserve hooks: data-tab, data-auth-form, data-name-field, data-submit, data-quick-login, data-quick-user.
```

#### Chi tiết các nút trên template `auth/login.html`:

| Nút / Interactive Element | Selector / Attribute | Loại / State | Visual & Trạng thái UI |
|---|---|---|---|
| **Tab `Đăng nhập`** | `button[data-tab="login"]` | Segment tab | Active: Nền orange gradient #FF9D2E, chữ trắng bold. Inactive: nền xanh nhạt, chữ navy. Click chuyển form về mode Login. |
| **Tab `Đăng ký`** | `button[data-tab="register"]` | Segment tab | Active: Orange gradient. Inactive: Nền xanh nhạt. Click hiện thêm field `Tên hiển thị` (`data-name-field`) và đổi nhãn nút submit. |
| **Input `Tên hiển thị`** | `input#auth-name` | Text input | Chỉ hiện khi tab Đăng ký active (`maxlength=80`). Viền 2px blue, focus ring cyan. |
| **Input `Email`** | `input#auth-email` | Email input | Required, autocomplete email. Inline error khi định dạng sai. |
| **Input `Mật khẩu`** | `input#auth-password` | Password input | Required, minlength 6, type password. Inline error khi rỗng hoặc <6 ký tự. |
| **Nút Submit `Đăng nhập` / `Tạo tài khoản`** | `button[data-submit]` | Primary CTA | Nút chính full-width 52px, màu cam rực rỡ #FF9D2E. Disabled: xám mờ 50%. Hover: nâng 2px + hiệu ứng tuyết lấp lánh. Loading: `Đang xác thực…` + spinner. Lỗi: thông báo đỏ ngay dưới nút. |
| **Nút Google Sign-In** | `#googleBtnContainer` | Third-party CTA | Nút Google màu trắng viền xám, icon G 4 màu. Disabled khi server chưa cấu hình `googleEnabled`. Loading: `Đang kết nối Google…`. |
| **Nút Nhanh `demo1`** | `button[data-quick-user="demo1@jlas.local"]` | Quick demo button | Button ghost trong panel demo. Click điền sẵn `demo1@jlas.local` & pass `demo1234` rồi tự submit. Active: checkmark xanh mint. |
| **Nút Nhanh `demo2`** | `button[data-quick-user="demo2@jlas.local"]` | Quick demo button | Button ghost trong panel demo. Click điền sẵn `demo2@jlas.local` & pass `demo1234` rồi tự submit. Active: checkmark xanh mint. |

---

### 18.3 Màn hình Sảnh game / Game catalog (`src/main/resources/templates/arena/games.html`)

**Target template file:** `src/main/resources/templates/arena/games.html`  
**Related assets:** `src/main/resources/static/arena/js/games-page.js`, `games.css`, `tokens.css`.

```text
Redesign /games as the primary winter arcade game catalog hub for Snowball Cats.

Hero Banner: Wide blue gradient banner (#287ED5 to #163B69) with snowy hills illustration. Left side: chibi orange tabby cat sliding joyfully down a snow bank. Right side: gray tabby cat holding a large snowball. Headline: "Học tiếng Nhật bằng đối kháng". Lead text: "Chọn một chế độ, mời bạn bè bằng mã phòng, và luyện Kanji – từ vựng trong các trận đấu thời gian thực."

Hero Stats & Actions:
- Three live stat pills: "Người chơi online" (dynamic value), "Phòng đang mở" (dynamic value), "Chế độ chơi" (value: 3).
- Hero Actions: Primary large orange button "Chơi nhanh" (#FF9D2E gradient), secondary white-blue button "Tạo phòng" (links to /games/lobby), and a compact Join-Code inline form (text input placeholder "AB-CD12" + primary blue button "Vào phòng").

Game Catalog Grid (3 Responsive Cards):
1. Featured Card — Snowball Duel (Cannon Battle): Blue snowy thumbnail with cat snowball duel art. Tags: "Sakura / JLPT N5-N1", "Solo & 1v1". Actions: Primary button "Chơi solo" (opens solo config modal), Primary button "Tạo phòng", Ghost button "Xem lobby".
2. Card 2 — Memory Match: Cozy blue study cards thumbnail with cat paw back. Tags: "Từ vựng / Ghi nhớ", "Solo & 1v1". Actions: Primary button "Chơi solo", Primary button "Tạo phòng", Ghost button "Xem lobby".
3. Card 3 — Card Duel: Muted desaturated thumbnail with padlock icon. Tag: "Coming soon". Action button: Muted disabled button "Sắp ra mắt".

Air Defense Solo Mission Modal (data-air-solo-modal):
Dimmed winter backdrop (55% navy overlay). Centered 520 px glass card with header badge "Solo · Unranked", title "Nhiệm vụ Snowball Duel", and close button "×". Form contains: Select dropdown "Nhiệm vụ" (Practice, Survival, Score Challenge), Select "Độ khó" (Dễ, Thường, Khó), Select "Kiểu câu hỏi" (Kanji → Hiragana, Kanji → Nghĩa), Select "JLPT" (N5, N4), and Number input "Số mục tiêu" (default 10, range 5-60). Bottom action: Full-width orange CTA button "Bắt đầu nhiệm vụ".

Preserve hooks: data-quick-play, data-join-form, data-create-room, data-solo-game, data-air-solo-modal, data-air-solo-form, data-air-solo-close.
```

#### Chi tiết các nút trên template `arena/games.html`:

| Nút / Interactive Element | Selector / Attribute | Loại / State | Visual & Trạng thái UI |
|---|---|---|---|
| **Nút `Chơi nhanh` (Hero)** | `button[data-quick-play]` | Primary CTA | Nút lớn nổi bật nhất hero màu cam #FF9D2E. Click tự tìm phòng public hoặc tạo trận match-making. Loading: `Đang tìm trận…` + spinner. Lỗi: banner đỏ góc hero. |
| **Nút Link `Tạo phòng` (Hero)** | `a[href="/games/lobby"]` | Secondary button | Nút trắng viền xanh, icon `+`. Chuyển sang `/games/lobby`. |
| **Input Mã phòng (Hero)** | `input#join-code` | Code input | Input dạng mã 6 ký tự, viền 2px, tự động viết hoa (ví dụ: `AB-CD12`). Focus: viền xanh cyan. |
| **Nút `Vào phòng` (Hero)** | `form[data-join-form] submit` | Action button | Nút xanh lam #287ED5 kế bên input mã phòng. Disabled khi chưa nhập mã. Loading: `Đang vào…`. |
| **Nút `Chơi solo` (Snowball Duel card)** | `button[data-solo-game="CANNON_BATTLE"]` | Card action | Nút cam primary trên card Snowball Duel. Click mở Solo Mission Modal. |
| **Nút `Tạo phòng` (Snowball Duel card)** | `button[data-create-room="CANNON_BATTLE"]` | Card action | Nút xanh primary. Click gọi API tạo room Snowball Duel và redirect vào room. Loading: `Đang tạo…`. |
| **Nút Link `Xem lobby` (Snowball Card)** | `a[href*="CANNON_BATTLE"]` | Card action | Nút ghost text. Chuyển sang lobby đã lọc theo Snowball Duel. |
| **Nút `Chơi solo` (Memory Card)** | `button[data-solo-game="MEMORY_MATCH"]` | Card action | Nút cam primary. Click trực tiếp tạo ván Memory Solo và redirect vào bàn chơi. Loading: `Đang tạo ván…`. |
| **Nút `Tạo phòng` (Memory Card)** | `button[data-create-room="MEMORY_MATCH"]` | Card action | Nút xanh primary. Tạo room Memory Match. |
| **Nút Link `Xem lobby` (Memory Card)** | `a[href*="MEMORY_MATCH"]` | Card action | Nút ghost text. Chuyển sang lobby đã lọc theo Memory Match. |
| **Nút `Sắp ra mắt` (Card Duel card)** | Disabled button | Card action | Nút xám muted 40% opacity, disabled, cursor not-allowed. |
| **Nút `×` Đóng Modal Solo** | `button[data-air-solo-close]` | Modal close | Nút tròn `×` góc trên phải modal, hover màu đỏ nhạt, keyboard Esc đóng modal. |
| **Select `Nhiệm vụ`** | `select#air-solo-objective` | Select input | Dropdown chọn Practice / Survival / Score Challenge. |
| **Select `Độ khó`** | `select#air-solo-difficulty` | Select input | Dropdown chọn Dễ (18s) / Thường (14s) / Khó (10s). |
| **Select `Kiểu câu hỏi`** | `select#air-solo-mode` | Select input | Dropdown chọn Kanji → Hiragana / Kanji → Nghĩa. |
| **Select `JLPT`** | `select#air-solo-level` | Select input | Dropdown chọn N5 / N4. |
| **Input `Số mục tiêu`** | `input#air-solo-count` | Number input | Input số câu hỏi (min 5, max 60, default 10). Viền 2px cyan. |
| **Nút Submit `Bắt đầu nhiệm vụ`** | `form[data-air-solo-form] submit` | Primary CTA | Nút cam rực rỡ full-width trong modal. Loading: `ĐANG CHUẨN BỊ…` + spinner. Inline error nếu submit thất bại. |

---

### 18.4 Màn hình Lobby công khai (`src/main/resources/templates/arena/lobby.html`)

**Target template file:** `src/main/resources/templates/arena/lobby.html`  
**Related assets:** `src/main/resources/static/arena/js/lobby-page.js`, `base.css`, `games.css`.

```text
Redesign /games/lobby as a responsive 2-column winter multiplayer lobby layout.

Header Section: Title "Lobby" with subtitle "Tạo phòng mới hoặc tham gia phòng công khai đang chờ người".

Left Column (380 px Panel — Tạo phòng & Vào phòng):
Snowy ice-blue frosted panel with cat-paw emblem background accent.
1. Form "Tạo phòng":
   - Select "Chế độ" (Snowball Duel, Memory Match).
   - Select "Hiển thị" (Riêng tư - dùng mã phòng, Công khai - hiện ở lobby).
   - Select "Cấp độ câu hỏi" (N5, N4, N3, N2, N1).
   - Primary full-width orange button "Tạo phòng".
2. Thin divider line.
3. Form "Vào bằng mã phòng":
   - Code input field placeholder "AB-CD12".
   - Secondary full-width blue button "Vào phòng".

Right Column (Flex 1 Panel — Phòng công khai):
Wide glass panel with panel header: Title "Phòng công khai" and ghost button "Làm mới" (with refresh icon).
Body contains the dynamic Room List:
- Loading State: Skeleton list cards with pulsing blue glow and spinner "Đang tải danh sách phòng…".
- Populated Room Rows: Each row is a rounded card with host cat avatar, room title, game badge ("Snowball Duel" / "Memory Match"), level tag (N5-N1), player count pill ("1/2"), status tag ("Đang chờ"), and right-aligned primary button "Tham gia".
- Empty State: Clean card with a tiny cat sleeping on snow graphic, text "Chưa có phòng đang mở", button "Tạo phòng ngay".
- Error State: Alert box with text "Không thể tải danh sách phòng" and primary button "Thử lại".

Preserve hooks: data-create-form, data-join-form, data-refresh-rooms, data-room-list.
```

#### Chi tiết các nút trên template `arena/lobby.html`:

| Nút / Interactive Element | Selector / Attribute | Loại / State | Visual & Trạng thái UI |
|---|---|---|---|
| **Select `Chế độ`** | `select#lobby-game` | Select input | Dropdown chọn game type (Snowball Duel / Memory Match). Viền 2px blue. |
| **Select `Hiển thị`** | `select#lobby-visibility` | Select input | Dropdown chọn `Riêng tư (dùng mã phòng)` hoặc `Công khai (hiện ở lobby)`. |
| **Select `Cấp độ câu hỏi`** | `select#lobby-level` | Select input | Dropdown chọn cấp độ JLPT từ N5 tới N1. |
| **Nút Submit `Tạo phòng`** | `form[data-create-form] submit` | Primary CTA | Nút cam rực rỡ #FF9D2E full-width. Loading: `Đang tạo phòng…` + spinner. Redirect ngay vào room khi xong. |
| **Input `Mã phòng`** | `input#lobby-code` | Code input | Input nhập mã phòng riêng tư (maxlength 9, auto uppercase). |
| **Nút Submit `Vào phòng`** | `form[data-join-form] submit` | Secondary CTA | Nút xanh lam #287ED5 full-width. Disabled khi mã rỗng. Loading: `Đang vào phòng…`. Lỗi: text đỏ "Mã phòng không tồn tại". |
| **Nút `Làm mới`** | `button[data-refresh-rooms]` | Header action | Ghost button với icon xoay 🔄 và chữ "Làm mới". Loading: icon xoay 360deg liên tục. Success: toast "Đã cập nhật danh sách". |
| **Nút `Tham gia` (trên từng phòng)** | `.room-row .btn` | Row action | Nút xanh lam #287ED5 bên phải từng hàng phòng. Loading: chỉ nút của hàng đó đổi thành `Đang vào…`. Disabled khi phòng đủ người (2/2). |
| **Nút `Thử lại` (Khi lỗi list)** | `.state--error button` | Error retry | Nút primary xuất hiện khi API get rooms bị lỗi. Click tải lại danh sách. |

---

### 18.5 Màn hình Phòng chờ / Room (`src/main/resources/templates/arena/room.html`)

**Target template file:** `src/main/resources/templates/arena/room.html`  
**Related assets:** `src/main/resources/static/arena/js/room-page.js`, `room-store.js`, `room.css`.

```text
Redesign /games/room/{roomId} as the Snowball Cats 3-zone pre-match room.

Top Room Bar:
- Left: Ghost button "← Rời phòng" and mobile drawer toggle button "Cấu hình".
- Center: Large readable room code pill "AB-CD12" with a small button "Copy", and connection indicator pill ("Đang kết nối" / "Trực tuyến" / "Mất kết nối").
- Right: Tag "Voice · soon", mobile drawer toggle button "Thông tin", and user avatar.

Main 3-Zone Layout:
1. Left Drawer/Panel (320 px — Cấu hình trận):
   Glass panel with header title "Cấu hình trận" and "Host" badge. Form contains: Select "Cấp độ" (N5-N1), Select "Nguồn câu hỏi" (Từ vựng, Bài học, Bộ thẻ, Kanji), Select "Chế độ trả lời", Input "Số câu" (5-60), Input "Giây mỗi câu" (5-60), and Snowball Duel specific controls: Select "Luật Air Defense", Select "Độ khó", Input "Số câu thắng", Input "HP ban đầu". For guest users, form fields are disabled with a helper note "Chỉ chủ phòng thay đổi được cấu hình."
2. Center Stage (Versus Stage):
   Illustrated snowy room background. Two large cat pedestal cards facing each other:
   - Left Pedestal: Player 1 (Orange tabby cat avatar, display name, Host tag, "Sẵn sàng" checkmark).
   - Right Pedestal: Player 2 (Gray tabby cat avatar, display name, "Sẵn sàng" checkmark) OR empty slot showing dashed border, paw icon, and text "Đang chờ người chơi…".
   - Bottom Action Area: Status hint text ("Đang chờ đối thủ…"), secondary toggle button "Sẵn sàng" (label toggles to "Hủy sẵn sàng" when ready), and primary orange button "Bắt đầu" (enabled only for Host when both players are Ready).
3. Right Drawer/Panel (300 px — Thông tin phòng):
   Metadata rows: Chế độ, Trạng thái, Người chơi (1/2), Hiển thị. Bottom Invite Box: Readonly input with full invite URL and button "Sao chép link".

Overlays:
- Server Countdown Overlay: Translucent blue full-screen overlay with giant 3-2-1 white numbers inside a glowing snow ring and text "はじめ".
- Reconnect Overlay: Darkened backdrop with spinner, title "Mất kết nối", text "Đang thử kết nối lại…", and ghost button "Tải lại trang".

Preserve hooks: data-room-code, data-copy-code, data-conn, data-toggle-left, data-toggle-right, data-panel-left, data-panel-right, data-settings-form, data-ready-btn, data-start-btn, data-countdown-overlay, data-reconnect-overlay, data-reload-page.
```

#### Chi tiết các nút trên template `arena/room.html`:

| Nút / Interactive Element | Selector / Attribute | Loại / State | Visual & Trạng thái UI |
|---|---|---|---|
| **Nút `← Rời phòng`** | `a[data-leave-room]` | Header action | Ghost button góc trên trái. Click rời phòng và quay lại `/games/lobby`. |
| **Nút Toggle `Cấu hình`** | `button[data-toggle-left]` | Mobile drawer | Nút mở/đóng drawer cấu hình bên trái khi ở màn hình nhỏ. |
| **Nút `Copy` mã phòng** | `button[data-copy-code]` | Utility action | Nút nhỏ kế bên mã phòng `AB-CD12`. Click copy mã phòng. Active: chuyển sang icon check `Đã sao chép`. |
| **Nút Toggle `Thông tin`** | `button[data-toggle-right]` | Mobile drawer | Nút mở/đóng drawer thông tin bên phải khi ở màn hình nhỏ. |
| **Form Cấu hình (Host/Guest)** | `form[data-settings-form] input/select` | Settings form | Gồm các select Cấp độ, Nguồn câu hỏi, Chế độ trả lời, Số câu, Giây/câu, HP. Guest bị disable toàn bộ input. Host thay đổi sẽ sync qua WebSocket. |
| **Nút `Sẵn sàng` / `Hủy sẵn sàng`** | `button[data-ready-btn]` | Stage CTA | Toggle button màu xanh ice-blue. Chưa ready: `Sẵn sàng`. Đã ready: `Hủy sẵn sàng` + nền xanh lá mint #67D68B. Loading: khóa nút khi chờ server confirm. |
| **Nút `Bắt đầu` (Host only)** | `button[data-start-btn]` | Host CTA | Nút cam rực rỡ #FF9D2E lớn nhất bên dưới sân đấu. Disabled khi thiếu người hoặc người chơi chưa Ready. Active: click bắt đầu đếm ngược 3-2-1. Loading: `Đang bắt đầu…`. |
| **Input Link Mời** | `input[data-invite-link]` | Readonly input | Input chứa URL mời trực tiếp vào phòng. |
| **Nút `Sao chép link`** | `button[data-copy-link]` | Utility action | Nút xanh lam copy đường dẫn mời. Active feedback: `Đã sao chép link`. |
| **Nút `Tải lại trang` (Reconnect)** | `button[data-reload-page]` | Overlay action | Nút ghost trắng trên overlay mất kết nối. Click reload trang để reconnect WebSocket. |

---

### 18.6 Màn hình Snowball Duel / Air Defense Gameplay (`src/main/resources/templates/air-defense/board.html` + React App)

**Target template file:** `src/main/resources/templates/air-defense/board.html`  
**Related assets:** `frontend/air-defense/src/AirDefenseGame.tsx`, `components/*`, `air-defense-app.css`.

```text
Redesign /games/air-defense/{sessionId} as the main side-view 2D artillery gameplay screen.

Canvas & Battlefield (2D Pixi Scene):
16:9 widescreen snowy valley. Soft layered snow hills with blue shadows, pine trees with snow caps, distant lavender mountains under a light blue sky with drifting clouds and subtle falling snow particles. Left hill: Player 1 orange tabby cat with blue scarf in throwing pose. Right hill: Player 2 gray tabby cat with red scarf. Clear center space for dotted parabolic snowball flight paths and explosion particle bursts upon impact.

Top DOM HUD:
- Left Player Panel: Orange cat avatar, "Player 1" name, green HP bar ("100 / 100"), score ("1200"), combo badge ("x3").
- Right Player Panel: Gray cat avatar, "Player 2" name, green HP bar ("80 / 100"), score ("900").
- Center Badge: Rounded turn indicator "TURN 7" and active owner pill "Player 1's Turn".
- Top-Right Quick Controls: Sound toggle button (Mute 🔊 / Unmute 🔇), Pause button (Tạm dừng), Exit button (Rời trận).

Japanese Question Integration Card (DOM Overlay above controls):
Centered glass card showing Question Category ("KANJI → HIRAGANA"), Japanese prompt (e.g. "猫"), accessible text input (#answer-input), and submit button "KHAI HỎA". Keyboard Enter submits answer. Disabled state while calculating trajectory ("ĐANG TÍNH ĐƯỜNG ĐẠN…").

Bottom Action Dock (Dark Navy Glass Dock #163B69, 90% opacity, 24 px radius):
- Left Readouts & Steppers: Angle control ("ANGLE 45°" with angle icon & stepper buttons/slider) and Power control ("POWER 70%" with green segmented arc meter).
- Center Skill Selector: Three skill cards with original snowball icons:
  1. "Triple Shot" (3 snowballs in one turn).
  2. "Spread Shot" (Fan-shaped snowball spread).
  3. "Piercing Snowball" (Penetrates soft snow terrain).
  Selected skill gets thick gold/white glow outline. Disabled skill is desaturated with reason tooltip.
- Right Action Buttons: Oversized primary orange button "❄ FIRE!" / "KHAI HỎA" and secondary blue button "END TURN".

Overlays & Result Screen:
- Paused Overlay: Dimmed battlefield (55%), centered navy glass card, title "Trận đấu đang tạm dừng", body text, primary button "Tiếp tục", secondary "Rời trận".
- Result Screen (FINISHED state): Full-screen winter celebration gradient, confetti particles, 680 px result card with snowflake seal ("WIN" / "DRAW" / "DEFEAT"). Details: Score breakdown, Accuracy %, Max Combo, Struggling Japanese vocabulary review list. Actions: Primary orange button "CHƠI LẠI" (solo), Secondary blue button "TÁI ĐẤU TRONG PHÒNG" (multiplayer), Quiet button "VỀ SẢNH".
```

#### Chi tiết các nút trên template `air-defense/board.html` & React App:

| Nút / Interactive Element | Selector / Attribute | Loại / State | Visual & Trạng thái UI |
|---|---|---|---|
| **Nút Mute/Unmute Âm thanh** | `button.sound-toggle` | HUD control | Icon loa 🔊 (bật) / 🔇 (tắt). Click bật/tắt nhạc nền và âm thanh ném tuyết. |
| **Nút `Tạm dừng` / `PAUSE`** | `button[data-air-pause]` | HUD control | Ghost button chữ navy/trắng. Solo: tạm dừng game & server timer. Multiplayer: disabled hoặc gửi yêu cầu tạm dừng. |
| **Nút `Rời trận` / `EXIT`** | `button[data-air-exit]` | HUD control | Ghost button chữ coral red #F05B68. Click mở dialog xác nhận rời trận về sảnh. |
| **Điều chỉnh `ANGLE` (Góc ném)** | `.angle-stepper button / slider` | Gauge control | Nút `–` / `+` và thanh trượt điều chỉnh góc (0° - 90°). Text hiển thị `ANGLE 45°`. Keyboard mũi tên Lên/Xuống tăng giảm góc. |
| **Điều chỉnh `POWER` (Lực ném)** | `.power-stepper button / slider` | Gauge control | Nút `–` / `+` và thanh trượt lực (0% - 100%). Thanh segmented meter xanh lá. Keyboard Trái/Phải điều chỉnh lực. |
| **Skill Button 1: `Triple Shot`** | `button.skill-card[data-skill="TRIPLE"]` | Skill selector | Card chọn skill bắn 3 quả tuyết. Selected: viền vàng gold #FFD75A. Disabled: xám mờ khi đã dùng hết số lần. |
| **Skill Button 2: `Spread Shot`** | `button.skill-card[data-skill="SPREAD"]` | Skill selector | Card chọn skill bắn chùm 3 hướng. Selected: viền vàng gold + preview đường đạn mờ. |
| **Skill Button 3: `Piercing Snowball`** | `button.skill-card[data-skill="PIERCING"]` | Skill selector | Card chọn skill đạn xuyên địa hình. Selected: viền vàng gold. |
| **Input Trả lời tiếng Nhật** | `input#answer-input` | Text input | Input nhập Hiragana/Nghĩa tiếng Nhật. Hỗ trợ gõ bộ gõ IME tiếng Nhật. Keydown `Enter` tự kích hoạt nút FIRE. |
| **Nút Primary `❄ FIRE!` / `KHAI HỎA`** | `button[data-air-fire]` | Primary CTA | Nút cam rực rỡ #FF9D2E lớn nhất góc phải dock. Disabled khi không phải lượt, chưa nhập đáp án, hoặc đang tính đạn. Loading: `ĐANG TÍNH ĐƯỜNG ĐẠN…`. |
| **Nút `END TURN`** | `button[data-air-end-turn]` | Secondary CTA | Nút xanh lam #287ED5 bỏ lượt hoặc kết thúc lượt sớm. |
| **Nút `Tiếp tục` (Paused Overlay)** | `button.btn-resume` | Overlay action | Nút cam primary trong card tạm dừng để tiếp tục trận đấu. |
| **Nút `Rời trận` (Paused Overlay)** | `button.btn-exit-game` | Overlay action | Nút ghost trong card tạm dừng để hủy trận đấu. |
| **Nút `CHƠI LẠI` (Result Screen - Solo)** | `button.btn-replay` | Result CTA | Nút cam rực rỡ #FF9D2E lớn ở màn hình kết quả. Loading: `ĐANG CHUẨN BỊ…`. Click tạo lại ván solo mới. |
| **Nút `TÁI ĐẤU TRONG PHÒNG` (Result)** | `button.btn-rematch` | Result CTA | Nút xanh lam #287ED5 xuất hiện khi trận đấu thuộc multiplayer room. Click đưa 2 người chơi về room. |
| **Nút `VỀ SẢNH` (Result Screen)** | `button.btn-back-lobby` | Result action | Nút ghost/outline quay về sảnh game `/games`. |

---

### 18.7 Màn hình Memory Match Board (`src/main/resources/templates/memory/board.html` + React App)

**Target template file:** `src/main/resources/templates/memory/board.html`  
**Related assets:** `frontend/memory/src/App.tsx`, `memory-app.css`, `memory-store.js`.

```text
Redesign /games/memory/{sessionId} as a cozy snowy Japanese-learning card table.

Header Bar:
Title "Memory Match" with kicker "記憶合わせ · Solo practice / Multiplayer", connection status pill ("Trực tuyến"), top controls "Tạm dừng" and "Rời bàn".

HUD Bar (Below Header):
- Progress Pill: "Tiến độ: 4 / 10 cặp" with a smooth mint green progress bar.
- Counters: "Lượt đã dùng: 8", "Lượt còn lại: 12" (if limited), and Urgent Countdown Timer ("00:42" in amber text).

Main Content Grid (Responsive Card Table):
Center area: 4x4, 4x5, or 5x6 grid of large rounded memory cards (18-22 px radius, soft drop shadow).
Three Card States:
1. Face-down: Dark navy card back with snowflake-paw crest, subtle inner highlight, white border. Accessible button focus ring.
2. Revealed: Light ice-blue card face with card category label ("Kanji", "Hiragana", "Nghĩa") and large clear Japanese typography.
3. Matched: Mint green highlighted card (#67D68B 20% background, green border, checkmark icon "✓ Đã ghép").

Right Sidebar (Thành tích & Mẹo):
Player score chips with cat avatars, accuracy percentage (85%), streak counter ("🔥 3 cặp liên tiếp"), and a compact collapsible panel "Mẹo ghi nhớ Kanji".

Result Screen Overlay (FINISHED state):
Warm frosted glass card with gold snow seal "勝". Title "Hoàn thành!". Stats breakdown: Cặp đúng, Lượt lật, Thời gian. Review list "Từ nên ôn lại" with Japanese Kanji, Hiragana reading, and Vietnamese meaning. Actions: Primary orange button "Chơi lại", Secondary blue button "Về phòng", Quiet button "Về sảnh game".
```

#### Chi tiết các nút trên template `memory/board.html` & React App:

| Nút / Interactive Element | Selector / Attribute | Loại / State | Visual & Trạng thái UI |
|---|---|---|---|
| **Các thẻ bài Memory (Card Buttons)** | `button.memory-card` | Game board card | Native HTML `<button>` cho từng thẻ trên bàn (16-30 nút). Face-down: nền navy + icon paw. Hover: nâng 4px. Revealed: nền sáng + chữ Kanji/từ vựng. Matched: nền lá mint + icon ✓ (disabled click). Disabled khi không phải lượt hoặc đang lật 2 thẻ chưa resolve. |
| **Nút `Tạm dừng` / `Tiếp tục`** | `button.btn-memory-pause` | Top control | Nút tạm dừng ván Memory solo. Active: đổi nhãn thành `Tiếp tục`. |
| **Nút `Rời bàn`** | `button.btn-memory-exit` | Top control | Ghost button rời khỏi bàn chơi quay về sảnh hoặc room. |
| **Nút Collapsible `Mẹo ghi nhớ`** | `button.toggle-hints` | Sidebar toggle | Nút ẩn/hiện panel gợi ý cách nhớ Kanji ở sidebar phải. |
| **Nút `Chơi lại` (Result - Solo)** | `button.btn-memory-replay` | Result CTA | Nút cam primary #FF9D2E tạo lại ván Memory solo mới. Loading: `Đang tạo ván…`. |
| **Nút `Về phòng` (Result - Multi)** | `button.btn-memory-room` | Result CTA | Nút xanh lam #287ED5 quay lại room pre-match với đối thủ. |
| **Nút `Về sảnh game` (Result)** | `button.btn-memory-lobby` | Result action | Nút ghost/outline thoát về `/games`. |

---

### 18.8 Màn hình Trang lỗi / System Error (`src/main/resources/templates/error.html`)

**Target template file:** `src/main/resources/templates/error.html`  
**Related assets:** `tokens.css`, `base.css`.

```text
Redesign /error as a polished winter system error screen for Snowball Cats.

Background: Pale ice-blue radial winter gradient with subtle snow sparkle particles and a small original cat paw / snowflake illustration at the center.

Error Card Container:
Centered 560 px frosted glass card, 28 px rounded corners, 2 px white outline, backdrop blur 18 px, soft shadow.
- Status Code Badge: "ERROR 404" or "ERROR 500" or "J-LAS ARENA" rendered in bold mono font with sakura pink glow (#F05B68).
- Heading: "Không thể mở trang này".
- Paragraph Text:
  - 404 variant: "Đường dẫn không tồn tại hoặc đã được thay đổi."
  - Generic / 500 variant: "Phiên truy cập hoặc dịch vụ vừa gặp sự cố. Hãy quay về sảnh và thử lại."
- Action Buttons Container: Centered horizontal button row with generous gap:
  1. Primary Button: "Về sảnh game" (Orange gradient #FF9D2E, white bold text, rounded 20 px, links to /games).
  2. Secondary Button: "Thử lại" (Ghost white-blue button, navy text, onclick reload page).

Maintain visible focus rings, mobile landscape padding, and no game HUD elements on this page.
```

#### Chi tiết các nút trên template `error.html`:

| Nút / Interactive Element | Selector / Attribute | Loại / State | Visual & Trạng thái UI |
|---|---|---|---|
| **Nút Primary `Về sảnh game`** | `a.btn.btn--primary[href="/games"]` | Primary CTA | Nút cam #FF9D2E nổi bật chính giữa card lỗi. Click điều hướng an toàn về `/games`. Hover: nâng nhẹ + sáng viền. |
| **Nút Secondary `Thử lại`** | `button.btn.btn--ghost[onclick*="reload"]` | Action button | Nút trắng-xanh mờ. Click gọi `window.location.reload()` để tải lại trang hiện tại. Hover: nền xanh ice-blue. |

---

### 18.9 Static files không phải là trang vẽ

Các file JS/CSS static sau đây là module logic/adapter, không có giao diện vẽ độc lập:
- `api-client.js` (HTTP Client wrapper)
- `nav.js` (Navbar user session listener)
- `toast.js` (Toast notification renderer)
- `room-store.js` (WebSocket STOMP Room state store)
- `memory-store.js` (Memory Match state engine)
- `AirDefenseStompAdapter.ts` (Snowball Duel STOMP adapter)

---

## 19 — Standalone Stitch prompts for each missing page

Use exactly one block at a time. Do not paste all blocks into one Stitch request. Every block below is intentionally self-contained and explicitly asks for one route/state only.

### 19.1 — Snowball Duel gameplay only

```text
Draw ONLY the single active gameplay page for the existing route /games/air-defense/{sessionId}. Do not create a lobby, login page, result page, Memory Match page, or a multi-page presentation.

Create an original 1920x1080 Snowball Cats turn-based 2D winter battle screen, with responsive 1366x768 and mobile-landscape variants. Use two original chibi cats: an orange tabby with a cobalt scarf on the left snowy hill and a gray tabby with a coral scarf on the right. Show layered snowy hills, pine trees, lavender mountains, a cabin, clouds, falling snow, a dotted parabolic trajectory, a bright snowball in flight and a small powder impact. No guns, tanks, blood, military radar, realistic violence, copied commercial-game UI, watermark or remote artwork.

Top HUD: left Player 1 card with avatar, name, green HP 100/100, score and combo; right Player 2 mirror card with HP 80/100; center turn badge “LƯỢT CỦA PLAYER 1” and round/timer; top-right connection badge plus sound, pause and exit controls.

Bottom action dock: angle control with minus, “45°”, plus; segmented power meter “70%”; three skill cards “Triple Shot”, “Spread Shot”, “Piercing Snowball”; real accessible Japanese answer input; primary orange “KHAI HỎA” button; secondary blue “BỎ QUA” button. Show selected, hover, keyboard-focus, pressed, disabled and server-pending states. Keep all controls as real text layers and accessible HTML-style components outside the canvas.

Show only the ACTIVE_TURN state in the main frame. Add small adjacent component variants for angle adjustment, skill selected and fire loading, but do not create other route screens. Use existing J-LAS Snowball Cats palette, 20–28 px rounded panels, 2–3 px white outlines, Noto Sans/Noto Sans JP and condensed display numbers.

Deliver one frame named “/games/air-defense/{sessionId} · ACTIVE_TURN”, one responsive variant, a component state list and an interaction note for every control. Preserve existing route, API, WebSocket, class, ID and data-* contracts.
```

### 19.2 — Snowball Duel result only

```text
Draw ONLY the single finished-result page for /games/air-defense/{sessionId}. Do not create gameplay, lobby, login, Memory Match or any other page.

Create an original celebratory Snowball Cats result screen at 1920x1080 with a responsive mobile-landscape variant. Use a calm pale ice-blue winter background, soft snow particles and one centered 680 px frosted-glass result card. Show two small original cat portraits and a clear score comparison.

Create the WIN state as the primary frame: snowflake victory seal with both icon and text, kicker “MISSION REPORT · RANKED 1V1”, heading “Chiến thắng!”, score comparison, and statistic cards for “Điểm”, “HP còn lại”, “Snowballs trúng”, “Độ chính xác”, “Combo tốt nhất” and “Thời gian”. Add a review panel “Mục tiêu cần ôn lại” with Japanese prompt, expected answer and submitted answer. Add “KỶ LỤC CÁ NHÂN MỚI” badge when applicable.

Include component variants for DRAW, DEFEAT, SOLO SUCCESS, SOLO FAILED and replay pending, but keep them as variants of this same result page, not separate unrelated pages. Actions: orange “CHƠI LẠI”, blue “TÁI ĐẤU TRONG PHÒNG” when roomId exists, quiet “VỀ SẢNH”. Use visible focus, disabled and loading states. Never communicate outcome by color alone.

Deliver frames named “/games/air-defense/{sessionId} · FINISHED_WIN”, “FINISHED_DRAW”, “FINISHED_DEFEAT” and “REPLAY_PENDING”, plus a component/state inventory. Preserve existing result data fields and route behavior.
```

### 19.3 — Memory Match result only

```text
Draw ONLY the finished-result page/state for /games/memory/{sessionId}. Do not create the Memory board, Snowball Duel, lobby, login or any other page.

Create a quiet Japanese-learning result screen at 1920x1080 with a responsive mobile-landscape variant. Use the Snowball Cats winter palette, a centered 680 px frosted card, an original snow seal, and readable real text. Primary state: kicker “KẾT QUẢ MEMORY MATCH”, heading “Hoàn thành!”, and subtitle explaining that all vocabulary pairs were cleared.

Show three prominent statistics: “Cặp đúng”, “Lượt lật” and “Thời gian”. Add a review section titled “Từ nên ôn lại” with rows containing Japanese term, reading and Vietnamese meaning. Support zero, one and many review rows without breaking the layout.

Create variants for TIME_UP and MOVES_EXHAUSTED with changed heading/subtitle, plus replay pending and error-near-button variants. Actions: orange “Chơi lại”, blue “Về phòng” for multiplayer, quiet “Về sảnh game” for solo. Use icon plus text, visible focus, disabled/loading states and reduced-motion fallback.

Deliver frames named “/games/memory/{sessionId} · FINISHED”, “TIME_UP”, “MOVES_EXHAUSTED” and “REPLAY_PENDING”. Preserve the existing Memory result fields and actions; do not invent ranking or projectile controls.
```

### 19.4 — Shared navigation and footer only

```text
Draw ONLY the reusable shared web shell component for J-LAS Snowball Cats Arena. Do not create a game page, lobby, room, result or login screen.

Create a 64 px frosted ice-blue navigation bar and a reusable footer component. Navigation contains original snowflake-paw mark, “J-LAS Arena”, active links “Sảnh game” and “Lobby”, avatar, display name and “Đăng xuất”. Footer contains “J-LAS Snowball Cats Arena”, “Winter Gaming Championship 2024”, “Chính sách”, “Hướng dẫn” and “Hỗ trợ”.

Provide component variants for active nav, avatar loading, logout pending, mobile navigation drawer, keyboard focus and signed-out state. Keep the shell calm and readable; it must not look like the battlefield. Also show the shared toast anchor and connection-status placement, but do not draw gameplay behind it.

Deliver a component sheet with desktop, 1366 px and mobile-landscape variants. Name it “shared-shell · navigation-footer”. Preserve existing navigation links, logout behavior, class/ID/data-* contracts and accessible focus order.
```

### 19.5 — Loading, reconnect and error page only

```text
Draw ONLY the reusable loading/error experience for the existing /error route and game-loading overlays. Do not create a normal game page, lobby, room, login or result page.

Create a pale ice-blue winter background with subtle snow particles and one centered 560 px frosted card. Primary frame is 404: status “ERROR 404”, heading “Không thể mở trang này”, explanatory text “Đường dẫn không tồn tại hoặc đã được thay đổi.”, orange “Về sảnh game” and ghost “Thử lại”.

Create same-component variants for generic service error, initial loading, reconnecting and connection failed. Loading uses snowball spinner and live-region text “Đang chuẩn bị…”. Reconnecting uses “Mất kết nối” and “Thử lại” while preserving safe context. Do not use browser alert, fake score, game HUD or color-only status.

Deliver frames named “/error · 404”, “/error · GENERIC_ERROR”, “GAME · LOADING”, “GAME · RECONNECTING” and “GAME · CONNECTION_FAILED”. Include button default, hover, focus, pressed, disabled and loading states. Preserve existing retry and /games navigation behavior.
```

### 19.6 — Local asset sheet only

```text
Create ONLY an export-ready local asset sheet for Snowball Cats. Do not create a page layout or a multi-screen mockup.

Draw original transparent assets with consistent proportions and the existing Snowball Cats style: orange tabby cat with cobalt scarf, gray tabby cat with coral scarf, avatar portraits, snowball, dotted projectile trail, powder impact, snowflake-paw crest, snowy background layers, pine tree, cabin, cloud, snow particles, Snowball Duel thumbnail, Memory Match thumbnail, WIN seal, DRAW seal and DEFEAT seal.

Show every asset on a transparent checkerboard and on an ice-blue background. Provide export names: snowball-cat-orange.png, snowball-cat-gray.png, snowball-avatar-orange.png, snowball-avatar-gray.png, snowball-projectile.png, snowball-impact.png, snowflake-paw.svg, snowball-bg-layer.png, snowball-pine.png, snowball-cabin.png, game-thumb-duel.png, game-thumb-memory.png, result-seal-win.svg, result-seal-draw.svg and result-seal-defeat.svg.

Do not use Googleusercontent images, remote URLs, copied characters, logos, watermarks, photorealism, guns, tanks or military elements. Include dimensions, transparent-background requirement, safe crop and intended route/component for each asset.
```

## 19B — Additional Stitch prompt for the remaining UI and asset gaps

---

## 20 — Follow-up prompts để bổ sung đúng các phần còn thiếu trong `mẫu/bosung`

Các prompt dưới đây dùng riêng từng block để chỉnh các màn hình Stitch đã tạo. Không gửi cả mục 20 trong một lần.

### 20.1 — Bổ sung control và state cho Snowball Duel

```text
Edit ONLY the existing Snowball Duel gameplay frame for /games/air-defense/{sessionId}. Do not create another page and do not redesign the navigation, footer or result screen.

Keep the current visual direction and add the missing gameplay controls:
- Add a clear angle control with a minus button, numeric value “45°”, slider/track and plus button. Show default, hover, keyboard focus, pressed and disabled states.
- Add a clear power control with segmented meter, numeric value “70%”, minimum and maximum indication, and a keyboard-adjustable state.
- Add the missing secondary action “BỎ QUA” / “END TURN” beside the orange “KHAI HỎA” button.
- Keep the three skill cards visible and label them completely: “Triple Shot”, “Spread Shot”, “Piercing Snowball”. Show selected, locked, disabled-with-reason and cooldown variants.
- Keep the Japanese question, answer input and IME-friendly interaction. Add invalid answer, empty answer and submitting states.

Create a state sheet for this same page only: ACTIVE_TURN, WAITING_FOR_TARGET, FIRE_LOADING, PROJECTILE_IN_FLIGHT, HIT_FEEDBACK, MISS_FEEDBACK, PAUSED, RECONNECTING and CONNECTION_FAILED. Do not combine them into one overloaded screenshot. Name the frames with the route and state.

All controls must look like real accessible HTML controls with 44 px minimum hit area, visible focus ring, text labels and no color-only state communication. Preserve the existing Snowball Cats palette and all existing route/API/WebSocket contracts.
```

### 20.2 — Bổ sung battlefield và nhân vật mèo

```text
Edit ONLY the battlefield area of the existing /games/air-defense/{sessionId} Snowball Duel gameplay page. Do not change the HUD, question card, action dock, navigation or footer.

Replace the mostly empty blue background with a readable original winter battlefield:
- Left snowy hill with the original orange tabby cat wearing a cobalt-blue scarf.
- Right snowy hill with the original gray tabby cat wearing a coral-red scarf.
- Both cats must be visible as full-body game characters, not only circular avatar portraits.
- Add rounded snow hills, pine trees, distant lavender mountains, a small cabin, clouds, snow sparkle particles and soft blue shadows.
- Show a dotted parabolic trajectory from the active player to the opponent, a bright snowball in flight, and a small powder burst at the landing point.
- Keep the center of the battlefield clear so the trajectory remains readable.

Provide separate component variants for idle, active player, projectile in flight, hit impact and miss impact. Use original artwork only; no tanks, guns, military radar, blood, realistic violence, copied characters or remote image URLs.

Deliver only the battlefield component sheet and its placement inside the existing gameplay frame. Include desktop 1920x1080, 1366x768 and mobile-landscape crops without hiding either player or the projectile path.
```

### 20.3 — Bổ sung đủ trạng thái màn kết quả Snowball Duel

```text
Edit ONLY the existing Snowball Duel result page for /games/air-defense/{sessionId}. Do not create gameplay, lobby, login or Memory Match screens.

Keep the current result-card layout, but create separate frames for all missing states:
- FINISHED_WIN: “Chiến thắng!”
- FINISHED_DRAW: “Bất phân thắng bại”
- FINISHED_DEFEAT: “Thất bại”
- SOLO_SUCCESS: “Phòng tuyến vững vàng!”
- SOLO_FAILED: “Kết thúc nhiệm vụ”
- REPLAY_PENDING: same result card with “ĐANG CHUẨN BỊ…” and disabled replay button.

For every state, keep the cat-versus score comparison and these Vietnamese statistic labels: “Điểm”, “HP còn lại”, “Snowballs trúng”, “Độ chính xác”, “Combo tốt nhất”, “Thời gian”. Add the optional badge “KỶ LỤC CÁ NHÂN MỚI”. Keep the review section “Mục tiêu cần ôn lại” readable with zero, one and many items.

Remove the debug route text such as “/games/air-defense/{sessionId} · FINISHED_WIN” from the visual result card. Replace English labels such as Point, HP Left, Hits, Accuracy, Best Combo and Time with Vietnamese. Keep actions “CHƠI LẠI”, “TÁI ĐẤU TRONG PHÒNG” and “VỀ SẢNH”.

Deliver only these result-state frames and a component variant sheet. Use icon plus text for every outcome, not color alone. Preserve existing result data fields and route behavior.
```

### 20.4 — Bổ sung state cho Memory Match result

```text
Edit ONLY the existing Memory Match result page for /games/memory/{sessionId}. Do not create the Memory board or any other route.

Keep the current result-card visual style and create these separate frames:
- FINISHED_COMPLETE: “Hoàn thành!”
- TIME_UP: “Ván chơi kết thúc” with time-up explanation.
- MOVES_EXHAUSTED: “Ván chơi kết thúc” with move-limit explanation.
- REPLAY_PENDING: replay button disabled with “Đang tạo ván…”
- REVIEW_EMPTY: no struggling terms, show a positive empty-review message.
- REVIEW_FILLED: three or more review rows with Japanese term, reading and Vietnamese meaning.

Use Vietnamese labels only: “Cặp đúng”, “Lượt lật”, “Thời gian”, “Từ nên ôn lại”, “Chơi lại”, “Về phòng”, “Về sảnh game”. Keep the review list inside the card without overflow. Show visible focus, disabled, loading and error-near-button states.

Deliver only the Memory result state sheet. Do not add projectile, HP, angle, power or Snowball Duel skill controls.
```

### 20.5 — Bổ sung component sheet và asset export thật

```text
Edit ONLY the existing “SHARED ASSETS” frame. Do not create a product page or another gameplay screenshot.

Turn the current preview into an implementation-ready component and asset sheet. Add component variants for:
- Primary, secondary, ghost, danger, disabled and loading buttons.
- Text input, select, answer input, focus, invalid and disabled states.
- Progress bar with cat-paw cap, timer, HP bar and segmented power meter.
- Connected, connecting, reconnecting and disconnected badges.
- Success, info, warning and error toasts with Vietnamese copy.
- Modal, drawer, skeleton, spinner, empty state and error state.

Replace checkerboard/remote image previews with clearly labeled export-ready local assets. Show transparent-background previews and specify dimensions/export names for:
snowball-cat-orange.png, snowball-cat-gray.png, snowball-avatar-orange.png,
snowball-avatar-gray.png, snowball-projectile.png, snowball-impact.png,
snowflake-paw.svg, snowball-bg-layer.png, snowball-pine.png,
snowball-cabin.png, game-thumb-duel.png, game-thumb-memory.png,
result-seal-win.svg, result-seal-draw.svg and result-seal-defeat.svg.

Do not use Googleusercontent URLs, external image URLs, screenshots or fake checkerboard placeholders in the final asset handoff. Include a table mapping each asset/component to its consuming route and state.
```

### 20.6 — Bổ sung responsive và accessibility states

```text
Edit ONLY the existing Snowball Cats screens already created in `mẫu/bosung`; do not create new routes.

Create responsive variants for the Snowball Duel gameplay and result pages at 1920x1080, 1366x768 and mobile landscape. Ensure no horizontal overflow, no cropped primary button, no hidden answer input, and no overlap between HUD, question card and action dock.

Add an accessibility state sheet showing:
- Keyboard focus on every button, skill card, slider and input.
- Disabled and loading states with text explanation.
- Reduced-motion variant with no continuous particle/spin animation.
- Connection status expressed with icon and Vietnamese text, not color alone.
- Minimum 44x44 px hit areas and readable labels at mobile width.

Deliver only responsive/accessibility variants and an acceptance checklist for the existing frames. Preserve the existing visual design and route contracts.
```

Use the prompt below after `01 — Master art direction` when Stitch needs to draw the missing pieces. It is an implementation-ready handoff, not a single decorative screenshot.

```text
Complete the missing Snowball Cats UI and local asset package for the existing J-LAS Game Arena. Create real reusable components, real text layers, explicit component states, and separate frames for every route/state below.

PRODUCT CONSTRAINTS
- Keep the existing routes and behavior contracts exactly as they are:
  /login, /register, /games, /games/lobby, /games/room/{roomId},
  /games/air-defense/{sessionId}, /games/memory/{sessionId}, and /error.
- Preserve existing class names, IDs, data-* attributes, API meaning, WebSocket meaning, and server-authoritative state. Do not invent a new Card Duel gameplay route.
- Treat the existing CANNON_BATTLE/Air Defense implementation as the Snowball Duel product skin. Do not redesign it as a military game.
- Keep all visible labels and button copy in Vietnamese as specified in the existing prompt file. Keep Japanese-learning content as real text, never baked into images.
- Use the same two original chibi cats and the same color, typography, spacing, border and icon tokens on every frame.

PART A — SNOWBALL DUEL GAMEPLAY GAP
Create complete 1920x1080, 1366x768 and mobile-landscape frames for /games/air-defense/{sessionId}.

Show two original cats on opposite snowy hills, a clear dotted projectile arc, snowball flight, impact powder, soft pine trees, distant mountains, clouds and snow particles. Keep the center clear for the arc. No guns, tanks, blood, realistic violence, military radar or copied commercial-game UI.

Top HUD:
- Player 1 and Player 2 cards with cat avatar, name, HP bar, score, combo, connection status and active-turn accent.
- Center turn badge with “LƯỢT CỦA PLAYER 1” and a round/timer indicator.
- Accessible pause, sound, reconnect and exit controls.

Bottom action dock:
- Angle control with minus button, current value such as “45°”, plus button, and keyboard/focus/pressed/disabled states.
- Power control with segmented meter and value such as “70%”.
- Skill cards: “Triple Shot”, “Spread Shot” and “Piercing Snowball”. Each needs default, selected, locked, disabled-with-reason, hover, focus and pressed variants.
- Real accessible answer input for “KANJI → HIRAGANA” or “KANJI → NGHĨA”.
- Primary “KHAI HỎA” / “FIRE!” button and secondary “BỎ QUA” / “END TURN” button. Show server-pending text “ĐANG TÍNH ĐƯỜNG ĐẠN…” without moving the button.

Create separate frames for loading, online, connecting, reconnecting, waiting for target, active turn, angle adjustment, power adjustment, skill selected, invalid answer, projectile in flight, hit, miss, paused, connection failed and finished. Use text plus icon/shape for every status; never color alone. Keep essential gameplay controls outside the illustration/canvas for keyboard and screen-reader access.

PART B — RESULT SCREENS
Create two separate result families, not one generic success card:
1. Snowball Duel: WIN, DRAW, DEFEAT, SOLO SUCCESS and SOLO FAILED. Show cat-versus score comparison, score, remaining HP, snowballs hit, accuracy, best combo, duration, review targets, personal-best badge, replay pending and return/rematch actions.
2. Memory Match: COMPLETE, TIME UP and MOVES EXHAUSTED. Show pairs matched, flips, duration, struggling Japanese terms with reading and Vietnamese meaning, replay pending and room/lobby actions.

Each result family needs desktop and mobile-landscape frames. Use icon plus text for WIN/DRAW/DEFEAT, not color alone. Keep the review panel readable for zero, one or many items.

PART C — SHARED SHELL AND LOCAL ASSETS
Create a reusable component library and an export-ready local asset sheet:
- Frosted navigation bar with brand text, active route, avatar loading, logout pending and mobile drawer.
- Shared footer with “J-LAS Snowball Cats Arena”, “Chính sách”, “Hướng dẫn” and “Hỗ trợ”.
- Toast stack for success, info, warning and error, with icon, text, close button and accessible live-region placement.
- Connection badge for “Đang kết nối”, “Trực tuyến”, “Đang nối lại” and “Mất kết nối”.
- Buttons, inputs, selects, tags, badges, progress bars, modal, drawer, empty state, skeleton, spinner and focus ring.
- Original transparent PNG/SVG-ready assets: orange cat, gray cat, cat avatars, snowball, projectile trail, hit powder, snowflake-paw crest, game thumbnails, snowy background layers, pine trees, cabin, particles and result seals.
- Use predictable export names such as snowball-cat-orange.png, snowball-cat-gray.png, snowball-bg-layer.png, snowball-projectile.png, snowball-impact.png, snowflake-paw.svg, game-thumb-duel.png, game-thumb-memory.png and result-seal-win.svg.
- Do not rely on remote Googleusercontent images, Tailwind CDN, embedded screenshots or external artwork in the final handoff. Show every asset on transparent and on-background previews.

PART D — SECONDARY STATES
Create explicit frames for:
- Login/register validation, Google disabled, demo login, submitting and server error.
- Games live-stats loading/error and disabled Card Duel card.
- Lobby loading, populated, empty, refresh pending and join error.
- Room waiting, both ready, host can start, countdown 3-2-1, copy success, drawer open and failed connection.
- Memory loading, resolving, paused, reconnecting, invalid move and reduced motion.
- Generic error, 404, retry loading and return-to-lobby.

DELIVERABLE FORMAT
- Name frames by route and state, for example:
  “/games/air-defense/{sessionId} · ACTIVE_TURN”,
  “/games/air-defense/{sessionId} · PROJECTILE_HIT”,
  “/games/air-defense/{sessionId} · FINISHED_WIN”,
  “/games/memory/{sessionId} · FINISHED”,
  “/games/room/{roomId} · COUNTDOWN”, and “/error · 404”.
- Provide desktop 1920x1080, desktop 1366x768 and mobile-landscape variants where relevant.
- Include a component/state inventory and an interaction note for every button, input, modal, drawer and overlay.
- List component names, variants, tokens, asset export names and which existing route/state consumes each component.
- Do not output only a hero screenshot. The minimum output is the full route/state set plus reusable component and asset sheets.
```

Khi redesign visual, chỉ cần giữ nguyên các `class`, `id`, `data-*` attribute và event handler được liệt kê trong bảng spec từng trang ở trên để đảm bảo các module logic hoạt động hoàn hảo không bị lỗi backend hay WebSocket.
