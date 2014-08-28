/**
 *  PrimeFaces Spinner Widget
 */
PrimeFaces.widget.Spinner = function(id, cfg) {
    this.id = id;
    this.cfg = cfg;
    this.jqId = PrimeFaces.escapeClientId(id);
    this.jq = $(this.jqId);
    this.input = this.jq.children('.ui-spinner-input');
    this.upButton = this.jq.children('a.ui-spinner-up');
    this.downButton = this.jq.children('a.ui-spinner-down');
    this.decimalSeparator = this.findDecimalSeparator();
    this.decimalCount = this.findDecimalCount();
    this.value = this.parse(this.input.val());
    var _self = this;

    if(this.cfg.disabled) {
        return;
    }

    //visuals
    this.jq.children('.ui-spinner-button').mouseover(function() {
        $(this).addClass('ui-state-hover');
    }).mouseout(function() {
        $(this).removeClass('ui-state-hover');
    }).mouseup(function() {
        clearInterval(_self.timer);
        $(this).removeClass('ui-state-active');
    }).mousedown(function() {
        var element = $(this),
        dir = element.hasClass('ui-spinner-up') ? 1 : -1;

        element.addClass('ui-state-active');

        _self.repeat(null, dir);
    });

    //only allow numbers
    this.input.keypress(function (e){
        var charCode = (e.which) ? e.which : e.keyCode;

        if(charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        } else {
            return true;
        }
    });

    //repopulate value on blur if input is cleared
    this.input.blur(function (e){
        _self.input.val(_self.value);
    });

    if(this.cfg.behaviors) {
        PrimeFaces.attachBehaviors(this.input, this.cfg.behaviors);
    }

    if(this.cfg.theme != false) {
        PrimeFaces.skinInput(this.input);
    }
}

PrimeFaces.widget.Spinner.prototype.repeat = function(interval, dir) {
    var _self = this,
    i = interval || 500;

    clearTimeout(this.timer);
    this.timer = setTimeout(function() {
        _self.repeat(40, dir);
    }, i);

    this.spin(this.cfg.step * dir);
}

PrimeFaces.widget.Spinner.prototype.spin = function(step) {
    var newValue = this.value + step;

    if(this.cfg.min !== undefined && newValue < this.cfg.min) {
        newValue = this.cfg.min;
    }

    if(this.cfg.max !== undefined && newValue > this.cfg.max) {
        newValue = this.cfg.max;
    }

    this.input.val(this.format(newValue));
    this.value = newValue;

    this.input.change();
}

PrimeFaces.widget.Spinner.prototype.parse = function(value) {
    if(this.cfg.prefix)
        value = value.split(this.cfg.prefix)[1];

    if(this.cfg.suffix)
        value = value.split(this.cfg.suffix)[0];

    if(this.decimalSeparator) {
        return parseFloat(value);
    } else {
        return parseInt(value);
    }
}

PrimeFaces.widget.Spinner.prototype.findDecimalSeparator = function() {
    var step = this.cfg.step + '';

    if(step.indexOf('.') != -1) {
        return "."
    } else if(step.indexOf(',') != -1) {
        return ',';
    } else {
        return null;
    }
}

PrimeFaces.widget.Spinner.prototype.findDecimalCount = function() {
    var decimalSeparator = this.findDecimalSeparator(),
    step = this.cfg.step + '';

    if(decimalSeparator) {
        return step.split(decimalSeparator)[1].length;
    } else {
        return 0;
    }
}

PrimeFaces.widget.Spinner.prototype.format = function(value) {
    if(this.decimalSeparator) {
        value = value + '';

        var decimalCount = this.findDecimalCount(),
        valueDecimalCount = null;

        if(value.indexOf(this.decimalSeparator) != -1) {
            valueDecimalCount = value.split(this.decimalSeparator)[1].length;
        } else {
            valueDecimalCount = 0;
            value = value + this.decimalSeparator;
        }

        for(var i = valueDecimalCount ; i < decimalCount; i++) {
            value = value + '0';
        }
    }

    if(this.cfg.prefix)
        value = this.cfg.prefix + value;

    if(this.cfg.suffix)
        value = value + this.cfg.suffix;

    return value;
}