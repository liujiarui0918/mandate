# 双语一等公民

> 大多数"国际化"项目翻译完 README 就收工。Mandate 在代码层面让"隐喻"本身双语化。

## 翻译陷阱

你见过：中文开源项目有出色的 README.zh、能用的 README.en、纯英文代码。东方用户感到这是为他们写的；西方用户感到这是翻译版。两边都察觉到不对称，采用率分层。

## Mandate 的方案

`terms.yaml` 是规范化的映射。runtime、CLI、validators、文档全部加载它。它既是配置文件，也是文学装置。

```yaml
emperor:    { zh: 皇帝, en: emperor, latin: imperator }
chancellor: { zh: 宰相, en: chancellor }
censor:     { zh: 锦衣卫, en: censor, alias: jin-yi-wei }
historian:  { zh: 史官, en: historian }
```

在 `decomposition.yaml` 里，你可以写 `role: 宰相` 或 `role: chancellor`——两者都是规范形式。当 `MANDATE_LANG=both` 时，CLI 输出 `📜 宰相 (Chancellor) 已就位`。

## 双语一等公民给你什么

- **无翻译漂移** —— 不存在"主"版本和"次"版本。terms 文件是唯一真理。
- **跨文化流畅** —— 西方开发者学到 `censor` = 锦衣卫 = 独立审查层。隐喻丰富了技术概念。
- **真正的护城河** —— 纯英文 YAML 的竞品没法补做。双语是结构性的。

## 文化故事很重要

Mandate 建立在一个已经存在于两个文明的隐喻之上：帝国官僚制。中国唐明两朝以现代企业层级同构的原则运转。御史台正是独立审查组织该有的样子。翰林院正是史官职能的形态。

通过双语命名，Mandate 致敬两个文明的组织智慧——并赋予两边开发者比"CEO"或"皇帝"单独使用更丰富的心智模型。

## 机械实现

runtime 通过 `terms.yaml` 解析任何角色引用：

```typescript
function resolveRole(input: string): RoleId {
  // 'chancellor'  → 'chancellor'
  // '宰相'         → 'chancellor'
  // 'cancellarius'→ 'chancellor' (alias 命中时)
  return termsMap.canonicalize(input);
}
```

代码标识符保持英文（chancellor, censor）。面向用户的文本随 `MANDATE_LANG` 切换。文档把 `*.en.md` 与 `*.zh.md` 配对，CI lint 强制 heading 数对齐。这个系统能容忍不会两种语言的贡献者——他们只改一边，lint 标出漂移。

## 表层下是普适原则

更深的教训：当你项目的核心隐喻活在多个文化中，把它们都当作一等公民。你会得到更丰富的抽象、更广的受众、竞品结构上无法复制的护城河。Mandate 是这个原则的一个应用。你的下一个项目也可能是。

---

*接下来读 [SPEC](../specs/2026-05-01-mandate-design.md)。*
