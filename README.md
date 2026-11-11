# ProxyRules - 代理规则集合

[![License](https://img.shields.io/github/license/SouthernHU/proxyRules)](https://github.com/SouthernHU/proxyRules/blob/main/LICENSE)
[![Stars](https://img.shields.io/github/stars/SouthernHU/proxyRules)](https://github.com/SouthernHU/proxyRules/stargazers)

一个精心维护的代理规则集合,支持 Clash Verge 和 QuantumultX,包含智能分流规则、广告拦截和多种代理策略配置.

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
- 🎮 **游戏优化** - 针对游戏流量的专属优化
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

脚本会自动配置以下内容:

#### DNS 配置
- 国内 DNS: `119.29.29.29`, `180.184.1.1`
- 国外 DNS: `tls://8.8.8.8`, `tls://1.1.1.1`, `tls://9.9.9.9`
- 支持 DoH/DoT 加密 DNS
- 智能 DNS 分流

#### 规则集
- **ChinaDomainLite** - 国内常用域名(精简版)
- **GFWLite** - 海外常用域名(精简版)
- **GFWMedia** - 海外流媒体专用
- **GFWPatch** - 海外完整规则补充
- **Ai** - AI 服务(ChatGPT、Claude 等)
- **Game** - 游戏相关规则
- **ADBlocking** - 广告拦截规则
- **Microsoft** - Microsoft 服务规则

## 🎯 代理组说明

### 核心代理组

| 代理组 | 类型 | 说明 |
|-------|------|------|
| **Ai** | select | 手动选择 AI 服务使用的节点组；候选项包含自动选点和负载均衡组 |
| **Ai优选** | select | Claude 官方服务直接使用的分组；手动选择允许的节点或 `REJECT`，不自动故障转移；缺少节点配置时仅保留 `REJECT` |
| **学术网站** | select | 手动选择 `SchoolComputers`、直连或哈希负载均衡 |
| **国内常用** | select | 手动选择直连或哈希负载均衡 |
| **海外常用** | fallback | 按候选顺序使用可用项，允许故障转移；候选项包含负载均衡和地区分组 |
| **海外流媒体** | fallback | 按候选顺序使用可用项，允许故障转移；该组本身不执行负载均衡 |
| **海外完整** | fallback | 按候选顺序使用可用项，允许故障转移 |
| **游戏** | url-test | 按节点名称筛选日本节点，再根据测速自动选择 |
| **全局拦截** | select | 手动选择拒绝连接或直连 |

### 辅助代理组

| 代理组 | 类型 | 说明 |
|-------|------|------|
| **节点选择** | url-test | 根据测速自动选择，候选项包含订阅节点及负载均衡、延迟选优、故障转移组 |
| **延迟选优** | url-test | 在当前订阅节点中根据测速自动选择，并采用设置的延迟切换容差 |
| **故障转移** | fallback | 在当前订阅节点中按顺序使用可用项，允许故障转移 |
| **负载均衡(哈希)** | load-balance | 使用 `consistent-hashing` 策略分配连接 |
| **负载均衡(轮询)** | load-balance | 使用 `round-robin` 策略分配连接 |
| **美国节点** | url-test | 按节点名称筛选美国节点，再根据测速自动选择 |
| **日本节点** | url-test | 按节点名称筛选日本节点，再根据测速自动选择 |
| **新加坡节点** | url-test | 按节点名称筛选新加坡节点，再根据测速自动选择 |
| **澳大利亚节点** | url-test | 按节点名称筛选澳大利亚节点，再根据测速自动选择 |

`select` 只表示该层由用户手动选择候选项。如果选中的是自动选点、故障转移或负载均衡子组，子组仍按自身策略运行，因此不代表实际出口节点固定。

## 📁 规则说明

### Clash Verge 规则集 (rules)

```
rules/
├── ADBlocking.list      # 广告拦截规则
├── Ai.list              # AI 服务规则(ChatGPT、Claude 等)
├── ChinaDomainLite.list # 国内常用域名(精简版)
├── Game.list            # 游戏相关规则
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

### 添加自定义规则

在 `rules` 数组中添加:

```javascript
const rules = [
  // 自定义规则
  "DOMAIN-SUFFIX,example.com,节点选择",
  // ... 其他规则
];
```

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
