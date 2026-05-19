# 我把 multi-agent 框架做成了中国朝廷,锦衣卫是一等公民

> 一句话:**所有 multi-agent 框架都在抄西方公司层级。我抄的是中国朝廷,带锦衣卫和史官。**

GitHub: https://github.com/liujiarui0918/mandate

试用一行:

```bash
npx --yes create-mandate@alpha my-empire --template both
```

---

## 主流框架其实都在做同一件事

打开 LangGraph、CrewAI、AutoGen、MetaGPT、Paperclip,你看到的都是同一套换皮:

- 一个 **CEO** 节点(有时候叫 Planner / Orchestrator / Manager),负责拆任务
- 一层 **Manager** 节点,负责路由
- 一池 **Worker** 节点,负责执行叶子任务
- 偶尔有个 **Critic** / **Reviewer**,通常是可选的、function call 形式的

这是把"现代公司"用 YAML 抄了一遍。熟悉、好理解 —— 正因为如此我们才一直在抄。但现代公司其实就 150 年历史,它有明显的病理:C-suite 的群体迷思、决策传话游戏、出事时责任真空。LLM agent 时代才三年,这些病理已经在 agent 系统里复刻了一遍。

于是我换了个问题:**如果我们把 multi-agent 的治理结构,建模在一个跑了 2000 年、解决过现代公司没解决问题的系统上呢?**

那个系统就是中国封建朝廷。结果就是 [**Mandate · 天命**](https://github.com/liujiarui0918/mandate) —— 一个 multi-agent 框架,编排层不是组织架构图,而是一座朝廷。

这不是美学,是结构。朝廷里有"公司"这个隐喻表达不出来的角色,而这些角色恰恰是现代 agent 系统最需要的。

---

## 五个空白点

直接对比角色配置:

| 角色 | 公司类框架 | Mandate 朝廷 |
|---|---|---|
| 拆解者 | CEO / Planner | 宰相 (Chancellor) |
| 项目组组长 | Manager | 军师 (CTO) |
| 调研者 | (无,通常融在 Worker 里) | 斥候 (Scout) |
| 执行者 | Worker | 士兵 (Soldier) |
| 综合者 | (无,通常融在 Manager 里) | 文官 (Secretary) |
| **独立审查(独立模型)** | ❌ | **锦衣卫 (Censor)** |
| **自我演化 + 修宪** | ❌ | **史官 (Historian)** |
| 最高权威 | Stakeholder | 皇帝 (Emperor,人类) |

加粗的两个角色是关键。让我说清楚它们为什么重要。

### 1. 锦衣卫 —— 独立审查作为一等公民

明朝的锦衣卫直接向皇帝汇报,绕过整个官僚系统,任务是把官僚体系想藏起来的东西捅出来。

翻译到 LLM:每个节点的每条输出,都会过一遍**用不同模型**跑的锦衣卫。如果你的宰相跑在 GPT-5.5,那这个节点的锦衣卫就跑 Claude 或 Gemini。锦衣卫检查:

- Schema 违规(宪法声明什么合法)
- 隐藏假设
- 幻觉
- 拓扑违规(父子依赖禁止)

**重点是 —— 锦衣卫不是 hook、不是中间件、不是可选的 Reviewer agent。它是节点级配置**:

```yaml
censor:
  default_tier: balanced
  overrides:
    chancellor:
      strategy: full
      async: false
    soldier:
      strategy: red_line
      async: true
```

现有框架里最接近的是"reviewer"agent —— 一个节点调用另一个 reviewer。这有个根本缺陷:**产出坏输出的那个模型也调用 reviewer**。当 GPT-5 自信地错了,过 review 还是自信地错。跨模型审查打破这个闭环。

这是 Mandate 最重要的一个结构性差异。所有其他特性都是从"认真对待锦衣卫"这件事推导出来的。

### 2. 史官 —— 通过制度修订 PR 的二阶反馈

史官是皇帝身边的史官,记录所有皇帝行为,长此以往就形成奏折(PR)。认真对待史官的朝代往往活得更久。

Mandate 里史官做四件事:

1. **追加每个事件**到日度史册(JSONL)
2. **检测重复模式** —— 同一角色重复失败、同一 hook 触发过频、模型漂移
3. **起草制度修订 PR** —— 在 `reforms/` 下生成 markdown,结构化提议修宪
4. **呈递皇帝(人类)** 批红

皇帝批红后,宪法被原子性修订(semver bump),记录到 `_ratified.yaml`。

这就是 Wiener 说的*二阶反馈*:系统不仅适应输出,**还适应产出输出的规则**。绝大多数 multi-agent 框架完全没有这个。最接近的是 "prompt optimization",那只是优化一个字符串。修宪 PR 修整个治理结构。

### 3. Lifecycle Hooks —— 工作流纪律作为程序性 must

现代框架把工作流纪律表达成路由规则:*"如果状态是 X,去节点 Y"*。这灵活,但纪律放在 LLM 的推理上下文里,LLM 自己能 rationalize 绕过去。

Mandate 用 **hooks**:YAML 声明的步骤,在 lifecycle 事件触发(`pre_decompose`、`post_audit`、`before_chronicle`、`pre_ratify` 等)。hook 是程序性的 must —— 如果 hook 失败,父节点直接被 block。

这是 March 1991 经典命题 *exploration vs exploitation* 在 agent 设计里的对应:hook 是 exploitation(确定纪律),LLM 在 hook 之间的自由是 exploration。Mandate 把这个 trade-off 显式做到配置层。

### 4. 拓扑宪法 —— 父子节点禁止

`constitution.yaml` 里:

```yaml
topology:
  enforce_no_parent_child: true
  on_violation: hard_block
```

节点不能在产出自己之前读父节点的输出。听起来限制大 —— 是的,故意的。它强制*兄弟协作*(项目组并行)而不是*垂直传话*(组长口述下来给小弟,小弟再口述给孙子)。

拓扑校验器在三层运行:
1. Schema 层(JSON Schema) —— 声明的依赖语法合法
2. 静态层 —— 依赖 DAG 在加载时被检查
3. Runtime 层 —— 实际数据流在每个 hook 处被验证

康威定律说:你建的系统会镜像你的沟通结构。Mandate 在宪法层就约束沟通结构。

### 5. 双语一等公民 —— 东西方在代码层平等

`terms.yaml` 不是 localization,是结构性的:

```yaml
chancellor: { en: chancellor, zh: 宰相 }
censor:     { en: censor,     zh: 锦衣卫 }
historian:  { en: historian,  zh: 史官 }
```

你写 hook 的时候,可以写 `must: 宰相 must call 锦衣卫 after every 决议`,也可以全英文。CLI 都规范化。这不是 feature —— 这是个**立场**:东方治理传统和西方治理传统**都**有东西可教,代码应该反映这点。

---

## 每日节律 —— 早朝与晚朝

大部分 multi-agent 系统是事件驱动:请求来 → agents 跑 → 返回 → 完。Mandate 加了**24 小时心跳**:

- **早朝(默认 09:00)**:宰相把昨日成果奏报皇帝,拟今日议程。皇帝批红、修订或改向,决议级联到每个叶子节点
- **晚朝(默认 21:00)**:每个叶子节点(士兵/斥候/文官)写 `daily_report.md`。军师按组汇总;宰相综合;报告归档候次日早朝复审

```bash
$ mandate court morning      # 手动触发早朝
$ mandate court evening      # 手动触发晚朝
$ mandate court status       # 下次时间 + 上次结果
```

为什么重要?因为生产 multi-agent 系统的失败大部分不是"某次推理错了",而是**时间漂移**:系统慢慢偏离了它该做的事。日度节律 + 结构化报告 + 跨模型审查 + 修宪 PR 反馈,**是专门为抓漂移设计的**。

这是 Mandate 作为*基底层*的杀手特性:可预期触点、失败遏制、审计轨迹由结构保证。

---

## 实操示例 —— 一句话脚手架一座朝廷

```bash
$ npx create-mandate@alpha my-empire --template both
ok Mandate court scaffolded at ./my-empire/.mandate (template=both)

$ cd my-empire && cat .mandate/constitution/constitution.yaml
```

你得到:

- `.mandate/constitution/charter.md` —— 项目目标(你自己写)
- `.mandate/constitution/constitution.yaml` —— 拓扑、锦衣卫配置、模型分配
- `.mandate/constitution/terms.yaml` —— 双语术语表
- `.mandate/workspace/mandate.md` —— 朝廷入口文档

5 秒,零 LLM 调用。然后 `npx -p @mandateai/cli@alpha mandate validate .` 校验宪法。

v0.4 会加 `mandate genesis "<一句话目标>"` —— LLM 驱动的朝廷设计师,为该目标定制完整朝廷。

---

## 用例 —— 任何任务都能成朝廷

| 领域 | 一句话 prompt → |
|---|---|
| 🔬 研究 | "出一份关于 2026 年聚变能源现状的 10K 字报告" |
| 📈 交易 | "每日监控股市,每个早朝呈上 3 个机会" |
| 🐦 内容 | "运营我的 Twitter:发帖、互动、分析、合规" |
| 💻 编程 | "4 周内打造并发布一个 Twitter 克隆" |
| 📨 客服 | "分类回复邮件;边界场景上报" |
| 🛠️ 运维 | "7×24 监控我的基础设施 + 事故响应" |
| 📣 营销 | "规划并执行一个 30 天产品 campaign" |
| 🪞 自治 | "反思朝廷自身;提议制度修订" |

每个领域共享同一套骨架:8 角色、生命周期 hooks、锦衣卫、史官、每日节律 —— 只是项目组、章程、skill pack 因任务而异。

---

## 当前已发布(v0.3.0-alpha.1)

```bash
npx --yes create-mandate@alpha my-empire --template both
```

npm 上四个包齐活:

- `@mandateai/validators` —— JSON Schema + 拓扑校验
- `@mandateai/runtime` —— 宪法 loader、史册、记忆、模型 resolver、hook 调度器、锦衣卫拦截器
- `@mandateai/cli` —— `mandate validate / status / explain / ratify / veto / audit / court / genesis / run`
- `create-mandate` —— 顶级脚手架

v0.4 会加 `mandate genesis`(LLM 设计朝廷)、`mandate run`(编排循环)、八个 skill pack(每个角色一个)。

---

## 理论根基

Mandate 不只是换隐喻,五学科都有挂载:

| 学科 | 概念 | 在 Mandate 的对应 |
|---|---|---|
| 管理学 | 探索 vs 利用 (March 1991) | Lifecycle Hooks |
| 政治学 | 帝国官僚制 ↔ 现代企业 | terms.yaml + 角色谱 |
| 控制论 | 二阶反馈 (Wiener) | 史官 + 修宪 PR |
| 软件工程 | 康威定律 | 父子节点禁止 |
| 分布式系统 | CAP 定理 | 项目组兄弟拓扑 |

---

## 留个问题

如果你也在做 multi-agent,我想抛个问题:**审查者由谁审查?**

CEO/Manager/Worker 链里,当 Manager 的 review 错了,**链上没人能在外面抓住它**。朝廷里锦衣卫向皇帝(人)汇报,不向宰相汇报,且**跑在不同模型上** —— 链有出口。

这就是全部 pitch。其他东西 —— 史官、早朝、双语术语 —— 都是从"认真对待独立审查"这件事推出来的。

仓库:**https://github.com/liujiarui0918/mandate**

试一下:

```bash
npx --yes create-mandate@alpha my-empire --template both
cd my-empire
npx --yes -p @mandateai/cli@alpha mandate validate .
```

MIT 协议。PR 欢迎 —— 尤其欢迎给 Mandate 自身宪法提的修宪 PR(项目吃自己的狗粮)。

---

*如果这改变了你对 multi-agent 治理的思考方式,⭐ 这个仓库,告诉我你打算建第一座什么朝廷。*
