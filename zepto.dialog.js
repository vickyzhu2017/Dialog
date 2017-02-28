;(function(factory){
	if(typeof define === 'function' && define.amd){
		// AMD. Register as an anonymous module.
		define(['zepto'],factory);
	}
	else if(typeof define === 'function' && define.cmd){
		// CMD. Register as an anonymous module.
		define(function(require,exports,module){
			var $ = require('Zepto');
			var Dialog = factory($);
			module.exports = Dialog;
		});
	}else{
		// Browser globals
		factory(Zepto);
	}
}(function($){
	var Dialog = function(config){
		var _this_  = this;

		this.config = {
			// 弹窗类型 ok/warning/waiting/other
			type: null,
			// 弹窗位置 top/bottom/center
			winPos:'center',
			// 对话框宽度
			width: "auto",
			height: "auto",
			// 对话框的提示信息
			message: null,
			// 按钮配置
			buttons: [],
			// 弹出框延迟多久关闭,单位毫秒
			delay: null,
			// 延时关闭的回调
			delayCallback:null,
			// 对话框遮罩类名，多个类名仅支持空格或逗号连接
			maskClassName: null,
			// 对话框遮罩透明度
			maskOpacity: null,
			// 遮罩层点击关闭弹窗
			maskClose:true,
			// 遮罩层关闭的回调
			maskCloseCallback:null,
			// 是否启用动画
			effect: false
		}

		//默认参数拓展
		if(config && $.isPlainObject(config) && Object.keys(config).length){
			$.extend(this.config,config);
		}else{
			// 没有传递任何配置参数
			this.isConfig = true;
		}

		// console.log(this.config);

		// 创建基本的DOM
		this.body = $('body');
		// 创建遮罩层
		this.mask = $('<div class="g-dialog-container"></div>');
		// 创建弹出框
		this.win = $('<div class="dialog-window"></div>');
		// 创建弹出框 → 头部
		this.winHeader = $('<div class="dialog-header"></div>');
		// 创建弹窗框 → 提示信息
		this.winContent = $('<div class="dialog-content"></div>');
		// 创建弹出框 → 按钮组
		this.winFooter = $('<div class="dialog-footer"></div>');

		// 渲染Dom
		this.create();

	}

	// 工具函数
	var utils = {
		dealClassName: function(className){
			var _className = $.trim(className),
				_reg = /[^(\s|,)]+[\s|,]{1}[^(\s|,)]+/;

			if(_reg.test(_className)){
				if(_className.indexOf(',') > -1){
					_className =  _className.split(',');
				}else{
					_className =  _className.split(' ');
				}
			}
			return _className;
		},
		addClass: function($obj,className){
			if($.isArray(className)){
				for(var i = 0; i < className.length; i++){
					$obj.addClass(className[i]);
				}
			}else{
				$obj.addClass(className);
			}
		}
	}

	// 弹窗层级
	Dialog.index = 1000;

	Dialog.prototype = {
		// 创建弹窗
		create: function(){
			var _this_ = this,
				config = this.config,
				$mask = this.mask,
				$win = this.win,
				$header  = this.winHeader,
				$content = this.winContent,
				$footer = this.winFooter,
				$body = this.body;


			// 弹窗位置
			if(config.winPos){
				$mask.addClass(config.winPos)
			}

			// 增加弹窗层级
			Dialog.index++;
			$mask.css('zIndex',Dialog.index);

			// 点击遮罩层关闭弹窗
			if(config.maskClose){
				$mask.on('click',function(){
					_this_.close();
					config.maskCloseCallback && config.maskCloseCallback();
				});
			}

			$mask.append($win);
			$body.append($mask);

			// 如果没有传递任何配置参数，则为等待类型弹窗
			if(this.isConfig){
				// 设置默认弹窗配置
				$win.append($header.addClass('waiting'));

			}else{

				// 设置定制化弹窗配置
				if(config.type){
					$win.append($header.addClass(config.type));
				}

				if(config.width !== 'auto'){
					$win.width(config.width)
				}

				if(config.height !== 'auto'){
					$win.height(config.height);
				}

				if(config.maskOpacity){
					$mask.css({
						'backgroundColor':'rgba(0,0,0,'+config.maskOpacity+')'
					});
				}

				if(config.message && $.trim(config.message)){
					$win.append($content.html(config.message));
				}

				if($.isArray(config.buttons) && config.buttons.length !== 0){
					this.createButtons(config.buttons);
				}

				if(config.maskClassName){
					config.maskClassName = utils.dealClassName(config.maskClassName);
					utils.addClass($mask,config.maskClassName);
				}

				if(config.effect){
					_this_.animate('to'+ config.winPos);
				}

				if(config.delay && parseInt(config.delay) > 0){
					window.setTimeout(function(){
						_this_.close();
						config.delayCallback && config.delayCallback();
					}, config.delay);
				}

			}
		},
		// 按钮定制化
		createButtons: function(buttonArray){
			var _this_ = this,
				i = 0;
			$(buttonArray).each(function(){
				var _type = this.type ? this.type : '',
					_btnTxt = this.text ? this.text : '按钮'+(++i),
					_callback = this.callback ? this.callback : null;

				var $button = $('<button class="'+_type+'">'+_btnTxt+'</button>');

				_this_.win.append(_this_.winFooter.append($button));

				if(_callback && $.isFunction(_callback)){
					$button.on('click',function(e){
						e.stopPropagation();
						var _isClose = _callback();
						if(_isClose !== false){
							_this_.close();
						}
					});
				}else{
					$button.on('click',function(e){
						_this_.close();
					});
				}
			});
		},
		// 关闭弹窗
		close: function(){
			this.mask.remove();
		},
		// 动画函数
		animate: function(animationType){
			this.win.addClass(animationType);
		}
	}


	window.Dialog = Dialog;

	$.dialog = function(config){
		return new Dialog(config);
	}

}));
