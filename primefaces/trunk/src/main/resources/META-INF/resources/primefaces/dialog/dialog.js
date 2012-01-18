/**
 * PrimeFaces Dialog Widget
 */    
PrimeFaces.widget.Dialog = function(cfg) {
    this.cfg = cfg;
    this.id = this.cfg.id;
    this.jqId = PrimeFaces.escapeClientId(this.id);
    this.jq = $(this.jqId);
    this.content = this.jq.children('.ui-dialog-content');
    this.titlebar = this.jq.children('.ui-dialog-titlebar');
    this.footer = this.jq.find('.ui-dialog-footer');
    this.icons = this.titlebar.children('.ui-dialog-titlebar-icon');
    this.closeIcon = this.titlebar.children('.ui-dialog-titlebar-close');
    this.minimizeIcon = this.titlebar.children('.ui-dialog-titlebar-minimize');
    this.maximizeIcon = this.titlebar.children('.ui-dialog-titlebar-maximize');
    this.visible = false;
    this.blockEvents = 'focus.dialog mousedown.dialog mouseup.dialog keydown.dialog keypress.dialog click.dialog';
    this.onshowHandlers = [];
    
    //configuration
    this.cfg.width = this.cfg.width||'auto';
    if(this.cfg.width == 'auto' && $.browser.msie && parseInt($.browser.version, 10) == 7) {
        this.cfg.width = 300;
    }
    this.cfg.height = this.cfg.height||'auto';
    this.cfg.draggable = this.cfg.draggable == false ? false : true;
    this.cfg.resizable = this.cfg.resizable == false ? false : true;
    this.cfg.minWidth = this.cfg.minWidth||150;
    this.cfg.minHeight = this.cfg.minHeight||this.titlebar.outerHeight();
    this.cfg.position = this.cfg.position||'center';
    this.parent = this.jq.parent();
    
    //size
    this.jq.css({
        'width': this.cfg.width,
        'height': 'auto'
    });
    
    this.content.height(this.cfg.height);
    
    //events
    this.bindEvents();
    
    if(this.cfg.draggable) {
        this.setupDraggable();
    }
    
    if(this.cfg.resizable){
        this.setupResizable();
    }
    
    if(this.cfg.modal) {
        this.syncWindowResize();
    }
    
    if(this.cfg.appendToBody){
        this.jq.appendTo('body');
    }
        
    //docking zone
    if($(document.body).children('.ui-dialog-docking-zone').length == 0) {
        $(document.body).append('<div class="ui-dialog-docking-zone"></div>')
    }
        
    if(this.cfg.autoOpen){
        this.show();
    }
    
    this.jq.data('widget', this);
    
    this.postConstruct();
}

PrimeFaces.extend(PrimeFaces.widget.Dialog, PrimeFaces.widget.BaseWidget);

PrimeFaces.widget.Dialog.prototype.enableModality = function() {
    $(document.body).append('<div id="' + this.id + '_modal" class="ui-widget-overlay"></div>').
        children(this.jqId + '_modal').css({
            'width': $(document).width()
            ,'height': $(document).height()
            ,'z-index': this.jq.css('z-index') - 1
        });
    
    //disable tabbing out of modal dialog and stop events from targets outside of dialog
    this.content.bind('keypress.ui-dialog', function(event) {
        if(event.keyCode !== $.ui.keyCode.TAB) {
            return;
        }

        var tabbables = $(':tabbable', this),
            first = tabbables.filter(':first'),
            last  = tabbables.filter(':last');

        if (event.target === last[0] && !event.shiftKey) {
            first.focus(1);
            return false;
        } else if (event.target === first[0] && event.shiftKey) {
            last.focus(1);
            return false;
        }
    });
}

PrimeFaces.widget.Dialog.prototype.disableModality = function(){
    $(document.body).children(this.jqId + '_modal').remove();
    $(document).unbind(this.blockEvents).unbind('keydown.dialog');
}

PrimeFaces.widget.Dialog.prototype.syncWindowResize = function() {
    $(window).resize(function() {
        $(document.body).children('.ui-widget-overlay').css({
            'width': $(document).width()
            ,'height': $(document).height()
        });
    });
}

PrimeFaces.widget.Dialog.prototype.show = function() {
    if(this.visible) {
       return;
    }

    if(!this.loaded && this.cfg.dynamic) {
        this.loadContents();
    } 
    else {
        if(!this.positionInitialized) {
            this.initPosition();
        }
        
        this._show();
    }
}

PrimeFaces.widget.Dialog.prototype._show = function() {
    if(this.cfg.showEffect) {
        var _self = this;
            
        this.jq.show(this.cfg.showEffect, null, 'normal', function() {
            _self.postShow();
        });
    }    
    else {
        //display dialog
        this.jq.show();
        
        this.postShow();
    }
    
    this.focusFirstInput();
    this.visible = true;
    this.moveToTop();
    
    if(this.cfg.modal)
        this.enableModality();
}

PrimeFaces.widget.Dialog.prototype.postShow = function() {   
    //execute user defined callback
    if(this.cfg.onShow) {
        this.cfg.onShow.call(this);
    }
            
    //execute onshowHandlers and remove successful ones
    this.onshowHandlers = $.grep(this.onshowHandlers, function(fn) {
		return !fn.call();
	});
}

PrimeFaces.widget.Dialog.prototype.hide = function() {   
    if(!this.visible) {
       return;
    }

    if(this.cfg.hideEffect) {
        var _self = this;
    
        this.jq.hide(this.cfg.hideEffect, null, 'normal', function() {
            _self.onHide();
        });
    }
    else {
        this.jq.hide();
        
        this.onHide();
    }
    
    this.visible = false;
    
    if(this.cfg.modal)
        this.disableModality();
}

PrimeFaces.widget.Dialog.prototype.focusFirstInput = function() {
    this.jq.find(':not(:submit):not(:button):input:visible:enabled:first').focus();
}

PrimeFaces.widget.Dialog.prototype.bindEvents = function() {   
    var _self = this;
    
    this.jq.mousedown(function(){
        _self.moveToTop();
    });

    this.icons.mouseover(function() {
        $(this).addClass('ui-state-hover');
    }).mouseout(function() {
        $(this).removeClass('ui-state-hover');
    })
        
    this.closeIcon.click(function(e) {
        _self.hide();
        e.preventDefault();
    });
    
    this.maximizeIcon.click(function(e) {
        _self.toggleMaximize();
        e.preventDefault();
    });
    
    this.minimizeIcon.click(function(e) {
        _self.toggleMinimize();
        e.preventDefault();
    });
}

PrimeFaces.widget.Dialog.prototype.setupDraggable = function() {    
    this.jq.draggable({
        cancel: '.ui-dialog-content, .ui-dialog-titlebar-close',
        handle: '.ui-dialog-titlebar',
        containment : 'document'
    });
}

PrimeFaces.widget.Dialog.prototype.setupResizable = function() {
    var _self = this;
    
    this.jq.resizable({
        handles : 'n,s,e,w,ne,nw,se,sw',
        minWidth : this.cfg.minWidth,
        minHeight : this.cfg.minHeight,
        alsoResize : this.content,
        containment: 'document',
        start: function(event, ui) {
            _self.jq.data('offset', _self.jq.offset());
        },
        stop: function(event, ui) {
            var offset = _self.jq.data('offset')
            
            _self.jq.css('position', 'fixed');
            _self.jq.offset(offset);
        }
    });
    
    this.resizers = this.jq.children('.ui-resizable-handle');
}

PrimeFaces.widget.Dialog.prototype.initPosition = function() {
    //reset
    this.jq.css({'left':'0px','top':'0px'});
                
    if(/(center|left|top|right|bottom)/.test(this.cfg.position)) {
        this.cfg.position = this.cfg.position.replace(',', ' ');
        
        this.jq.position({
                    my: 'center'
                    ,at: this.cfg.position
                    ,of: window
                });
    }
    else {
        var coords = this.cfg.position.split(','),
        x = $.trim(coords[0]),
        y = $.trim(coords[1]);
        
        this.jq.css({
            'left': x + 'px' 
            ,'top': y + 'px'
        });
    }
    
    this.positionInitialized = true;
}

PrimeFaces.widget.Dialog.prototype.onHide = function(event, ui) {
    if(this.cfg.onHide) {
        this.cfg.onHide.call(this, event, ui);
    }

    if(this.cfg.behaviors) {
        var closeBehavior = this.cfg.behaviors['close'];

        if(closeBehavior) {
            closeBehavior.call(this);
        }
    }
}

PrimeFaces.widget.Dialog.prototype.moveToTop = function() {
    this.jq.css('z-index', ++PrimeFaces.zindex);
}

PrimeFaces.widget.Dialog.prototype.toggleMaximize = function() {
    if(this.minimized) {
        this.toggleMinimize();
    }
    
    if(this.maximized) {
        this.jq.removeClass('ui-dialog-maximized');
        this.restoreState();
                
        this.maximizeIcon.children('.ui-icon').removeClass('ui-icon-newwin').addClass('ui-icon-extlink');
        this.maximized = false;
    } 
    else {
        this.saveState();
        
        var win = $(window);
                
        this.jq.addClass('ui-dialog-maximized').css({
            'width': win.width() - 6
            ,'height': win.height()
           }).offset({
               top: win.scrollTop()
               ,left: win.scrollLeft()
           });
        
        //maximize content
        this.content.css({
            width: 'auto',
            height: 'auto'
        });
        
        this.maximizeIcon.removeClass('ui-state-hover').children('.ui-icon').removeClass('ui-icon-extlink').addClass('ui-icon-newwin');
        this.maximized = true;
    }
}

PrimeFaces.widget.Dialog.prototype.toggleMinimize = function() {
    var animate = true,
    dockingZone = $(document.body).children('.ui-dialog-docking-zone');
    
    if(this.maximized) {
        this.toggleMaximize();
        animate = false;
    }
    
    var _self = this;
    
    if(this.minimized) {
        this.jq.appendTo(this.parent).removeClass('ui-dialog-minimized').css({'position':'fixed', 'float':'none'});
        this.restoreState();
        this.content.show();
        this.minimizeIcon.removeClass('ui-state-hover').children('.ui-icon').removeClass('ui-icon-plus').addClass('ui-icon-minus');
        this.minimized = false;
        
        if(this.cfg.resizable)
            this.resizers.show();
    }
    else {
        this.saveState();
        
        if(animate) {
            this.jq.effect('transfer', {
                            to: dockingZone
                            ,className: 'ui-dialog-minimizing'
                            }, 500, 
                            function() {
                                _self.dock(dockingZone);
                                _self.jq.addClass('ui-dialog-minimized');
                            });
        } 
        else {
            this.dock(dockingZone);
        }
    }
}

PrimeFaces.widget.Dialog.prototype.dock = function(zone) {
    this.jq.appendTo(zone).css('position', 'static');
    this.jq.css({'height':'auto', 'width':'auto', 'float': 'left'});
    this.content.hide();
    this.minimizeIcon.removeClass('ui-state-hover').children('.ui-icon').removeClass('ui-icon-minus').addClass('ui-icon-plus');
    this.minimized = true;
    
    if(this.cfg.resizable)
        this.resizers.hide();
}

PrimeFaces.widget.Dialog.prototype.saveState = function() {
    this.state = {
        width: this.jq.width()
        ,height: this.jq.height()
    };
    
    var win = $(window);
    this.state.offset = this.jq.offset();
    this.state.windowScrollLeft = win.scrollLeft();
    this.state.windowScrollTop = win.scrollTop();
}

PrimeFaces.widget.Dialog.prototype.restoreState = function(includeOffset) {
    this.jq.width(this.state.width).height(this.state.height);
        
    var win = $(window);
    this.jq.offset({
       top: this.state.offset.top + (win.scrollTop() - this.state.windowScrollTop)
       ,left: this.state.offset.left + (win.scrollLeft() - this.state.windowScrollLeft)
    });
}

PrimeFaces.widget.Dialog.prototype.loadContents = function() {
    var options = {
        source: this.id,
        process: this.id,
        update: this.id
    },
    _self = this;

    options.onsuccess = function(responseXML) {
        var xmlDoc = $(responseXML.documentElement),
        updates = xmlDoc.find("update");

        for(var i=0; i < updates.length; i++) {
            var update = updates.eq(i),
            id = update.attr('id'),
            content = update.text();

            if(id == _self.id){
                _self.content.html(content);
                _self.loaded = true;
            }
            else {
                PrimeFaces.ajax.AjaxUtils.updateElement.call(this, id, content);
            }
        }

        PrimeFaces.ajax.AjaxUtils.handleResponse.call(this, xmlDoc);
        
        return true;
    };
    
    options.oncomplete = function() {
        _self.show();
    };

    var params = [];
    params[this.id + '_contentLoad'] = true;

    options.params = params;

    PrimeFaces.ajax.AjaxRequest(options);
}

PrimeFaces.widget.Dialog.prototype.addOnshowHandler = function(fn) {
    this.onshowHandlers.push(fn);
}

/**
 * PrimeFaces ConfirmDialog Widget
 */
PrimeFaces.widget.ConfirmDialog = function(cfg) {
    cfg.draggable = false;
    cfg.resizable = false;
    cfg.modal = true;
    cfg.showEffect = 'fade';
    cfg.hideEffect = 'fade';
    
    PrimeFaces.widget.Dialog.call(this, cfg);
}

PrimeFaces.widget.ConfirmDialog.prototype = PrimeFaces.widget.Dialog.prototype;