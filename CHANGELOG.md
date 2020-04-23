# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.19.4](https://github.com/steedos/steedos-contracts-app/compare/v1.19.3...v1.19.4) (2020-04-23)

**Note:** Version bump only for package steedos-server





# 版本更新说明

v1.10.1

- [base.object对象增加字段company_ids](https://github.com/steedos/object-server/issues/170)
- [company 表允许手工关联组织](https://github.com/steedos/object-server/issues/175)
- [新增 notifications 标准对象](https://github.com/steedos/creator/issues/1287)
- [新增2个接口：/steedos/api/organizations， /steedos/api/space_users](https://github.com/steedos/creator/issues/1426)
- [modifyAllRecords/modifyCompanyRecords两个权限 一起配置的时候，取了modifyCompanyRecords的权限 #1425](https://github.com/steedos/creator/issues/1425)

v1.11.0

- [url 类型字段支持相对路径](https://github.com/steedos/creator/issues/1436)
- [列表右侧的过滤器中选人控件显示选中的值异常 #1434](https://github.com/steedos/creator/issues/1434)
- [个人信息详细记录界面，所属单位及所属部门值异常 #1432](https://github.com/steedos/creator/issues/1432)

v1.12.0

- [共享规则调整](https://github.com/steedos/object-server/issues/181)
- [新增通知中心](https://github.com/steedos/creator/issues/1287)
- [meteor datasource 的 object 提供三个函数 directUpdate, directInsert, directDelete](https://github.com/steedos/object-server/issues/169)
- [用户个人信息界面，编辑信息后不会立即更新到界面，需要刷新浏览器](https://github.com/steedos/creator/issues/1448)
- [除当前登录用户外，其他用户详细界面都是坏的](https://github.com/steedos/creator/issues/1447)
- [对象的关注功能](https://github.com/steedos/creator/issues/1441)

v1.12.5

- .object.yml新增relatedList属性
- 日历新增通知触发器
- 记录查看页面增加返回按钮
- 审批王 odata 数据类型可以配置链接, 用于指定点击选中项后，进入的详细页面
- 子表 master_detail 字段类型新增属性 sharing
- IE 11 访问报错

v1.16.0

- Permission Set 新增 owner ，可配置 uneditable_fields, unreadable_fields

v1.16.3

- Permission Set中 owner ，可配置 uneditable_related_list

v1.16.5

- apps 添加 methods 获取用户在当前工作区有权限的apps
