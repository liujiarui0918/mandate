# README 优化建议 + 群发 snippet + Launch 总览

---

## 一、README 优化建议(patch)

当前 README 已经不错,但 launch 前再调几处能显著提升转化。

### 1. 文件顶部 hook 行(改成更钩人版本)

**改前**(README.md 第 3 行):
```
> **One sentence → a working multi-agent court for any task.**
```

**改后**:
```
> **Multi-agent frameworks copied the modern corporation. Mandate copies the Chinese imperial court — and adds two roles the corporate metaphor cannot express: an independent Censor on a separate model, and a Historian that drafts amendments to your system's own constitution.**
```

理由:第一行 = 落地页第一屏 = 决定 70% 的 star 转化。从"描述"改成"立场宣言"。

### 2. 加一行 demo GIF 占位(README.md 第 6 行后)

```markdown
![Demo: npx create-mandate in 5 seconds](docs/assets/demo.gif)

> *Live since 2026-05-19: `npx --yes create-mandate@alpha my-empire --template both`*
```

GIF 录制方法:
```bash
# 安装 vhs
brew install vhs   # 或参考 github.com/charmbracelet/vhs
# 在 docs/assets/ 下放一个 demo.tape 脚本,跑 vhs demo.tape 生成 gif
```

或者用 [terminalizer](https://github.com/faressoft/terminalizer)。

### 3. 比较表里加 "Cross-model audit" 一行

**当前**(README.md 大约 158 行 "Compared to existing frameworks" 区域):
```
| Feature | LangGraph | CrewAI | Paperclip | MetaGPT | Mandate |
| Independent review layer | partial | N | partial | N | first-class |
```

**改后** —— 加一行:
```
| Cross-model audit (auditor ≠ producer) | N | N | N | N | YES (per-node) |
```

这一行最有"啊我没想过这个"的力量。

### 4. 加 "Try it in 30 seconds" 顶部 fold

放在 hook 行下方 + GIF 上方:

```markdown
## Try it in 30 seconds

```bash
npx --yes create-mandate@alpha my-empire --template both
cd my-empire
npx --yes -p @mandateai/cli@alpha mandate validate .
```

That's a full imperial court scaffolded, validated, and ready to evolve.
```

读者第一屏看到的就是 "5 行能跑起来",这对 star 转化的提升 > 文章里任何理论描述。

### 5. badge 行扩充

**改前**:
```
[![License: MIT](...)]
[![Read in Chinese](...)]
```

**改后** —— 加 npm 版本/包大小/下载量 badge:

```
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![npm version](https://img.shields.io/npm/v/@mandateai/cli/alpha)](https://www.npmjs.com/package/@mandateai/cli)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@mandateai/cli)](https://bundlephobia.com/package/@mandateai/cli)
[![GitHub Stars](https://img.shields.io/github/stars/liujiarui0918/mandate?style=social)](https://github.com/liujiarui0918/mandate)
[![Read in Chinese](https://img.shields.io/badge/lang-中文-red.svg)](README.zh.md)
```

GitHub stars badge 是社交证明的核心 —— 进入者看到 star 数会更倾向跟着 star。

### 6. 修复"npm publish 前先 clone"那块过期文案

**当前 README.md 大约第 72-79 行**:
```
> **v0.3.1-alpha (May 2026):** `create` 和 `validate` 已可用。npm 发布前先克隆仓库直接跑:
> git clone https://github.com/liujiarui0918/mandate ...
```

**改后**:
```
> **v0.3.0-alpha.1 (2026-05-19):** Published to npm. `create` and `validate` are live. Just run:
>
> ```bash
> npx --yes create-mandate@alpha my-empire --template both
> npx --yes -p @mandateai/cli@alpha mandate validate my-empire
> ```
>
> `genesis` / `evolve` / `run` / `court` / `audit` / `ratify` / `veto` ship in v0.4.
```

README.zh.md 同样改(对应中文版第 71-81 行)。

---

## 二、Discord / Slack / 群聊 snippet

不同语境的速发版,准备好直接复制。

### A. 短版(< 280 字符,通用)

```
just open-sourced Mandate · 天命 — multi-agent framework with the Chinese imperial court as the role model. cross-model Censor (auditor on a different model from producer) + Historian that drafts amendments to your constitution. live on npm: npx --yes create-mandate@alpha my-empire

github.com/liujiarui0918/mandate
```

### B. 中版(技术圈 Discord/Slack —— LangChain Discord、Anthropic Discord、AI Builders 群)

```
Hey, sharing a multi-agent framework I just published — would love feedback from this community since you all run prod systems.

🏛️ Mandate · 天命 (MIT) — github.com/liujiarui0918/mandate

The core design move: instead of CEO/Manager/Worker, the role roster is the Chinese imperial court. The interesting part:

→ Censor (锦衣卫): independent auditor PER NODE, configured to run on a DIFFERENT MODEL than the producer. e.g. Chancellor on GPT-5.5 → Censor on Claude. Breaks the same-model-self-review failure mode.

→ Historian (史官): chronicles every event, detects patterns, drafts "Reform PRs" (markdown files) that humans ratify to amend the constitution. The system's RULES evolve, not just outputs.

Live:
  npx --yes create-mandate@alpha my-empire --template both
  npx --yes -p @mandateai/cli@alpha mandate validate my-empire

Curious specifically about: (a) anyone else doing cross-model audit? (b) any prod multi-agent setups where amendment-of-rules would have helped?

[Disclaimer: I'm the author. Happy to answer / debate.]
```

### C. 中文群版(微信 / QQ AI builder 群)

```
朋友们,我开源了一个 multi-agent 框架,跟大家分享下思路 ——

🏛️ Mandate · 天命:把 multi-agent 角色谱从 CEO/Manager/Worker 换成中国朝廷。多两个角色:

🛡️ 锦衣卫 —— 跨模型审查(producer 用 GPT-5.5,审查者就跑 Claude,不同模型抓盲点)
📜 史官 —— 系统自己起草修宪 PR(检测模式 → 写改革建议 → 人类批红)

试用一行,5 秒一座朝廷:
npx --yes create-mandate@alpha my-empire --template both

GitHub:github.com/liujiarui0918/mandate
MIT 协议,欢迎 star/PR/拍砖

如果你在做生产 multi-agent,我特别想听:你们怎么处理"系统漂移"问题?
```

---

## 三、Master Launch Playbook(总览)

把所有产出和动作整合成一个执行清单。

### Phase 0:Pre-launch(发射前 3-7 天)

| Day | Action | 文件 |
|---|---|---|
| D-7 | 录制 demo GIF + 主视觉图 | (录制) |
| D-7 | 准备封面图 + B站缩略图 + 小红书封面 | (设计) |
| D-5 | 应用 README 优化 patch | `marketing/this-file.md` §1 |
| D-5 | 跑一遍 live verification 确认 npx 流程 | (已完成) |
| D-3 | dev.to 发英文 anchor 文章(预热) | `anchor-en.md` |
| D-3 | 知乎专栏发中文 anchor 文章(预热) | `anchor-zh.md` |
| D-2 | Twitter 发 2 条预热 tweet(无链接) | `western-platforms.md` |
| D-1 | 即刻发预告:"明天有大新闻" | `chinese-text-platforms.md` |

### Phase 1:Launch Day(西方平台主攻)

**美西时间(US Pacific):**

| 时刻 | 动作 |
|---|---|
| 06:55 | 提交 Show HN |
| 07:00 | 立即发 HN self-comment |
| 07:15 | 投 r/LocalLLaMA |
| 07:45 | 投 r/ClaudeAI |
| 08:00 | Twitter 主推 + 8 条 thread |
| 08:15 | 投 r/programming |
| 09:00 | Product Hunt 上架(如果选 PH 路线) |
| 10:00 | Discord / Slack 群发 |
| 11:00 | 投 r/MachineLearning |
| 13:00 | 第一波数据 review,如果 HN 第一页就保持回复节奏 |
| 全天 | 每条评论 1h 内回复 |

### Phase 2:Chinese platforms(D+3 — D+10)

考虑时区,放在西方 launch 周末之后(尽量同时把中文社区也激活):

| Day | Platform | 文件 |
|---|---|---|
| D+3 | 即刻主帖 + 微博 | `chinese-text-platforms.md` §2-3 |
| D+4 | V2EX 长贴(周二中午程序员摸鱼时段) | `chinese-text-platforms.md` §6 |
| D+5 | 知乎文章 + 知乎答案铺 3 个 | `chinese-text-platforms.md` §1 |
| D+6 | 公众号长文 | `chinese-text-platforms.md` §5 |
| D+7 | 小红书 2 帖 | `chinese-text-platforms.md` §3 |
| D+8 | B站长视频上传 | `video-scripts.md` §A |
| D+9 | 抖音 + 视频号 60s | `video-scripts.md` §B |
| D+10 | YouTube 英文版上传 | (翻 B站脚本) |

### Phase 3:持续运营(D+10 ~ 持续)

- **即刻日更**:每天 1 条短帖,持续 2 周
- **Twitter 周更**:每周 1 个新角度
- **公众号月更**:把 anchor 文章拆成 4 篇专题
- **每周 GitHub 数据复盘**:star 增量 / fork / issues / discussion
- **回复每个 issue 在 24h 内**:GitHub Insights 反馈 maintainer 响应速度,影响其他人 star 的意愿
- **v0.4 发布即第二波营销**:`mandate genesis` 真上线后,做个"LLM 设计朝廷"的 demo 视频,二次刷屏

### 数据追踪 dashboard 建议

每天记录:

```
Date        | HN points | Reddit upvotes (sum) | Twitter impressions | GitHub stars (delta) | npm downloads (24h)
2026-05-XX  | XX        | XX                   | XX                  | +XX                  | XX
```

可以用 Google Sheets 或 Notion 一张表,每天 5 分钟填一遍。两周后能看出哪个渠道 ROI 最高。

---

## 四、个人品牌 + 反馈循环

### 个人简介(各平台个人页统一)

```
开源 Mandate · 天命 — 把 multi-agent 框架做成中国朝廷
github.com/liujiarui0918/mandate
```

### "反差感" 内容(增加粘性)

平台 follow 你,不只是因为项目,更因为人有趣。建议穿插:

- **踩坑日记**:发包过程踩的 12 个坑(已经写在 PUBLISH.md 里,可拆成单独的爆款帖)
- **设计决策**:为什么宪法用 YAML 而不是 JSON / 为什么父子禁止用 hard_block 而不是 warn / 为什么是 8 个角色不是 6 个 / etc.
- **失败更新**:某个 v0.4 feature 砍掉的原因
- **理论闲谈**:Wiener 二阶反馈、March 1991 探索利用、康威定律

### 互动激发

在每个平台主帖里,丢一个具体问题让评论区接话:

- "你做 multi-agent 时最大的痛是什么?"
- "如果朝廷再加一个角色,你想加什么?(我接受 PR)"
- "你觉得 multi-agent 框架最缺什么 —— 速度 / 治理 / 可观察性 / 还是别的?"

互动越多,平台算法越推。

---

## 五、风险 / 反例 / 准备好的回应

提前准备好被怼时的回应,免得慌:

| 攻击 | 短回应 |
|---|---|
| "你这就是装 X 包装,不就是 LangGraph 换皮?" | "你说对了一半 —— 80% 的代码逻辑 LangGraph 也能搭。但 Censor 跨模型 + Historian 修宪 PR 这两个是 LangGraph 表达不出的(因为它的 state graph 没有 'rule that produces state' 的层级)。我把这两个做成 first-class。换皮没价值,但加 2 个 first-class 角色值得分享。" |
| "中文角色名是 cosplay,不严肃。" | "terms.yaml 双语等价,英文用户写英文 CLI 规范化。但保留中文术语是 deliberate —— 因为 '锦衣卫' / '史官' 在中文语境里有 2000 年的语义沉淀,英文 'censor' / 'historian' 没有同等密度。这是借势,不是 cosplay。" |
| "Show HN 的项目都死得快。" | "可能。所以我做的 alpha,可以撤回 / deprecate / 让 ratify 系统投票。所有变动都在 reforms/ 文件夹里 —— git blame 看得见,不会假装稳定。" |
| "你怎么知道这个比 LangGraph 好?" | "我不知道。我只知道 cross-model audit 这个模式在我跑过的 3 个 multi-agent 项目里都有效。开源 + 让别人验证 / 反驳。" |
| "成本怎么算?Censor 加一倍 cost?" | "tier 字段:`red_line` 用最小模型只校 schema(< 5% 成本);`balanced` 用中等模型审产出(15-30% 成本);`full` 用同级模型(50-100% 成本)。default 是 balanced。" |

---

## 六、文件索引(本目录)

| 文件 | 用途 | 字数 |
|---|---|---|
| [`anchor-en.md`](anchor-en.md) | 英文长文 source-of-truth(dev.to, Medium) | ~2500 词 |
| [`anchor-zh.md`](anchor-zh.md) | 中文长文 source-of-truth(知乎, 公众号) | ~3000 字 |
| [`western-platforms.md`](western-platforms.md) | HN + Reddit + Twitter + Product Hunt | ~2500 词 |
| [`chinese-text-platforms.md`](chinese-text-platforms.md) | 知乎 + 即刻 + 小红书 + 微博 + 公众号 + V2EX | ~3500 字 |
| [`video-scripts.md`](video-scripts.md) | B站 7 分钟 + 抖音 60s 完整脚本 | ~2500 字 |
| `index.md` (本文件) | README patch + 群发 snippet + Launch playbook | ~2000 字 |

---

## 七、Launch Day Final Checklist(打印贴墙)

```
□ npm 上四个包确认 live
□ token 全部撤销(只留正在用的最窄权限那个)
□ README 顶部 hook 行已优化
□ demo GIF / 截图 / 封面图准备齐全
□ Show HN 草稿在 Notion 已写好
□ Reddit 4 个 sub 的草稿都写好,只待发
□ Twitter 主推 + 8 条 thread 都在 Buffer 排队
□ 即刻 / 微博 / 知乎 / V2EX 中文版草稿就绪
□ B站 / 抖音视频已 render 完成
□ 个人 bio / signature 各平台一致
□ 数据 dashboard 已开
□ 当天行程清空,前 12h 在线
□ 朋友圈打个招呼 —— "今天产品要发,如果看到觉得有趣可以 star,但不要刷数据"

发射 —— 祝你 trending,中彩!
```

---

如果有任何一块想 deep dive(比如让我帮写更多 Reddit 变体、或者翻译某个文案到 YouTube 英文版),直接说就行。
