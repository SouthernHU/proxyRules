# ProxyRules：Claude Code 严格分流

本分支用于 Linux 虚拟机中的 Clash Verge / Mihomo。目标是固定 Claude Code 出口，并禁止代理失败后直连。

严格模式使用独立文件。不修改原有的 `README.md` 和 `Merge_template.yaml`。

## 分流行为

- 规则目标只有两个代理组：`ChinaDomainLite` 和 `ProxySeller-ISP`。
- `ChinaDomainLite` 组只包含 `DIRECT`；`ProxySeller-ISP` 组只包含 `ProxySeller-ISP-Node`。
- `ProxySeller-ISP-Node` 通过 `ProxySeller前置` 从 JMS 节点源手动选择前置节点。
- 第一条规则使用 `ChinaDomainLite` 规则源并交给同名代理组。
- 第二条规则 `MATCH,ProxySeller-ISP` 处理其余全部流量。
- 节点源只保留 `jms`。
- 不生成 `url-test`、`fallback` 或 `load-balance` 组，不提供 `DIRECT` 回退。
- 所选 JMS 节点或 ISP 连接超时时，当前连接失败。

## JMS → ISP 链路

1. 本机连接 `ProxySeller前置`。
2. `ProxySeller前置` 从 JMS 节点源中手动选择一个节点。
3. `ProxySeller-ISP-Node` 的 `dialer-proxy` 指向 `ProxySeller前置`。
4. `ProxySeller-ISP` 组只包含 `ProxySeller-ISP-Node`。
5. 目标域名经 JMS 到 ISP，再由 ISP 出口访问。

底层节点必须命名为 `ProxySeller-ISP-Node`，以免与 `ProxySeller-ISP` 代理组同名。脚本会删除 Merge 中的其他节点源，并拒绝生成缺少 ISP 节点、前置链路或 `jms` 的配置。

## 文件

- `globalScript_claudeCode_strict.js`：生成 DNS、`ChinaDomainLite` 代理组、`ProxySeller-ISP` 代理组、JMS 前置组和两条规则。
- `Merge_template_strict.yaml`：仅包含 JMS 节点源和 ISP 节点，不包含真实凭据。
- `tests/globalScript_claudeCode_strict.test.cjs`：检查节点源限制、规则顺序、DNS 策略和无效输入。

## 在 Linux 虚拟机中使用

1. 在 Clash Verge 中导入 JMS 订阅。
2. 打开全局扩展覆写配置，参考 `Merge_template_strict.yaml` 配置 JMS 节点源和 ISP 节点。
3. 打开全局扩展脚本，粘贴以下地址的完整内容：

   ```text
   https://raw.githubusercontent.com/SouthernHU/proxyRules/refs/heads/claude-code-strict/globalScript_claudeCode_strict.js
   ```

4. 保存并重新生成配置，确认运行模式为 `rule`。

只粘贴 `globalScript_claudeCode_strict.js`。不要粘贴 `tests/globalScript_claudeCode_strict.test.cjs`；测试文件使用 Node.js 的 `require`，Clash Verge 的脚本环境不支持该函数。

5. 在 `ProxySeller前置` 中选择一个 JMS 节点。
6. 启用系统代理；需要接管虚拟机全部流量时，启用 TUN。

不要把真实订阅地址、用户名或密码写入公开模板。

## 国内直连规则组

国内直连使用 `rules/ChinaDomainLite.list`，由脚本注册为 `ChinaDomainLite` 规则源：

```text
RULE-SET,ChinaDomainLite,ChinaDomainLite,no-resolve
```

该列表不只包含域名，还包含 `GEOIP,CN`、端口和部分 Apple、Microsoft、Steam 规则。需要严格限定为域名白名单时，应修改该列表。

DNS 对 `geosite:private` 使用系统解析，对 `geosite:cn` 使用国内 DNS。其他域名使用加密 DNS，并设置 `respect-rules: true`。

## 故障边界

严格分流只约束经过 Mihomo 的流量。Clash Verge 停止运行、程序绕过系统代理或 TUN、以及 `ChinaDomainLite` 直连，不由本脚本阻断。

如果要求虚拟机在代理不可用时完全无法访问外网，还需要在虚拟机或宿主机防火墙中限制绕过 Mihomo 的流量。本分支未配置该防火墙。

## 本地检查

需要 Node.js，不需要安装依赖：

```bash
node --check globalScript_claudeCode_strict.js
node --test tests/globalScript_claudeCode_strict.test.cjs
```

这些检查不验证订阅可用性、节点超时或实际出口 IP。