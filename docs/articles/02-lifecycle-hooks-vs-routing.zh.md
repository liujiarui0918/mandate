# Lifecycle Hooks vs 任务路由

> 为什么"把任务路由到 SOP prompt 还是 创意 prompt"是错误的抽象——以及该怎么做。

## 错误的模式：模式路由

常见的冲动：任务来了，先分类（SOP / 创意 / 混合），然后选 prompt。这把"纪律"当成了"内容选择"。它会泄漏。

分类器成了瓶颈。边界情况增多。两份 prompt 漂移。任务一旦跨模式，分类器就会幻觉一个分类。

## 正确的抽象：Hooks + 自由思考

真实组织里的员工不会在"纪律模式"和"创意模式"之间二选一。他们：打卡（强制）、喝咖啡（自由）、写周报（强制）、思考架构（自由）、交周报（强制）。

Mandate 的 Lifecycle Hooks 直接建模这个现实。每个角色在生命周期时刻——`on_input_received`、`every_n_steps`、`on_output_ready`——声明程序性的 must。Runtime 把这些注入到 agent 的 prompt 作为前置条件：*"在你继续之前，你必须按 schema Z 在路径 Y 产生 X。"*

Hook 之间，agent 自由发挥。

## Hook 长什么样

```yaml
role: chancellor
hooks:
  on_mandate_received:
    - must: "把诏书精细化，写入 decomposition.yaml"
      schema: { type: object, properties: { groups: { type: array } } }
      writes_to: workspace/decomposition.yaml
    - must: "校验项目组间拓扑"
      validator: builtin:topology-check
      retry_policy: none
  every_n_steps: 5
    - must: "扫各组进度"
      writes_to: workspace/status_report.md
```

agent 决定*如何*精细化诏书。Runtime 校验精细化产物是否被写入、是否符合 schema、是否通过 validator。任一 must 失败 → 锦衣卫介入，可能要求重做。

## 这为什么重要

- **纪律由结构强制**——非 prompt 工程。你没法不小心跳过拓扑校验。
- **创造性被保留**——内容从不受约束，只约束围绕它的程序性动作。
- **可审计性自动达成**——每个 must 都产出指定路径的指定产物。
- **新角色上手是机械的**——写 hooks，runtime 自然知道怎么强制。

## 何时 Hooks 不适用

几件 hooks 不该做的事：
- **条件逻辑**——用 agent 的自由推理，不要用 hook。
- **任务级差异**——hooks 描述*角色*的纪律，不是某个特定任务的逻辑。
- **软偏好**——只编码真正的 must；过度 hook 会造成"纪律疲劳"。

如果某行为是"应当做"，写到角色的 `_base.md` prompt 里；只有"必须做"才进 hooks。

## 借来的智慧

这个想法不新。AOP 框架用了二十年的 lifecycle interceptor。Claude Code 自身也有 PreToolUse / PostToolUse / Stop hooks。新的是把这个模式应用到*agent 角色纪律*而非*工具调用*。结果是一个"科层严谨"与"创意空间"凭构造而共存的 agent 系统。

---

*下一篇：[Topology Constitution](./03-topology-constitution.zh.md)*
