/**
* Author: yangyipeng
* 投资UI视图层 2017/06/20.
*/
module game {
	export class InvestView extends BaseView{

		private img_close:eui.Image;
		private img_return:eui.Image;
		private img_return0:eui.Image;
		private lb_investDesc:eui.Label;
		private lb_vip:eui.Label;
		private bitmap_beishu:eui.BitmapLabel;
		private bitmap_gold:eui.BitmapLabel;
		private list_invest:eui.List;//投资列表
		private gp_buy:eui.Group;//投资按钮
		private lb_invest_time:eui.Label;//投资活动剩余时间
		private img_question:eui.Image;
		private scroller:eui.Scroller;

		private _intervalId:number = 0;
		private _eventId:number =0;
		public constructor(vo) {
			super(vo);
		}
		
		protected childrenCreated() {
            super.childrenCreated();
			this.img_close.addEventListener(egret.TouchEvent.TOUCH_TAP,this.closeWin,this);
			this.img_return.addEventListener(egret.TouchEvent.TOUCH_TAP,this.closeWin,this);
			this.img_question.addEventListener(egret.TouchEvent.TOUCH_TAP,this.question,this);
			this.gp_buy.addEventListener(egret.TouchEvent.TOUCH_TAP,this.buyInvest,this);
			this.scroller.verticalScrollBar.visible = false;
			this.scroller.verticalScrollBar.autoVisibility = false;

			this.list_invest.itemRenderer = InvestListItem;
		}
		
		private question():void
		{
			WinManager.getInstance().openPopWin(WinName.POP_INVEST_TIPS);
		}

		public closeWin():void{
			WinManager.getInstance().closeWin(this.winVo.winName);
		}
		/**
		 * 打开窗口(每次打开App.WinManager.openWin(WinName.BACKPACK);都会调用)
		 */
		public openWin(openParam: any = null): void {
			super.openWin(openParam);
			if(this._eventId ==0)
			{
				this._eventId = App.EventSystem.addEventListener(PanelNotify.INVEST_INFO_UPDATE,this.showInvestInfo,this);
			}

			this.initView();
		}


		private initView():void
		{
			var listData = (InvestModel.getInstance() as InvestModel).listData;
			if(listData)
			{
				//展示
				this.showInvestInfo();
			}else{
				//请求
				App.Socket.send(34001,{});
			}
		}

		private buyInvest():void
		{	
			if((InvestModel.getInstance() as InvestModel).isBuy) {
				App.GlobalTips.showTips("已购买投资!");
			}else {
				var vipLv:number = ConfigManager.getInstance().getConstConfigByType("INVEST_VIP")["value"];
				var costGold:number = ConfigManager.getInstance().getConstConfigByType("INVEST_GOLD")["value"];
				if(RoleManager.getInstance().roleInfo.vipLv >= vipLv && RoleManager.getInstance().roleWealthInfo.gold >= costGold) {
					App.Socket.send(34002,{});
				}else {
					App.GlobalTips.showTips("VIP等级或元宝不足!");
				}
			}
		}
		/**
		 * 展示投资页面信息
		 */
		private showInvestInfo():void
		{	
			this.bitmap_gold.text = ConfigManager.getInstance().getConstConfigByType("INVEST_GOLD")["value"];
			this.bitmap_beishu.text = ConfigManager.getInstance().getConstConfigByType("INVEST_MULTIPLE")["value"];
			this.lb_vip.text ="VIP" + ConfigManager.getInstance().getConstConfigByType("INVEST_VIP")["value"] + "以上可投资";
			if((InvestModel.getInstance() as InvestModel).leftTime > 0)
			{	
				this.lb_invest_time.text = "剩余时间：" + InvestUtil.getFormatBySecond1((InvestModel.getInstance() as InvestModel).leftTime);
				if(this._intervalId != 0) {
					clearInterval(this._intervalId);
					this._intervalId = 0;
				}
				if(this._intervalId == 0)
				{	
					var that = this;
					this._intervalId = setInterval(function() {
						var leftTime:number =(InvestModel.getInstance() as InvestModel).leftTime - new Date().getSeconds();
						if(leftTime <= 0)
						{
							leftTime = 0;
							clearInterval(this._intervalId);
							this._intervalId = 0;
						}
						that.lb_invest_time.text = "剩余时间：" + InvestUtil.getFormatBySecond1(leftTime);
					}, 1000);
				}
			}else {
				that.lb_invest_time.text = "剩余时间：" + InvestUtil.getFormatBySecond1(0);
				App.Socket.send(34001,{});
			}

			// if((InvestModel.getInstance() as InvestModel).isBuy)
			// {
			// 	this.btn_invest.currentState = "up";
			// }else
			// {
			// 	this.btn_invest.currentState = "down";
			// } 
			this.list_invest.dataProvider = (InvestModel.getInstance() as InvestModel).listData;
		}	

		/**
		 * 清理(每次关闭App.WinManager.closeWin(WinName.BACKPACK);都会调用)
		 */
		public clear(data: any = null): void {
			super.clear(data);
			if(this._eventId !=0)
			{
				App.EventSystem.removeEventListener(PanelNotify.INVEST_INFO_UPDATE,this._eventId);
				this._eventId = 0;
			}
			if(this._intervalId !=0)
			{
				clearInterval(this._intervalId);
				this._intervalId = 0;
			}
		}
		/**
		 * 销毁
		 */
		public destroy(): void {
			super.destroy();
		}
	}
}