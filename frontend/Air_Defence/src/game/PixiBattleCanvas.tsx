import React, { useEffect, useRef } from "react";
import { Application, Assets, Container, Graphics, Sprite, Text, TextStyle, Texture } from "pixi.js";
import { useAirDefenseStore } from "./useAirDefenseStore";
import { GAME_CONFIG } from "./gameConfig";
import { LootItem } from "./types";
import { ComboSplashOverlay } from "./ComboSplashOverlay";

interface ExplosionAnim {
  container: Container;
  sprites: (Sprite | Graphics)[];
  currentFrame: number;
  maxFrames: number;
  frameCounter: number;
  x: number;
  y: number;
}

export const PixiBattleCanvas: React.FC<{ isPvP?: boolean }> = ({ isPvP = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);

  const equippedShipId = useAirDefenseStore((s) => s.equippedShipId);
  const dangerZoneActive = useAirDefenseStore((s) => s.dangerZoneActive);
  const screenShake = useAirDefenseStore((s) => s.screenShake);
  const inboundBoss = useAirDefenseStore((s) => s.inboundBoss);
  const waveTransition = useAirDefenseStore((s) => s.waveTransition);
  const introState = useAirDefenseStore((s) => s.introState);
  const floatingTexts = useAirDefenseStore((s) => s.floatingTexts);
  const tickGameLoop = useAirDefenseStore((s) => s.tickGameLoop);
  const skipIntro = useAirDefenseStore((s) => s.skipIntro);
  const hyperBeamActive = useAirDefenseStore((s) => s.hyperBeamActive);
  const hyperBeamPhase = useAirDefenseStore((s) => s.hyperBeamPhase);

  useEffect(() => {
    let isMounted = true;
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const app = new Application();

    (async () => {
      await app.init({
        width,
        height,
        backgroundColor: 0x070a12,
        resolution: Math.min(window.devicePixelRatio || 1, 2.0),
        autoDensity: true,
        antialias: true
      });

      if (!isMounted) {
        app.destroy(true, { children: true });
        return;
      }

      appRef.current = app;
      container.appendChild(app.canvas);

      // Layer Containers
      const bgLayer = new Container();
      const fxLayer = new Container();
      const lootLayer = new Container();
      const enemiesLayer = new Container();
      const playerLayer = new Container();
      const explosionLayer = new Container();
      const textLayer = new Container();

      app.stage.addChild(bgLayer);
      app.stage.addChild(fxLayer);
      app.stage.addChild(lootLayer);
      app.stage.addChild(enemiesLayer);
      app.stage.addChild(playerLayer);
      app.stage.addChild(explosionLayer);
      app.stage.addChild(textLayer);

      // 1. Background Parallax
      let bgSprite1: Sprite | null = null;
      let bgSprite2: Sprite | null = null;
      try {
        const bgTex = await Assets.load<Texture>("/assets/space/BG.png");
        if (bgTex) {
          bgSprite1 = new Sprite(bgTex);
          bgSprite2 = new Sprite(bgTex);
          bgSprite1.width = app.screen.width;
          bgSprite1.height = app.screen.height;
          bgSprite2.width = app.screen.width;
          bgSprite2.height = app.screen.height;
          bgSprite2.y = -app.screen.height;
          bgLayer.addChild(bgSprite1);
          bgLayer.addChild(bgSprite2);
        }
      } catch (e) {
        console.warn("Background texture fallback to starfield", e);
      }

      // Starfield particles with warp elongation capability
      const stars: { g: Graphics; speed: number; x: number; y: number; baseSpeed: number }[] = [];
      for (let i = 0; i < GAME_CONFIG.VISUALS.starfieldCount; i++) {
        const star = new Graphics();
        const size = Math.random() * 2 + 1;
        star.circle(0, 0, size).fill({ color: 0xc1eeff, alpha: Math.random() * 0.7 + 0.3 });
        const x = Math.random() * app.screen.width;
        const y = Math.random() * app.screen.height;
        star.x = x;
        star.y = y;
        bgLayer.addChild(star);
        const speed = Math.random() * 1.5 + 0.6;
        stars.push({ g: star, speed, baseSpeed: speed, x, y });
      }

      // 2. Player Ship & Exhaust Flame Setup
      const playerShipContainer = new Container();
      playerLayer.addChild(playerShipContainer);

      let shipSprite: Sprite | null = null;
      const exhaustSprites: (Sprite | Graphics)[] = [];
      let exhaustFrame = 0;

      // Base Sci-Fi ship body
      const baseShipG = new Graphics();
      baseShipG
        .poly([-26, 24, 0, -32, 26, 24, 12, 18, 0, 24, -12, 18])
        .fill({ color: 0x0c2238 })
        .stroke({ color: 0x55f4ff, width: 2 });
      playerShipContainer.addChild(baseShipG);

      try {
        const shipConfig = GAME_CONFIG.SHIPS.find((s) => s.id === equippedShipId) || GAME_CONFIG.SHIPS[0];
        const shipTex = await Assets.load<Texture>(shipConfig.spritePath);
        if (shipTex) {
          shipSprite = new Sprite(shipTex);
          shipSprite.anchor.set(0.5);
          shipSprite.scale.set(0.72);
          playerShipContainer.addChild(shipSprite);
        }

        // Load animated exhaust flames
        for (let f = 1; f <= 5; f++) {
          try {
            const exTex = await Assets.load<Texture>(`/assets/space/FX/exhaust_0${f}.png`);
            if (exTex) {
              const exSpr = new Sprite(exTex);
              exSpr.anchor.set(0.5, 0);
              exSpr.y = 20;
              exSpr.scale.set(0.65);
              exSpr.visible = f === 1;
              playerShipContainer.addChild(exSpr);
              exhaustSprites.push(exSpr);
            }
          } catch (e) {}
        }
      } catch (e) {}

      // Fallback animated exhaust
      if (exhaustSprites.length === 0) {
        const flameG = new Graphics();
        flameG.poly([-8, 20, 0, 36, 8, 20]).fill({ color: 0x55f4ff, alpha: 0.85 });
        playerShipContainer.addChild(flameG);
        exhaustSprites.push(flameG);
      }

      const comboAuraG = new Graphics();
      playerShipContainer.addChildAt(comboAuraG, 0);

      playerShipContainer.x = app.screen.width / 2;
      playerShipContainer.y = app.screen.height * 0.85;

      // 3. Preload Space Mine & Explosion textures
      const mineTextures: Texture[] = [];
      for (let m = 1; m <= 9; m++) {
        try {
          const mTex = await Assets.load<Texture>(`/assets/space/Enemies/mine_11_0${m}.png`);
          if (mTex) mineTextures.push(mTex);
        } catch (e) {}
      }

      const explosionTextures: Texture[] = [];
      for (let ex = 1; ex <= 11; ex++) {
        const numStr = ex < 10 ? `0${ex}` : `${ex}`;
        try {
          const expTex = await Assets.load<Texture>(`/assets/space/Explosions/explosion_1_${numStr}.png`);
          if (expTex) explosionTextures.push(expTex);
        } catch (e) {}
      }

      // Preload Enemy Sprites
      let enemyNormalTex: Texture | null = null;
      let enemyFastTex: Texture | null = null;
      try {
        enemyNormalTex = await Assets.load<Texture>("/assets/space/Enemies/enemy_1_b_m.png");
        enemyFastTex = await Assets.load<Texture>("/assets/space/Enemies/enemy_2_r_m.png");
      } catch (e) {}

      // Active Enemy Nodes
      const enemyNodes = new Map<
        string,
        {
          container: Container;
          sprite: Sprite | null;
          textKanji: Text;
          textReading: Text;
          badgeG: Graphics;
          bossHpBar?: Graphics;
          mineFrame: number;
        }
      >();

      // Active Loot Nodes
      const lootNodes = new Map<string, { container: Container; g: Graphics; rotSpeed: number }>();

      const activeExplosions: ExplosionAnim[] = [];
      const laserG = new Graphics();
      const hyperBeamG = new Graphics();
      fxLayer.addChild(laserG);
      fxLayer.addChild(hyperBeamG);

      // Helper: Trigger Explosion Animation
      const spawnExplosion = (x: number, y: number) => {
        const expCont = new Container();
        expCont.x = x;
        expCont.y = y;
        explosionLayer.addChild(expCont);

        if (explosionTextures.length > 0) {
          const sprites: Sprite[] = [];
          explosionTextures.forEach((tex, idx) => {
            const s = new Sprite(tex);
            s.anchor.set(0.5);
            s.scale.set(0.85);
            s.visible = idx === 0;
            expCont.addChild(s);
            sprites.push(s);
          });

          activeExplosions.push({
            container: expCont,
            sprites,
            currentFrame: 0,
            maxFrames: explosionTextures.length,
            frameCounter: 0,
            x,
            y
          });
        } else {
          const burstG = new Graphics();
          burstG.circle(0, 0, 24).fill({ color: 0xffa040, alpha: 0.9 });
          expCont.addChild(burstG);
          activeExplosions.push({
            container: expCont,
            sprites: [burstG],
            currentFrame: 0,
            maxFrames: 6,
            frameCounter: 0,
            x,
            y
          });
        }
      };

      // 4. Main 60 FPS Render Loop
      let lastTime = performance.now();
      let exhaustTick = 0;
      let prevTargetIds = new Set<string>();

      app.ticker.add(() => {
        const now = performance.now();
        const delta = (now - lastTime) / 16.66;
        lastTime = now;

        const currentTransition = useAirDefenseStore.getState().waveTransition;
        const isWarping = currentTransition.active && currentTransition.phase === "warp";
        const isIntro = useAirDefenseStore.getState().introState.active;

        // Background Parallax Scroll & Warp Speed
        const bgSpeed = isWarping ? GAME_CONFIG.VISUALS.bgScrollSpeed * 7 : GAME_CONFIG.VISUALS.bgScrollSpeed;
        if (bgSprite1 && bgSprite2) {
          bgSprite1.y += bgSpeed * delta;
          bgSprite2.y += bgSpeed * delta;
          if (bgSprite1.y >= app.screen.height) bgSprite1.y = bgSprite2.y - app.screen.height;
          if (bgSprite2.y >= app.screen.height) bgSprite2.y = bgSprite1.y - app.screen.height;
        }

        // Stars warp streak animation
        stars.forEach((s) => {
          const mult = isWarping ? 8 : 1;
          s.y += s.baseSpeed * mult * delta;
          if (s.y > app.screen.height) {
            s.y = 0;
            s.x = Math.random() * app.screen.width;
          }
          s.g.x = s.x;
          s.g.y = s.y;

          s.g.clear();
          if (isWarping) {
            s.g
              .moveTo(0, 0)
              .lineTo(0, 24 * s.baseSpeed)
              .stroke({ color: 0x55f4ff, width: 2, alpha: 0.9 });
          } else {
            s.g.circle(0, 0, 1.5).fill({ color: 0xc1eeff, alpha: 0.8 });
          }
        });

        // Player Ship Intro Entrance Animation
        if (isIntro) {
          const targetY = app.screen.height * 0.85;
          playerShipContainer.y = Math.max(targetY, playerShipContainer.y - 4 * delta);
        } else {
          playerShipContainer.y = app.screen.height * 0.85;
        }

        // Exhaust flame cycle
        exhaustTick += delta;
        if (exhaustTick > 3) {
          exhaustTick = 0;
          if (exhaustSprites.length > 1) {
            exhaustSprites[exhaustFrame].visible = false;
            exhaustFrame = (exhaustFrame + 1) % exhaustSprites.length;
            exhaustSprites[exhaustFrame].visible = true;
          }
        }

        // Tick Game Logic Store
        tickGameLoop(delta);

        // Render Enemies
        const currentTargets = useAirDefenseStore.getState().targets;
        const activeIds = new Set<string>();

        currentTargets.forEach((t) => {
          if (t.isDead) return;
          activeIds.add(t.id);

          let node = enemyNodes.get(t.id);
          const isBoss = t.type === "MINI_BOSS";

          if (!node) {
            const enemyCont = new Container();
            let enemySpr: Sprite | null = null;

            if (isBoss) {
              if (enemyFastTex) {
                enemySpr = new Sprite(enemyFastTex);
                enemySpr.anchor.set(0.5);
                enemySpr.scale.set(GAME_CONFIG.ENEMIES.bossScale);
                enemyCont.addChild(enemySpr);
              }
              // Double Pulsating Boss Shockwave Aura
              const auraG = new Graphics();
              auraG.circle(0, 0, 68).stroke({ color: 0xff1a4b, width: 3, alpha: 0.85 });
              auraG.circle(0, 0, 84).stroke({ color: 0xff3366, width: 1.5, alpha: 0.5 });
              enemyCont.addChild(auraG);
            } else if (t.type === "SPACE_MINE" && mineTextures.length > 0) {
              enemySpr = new Sprite(mineTextures[0]);
              enemySpr.anchor.set(0.5);
              enemySpr.scale.set(0.65);
              enemyCont.addChild(enemySpr);
            } else if (t.type === "MONSTER_FAST" && enemyFastTex) {
              enemySpr = new Sprite(enemyFastTex);
              enemySpr.anchor.set(0.5);
              enemySpr.scale.set(0.65);
              enemyCont.addChild(enemySpr);
            } else if (enemyNormalTex) {
              enemySpr = new Sprite(enemyNormalTex);
              enemySpr.anchor.set(0.5);
              enemySpr.scale.set(0.65);
              enemyCont.addChild(enemySpr);
            } else {
              const g = new Graphics();
              g.poly([-16, -18, 0, 18, 16, -18, 0, -10])
                .fill({ color: isBoss ? 0xff0055 : t.type === "MONSTER_FAST" ? 0xff4d6d : 0x00d2ff })
                .stroke({ color: 0xffffff, width: 1.5 });
              enemyCont.addChild(g);
            }

            // Japanese Kanji & Furigana Badge
            const badgeG = new Graphics();
            const badgeW = isBoss ? 160 : 92;
            const badgeH = isBoss ? 56 : 40;
            const badgeY = isBoss ? -96 : -58;

            badgeG
              .roundRect(-badgeW / 2, badgeY, badgeW, badgeH, 10)
              .fill({ color: isBoss ? 0x240512 : 0x070e1c, alpha: 0.95 })
              .stroke({ color: isBoss ? 0xff1a4b : 0x55f4ff, width: isBoss ? 2.5 : 1.5 });
            enemyCont.addChild(badgeG);

            const textKanji = new Text({
              text: t.word,
              style: new TextStyle({
                fontFamily: "Noto Sans JP, sans-serif",
                fontSize: isBoss ? 24 : 18,
                fontWeight: "bold",
                fill: isBoss ? "#ff4d6d" : "#55f4ff",
                align: "center"
              })
            });
            textKanji.anchor.set(0.5);
            textKanji.y = isBoss ? -78 : -46;
            enemyCont.addChild(textKanji);

            const textReading = new Text({
              text: t.reading,
              style: new TextStyle({
                fontFamily: "JetBrains Mono, monospace",
                fontSize: isBoss ? 12 : 10,
                fill: isBoss ? "#ffc0cb" : "#9cb5d7",
                align: "center"
              })
            });
            textReading.anchor.set(0.5);
            textReading.y = isBoss ? -52 : -28;
            enemyCont.addChild(textReading);

            // Boss HP Segment Bar
            let bossHpBar: Graphics | undefined;
            if (isBoss) {
              bossHpBar = new Graphics();
              enemyCont.addChild(bossHpBar);
            }

            // Click-to-Kill chỉ kích hoạt duy nhất trong phòng thí nghiệm Dev Sandbox
            enemyCont.eventMode = "static";
            enemyCont.cursor = useAirDefenseStore.getState().screen === "sandbox" ? "crosshair" : "default";
            enemyCont.on("pointerdown", (e) => {
              if (useAirDefenseStore.getState().screen === "sandbox") {
                e.stopPropagation();
                useAirDefenseStore.getState().killTargetById(t.id);
              }
            });

            enemiesLayer.addChild(enemyCont);
            node = { container: enemyCont, sprite: enemySpr, textKanji, textReading, badgeG, bossHpBar, mineFrame: 0 };
            enemyNodes.set(t.id, node);
          }

          // Update Boss HP Bar
          if (isBoss && node.bossHpBar) {
            node.bossHpBar.clear();
            const currentHp = t.currentHp || 1;
            const maxHp = t.maxHp || 5;
            const barW = 150;
            const barH = 8;
            const barY = -110;

            node.bossHpBar
              .roundRect(-barW / 2, barY, barW, barH, 4)
              .fill({ color: 0x330011, alpha: 0.85 })
              .stroke({ color: 0xff1a4b, width: 1.5 });

            const fillW = Math.max(0, (currentHp / maxHp) * (barW - 2));
            const hpColor = currentHp > 2 ? 0xff3366 : 0xffa000;
            node.bossHpBar
              .roundRect(-barW / 2 + 1, barY + 1, fillW, barH - 2, 3)
              .fill({ color: hpColor, alpha: 1 });
          }

          // Animate rotating space mine
          if (t.type === "SPACE_MINE" && mineTextures.length > 0 && node.sprite) {
            node.mineFrame = (node.mineFrame + 0.15 * delta) % mineTextures.length;
            node.sprite.texture = mineTextures[Math.floor(node.mineFrame)];
          }

          // Smooth vertical drop with subtle organic space sway
          const swaySeed = (t.id.charCodeAt(t.id.length - 1) || 5) * 0.7;
          const swayX = isBoss ? Math.sin(now * 0.001) * 3 : Math.sin(now * 0.002 + swaySeed) * 4;

          node.container.x = Math.max(25, Math.min(app.screen.width - 25, (t.posX / 100) * app.screen.width + swayX));
          node.container.y = (t.posY / 100) * app.screen.height;
        });

        // Detect newly destroyed targets for explosion VFX
        prevTargetIds.forEach((id) => {
          if (!activeIds.has(id)) {
            const oldNode = enemyNodes.get(id);
            if (oldNode) {
              spawnExplosion(oldNode.container.x, oldNode.container.y);
            }
          }
        });
        prevTargetIds = activeIds;

        // Clean dead nodes
        enemyNodes.forEach((node, id) => {
          if (!activeIds.has(id)) {
            enemiesLayer.removeChild(node.container);
            node.container.destroy({ children: true });
            enemyNodes.delete(id);
          }
        });

        // ====================================================================
        // RENDER LOOT ITEMS (Credit Diamonds, Repair Packs, Hyper Orbs)
        // ====================================================================
        const currentLoot = useAirDefenseStore.getState().lootItems;
        const activeLootIds = new Set<string>();

        currentLoot.forEach((item) => {
          if (item.collected) return;
          activeLootIds.add(item.id);

          let node = lootNodes.get(item.id);
          if (!node) {
            const cont = new Container();
            const g = new Graphics();

            if (item.type === "CREDIT_CRYSTAL") {
              // Glowing Gold / Amber Diamond Crystal
              g.poly([0, -10, 8, 0, 0, 10, -8, 0])
                .fill({ color: 0xffd700, alpha: 0.95 })
                .stroke({ color: 0xfff0a0, width: 1.5 });
              g.circle(0, 0, 12).stroke({ color: 0xffaa00, width: 1, alpha: 0.5 });
            } else if (item.type === "REPAIR_PACK") {
              // Glowing Green Repair Nano Box
              g.roundRect(-8, -8, 16, 16, 3)
                .fill({ color: 0x00e676, alpha: 0.9 })
                .stroke({ color: 0xffffff, width: 1.5 });
              // White cross
              g.rect(-2, -5, 4, 10).fill({ color: 0xffffff });
              g.rect(-5, -2, 10, 4).fill({ color: 0xffffff });
            } else {
              // Glowing Violet Plasma Hyper Orb
              g.circle(0, 0, 9).fill({ color: 0xba68c8, alpha: 0.95 }).stroke({ color: 0xe1bee7, width: 1.5 });
              g.circle(0, 0, 14).stroke({ color: 0x9c27b0, width: 1, alpha: 0.6 });
            }

            cont.addChild(g);
            lootLayer.addChild(cont);
            node = { container: cont, g, rotSpeed: (Math.random() - 0.5) * 0.1 };
            lootNodes.set(item.id, node);
          }

          node.container.x = (item.x / 100) * app.screen.width;
          node.container.y = (item.y / 100) * app.screen.height;
          node.g.rotation += node.rotSpeed * delta;
        });

        // Clean collected/expired loot
        lootNodes.forEach((node, id) => {
          if (!activeLootIds.has(id)) {
            lootLayer.removeChild(node.container);
            node.container.destroy({ children: true });
            lootNodes.delete(id);
          }
        });

        // Update Active Explosions
        for (let i = activeExplosions.length - 1; i >= 0; i--) {
          const exp = activeExplosions[i];
          exp.frameCounter += delta;
          if (exp.frameCounter >= 2) {
            exp.frameCounter = 0;
            if (exp.sprites[exp.currentFrame]) {
              exp.sprites[exp.currentFrame].visible = false;
            }
            exp.currentFrame++;
            if (exp.currentFrame < exp.maxFrames && exp.sprites[exp.currentFrame]) {
              exp.sprites[exp.currentFrame].visible = true;
            } else {
              explosionLayer.removeChild(exp.container);
              exp.container.destroy({ children: true });
              activeExplosions.splice(i, 1);
            }
          }
        }

        // Laser Lock-on Beam Render
        const laser = useAirDefenseStore.getState().lastLaserTarget;
        laserG.clear();
        if (laser) {
          const startX = playerShipContainer.x;
          const startY = playerShipContainer.y - 18;
          const endX = (laser.x / 100) * app.screen.width;
          const endY = (laser.y / 100) * app.screen.height;

          laserG
            .moveTo(startX - 8, startY)
            .lineTo(endX, endY)
            .stroke({ color: 0x55f4ff, width: GAME_CONFIG.VISUALS.laserBeamWidth, alpha: 0.95 });
          laserG
            .moveTo(startX + 8, startY)
            .lineTo(endX, endY)
            .stroke({ color: 0x55f4ff, width: GAME_CONFIG.VISUALS.laserBeamWidth, alpha: 0.95 });

          laserG
            .moveTo(startX, startY)
            .lineTo(endX, endY)
            .stroke({ color: 0xa979ff, width: GAME_CONFIG.VISUALS.laserGlowWidth, alpha: 0.35 });
        }

        // Dynamic Combo Hull & Engine Aura Render
        const currentCombo = useAirDefenseStore.getState().combo;
        comboAuraG.clear();
        if (currentCombo >= 5) {
          comboAuraG.visible = true;
          const auraTime = performance.now() * 0.003;
          const radius = 32 + Math.sin(auraTime * 4) * 2;

          if (currentCombo >= 30) {
            // Tier 5: Supernova Cosmic Aurora
            comboAuraG.circle(0, 0, radius + 10).stroke({ color: 0x55f4ff, width: 3, alpha: 0.8 });
            comboAuraG.circle(0, 0, radius + 4).stroke({ color: 0xffd700, width: 2, alpha: 0.6 });
            comboAuraG.circle(0, 0, radius + 18).stroke({ color: 0xc3a6ff, width: 1, alpha: 0.4 });
            for (let i = 0; i < 4; i++) {
              const angle = auraTime * 2 + (i * Math.PI) / 2;
              const ox = Math.cos(angle) * (radius + 12);
              const oy = Math.sin(angle) * (radius + 12);
              comboAuraG.circle(ox, oy, 3.5).fill({ color: 0x55f4ff, alpha: 0.9 });
            }
          } else if (currentCombo >= 20) {
            // Tier 4: Godlike Cyber Flame & Lightning
            comboAuraG.circle(0, 0, radius + 8).stroke({ color: 0xff4d6d, width: 2.5, alpha: 0.75 });
            comboAuraG.circle(0, 0, radius + 2).stroke({ color: 0xff1a4b, width: 1.5, alpha: 0.5 });
            for (let i = 0; i < 3; i++) {
              const angle = auraTime * 2.5 + (i * Math.PI * 2) / 3;
              const ox = Math.cos(angle) * (radius + 8);
              const oy = Math.sin(angle) * (radius + 8);
              comboAuraG.circle(ox, oy, 3).fill({ color: 0xff4d6d, alpha: 0.85 });
            }
          } else if (currentCombo >= 10) {
            // Tier 3: Hyper Plasma Violet
            comboAuraG.circle(0, 0, radius + 6).stroke({ color: 0xc3a6ff, width: 2, alpha: 0.7 });
            comboAuraG.circle(0, 0, radius).stroke({ color: 0xa979ff, width: 1.5, alpha: 0.45 });
            for (let i = 0; i < 2; i++) {
              const angle = auraTime * 1.8 + i * Math.PI;
              const ox = Math.cos(angle) * (radius + 6);
              const oy = Math.sin(angle) * (radius + 6);
              comboAuraG.circle(ox, oy, 2.5).fill({ color: 0xc3a6ff, alpha: 0.8 });
            }
          } else {
            // Tier 2: Heat Streak Gold
            comboAuraG.circle(0, 0, radius + 4).stroke({ color: 0xffc857, width: 1.8, alpha: 0.65 });
            comboAuraG.circle(0, 0, radius - 2).stroke({ color: 0xffaa00, width: 1, alpha: 0.35 });
          }
        } else {
          comboAuraG.visible = false;
        }

        // Hyper Beam Ultimate Super-Laser Render
        const beamPhase = useAirDefenseStore.getState().hyperBeamPhase;
        const isHyperBeam = beamPhase === "firing";
        const isCharging = beamPhase === "charge";

        hyperBeamG.clear();

        if (isCharging) {
          const px = playerShipContainer.x;
          const py = playerShipContainer.y - 20;
          const pulse = 0.5 + Math.sin(Date.now() * 0.08) * 0.5;

          // 1. Converging Energy Charge Vortex Rings
          for (let r = 1; r <= 3; r++) {
            const rad = 70 - ((Date.now() * 0.06 + r * 20) % 60);
            if (rad > 6) {
              hyperBeamG
                .circle(px, py, rad)
                .stroke({ color: 0x55f4ff, width: 2, alpha: (1 - rad / 70) * 0.85 });
            }
          }

          // 2. High-Density Plasma Core Orb charging at nozzle
          hyperBeamG.circle(px, py, 14 + pulse * 10).fill({ color: 0xffffff, alpha: 0.95 });
          hyperBeamG.circle(px, py, 28 + pulse * 16).fill({ color: 0xa979ff, alpha: 0.45 });

          // 3. Lightning tendrils gathering inwards
          for (let i = 0; i < 4; i++) {
            const angle = (Date.now() * 0.005 + i * (Math.PI / 2)) % (Math.PI * 2);
            const dist = 40 + Math.random() * 25;
            hyperBeamG
              .moveTo(px + Math.cos(angle) * dist, py + Math.sin(angle) * dist)
              .lineTo(px, py)
              .stroke({ color: 0x55f4ff, width: 1.5, alpha: 0.8 });
          }
        } else if (isHyperBeam) {
          const px = playerShipContainer.x;
          const py = playerShipContainer.y - 22;
          const topY = -150;
          const pulse = 0.85 + Math.sin(Date.now() * 0.04) * 0.15;

          // 1. Giant Outer Purple/Violet Plasma Corona
          hyperBeamG
            .moveTo(px, py)
            .lineTo(px, topY)
            .stroke({
              color: 0x9d4edd,
              width: GAME_CONFIG.VISUALS.hyperBeamAuraWidth * pulse,
              alpha: 0.48
            });

          // 2. Cyan High-Energy Charged Core
          hyperBeamG
            .moveTo(px, py)
            .lineTo(px, topY)
            .stroke({
              color: 0x00f0ff,
              width: GAME_CONFIG.VISUALS.hyperBeamMidWidth * pulse,
              alpha: 0.88
            });

          // 3. Ultra-Dense Pure White Nuclear Laser Beam
          hyperBeamG
            .moveTo(px, py)
            .lineTo(px, topY)
            .stroke({
              color: 0xffffff,
              width: GAME_CONFIG.VISUALS.hyperBeamCoreWidth,
              alpha: 1.0
            });

          // 4. Energy Charge Wave Rings at Cannon Nozzle
          for (let r = 1; r <= GAME_CONFIG.VISUALS.hyperBeamRingsCount; r++) {
            const ringRadius = (16 * r + ((Date.now() * 0.08) % 24)) * pulse;
            hyperBeamG
              .circle(px, py, ringRadius)
              .stroke({ color: 0x00f0ff, width: 3 - r * 0.5, alpha: 0.9 - r * 0.18 });
          }

          // 5. Blinding Muzzle Flash Core Flare
          hyperBeamG
            .circle(px, py, 34 * pulse)
            .fill({ color: 0xffffff, alpha: 0.95 });
          hyperBeamG
            .circle(px, py, 60 * pulse)
            .fill({ color: 0x7b2cbf, alpha: 0.65 });

          // 6. Searing Electric Arcs & Lightning Discharges across the screen
          for (let s = 0; s < 10; s++) {
            const arcY = topY + ((Date.now() * 1.5 + s * 120) % (py - topY));
            const arcSpread = (Math.random() - 0.5) * (GAME_CONFIG.VISUALS.hyperBeamMidWidth * 1.6);
            hyperBeamG
              .moveTo(px, arcY)
              .lineTo(px + arcSpread, arcY + (Math.random() - 0.5) * 20)
              .stroke({ color: 0xffffff, width: 2, alpha: 0.85 });
          }
        }
      });

      // Handle Resize smoothly
      const onResize = () => {
        if (!containerRef.current || !appRef.current) return;
        const newW = containerRef.current.clientWidth;
        const newH = containerRef.current.clientHeight;
        appRef.current.renderer.resize(newW, newH);
        playerShipContainer.x = newW / 2;
        playerShipContainer.y = newH * 0.85;
        if (bgSprite1 && bgSprite2) {
          bgSprite1.width = newW;
          bgSprite1.height = newH;
          bgSprite2.width = newW;
          bgSprite2.height = newH;
        }
      };

      window.addEventListener("resize", onResize);
      return () => {
        window.removeEventListener("resize", onResize);
      };
    })();

    return () => {
      isMounted = false;
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
      }
    };
  }, [equippedShipId]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full rounded-2xl overflow-hidden border border-cyan-300/30 bg-[#070a12] transition-transform duration-75 ${
        screenShake ? "animate-screen-shake" : ""
      }`}
    >
      {/* ⚡ STAGE 1: HYPER BEAM CHARGING OVERLAY (Chỉ hiện ở 0.9s nén năng lượng) */}
      {hyperBeamPhase === "charge" && (
        <div className="pointer-events-none absolute inset-0 z-40 flex flex-col items-center justify-center bg-radial from-violet-950/60 via-black/30 to-transparent backdrop-blur-[1px] animate-pulse">
          <div className="text-center px-4 py-2 bg-black/80 rounded-2xl border border-cyan-400/80 shadow-[0_0_35px_rgba(85,244,255,0.7)] backdrop-blur-md animate-pulse">
            <p className="font-mono text-[10px] sm:text-xs font-bold text-cyan tracking-[.35em] uppercase">
              ⚡ HYPER BEAM // CHARGING...
            </p>
            <h2 className="font-display text-lg sm:text-2xl font-extrabold text-white tracking-widest mt-0.5 drop-shadow-[0_0_15px_#55f4ff]">
              »» NÉN NĂNG LƯỢNG CỰC ĐẠI ««
            </h2>
          </div>
        </div>
      )}

      {/* ⚡ STAGE 2: PURE VISUAL BURST FLASH (Không chữ đè, tầm nhìn chùm tia thông suốt) */}
      {hyperBeamPhase === "firing" && (
        <div className="pointer-events-none absolute inset-0 z-40 bg-radial from-violet-500/25 via-cyan-400/15 to-transparent mix-blend-screen animate-pulse">
          <div className="absolute inset-0 bg-white/20 animate-in fade-in duration-75" />
        </div>
      )}

      {/* Danger Zone Flashing Vignette */}
      {dangerZoneActive && (
        <div className="pointer-events-none absolute inset-0 border-4 border-rose-500/80 shadow-[inset_0_0_60px_rgba(255,77,109,.6)] animate-pulse z-10" />
      )}

      {/* Floating Pickup Text Popups */}
      {floatingTexts.map((ft) => (
        <div
          key={ft.id}
          className="pointer-events-none absolute -translate-x-1/2 font-mono text-xs font-extrabold tracking-wider z-25 transition-all duration-75"
          style={{
            left: `${ft.x}%`,
            top: `${ft.y}%`,
            color: ft.color,
            opacity: ft.opacity,
            textShadow: `0 0 10px ${ft.color}`
          }}
        >
          {ft.text}
        </div>
      ))}

      {/* ⚡ COMBO MILESTONE & REACTION SPLASH BADGE OVERLAY */}
      <ComboSplashOverlay />

      {/* 🚀 MATCH LAUNCH INTRO OVERLAY (Cinematic 3-Stage Bootup) */}
      {introState.active && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/65 backdrop-blur-sm transition-all duration-300">
          <div className="text-center px-4 max-w-lg">
            {introState.phase === "boot" && (
              <div className="animate-pulse">
                <p className="font-mono text-xs text-cyan tracking-[.4em] uppercase">QUÉT DỮ LIỆU HỆ THỐNG</p>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white mt-1">
                  MA TRẬN PHÒNG THỦ : TRỰC TUYẾN
                </h2>
                <div className="mt-3 flex justify-center gap-2">
                  <span className="h-1.5 w-12 rounded-full bg-cyan animate-pulse" />
                  <span className="h-1.5 w-12 rounded-full bg-cyan/50" />
                  <span className="h-1.5 w-12 rounded-full bg-cyan/20" />
                </div>
              </div>
            )}

            {introState.phase === "warpin" && (
              <div className="animate-bounce">
                <p className="font-mono text-xs text-[#ffc857] tracking-[.35em] uppercase font-bold">BƯỚC NHẢY VŨ TRỤ</p>
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white drop-shadow-[0_0_30px_rgba(85,244,255,0.8)]">
                  CHIẾN HẠM ĐÃ XUẤT KÍCH
                </h2>
                <p className="font-mono text-[10px] text-slate-300 mt-1">VẬN TỐC TÁC CHIẾN ĐÃ SẴN SÀNG</p>
              </div>
            )}

            {introState.phase === "ready" && (
              <div className="animate-pulse">
                <p className="font-mono text-xs text-rose-400 tracking-[.4em] uppercase font-bold">KHỞI ĐỘNG VÙNG CHIẾN 01</p>
                <h2 className="font-display text-5xl sm:text-6xl font-extrabold text-cyan drop-shadow-[0_0_40px_rgba(85,244,255,1)]">
                  XUẤT TRẬN!
                </h2>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cinematic Wave Transition Overlay */}
      {waveTransition.active && !introState.active && hyperBeamPhase === "idle" && (
        <div className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-300">
          {waveTransition.phase === "cleared" && (
            <div className="text-center animate-pulse">
              <p className="font-mono text-xs text-[#ffc857] tracking-[.3em] uppercase">BẢO VỆ THÀNH CÔNG · +1.000 ĐIỂM</p>
              <h2 className="font-display text-4xl sm:text-5xl font-extrabold text-cyan tracking-wider drop-shadow-[0_0_30px_rgba(85,244,255,0.8)]">
                VƯỢT QUA LÀN SÓNG {waveTransition.clearedWave.toString().padStart(2, "0")}
              </h2>
            </div>
          )}

          {waveTransition.phase === "warp" && (
            <div className="text-center animate-bounce">
              <p className="font-mono text-xs text-cyan tracking-[.4em] uppercase">GIA TỐC SIÊU KHÔNG GIAN</p>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-widest drop-shadow-[0_0_40px_rgba(255,255,255,0.9)]">
                »» TIẾN VÀO KHU VỰC {waveTransition.incomingWave.toString().padStart(2, "0")} ««
              </h2>
            </div>
          )}

          {waveTransition.phase === "incoming" && (
            <div className="text-center">
              {waveTransition.isBoss ? (
                <div className="animate-pulse">
                  <p className="font-mono text-xs text-rose-400 tracking-[.35em] uppercase font-bold">⚠ MỨC ĐỘ NGUY HIỂM TỐI CAO ⚠</p>
                  <h2 className="font-display text-4xl sm:text-5xl font-extrabold text-rose-500 tracking-wider drop-shadow-[0_0_40px_rgba(255,51,102,0.9)]">
                    CHIẾN HẠM BOSS XUẤT HIỆN
                  </h2>
                  <p className="font-mono text-xs text-rose-200 mt-1">GÕ CHUỖI 5 TỪ VỰNG ĐỂ TIÊU DIỆT CHIẾN HẠM KHỔNG LỒ</p>
                </div>
              ) : (
                <div className="animate-pulse">
                  <p className="font-mono text-xs text-cyan tracking-[.3em] uppercase">PHÁT HIỆN HẠM ĐỘI QUÁI VẬT MỚI</p>
                  <h2 className="font-display text-4xl sm:text-5xl font-extrabold text-cyan tracking-wider drop-shadow-[0_0_30px_rgba(85,244,255,0.8)]">
                    LÀN SÓNG {waveTransition.incomingWave.toString().padStart(2, "0")} TIẾP CẬN
                  </h2>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Boss Inbound Alert Banner */}
      {inboundBoss && !waveTransition.active && !introState.active && (
        <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 bg-rose-950/85 border border-rose-500 px-5 py-1.5 rounded-full backdrop-blur z-20 animate-bounce shadow-[0_0_24px_rgba(255,51,102,0.8)]">
          <p className="font-mono text-xs font-bold text-rose-300 tracking-widest uppercase">
            ⚠ CẢNH BÁO: CHIẾN HẠM BOSS XÂM NHẬP ⚠
          </p>
        </div>
      )}
    </div>
  );
};
