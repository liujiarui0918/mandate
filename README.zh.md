# Mandate · 天命

> **multi-agent 框架都在抄西方公司层级。Mandate 抄的是中国朝廷 —— 多两个公司隐喻表达不了的角色:跑在不同模型上的锦衣卫(独立审查),以及替系统起草修宪 PR 的史官。**
>
> *奉天承运,朝廷自治。* 含 24 小时心跳(早朝/晚朝)。双语一等公民。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![npm](https://img.shields.io/npm/v/@mandateai/cli/alpha)](https://www.npmjs.com/package/@mandateai/cli)
[![GitHub Stars](https://img.shields.io/github/stars/liujiarui0918/mandate?style=social)](https://github.com/liujiarui0918/mandate)
[![Read in English](https://img.shields.io/badge/lang-English-blue.svg)](README.md)

![Mandate demo](docs/assets/demo.gif)

## 30 秒试用

```bash
npx --yes create-mandate@alpha my-empire --template both
cd my-empire
npx --yes -p @mandateai/cli@alpha mandate validate .
```

一座完整的朝廷 —— 8 角色、锦衣卫 + 史官、早朝晚朝节律 —— 脚手架完成、校验通过、随时可演化。

---

## Mandate 是什么

Mandate 把 LLM agent 组织成一座自治的封建朝廷。当 LangGraph、CrewAI、Paperclip、OpenClaw 都收敛到 CEO/Manager/Worker 层级时，Mandate 填补了它们都未触及的五处空白：

1. **锦衣卫层** 作为一等公民——独立模型，可按节点级配置。
2. **Lifecycle Hooks** ——工作流纪律作为程序性 must，创新空间在 hook 之间。
3. **拓扑宪法** ——父子节点禁止，三层防护。
4. **史官层** ——通过制度修订 PR 实现的二阶反馈环，由人类批红。
5. **双语一等公民** ——封建朝廷与现代公司隐喻在代码层平起平坐。

## 为什么叫 "Mandate"

英文 *mandate* 意为"具有权威的命令"。中文 天命 是君主所执的天授之权——治国不善则失之。双关给了 Mandate 它的口号与结构：每道圣谕是一份 *mandate*，朝廷自身亦持一份 *天命*——治国不善便会失去。

## 朝廷拓扑

```
皇帝 (人类) → 宰相 → [项目组 A | 项目组 B | 项目组 C ...]
                       │
        ┌──────────────┴──────────────┐
        │  各组：军师 → 斥候 → 士兵×N → 文官    │
        └──────────────────────────────┘

锦衣卫：1:1 配 audit、独立模型、节点级配置
史官：史册 + 制度修订 PR + 紧急奏折
```

## 一份宪法长什么样

```yaml
version: 1.0.0
project: my-empire
language: both

topology:
  enforce_no_parent_child: true
  on_violation: hard_block

censor:
  default_tier: balanced
  overrides:
    chancellor: { strategy: full, async: false }

historian:
  reflection_period_days: 7
  reflection_period_tasks: 50

models:
  chancellor: { preferred: gpt-5.5, fallback: [gpt-5, gpt-5-pro] }
  cto:        { preferred: claude-opus-4-7-1m, fallback: [claude-opus-4-7] }
```

## 三命令（Phase B）

```bash
$ npx create-mandate my-empire --template both    # 静态脚手架（5 秒）
$ npx mandate genesis "<你的想法>"               # LLM 驱动的元朝廷设计
$ mandate evolve "<你想要的演化>"                # 自然语言修宪
```

> **v0.3.1-alpha（2026 年 5 月）：** `create` 和 `validate` 已可用。npm 发布前先克隆仓库直接跑：
>
> ```bash
> git clone https://github.com/liujiarui0918/mandate
> cd mandate && npm install
> node packages/cli/bin/mandate.mjs create my-empire --template both
> node packages/cli/bin/mandate.mjs validate my-empire
> ```
>
> `genesis` / `evolve` / `run` / `court` / `audit` / `ratify` / `veto` 在 v0.4 上线。

## 用例——任何任务都能成朝廷

Mandate 是元框架：一句 prompt 给 `mandate genesis`，你就得到一座为该任务而生的完整朝廷：

| 领域 | 一句话 prompt → |
|---|---|
| 🔬 研究 | *"出一份关于 2026 年聚变能源现状的 10K 字报告"* |
| 📈 交易 | *"每日监控股市，每个早朝呈上 3 个机会"* |
| 🐦 内容 | *"运营我的 Twitter：发帖、互动、分析、合规"* |
| 💻 编程 | *"4 周内打造并发布一个 Twitter 克隆"* |
| 📨 客服 | *"分类回复邮件；边界场景上报"* |
| 🛠️ 运维 | *"7×24 监控我的基础设施 + 事故响应"* |
| 📣 营销 | *"规划并执行一个 30 天产品 campaign"* |
| 🪞 自治 | *"反思朝廷自身；提议制度修订"* |

每个领域共享同一套骨架：8 角色、生命周期 hooks、锦衣卫层、史官、每日节律——只是项目组、章程、skill pack 因任务而异。

## 每日节律——早朝与晚朝

每个 Mandate 朝廷都跑在 24h 心跳上：

- **早朝（默认 09:00）**：宰相把昨日成果奏报皇帝，拟今日议程。皇帝批红、修订或改向，决议级联到每一个叶子节点。
- **晚朝（默认 21:00）**：每个叶子节点（士兵/斥候/文官）写 `daily_report.md`。军师按组汇总；宰相综合；报告归档候次日早朝复审。

```bash
$ mandate court morning      # 手动触发早朝
$ mandate court evening      # 手动触发晚朝
$ mandate court status       # 下次时间 + 上次结果
```

这就是 Mandate 能作为项目*基底层*的原因：可预期触点、失败遏制、审计轨迹由构造而成。完整机制见 [文章 06](docs/articles/06-daily-court-cadence.zh.md)。

## Phase A——方法论（你现在所在）

本仓库现阶段提供：

- **设计 SPEC：** [docs/specs/2026-05-01-mandate-design.md](docs/specs/2026-05-01-mandate-design.md)
- **JSON Schemas：** [spec/](spec/)
- **示例：** [examples/research/](examples/research/) 与 [examples/self-governance/](examples/self-governance/)
- **方法论文章：** [docs/articles/](docs/articles/)
- **双语术语表：** [terms.yaml](terms.yaml)

凭这些规范，今天你就可以在 LangGraph、Claude Code、Paperclip 或任何 agent 框架上落地 Mandate。

## Phase B——参考实现（第 5-12 周）

TypeScript pnpm monorepo：
- `@mandateai/runtime` ——runtime（hook 调度器、锦衣卫拦截器、文件锁）
- `@mandateai/cli` ——三命令 + 辅助命令
- `@mandateai/adapters` ——MCP / Claude Code / OpenClaw / CLI
- `@mandateai/packs-imperial-v1` ——八个 skill pack
- `@mandateai/registry` ——本地优先的 skill 发现

## Phase C——紫禁城仪表盘（第 13-20 周）

跑在同样的"文件即真理之源"之上的双语 web 仪表盘：实时拓扑图、制度修订 PR 审查 UI、锦衣卫审计时间轴、单 mandate 成本仪表。安排在 Phase B 稳定之后——见 [SPEC §13](docs/specs/2026-05-01-mandate-design.md)。

## 理论五柱

| 学科 | 概念 | 落地位置 |
|---|---|---|
| 管理学 | 探索 vs 利用（March 1991） | Lifecycle Hooks |
| 政治学 | 帝国官僚制 ↔ 现代企业 | terms.yaml |
| 控制论 | 二阶反馈（Wiener） | 史官 + 制度修订 PR |
| 软件工程 | 康威定律 | 父子节点禁止 |
| 分布式系统 | CAP 定理 | 项目组兄弟拓扑 |

## 与现有框架对比

| 特性 | LangGraph | CrewAI | Paperclip | MetaGPT | Mandate |
|---|---|---|---|---|---|
| 层级 agent | Y | Y | Y | Y | Y |
| 人在回路 | Y | 部分 | Y | 部分 | Y |
| 独立审查层 | 部分 | N | 部分 | N | 一等公民 |
| 程序性 hooks | N | N | N | 隐式 | YAML 级 |
| 拓扑约束求解 | N | N | N | N | 三层 |
| 自我演化 | N | N | N | N | 修订 PR |
| 双语一等公民 | N | N | N | 部分 | 结构性 |
| Star（2026 年 4 月） | 8.2k | 45.9k | 53k | 44k | TBD |

## 路线图

- [x] **Phase A——方法论**（第 1-4 周）：SPEC、schemas、文章、示例。
- [ ] **Phase B——TypeScript runtime**（第 5-12 周）：三命令、八个 skill pack。
- [ ] **Phase C——紫禁城仪表盘**（第 13-20 周）：拓扑图、PR UI、审计时间轴。
- [ ] **v2** ——朝廷间联邦、宪法市场、御史台（监察的监察）。

## 当前状态

Phase A 进行中。Star 此仓库以追踪 Phase B & C 的开发。

## 延伸阅读

- [SPEC](docs/specs/2026-05-01-mandate-design.md) ——完整设计规范
- [文章 01：五个空白点](docs/articles/01-why-five-vacancies.zh.md)
- [文章 02：Lifecycle Hooks vs 任务路由](docs/articles/02-lifecycle-hooks-vs-routing.zh.md)
- [文章 03：拓扑宪法](docs/articles/03-topology-constitution.zh.md)
- [文章 04：史官与制度修订 PR](docs/articles/04-historian-and-reform-prs.zh.md)
- [文章 05：双语一等公民](docs/articles/05-bilingual-first-class.zh.md)
- [文章 06：早朝晚朝（每日节律）](docs/articles/06-daily-court-cadence.zh.md)

## 贡献

见 [CONTRIBUTING.md](CONTRIBUTING.md)。Issue、PR、宪法修订案皆欢迎。

## 许可证

MIT。

## 致谢

灵感来自：LangGraph 的层级团队模式、MetaGPT 的 SOP 纪律、ChatDev 的多角色分工、Paperclip 的组织隐喻、OpenClaw 的自我演化、Anthropic 多 agent 研究的 orchestrator-subagent 架构，以及一千年的唐明官僚传统。
