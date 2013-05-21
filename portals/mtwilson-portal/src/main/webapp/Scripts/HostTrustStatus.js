var trustPolicyError = false;
var locationPolicyError = false;
//This variable will contains name of all VMWare Host type. 
var VMWareHost = [];
var VMWareHostLocation = [];

//Called on load of HostTrustStatus..jsp
$(function() {
	$('#mainTrustDetailsDiv').prepend(disabledDiv);
	sendJSONAjaxRequest(false, 'getData/getDashBoardData.html', null, populateHostTrustDetails, null);
	
});

//This function will create Host trust Status Table.
function populateHostTrustDetails(responsJSON) {
	$('#disabledDiv').remove();
	if (responsJSON.result) {
		$('#mainTrustDetailsDivHidden').show();
		populateHostTrustDataIntoTable(responsJSON.hostVo);
		//This statement will create pagination div based on the no_of_pages
		applyPagination('hostTrustPaginationDiv',responsJSON.noOfPages,fngetHostTrustNextPage,1);
	}else {
                if(responsJSON.noHosts) {
                    $('#hostTrustPaginationDiv').html('<span>'+getHTMLEscapedMessage(responsJSON.message)+'</span>');
                }else if(responsJSON.ResetPeer){  // CERT FIX
                    //fnOpenDialogWithYesNOButton("Do you want to update this hosts cert?", "Confirm", 280, 150, updatePeerCert, updatePeerCertNo);
                    $('#errorMessage').html('<span class="errorMessage">'+getHTMLEscapedMessage(responsJSON.message)+'</span>');
                }else{
                    $('#errorMessage').html('<span class="errorMessage">'+getHTMLEscapedMessage(responsJSON.message)+'</span>');
                }
	}
}

function updatePeerCert(responsJSON) {
    alert("updating cert now");
}

function updatePeerCertNo(responsJSON){}

/*This Function will create a trust status table based on the host list provided.*/
function populateHostTrustDataIntoTable(hostDetails) {
	var str = "";
		VMWareHost = [];
		VMWareHostLocation = [];
		for ( var item in hostDetails) {
			var classValue = null;
			if(item % 2 === 0){classValue='evenRow';}else{classValue='oddRow';}
			str+='<tr class="'+classValue+'" hostID="'+hostDetails[item].hostID+'" id="host_div_id_'+hostDetails[item].hostName.replace(/\./g,'_')+'">'+
                                                //'<td align="center" class="row1"><a onclick="fnColapse(this)" isColpase="true"><img class="imageClass" border="0" alt="-" src="images/plus.jpg"></a></td>'+
				'<td align="center" class="row1"><img class="imageClass" border="0" src="images/blank.jpg"></td>'+
				'<td class="row2">'+hostDetails[item].hostName+'</td>'+
				'<td align="center" class="row3"><img border="0" src="'+hostDetails[item].osName+'"></td>';
				var value = hostDetails[item].hypervisorName != "" ? '<img border="0" src="'+hostDetails[item].hypervisorName+'">' : '';
				str+='<td align="center" class="row4">'+value+'</td>';
				//TODO : 
				 // Loaction Policy 
				 //according to email on Fri 9/14/2012 10:21 AM
				  //Item: 5
				//To remove the location from main page commnet thr below line and un uncommnet the next line 
			    value = hostDetails[item].location != undefined ? hostDetails[item].location : "";
				//value="";
				str+='<td class="row5">'+value+'</td>'+
				'<td align="center" class="row6"><img border="0" src="'+hostDetails[item].biosStatus+'"></td>'+
				'<td align="center" class="row7"><img border="0" src="'+hostDetails[item].vmmStatus+'"></td>'+
				'<td align="center" class="row8"><img border="0" src="'+hostDetails[item].overAllStatus+'"></td>';
				/*if (!(hostDetails[item].overAllStatusBoolean)) {
					str+='<td class="rowHelp"><input type="image" onclick="showFailureReport(\''+hostDetails[item].hostName+'\')" src="images/helpicon.png" alt="Failure Report"></td>';
				}else {
					str+='<td class="rowHelp"></td>';
					
				}*/
				
				str+='<td class="row9">'+hostDetails[item].updatedOn+'</td>'+
				'<td nowrap align="center" class="row10"><input class="tableButton" type="button"  value="Refresh" onclick="fnUpdateTrustForHost(this)"></td>'+
				'<td align="center" class="row11"><a><img src="images/trust_assertion.png" onclick="fnGetTrustSamlDetails(\''+hostDetails[item].hostName+'\')"/></a></td>'+
			    '<td class="rowHelp"><input type="image" onclick="showFailureReport(\''+hostDetails[item].hostName+'\')" src="images/trust_report.png" alt="Failure Report"></td>'+
				'<td class="row12">';
				
				if(hostDetails[item].errorMessage != null){str+='<textarea class="textAreaBoxClass" cols="20" rows="2" readonly="readonly">'+hostDetails[item].errorMessage+'</textarea>';}
				str+='</td>'+
			'</tr>';
				
			str+='<tr style="display: none;">';
			if (hostDetails[item].vmm) {
				VMWareHost.push(hostDetails[item].hostName);
				VMWareHostLocation[hostDetails[item].hostName]=hostDetails[item].location;
				var hostName = hostDetails[item].hostName;
				hostName = hostName.replace(/\./g,'_');
				str+='<td class="'+classValue+'" colspan="13">'+
		             '<div class="subTableDiv" id="subDiv_'+hostName+'"overAll='+hostDetails[item].overAllStatusBoolean+'>'+
		             '<table width="100%" cellpadding="0" cellspacing="0">'+
		             '</table></div></td>';
			}else {
				str+='<td class="'+classValue+'" colspan="13">'+
					'<div class="subTableDiv" style="text-align: left;">This feature is currently not implemented.</div>'+
					'</td>';
			}
		}
		$('#mainTrustDetailsContent table').html(str);
}

function fnGetTrustSamlDetails(hostName) {
	window.open("getView/trustVerificationDetails.html?hostName="+hostName,"","location=0,menubar=0,status=1,scrollbars=1, width=700,height=600");
	//Window.open('getData/getHostTrustSatusForPageNo.html',hostName,'width=200,height=100');
}

function fngetHostTrustNextPage(pageNo) {
	$('#errorMessage').html('');
	$('#mainTrustDetailsDiv').prepend(disabledDiv);
	sendJSONAjaxRequest(false, 'getData/getHostTrustSatusForPageNo.html', "pageNo="+pageNo, fnUpdateTableForPage, null);
}

function fnUpdateTableForPage(responseJSON) {
	$('#disabledDiv').remove();
	if (responseJSON.result) {
		populateHostTrustDataIntoTable(responseJSON.hostVo);
	}else {
		$('#errorMessage').html(getHTMLEscapedMessage(responseJSON.message));
	}
}

function fnColapse(element){
	$('#errorMessage').html('');
	var isColpase =  $(element).attr('isColpase');
	
	$(element).parent().parent().next().toggle();
	if (isColpase == 'true') {
		$(element).html('<img border="0" src="images/minus.jpg">');
		$(element).attr('isColpase',false);
		var hostName = $(element).parent().parent().find('td:eq(1)').text();
		var hostID = $(element).parent().parent().attr('hostID');
		var div = $('#subDiv_'+hostName.replace(/\./g,'_'));
		if ($(div).html() != null) {
			$(div).find('table').html('<tr> <td> &nbsp;<img src="images/ajax-loader.gif" /></td></tr>');
			sendJSONAjaxRequest(false, 'getData/getVMwareSubGridData.html',"hostName="+hostName+"&hostID="+hostID , populateVMwareSubgridDetails, null,div,hostName,hostID);
		}
		
	}else {
		$(element).html('<img border="0" src="images/plus.jpg">');
		$(element).attr('isColpase',true);
	}
}

function populateVMwareSubgridDetails(responseJSON,div,hostName,hostID) {
	if(responseJSON.result){
		var list = responseJSON.VMsForHost;
		var str = '<tr style="color:White;background-color:#3A4F63;font-weight:bold;">'+
					'<th class="showVMHostrow1">VM Name</th>'+
					'<th class="showVMHostrow2">Trusted Host Policy</th>'+
					'<th class="showVMHostrow3">Location Compliance Policy</th>'+
					'<th class="showVMHostrow4">Status</th>'+
					'<th class="showVMHostrow5">Migrate To</th>'+
					'<th class="showVMHostrow6">Remark</th>'+
					'</tr>';
		for ( var item in list) {
			var vmName = list[item].vmName;
			var vmStatus = list[item].vmStatus == 1 ? true : false;
			var trustPolicy = list[item].trustedHostPolicy == 1 ? "checked=\"checked\"" : "";
			var locationPolicy = list[item].locationPolicy == 1 ? "checked=\"checked\"" : "";
			var classValue = null;
			if(item % 2 === 0){classValue='evenRow';}else{classValue='oddRow';}
			str+='<tr class="'+classValue+'" divID="'+$(div).attr('id')+'" hostName="'+hostName+'" vmStatus="'+vmStatus+'">'+
				'<td class="showVMHostrow1">'+vmName+'</td>';
				if (vmStatus) {
					str+='<td class="showVMHostrow2" align="center"><span><input type="checkbox" '+trustPolicy+' disabled="disabled"></span></td>'+
					'<td class="showVMHostrow3" align="center"><span><input type="checkbox" '+locationPolicy+'></span></td>'+
					'<td class="showVMHostrow4"><input class="tableButton" type="button" value="Stop" onclick="powerVMMachine(this,\''+hostName+'\',\''+vmName+'\',\''+hostID+'\','+false+')"/></td>';
				}else {
					str+='<td class="showVMHostrow2" align="center"><span><input type="checkbox" '+trustPolicy+'></span></td>'+
					'<td class="showVMHostrow3" align="center"><span><input type="checkbox" '+locationPolicy+'></span></td>'+
					'<td class="showVMHostrow4"><input class="tableButton" type="button" value="Start" onclick="powerVMMachine(this,\''+hostName+'\',\''+vmName+'\',\''+hostID+'\','+true+')"/></td>';
				}
				var tragetHostSelect_ID = 'tragetHostSelect_ID_'+hostName.replace(/\./g,'_')+'_'+list[item].id;
				str+='<td class="showVMHostrow4"><select id="'+tragetHostSelect_ID+'">';
				
				//This will populate name of all VmWare host type expected the one for which you are showing vms. 
				for ( var items in VMWareHost) {
					if (VMWareHost[items] != hostName) {
						str+='<option>'+VMWareHost[items]+'</option>';
					}
				}
				str+='</select><input type="button" value="Migrate" onclick="migrateVMToHost(this,\''+hostName+'\',\''+vmName+'\',\''+hostID+'\')">'+
				'</td><td class="showVMHostrow6">'+
				'<textarea readonly="readonly" rows="1" cols="20" class="textAreaBoxClass"></textarea>'+
				'</td></tr>';
		}
		$(div).find('table').html(str);
	}else{
		$(div).find('table').html('<tr><td align="left">'+getHTMLEscapedMessage(responseJSON.message)+'</td></tr>');
	}
}

//This function will send a request to server to ON/OFF a VM.
function powerVMMachine(element,hostName,vmName,hostID,isPowerON) {
	$('#errorMessage').html('');
        $(element).parent().parent().find('textarea').val('');
        var trustStatus = $(element).parent().parent().find('td:eq(1)').find('input:checkbox').attr('checked');
        trustStatus = trustStatus == 'checked' ? 1 : 0;
        var locationStatus = $(element).parent().parent().find('td:eq(2)').find('input:checkbox').attr('checked');
        locationStatus = locationStatus == 'checked' ? 1 : 0;
        if(checkTrustOnlyCurrentHost(element)){
            var str;
            if (isPowerON) {
                    str='<input class="tableButton" type="button" value="Stop" onclick="powerVMMachine(this,\''+hostName+'\',\''+vmName+'\',\''+hostID+'\','+false+')"/>';
            }else {
                    str='<input class="tableButton" type="button" value="Start" onclick="powerVMMachine(this,\''+hostName+'\',\''+vmName+'\',\''+hostID+'\','+true+')"/>';
            }
            
            var data = "hostName="+hostName+"&hostID="+hostID+"&vmName="+vmName+"&isPowerON="+isPowerON+"&trustPolicy="+trustStatus+"&locationPloicy="+locationStatus;
            //var div = $('#subDiv_'+hostName.replace(/\./g,'_'));
            $('#mainTrustDetailsDiv').prepend(disabledDiv);
            sendJSONAjaxRequest(false, 'getData/powerOnOffVM.html', data, powerOperationSuccess, null,vmName,isPowerON,element,str);
        }
	
}

function powerOperationSuccess(responsJSON,vmName,isPowerOn,element,inpurString) {
	$('#disabledDiv').remove();
	if (responsJSON.result) {
		if (isPowerOn) {
			$(element).parent().parent().find('td:eq(1)').find('input:checkbox').attr('disabled','disabled');
			$(element).parent().parent().find('textarea').val('Started');
                        $(element).parent().parent().attr('vmstatus','true');
		}else {
			$(element).parent().parent().find('td:eq(1)').find('input:checkbox').removeAttr('disabled');
			$(element).parent().parent().find('textarea').val('Stopped');
			$(element).parent().parent().attr('vmstatus','false');
		}
		$(element).parent().html(inpurString);
	}else {
		$(element).parent().parent().find('textarea').val(responsJSON.message);
	}
}

function migrateVMToHost(element,hostName,vmName,hostID) {
    var constrains = checkConstrains(element);
    if (constrains){
	var hostToTransfer = $(element).parent().find('select').val();
        if(confirm("Are you sure you want to migrate this VM to "+hostToTransfer+" ?")){
         $('#errorMessage').html('');
	$('#mainTrustDetailsDiv').prepend(disabledDiv);
        //var vmID = $(element).parent().parent().attr('vmid');
        var trustStatus = $(element).parent().parent().find('td:eq(1)').find('input:checkbox').attr('checked');
        trustStatus = trustStatus == 'checked' ? 1 : 0;
        var locationStatus = $(element).parent().parent().find('td:eq(2)').find('input:checkbox').attr('checked');
        locationStatus = locationStatus == 'checked' ? 1 : 0;
        var targetHosthostID = $('#host_div_id_'+hostToTransfer.replace(/\./g,'_')).attr('hostid');
	var data = "hostToTransfer="+hostToTransfer+"&sourceHost="+hostName+"&hostID="+hostID+"&vmName="+vmName+"&trustPolicy="+trustStatus+"&locationPloicy="+locationStatus+"&targetHosthostID="+targetHosthostID;
	sendJSONAjaxRequest(false, 'getData/migrateVMToHost.html', data, migrateVMToHostSuccess, null,vmName,hostToTransfer,element);
        }
    }
}

function migrateVMToHostSuccess(responseJSON,vmName,hostToTransfer,element) {
	$('#disabledDiv').remove();
	if (responseJSON.result) {
		var table = $(element).parent().parent().parent();
		$(element).parent().parent().remove();
		if ($(table).find('tr').size() == 1) {
			$(table).html('<div class="subDivMessage">Host currently does not have any virtual machines configured.</div>');
		}
		$('#errorMessage').html('<div class="successMessage">'+vmName+' virtual machine is successfully Migrated to '+hostToTransfer+'.</div>');
	}else {
		$(element).parent().parent().find('textarea').val(responseJSON.message);
	}
}


//function fnCheckTrustPolicy(element,status) {
//	var div = $('#'+$(element).attr('divID'));
//	if (status) {
//              var sourceHost = $(element).attr('hostName');
//                var targetHost = $('#tragetHostSelect_ID_'+sourceHost.replace(/\./g,'_')).val();
//                var targethostTrust = $('#subDiv_'+targetHost.replace(/\./g,'_')).attr('overAll');
//                
//		if ($(div).attr('overAll') == 'true' && targethostTrust == 'true') {
//			trustPolicyError = false;
//			$(element).parent().parent().parent().find('td:eq(3)').find('input:button').removeAttr('disabled');
//			if (!locationPolicyError) {
//				$(element).parent().parent().parent().find('td:eq(4)').find('input:button').removeAttr('disabled');
//			}
//			$(element).parent().parent().parent().find('td:eq(5)').find('textarea').val('');
//		}else {
//			trustPolicyError = true;
//			$(element).parent().parent().parent().find('input:button').attr('disabled','disabled');
//			$(element).parent().parent().parent().find('td:eq(5)').find('textarea').val('Trust Policy Can not be applied. VM is running on Un-trusted Host or Target Host is Un-trusted.');
//		}
//	}else {
//		trustPolicyError = false;
//		$(element).parent().parent().parent().find('td:eq(3)').find('input:button').removeAttr('disabled');
//		if (!locationPolicyError) {
//			$(element).parent().parent().parent().find('td:eq(4)').find('input:button').removeAttr('disabled');
//		}
//		$(element).parent().parent().parent().find('td:eq(5)').find('textarea').val('');
//	}
//}

//function fnCheckLocationPolicy(element,status) {
//	if (status) {
//		var sourceHost = $(element).attr('hostName');
//		var targetHost = $('#tragetHostSelect_ID_'+sourceHost.replace(/\./g,'_')).val();
//		if (VMWareHostLocation[sourceHost] == VMWareHostLocation[targetHost]) {
//			locationPolicyError = false;
//			if (!trustPolicyError) {
//                            $(element).parent().parent().parent().find('td:eq(4)').find('input:button').removeAttr('disabled');
//                            $(element).parent().parent().parent().find('td:eq(5)').find('textarea').val('');
//			}
//		}else {
//			locationPolicyError = true;
//                        if (!trustPolicyError) {
//                            $(element).parent().parent().parent().find('td:eq(4)').find('input:button').attr('disabled','disabled');
//        		$(element).parent().parent().parent().find('td:eq(5)').find('textarea').val('<li>Location Policy Can not be applied. Target host is running at diffrent Location.</li>');
//                        }
//		}
//	}else {
//		locationPolicyError = false;
//		if (!trustPolicyError) {
//                    $(element).parent().parent().parent().find('td:eq(4)').find('input:button').removeAttr('disabled');
//                    $(element).parent().parent().parent().find('td:eq(5)').find('textarea').val('');
//		}
//	}
//}

function checkConstrains(element){
   $(element).parent().parent().find('td:eq(5)').find('textarea').val('');
   var trustPolicy = checkTrustConstrains(element);
    if(trustPolicy){
        if(checkLocationConstrains(element)){
            if($(element).parent().parent().attr('vmStatus') == 'false'){
            $(element).parent().parent().find('td:eq(5)').find('textarea').val('VM is powered off, Migration will not happen.');
            return false; 
            }
        }else{
            $(element).parent().parent().find('td:eq(5)').find('textarea').val('Location Policy Can not be applied. Target host is running at diffrent Location.');
            return false;
        }
    }else{
        return false;
    }
    
    return true;
    
}

function checkTrustConstrains(element){
    var status = $(element).parent().parent().find('td:eq(1)').find('input:checkbox').attr('checked');
    if(status == 'checked'){
        var div = $('#'+$(element).parent().parent().attr('divID'));
       // var sourceHost = $(element).parent().parent().attr('hostName');
        var targetHost = $(element).parent().parent().find('select').val();
        var targethostTrust = $('#subDiv_'+targetHost.replace(/\./g,'_')).attr('overall');
        var trustPL ;
        if(($(div).attr('overall') == 'true' && targethostTrust == 'true')){
            trustPL = true;
        }else {
            $(element).parent().parent().find('td:eq(5)').find('textarea').val('Cannot migrate the VM since the target host does not satisfy the trust policy.');
            trustPL = false;
        }
    return trustPL;
    }else{
        return true;
    }
}

function checkTrustOnlyCurrentHost(element){
    var status = $(element).parent().parent().find('td:eq(1)').find('input:checkbox').attr('checked');
    if(status == 'checked'){
        var div = $('#'+$(element).parent().parent().attr('divID'));
        var trustPL ;
        if($(div).attr('overall') == 'true'){
            trustPL = true;
        }else {
            $(element).parent().parent().find('td:eq(5)').find('textarea').val('Trust policy cannot be applied as the VM is placed on a non-trusted host.');
            trustPL = false;
        }
    return trustPL;
    }else{
        return true;
    }
}


// This Function is to aplly location policy for migration , to remove the location policy return always true  "according to email on Fri 9/14/2012 10:21 AM"
function checkLocationConstrains(element){
    var status = $(element).parent().parent().find('td:eq(2)').find('input:checkbox').attr('checked');
    if(status == 'checked'){
        var sourceHost = $(element).parent().parent().attr('hostName');
        var targetHost = $(element).parent().parent().find('select').val();
        var locationPL ;
        if(VMWareHostLocation[sourceHost] == VMWareHostLocation[targetHost]){locationPL  = true;}else{locationPL = false;}
        return locationPL ;
    }else{
        return true;
    }
	
	//return true;
}


//function to open popup, and show Failure Attestation Report
function showFailureReport(hostName) {
	var str = '<div id="showFailureReportTable" class="failureReportdiv"></div>';
	/* Soni_Begin_27/09/2012_Changing thetitle of pop window from "Failure Report for to Trust Report for  */
    //fnOpenDialog(str,"Failure report for "+ hostName, 950, 600,false);
	fnOpenDialog(str,"Trust Report", 950, 600,false);
    /* Soni_Begin_27/09/2012_Changing thetitle of pop window from "Failure Report for to Trust Report for  */
    
    $('#showFailureReportTable').prepend(disabledDiv);
    sendJSONAjaxRequest(false, 'getData/getFailurereportForHost.html',"hostName="+hostName , getFailureReportSuccess, null);
}


function byProperty(property) {
    return function (a,b) {
        return (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
    }
}

function getFailureReportSuccess(responseJSON) {
	$('#disabledDiv').remove();
	if(responseJSON.result){
        var reportdata = responseJSON.reportdata;
        var str ="";
        str+='<div class="tableDisplay"><table width="100%" cellpadding="0" cellspacing="0">'+
              '<thead><tr>'+
              '<th class="failureReportRow1"></th>'+
              '<th class="failureReportRow2">PCR Name</th>'+
              '<th class="failureReportRow3">PCR Value</th>'+
              '<th class="failureReportRow4">WhiteList Value</th>'+
              '</tr></thead></table></div>';
          
          str+='<div class="" style="overflow: auto;">'+
              '<table width="100%" cellpadding="0" cellspacing="0"><tbody>';
          
          var classValue = null;
          
          // PCRs should be ordered. issue #460 
          reportdata.sort(byProperty("name")); // name is PCR Name
          
        for(var item in reportdata){
			if(item % 2 === 0){classValue='evenRow';}else{classValue='oddRow';}
			var styleUntrusted = reportdata[item].trustStatus == 0 ? "color:red;" : "";
            str+='<tr class="'+classValue+'">'+
                        '<td align="center" class="failureReportRow1"><a isColpase="true" onclick="fnColapseFailReport(this)"><img class="imageClass" border="0" alt="-" src="images/plus.jpg"></a></td>'+            	
            	'<td class="failureReportRow2">'+reportdata[item].name+'</td>'+
                '<td class="failureReportRow3" style="'+styleUntrusted+'" >'+reportdata[item].value+'</td>'+
                '<td class="failureReportRow4" >'+reportdata[item].whiteListValue+'</td>'+
                '</tr>';
            
            var moduleLog = reportdata[item].moduleLogs;
            str+='<tr style="display: none;">';
            if (moduleLog.length > 0) {
    			str+='<td class="'+classValue+'" colspan="4">'+
    	             '<div class="subTableDivFailureReport" >'+
    	             '<table width="100%" cellpadding="0" cellspacing="0">'+
    	             '<thead><tr>'+
    	              '<th class="failureReportSubRow1">Component Name</th>'+
    	              '<th class="failureReportSubRow2">Value</th>'+
    	              '<th class="failureReportSubRow3">WhiteList Value</th>'+
    	              '</tr></thead>';
    			
    			for(var logs in moduleLog){
    				var logclass = null;
    				if(logs % 2 === 0){logclass='evenRow';}else{logclass='oddRow';}
    				styleUntrusted = moduleLog[logs].trustStatus == 0 ? "color:red;" : "";
    	            str+='<tr class="'+logclass+'">'+
    	                '<td class="failureReportSubRow1" name="mleName">'+moduleLog[logs].componentName+'</td>'+
    	                '<td class="failureReportSubRow2" name="mleName" style="'+styleUntrusted+'" >'+moduleLog[logs].value+'</td>'+
    	                '<td class="failureReportSubRow3" name="mleName">'+moduleLog[logs].whitelistValue+'</td>'+
    	                '</tr>';
    	        }
    			
    			str+='</table></div>';
    			
            }else {
    			str+='<td class="'+classValue+'" colspan="4">'+
    				'<div class="subTableDiv" style="text-align: left;">This PCR does not have any Module Logs.</div></td>';
			}
            str+="</tr>";
        }
       
        str+='</tbody> </table></div>';
        $('#showFailureReportTable').html('<div>'+str+'</div>');
    }else{
        $('#showFailureReportTable').html('<div class="errorMessage">'+responseJSON.message+'</div>');
    }
}

function fnColapseFailReport(element) {
	var isColpase =  $(element).attr('isColpase');
	
	$(element).parent().parent().next().toggle();
	if (isColpase == 'true') {
		$(element).html('<img border="0" src="images/minus.jpg">');
		$(element).attr('isColpase',false);
		
	}else {
		$(element).html('<img border="0" src="images/plus.jpg">');
		$(element).attr('isColpase',true);
	}
}

//This function is used to get Trust Status for single Host. Called on click of refresh button.
function fnUpdateTrustForHost(element) {
	$('#errorMessage').html("");
	var row = $(element).parent().parent();
	var hostName = $.trim($(row).find('td:eq(1)').text());
	$(element).attr('value','Updating');
	row.find('td:eq(12)').html('<img border="0" src="images/ajax-loader.gif">');
	sendJSONAjaxRequest(false, 'getData/getHostTrustStatus.html', "hostName="+hostName, updateTrustStatusSuccess, null,element,hostName);
}

function updateTrustStatusSuccess(response,element,host) {
	$(element).attr('value','Refresh');
	var row = $(element).parent().parent();
	if (response.result) {
		row.find('td:eq(5)').html('<img border="0" src="'+response.hostVo.biosStatus+'">');
		row.find('td:eq(6)').html('<img border="0" src="'+response.hostVo.vmmStatus+'">');
		row.find('td:eq(7)').html('<img border="0" src="'+response.hostVo.overAllStatus+'">');
		row.find('td:eq(8)').html(response.hostVo.updatedOn);
		if (response.hostVo.errorCode != 0) {
			row.find('td:eq(12)').html('<textarea class="textAreaBoxClass" cols="20" rows="2" readonly="readonly">'+response.hostVo.errorMessage+'</textarea>');
		}else{
			row.find('td:eq(12)').html('<textarea class="textAreaBoxClass" cols="20" rows="2" readonly="readonly">Host Trust status updated successfully.</textarea>');
		}
	}else {
		row.find('td:eq(12)').html('<textarea class="textAreaBoxClass" cols="20" rows="2" readonly="readonly">'+response.message+'</textarea>');
	}
}