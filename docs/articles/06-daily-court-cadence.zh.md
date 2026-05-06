# 早朝晚朝：朝廷的每日心跳

> 把 Mandate 从"配置一次的框架"变成"每天自己运转的朝廷"——靠的就是这一个机制。

## 缺失的心跳

每个多 agent 框架都说自己能持续运转。少有人承认：没有节律的"持续"很快变成混乱。任务堆积、状态不透明、本应在回路里的人类，不知不觉飘出回路。

真实的组织几个世纪前就解决了这个问题。明清两朝，黎明设 **早朝**——宰相奏报昨日事务、提议今日议程，皇帝批红、修订或改向；黄昏设 **晚朝**，把当日成果向上汇总。这种模式是普世的：晨间简报，晚间总结。Mandate 把它做成整个 agent 系统的心跳。

## 早朝（Morning Court）—— 09:00

```
Step 1  宰相读取 chronicle/<昨日>.jsonl
Step 2  宰相撰写 morning_court_report.md
        - 昨日各项目组完成度
        - 未结/阻塞事项
        - 锦衣卫/史官要点
        - 今日议程草案
Step 3  奏报呈递皇帝（CLI / dashboard）
Step 4  皇帝三选：批准 / 修订 / 改向
        默认：30 分钟超时 → approve_all
Step 5  宰相生成 today_decomposition.yaml
Step 6  级联分发触发 on_morning_dispatch_received
Step 7  各军师写 today_group_brief.md
        分发到斥候/士兵/文官
```

皇帝的三个选项不是抽象概念，它们直接对应命令：一键批准全部议程、改 YAML 然后批准、若方向已根本变化则升级为新的 `mandate evolve`。

## 晚朝（Evening Court）—— 21:00

```
Step 1  叶子节点（士兵/斥候/文官）触发
        on_evening_self_report，写 daily_report.md：
        - 今日完成
        - 阻塞/未完成原因
        - 明日预期
Step 2  各军师触发 on_evening_aggregate：
        - 读本组所有叶子 daily_report.md
        - 产出 group_evening_report.md
Step 3  宰相触发 on_evening_synthesis：
        - 汇总所有 group_evening_report.md
        - 产出 chancellor_evening_report.md
        - 归档 chronicle/evening-courts/{date}.md
        - 候次日早朝复审
```

注意方向倒转：早朝自上而下（宰相 → 军师 → 叶子），晚朝自下而上（叶子 → 军师 → 宰相）。系统每天一吸一呼。

## 这给你带来什么

- **可预期的人在回路触点**：皇帝在固定时间审阅，人类与机器双方都知道何时该等输入。
- **失败遏制**：飘移的项目组在明日早朝奏报里浮出。卡住的叶子在今晚晚朝里浮出。没有跨日的静默失败。
- **审计轨迹由构造而成**：每个工作日产出一对 `morning-courts/{date}.md` + `evening-courts/{date}.md`。朝廷的历史读起来像真实组织档案。
- **文化共鸣**：中文早朝/晚朝、英文 standup/retro，两边受众都能秒懂。隐喻自带传播。

## 配置

```yaml
court_cadence:
  enabled: true
  morning_court:
    time: "09:00"
    emperor_decision_timeout_minutes: 30
    on_timeout: approve_all
  evening_court:
    time: "21:00"
    leaf_report_required: true
    skip_if_no_activity: true
  timezone: Asia/Shanghai
```

自治朝廷跑更紧凑的节奏（08:00 / 15min / escalate；22:00 / required true / skip false）——它们的工作*就是*每日反思。研究朝廷用更宽松的默认。`time` 字段也接受 cron 表达式以应付不规律日程。

## 元框架的关键连接

这正是 Mandate 能作为*任何项目基底层*的原因。把 `mandate genesis "<你的任务>"` 和每日节律组合：

```bash
$ npx mandate genesis "运营我的 Twitter 账号"
✓ 4 个项目组、28 个 hook、早朝 09:00、晚朝 21:00
$ mandate court morning
📜 第 1 日：尚无 chronicle —— 从章程初始化议程
📜 今日：发 3 帖、5 次互动、21:00 KPI 复盘
```

第 2 日起，每个早晨自动浮出昨日 KPI，无需你问。每个晚上自动收齐今日结果，无需你催。朝廷自己运转。你只在排定的朝时介入——或者锦衣卫红线触发时。

---

*下一篇：[五个空白点](./01-why-five-vacancies.zh.md) ——回到起点，这次有了心跳。*
