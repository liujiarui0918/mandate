# 中文文本平台 — 推广文案

源文长文:`anchor-zh.md`(本目录)。下面每个平台的语气、长度、emoji 使用都根据平台调性定制。

---

## 1. 知乎

### 知乎答案(回答现有提问)

适合搜索关键词:`multi-agent`、`LangGraph`、`CrewAI`、`agent 框架`、`AI agent`、`LLM 应用架构`、`AutoGen`、`MetaGPT`。

可回答的问题示例:
- "目前主流的 multi-agent 框架有哪些?"
- "为什么 LangGraph/CrewAI 在生产环境总是出问题?"
- "做 AI agent 应该从什么框架入手?"
- "AutoGen 和 LangGraph 应该选哪个?"

**通用回答模板**(~600 字):

```
直接说结论:这些框架都在解决同一类问题,但它们漏掉了两个角色 —— 独立审查者和史官。

我自己做了个开源框架 Mandate(github.com/liujiarui0918/mandate),把这个观察显式化。先讲为什么。

主流的 LangGraph / CrewAI / AutoGen / MetaGPT,角色谱基本是:
- Planner(拆解者)
- Manager(组长)
- Worker(执行者)
- 可选的 Reviewer

这其实就是把"现代公司"用 YAML 抄了一遍。现代公司才 150 年,有明显的病理 —— 群体迷思、传话游戏、责任真空。LLM agent 时代复刻这些病理太自然了。

但中国封建朝廷跑了 2000 年,有两个角色是"公司"这个隐喻表达不了的:

1. **锦衣卫** —— 直接向皇帝汇报,绕过整个官僚系统,任务是把官僚体系想藏起来的东西捅出来。翻到 LLM,就是:每个节点的输出过一遍**跑在不同模型上的审查者**。如果你的宰相(Planner)用 GPT-5.5,那这个节点的锦衣卫就跑 Claude。**关键点是不同模型** —— 同一个模型自己审自己,confidently wrong 的时候 review 还是 confidently wrong。

2. **史官** —— 记录每件事,写成史册,长此以往就形成奏折(PR)。Mandate 里史官检测模式(重复失败、模型漂移),起草"制度修订 PR",人类(皇帝)批红,宪法 semver bump。这就是 Wiener 的二阶反馈:系统不仅适应输出,**还适应产出输出的规则**。

最后给个直观感受 —— 五秒钟脚手架一座朝廷:

    npx --yes create-mandate@alpha my-empire --template both

如果你正在做生产级 multi-agent,我建议至少把"审查者用不同模型"这一条带回去你现在的框架里。这条 ROI 极高,改一行配置就能加。

仓库 github.com/liujiarui0918/mandate,MIT,欢迎拍砖。
```

### 知乎文章

把 `anchor-zh.md` 直接作为知乎文章发布,**改动只需要两处**:
1. 标题从"我把 multi-agent 框架做成了中国朝廷,锦衣卫是一等公民"改成更知乎风:
   - 推荐:**"我用中国朝廷的结构,重新设计了一个 multi-agent 框架"**
   - 备选:**"为什么 LangGraph、CrewAI 都漏掉了锦衣卫?"**
2. 文章末尾加一个 CTA:"如果觉得有道理,GitHub ⭐ 一下;如果不同意,评论区开杠,我都回。"

### 知乎专栏(可选)

如果开有专栏,把后面的"制度修订 PR""跨模型审查""早朝晚朝节律"这三块分别拆成单独的中等长文章(800-1500 字),每周一篇,建立专题。

---

## 2. 即刻 App

> 即刻的调性:工具圈 builders 多,讨厌长篇大论,喜欢有个 hook 然后立刻给链接。

### 主帖

```
做 multi-agent 这几年我有个观察:LangGraph/CrewAI/AutoGen/MetaGPT 都在抄一个东西 —— 现代公司层级 (CEO/Manager/Worker)。

公司这玩意才 150 年历史,病理一大堆。中国朝廷跑了 2000 年,里面有两个角色公司隐喻表达不了:

🛡️ 锦衣卫 —— 跨模型独立审查
📜 史官 —— 系统自己给自己提修宪 PR

把这俩做成一等公民,就是 Mandate · 天命。今天 npm 上线:

    npx --yes create-mandate@alpha my-empire --template both

5 秒一座朝廷。MIT 协议。

github.com/liujiarui0918/mandate
```

### 短帖(每日 1 条,持续 1 周)

```
day 1:
multi-agent 框架最普遍的 bug 不是"某次推理错了",是"系统慢慢偏了"。
治漂移的不是更聪明的 router,是 24h 节律 + 跨模型审查 + 修宪 PR 反馈。

day 2:
"Reviewer agent 跟 Producer 跑在同一个模型上" 这种设计是 audit theater。
GPT-5 自信地错了,过它自己的 review 还是自信地错。
独立审查必须是跨模型的。

day 3:
今天用 Mandate 给我自己的 Twitter 自动化做了一套朝廷。
8 个角色,锦衣卫跑 Claude,宰相跑 GPT-5.5。
constitution.yaml 30 行,zero LLM 调用 5 秒跑起来。

day 4:
中国朝廷里有"史官",每件事记下来。
我把这个翻译成 JSONL chronicle + 模式检测 + 自动起草修宪 PR。
人类(皇帝)批红后宪法 atomic bump。
multi-agent 系统第一次有"second-order feedback"。

day 5:
所有 multi-agent 框架都该回答一个问题:审查者由谁审查?
现在的框架答不上 —— 因为 Reviewer 在链里。
朝廷的答案是:Censor 在链外,且跑不同模型。

day 6:
为什么我执着这个隐喻 —— 因为它不是装饰。
它强迫你回答"独立审查""自我演化"这种公司隐喻避而不答的问题。
metaphor names the choice.

day 7 (汇总):
本周 Mandate 收到 X 个 star (TBD)。
为什么发它:[anchor 文章链接]
```

---

## 3. 小红书

> 调性:emoji 多、数字感强、视觉化、年轻 builder + AI 学习者。

### 主帖 1(科普向)

**封面建议:** 一张对比图 —— 左边"CEO/Manager/Worker"(西装漫画),右边"皇帝/宰相/锦衣卫"(古装漫画),中间一个等号。

**标题:** `🏛️ multi-agent 框架都在抄西方公司,我抄了中国朝廷`

```
做 AI agent 的姐妹们看过来 🙋‍♀️

最近开源了一个 multi-agent 框架,叫 Mandate(天命)
github 五天 X star,跟大家分享下设计思路 ✨

📌 主流框架在做什么?
LangGraph / CrewAI / AutoGen 都在用 CEO-Manager-Worker
本质就是把现代公司用 YAML 抄了一遍
但是现代公司也才 150 年历史,问题超多 🥲

📌 中国朝廷 2000 年,有 2 个公司没有的角色
🛡️ 锦衣卫 —— 直接听皇帝指挥,绕开官僚体系
📜 史官 —— 记录所有事,后世改革参考

📌 翻译成 LLM:
✅ 锦衣卫 = 跨模型审查
   你的 GPT-5 输出 → Claude 审查
   不同模型抓盲点

✅ 史官 = 系统自己给自己提 PR
   检测重复失败 / 模型漂移
   生成修宪 PR,人类批红

📌 五秒看效果
npx --yes create-mandate@alpha my-empire --template both
👆 复制就能跑,不用买任何 API

📌 适合谁?
👩‍💻 做 multi-agent 的开发者
🎓 学 AI 系统设计的同学
🧠 对系统治理感兴趣的人

仓库:github.com/liujiarui0918/mandate
MIT 协议,完全免费 ⭐ 给个 star 谢啦

#AI #Agent #开源 #编程 #人工智能 #LLM #LangChain #程序员 #开发者
```

### 主帖 2(发布纪念向)

**封面:** terminal 截图,`npx create-mandate` 那一刻。

**标题:** `🎉 第一次发 npm 包就 4 个一起上线了!`

```
姐妹们今天好激动 🥺
我的 multi-agent 框架终于发到 npm 上了!

发包过程踩了一堆坑:
🕳️ npm 2024 年后强制 2FA
🕳️ Classic Token 2025-12 下线了
🕳️ Granular Token 不能发新 scope
🕳️ 我想要的包名 @mandate 已经被人占了 😭
🕳️ schema 文件第一版没打进包

每个坑都让我学到东西,踩完更扎实 💪

最后!
- @mandateai/validators
- @mandateai/runtime
- @mandateai/cli
- create-mandate
4 个包同时上线 ✨

试用:
npx --yes create-mandate@alpha my-empire --template both
5 秒一座中国朝廷,8 个角色,锦衣卫和史官齐活 🏛️

发布记录写在 PUBLISH.md 里,踩过的所有坑都记了 📝
帮助以后发包的姐妹少走弯路 🤝

#开源 #npm #程序员 #女程序员 #编程日常 #AI #LLM
```

---

## 4. 微博

> 微博:140 字限制,**hashtag 是命脉**。

### 主推

```
开源了一个 multi-agent 框架 Mandate(天命)🏛️

主流框架都在抄西方公司层级(CEO/Manager/Worker),我抄了中国朝廷。多两个角色:锦衣卫(跨模型审查)+ 史官(系统自己修自己的宪法)。

npx --yes create-mandate@alpha my-empire

github.com/liujiarui0918/mandate

#AI开源# #LLM# #Agent技术# #开源项目#
```

### 跟帖 1(技术向)

```
为什么强调"跨模型审查"?

因为 Reviewer 和 Producer 跑同一个模型 = 一起瞎。GPT-5 自信地错了,过它自己的 review 还是自信地错。

锦衣卫必须跑不同模型,这是结构性差异。

#AI技术# #大语言模型#
```

### 跟帖 2(发布庆祝向)

```
踩坑总结发出去了 📝
@mandate scope 在 npm 上被占了,改成 @mandateai
npm 2024 后强制 2FA + classic token 下线
granular token 发不了新 scope
schema 文件忘记打包...

每个坑都写进 PUBLISH.md 了 github.com/liujiarui0918/mandate

#开源踩坑# #npm# #开发笔记#
```

---

## 5. 微信公众号

> 公众号:封面图重要,长文容忍度高,配图位关键。

### 标题

A/B 两版:

A(技术派):
`所有 multi-agent 框架都漏了两个角色:锦衣卫和史官`

B(故事派):
`我把 multi-agent 框架做成了中国朝廷 | Mandate 设计记`

**推荐 B**(更有"读下去"动力)。

### 摘要(80 字内)

```
LangGraph / CrewAI / AutoGen 都在抄西方公司层级。Mandate 抄的是中国朝廷,带锦衣卫和史官。npm 已上线,5 秒看效果。
```

### 封面图

设计要点:
- 主视觉:左中右三栏
- 左栏:写着 "CEO / MANAGER / WORKER"(西装人偶剪影)
- 中栏:Mandate Logo
- 右栏:写着 "皇帝 / 宰相 / 锦衣卫 / 史官"(古装人偶剪影)
- 主色:朱红 + 墨黑 + 米白(中式)

### 文章主体

直接用 `anchor-zh.md` 的内容,但在以下位置加配图位提示:

```markdown
## 文章开头(摘要后)
[图 1:封面图]

## "五个空白点"表格上方  
[图 2:对比图 —— 公司金字塔 vs 朝廷拓扑图]

## 锦衣卫小节中部
[图 3:跨模型审查流程图 —— Chancellor (GPT-5) → 输出 → Censor (Claude) → 通过/打回]

## 史官小节中部
[图 4:Reform PR 流程图 —— 史官检测模式 → 起草 PR → 皇帝批红 → 宪法 bump]

## 早朝晚朝小节
[图 5:24h cadence 时间轴 —— 09:00 早朝 / 21:00 晚朝]

## 实操示例
[图 6:terminal screencap —— npx create-mandate 输出]

## 文章末尾
[图 7:CTA 海报 —— GitHub 链接 + ⭐]
```

### 文末"在看 + 转发"引导

```
👀 如果你也在做 multi-agent,觉得"锦衣卫"这个角色有道理,点个"在看"
🔁 转发给身边在卷 agent 框架的朋友
⭐ GitHub 给个 star,我会持续更新设计思路

下期预告:
《为什么 Mandate 强制"父子节点禁止"》—— 拓扑宪法详解
```

### 公众号矩阵 follow-up 选题

- 《所有 multi-agent 框架都该有的 24h 心跳:Mandate 早朝晚朝实测》
- 《修宪 PR:让你的 multi-agent 系统自己进化》
- 《我发 npm 包踩的 12 个坑(2026 版)》—— 借 PUBLISH.md
- 《为什么我说 Reviewer agent 是 audit theater》

---

## 6. V2EX

> V2EX 风:克制、不要 emoji、不要营销话术、技术细节直接给。

### 节点:`/分享创造` 或 `/程序员`

**标题:** `[分享] Mandate — 一个 multi-agent 框架,角色谱是中国朝廷不是公司层级`

**正文:**

```
做了一个开源的 multi-agent 框架,昨天发到 npm 上,分享一下设计思路。

简单背景:目前主流的 multi-agent 框架 (LangGraph / CrewAI / AutoGen / MetaGPT) 都用 CEO/Manager/Worker 这套架构,本质是现代公司层级。我用中国朝廷的角色谱替换了一下,得到两个公司隐喻里没有的角色:

1. 锦衣卫 (Censor) —— 跨模型独立审查
   每个节点的输出过一遍跑在不同模型上的 Censor。比如 Chancellor (Planner) 用 GPT-5.5,Censor 用 Claude。同模型 self-review 会一起瞎,跨模型 break 这个 loop。
   配置在 constitution.yaml,4 行 YAML 表达完。

2. 史官 (Historian) —— 系统自己起草修宪 PR
   每个事件 append 到 JSONL chronicle。Historian 检测模式 (重复失败、hook 触发过频、模型漂移),起草 Reform PR 作为 markdown 文件,人类 ratify 后宪法 semver bump。这是 Wiener 二阶反馈在 multi-agent 里的具体落地。

另外三个相对小的设计:
- Lifecycle hooks 作为程序性 must (YAML 声明,不在 LLM 推理上下文)
- 拓扑宪法 (父子节点依赖禁止,强制兄弟协作)
- bilingual terms.yaml (hook 可以混用中英术语,CLI 规范化)

现在已经发到 npm:
    npx --yes create-mandate@alpha my-empire --template both
    cd my-empire
    npx --yes -p @mandateai/cli@alpha mandate validate .

包大小 ~100 kB,4 个 npm 包,没有外部重依赖。Node 20+。

仓库: https://github.com/liujiarui0918/mandate
MIT 协议。

v0.4 会加 `mandate genesis "<one-sentence goal>"` —— LLM 驱动的朝廷设计器,把一句话目标变成完整的 court 配置。

欢迎拍砖,尤其欢迎对"跨模型审查"这一条提批评意见 —— 我自己还在收集生产环境数据。
```

### V2EX 跟帖准备

如果有质疑评论,准备好这些角度:

- "这跟 reviewer agent 有啥区别?" → 不同模型 + 节点级配置 + 不在主链内
- "成本高?" → tier 字段控制 (red_line/balanced/full),balanced 经验值 1.2-1.4x
- "为啥要朝廷隐喻,直接说技术细节不就好?" → metaphor names the choice,公司隐喻默认"audit 是可选的",朝廷隐喻显式说"audit 是一等公民"
- "中文角色名让英文用户怎么用?" → terms.yaml 双语等价,CLI 规范化

---

## 通用建议(所有中文平台共用)

### 跟评策略

每条主帖发出后:
- **1 小时内**:守在屏幕前,每条评论回复(中文社区"作者亲自回复"权重高)
- **2-12 小时**:每 30 分钟刷一次回复
- **24 小时后**:不再主动管,但被 @ 必回

### Cross-promotion 路径

1. 知乎发文章 → 在文章末尾放即刻链接
2. 即刻 + 微博日更 → 把"开源故事 + 踩坑日记"做成连续剧
3. 小红书发"封面强,文案爆款风" → 拉新流量给 GitHub
4. 公众号收尾 → 做成"专题文章",形成长尾搜索

### 关键禁忌

- ❌ 不要在同一天发完所有平台,稀释流量
- ❌ 不要伪装成第三方推荐(中文社区识别度高)
- ❌ 不要刷数据(知乎/B站/微博风控严)
- ❌ 不要回复"看我主页"这种引流话术

### 节奏建议(中文平台,1 周计划)

```
Day 1 (周一):    即刻主帖 + 微博主推
Day 2 (周二):    V2EX 长贴 (周二中午发,程序员摸鱼时段)
Day 3 (周三):    知乎文章 + 知乎答案铺 3 个
Day 4 (周四):    公众号长文
Day 5 (周五):    小红书 2 帖 (科普 + 发布庆祝)
Day 6-7 (周末):  即刻日更 + 微博日更,回复评论
```
