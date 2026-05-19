# 视频脚本 — B站 + 抖音

## A. B站(5-8 分钟长视频)

### 标题候选

A1(技术派): `我用中国朝廷的结构,重新设计了 multi-agent 框架`
A2(对比派): `LangGraph、CrewAI 都漏了什么?把这俩角色加进去就够了`
A3(故事派): `2000 年朝廷 vs 150 年公司:multi-agent 框架的设计回归`

**推荐 A1**(明确 + 知识感)。

### 封面

- 主图:左边一个西装漫画的 CEO/Manager/Worker 金字塔(黯淡),右边一个朱红色的朝廷金字塔(明亮),中间一个箭头/等号
- 文字:大字"为什么 multi-agent 都该有锦衣卫"
- 角标:`开源 / MIT / npm 已上线`
- 色系:朱红 #C8102E + 墨黑 + 米白

### 视频结构(7 分钟)

```
[00:00-00:15] Hook —— 一句钩子 + 终端 demo
[00:15-01:00] 问题 —— 主流框架都在抄什么
[01:00-02:30] 锦衣卫 —— 跨模型审查
[02:30-04:00] 史官 —— 修宪 PR
[04:00-05:00] 拓扑宪法 + 双语 + 早朝晚朝(快速过)
[05:00-06:00] 实操 demo —— npx create-mandate + cat constitution
[06:00-07:00] 收尾 + CTA + v0.4 预告
```

### 详细脚本

#### [00:00-00:15] Hook(开场)

**口播:**
```
你正在用 LangGraph 还是 CrewAI 做 multi-agent?
我告诉你它们都漏了两个角色 ——
锦衣卫,和史官。
```

**画面:**
- 0:00-0:05: 镜头切快切 — LangGraph logo / CrewAI logo / AutoGen logo / MetaGPT logo,逐个 fade out
- 0:05-0:10: 古装画 — 锦衣卫 / 史官 站立特写
- 0:10-0:15: terminal 截图,`$ npx --yes create-mandate@alpha my-empire` 一行代码 + 输出

**字幕条 (底部):** `Mandate · 天命 — github.com/liujiarui0918/mandate`

---

#### [00:15-01:00] 问题 —— 主流框架都在抄什么

**口播:**
```
我有个观察 —— 你打开任何一个主流 multi-agent 框架:
LangGraph、CrewAI、AutoGen、MetaGPT、Paperclip —— 它们都在做同一件事:

一个 CEO 节点拆任务,
一层 Manager 节点路由,
一池 Worker 节点执行,
偶尔来个可选的 Reviewer。

这其实就是现代公司,被翻译成了 YAML。
但现代公司才 150 年历史。它有明显的病理 —— 群体迷思、传话游戏、出事时责任真空。
我们花三年时间把这些病理在 agent 系统里复刻了一遍。

于是我问了一个不同的问题:
如果我们把 multi-agent 的治理结构,建模在一个跑了 2000 年的系统上呢?
```

**画面:**
- 0:15-0:30: 横向 split-screen,4 个框架的官方架构图同步滚动播放
- 0:30-0:45: 拉一个金字塔图 — CEO 在顶,Manager 中层,Worker 底层,Reviewer 在侧边(透明小)
- 0:45-1:00: 镜头从金字塔淡出,淡入一幅水墨风的中国朝廷场景(皇帝坐殿,百官两旁)

**字幕条要点:**
- "Same archetypes, different t-shirts"
- "现代公司:150 年"
- "中国朝廷:2000 年"

---

#### [01:00-02:30] 锦衣卫 —— 跨模型审查

**口播:**
```
朝廷里有一个角色,叫锦衣卫。
明朝的锦衣卫,直接听皇帝指挥,绕开所有官僚体系。
他们的任务,就是把官僚体系不想让皇帝知道的东西捅出来。

翻译到 multi-agent:
每个节点的每条输出,过一遍跑在 *不同模型上* 的审查者。

为什么强调"不同模型"?
现在很多框架都有 "Reviewer agent" —— 一个 reviewer 看其他 agent 的输出。
但 Reviewer 和 Producer 跑同一个模型时,你猜怎么着 ——
GPT-5 自信地错了,过它自己的 review,还是自信地错。
这叫 audit theater。

锦衣卫的设计是:用不同模型 break 这个 loop。
你的宰相用 GPT-5.5,你的锦衣卫就跑 Claude 或 Gemini。
4 行 YAML 表达完。
```

**画面:**
- 1:00-1:20: 古画 — 锦衣卫直奔殿前,绕开宰相和百官,呈递给皇帝
- 1:20-1:40: 一个动画图 — "Reviewer + Producer 同模型" 用红色 ❌ 标记 / "Censor + Producer 不同模型" 用绿色 ✅ 标记
- 1:40-2:10: VSCode 编辑器画面,4 行 YAML 高亮显示:

```yaml
censor:
  default_tier: balanced
  overrides:
    chancellor:
      strategy: full
```

- 2:10-2:30: 抽象图 — "Chancellor (GPT-5)" → 输出 → "Censor (Claude)" → 打勾或打回

**画外语:**
```
重点:锦衣卫不是 hook,不是中间件,不是 Reviewer agent。
它是节点级配置,跑在主链外面,跑在不同模型上。
```

---

#### [02:30-04:00] 史官 —— 修宪 PR

**口播:**
```
朝廷里第二个公司没有的角色,叫史官。
史官的任务,是记录皇帝的每个决定,长此以往,形成奏折 ——
就是把"皇帝最近经常做错某件事"写成结构化的改革建议。

我把这个翻译到 multi-agent,就是:
史官在 .mandate/chronicle/ 下,
追加每个事件到日度 JSONL。
然后他检测模式:
某个角色重复同一种失败、某个 hook 触发过于频繁、模型在漂移 ——
这些模式累积到阈值,史官自动起草一份"制度修订 PR"。

PR 不是优化 prompt。
PR 是修整个宪法 —— 也就是 multi-agent 系统的运行规则。
你看了 PR,觉得有道理,运行 mandate ratify PR-001,宪法 atomic 升级,semver bump。

这就是 Wiener 在 1948 年说的 "二阶反馈":
系统不仅适应它的输出,
还适应产出输出的规则本身。
绝大多数 multi-agent 框架,完全没有这个东西。
最接近的是 "prompt 优化",那只是优化一个字符串。
```

**画面:**
- 2:30-2:50: 古画 — 史官跪坐书桌前,笔走龙蛇地记录
- 2:50-3:15: terminal 滚动播放 chronicle JSONL 内容(快速滚动,营造大量数据感)
- 3:15-3:40: 一份 PR markdown 文件出现在屏幕上,标题 `PR-001: chancellor hook timeout drift`,正文是结构化的 proposed_changes
- 3:40-4:00: terminal 命令 `mandate ratify PR-001`,输出 `✓ PR-001 ratified — constitution v0.3.0 → v0.4.0`

**字幕条:**
- "二阶反馈 (Second-order feedback)"
- "Wiener, 1948"
- "Reform PR = 系统的修宪权"

---

#### [04:00-05:00] 拓扑宪法 + 双语 + 早朝晚朝(快速过)

**口播(节奏加快):**
```
还有三个比较小的设计,我快速过一下:

一,拓扑宪法 —— 父子节点禁止依赖。强制兄弟协作,杜绝传话游戏。康威定律的应用。

二,双语一等公民 —— terms.yaml 里写,"chancellor: 宰相",这不是 localization,是结构性的。你写 hook 可以混用 "宰相 must call 锦衣卫 after every 决议" 或者全英文,CLI 都规范化。

三,早朝晚朝 —— 24h 心跳。每天 9 点早朝,宰相奏报,皇帝批红;晚上 9 点晚朝,叶子节点写日报。这个节律是治"系统漂移"的关键 —— 因为生产 multi-agent 系统的失败,大部分不是某次错了,而是慢慢偏了。
```

**画面:**
- 4:00-4:20: 拓扑图,父子箭头被红 X 标记,兄弟之间绿色双向箭头
- 4:20-4:40: terms.yaml 文件,中英对照展示
- 4:40-5:00: 24h 时钟动画,9:00 早朝 / 21:00 晚朝 高亮

---

#### [05:00-06:00] 实操 Demo

**口播:**
```
来,直接看实操。
我现在在一个空目录,跑一行命令:

npx --yes create-mandate@alpha my-empire --template both

5 秒。一座完整的朝廷脚手架就出来了。

[切到 cat 输出]
看 constitution.yaml —— 30 行 YAML,定义了 8 个角色、锦衣卫配置、模型分配。
看 terms.yaml —— 中英术语对照。

然后:
npx --yes -p @mandateai/cli@alpha mandate validate .

✓ 拓扑合法
✓ 宪法 schema 合法
✓ All checks passed.

整个过程,零 LLM 调用。包大小 100 kB。MIT 协议。
```

**画面:**(全程 terminal 录屏 + 文件查看)
- 5:00-5:15: terminal 跑 `npx create-mandate`,等 5 秒,显示成功
- 5:15-5:40: `cd my-empire` → `tree .mandate/` → `cat constitution.yaml`(滚动浏览)
- 5:40-6:00: `mandate validate .` 输出三个 ✓

---

#### [06:00-07:00] 收尾 + CTA + v0.4 预告

**口播:**
```
今天发的是 v0.3.0-alpha.1 —— validators / runtime / cli / create-mandate 四个 npm 包齐活。
你可以现在就用 mandate validate 校验你的朝廷宪法。

v0.4 我会加 mandate genesis ——
你给一句话目标,比如 "运营我的 Twitter:发帖、互动、分析、合规",
LLM 驱动的朝廷设计师会为你产出一套定制的 court 配置。
还有 mandate run —— 真正的编排循环。

我留一个问题给你:
所有 multi-agent 框架都该回答一个问题 —— 审查者由谁审查?
CEO/Manager/Worker 链里答不上,因为 Reviewer 就在链里。
朝廷的答案是:Censor 在链外,且跑不同模型。

这就是 Mandate 的全部 pitch。
其他东西 —— 史官、早朝、双语术语 —— 都是从"认真对待独立审查"这件事推导出来的。

仓库链接和命令在简介里。
如果你也在做 multi-agent,觉得这两个角色有道理,GitHub 给个 star,顺便告诉我你打算建第一座什么朝廷。

下期我会拍一个 mandate genesis 实操 —— v0.4 上线后第一时间发。
咱们下期见。
```

**画面:**
- 6:00-6:20: GitHub 仓库截图,左侧 README 滚动
- 6:20-6:40: 未来版本预告动画 — "v0.4: mandate genesis" 闪现
- 6:40-7:00: 结尾画面,Mandate logo + GitHub URL + 一键三连引导

---

### 录制清单

- [ ] 整套 terminal 操作录屏(用 OBS / Screen Studio,1080p,字号大)
- [ ] 中国朝廷古画素材(找无版权图源 —— 故宫数字馆 / 维基百科 public domain)
- [ ] 4 个主流框架的官方架构图(各官网截图)
- [ ] VSCode 截图 — constitution.yaml / terms.yaml / Reform PR markdown
- [ ] 自己出镜片段 (可选 —— 如果你愿意露脸,放在 hook 和 CTA)
- [ ] 配音(自己读或用 AI 配音,推荐 ElevenLabs 中文男声)
- [ ] 背景音乐(B站抽风格,推荐古风 instrumental,音量 -30dB)

### 简介(B站描述)

```
开源:github.com/liujiarui0918/mandate
npm:npx --yes create-mandate@alpha my-empire --template both
设计文档:docs/specs/2026-05-01-mandate-design.md

【目录】
00:00 主流 multi-agent 框架都在抄什么
01:00 锦衣卫 —— 跨模型独立审查
02:30 史官 —— 系统自己起草修宪 PR
04:00 拓扑宪法 + 双语 + 早朝晚朝
05:00 实操 demo
06:00 v0.4 预告

【相关阅读】
- 文章:LangGraph / CrewAI / AutoGen / MetaGPT 角色谱对比
- 视频:[关联视频]

【参考资料】
- March 1991:Exploration vs Exploitation
- Wiener 1948:Cybernetics 第二阶反馈
- 康威定律

如果觉得有用,一键三连 + GitHub ⭐,我会持续更新设计思路。
```

### 标签

`#multi-agent #LLM #开源 #AI #编程 #人工智能 #LangGraph #CrewAI #程序员 #开发者`

---

## B. 抖音 / 视频号(60 秒)

### 标题候选

B1: `2000 年朝廷 vs 150 年公司,multi-agent 都该回归`
B2: `所有 AI agent 框架都漏了两个角色`
B3: `5 秒钟一座中国朝廷,这就是 multi-agent 的正确方向`

**推荐 B2**(钩子最强)。

### 60 秒脚本

```
[0-3 秒] 钩子
口播:你正在用的 multi-agent 框架,漏了两个关键角色。
画面:LangGraph / CrewAI / AutoGen 三张 logo 快切

[3-15 秒] 问题
口播:LangGraph、CrewAI、AutoGen,这些都在抄一个东西 —— 西方公司。CEO 拆任务,Manager 路由,Worker 执行。
画面:金字塔金字塔金字塔三连

[15-30 秒] 锦衣卫
口播:但中国朝廷里有个角色叫锦衣卫,直接听皇帝的,绕开所有官员。我把这个翻译到 LLM —— 每个 agent 的输出,过一遍跑在不同模型上的审查者。GPT-5 自信地错了,Claude 抓到。
画面:古画锦衣卫上前奏报,然后切到 4 行 YAML

[30-45 秒] 史官
口播:还有个角色叫史官,记录每件事,起草改革奏折。我让史官自动检测系统漂移,起草修宪 PR,人类批红后,你的 multi-agent 系统能自己改自己的规则。这叫二阶反馈。
画面:史官画面 → terminal 滚动 chronicle → PR 文件 → ratify 命令

[45-55 秒] Demo
口播:试用一行,5 秒一座朝廷。
画面:terminal 跑 npx create-mandate,5 秒过程加速到 5 秒展示

[55-60 秒] CTA
口播:GitHub 搜 mandate,MIT 协议,完全免费。
画面:GitHub 仓库截图 + URL 大字
```

### 配音节奏要求

- **每句话 < 8 个字一气连读**,中间不停顿(抖音慢节奏会被划走)
- 重点字"锦衣卫""史官""跨模型"加重读
- 60s 内信息密度极高,但**每 15 秒一个视觉切换 + 一个新概念**

### 字幕

整片必须 100% 字幕(抖音 80%+ 静音观看),字号大,关键词高亮(锦衣卫红字、史官金字)。

### 视频号(微信)版本

跟抖音一样,但:
- 标题改成更长版:`所有 AI agent 框架都漏了这两个关键角色 | Mandate 设计揭秘`
- 添加微信公众号链接卡片(指向公众号长文)
- 不要用过激的 hook 词("漏了" 可以,"千万别用" 不要)

---

## 通用录制工具建议

| 用途 | 推荐工具 |
|---|---|
| 屏幕录制 | Screen Studio (mac) / OBS (跨平台) |
| terminal 美化 | warp / iterm2 主题 / windows terminal |
| AI 配音 | ElevenLabs (英文好) / Suno bark (中文) / 自己录 |
| 古画素材 | 故宫数字文物库 / 维基公共领域 / Pinterest |
| 字幕生成 | 剪映自动字幕 / Premiere Auto-Caption |
| 缩略图 | Figma + Pinterest 灵感板 |
| 背景音乐 | YouTube Audio Library(免费免版权) |

## 跨平台分发

- **B站**:发完原片,简介里加完整链接
- **抖音**:60s 浓缩版,评论区置顶 GitHub 链接
- **视频号**:同抖音版,加微信公众号链接卡
- **YouTube**:英文配音版,翻译 anchor-en 内容,投放给海外
- **小红书**:把抖音 60s 截 6 张静态图 + 加文字版讲解,做成图文笔记
