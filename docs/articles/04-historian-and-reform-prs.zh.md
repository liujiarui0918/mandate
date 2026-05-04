# 史官：朝廷如何自我演化

> Mandate 最独特的机制：一个 agent 层向宪法提出修订案，由人类像 git PR 一样批红。

## 问题：大多数框架是冻结的

你把 CrewAI / LangGraph / Paperclip 配置一次然后运行。当低效涌现（重复斥候调用、漂移的章程、士兵超支），你必须手动改 YAML。

这对静态问题有效。对其它一切失效：涌现的任务、演化的团队、变化的约束。一个启动时冻结的朝廷无法越用越好。

## Mandate 的方案：三个时间尺度

史官在三层嵌套循环上运转：

- **史册（每次 hook 触发，0 LLM 成本）：** 向当日 JSONL 追加 `{ts, agent, hook, artifacts, tokens}`。纯日志，每个动作都跑。
- **修订（每 7 日或每 50 次任务）：** Codex+gpt-5.5 批量读 chronicle 窗口，撰写制度修订 PR。PR 的目标是 `constitution.yaml`（如合并两组、提高预算、换模型）。
- **奏折（事件驱动）：** 当红线触发——错误率飙升、chronicle 容量爆炸、显式 `mandate audit` ——史官写紧急审计报告。

## 修订 PR 的格式

```markdown
# PR-042: 合并 research 与 content 组

**Rationale:** 过去 7 日 21 次 mandate 中，14 次在两组之间出现 result_only ↔ decision_affecting 的边界穿透。其中 11 次自动合并被接受，说明合并是结构性的。

**diff_target:** constitution.yaml

**Proposed changes:**
- op: merge_groups
  from: [research, content]
  to: research-content

**Status:** pending
```

PR 是 `reforms/` 下的真实 markdown 文件，附 `_metadata.yaml` 记录批红时 runtime 要应用的结构化 op set。

## 批红

```bash
$ mandate audit
📜 史官启奏：过去 7 日 3 条制度修订
   reforms/PR-042-merge-research-and-content.md
   reforms/PR-043-raise-chancellor-token-budget.md
   reforms/PR-044-add-default-soldier-timeout.md

$ git diff reforms/

$ mandate ratify PR-042
✓ constitution.yaml v1.2.4 → v1.3.0
✓ reforms/_ratified.yaml 已更新
```

批红是确定性补丁（非 LLM 重写）。留中（veto）则把 PR 移到 `reforms/_rejected/` 并附理由。

## 为什么用 PR 而非自动应用

自动应用史官提议是显然但错误的选择。它失去三件事：
- **人类问责** —— 这条新规则归谁负责？
- **可逆审计轨迹** —— git history 会变成 LLM 驱动突变的黑盒。
- **保守偏向** —— 人类的把关是抵御过度修订冲动的网兜。

PR 保留了三者。它还产出开发者本就熟悉的审查产物：diff。

## 宪法作为活文档

数周运转后，`constitution.yaml` 积累了批红的修订。它成为这个特定朝廷关于自己学到了什么的记录。新部署可 fork 既有宪法（"研究室原型"、"媒体团队原型"），不丢失那些决定中编码的智慧。

这是 YAML 级的"组织记忆"——任何其他框架都不提供。

## 借来的智慧

修订 PR 的模式直接借自 Linux 内核邮件列表和 Rust RFC 流程。史官只是自动提案者；皇帝（你）是维护者。改变的是节奏——内核补丁不规律到达，史官按皇帝设定的时钟运转。

---

*下一篇：[双语一等公民](./05-bilingual-first-class.zh.md)*
