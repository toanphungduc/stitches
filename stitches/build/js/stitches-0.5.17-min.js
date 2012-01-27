(function(window,$,Modernizr){var S=window.Stitches=(function(){var defaults={jsdir:"js",prefix:"sprite",padding:10,dataURI:false};var _topics={};return{init:function($elem,config){S.settings=$.extend({},defaults,config);S.iconQueue=[];S.Page.$elem=$elem;S.sub("page.error",S.Page.errorHandler);S.sub("page.init.done",S.Page.fetchTemplates);S.sub("page.templates.done",S.Page.render);S.sub("page.render.done",S.checkAPIs);S.sub("page.apis.done",S.Page.bindDragAndDrop);S.sub("page.apis.done",S.Page.bindButtons);S.sub("page.apis.done",S.Page.bindCabinet);S.sub("page.apis.done",S.Page.bindOptions);S.sub("page.apis.done",S.Page.subscribe);S.sub("page.drop.done",S.File.queueFiles);S.sub("file.queue.done",S.File.queueIcons);S.sub("file.icon.done",S.Page.addIcon);S.sub("file.remove.done",S.Page.removeIcon);S.sub("file.unqueue",S.File.unqueueIcon);S.sub("file.unqueue.all",S.File.unqueueAllIcons);S.sub("sprite.generate",S.generateStitches);S.pub("page.init.done");},sub:function(topic,fn){var callbacks=_topics[topic]||$.Callbacks("stopOnFalse");if(fn){callbacks.add(fn);}_topics[topic]=callbacks;},unsub:function(topic,fn){var callbacks=_topics[topic];if(callbacks){callbacks.remove(fn);}},pub:function(topic){var callbacks=_topics[topic],args=Array.prototype.slice.call(arguments,1);if(callbacks){callbacks.fire.apply(callbacks,args);}},checkAPIs:function(){Modernizr.load([{test:typeof FileReader!=="undefined"&&Modernizr.draganddrop,nope:S.settings.jsdir+"/dropfile/dropfile.js"},{test:Modernizr.canvas,nope:S.settings.jsdir+"/flashcanvas/flashcanvas.js",complete:function(){if(typeof FileReader!=="undefined"&&Modernizr.draganddrop&&Modernizr.canvas){S.pub("page.apis.done");}else{S.pub("page.error",new Error("Required APIs are not present."));}}}]);},generateStitches:function(looseIcons){var placedIcons=S.positionImages(looseIcons);var sprite=S.makeStitches(placedIcons);var stylesheet=S.makeStylesheet(placedIcons,sprite);S.pub("sprite.generate.done",sprite,stylesheet);},positionImages:function(looseIcons){var placedIcons=[];$(looseIcons).each(function(idx,icon){icon.x=icon.y=0;icon.isPlaced=false;});looseIcons=looseIcons.sort(function(a,b){if(b.area===a.area){return b.name>a.name?1:-1;}else{return b.area-a.area;}});S.canvas=S.Icons.idealCanvas(looseIcons);S.Icons.placeIcons(looseIcons,placedIcons,S.canvas);S.Icons.cropCanvas(placedIcons,S.canvas);S.pub("sprite.position.done",placedIcons);return placedIcons;},makeStitches:function(placedIcons){var context,data;try{context=S.canvas.getContext("2d");$(placedIcons).each(function(idx,icon){context.drawImage(icon.image,icon.x,icon.y);});data=S.canvas.toDataURL("image/png");}catch(e){S.pub("page.error",e);}S.pub("sprite.image.done",data);return data;},makeStylesheet:function(placedIcons,sprite){placedIcons=placedIcons.sort(function(a,b){return a.name<b.name?-1:1;});var prefix=S.settings.prefix;var backgroundImage;if(S.settings.dataURI){backgroundImage=sprite;}else{backgroundImage="download.png";}var css=["."+prefix+" {","    background: url("+backgroundImage+") no-repeat;","}\n"];$(placedIcons).each(function(idx,icon){css=css.concat(["."+prefix+"-"+icon.name+" {","    width: "+icon.image.width+"px;","    height: "+icon.image.height+"px;","    background-position: -"+icon.x+"px -"+icon.y+"px;","}\n"]);});var data="data:text/plain,"+encodeURIComponent(css.join("\n"));S.pub("sprite.stylesheet.done",data);return data;},dataToObjectURL:function(dataURI){var dataParts=dataURI.split(",");var byteString;if(dataParts[0].indexOf("base64")>=0){byteString=atob(dataParts[1]);}else{byteString=unescape(dataParts[1]);}var mimeString=dataParts[0].split(":")[1].split(";")[0];var bl=byteString.length;var ab=new ArrayBuffer(bl);var ia=new Uint8Array(ab);var i;for(i=0;i<bl;i++){ia[i]=byteString.charCodeAt(i);}var blob=S.createBlob(ab,mimeString);var url=S.createObjectURL(blob);return url;},createBlob:function(arrayBuffer,mimeString){var BlobBuilder=BlobBuilder||WebKitBlobBuilder;if(!BlobBuilder){throw new Error("BlobBuilder is unsupported.");}var bb=new BlobBuilder();bb.append(arrayBuffer);return bb.getBlob(mimeString);},createObjectURL:function(file){if(window.URL&&window.URL.createObjectURL){return window.URL.createObjectURL(file);}if(window.webkitURL&&window.webkitURL.createObjectURL){return window.webkitURL.createObjectURL(file);}throw new Error("createObjectURL is unsupported.");}};})();})(window,jQuery,Modernizr);(function(window,Stitches,$){Stitches.Icons=(function(){var S=window.Stitches;var document=window.document;return{idealCanvas:function(icons){var maxW=0;var maxH=0;var area=0;$(icons).each(function(idx,icon){maxW=icon.width>maxW?icon.width:maxW;maxH=icon.height>maxH?icon.height:maxH;area+=icon.area;});var ideal=Math.ceil(Math.sqrt(area));var idealW=maxW>ideal?maxW:ideal;var idealH=maxH>ideal?maxH:ideal;var canvas=document.createElement("canvas");canvas.width=idealW;canvas.height=idealH;return canvas;},placeIcons:function(loose,placed,canvas){var i=0;while(loose.length&&i<10){$(loose).each(function(idx,icon){if(!icon.isPlaced){icon.isPlaced=S.Icons.placeIcon(icon,placed,canvas);}});i++;}for(i=0;i<loose.length;i++){if(loose[i].isPlaced){loose.splice(i);}}return true;},placeIcon:function(icon,placed,canvas){var i=0;while(i<2){for(var y=0;y<=canvas.height-icon.height;y++){for(var x=0;x<=canvas.width-icon.width;x++){icon.x=x;icon.y=y;var overlap=S.Icons.isOverlapped(icon,placed);if(!overlap){return true;}x=overlap.x+overlap.width;}y=overlap.y+overlap.height;}canvas.width+=icon.width;canvas.height+=icon.height;i++;}return false;},isOverlapped:function(icon,placed){var x1,x2,y1,y2;var intersect=[];var overlap=null;$(placed).each(function(idx,p){x1=(p.x<icon.x+icon.width);x2=(p.x+p.width>icon.x);y1=(p.y<icon.y+icon.height);y2=(p.y+p.height>icon.y);if(x1&&x2&&y1&&y2){intersect.push(p);}});if(intersect.length){overlap=intersect.pop();}else{placed.push(icon);}return overlap;},cropCanvas:function(placed,canvas){var w=0,h=0;$(placed).each(function(idx,icon){w=w>icon.x+icon.width?w:icon.x+icon.width;h=h>icon.y+icon.height?h:icon.y+icon.height;});canvas.width=w;canvas.height=h;}};})();})(window,Stitches,jQuery);(function(window,Stitches){Stitches.Icon=(function(){var S=window.Stitches;var guid=0;var nameCache={};var Icon=function(name,src,cb){var self=this;this.guid=guid++;this.name=S.Icon.getName(name);this.image=new Image();this.image.onload=function(){self.x=0;self.y=0;self.width=self.image.width+S.settings.padding;self.height=self.image.height+S.settings.padding;self.area=self.width*self.height;if(cb){cb(self);}};this.image.src=src;};Icon.getName=function(name){var i=1,fix;name=name.replace(/[\s.]+/gi,"-").replace(/[^a-z0-9\-]/gi,"_");if(nameCache[name]){do{fix=name+"-"+i++;}while(nameCache[fix]);name=fix;}nameCache[name]=true;return name;};Icon.clearNameCache=function(name){if(name){delete nameCache[name];}else{nameCache={};}};return Icon;})();})(window,Stitches);(function(){var cache={};Stitches.tmpl=function tmpl(str,data){var fn=!/\W/.test(str)?cache[str]=cache[str]||tmpl(document.getElementById(str).innerHTML):new Function("obj","var p=[],print=function(){p.push.apply(p,arguments);};with(obj){p.push('"+str.replace(/[\r\t\n]/g," ").split("<%").join("\t").replace(/((^|%>)[^\t]*)'/g,"$1\r").replace(/\t=(.*?)%>/g,"',$1,'").split("\t").join("');").split("%>").join("p.push('").split("\r").join("\\'")+"');}return p.join('');");return data?fn(data):fn;};})();(function(window,Stitches,$){Stitches.Page=(function(){var S=window.Stitches;var rendered=false;return{fetchTemplates:function(){return $.get(S.settings.jsdir+"/stitches.html",function(html){$("body").append(html);S.Page.templates={stitches:S.tmpl("stitches_tmpl"),icon:S.tmpl("stitches_icon_tmpl")};S.pub("page.templates.done");});},render:function(){var $div=$(S.Page.templates.stitches({}));$div.appendTo(S.Page.$elem);S.Page.$stitches=$(".stitches",S.Page.$elem);S.Page.$drawer=$(".drawer",S.Page.$elem);S.Page.$dropbox=$(".dropbox",S.Page.$elem);S.Page.$droplabel=$(".droplabel",S.Page.$elem);S.Page.$filelist=$(".filelist",S.Page.$elem);S.Page.$buttons=$(".buttons",S.Page.$elem);S.Page.buttons={$generate:$("a.generate",S.Page.$buttons),$clear:$("a.clear",S.Page.$buttons),$sprite:$("a.dlsprite",S.Page.$buttons),$stylesheet:$("a.dlstylesheet",S.Page.$buttons)};S.Page.$options=$(".options",S.Page.$elem);S.Page.inputs={$prefix:$("input[name=prefix]",S.Page.$options),$padding:$("input[name=padding]",S.Page.$options),$dataURI:$("input[name=dataURI]",S.Page.$options)};S.Page.inputs.$prefix.val(S.settings.prefix);S.Page.inputs.$padding.val(S.settings.padding);S.Page.inputs.$dataURI.filter("[value="+S.settings.dataURI+"]").attr("checked",true);rendered=true;S.pub("page.render.done");},errorHandler:function(e){if(rendered){S.Page.$droplabel.html("&times; "+e.message).addClass("error");}throw e;},subscribe:function(){var buttons=S.Page.buttons;var $droplabel=S.Page.$droplabel;S.sub("file.icon.done",function(icon){if(S.iconQueue.length===1){$droplabel.fadeOut("fast");buttons.$generate.removeClass("disabled");buttons.$clear.removeClass("disabled");}buttons.$sprite.addClass("disabled");buttons.$stylesheet.addClass("disabled");});S.sub("file.remove.done",function(icon){if(S.iconQueue.length<1){$droplabel.fadeIn("fast");buttons.$generate.addClass("disabled");buttons.$clear.addClass("disabled");}buttons.$sprite.addClass("disabled");buttons.$stylesheet.addClass("disabled");});S.sub("sprite.generate.done",function(sprite,stylesheet){var spriteURL;var stylesheetURL;try{spriteURL=S.dataToObjectURL(sprite);stylesheetURL=S.dataToObjectURL(stylesheet);sprite=spriteURL;stylesheet=stylesheetURL;}catch(e){}buttons.$sprite.attr("href",sprite).removeClass("disabled");buttons.$stylesheet.attr("href",stylesheet).removeClass("disabled");});},_noop:function(e){e.preventDefault();e.stopPropagation();},bindDragAndDrop:function(){var dropbox=S.Page.$dropbox.get(0);dropbox.addEventListener("dragenter",S.Page._dragStart,false);dropbox.addEventListener("dragleave",S.Page._dragStop,false);dropbox.addEventListener("dragexit",S.Page._dragStop,false);dropbox.addEventListener("dragover",S.Page._noop,false);dropbox.addEventListener("drop",S.Page._drop,false);},_dragStart:function(e){S.Page.$dropbox.addClass("dropping");},_dragStop:function(e){if($(e.target).parents(".dropbox").length===0){S.Page.$dropbox.removeClass("dropping");}},_drop:function(e){e.stopPropagation();e.preventDefault();S.Page.$dropbox.removeClass("dropping");var evt=e||window.event;var files=(evt.files||evt.dataTransfer.files);if(files.length>0){S.pub("page.drop.done",files);}},bindButtons:function(){var $elem=S.Page.$elem;$elem.delegate("a.disabled","click",S.Page._noop);$elem.delegate("a.generate","click",S.Page._generate);$elem.delegate("a.remove","click",S.Page._removeFile);$elem.delegate("a.clear","click",S.Page._removeAllFiles);},bindCabinet:function(){var $elem=S.Page.$elem;var $stitches=S.Page.$stitches;var $options=S.Page.$options;var $drawer=S.Page.$drawer;var $cabinet=$("form.cabinet",$drawer);var $input=$("input.files",$drawer);$stitches.hover(function(){$drawer.stop().animate({left:"-5px"},250);},function(){$drawer.stop().animate({left:"-125px"},250);});$input.bind("change",function(){if(this.files.length){S.pub("page.drop.done",this.files);}$cabinet.trigger("reset");});$drawer.delegate("a.open-options","click",function(){$options.fadeIn();});},bindOptions:function(){var $options=S.Page.$options;var buttons=S.Page.buttons;$options.delegate("a.close-options","click",function(){$options.fadeOut();});$options.delegate("input","change",function(){buttons.$sprite.addClass("disabled");buttons.$stylesheet.addClass("disabled");});$options.delegate("input[name=prefix]","change",function(){S.settings.prefix=S.Page.inputs.$prefix.val();});$options.delegate("input[name=padding]","change",function(){var padding=S.Page.inputs.$padding.val();S.settings.padding=+padding;S.Page.updateIconDimensions();});$options.delegate("input[name=dataURI]","change",function(){var dataURI=S.Page.inputs.$dataURI.filter(":checked").val();S.settings.dataURI=dataURI==="true"?true:false;});},_generate:function(e){S.pub("sprite.generate",[].concat(S.iconQueue));},_removeFile:function(e){var icon=$(this).parent("li").data("icon");S.pub("file.unqueue",icon);},_removeAllFiles:function(e){S.pub("file.unqueue.all");},addIcon:function(icon){$(S.Page.templates.icon(icon)).data("icon",icon).appendTo(S.Page.$filelist).fadeIn("fast");},removeIcon:function(icon){S.Page.$filelist.find("li").filter(function(){return $(this).data("icon")===icon;}).fadeOut("fast").remove();},updateIconDimensions:function(){var padding=S.settings.padding;$.each(S.iconQueue,function(i,icon){icon.width=icon.image.width+padding;icon.height=icon.image.height+padding;});}};})();})(window,Stitches,jQuery);(function(window,Stitches,$){Stitches.File=(function(){var S=window.Stitches;var readQueue=[];return{queueFiles:function(files){$.each(files,function(i,file){if(/jpeg|png|gif/.test(file.type)){readQueue.push(file);S.pub("file.queue.done",file);}});},queueIcons:function(){var file,reader;file=readQueue.shift();if(file){try{reader=new FileReader();reader.onloadend=function(e){var icon=new S.Icon(file.name,e.target.result);S.iconQueue.push(icon);S.pub("file.icon.done",icon);};reader.readAsDataURL(file);}catch(e){S.pub("page.error",e);}}},unqueueIcon:function(icon){S.iconQueue=$.grep(S.iconQueue,function(item){return item!==icon;});S.Icon.clearNameCache(icon.name);S.pub("file.remove.done",icon);},unqueueAllIcons:function(){$.each(S.iconQueue,function(i,icon){S.File.unqueueIcon(icon);});S.Icon.clearNameCache();}};})();})(window,Stitches,jQuery);