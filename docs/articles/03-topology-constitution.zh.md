# 拓扑宪法：为什么禁止父子节点

> 大多数多 agent 框架允许任意 DAG。Mandate 不允许。本文解释为什么，以及三层防护如何运作。

## 问题：康威定律违例

当项目组 `B` 的下一步决策依赖项目组 `A` 的输出时，你已经把两个本应并行的组串行化了。更糟糕的是，你向 *正在构建的系统* 发出了一个不该有的瓶颈信号——康威定律告诉我们，你的代码会继承这个瓶颈。

这种错误极易发生，以至于 LangGraph、AutoGen、CrewAI 都默许它。用户并未故意引入串行依赖，但 DAG 编辑器不知道。

## 规则

跨项目组的依赖在影响下游决策时是禁止的。当依赖只是等待结果（B 等 A 但 A 的输出不改变 B 的行为）时是合法的。

形式上，每条跨组依赖必须声明 `kind: result_only` 或 `kind: decision_affecting`。仅前者合法。

## 第 1 层：编译期 Lint

`mandate validate` 走查 `decomposition.yaml`，构建跨组依赖图，发现任何 `decision_affecting` 即报 warning。

这运行在 CI 里、运行在你编辑器保存时——任何 LLM token 消费之前就能截击错误。

## 第 2 层：运行期硬阻

即使 lint 通过，动态拆解也可能违规（如宰相重新生成计划引入了禁止依赖）。

宰相的 `on_mandate_received` hook 调用 `builtin:topology-check`。检测到违例 → dispatch 被硬阻。用户看到自动合并提议：*"合并 GroupA + GroupB 为 GroupAB？(y/N)"* ——让工作继续推进而无需推倒重来。

## 第 3 层：史官事后 PR

即便运行期检查也有逃逸路径。微妙的依赖可能在执行时由 agent 行为涌现——比如组 `A` 的军师按某种约定悄悄读了组 `B` 的草稿。

史官周期性扫描 chronicle。若检测到符合父子模式的跨组读取，写出 `reforms/PR-NNN-merge-X-and-Y.md`，候皇帝批红。下一次 mandate run 使用新宪法。

## 为什么三层？

单层防御按设计就会失败：
- 仅 lint 漏掉动态违规。
- 仅 runtime 漏掉微妙的数据流。
- 仅史官对当前 run 太迟。

组合提供了最强属性：*父子依赖无法连续跨两次 mandate run 留存*。本次漏过 → 下次开始前已被批红剔除。

## 一个具体例子

设想一个调研项目，拆为 Tech、Companies、Regulation 三组。如果 "Companies" 必须知道 "Tech" 验证了哪些技术 *才能决定调研对象*——这就是父子，禁止。

Mandate 的响应：合并为 "Tech-and-Companies" 组，内部 scout → soldier 按需串行，但对宰相只呈现一个边界。

康威可以安睡。

---

*下一篇：[Historian and Reform PRs](./04-historian-and-reform-prs.zh.md)*
