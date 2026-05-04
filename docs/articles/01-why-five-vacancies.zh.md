# 五个空白点：为什么 Mandate 不是又一个 Paperclip

> Mandate 填补了 LangGraph、CrewAI、Paperclip、MetaGPT、OpenClaw 共同未竟的五处空白。

## 1. 锦衣卫层作为一等公民

LangGraph 提供 reviewer 节点；Paperclip 提供 approver；CrewAI 可以打"QA"标签。但都没有把"审查"作为架构层级——一条独立层、跑在不同模型家族、可按节点级配置强度、有专门的越级申诉通道。

Mandate 的锦衣卫层强制保证：(a) 与被监察对象不同的模型；(b) 三档可配置强度；(c) 节点级覆盖；(d) 红线触发即向皇帝奏报。

## 2. 工作流 vs 创新——形式化

各家都强调"agent 有角色"。但少有人形式化每个角色每天必须履行的纪律。Lifecycle Hooks 是 Mandate 的独特贡献：每个角色声明程序性 must（打卡产物、schema 校验的输出），由 runtime 强制执行。Hook 之间，agent 自由发挥。

这是第一个把 March (1991) 探索-利用困境在 YAML 层面落地的 agent 框架。

## 3. 父子节点禁止

大多数框架允许任意 DAG。康威定律警告：你构建的拓扑会镜像出你的系统结构。如果两个项目组存在影响决策的依赖，你已经编码了一处串行瓶颈。

Mandate 禁止这种结构。三层防护（`mandate validate` 静态 lint + 宰相运行期硬阻 + 史官事后 PR）在每个阶段截击违规。

## 4. 制度演化

OpenClaw 的 `agent-evolver` 演化单 agent。主流框架无人演化"组织本身"。

Mandate 的史官层在三个时间尺度运转：被动日志、周期性 LLM 反思（产出制度修订 PR）、事件驱动审计。修订是 git 风格的 PR，由皇帝批红——绝不自动应用。

## 5. 东西方双隐喻文化

Paperclip 是纯英文公司隐喻。Mandate 的 `terms.yaml` 让"封建朝廷"与"现代公司"成为对等的表层形式。CLI 输出、角色命名、文档全部支持语言切换，无翻译漂移。

## 你能获得什么

- **抗幻觉防御**——锦衣卫架构是结构级的，不依赖 prompt 工程。
- **有纪律但不僵化**——Hooks 强制程序性动作；其余自由。
- **康威洁净的并行**——项目组按设计就是兄弟节点。
- **二阶学习循环**——朝廷与工作一同演化。
- **文化护城河**——双语一等公民，纯英文竞品无法复制。

---

*下一篇：[Lifecycle Hooks vs Routing](./02-lifecycle-hooks-vs-routing.zh.md)*
