// Animation onload
function setanimation(response) {
    window.animation = response
    var animation = response.animations;
    var hover = response.hover;
    var lastselect = localStorage.getItem('selected')
    var elm = $('#animationselector')
    var counter = 2;
    for (let i in animation) {
        if (lastselect == i) {
            elm.append(`<option value="${counter}" selected>${i}</option>`)
        } else {
            elm.append(`<option value="${counter}">${i}</option>`)
        }
        counter++
    }
    elm.append(`<option style="font-size: 1pt; background-color: #000000;" disabled>&nbsp;</option>`)
    for (let i in hover) {
        if (lastselect == i + ' Hover') {
            elm.append(`<option value="${counter}" selected>${i} Hover</option>`)
        } else {
            elm.append(`<option value="${counter}">${i} Hover</option>`)
        }
        counter++
    }
    if (lastselect != undefined) {
        animatorselected()
    }
}
// Detect change in select:
function animatorselected() {
    var animation = window.animation
    var times = localStorage.getItem('time').replace('.', '')
    var repeats = localStorage.getItem('repeat')
    if ($('#animationselector').select()[0].innerText.split('\n')[$('#animationselector').val() - 1] == "") {
        var elm = document.getElementById('html').value
        $(`#preview`).html(elm)
        return
    }
    var elm = document.getElementById('html').value
    if ($('#animationselector').select()[0].innerText.split('\n')[$('#animationselector').val()].includes(' Hover')) {
        var i = $('#animationselector').select()[0].innerText.split('\n')[$('#animationselector').val()].replace(' Hover', '')
        selected = animation.hover[i]
        localStorage.setItem('selected', i + ' Hover')
    } else {
        i = $('#animationselector').select()[0].innerText.split('\n')[$('#animationselector').val() - 1]
        selected = animation.animations[i]
        localStorage.setItem('selected', i)
    }
    var style = ""
    for (let j in selected) {
        style += selected[j]
    }
    elm = `<div class="s${times} linear ${style} t${repeats} c2">${elm}</div>`
    $(`#preview`).html(elm)

    // Setup code:
    $('#code').text(elm)
    $('#fullcode').text(generateFullCode(elm))
}
$('#animationselector').on('change', animatorselected);

// Preview:
if (localStorage.getItem('element') == undefined) {
    localStorage.setItem('element', '<div>animated element</div>')
} else {
    $(`#preview`).html(localStorage.getItem('element'))
}
if ($('#html').val().length == 0) {
    localStorage.setItem('element', '<div>animated element</div>')
    $(`#preview`).html('<div>animated element</div>')
    $(`#html`).html('<div>animated element</div>')
}
$('#html').val(localStorage.getItem('element').replaceAll('<br>', '\n'))
$('#html').on('input', function() {
    if ($('#html').val().length < 2) {
        localStorage.setItem('element', '<div>animated element</div>')
        $(`#html`).val('<div>animated element</div>')
        $(`#preview`).html('<div>animated element</div>')
    } else {
        localStorage.setItem('element', $('#html').val().replaceAll('\n', '<br>'))
        $(`#preview`).html($('#html').val().replaceAll('\n', '<br>'))
    }
});

// Copy function:
function copyToClipboard(elementId) {
    try {
        var aux = document.createElement("input");
        aux.setAttribute("value", document.getElementById(elementId).innerHTML);
        document.body.appendChild(aux);
        aux.select();
        navigator.clipboard.writeText(aux.value.replaceAll('&lt;', '<').replaceAll('&gt;', '>'));
        document.body.removeChild(aux);
        console.info("Copied to clipboard")
    }
    catch {
        console.error("Copy error")
    }
}

// Copy code
function copy_html() {
    copyToClipboard('code')
}

function copy_full() {
    copyToClipboard('fullcode')
}


// Create full code:
function setupCSS(css) {
    window.css = css
}
String.prototype.betterReplace = function(search, replace, from) {
    if (this.length > from) {
        return this.slice(0, from) + this.slice(from).replace(search, replace);
    }
    return this;
}

function gainStyle(name, s, t, animation, css, c, l, styler) {
    // Main value for the rest:
    if (name.search('hover') != -1) {
        var hover = true
    } else {
        var hover = false
    }
    var CssClass = css.replaceAll('\n', '').replaceAll('}@', '}|@').replaceAll('}.', '}|').split('|')
    var UuidClass = crypto.randomUUID().replaceAll('-', '')
    var FinalCode = []
    // compute result
    CssClass.forEach((HtmlClass) => {
        if (HtmlClass.search('@keyframes') != -1 && HtmlClass.search(animation) != -1) {
            FinalCode.push(HtmlClass.replace(animation, animation + UuidClass))
        } else if (HtmlClass.search(name) != -1 && !hover) {
            if (HtmlClass.search('hover') == -1) {
                FinalCode.push('.' + HtmlClass.replace(name, name + UuidClass).betterReplace(name, animation + UuidClass, name.length))
            } else if (hover) {
                FinalCode.push('.' + HtmlClass.replace(name.replace('hover'), name.replace('hover') + UuidClass).betterReplace(name, animation + UuidClass, name.length))
            }
        } else if (HtmlClass.search(s) != -1) {
            FinalCode.push(HtmlClass.replace(s, '.' + s + UuidClass))
        } else if (HtmlClass.search(t) != -1) {
            FinalCode.push(HtmlClass.replace(t, '.' + t + UuidClass))
        } else if (HtmlClass.search(c) != -1) {
            FinalCode.push(HtmlClass.replace(c, '.' + c + UuidClass))
        } else if (HtmlClass.search(l) != -1) {
            FinalCode.push(HtmlClass.replace(l, '.' + l + UuidClass))
        } else if (HtmlClass.search(styler) != -1) {
            FinalCode.push(HtmlClass.replace(styler, '.' + styler + UuidClass))
        }
    })
    var style = ComputeStyle(FinalCode.join(''), UuidClass).replaceAll("}", "}")
    return [`<style>${style}</style>`, UuidClass]
}

// Computing style:
function ComputeStyle(style, uuid) {
    var splited = style.replaceAll('}@', '}|@').replaceAll('}.', '}|').split('|')
    var result = []
    var tooneclass = []
    var content = []
    splited.forEach((value) => {
        if (value.search('@') == 0) {
            result.push(value)
        } else {
            tooneclass.push(value)
        }
    })
    tooneclass.forEach((value) => {
        content.push(value.slice(value.search('{') + 1, value.length - 1))
    })
    var oneclass = `.l${uuid} {${content.join(';').replaceAll(';;', ';')}}`
    return oneclass + result.join('')
}

// Generate full code:
function generateFullCode(base) {
    var css = window.css
    var baseClassPos = base.search('class=') + 7
    var baseClassPos1 = base.slice(baseClassPos).search('"') + baseClassPos
    var classname = base.slice(baseClassPos, baseClassPos1).split(' ')
    var finalStyle = gainStyle(classname[2], classname[0], classname[3], classname[2], css, classname[4], classname[1], 'animatedElmStyle');
    var newbase = base.replaceAll(classname[0], '')
    var newbase = newbase.replaceAll(classname[2], '')
    var newbase = newbase.replaceAll(classname[1], '')
    var newbase = newbase.replaceAll(classname[4], '')
    var newbase = newbase.replaceAll(classname[3], 'l' + finalStyle[1])
    return finalStyle[0] + newbase
}

// Load files:
function loader(res) {
    $.api({
        url: location.origin + '/',
        success: setanimation,
        endpoint: 'animation.json'
    });
    setupCSS(res)
}

// Setup API
$.api({
    url: location.origin + '/',
    success: loader,
    endpoint: 'animation.css'
});

// Slider prepare:
if (localStorage.getItem('time') == undefined) {
    localStorage.setItem('time', 1.00)
}
if (localStorage.getItem('repeat') == undefined) {
    localStorage.setItem('repeat', 'Infinitely')
}
document.getElementById('timeval').innerText = localStorage.getItem('time') + ' s'
if (localStorage.getItem('repeat') == 'Infinitely') { }
document.getElementById('repeatval').innerText = localStorage.getItem('repeat') + ' times'
document.getElementById('timeid').value = localStorage.getItem('time')
document.getElementById('repeatid').value = localStorage.getItem('repeat')

if (localStorage.getItem('repeat') == 'Infinitely') {
    document.getElementById('repeatid').value = '11.00'
}

// Time slider:
var timeSlider = document.getElementById("timeid");
timeSlider.oninput = function() {
    localStorage.setItem('time', Number(this.value).toFixed(2))
    document.getElementById('timeval').innerText = Number(localStorage.getItem('time')).toFixed(2) + ' s'
    $('timeval').text(Number(this.value / 5).toFixed(2) + 's')
    animatorselected()
}

// Repeat slider:
var repeatSlider = document.getElementById("repeatid");
repeatSlider.oninput = function() {
    if (this.value == 11) {
        localStorage.setItem('repeat', 'Infinitely')
        document.getElementById('timeval').innerText = localStorage.getItem('time') + ' s'
        document.getElementById('repeatval').innerText = localStorage.getItem('repeat')
        $('repeatval').text('Infinitely')
    } else {
        localStorage.setItem('repeat', this.value)
        document.getElementById('timeval').innerText = localStorage.getItem('time') + ' s'
        document.getElementById('repeatval').innerText = localStorage.getItem('repeat') + ' times'
        $('repeatval').text(this.value + 'times')
    }
    animatorselected()
}