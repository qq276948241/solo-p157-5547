# 猫咪合成 · 代码运行流程说明

> 本文档帮助新开发者在 30 分钟内理解整个游戏的架构、数据流向和关键交互链路。
> 代码位置：`src/` 下；入口 `src/main.tsx`

---

## 一、应用启动链路：从 main.tsx 到完整页面

```
main.tsx
  └─> ReactDOM.createRoot(...) 挂载 App
        └─> App.tsx (BrowserRouter)
              └─> Route "/" ──> GamePage.tsx (唯一的页面组合层)
```

GamePage 是整个应用**唯一的组合层**，它的职责：
1. 调用三个 Hook 拿数据和行为
2. 订阅状态变化，按顺序触发音效副作用（解锁 / 过关 / 游戏结束）
3. 把状态通过 props 下发给所有子组件（子组件内部不再订阅 store）
4. 组装 UI：Header（按钮栏）→ ScorePanel → 左侧：主题标签 + Board + ProgressBar；右侧：Collection

GamePage 用到的三个 Hook：

| Hook | 职责 |
|------|------|
| `useGameLogic` | 游戏核心逻辑：状态、移动、合并、升级、图鉴解锁、快照/恢复 |
| `useGameHistory` | 最多 3 步撤回栈，与核心逻辑解耦（通过 `getSnapshot/applySnapshot` 注入） |
| `useAudio` | 基于 Web Audio API 程序化合成 BGM 与所有音效 |

再加上一个轻量状态仓库：

| Store | 职责 |
|-------|------|
| `useGameStore` (zustand) | 纯粹的状态容器 + 基础 setter；不包含业务逻辑 |
| `useAudioStore` (zustand) | 音频开关状态；持久化到 localStorage |

---

## 二、页面组装：GamePage 如何把组件拼起来

GamePage 的渲染结构（从上到下）：

```
Background (currentLevel as prop，负责壁纸渐变+图案)
  └─ <style> 内联 @keyframes cat-rewind（撤回动画）
  └─ Header
       ├─ 左侧：🐱 Logo + 游戏标题
       └─ 右侧（PixelButton 组）：撤回(gray) / BGM(purple) / 音效(blue) / 暂停(orange) / 重玩(green)
  └─ ScorePanel (score, bestScore, currentLevel as props)
        └─ 三张小卡片：分数 · 最高 · 关卡
  └─ 主体网格（左大右小，lg 断点切换）
       ├─ 左栏
       │    ├─ 主题标签（显示当前壁纸名 + 关卡名）
       │    ├─ Board (board, isPaused, isGameOver, isLevelTransition, onMove as props)
       │    │     └─ 外层 div.key=undoCount + className=isUndoing?"cat-undoing":""，用来触发撤回动画
       │    └─ ProgressBar (currentLevel, currentLevelScore as props)
       └─ 右栏（sticky）
            └─ Collection (unlockedCats, newlyUnlocked as props)
  └─ Footer：操作提示文字
```

**关键设计原则**：除了 useGameStore/useAudioStore 本体，**所有 UI 组件都是纯 props 驱动**，组件内部不直接订阅 store。数据只从 GamePage 一个点流出。

---

## 三、滑动识别 → 合并 → 升级 → 图鉴解锁 完整链路

### 3.1 滑动识别（Board 内部）

Board 组件支持三种输入，最终都会走 `onMove(direction)` 回调：

1. **键盘**：`window.addEventListener('keydown')`，KEY_MAP 把 `ArrowUp/Down/Left/Right` 与 `WASD/wasd` 映射到 `Direction`
2. **触屏**：`onTouchStart` 记录起点，`onTouchEnd` 计算 dx/dy，取绝对值大的那个轴，阈值 20px
3. **鼠标拖拽**：`onMouseDown` 记录起点，`onMouseUp` 同样算法

```
输入事件 ──> resolveDirection(dx, dy)
                 │
                 ├─ max(|dx|,|dy|) < 20 ──> 忽略，当点击处理
                 └─ 否则 ──> Direction: up/down/left/right ──> onMove(direction)
```

另外 Board 内部有一个 `blocked = isPaused || isGameOver || isLevelTransition`，三种状态下直接拦截所有输入。

### 3.2 onMove → 合并逻辑（useGameLogic.handleMove）

GamePage 的 `onMove` 回调流程：

```
onMove(direction)
  │
  ├─ ensureAudio() —— 首次用户交互时唤醒 AudioContext（浏览器自动播放策略要求）
  ├─ pushSnapshot() —— 把当前状态压入历史栈（失败回滚用）
  │
  ├─ handleMove(direction) ── useGameLogic 的核心
  │     │
  │     ├─ 前置守卫：isGameOver / isPaused / isLevelTransition ──> 返回 {moved:false}
  │     ├─ move(board, direction) —— utils/gameUtils.ts 的纯算法
  │     │     ├─ 按方向遍历 4 行/列
  │     │     ├─ 每一行：过滤空值 → 相邻相同等级合并(level+1) → 再过滤空值
  │     │     └─ 返回 {newBoard, scoreGained, moved, maxLevelReached}
  │     │
  │     ├─ if (!moved) ──> 返回 {moved:false}
  │     │
  │     ├─ addRandomTile(newBoard) —— 90% 生成 Lv.1，10% 生成 Lv.2
  │     │
  │     ├─ 计算分数：newScore / newLevelScore / bestScore
  │     │
  │     ├─ 图鉴解锁判定
  │     │     ├─ maxLevelReached >= UNLOCK_LEVEL(12) && 未解锁过 ──> 加入 unlockedCats + newlyUnlocked=12
  │     │     └─ 其他：所有 1..maxLevelReached 的等级如果没解锁过都一并解锁
  │     │
  │     ├─ 关卡切换判定
  │     │     └─ newLevelScore >= 当前关卡 targetScore ──> nextLevel++, 溢出分数结转, isTransition=true, generation++
  │     │
  │     ├─ canMove(newBoard)?  ──> 否则 isGameOver=true
  │     │
  │     └─ patch(...) 一次性写入所有变化 —— 由 zustand 通知所有订阅者
  │
  ├─ if (!moved) ──> dropLast() —— 撤销刚才那张无效快照（避免空操作污染历史）
  ├─ if (levelPassed) ──> clear() —— 过关后同步清空历史栈（跨世代保护第一道防线）
  └─ if (merged) playMergeSound(3)  else playMoveSound()
```

### 3.3 合并算法细节（gameUtils.move）

纯函数，不依赖任何 React 状态。四个方向用同一套 `processLine` 处理：

- **left**：直接遍历行
- **right**：翻转行 → processLine → 翻转回来
- **up**：把列抽成数组 → processLine → 写回
- **down**：列数组翻转 → processLine → 翻转写回

`processLine` 的三段处理：
1. `filter(null)` 压缩
2. 相邻相同合并（生成新 tile，id 自增，`isMerged=true` 触发 CSS 合并动画）
3. 末尾补 null 回 4 格

### 3.4 图鉴解锁链路

```
handleMove 中合并出 maxLevelReached > 0
  │
  ├─ patch({ unlockedCats, newlyUnlocked })
  │
  └─ GamePage 的 useEffect([newlyUnlocked])
        ├─ 上升沿检测（prev !== current && current!==null）
        ├─ playUnlockSound()（4 音阶上升琶音）
        └─ setTimeout 3000ms ──> clearNewlyUnlocked()
```

Collection 组件收到 `newlyUnlocked` 后，对应等级卡片加上 `animate-shine` + NEW! 标签（`animate-bounce`）。

---

## 四、关卡切换 + 壁纸更换

### 4.1 过关条件

在 `useGameLogic.handleMove` 中：

```
newLevelScore（当前关卡累计分数）>= getLevelConfig(currentLevel).targetScore
  └─ nextLevel = min(currentLevel+1, 10)
     nextLevelScore = newLevelScore - targetScore（溢出分数带到下一关）
     isTransition = true
     generation++         —— 跨世代撤回守卫的核心
```

`levelConfig.ts` 共 10 关，目标分数 200 → 120000，每关绑定一个 `wallpaperIndex`。

### 4.2 过关动画 + 状态切换

```
isLevelTransition=true
  │
  ├─ Board 组件显示 Overlay：🎉 过关啦!（animate-bounce）
  │
  ├─ GamePage 的 useEffect([isLevelTransition])
  │     ├─ 上升沿检测
  │     ├─ playLevelUpSound()（5 音阶胜利序列）
  │     ├─ clear() —— 防御性清空历史栈
  │     └─ setTimeout 1500ms ──> clearLevelTransition()
  │
  └─ isLevelTransition=false —— Overlay 消失，玩家继续操作
```

### 4.3 壁纸如何跟随关卡更换

Background 组件接收 `currentLevel` prop：

```
currentLevel ──> getLevelConfig().wallpaperIndex
                    └─> getWallpaper(index)
                          ├─ gradient（主渐变）
                          └─ pattern（径向渐变装饰层）
```

`wallpapers.ts` 共 6 套主题：奶油草地 / 暖阳橙橘 / 樱花粉紫 / 星空夜蓝 / 海洋薄荷 / 森林翠绿，超过 6 就循环取模。Background 外层的 `transition-all duration-700` 让渐变在过关时平滑过渡 700ms。

---

## 五、撤回机制（3 步历史）

```
useGameHistory<GameSnapshot>({ getSnapshot, applySnapshot })
  └─ 泛型，不依赖具体 store，通过注入的两个函数读写状态
```

### 5.1 快照里有什么

`GameSnapshot = { board, score, currentLevelScore, currentLevel, isGameOver, generation }`

**不包含**：`unlockedCats`、`newlyUnlocked`、`isLevelTransition`、`bestScore` —— 这些是不可撤回的全局成就/状态，撤回不能碰它们。

### 5.2 撤回的三层防御

| 防线 | 位置 | 说明 |
|------|------|------|
| ① 同步 clear | GamePage.onMove，`levelPassed=true` 立刻 `clear()` | 同步操作，竞态窗口为 0 |
| ② generation 守卫 | `applySnapshot` 检查 `snap.generation === 当前 generation` | 跨关卡的快照永远不会被应用 |
| ③ 过关中拒绝 | `applySnapshot` 检查 `!isLevelTransition` | 过关动画期间撤回无效 |

如果 ② 或 ③ 守卫拒绝，`useGameHistory.undo()` 会**自动清空整个历史栈**（因为这些旧快照已经失去意义），并返回 false → GamePage 不播放倒带音效、不触发回退动画。

### 5.3 撤回动画

```
handleUndo()
  ├─ undo() 成功
  ├─ playUndoSound()（方波 700Hz→180Hz 下扫 + 三角波低音，模拟磁带倒转）
  ├─ setIsUndoing(true)
  └─ setTimeout 280ms ──> setIsUndoing(false)
```

Board 外层 div 的 `className="cat-undoing"` 通过 CSS 后代选择器匹配所有 tile，播放内联的 `@keyframes cat-rewind`（缩放 + 轻微旋转 + hue-rotate 色相抖动）。

---

## 六、useAudio：BGM 与音效的管理

所有声音均通过 Web Audio API **程序化合成**，不依赖任何外部音频资源。

### 6.1 全局单例 AudioContext

`getAudioContext()` 懒加载创建全局 `globalAudioContext`，并在首次用户交互时 `resume()`（浏览器自动播放策略要求必须有用户手势才能启动音频）。

### 6.2 音效一览（全部由 playTone 基础函数合成）

| 音效 | 触发时机 | 实现 |
|------|----------|------|
| 移动 | 每次不产生合并的滑动 | 220Hz 方波 30ms |
| 合并 | 合成成功 | 440Hz×1.1^(lv-1) 方波 + 1.5 倍频三角波，间隔 40ms |
| 图鉴解锁 | newlyUnlocked 上升沿 | C5-E5-G5-C6 四音阶琶音，每个 120ms |
| 过关 | isLevelTransition 上升沿 | C5→E5→G5→C6→E6 五音阶胜利序列，每个 150ms |
| 撤回 | undo() 返回 true | 方波 700→180Hz 下扫 + 80ms 后三角波 300→120Hz 下扫 |
| 游戏结束 | isGameOver 上升沿 | C5-G4-F4-C4 下行四音 |

### 6.3 BGM 循环

```
startBGM()
  ├─ melody: 16 个音符的 C 大调循环（C-D-E-F-G-A-G-F-E-D-C-B-C-D-E-D）
  ├─ createGain 节点，总音量 0.04
  ├─ setInterval 300ms 播放一个音符：
  │     └─ OscillatorNode(square) + GainNode(ADSR 包络) → 总 Gain → destination
  └─ bgmEnabled=false 时 stopBGM() 清除定时器并断开节点
```

BGM 和音效是两个独立开关，分别用 PixelButton 控制，状态持久化到 localStorage。

---

## 七、数据持久化

`useGameStore`（zustand persist 中间件）只存两个字段到 localStorage：

| 字段 | 说明 |
|------|------|
| `bestScore` | 历史最高分数 |
| `unlockedCats` | 已解锁的猫咪图鉴等级 |

其他（board、score、currentLevel、generation…）**不持久化**，刷新就重新开始，符合休闲小游戏"开局即新局"的预期。

`useAudioStore` 存 `sfxEnabled`、`bgmEnabled` 两个开关。

---

## 八、已知设计权衡

### 1. 本地存储 vs 后端服务

**选择：纯本地，无后端**

- 理由：休闲单机游戏，核心价值在即时可玩性。没有社交、排行榜、跨设备同步等需求，后端只会徒增部署和维护成本。
- 代价：玩家清浏览器缓存会丢失最高分和图鉴。图鉴解锁字段已做持久化，刷新不丢；但当前进度不存，关页面就没了——这是有意为之，符合 2048 类游戏的预期。

### 2. Zustand vs Redux / Context

**选择：Zustand**

- 理由：状态模型扁平且体量小（十几个字段），Zustand 的极简 API + 内置 persist 中间件 + 可选 selector 完美覆盖需求。Redux 的样板代码和心智模型在这里没有收益。
- 代价：缺少 Redux DevTools 的时间旅行调试体验——但我们自己实现了 3 步撤回机制，某种程度上补偿了调试便利性。

### 3. 程序化合成音效 vs 加载 mp3/ogg 资源

**选择：Web Audio API 程序化合成**

- 理由：零资源加载、零体积开销、像素风游戏的 8-bit 风格合成出来反而更地道。
- 代价：做不出复杂混音或真人语音；部分老旧移动浏览器对 `OscillatorNode` 的参数自动化支持有差异（已做 try/catch 容错）。

### 4. 组件纯 props 化 vs 内部订阅 store

**选择：GamePage 是唯一订阅点，子组件全 props 驱动**

- 理由：单向数据流更清晰，任何状态变化的影响范围一眼能看出来；组件本身复用性更好。
- 代价：props 链稍长（Collection 需要 `unlockedCats`、`newlyUnlocked` 两个参数），但组件层级浅，没有到达 prop drilling 需要 Context 的程度。

### 5. 撤回的 generation 守卫 vs 只在过关时 clear

**选择：三层防御叠加**

- 理由：只靠 useEffect 里的 clear 存在竞态窗口（setTimeout 生效前玩家可以点撤回）。三层防御（同步 clear + generation 不匹配拒绝 + 过关中拒绝）即使在极端并发点击下也不会把旧关卡数据拉回来。
- 代价：增加了 `generation` 这个额外状态字段；`applySnapshot` 签名从 void 变成了 boolean，增加了一点调用方心智负担。

### 6. useGameLogic 直接 import useGameStore vs 传参注入

**选择：useGameLogic 内部直接 import useGameStore**

- 理由：这是应用专用 hook，不是通用库；直接依赖 store 让 API 简洁很多，调用方（GamePage）不需要手动传几十个参数。
- 代价：如果未来要做 SSR 或多实例，需要改成依赖注入形式——但当前是纯客户端单实例，不构成问题。
