# GitHub 更新清单

## 需要同步的关键修改

### ✅ 已完成的修复

1. **复习页面数据库访问修复**
   - `app/review/page.tsx` - 完整功能版本
   - `out/review/index.html` - 修复数据库名称访问

2. **数据库架构修复**
   - 使用正确的数据库名称：`wordflashcard_${userId}` 和 `wordflashcard_shared`
   - 使用正确的数据库版本：版本5
   - 用户ID生成逻辑与 `cloudReadyStorage.ts` 一致

3. **启蒙词库优化**
   - `data/beginnerWordbank.ts` - 包含预生成的图片URL
   - `utils/themeWordbankManager.ts` - 支持快速模式导入

4. **翻译数据库扩展**
   - `utils/exampleGenerator.ts` - 扩展了翻译数据库，包含更多单词

5. **路径别名修复**
   - 所有文件中的 `@/` 路径别名已修复为相对路径
   - 支持静态导出部署

### 📋 需要检查的文件

- [ ] `app/page.tsx` - 主页面功能
- [ ] `app/manage/page.tsx` - 词汇管理页面
- [ ] `app/layout.tsx` - 布局文件
- [ ] `components/` - 所有组件文件
- [ ] `utils/` - 所有工具文件
- [ ] `data/` - 所有数据文件
- [ ] `types/index.ts` - 类型定义
- [ ] `next.config.js` - Next.js配置
- [ ] `netlify.toml` - Netlify配置
- [ ] `tsconfig.json` - TypeScript配置

### 🚀 部署配置

- [ ] `next.config.js` - 包含 `output: 'export'` 配置
- [ ] `netlify.toml` - 正确的构建配置
- [ ] `vercel.json` - Vercel配置（如果需要）

### 📝 更新说明

1. **数据库访问统一**：复习页面现在使用与词汇管理页面相同的数据库访问逻辑
2. **性能优化**：启蒙词库支持预生成图片URL，避免导入时的AI生成延迟
3. **翻译完善**：扩展了翻译数据库，减少占位符翻译
4. **部署兼容**：修复了所有路径问题，支持静态导出部署

### ⚠️ 注意事项

- 确保所有修改都已测试
- 检查是否有遗漏的文件
- 验证路径修复的完整性
- 确认数据库访问逻辑的一致性
