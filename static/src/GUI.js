var highlight;
var num = 0;
var bar, inv, craft, chest;
var crafted;
var bDrag = false;
var dragItem;

var slotL, slotR;

var slots = [];

var blocker = document.getElementById("blocker");
var holder = document.getElementById("holder");

var chat = document.getElementById("chatdiv");
var chatInput = document.getElementById("input");

var bNoEsc = false;

var createGUI = function () {  
    bar = createDiv(canvas.clientWidth/2-320, canvas.clientHeight-64);   
    for (var i = 0; i < 10; i++) {
        var div = createDiv(i*64, 0, true);            
        bar.appendChild(div);
        div.appendChild(createSlot("/static/textures/gui/slot.png"));
        slots.push(div);
    }
    
    inv = createDiv(canvas.clientWidth-320, canvas.clientHeight-640);
    inv.style.visibility = "hidden";
    for (var i = 0; i < 10; i++) {
        for (var j = 0; j < 5; j++) {           
            var div = createDiv(j*64, i*64, true);
            inv.appendChild(div);
            div.appendChild(createSlot("/static/textures/gui/slot.png"));
            slots.push(div);
        }
    }
    chest = createDiv(canvas.clientWidth/2-320, canvas.clientHeight/2-160);
    chest.style.visibility = "hidden";
    for (var i = 0; i < 5; i++) {
        for (var j = 0; j < 10; j++) {           
            var div = createDiv(j*64, i*64, true);
            chest.appendChild(div);
            div.appendChild(createSlot("/static/textures/gui/slot.png"));
            slots.push(div);
        }
    }
    
    highlight = createDiv(canvas.clientWidth/2-324, canvas.clientHeight-68);
    highlight.style.pointerEvents = "none";
    var img = document.createElement("img");
    img.src = "/static/textures/gui/highlight.png";
    highlight.appendChild(img);
    
    craft = createDiv(canvas.clientWidth/2-128, canvas.clientHeight/2-128);
    craft.style.visibility = "hidden";
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            var div = createDiv(j*64, i*64, true);
            craft.appendChild(div);
            div.appendChild(createSlot("/static/textures/gui/slot.png"));
            slots.push(div);
        }
    }

    crafted = createDiv(256, 96, true);
    craft.appendChild(crafted);
    var img = document.createElement("img");
    img.src = "/static/textures/gui/slot.png";
    img.className = "slot";
    crafted.appendChild(img);
    slots.push(div);
};

var setCrafted = function (div) {
    var div = document.createElement("div");
    div.style.position = (typeof position === 'undefined') ? "absolute" : "inherit";
    div.style.left = x+"px";
    div.style.top = y+"px";
    document.body.appendChild(div);

    return div;
}

var createDiv = function (x, y, position) {
    var div = document.createElement("div");
    div.style.position = (typeof position === 'undefined') ? "absolute" : "inherit";
    div.style.left = x+"px";
    div.style.top = y+"px";
    document.body.appendChild(div);
    
    return div;
}

var createSlot = function (path) {
    var img = document.createElement("img");
    img.src = path;
    img.className = "slot";
    
    img.addEventListener('click', function (e) {
        if(bDrag) {
            socket.emit('inv', [0, slots.indexOf(e.target.parentNode)]);
            stopDrag(e.target.parentNode);
        }
    });
    
    img.addEventListener('contextmenu', function (e) {
        if(bDrag) {
            socket.emit('inv', [1, slots.indexOf(e.target.parentNode)]);
            stopDragRight(e.target.parentNode);
        }
    });
    
    return img;
}

var createIcon = function (path) {
    var div = document.createElement("div");
    div.className = "icon";
    var img = document.createElement("img");
    img.src = path;
    div.appendChild(img);
    var p = document.createElement("p");
    p.innerHTML = 1;
    div.appendChild(p);
    
    div.addEventListener('click', function (e) {
        socket.emit('inv', [0, slots.indexOf(e.target.parentNode.parentNode)]);
        if(bDrag)
            addDrag(e.target.parentNode);
        else
            startDrag(e.target.parentNode);
    });
    
    div.addEventListener('contextmenu', function (e) {
        socket.emit('inv', [1, slots.indexOf(e.target.parentNode.parentNode)]);
        if(bDrag)
            addDragRight(e.target.parentNode);
        else
            startDragRight(e.target.parentNode);
    });
    
    return div;
}

function fill(per) {
      if(per <= 50){
        value = 90+(per*(90/25));
        circle.style.backgroundImage = 'linear-gradient('+value+'deg, transparent 50%, white 50%), linear-gradient(90deg, white 50%, transparent 50%)';
      } else {
        value = 90+((per-50)*(90/25));
        circle.style.backgroundImage = 'linear-gradient('+value+'deg, transparent 50%, green 50%), linear-gradient(90deg, white 50%, transparent 50%)';
      }
}

function hide_circle() {
	circle.style.opacity = "0";
}

function show_circle() {
	circle.style.opacity = "0.5";
}

function set_action(key_arg, text) {
    key.innerHTML = key_arg;
    action_text.innerHTML = text;
}

function hide_action() {
	action.style.opacity = "0";
}

function show_action() {
	action.style.opacity = "1";
}

function show_menu() {
    menu.style.display = 'block';
}

function hide_menu() {
    menu.style.display = 'none';
}

// Added after crafting
function takeDrag(item)
{
    if(item.dataSlot.id == dragItem.dataSlot.id)
    {
        soucet = Number(item.childNodes[1].innerHTML) + Number(dragItem.childNodes[1].innerHTML);
        if(soucet <= 64)
        {
            dragItem.childNodes[1].innerHTML = soucet;
            item.parentNode.removeChild(item);
            item = undefined;
            return true;
        }
    }
    return false;
}

function addDrag(item)
{
    if(item.dataSlot.id == dragItem.dataSlot.id)
    {
        soucet = Number(item.childNodes[1].innerHTML) + Number(dragItem.childNodes[1].innerHTML); 
        if(soucet <= 64)
        {
            item.childNodes[1].innerHTML = soucet;
            holder.removeChild(dragItem);
            dragItem = undefined;
            bDrag = false;
        }
        else
        {
            item.childNodes[1].innerHTML = 64;
            dragItem.childNodes[1].innerHTML = soucet-64;
        }
    }
    else
    {
        holder.removeChild(dragItem);
        item.style.pointerEvents = "none";
        dragItem.style.pointerEvents = "auto";
        item.parentNode.appendChild(dragItem);
        holder.appendChild(item);
        dragItem.style.zIndex = 2;
        dragItem = item;
        dragItem.style.zIndex = 3;
    }
}

function addDragRight(item)
{
    if(item.dataSlot.id == dragItem.dataSlot.id)
    {
        if(Number(item.childNodes[1].innerHTML)+1 <= 64)
        {
            item.childNodes[1].innerHTML = Number(item.childNodes[1].innerHTML)+1;
            if(Number(dragItem.childNodes[1].innerHTML) > 1)
                dragItem.childNodes[1].innerHTML = Number(dragItem.childNodes[1].innerHTML)-1;
            else
            {
                holder.removeChild(dragItem);
                dragItem = undefined;
                bDrag = false;
            }
        }
    }
    else
        addDrag(item);
}

function stopDrag(slot)
{
    slot.appendChild(dragItem);
    dragItem.style.pointerEvents = "auto";
    dragItem.style.zIndex = 2;
    dragItem = undefined;
    bDrag = false;
}

function stopDragRight(slot)
{
    if(Number(dragItem.childNodes[1].innerHTML) <= 1)
        stopDrag(slot);
    else
    {
        dragItem.childNodes[1].innerHTML = Number(dragItem.childNodes[1].innerHTML)-1;
        slot.appendChild(createIcon("/static/textures/gui/icons/"+assets.items[dragItem.dataSlot.id].icon));
        slot.childNodes[1].dataSlot = dragItem.dataSlot;
    }
}

function startDrag(item)
{
    if(item.className != "icon")
        return;
    dragItem = item;
    holder.appendChild(dragItem);
    dragItem.style.pointerEvents = "none";
    dragItem.style.zIndex = 3;
    bDrag = true;
}

function startDragRight(item)
{
    if(item.className != "icon")
        return;
    if(Number(item.childNodes[1].innerHTML) > 1)                                  
    {
        var celek = Number(item.childNodes[1].innerHTML);
        var polovina = Math.floor(celek / 2);
        item.childNodes[1].innerHTML = polovina;
        dragItem = createIcon("/static/textures/gui/icons/"+assets.items[item.dataSlot.id].icon);
        dragItem.dataSlot = item.dataSlot;
        dragItem.childNodes[1].innerHTML = celek - polovina;
        holder.appendChild(dragItem);
        dragItem.style.pointerEvents = "none";
        dragItem.style.zIndex = 3;
        bDrag = true;
    }
    else
        startDrag(item);
}

window.addEventListener("resize", function () {
    if(bar) {
        bar.style.left = canvas.clientWidth / 2 - 320 + "px";
        bar.style.top = canvas.clientHeight - 64 + "px";
    }
    if(highlight) {
        highlight.style.left = canvas.clientWidth / 2 - 324 + 64 * num + "px";
        highlight.style.top = canvas.clientHeight - 68 + "px";
    }
    if(inv) {
        inv.style.left = canvas.clientWidth - 320 + "px";
        inv.style.top = canvas.clientHeight - 640 + "px";
    }
    if(chest) {
        craft.style.left = canvas.clientWidth / 2 - 320 + "px";
        craft.style.top = canvas.clientHeight / 2 - 160 + "px";
    }
    if(craft) {
        craft.style.left = canvas.clientWidth / 2 - 128 + "px";
        craft.style.top = canvas.clientHeight / 2 - 128 + "px";
    }
});

var equipItem = function(right, id) {
    switch(assets.items[id].type) {
        case "buildable":
            return new Buildable(right, assets.items[id].actor);
            break;
        case "tool":
            return new Tool(right, id);
            break;
        default:
            if(id < 256)
                return new Block(right, id);
            return new Hand(right);
    }     
}

function scroll() {
    if(num < 0)
        num = 9;
    if(num > 9)
        num = 0;
        
    highlight.style.left = canvas.clientWidth/2-324+num*64+"px";  
}

function wheel(e) {
    if(bBlockInput)
        return;

    //var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

	if(e.deltaY) {
    	if(e.deltaY > 0)
        	num += 1;
    	if(e.deltaY < 0)
        	num -= 1;
	}
	if(e.detail) {
    	if(e.detail > 0)
        	num += 1;
    	if(e.detail < 0)
        	num -= 1;
	}
    scroll();
}

window.addEventListener("mousewheel", function (e) {
    wheel(e);
});

window.addEventListener("DOMMouseScroll", function (e) {
    wheel(e);    
});

freeze = function(bool) {
    if(bool)
    {
        bFreeze = true;
        canvas.blur();
        blocker.focus();
        blocker.style.pointerEvents = "auto";
        bNoEsc = true;
        document.exitPointerLock();    
    }
    else
    {
        bFreeze = false;
        canvas.focus();
        blocker.style.pointerEvents = "none";
        bNoEsc = false;
        canvas.requestPointerLock();     
    }
}

clear = function() {
    for(var i = 60; i < 126; i++) {
        if (slots[i].childNodes[1])
            slots[i].removeChild(slots[i].childNodes[1]);
        if (crafted.childNodes[1])
            crafted.removeChild(crafted.childNodes[1]);
    }
}

window.addEventListener("keypress", function (e) {
    var key = e.charCode;

    if((key == 116 || key == 13 || key == 84) || (e.keyCode == 116 || e.keyCode == 13 || e.keyCode == 84))
    {
        if(chatInput.style.visibility == "visible" && clean == 1) {
            bBlockInput = false;
            freeze(false);
            chatInput.style.visibility = "hidden";
        }
        else {
            bBlockInput = true;
            freeze(true);
            chatInput.style.visibility = "visible";
            chatInput.focus();
            bEnter = true;
        }
    }
    // E
    if(key == 101 && clean == 1)
    {
        if(inv.style.visibility == "visible")
        {
            freeze(false);
            inv.style.visibility = "hidden";
            chest.style.visibility = "hidden";
            craft.style.visibility = "hidden";
            if(bDrag)
            {
                holder.removeChild(dragItem);
                dragItem = undefined;
                bDrag = false;
            }
            clear();
        }
        else
        {
            freeze(true);
            inv.style.visibility = "visible";
        }
    }
    // F
    if(key == 102 && clean == 1) {
        if(bFreeze) {
            freeze(false);
            chest.style.visibility = "hidden";
            inv.style.visibility = "hidden";
            craft.style.visibility = "hidden";
            if(bDrag)
            {
                holder.removeChild(dragItem);
                dragItem = undefined;
                bDrag = false;
            }
            clear();
        }
        else {
            if(typeof traceHit.pickedMesh.id == "number" && traceHit.distance <= 7)
                socket.emit('use', traceHit.pickedMesh.uniqueId);
        }
    }
});

document.addEventListener("keyup", function(e) {
    if (e.keyCode == 27) {
        if(menu.style.display == 'block') {
            hide_menu();
            freeze(false);
        }
    }
});

window.addEventListener("mousemove", function (e) {
    holder.style.left = e.pageX-32+"px";
    holder.style.top = e.pageY-32+"px";
});

take = function(right) {
    let slot = right ? slotR : slotL;
    if(slots[slot].childNodes[1]) {
        if(Number(slots[slot].childNodes[1].childNodes[1].innerHTML) <= 1) {
            slots[slot].removeChild(slots[slot].childNodes[1]);
            if(right) {
                slotR = undefined;
                if(itemR)
                    itemR.destroy();
                itemR = new Hand(right);
            }
            else {
                slotL = undefined;
                if(itemL)
                    itemL.destroy();
                itemL = new Hand(right);
            }
        }
        else
            slots[slot].childNodes[1].childNodes[1].innerHTML = Number(slots[slot].childNodes[1].childNodes[1].innerHTML)-1;
    }
}

socket.on('correct', function (data) {
    inventory(data[1]);
    if(data[0]) {
        dragItem.childNodes[0].src = "/static/textures/gui/icons/"+assets.items[data[0]['id']].icon;
        dragItem.childNodes[1].innerHTML = data[0]['qv'];
    }
    else {
        if(dragItem) {
            dragItem.style.pointerEvents = "auto";
            dragItem.style.zIndex = 2;
            dragItem = undefined;
            bDrag = false;
        }
    } 
});

inventory = function(data) {
    for (var i in data) {
        if(data[i] != null) {   
            if(slots[i].childNodes[1] == undefined) {
                slots[i].appendChild(createIcon("/static/textures/gui/icons/"+assets.items[data[i].id].icon));
                slots[i].childNodes[1].childNodes[1].innerHTML += data[i].qv;
            }
                
            slots[i].childNodes[1].dataSlot = data[i];
                
            slots[i].childNodes[1].childNodes[0].src = "/static/textures/gui/icons/"+assets.items[data[i].id].icon;
            slots[i].childNodes[1].childNodes[1].innerHTML = slots[i].childNodes[1].dataSlot.qv;
        }
        else {
            if(slots[i].childNodes[1])
                slots[i].removeChild(slots[i].childNodes[1]);
        }
    }
}

socket.on('inv', function (data) {
    inventory(data);
});

clearCraft = function() {
    for(let i = 110; i < 126; i++) {
        if(slots[i].childNodes[1]) {
            slots[i].childNodes[1].childNodes[1].innerHTML = Number(slots[i].childNodes[1].childNodes[1].innerHTML) - 1;
            if (Number(slots[i].childNodes[1].childNodes[1].innerHTML) < 1)
                slots[i].removeChild(slots[i].childNodes[1]);
        }
    }
}

normalize = function() {
    if(bDrag) {
        var item = createIcon(dragItem.childNodes[0].src);
        item.style.pointerEvents = "none";
        item.style.zIndex = 3;
        item.childNodes[1].innerHTML = dragItem.childNodes[1].innerHTML;
        item.dataSlot = dragItem.dataSlot;
        dragItem.parentNode.replaceChild(item, dragItem);
        dragItem = item;
    }
}

socket.on('craft', function (data) {
    if(crafted.childNodes[1])
        crafted.removeChild(crafted.childNodes[1]);
    if(data) {
        var path = "/static/textures/gui/icons/"+assets.items[data[0]].icon;
        var div = document.createElement("div");
        div.className = "icon";
        var img = document.createElement("img");
        img.src = path;
        div.appendChild(img);
        var p = document.createElement("p");
        p.innerHTML = data[1];
        div.appendChild(p);
        crafted.appendChild(div);
        crafted.childNodes[1].dataSlot = {'id':data[0], 'qv':data[1]};
        div.addEventListener('click', function (e) {
            if(bDrag) {
                if (takeDrag(e.target.parentNode))
                    clearCraft();
            }
            else {
                startDrag(e.target.parentNode);
                normalize();
                clearCraft(e.target.parentNode);
            }
            socket.emit('craft', 0);
        });
    }
});
