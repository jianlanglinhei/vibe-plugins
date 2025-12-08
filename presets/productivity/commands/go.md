# O2 迭代跟车流程

## 步骤说明

1. **获取当前分支信息**
   - 使用 `git branch --show-current` 获取当前分支名称

2. **列出应用的进行中迭代**
   - 使用 `mcp_o2_get_app_iterations` 查询应用的迭代列表
   - 展示迭代名称、ID、版本等信息

3. **确认目标迭代**
   - 与用户确认需要跟车的迭代
   - 记录迭代 ID

4. **创建 Aone 工作项（如需要）**
   - 如果团队要求变更必须绑定工作项，使用 `mcp_coop_create_workitem` 创建任务
   - 记录工作项 ID

5. **创建 O2 变更**
   - 使用 `mcp_o2_add_app_change` 创建变更
   - 关联分支和 Aone 工作项

6. **绑定变更到迭代**
   - 使用 `mcp_o2_add_iteration_change` 将变更绑定到目标迭代
   - 完成跟车流程