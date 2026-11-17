# ProxyRules - 代理规则集合

[![License](https://img.shields.io/github/license/SouthernHU/proxyRules)](https://github.com/SouthernHU/proxyRules/blob/main/LICENSE)
[![Stars](https://img.shields.io/github/stars/SouthernHU/proxyRules)](https://github.com/SouthernHU/proxyRules/stargazers)

代理规则集合，包含 Clash Verge 分流脚本、广告规则和代理组配置。QuantumultX 部分尚未完成。

## ⚠️ 重要提示

> Clash Verge 规则统一维护在 `rules/`，使用 `globalScript_clashVerge_classical.js`。旧 domain 版本已移除，原使用者需切换脚本。

> **QuantumultX 规则尚未完成**  
> QuantumultX 相关的规则和重写配置还在完善中,暂不建议使用.  
> **目前推荐使用 Clash Verge 配合 classical 脚本**.

## 📋 目录

- [特性](#-特性)
- [快速开始](#-快速开始)
  - [Clash Verge 使用方法](#clash-verge-推荐)
  - [QuantumultX (不推荐)](#quantumultx-不推荐)
- [Clash Verge 使用指南](#-clash-verge-使用指南)
- [规则说明](#-规则说明)
- [代理组说明](#-代理组说明)

## ✨ 特性

- 🚀 **智能分流** - 基于域名和 IP 的精准分流规则
- 🛡️ **广告拦截** - 高效的广告和追踪拦截规则
- 🤖 **AI 服务支持** - ChatGPT 等 AI 服务的专用规则
- 🎬 **流媒体解锁** - 支持主流海外流媒体平台
- ⚡ **负载均衡** - 多种负载均衡策略可选
- 🔄 **自动更新** - 规则自动定期更新

## 🚀 快速开始

### Clash Verge (推荐)

1. **复制脚本内容**

访问脚本地址并复制全部内容:

```
https://raw.githubusercontent.com/SouthernHU/proxyRules/main/globalScript_clashVerge_classical.js
```

2. **粘贴到 Clash Verge**

在 Clash Verge 中:
- 打开 **订阅** 页面
- 找到 **全局扩展脚本** 选项
- **右键点击** → 选择 **编辑文件**
- 将复制的脚本内容完整粘贴替换到编辑器中
- 保存文件

3. **重启配置**

保存后重新加载配置即可生效.

> ⚠️ **注意**: Clash Verge 的全局扩展脚本不支持订阅功能,必须手动复制粘贴.

远程规则列表由 Mihomo 每 30 分钟更新。代理组、脚本逻辑有变化时，仍需重新粘贴脚本。

### QuantumultX (不推荐)

> ⚠️ **暂不建议使用**: QuantumultX 相关规则尚未完善,建议使用 Clash Verge.

<details>
<summary>点击展开 QuantumultX 配置说明(未完成)</summary>

1. **添加规则订阅**

在 QuantumultX 配置文件的 `[filter_remote]` 部分添加:

```ini
# 国内常用域名
https://raw.githubusercontent.com/SouthernHU/proxyRules/main/QuantumultX/Rules/ChinaDomainLite.list, tag=国内常用, force-policy=direct, enabled=true

# 海外常用域名
https://raw.githubusercontent.com/SouthernHU/proxyRules/main/QuantumultX/Rules/GFWLite.list, tag=海外常用, force-policy=proxy, enabled=true

# GPT 服务
https://raw.githubusercontent.com/SouthernHU/proxyRules/main/QuantumultX/Rules/GPTs.list, tag=GPT服务, force-policy=proxy, enabled=true
```

2. **添加重写规则**

在 `[rewrite_remote]` 部分添加所需的重写规则,例如:

```ini
# 去广告
https://raw.githubusercontent.com/SouthernHU/proxyRules/main/QuantumultX/Rewrite/StartUpAds.conf, tag=开屏广告, enabled=true
https://raw.githubusercontent.com/SouthernHU/proxyRules/main/QuantumultX/Rewrite/bilibili.conf, tag=哔哩哔哩, enabled=true
```

</details>

## 📖 Clash Verge 使用指南

### 脚本类型选择

| 脚本类型 | 文件名 | 状态 | 推荐 |
|---------|--------|------|------|
| **Classical** | `globalScript_clashVerge_classical.js` | ✅ 持续维护 | ⭐⭐⭐⭐⭐ |

### 配置说明

脚本负责生成 DNS、完整代理组、规则源和基础规则。Merge 通过专用字段提供附加内容，避免与生成字段重名。TUN、节点源等其他字段继续保留。

- `Merge.yaml` 是附加节点模板；`prepend-proxies` 由脚本读取并加入订阅节点。
- `script-group-settings` 为 Ai优选 和 ProxySeller前置提供 `use`、`filter`；通用自动组及国家组的节点范围由脚本统一生成。
- `script-prepend-rules` 中的规则放在 Claude、Ai 之后，其他基础规则之前，按列表顺序匹配。
- 以上专用字段会在脚本处理后移除，不交给内核。不要在 Merge 中重复定义脚本生成的 DNS、`proxy-groups`、`rule-providers` 和 `rules`。
- 从旧配置迁移时，将用来提供 `use`/`filter` 的 `proxy-groups` 改名为 `script-group-settings`，将自定义 `rules` 改名为 `script-prepend-rules`；Merge 和脚本需要一起更新。
- `ruleProviders` 定义下载源，`rules` 定义分流目标和匹配顺序。
- 所有规则下载地址均为完整的 GitHub raw 链接，粘贴到 Clash Verge 后不依赖本仓库的本地路径。
- 规则源的 `path` 是 Mihomo 的本地缓存位置，不是下载地址。

#### DNS 配置
- 国内 DNS: `119.29.29.29`, `180.184.1.1`
- 国外 DNS: `tls://8.8.8.8`, `tls://1.1.1.1`, `tls://9.9.9.9`
- 默认加密 DNS 使用 DoT；国内及指定服务域名使用单独的 DNS。
- 私有域名使用系统 DNS；代理节点域名使用 `foreignDNS`。

#### 规则集
- **Academic** - 学术网站
- **Apple** - Apple 服务，使用外部规则源
- **GFW_ACL4SSR** - 外部海外规则补充
- **ChinaDomainLite** - 国内常用域名(精简版)
- **GFWLite** - 海外常用域名(精简版)
- **GFWMedia** - 海外流媒体专用
- **GFWPatch** - 海外完整规则补充
- **Ai** - AI 服务(ChatGPT、Claude 等)
- **Claude** - Claude 官方服务及部分遥测域名；TCP 使用 `Claude` 手动选择组，UDP 拒绝
- **ADBlocking** - 广告拦截规则

仓库另有 `Microsoft.list`，当前脚本未加载。

## 🎯 代理组说明

### 核心代理组

| 代理组 | 类型 | 说明 |
|-------|------|------|
| **Ai** | select | 手动选择 AI 服务使用的节点组；候选项包含 `ProxySeller`、自动选点和负载均衡组 |
| **Claude** | select | 选择 `ProxySeller`，或选择 `Ai` 跟随通用 AI 分组；首次加载默认选择 `ProxySeller` |
| **ProxySeller** | select | 从独立节点源使用 `ProxySeller-ISP`，由节点源指定前置代理；未配置该节点时仅提供 `REJECT`；不参与通用自动选点 |
| **Ai优选** | load-balance | 使用 `consistent-hashing` 分配连接；可供专用出口中转，缺少允许的节点时使用 `REJECT` |
| **学术网站** | select | 手动选择 `SchoolComputers`、直连或哈希负载均衡 |
| **国内常用** | select | 手动选择直连或哈希负载均衡 |
| **海外常用** | fallback | 按候选顺序使用可用项，允许故障转移；候选项包含负载均衡和地区分组 |
| **海外流媒体** | fallback | 按候选顺序使用可用项，允许故障转移；该组本身不执行负载均衡 |
| **海外完整** | fallback | 按候选顺序使用可用项，允许故障转移 |
| **全局拦截** | select | 手动选择拒绝连接或直连 |

### 辅助代理组

| 代理组 | 类型 | 说明 |
|-------|------|------|
| **节点选择** | url-test | 根据测速自动选择，候选项包含公共 provider 节点及负载均衡、延迟选优、故障转移组 |
| **延迟选优** | url-test | 在公共 provider 节点中根据测速自动选择，并采用设置的延迟切换容差 |
| **故障转移** | fallback | 在公共 provider 节点中按顺序使用可用项，允许故障转移 |
| **负载均衡(哈希)** | load-balance | 使用 `consistent-hashing` 策略分配连接 |
| **负载均衡(轮询)** | load-balance | 使用 `round-robin` 策略分配连接 |
| **美国节点** | url-test | 按节点名称筛选美国节点，再根据测速自动选择 |
| **日本节点** | url-test | 按节点名称筛选日本节点，再根据测速自动选择 |
| **新加坡节点** | url-test | 按节点名称筛选新加坡节点，再根据测速自动选择 |

`ProxySeller-ISP` 默认使用 `dialer-proxy: DIRECT`，即本机直接连接 ISP，目标网站仍经 ISP 出口访问。需要机场中转时，可将该字段改为可用代理组的名称。

`select` 只表示该层由用户手动选择候选项。如果选中的是自动选点、故障转移或负载均衡子组，子组仍按自身策略运行，因此不代表实际出口节点固定。

## 📁 规则说明

### Clash Verge 规则集 (rules)

```
rules/
├── Academic.list        # 学术网站规则
├── ADBlocking.list      # 广告拦截规则
├── Ai.list              # AI 服务规则(ChatGPT、Claude 等)
├── ChinaDomainLite.list # 国内常用域名(精简版)
├── Game.list            # 保留的游戏规则，当前脚本未加载
├── GFWLite.list         # 海外常用域名(精简版)
├── GFWMedia.list        # 海外流媒体规则
├── GFWPatch.list        # 海外规则补充
└── Microsoft.list       # Microsoft 服务规则
```

### QuantumultX 规则集

#### 分流规则 (Rules/)
```
QuantumultX/Rules/
├── ChinaDomainLite.list # 国内常用域名
├── GFWLite.list         # 海外常用域名
└── GPTs.list            # GPT 服务规则
```

#### 重写规则 (Rewrite/)
```
QuantumultX/Rewrite/
├── BaiduMap.conf        # 百度地图去广告
├── bilibili.conf        # 哔哩哔哩优化
├── Cainiao.conf         # 菜鸟去广告
├── CoolApk.conf         # 酷安去广告
├── Didi.conf            # 滴滴去广告
├── NeteaseMusic.conf    # 网易云音乐优化
├── StartUpAds.conf      # 开屏广告拦截
├── WeiboAds.conf        # 微博去广告
└── Xiaohongshu.conf     # 小红书去广告
```

## 🔧 自定义配置

### 修改 DNS 服务器

编辑 `globalScript_clashVerge_classical.js`:

```javascript
// 国内 DNS
const chinaDNS = ["119.29.29.29", "180.184.1.1"];

// 国外 DNS
const foreignDNS = ["tls://8.8.8.8", "tls://1.1.1.1", "tls://9.9.9.9"];
```

### 调整代理组

- `groupBaseOption` 提供公共参数；组内同名字段覆盖默认值。
- `regionGroupOption` 提供地区组参数；切换容差为 100 毫秒，检查间隔为 5 秒。
- 节点选择、延迟选优、故障转移、两个负载均衡组，以及美国、日本、新加坡组，统一使用输入配置中全部公共 `proxy-providers`；专用 `ProxySeller-ISP` 不纳入。
- 国家组的地区筛选条件由脚本维护，不需要在 Merge 中逐组配置 `use`。
- 没有公共 provider 时，以上八组使用当前订阅的直接节点；专用 ISP 节点仍排除，空组使用 `REJECT`。
- Ai优选 和 ProxySeller前置继续使用各自的专用设置，不跟随公共范围扩大。
- `overseasProxies` 是海外流媒体和海外完整的候选顺序；海外常用仍优先使用哈希组。
- `iconBase` 是公共图标地址前缀。
- 分流顺序为 Claude、Ai、Merge 附加规则、其他基础规则；界面中 Claude、Ai 位于最前，Ai优选、ProxySeller、ProxySeller前置位于美国节点上方。

### 添加自定义规则

在 `rules` 数组中添加。规则从上到下匹配，先匹配的规则优先；调整顺序会改变分流结果。

```javascript
const rules = [
  // 自定义规则
  "DOMAIN-SUFFIX,example.com,节点选择",
  // ... 其他规则
];
```

### 本地检查

使用 Node.js，无需安装依赖：

```powershell
node --check globalScript_clashVerge_classical.js
node --test tests/globalScript.test.cjs
```

测试覆盖地区组生成、节点源过滤、专用输入字段、规则优先级和 raw 下载地址；不验证网络连通性或实际出口。

## 📊 更新频率

- **规则更新**: 每 30 分钟自动更新一次
- **脚本维护**: 根据需求不定期更新
- **规则来源**: 综合多个优质规则源

## 🤝 贡献

欢迎提交 Issue 和 Pull Request!

### 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## ⚠️ 免责声明

本项目仅供学习交流使用,请勿用于商业用途.使用本规则集所产生的任何后果由使用者自行承担.

## 📝 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 🔗 相关链接

- [Clash Verge Rev](https://github.com/clash-verge-rev/clash-verge-rev)
- [QuantumultX](https://quantumult.app/)
- [ACL4SSR](https://github.com/ACL4SSR/ACL4SSR)

## 📮 联系方式

如有问题或建议,请通过以下方式联系:

- 提交 [Issue](https://github.com/SouthernHU/proxyRules/issues)
- 参与 [Discussions](https://github.com/SouthernHU/proxyRules/discussions)

---

⭐ 如果这个项目对你有帮助,请给个 Star 支持一下!
