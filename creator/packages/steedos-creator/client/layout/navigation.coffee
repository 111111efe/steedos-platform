computeObjects = (maxW, hasAppDashboard)->
	# 当导航字体相关样式变更时，应该变更该font变量，否则计算可能出现偏差
	font = '400 normal 13px -apple-system, system-ui, Helvetica, Arial, "Microsoft Yahei", SimHei'
	itemPaddingW = 24 # 每项的左右边距宽度
	tempNavItemLeftW = 10 # 每个临时项的左侧包含边距和星号图标在内的宽度
	tempNavItemRightW = 22 # 每个临时项的右侧包含边距和x图标在内的宽度
	tempNavItemExtraW = tempNavItemLeftW + tempNavItemRightW
	unless maxW
		maxW = $("body").width()
	leftAreaW = 120 #左侧应用区域宽度
	rightAreaW = 0 #右侧对象列表后面区域的宽度，目前没有内容，后续可能增加内容
	maxW = maxW - leftAreaW - rightAreaW
	if hasAppDashboard
		dashboardW = Creator.measureWidth(t("Home"), font) + itemPaddingW
		maxW = maxW - dashboardW
	mainW = 0
	objectNames = Creator.getAppObjectNames()
	currentObjectName = Session.get("object_name")
	hiddens = []
	visiables = []
	currentObjectHiddenIndex = -1
	objectNames?.forEach (item, index)->
		objItem = Creator.getObject(item)
		labelItem = objItem.label
		widthItem = Creator.measureWidth(labelItem, font) + itemPaddingW
		if mainW + widthItem >= maxW
			if objItem.name == currentObjectName
				currentObjectHiddenIndex = hiddens.length
			hiddens.push objItem
		else
			mainW += widthItem
			visiables.push objItem
	tempNavs = Creator.getTempNavs()
	tempNavs?.forEach (item, index)->
		if item.url
			objItem = item
		else
			objItem = _.clone Creator.getObject(item.name)
			objItem.is_temp = true
		labelItem = objItem.label
		widthItem = Creator.measureWidth(labelItem, font) + itemPaddingW
		widthItem += tempNavItemExtraW #临时导航栏项一定要额外加上左右多出来的宽度
		if mainW + widthItem >= maxW
			if objItem.name == currentObjectName
				currentObjectHiddenIndex = hiddens.length
			hiddens.push objItem
		else
			mainW += widthItem
			visiables.push objItem
	if hiddens.length
		# 如果有需要隐藏的项，则进一步计算加上“更多”项后的宽度情况，优化定义visiables、hiddens
		lastVisiableIndex = visiables.length - 1
		if currentObjectHiddenIndex > -1
			# 把currentObjectName对应的对象从hiddens中移除，并且重新追加到visiables尾部
			# visiables追加后不可以变更lastVisiableIndex值，因为后续增加“更多”按钮逻辑中，追加的项不可以重新移到hidden中
			objItem = hiddens[currentObjectHiddenIndex]
			labelItem = objItem.label
			widthItem = Creator.measureWidth(labelItem, font) + itemPaddingW
			if objItem.is_temp
				widthItem += tempNavItemExtraW #临时导航栏项一定要额外加上左右多出来的宽度
			mainW += widthItem
			visiables.push(hiddens.splice(currentObjectHiddenIndex,1)[0])

		hasHiddenTempNavs = !!hiddens.find (item)->
			return item.is_temp

		moreIconW = 22 #更多右侧的下拉箭头及其左侧多出的空格边距宽度
		moreW = Creator.measureWidth(t("更多"), font) + itemPaddingW + moreIconW
		if hasHiddenTempNavs
			moreW += tempNavItemLeftW #临时导航栏项一定要额外加上左侧多出来的宽度
		i = lastVisiableIndex
		while mainW + moreW > maxW and i > 0
			objItem = visiables[i]
			if objItem.name == currentObjectName
				# 为当前对象选项时不可以添加到隐藏对象菜单中，直接跳过即可
				i--
				continue
			labelItem = objItem.label
			widthItem = Creator.measureWidth(labelItem, font) + itemPaddingW
			mainW -= widthItem
			hiddens.unshift(visiables.splice(i,1)[0])
			i--
		
		# 再算一次hasHiddenTempNavs是因为上面“更多”项导航栏逻辑执行后hiddens可能有变化
		hasHiddenTempNavs = !!hiddens.find (item)->
			return item.is_temp
	return { visiables, hiddens, hasHiddenTempNavs }

Template.creatorNavigation.helpers Creator.helpers

Template.creatorNavigation.helpers
	
	app_id: ()->
		return Session.get("app_id")

	app_name: ()->
		app = Creator.getApp()
		unless app
			return ""
		return if app.label then t(app.label) else t(app.name)

	app_objects: ()->
		return Creator.getAppObjectNames()

	object_i: ()->
		return Creator.getObject(this)

	computed_objects: (hasAppDashboard)->
		maxW = Template.instance()?.containerWidth.get()
		return computeObjects(maxW, hasAppDashboard)

	object_class_name: (obj)->
		if Session.get("app_home_active")
			return ;
		isActive = obj.name == Session.get("object_name")
		if isActive and obj.url
			isActive = obj.url == Creator.getObjectUrl(obj.name, Session.get("record_id"))
		if isActive
			return "slds-is-active"

	object_url: ()->
		return this.url || Creator.getObjectUrl(String(this.name))

	spaces: ->
		return db.spaces.find();

	spaceName: ->
		if Session.get("spaceId")
			space = db.spaces.findOne(Session.get("spaceId"))
			if space
				return space.name
		return t("none_space_selected_title")

	spacesSwitcherVisible: ->
		return db.spaces.find().count()>1;

	displayName: ->
		if Meteor.user()
			return Meteor.user().displayName()
		else
			return " "

	avatar: () ->
		return Meteor.user()?.avatar

	avatarURL: (avatar,w,h,fs) ->
		return Steedos.absoluteUrl("avatar/#{Meteor.userId()}?w=#{w}&h=#{h}&fs=#{fs}&avatar=#{avatar}");

	isNode: ()->
		return Steedos.isNode()
	
	hideObjects: ()->
		if Steedos.isMobile()
			return true
		app = Creator.getApp()
		if app and app._id == "admin"
			return true
		else
			return false
	hasAppDashboard: ()->
		if Steedos.isMobile()
			return false;
		return Creator.getAppDashboard() or Creator.getAppDashboardComponent()
	dashboard_url: ()->
		return Steedos.absoluteUrl("app/#{Session.get('app_id')}/home")
	dashboard_class_name: ()->
		if Session.get("app_home_active")
			return "slds-is-active"

Template.creatorNavigation.events

	"click .switchSpace": ->
		Steedos.setSpaceId(this._id)
		# 获取路由路径中第一个单词，即根目录
		rootName = FlowRouter.current().path.split("/")[1]
		FlowRouter.go("/#{rootName}")

	'click .app-list-btn': (event)->
		Modal.show("creator_app_list_modal")
	
	'click .header-refresh': (event)->
		window.location.reload(true)

	'click .slds-context-bar__item>a': (event, template)->
		if this.name != Session.get("list_view_id")
			Session.set("grid_paging", null)

	'click .btn-close-nav': (event)->
		event.stopPropagation()
		event.preventDefault()
		Creator.removeTempNavItem(this.name, this.url)

Template.creatorNavigation.onCreated ->
	self = this
	self.containerWidth = new ReactiveVar()
	unless Steedos.isMobile()
		$(window).resize ->
			self.containerWidth.set($("body").width())
