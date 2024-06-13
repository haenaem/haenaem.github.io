"use strict"

var pagefirstload = false;
var submit_local_func = [];
var localdata = [];
var connectfailalert = false;
var ctr_init_func = [];
var connetionIP = "";



var new_version_count = 0;
var new_version_max_count = 3;
var new_version;
var mode = "auto";
var status_count = 0;
var mem_run = 0;
var write_run = 0;

var UPGRADE_NORMAL = 0;
var UPGRADE_FILE_WRITE = 1;
var UPGRADE_FILE_WRITING = 2;
var UPGRADE_FILE_WRITE_END = 3;
var UPGRADE_MEM_CLEAR = 4;
var UPGRADE_MEM_CLEARING = 5;
var UPGRADE_MEM_CLEAR_END = 6;
var UPGRADE_STARTED = 7;
var UPGRADE_CHECKING_FILE = 8;
var UPGRADE_INVALID_FILE = 9;
var UPGRADE_FILE_IS_GOOD = 10;
var UPGRADE_FLASH_WRITE_START = 11;
var UPGRADE_FLASH_WRITING = 12;
var UPGRADE_FLASH_WRITE_END = 13;
var UPGRADE_REBOOTING = 14;
var UPGRADE_SMALL_FILE = 15;

var AUTO_UPGRADE_START = 16;

var stopstatus_iux = false;
var SkipStatusdata = false;



function submit_local(rule_type, localdata, checking)
{
        submit_local_func[rule_type].call(this, localdata);
}

function submit_button_event_add(service_name)
{
	$('.'+service_name+'_div').find('input[type=button]').unbind('click').click(function(){submit_local(service_name)});
}

//auto mode
submit_local_func['auto_upgrade'] = function()
{
       	GConfirm(M_lang['S_FIRMWARE_POPUP_REBOOT'], M_lang['S_WARNNING'], M_lang['S_CONFIRM'], M_lang['S_CANCEL'], "auto_setup()");
};

//manual mode
submit_local_func['manual_upgrade'] = function()
{
	//file check
	if($('.firm_file').val()=='')
		GAlert(M_lang['S_NO_SELECTED_FILE'],M_lang['S_WARNNING'], M_lang['S_CONFIRM'],null,null,null,"");
	else
		GConfirm(M_lang['S_FIRMWARE_POPUP_REBOOT'], M_lang['S_WARNNING'], M_lang['S_CONFIRM'], M_lang['S_CANCEL'], "manual_setup()");	
};

function make_local_postdata(mode, version)
{
	localdata = [];
	switch(mode)
	{
		case 'auto':
		case 'manual':
			localdata.push({'name' : 'mode', 'value' : mode });
			localdata.push({'name' : 'ssmenu', 'value' : 'set' });
		break;

		case 'version_chk':
			localdata.push({'name' : 'version', 'value' : version });
			localdata.push({'name' : 'mode', 'value' : 'auto'});
			localdata.push({'name' : 'ssmenu', 'value' : 'set' });
		break;
	}
	return localdata;
}

function auto_setup(onlyUI)
{
	if(!onlyUI)
	{
		mem_run = 0;
		write_run = 0;
        	new_version = new_version.replace("\.", "_");
        	make_local_postdata('version_chk', new_version);
	
	        //1. ApplyCreate
		iux_submit('ApplyCreate', localdata, null, 'firmware', null, null, false);
	}

        //button disabled
        $('.auto_upgrade_div').find('input[type=button]').addClass('btn_disabled');
        $('.auto_upgrade_div').find('input[type=button]').attr('disabled', true);
        //radio disabled
        $('.g_radio').attr('disabled',true);
        $('.radio_div').css('opacity', '0.5');

        // make_msg('.auto_upgrade_div:eq(0)', 'S_FIRMUP_READY_MSG');	
        make_msg('.auto_upgrade_div:eq(0)', 'S_FIRM_MEMCLEAR');	

        StopStatus = false;
	//SkipStatusdata = true;
        //L_get_status(tmenu, smenu);
}

function manual_setup(onlyUI)
{
	if(!onlyUI)
	{
		mem_run = 0;
		write_run = 0;
		mode = 'manual';
		make_local_postdata(mode);
		iux_submit('ApplyMemClear', localdata, null, 'firmware', null, null, false);
		//L_fileform_submit();
	}
	
	//button disabled
	$('.file_div').css('pointer-events', 'none');
	$('.file_div').css('opacity', '0.5');
	$('.manual_upgrade_div').find('input[type=button]').addClass('btn_disabled');
	$('.manual_upgrade_div').find('input[type=button]').attr('disabled', true);

        //radio disabled
        $('.g_radio').attr('disabled',true);
        $('.radio_div').css('opacity', '0.5');

	make_msg('.m_upgrade_div', 'S_FIRMUP_READY_MSG');

        StopStatus = false;
	//SkipStatusdata = true;
        //L_get_status(tmenu, smenu);	
}


function L_Submit_Result(result)
{
	GPopup_Close();
	if(!isEmpty(result['result']) && result['result'].indexOf('ok') != -1){
		if(!isEmpty(result['service']) && result['service'].indexOf('ApplyCreate') >=0)
		{
			if(mode == 'auto')
			{
				SkipStatusdata = false;
			}
			else
			{
			}
				//run = 0;
				//StopStatus = false;
				//jiy1079
				//make_local_postdata(mode);
				//iux_submit('ApplyMemClear', localdata);
				//펌웨어 파일 업로드 중입니다.
				//업로드가 완료되었습니다.
			//}
			//else
			//{
			//	make_local_postdata(mode);
			//	Run_ApplyInitFirmware();
			//}			
			$('.firm_file').css('pointer-events', 'none');

		}else if(!isEmpty(result['service']) && result['service'].indexOf('ApplyMemClear') >=0)
		{
			if(mode == 'auto')
			{
			}
			else
			{
				SkipStatusdata = false;
			}
			//if(mode == 'auto')
			//if(mode == 'auto')
			//{
				//run = 0;
				//StopStatus = false;
				//make_local_postdata(mode);
				//Run_ApplyInitFirmware();
			//}
			//else
			//{
				//ApplyCreate & form data 전송
				//L_fileform_submit();
			//}

		}else if(!isEmpty(result['service']) && result['service'].indexOf('ApplyReboot') >=0)
		{
			//reboot_timer
			reboot_timer(50, true, true);
		}
	}else{
		if(!isEmpty(result['service']) && result['service'].indexOf('ApplyCreate') >=0)
		{
			if(mode == 'auto')
			{
				iux_submit('ApplyClear', localdata, null, 'firmware', null, null, false);

                                $('.version_check').text(M_lang['S_DOWNLOAD_FAIL_MSG1']);
                                $('.auto_upgrade_div').find('input[type=button]').removeClass('btn_disabled');
                                $('.auto_upgrade_div').find('input[type=button]').attr('disabled', false);
                                $('.g_radio').attr('disabled', false);
                                $('.radio_div').css('opacity', '1');
			}
			else
			{
				make_msg('.auto_upgrade_div:eq(0)', 'S_FIRMUP_FAIL_MSG', 'S_REBOOT_MSG');
				iux_submit('ApplyReboot', localdata, null, 'firmware', null, null, false);
				reboot_timer(50, true, true);
			}

		}else if(!isEmpty(result['service']) && (result['service'].indexOf('ApplyMemClear') >=0 || result['service'].indexOf('ApplyRun') >=0))
		{

			if(mode == 'auto')
				make_msg('.auto_upgrade_div:eq(0)', 'S_FIRMDOWN_FAIL_MSG', 'S_REBOOT_MSG');
			else
				make_msg('.m_upgrade_div', 'S_DOWNLOAD_FAIL_MSG2', 'S_REBOOT_MSG');
		
	
				iux_submit('ApplyReboot', localdata, null, 'firmware', null, null, false);
				reboot_timer(50, true, true);
		}

		StopStatus = true;

	}

}

function Run_ApplyInitFirmware()
{
	iux_submit('ApplyRun', localdata, null, 'firmware', null, null, false);
	GPopup_Close();
}

function CheckNewVersion()
{
	var txt = "";
	txt = parent.base_data.CAMINFO.Model.toUpperCase() + M_lang['S_FIRMUP_CHK_TRYING'];
	$('.version_check').text(txt);
	$('.version_check').prepend('<img src="/base/images/loading.gif" class="loading_img">');

	$('.auto_upgrade_div').find('input[type=button]').addClass('btn_disabled');
	$('.auto_upgrade_div').find('input[type=button]').attr('disabled', true);
	

	events.on( "status.get_newfirmware.done", GetNewVersion);
	new_version_count = 0;
	L_get_newfirmware(tmenu,smenu);
}

function GetNewVersion(result)
{
	events.off( "status.get_newfirmware.done");
	$('.loading_img').remove();

	var txt ="";	

	if(result.indexOf('succ') >= 0){

		var curr_version = msid('LB_CAMINFO_FIRM_VER').text();

		if(new_version > curr_version)
		{
			txt = M_lang['S_FIRMUP_CHK_FOUND_NEW_VERSION1'] + new_version + M_lang['S_FIRMUP_CHK_FOUND_NEW_VERSION2'];

			$('.auto_upgrade_div').find('input[type=button]').removeClass('btn_disabled');
		        $('.auto_upgrade_div').find('input[type=button]').attr('disabled', false);


		}else if(new_version <=curr_version)
		{
			txt = M_lang['S_FIRMUP_CHK_NO_NEED_UPDATE1'] + curr_version + M_lang['S_FIRMUP_CHK_NO_NEED_UPDATE2'];
		}

	}else{
		txt = "<span>"+M_lang['S_FIRMUP_CHK_FAILED1']+"</span><br style='display:block; margin:3px 0; line-height:20px; content:\"\";'><span class='text_title' style='color:#808080;'>"+M_lang['S_FIRMUP_CHK_FAILED2']+"</span>";
	}


	$('.version_check').html(txt);

	//Run_ApplyInitFirmware();	
}

function L_get_newfirmware(_tmenu, _smenu, _args, _retime)
{
        $.ajaxSetup({async : true, timeout : 10000, cache:false});
        var _data = [];
        _data.push({name : "tmenu", value : eval("_tmenu")});
        _data.push({name : "smenu", value : eval("_smenu")});
        _data.push({name : "ssmenu", value : "get"});
        _data.push({name : "act", value : "newfirmware"});
	$.getJSON('/cgi/firmware.cgi', _data)
       	.done(function(data)
       	{
		if(json_validate(data, '') == true)
		{
			new_version = data.NEWFIRMWARE.ver;
                	events.emit("status.get_newfirmware.done","succ");
		}
		else
		{
			if(new_version_count < new_version_max_count)
                        	L_get_newfirmware(_tmenu, _smenu);
			else
                		events.emit("status.get_newfirmware.done","fail");
		}
       	})
       	.fail(function(jqxhr, textStatus, error)
       	{
		if(new_version_count < new_version_max_count)
			L_get_newfirmware(_tmenu, _smenu);
		else
                	events.emit("status.get_newfirmware.done","fail");
       	})
	.always(function()
	{
		new_version_count++;
	});
}

function L_get_status(_tmenu, _smenu, _args, _retime)
{
	if(!StopStatus)
	{	
	        $.ajaxSetup({async : true, timeout : 10000, cache:false});
	        var _data = [];
	        _data.push({name : "tmenu", value : eval("_tmenu")});
	        _data.push({name : "smenu", value : eval("_smenu")});
        	_data.push({name : "ssmenu", value : "get"});
	        _data.push({name : "act", value : "status"});
		$.getJSON('/cgi/firmware.cgi', _data)
       		.done(function(data)
        	{
			if(!SkipStatusdata)
			{
				if(json_validate(data, '') == true)
				{
					status_data = data;
					if(pagefirstload)
						valid_update();
				}
                        	events.emit("status.update.done");
			}
        	})
        	.fail(function(jqxhr, textStatus, error)
        	{
       		})
        	.always(function()
        	{
        	        setTimeout(function()
        	        {
     				 L_get_status(_tmenu, _smenu,_retime);
                	},(_retime?_retime:3000));
        	});
	}
}

function L_fileform_submit()
{
	events.off("result.submit.done");
        events.on("result.submit.done", L_Submit_Result);

        var postData = new FormData($('#iux_file_form')[0]);
        postData.append("tmenu",tmenu);
        postData.append("smenu",smenu);
        postData.append("ssmenu","set");
	postData.append("mode", "manual");
        postData.append("service_name",'ApplyCreate');
        //window.scroll(0,0);
        //LoadingPopupSimple(M_lang['S_SETUP_PROCESSING']);
        $.ajax({
                url: '/cgi/firmware.cgi',
                processData: false,
                contentType: false,
                data: postData,
                timeout: 305000,
		type: 'POST',
                success: function(data){
                        //GPopup_Close();
                        if(data == 'fail'){
                                //GAlert(M_lang['S_SETUP_FAIL'], M_lang['S_ERROR'], M_lang['S_CONFIRM']);
                        }
                        else{
                                //events.emit("result.submit.done", {result:data,service:service_name});
                        }
                                events.emit("result.submit.done", {result:data,service:"ApplyCreate"});
                },
                error: function(){
                        //GPopup_Close();
                        //GAlert(M_lang['S_SETUP_FAIL'], M_lang['S_ERROR'], M_lang['S_CONFIRM']);
			events.emit("result.submit.done", {result:"fail", service:"ApplyCreate"});
                }
        });
}


function get_start_manualfirmup_status(_statusvalue)
{
	var div = (mode=='auto') ? '.auto_upgrade_div:eq(0)':'.m_upgrade_div';
	var statusvalue = parseInt(_statusvalue);

	if(statusvalue > 0)
		status_count ++;
	
 	if(status_count >= 105)
		statusvalue = UPGRADE_INVALID_FILE;
	
	if(statusvalue !=0){
		switch( Number(statusvalue) )
		{
			case UPGRADE_NORMAL: //0
				make_msg(div, 'S_FIRMUP_READY_MSG');
			break;
			case UPGRADE_FILE_WRITE: 
			case UPGRADE_FILE_WRITING:
				write_run = 0; 
				if(mode == 'auto')
					make_msg(div, 'S_FIRM_WRITE');
				else
					make_msg(div, 'S_FIRM_WRITE2');
			break;

			case UPGRADE_FILE_WRITE_END:
				if(write_run)	break;
				if(mode == 'auto')
				{
					make_local_postdata(mode);
					iux_submit('ApplyMemClear', localdata, null, 'firmware', null, null, false);
					make_msg(div, 'S_FIRM_WRITE_END');
				}
				else
				{
					make_local_postdata(mode);
					Run_ApplyInitFirmware();
					make_msg(div, 'S_FIRM_WRITE_END2');
				}
				write_run = 1; 
			break;
			
			case UPGRADE_MEM_CLEAR: 
			case UPGRADE_MEM_CLEARING:
				mem_run = 0; 
				make_msg(div, 'S_FIRM_MEMCLEAR');
				parent.g_session_stop = true;
			break;

			case UPGRADE_MEM_CLEAR_END:
				if(mem_run)	break;
				if(mode == 'auto')
                        	{
                        	        make_local_postdata(mode);
                        	        Run_ApplyInitFirmware();
                        	}
				else
					L_fileform_submit();
				mem_run = 1; 
				make_msg(div, 'S_FIRM_MEMCLEAR_END');
			break;
			
			case UPGRADE_STARTED: //7
				if(mode == 'auto') {
					StopStatus = true;
					parent.g_session_stop = true;

					make_msg(div, 'S_FIRM_MEMCLEAR');
					reboot_timer(30,true,false,true);
				}else {
					make_msg(div, "S_UPGRADE_CHECKING_FILE");
				}
			break;
			//case UPGRADE_FILE_WRITE_END://2
			case UPGRADE_CHECKING_FILE://3
				make_msg(div, 'S_UPGRADE_CHECKING_FILE');
			break;
        
			case UPGRADE_FILE_IS_GOOD://5
			case UPGRADE_FLASH_WRITE_START://6
			case UPGRADE_FLASH_WRITING://12
			case UPGRADE_FLASH_WRITE_END: //8
				make_msg(div, 'S_UPGRADE_FLASH_WRITE_START');
				StopStatus = true;
                                reboot_timer(150, true,false);
				parent.g_session_stop = true;
				//reboot_timer(30, true,false);	
				//StopStatus = true;
				//stopstatus_iux = true;
				//all_ctr_enable(false);
			break;
        
			case UPGRADE_INVALID_FILE://4
			case UPGRADE_SMALL_FILE://10
				//if( config_data.routerinfo.rebootForInvalidFile == "1" )
				//{
					make_msg(div, 'S_UPGRADE_INVALID_FILE1', 'S_UPGRADE_INVALID_FILE2');				
					StopStatus = true;
					reboot_timer(50, true, true);
					iux_submit('ApplyReboot', localdata, null, 'firmware', null, null, false);
					//stopstatus_iux = true;
				//}
			break;

			case AUTO_UPGRADE_START: //16
				make_msg(div, 'S_UPGRADE_FLASH_WRITE_START');
				StopStatus = true;
                                reboot_timer(180, true,false);
				parent.g_session_stop = true;
			break;
		}
	}

}

function make_msg(classname, msg1, msg2)
{
	var temp = "";
	if(!isEmpty(msg2)){
		temp = "<span class='text_title'>" + M_lang[msg1] + "</span><br>";
		//temp += "<span class='text_title'>" + M_lang[msg2] + "</span><br>";
		temp += "<span class='text_title'>"+M_lang[msg2]+"</span><span sid='TIMEOUT'></span><span class='loading_span'><img src='/camera/firmware/images/loading.gif'></span>";

	}else{
		temp = "<span class='text_title'>" + M_lang[msg1] + "</span>" + "<span class='text_title' sid='TIMEOUT'></span>" ;
		//if(msg2) temp += "<span class='text_title'>" + M_lang[msg2] + "</span>";

		temp +=	"<span class='loading_span'><img src='/camera/firmware/images/loading.gif'></span>";
	}	
	$(classname).html(temp);

}

function redirect()
{
	window.parent.location = "/login.cgi";
	//opener.parent.location.reload();
	window.location.reload();
}

function reboot_timer(remaining, rebootflag, invalidflag,forauto)
{
	
	//if(flag){
		if(remaining == 0){
			if(rebootflag){
				if(!invalidflag){
					if(forauto == true) {
						get_start_manualfirmup_status(AUTO_UPGRADE_START);
						return;
					}else {
						msid('TIMEOUT').text(M_lang['S_FIRMUP_COMPLETED']);
						GAlert(M_lang['S_UPGRADE_DONE'], M_lang['S_NOTICE'], M_lang['S_CONFIRM'],null,null,null,"redirect()");
					}
				}else
					redirect();
			}else{
				msid('TIMEOUT').text(M_lang['S_FIRMUP_COMPLETED']);
			}
				all_ctr_enable(true);
				msid('TIMEOUT').prevAll().remove();
				$('.loading_span').css('display', 'none');
		}else{
			if(rebootflag)
				msid('TIMEOUT').text(" ("+remaining+M_lang['S_MAIN_TIMELIMIT']+")");
			else
				msid('TIMEOUT').text(remaining+ M_lang['S_MAIN_TIMELIMIT']);

			remaining --;
			setTimeout("reboot_timer("+remaining+","+rebootflag+ "," + invalidflag + "," + forauto + ")",1000);
		}
	/*
	}else{
		if(remaining == 0){
			GAlert(M_lang['S_CAMERA_SYSTEM_SETUP_POPUP_REBOOT_MSG1'], M_lang['S_WARNNING'], M_lang['S_CONFIRM'],null,null,null,"redirect()");
		}else{
			$('[sid="REBOOT_MSG"]').text(M_lang['S_SETUP_PROCESSING']+" ("+M_lang['S_SETUP_REMAINING']+" : " + remaining+M_lang['S_SEC']+")");
			remaining --;
			setTimeout("reboot_timer("+remaining+")",1000);
		}
	}
	*/

}

function all_ctr_enable(flag){
	//버튼 컨트롤
	$('[sid^="S_BUTTON_"]').each(function(){
		if(flag){
			//$('.firm_file').removeAttr('disabled');
			$('.file_name').removeAttr('disabled');
			$(this).removeAttr('disabled');

			$('.file_name').removeClass('file_name_disabled');
			$(this).removeClass('btn_disabled');
		}else{
			//$('.firm_file').attr('disabled', 'true');
			$('.file_name').attr('disabled', 'true');
			$(this).attr('disabled', 'true');

			$('.file_name').addClass('file_name_disabled');
			$(this).addClass('btn_disabled');
		}
	});
}

function add_listener_local(){

	$('.g_radio').change(function(){

		var mode = $(this).attr('id');
		if(mode.indexOf('auto') >=0){
			$('.auto_mode').show();
			$('.manual_mode').hide();
			CheckNewVersion();
		}else{
			$('.auto_mode').hide();
			$('.manual_mode').show();
		}
	});
}

$(document).ready(function(){

	tmenu = "camera";
	smenu = "firmware";

	events.on("page.load.complete", L_init_Page_Load_Complete);
	C_iux_init(tmenu, smenu);
});

function L_init_Page_Load_Complete(){

	//UI 고정된 문자들을 불러옴.
	iux_update('S');
	//iux_update('B',caminfo_data);

	//버튼 이벤트
	//submit_button_event_add('init_firmware');
	submit_button_event_add('auto_upgrade');
	submit_button_event_add('manual_upgrade');

	//포커스 동작 관련 이벤트 등록
	makeFocusEvent();

	add_listener_local();

	StopStatus = false;
        L_get_status(tmenu, smenu);
	events.on( "status.update.done", StatusUpdate);

	
	events.on( "config.update.done", ConfigUpdate);
        get_config(tmenu, smenu);

	//현재 펌웨어 정보	
	iux_update_page("B");
	
	page_load_complated();
}
function ConfigUpdate(_event)
{
	if(!isEmpty(config_data))
	{
		if(Number(config_data.Firmware.Status) == 0)
		{
			CheckNewVersion();
			//$("#manual").click();
			//StopStatus = true;
		}
		else
		{
			if(Number(config_data.Firmware.Mode) == 0)
			{
				$("#auto").click();
				auto_setup(true);			
			}
			else
			{
				$("#manual").click();
				manual_setup(true);			
			}
		}
	}
}

function StatusUpdate(_event)
{
	iux_update("D",status_data);
	iux_update_page("D",status_data);
}

function page_load_complated()
{
	parent.g_session_flag = true;
	$("#page").trigger('resize');
	$("#page").show();
	GPopup_Close();
	//CheckNewVersion();
}

//들어온 json 값을 현재 페이지에 맞게 가공해서 적용해야할때
function iux_update_page(identifier, data)
{
	if(identifier == "D")
	{
		if(status_data.Firmware.Status != "")
			get_start_manualfirmup_status(status_data.Firmware.Status);	
		
	}
	else if(identifier == "B")
	{
		var date = "-";
		var version = "-";
		var firmware = parent.base_data.CAMINFO.Firmware;
		var start = firmware.indexOf("(");
		var end = firmware.indexOf(")");
		if(start > -1 && end > -1)
		{
			version = firmware.substring(0,start);
			if(isIE8())
				version= version.replace(" ","") 
			else
				version = version.trim();
			date = firmware.substring(start+1,end);
		}
		else
			version = caminfo_data.CAMINFO.Firmware;

        	$('[sid="LB_CAMINFO_FIRM_VER"]').html(version);
        	$('[sid="LB_CAMINFO_FIRM_DATE"]').html(date);
	}
}


//들어온 json 값을 그대로 적용가능할때.
function iux_update(identifier, data)
{
	$("[sid^='" + identifier + "_']").each(function()
	{
		var sid = $(this).attr("sid");	
		var tag = $(this).prop('tagName').toLowerCase();
		var type = $(this).attr("type");
		var l_sid_s = sid.split("_");
		
		if(identifier == "C")
		{
			if( $(this).hasClass("ip") || $(this).hasClass("mac") )
			{
				var getvalue = data[l_sid_s[VAL_ARTICLE]][l_sid_s[VAL_TAGNAME]];
				var value_s;
				if(!getvalue)
					var value_s = ["","","","","",""];
				else
				{
					if( $(this).hasClass("ip") )
					{
						var value_s = getvalue.split(".");
					}
					else if( $(this).hasClass("mac") )
						var value_s = getvalue.split("-");
						if(value_s.length == 1)
							value_s = getvalue.split(":");
				}
				var arraycount = value_s.length;
				if(arraycount > 0)
				{
					for(var i=0;i<arraycount;i++)
					{
						$('[sid="VALUE'+i+'"]', this).val(value_s[i]);
					}
				}
			}
			else
			{
				if(tag == "input")
				{
					switch(type)
					{
						case "radio":
						{

							if(data[l_sid_s[VAL_ARTICLE]][l_sid_s[VAL_TAGNAME]] == "auto" )
								$("#" + l_sid_s[2] + "_1").click();
							else if(data[l_sid_s[VAL_ARTICLE]][l_sid_s[VAL_TAGNAME]] == "day" )
								$("#" + l_sid_s[2] + "_2").click();
							else 
								$("#" + l_sid_s[2] + "_3").click();
								
						}
						break;

						case "text"   :
						case "hidden" :
						case "number" :
						case "password":
							var pholder = M_lang[("S_"+l_sid_s[VAL_ARTICLE]+"_"+l_sid_s[VAL_TAGNAME]).toUpperCase()];
							if(pholder)
								$('[sid="' + sid + '"]').attr('placeholder',pholder);
							if(typeof data[ l_sid_s[VAL_ARTICLE] ][l_sid_s[VAL_TAGNAME]] !== "object")
								$('[sid="' + sid + '"]').val(data[l_sid_s[VAL_ARTICLE]][l_sid_s[VAL_TAGNAME]]);
						break;
					}
				}else{ 
					if(tag == "span"){
                                                        if(typeof data[ l_sid_s[VAL_ARTICLE] ][l_sid_s[VAL_TAGNAME]] !== "object"){
								if(l_sid_s[VAL_TAGNAME] == 'UserPw'){
									var currpw = data[l_sid_s[VAL_ARTICLE]][l_sid_s[VAL_TAGNAME]];
									$('[sid="' + sid + '"]').text(convertPassword(currpw));
                                                                }else{
									$('[sid="' + sid + '"]').text(data[l_sid_s[VAL_ARTICLE]][l_sid_s[VAL_TAGNAME]]);
								}
							}

					}else{
						if(l_sid_s.length==4){
							$(this).find('select').val(data[l_sid_s[VAL_ARTICLE]][l_sid_s[VAL_TAGNAME]][l_sid_s[3]]);
						}else{
							if(l_sid_s[VAL_TAGNAME] == 'Lan')
								l_sid_s[VAL_TAGNAME] ='Language';

							//select box
							$(this).find('select').val(data[l_sid_s[VAL_ARTICLE]][l_sid_s[VAL_TAGNAME]]);
						}
					}
				}
			}
		}
		else if(identifier == "D")
		{
			if(tag == "span")
			{
				//if(typeof data[ l_sid_s[VAL_ARTICLE] ][l_sid_s[VAL_TAGNAME]] !== "object")
					$('[sid="' + sid + '"]').html(data[l_sid_s[VAL_ARTICLE]][l_sid_s[VAL_TAGNAME]]);
			}
		}
		else if(identifier == "B")
                {
                        if(tag == "span")
                        {
                                if(typeof data[ l_sid_s[VAL_ARTICLE] ][l_sid_s[VAL_TAGNAME]] !== "object")
                                        $('[sid="' + sid + '"]').html(data[l_sid_s[VAL_ARTICLE]][l_sid_s[VAL_TAGNAME]]);
                        }
                }
		else if(identifier == "S")
		{
			if(tag == "span" ||tag == "p" )
				$('[sid="' + sid + '"]').text(M_lang[sid]);
			else if(tag == "input"){
				//if(msid(sid).attr('type')=="text" || msid(sid).attr('type')=="button")
				
					msid(sid).val(M_lang[sid]);
			}
		}
	});
}

function fileUpload(fis){
	var str = fis.value;
	var filename = str.substring(str.lastIndexOf("\\")+1);
	msid('S_FIRMWARE_NAME').val(filename);

	if(str == 0)
		msid('S_FIRMWARE_NAME').val(M_lang['S_FIRMWARE_NAME']);
}



