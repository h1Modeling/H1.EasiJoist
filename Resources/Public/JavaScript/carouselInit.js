

// load Reference
var fetch = function(e) {

    var element = findAncestor(e.target, 'referenceImage');

    // add class
    var image = element.children[0].children[0];
    image.classList.add('referenceSelected');

    var numberInRow;

    // check position
    if (window.innerWidth < 575) {
        numberInRow = 1;
    }
    else if (window.innerWidth < 758) {
        numberInRow = 2;
    }
    else if (window.innerWidth < 992) {
        numberInRow = 3;
    }
    else {
        numberInRow = 4;
    }
    
    var elementPosition = image.getBoundingClientRect().right;
    var elementPositionLeft = image.getBoundingClientRect().left;
    var elementsAfter;

    switch (numberInRow) {

        case 1: elementsAfter = 0; 
                break;

        case 2: elementsAfter = (elementPosition > window.innerWidth/2) ? 0 : getNumberSiblings(element, 1);
                break;

        case 3: if (elementPosition < window.innerWidth / 2) {

                    elementsAfter = getNumberSiblings(element, 2);
                }
                else if (elementPosition > window.innerWidth / 2 && elementPositionLeft < window.innerWidth / 2) {
                    
                    elementsAfter = getNumberSiblings(element, 1);
                }
                else {
                    elementsAfter = 0;
                }
                break;

        default: if (elementPosition + 50 < window.innerWidth / 2 ) {
                    elementsAfter = getNumberSiblings(element, 3);
                }
                else if (elementPositionLeft < window.innerWidth / 2 && elementPosition + 50 > window.innerWidth / 2) {
                    elementsAfter = getNumberSiblings(element, 2);
                }
                else if (elementPositionLeft - 50 < window.innerWidth / 2 && elementPosition > window.innerWidth / 2) {
                    elementsAfter = getNumberSiblings(element, 1);
                }
                else {
                    elementsAfter = 0;
                }
                break;
    }

    // close other references
    Array.from(document.getElementsByClassName('referenceBackground')).forEach(function(e) {
        if (!e.classList.contains('hidden')) e.classList.add('hidden');
    });

    // Create Reference Data
    if (image.dataset.loaded == 'false') {

        // container
        var container = document.createElement('div');
        container.className = 'referenceBackground';
        container.id = 'detail' + element.id;

        var close = document.createElement('div');
        close.className = 'referenceClose';
        close.addEventListener('click', function(e) {closeReference(e);});

        var closeX = document.createElement('p');
        closeX.appendChild(document.createTextNode('×'));
        close.appendChild(closeX);

        container.appendChild(close);

        var column = document.createElement('div');
        column.className = 'col-12 col-lg-8';

        var img = document.createElement('img');
        img.src = image.src;
        img.className = 'loadedImage';
        column.appendChild(img);

        var loader = document.createElement('div');
        loader.className = 'swiper-lazy-preloader';
        column.appendChild(loader);

        container.appendChild(column);
        
        // Element to insert detail
        var sibling;
        if (elementsAfter == 0) {
            sibling = element.nextSibling;
        }
        else if (elementsAfter == 1) {
            sibling = element.nextSibling.nextSibling;
            if (element.nextSibling.tagName == undefined) {
                sibling = element.nextSibling.nextSibling.nextSibling;
            }
        }
        else if (elementsAfter == 2) {
            sibling = element.nextSibling.nextSibling.nextSibling;
            if (element.nextSibling.tagName == undefined || element.nextSibling.nextSibling.tagName == undefined) {
                sibling = element.nextSibling.nextSibling.nextSibling.nextSibling;
            }
        }
        else if (elementsAfter == 3) {
            sibling = element.nextSibling.nextSibling.nextSibling.nextSibling;
            if (element.nextSibling.tagName == undefined || element.nextSibling.nextSibling.tagName == undefined || element.nextSibling.nextSibling.nextSibling.tagName == undefined ) {
                sibling = element.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling;
            }
        }

        element.parentNode.insertBefore(container, sibling);
    }

    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {

        if (xhr.readyState === 4 && xhr.status === 200) {
            var response = xhr.responseText;

            // add Elements
            container.innerHTML = response.substring(response.indexOf('<!-- Ref Start -->'), response.indexOf('<!-- Ref End -->'));
            var eleTop = container.getElementsByClassName('gallery-top')[0];
            var eleBottom = container.getElementsByClassName('gallery-thumbs')[0];

            // add to document
            element.parentNode.insertBefore(container, sibling);
            initReference(eleTop, eleBottom);
            image.dataset.loaded = 'true';
            
        } 
        else {
            console.log('Error: ' + xhr.status);
        }
    }

    // load image
    if (image.dataset.loaded == 'false') {
        xhr.open("POST", element.children[0].children[0].dataset.link);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.send(null);
    }
    else {
        // show element
        var detail = document.getElementById('detail' + element.id);

        if (detail.classList.contains('hidden')) {
            detail.classList.remove('hidden');
        }
    }
}

function checkVisibility(id) {

    var e = document.getElementById(id.substring(1));

    if (e !== null && e.classList.contains('hidden')) {
        e.classList.remove('hidden');
    }
}

function getNumberSiblings(element, number) {

    var result;

    if (element.nextSibling == null) {
        result = 0;
    }
    else if (element.nextSibling.nextSibling == null) {
        result = 1;
    }
    else if (element.nextSibling.nextSibling.nextSibling == null) {
        result = 2;
    }
    else {
        result = 3;
    }

    if (result > number) {
        result = number;
    }

    return result;
}


function initReference(eleTop, eleBottom) {
    
    var galleryTop = new Swiper(eleTop, {
        spaceBetween: 10,
    });
    
    var galleryThumbs = new Swiper(eleBottom, {
        spaceBetween: 10,
        centeredSlides: true,
        slidesPerView: 'auto',
        touchRatio: 0.2,
        slideToClickedSlide: true,
    });

    galleryTop.controller.control = galleryThumbs;
    galleryThumbs.controller.control = galleryTop;
}

function closeReference(e) {

    e.target.parentNode.parentNode.classList.add('hidden');
    document.getElementById(e.target.parentNode.parentNode.id.substr(6)).children[0].children[0].classList.remove('referenceSelected');
}

function loadReferences() {

    var data = document.getElementById('data');

    if (data !== null) {

        var json = JSON.parse(data.innerHTML);

        var refContainer = document.getElementById('referenceContainer');

        // define number of loaded elements
        var newElements = 20;
        var finish = false
        if (newElements > json.elements.length) {
            newElements = json.elements.length;
            finish = true;
        }

        for (var i = 0, le = newElements; i < le; i++) {

            (function() {
                refContainer.appendChild(H1.createReferenceElement(json.elements[i]));
            }());
        }

        if (finish == true) {
            json.elements = [];
            document.getElementById('loadMore').classList.add('hidden');
        }
        else {
            json.elements = json.elements.slice(20);
        }
        data.innerHTML = JSON.stringify(json);
        refContainer.removeChild(data);
        refContainer.appendChild(data);
    }
}

// add event listeners Menu click
var menuButton = document.getElementById('menuButton');

if (menuButton !== null) {

    menuButton.addEventListener('click', function() {
        
        var mobileNav = document.getElementById('mobileNavigation');
        if (mobileNav.classList.contains('hidden'))
            mobileNav.classList.remove('hidden');
        else
            mobileNav.classList.add('hidden');
    });  
}

// video
plyr.setup({iconUrl: '/_Resources/Static/Packages/H1.Wolf/Images/plyr.svg'});


// scroll to top button
document.getElementById('backToTop').addEventListener('click', function(e) {

    document.body.scrollTop = 0; // For Chrome, Safari and Opera 
    document.documentElement.scrollTop = 0; // For IE and Firefox
});


// form close button
var formCloseButton = document.getElementById('formCloseButton');

if (formCloseButton !== null) {

    formCloseButton.addEventListener('click', function(e) {

        document.getElementById('contactForm').classList.add('hidden');
    });  
}

// form open button
var contacts = ['contactMail', 'contactFooter'];
contacts.forEach( function(el) {
        
    var contact = document.getElementById(el);
    
    if (contact !== null) {
        contact.addEventListener('mousedown', function(e) {

            document.getElementById('contactForm').classList.remove('hidden');

            // Set location
            var loc = document.getElementsByName('locationField');

            if (loc !== undefined) {

                Array.from(loc).forEach(function(ele) {

                    ele.setAttribute("value", window.location.href);
                });
            }

            e.preventDefault();
        });
    }
});

// form submit
var formSubmit = document.getElementById('formSubmit');

if (formSubmit !== null) {

    formSubmit.addEventListener('click', function(e) {

        validateForm(e);
    });
}


function validateForm(ev) {

    var allFilled = true, mailCorrect = true;

    var select;
    var prospekte = [];

    var result = true;

    // check catalog
    Array.from(document.getElementById('mainForm').children).forEach(function(e) {

        if (e.children[2] !== undefined && e.children[2].name == 'catalog') {
            select = e.children[2];      
        }
        else if (e.children[0].children[0] !== undefined && e.children[0].children[0].dataset.type == 'prospekt') {

            if (e.children[0].children[0].checked == true) {
                
                var name = e.children[0].children[0].name;
                name = name.replace('prospekt', '');
                prospekte.push(name);
            }
        }
    });

    if (select.value == 'pt') {

        var prospektString = prospekte.toString();
        prospektString = prospektString.replace(/prospekt/g, '');
        prospektString = prospektString.replace(/,/g, ';');

        document.getElementsByName('catalogType')[0].setAttribute('value', prospektString);
    }
    else {
        document.getElementsByName('catalogType')[0].value = '';
    }

    // check validation
    Array.from(document.getElementById('mainForm').querySelectorAll("[required]")).forEach(function(e) {

        if (e.type == 'email') {
            if (e.checkValidity() == false) mailCorrect = false;
        }
        else if (e.type == 'select-one') {
            if (e.value == '-') allFilled = false;
        }
        else {
            if (e.checkValidity() == false) allFilled = false;
        }
    });


    if (allFilled == false) {
        document.getElementById('allValidation').classList.remove('hidden');
        ev.preventDefault();
        result = false;
    }
    if (mailCorrect == false) {
        document.getElementById('mailValidation').classList.remove('hidden');
        ev.preventDefault();
        result = false;
    } 
    else {
        var ele = document.getElementById('mailValidation');
        if (!ele.classList.contains('hidden')) ele.classList.add('hidden');
    }

    // hide form
    if (allFilled == true && mailCorrect == true) {

        document.getElementById('contactForm').classList.add('hidden');
    }

    return result;
}


document.getElementById('cookieButton').addEventListener('click', function() {

    var date = new Date();
    date.setDate(date.getDate() + 365);

    document.cookie = 'accepted=true; expires=' + date.toUTCString();
    document.getElementById('cookieContainer').style = '';

});

// get cookie
function getCookie(cname) {
    
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');

    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

// check cookie
var value = getCookie("accepted");
if (value == "") {
    document.getElementById('cookieContainer').style = 'display: block';
}


// Paralax Image
var SCROLL_SPEED = 0.8;
var targets = [];

Array.from(document.getElementsByClassName('parallaxImage')).forEach(function(elem){

    var url = elem.dataset.bgurl;
    if (url) {
        elem.style.backgroundImage = "url('"+url+"')";
        elem.style.backgroundAttachment = "fixed";
        elem.style.backgroundSize = "cover";
        targets.push(elem);
    }
});

var callback = function() {

    targets.forEach(function(e) {
        e.style.backgroundPosition = "50%" + e.getBoundingClientRect().top * SCROLL_SPEED + "px";
    });
};

if (targets.length > 0) {
    window.addEventListener('scroll', callback);
    callback();
}

// Reference
var refSelectionContainer = document.getElementById('referenceContainerHeader');

if (refSelectionContainer !== null) {

    refSelectionContainer.parentNode.addEventListener('click', function(e) {

        // close all
        if (e.target.className !== 'mainSelection' && e.target.className !== 'mainDropDown') {
            
            Array.from(document.getElementsByClassName('mainSelection')).forEach(function(e) {
                if (e.checked == true) e.checked = false;               
            });
        }
        // self close
        else if (e.target.className == 'mainDropDown') {
            var checkbox = document.getElementById(e.target.parentNode.getAttribute('for'));
            if (checkbox.checked == true) {
                checkbox.checked = false;
                e.preventDefault();
            }

            // close other
            Array.from(document.getElementsByClassName('mainDropDown')).forEach(function(ele) {

                var iteration = document.getElementById(ele.parentNode.getAttribute('for'));
                var target = document.getElementById(e.target.parentNode.getAttribute('for'));
                if (iteration.id !== target.id) {
                    document.getElementById(ele.parentNode.getAttribute('for')).checked = false;
                }                
            });
        }
    });

    // add Events for checkboxes
    Array.from(document.getElementsByClassName('buildingTypeSelectionItem')).forEach(function(ele) {
        ele.addEventListener('click', function(e){ H1.uncheck(e); H1.sort(); H1.changeLabel(e); });
    });

    Array.from(document.getElementsByClassName('buildingRegionSelectionItem')).forEach(function(ele) {
        ele.addEventListener('click', function(e){ H1.uncheck(e); H1.sort(); H1.changeLabel(e); });
    });
}

function sortFachberater() {

    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(sortFachberaterAutomatic);
    }
}

function sortRandom() {

    var elements = [];

    // Randomize Array
    elements = shuffle(Array.from(document.getElementsByClassName('fachberater')));

    // Resort
    elements.forEach(function(e) {

        var parent = e.parentNode.parentNode;
        parent.insertBefore(e.parentNode, parent.firstChild);
    });
}


function sortFachberaterAutomatic(position) {

    var elements = [];

    // get All Fachberater
    Array.from(document.getElementsByClassName('fachberater')).forEach(function(e) {

        var longitude = e.dataset.longitude;
        var latitude = e.dataset.latitude;

        if (longitude !== undefined && latitude !== undefined) {

            var dist = Math.sqrt(Math.pow(Number(longitude) - position.coords.longitude,2) + Math.pow(Number(latitude) - position.coords.latitude, 2));
            elements.push({element: e, distance: dist});
        }
    });


    var sortedElements = sortArray(elements,'distance');

    // reorder Elements
    var index = 1;
    sortedElements.forEach(function(e) {

        var parent = e.element.parentNode.parentNode;
        parent.insertBefore(e.element.parentNode, parent.firstChild);

        if (index < sortedElements.length -  7) {

            if (!e.element.parentNode.classList.contains('hidden')) {
                e.element.parentNode.classList.add('hidden');
            }
        }

        index += 1;
    });
}

function sortArray(array, value) {
    return array.slice(0).sort(function(a,b) {
        return (a[value] < b[value]) ? 1 : (a[value] > b[value]) ? -1 : 0;
    });
};


function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
