(function($,cookies){

	var fundraisingProgressWrapper = $('.fundraising-progress-wrapper');
	
	if(fundraisingProgressWrapper.length){
		// don't show if we've hidden the bar within a day, or seen the bar more than five times in total
		if(cookies.get('fundraisingBar') || cookies.get('fundraisingBarCount')>5){
			return;
		}
		var fundraisingBarCount = cookies.get('fundraisingBarCount');
		fundraisingBarCount = parseInt(cookies.get('fundraisingBarCount'))+1 || 1;
		// count the number of times we've seen the fundraising bar
		cookies.set('fundraisingBarCount', fundraisingBarCount + "",{expires: 10})
		fundraisingProgressWrapper.hide();
	}

	var fundraisingProgressContent = $('.fundraising-progress-content');
	//var daysLeftDisplay = fundraisingProgressContent.find('.days-left');
	
	fundraisingProgressContent.hide();
	
	var fundraisingProgressBar = fundraisingProgressContent.find('.fundraising-progress-bar');
	

	var closeProgressBar = fundraisingProgressContent.find('.close-progress-bar');

	var body = $('body');

	var bodyPadding = parseInt(body.css('padding-top').replace('px',''));
	// handler for closing progress bar
	closeProgressBar.click(function(event){
		event.preventDefault();
		// set cookie to hide for a day
		cookies.set('fundraisingBar', "true", {expires: 1})
		fundraisingProgressWrapper.hide();
		body.removeAttr('style')
	})

	
	// calculate days remaining
	//daysLeft = daysLeft(daysLeftDisplay.attr('data-end-date'))
	//daysLeftDisplay.text(daysLeft + (daysLeft>1 ? " days" : " day") )
	
	// update progress bar on the fly
	$.get('https://api.centreforeffectivealtruism.org/v1/fundraising/progress',function(data){

		fundraisingProgressContent.show();

		if(fundraisingProgressWrapper.length){

		
			totalData = {
				donations: 0,
				difference: 0,
				target: 0,
				organisationname: 'Fundraising Progress (all CEA organisations)',
				organisationslug: 'total',
			} 
			$.each(data,function(index,org){
				totalData.donations += parseInt(org.donations);
				totalData.difference += parseInt(org.difference);
				totalData.target += parseInt(org.target);
			})
			totalData.progress = (totalData.donations / totalData.target * 100).toPrecision(2);
			updateProgressBar(fundraisingProgressBar,totalData);

			fundraisingProgressWrapper.show();
			body.attr('style','padding-top:' + (bodyPadding+fundraisingProgressWrapper.outerHeight() )+'px')


		} else {

			var clone = fundraisingProgressBar.clone();
			fundraisingProgressBar.remove();
			$.each(data,function(index,org){
				progressBar = clone.clone()
				updateProgressBar(progressBar,org);
				// add the bar to the DOM
				fundraisingProgressContent.append(progressBar)

			})

		}


	},'json')

	function updateProgressBar (progressBar, data){
		var orgName = progressBar.find('.organisation-name');
		var donatedBar = progressBar.find('.donated');
		var donatedAmount = progressBar.find('.donated-amount');
		var remainingBar = progressBar.find('.remaining');
		var remainingAmount = progressBar.find('.remaining-amount');
		var targetAmount = progressBar.find('.target-amount');
		// set org name
		if(data.organisationname == "Centre for Effective Altruism"){
			orgName.text(data.organisationname + " - Unrestricted")
		} else {
			orgName.text(data.organisationname)
		}
		// set donated bar
		donatedBar.width(data.progress + '%').addClass(data.organisationslug);
		donatedAmount.text(formatNumber(data.donations))
		// set remaining bar
		remainingBar.width( (100-data.progress) + '%')
		remainingAmount.text(formatNumber(data.difference))
		// set target
		targetAmount.text(formatNumber(data.target))
	}


	function daysLeft(endDate){
		var startDate = new Date;
		endDate = new Date(Date.parse(endDate));
		var oneDay = 24*60*60*1000;
		return Math.round(Math.abs((startDate.getTime() - endDate.getTime())/(oneDay)))
	}

	function formatNumber(x){
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",").split('.')[0];
	}
})(jQuery,Cookies)
