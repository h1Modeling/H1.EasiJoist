
// Namespace
var H1 = (function() {

    // Create new Reference Detail Element
    var createReferenceElement = function(e) {

        var container = document.createElement('div');
        container.className = 'referenceImage';
        container.id = e.id;
        container.addEventListener('click', function(event) {fetch(event)}, false);

        var imgContainer = document.createElement('div');
        imgContainer.className = 'plyr plyr--img';

        var img = document.createElement('img');
        img.className = 'referencePaddingAnimation';
        img.src = e.image;
        img.alt = e.alt;
        img.title = e.title;
        img.dataset.link = e.link;
        img.dataset.loaded = 'false';
        img.dataset.type = e.type;
        img.dataset.region = e.region;

        imgContainer.appendChild(img);

        var textContainer = document.createElement('div');
        textContainer.className = 'referenceText'
        textContainer.style = 'background: ' + e.color;

        var text = document.createElement('p');
        text.className = 'linkSymbolWhite';

        var node = document.createTextNode(e.title);
        text.appendChild(node);
        textContainer.appendChild(text);

        var overlayContainer = document.createElement('div');
        overlayContainer.className = 'referenceOverlay';
        overlayContainer.style = 'background: ' + e.color2;

        var title = document.createElement('p');
        title.className = 'referenceTitle';
        title.appendChild(document.createTextNode(e.title));

        var subTitle = document.createElement('p');
        subTitle.className = 'referenceSubTitle';
        subTitle.appendChild(document.createTextNode(e.subTitle));

        overlayContainer.appendChild(title);
        overlayContainer.appendChild(subTitle);

        // append children
        container.appendChild(imgContainer);
        container.appendChild(textContainer);
        container.appendChild(overlayContainer);

        return container;
    }

    var removeHex = function(value) {

        var keys = [ ['%C3%A4', 'ä'], ['%C3%B6', 'ö'], ['%C3%BC', 'ü'], ['%20', ' '], ['%c3%9f', 'ß'] ];
        keys.forEach(function(key) {

            value = replaceChars(value, key[0], key[1]);
        });

        return value;       
    }

    var replaceChars = function(value, replaced, replacer) {

        var result = value;

        do {
            result = result.replace(replaced, replacer);
        }
        while (result.indexOf(replaced) !== -1);

        return result;        
    }

    // Sort References
    var sort = function(option) {

        var resultType = [];
        var resultRegion = [];

        if (option == undefined) {

            // Building Type
            Array.from(document.getElementsByClassName('buildingTypeSelectionItem')).forEach(function(e) {
                if (e.checked == true) resultType.push(e.id);     
            });

            // Region
            Array.from(document.getElementsByClassName('buildingRegionSelectionItem')).forEach(function(e) {
                if (e.checked == true) resultRegion.push(e.id);
            });
        }
        else {

            if (option.type !== undefined) {
                option.type = removeHex(option.type);
            }

            if (option.region !== undefined) {
                option.region = removeHex(option.region);
            }

            resultType.push(option.type);
            resultRegion.push(option.region);
        }

        if (resultType.length > 0 || resultRegion.length > 0) {

            var getMore = document.getElementById('loadMore')
            if (!getMore.classList.contains('hidden')) {
                getMore.classList.add('hidden');
            }             
        }

        // hide loaded elements
        Array.from(document.getElementsByClassName('referencePaddingAnimation')).forEach(function(element) {

            var hideType = (resultType.length > 0) ? true : false;
            var hideRegion = (resultRegion.length > 0) ? true : false;

            // Building Type
            resultType.forEach(function(e) {

                if (element.dataset.type.indexOf(e) !== -1) {
                    hideType = false;
                }
            });


            // Region
            resultRegion.forEach(function(e) {

                if (element.dataset.region.indexOf(e) !== -1) {
                    hideRegion = false;
                }
            });

            // hide Elements
            if (hideType == true || hideRegion == true) {
                
                if (element.parentNode.parentNode.classList.contains('hidden') == false && element.parentNode.parentNode.id !== 'referenceContainer') {
                    element.parentNode.parentNode.classList.add('hidden');
                }            
            }
            // show Elements
            else if (hideType == false && hideRegion == false) {
                
                if (element.parentNode.parentNode.classList.contains('hidden') == true) {
                    element.parentNode.parentNode.classList.remove('hidden');
                } 
            }
        });


        // data Elements
        var data = document.getElementById('data');

        if (data !== null) {
            var json = JSON.parse(data.innerHTML);

            var refContainer = document.getElementById('referenceContainer');
            var newData = { elements: []};

            json.elements.forEach(function(element) {

                var hide = false;

                // Type
                for (var j = 0, le2 = resultType.length; j < le2; j++) {

                    var search = resultType[j];

                    if (element.type.indexOf(search) == -1 && element.type !== "") {
                        hide = true;
                        break;
                    }
                }

                // Region
                if (hide == false) {

                    for (var j = 0, le2 = resultRegion.length; j < le2; j++) {

                        var search = resultRegion[j];

                        if (element.region.indexOf(search) == -1 && element.region !== '') {
                            hide = true;
                            break;
                        }
                    }
                }

                // Add element
                if (hide == false) {
                    refContainer.appendChild(createReferenceElement(element));                
                }
                // remain in JSOn
                else {
                    newData.elements.push(element);
                }
            });

            // create new Data object
            data.innerHTML = JSON.stringify(newData);
            refContainer.removeChild(data);
            refContainer.appendChild(data);

            if (newData.elements.length == 0) {
                var getMore = document.getElementById('loadMore')
                if (!getMore.classList.contains('hidden')) {
                    getMore.classList.add('hidden');
                } 
            }
        }
    };

    // change Label of Reference Selector
    var changeLabel = function(e) {

        var ul = e.target.parentNode.parentNode;
        var result = [];

        // check all selections
        Array.from(ul.children).forEach(function(ele){

            var element = ele.children[0];

            if (element.checked == true) {
                result.push(element.nextSibling.children[0].innerHTML);
            }        
        });

        ul.parentNode.children[0].children[0].innerHTML = (result.length > 0 && result.length < 3) ? result.join(', '): ((result.length > 2) ? result.length + ' ' + ul.parentNode.children[0].children[0].dataset.more : ul.parentNode.children[0].children[0].dataset.empty);
    }

    // uncheck other reference selection items
    var uncheck = function(e) {

        var ul = e.target.parentNode.parentNode;

        // uncheck elements
        Array.from(ul.children).forEach(function(ele) {

            var element = ele.children[0];

            if (element.checked == true && element !== e.target) {
                element.checked = false;
            }
        });   
    }

    return {

        sort: sort,
        createReferenceElement: createReferenceElement,
        changeLabel: changeLabel,
        removeHex: removeHex,
        uncheck: uncheck
    }   
})();

function setCatalogVisibility(e) {

    var form = document.getElementById('mainForm');

    if (form !== null) {

        var fields = Array.from(form.getElementsByClassName('catalog'));

        // wenn Post ausgewählt
        if (e.value == 'pt') {

            fields.forEach(function(e) {

                if (e.classList.contains('hidden')) {
                    e.classList.remove('hidden');
                }
            });
        }
        else {

            fields.forEach(function(e) {

                if (!e.classList.contains('hidden')) {
                    e.classList.add('hidden');
                }
            });
        }
    }
}

// find ancester by class
function findAncestor (el, cls) {
    while ((el = el.parentElement) && !el.classList.contains(cls));
    return el;
}

// find parent by type
function findParent (el, type) {
    while ((el = el.parentElement) && !el.tagName == type);
    return el; 
}

// Production steps of ECMA-262, Edition 6, 22.1.2.1
// Reference: https://people.mozilla.org/~jorendorff/es6-draft.html#sec-array.from
if (!Array.from) {
  Array.from = (function () {
    var toStr = Object.prototype.toString;
    var isCallable = function (fn) {
      return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
    };
    var toInteger = function (value) {
      var number = Number(value);
      if (isNaN(number)) { return 0; }
      if (number === 0 || !isFinite(number)) { return number; }
      return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
    };
    var maxSafeInteger = Math.pow(2, 53) - 1;
    var toLength = function (value) {
      var len = toInteger(value);
      return Math.min(Math.max(len, 0), maxSafeInteger);
    };

    // The length property of the from method is 1.
    return function from(arrayLike/*, mapFn, thisArg */) {
      // 1. Let C be the this value.
      var C = this;

      // 2. Let items be ToObject(arrayLike).
      var items = Object(arrayLike);

      // 3. ReturnIfAbrupt(items).
      if (arrayLike == null) {
        throw new TypeError("Array.from requires an array-like object - not null or undefined");
      }

      // 4. If mapfn is undefined, then let mapping be false.
      var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
      var T;
      if (typeof mapFn !== 'undefined') {
        // 5. else      
        // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
        if (!isCallable(mapFn)) {
          throw new TypeError('Array.from: when provided, the second argument must be a function');
        }

        // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (arguments.length > 2) {
          T = arguments[2];
        }
      }

      // 10. Let lenValue be Get(items, "length").
      // 11. Let len be ToLength(lenValue).
      var len = toLength(items.length);

      // 13. If IsConstructor(C) is true, then
      // 13. a. Let A be the result of calling the [[Construct]] internal method of C with an argument list containing the single item len.
      // 14. a. Else, Let A be ArrayCreate(len).
      var A = isCallable(C) ? Object(new C(len)) : new Array(len);

      // 16. Let k be 0.
      var k = 0;
      // 17. Repeat, while k < len… (also steps a - h)
      var kValue;
      while (k < len) {
        kValue = items[k];
        if (mapFn) {
          A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
        } else {
          A[k] = kValue;
        }
        k += 1;
      }
      // 18. Let putStatus be Put(A, "length", len, true).
      A.length = len;
      // 20. Return A.
      return A;
    };
  }());
}

function getIEVersion() {
  var sAgent = window.navigator.userAgent;
  var Idx = sAgent.indexOf("MSIE");

  // If IE, return version number.
  if (Idx > 0) 
    return parseInt(sAgent.substring(Idx+ 5, sAgent.indexOf(".", Idx)));

  // If IE 11 then look for Updated user agent string.
  else if (!!navigator.userAgent.match(/Trident\/7\./)) 
    return 11;

  else
    return 0; //It is not IE
}

function optimiseSVG() {
    var elements = [];

    elements.push(document.getElementById('logo'));

    elements.forEach( function(e) {
        e.style.width = '100%';
    });
}

function initFrontend() {

    var hideSwiperNavigation = function() {

        Array.from(document.getElementsByClassName('theaserNavigation')).forEach(function(e) {
            
            if (e.children[0].children.length < 2) {
                e.classList.add('hidden');
            }
            else if (e.classList.contains('hidden')) {
                e.classList.remove('hidden');
            }
        });   
    }

    var openOverlay = function(e) {

        var kachel = findAncestor(e, 'overlayImage').children[0];

        if (kachel.dataset.link == undefined) {
            
            e.addEventListener('click', function(e) {

                var imgContainer = document.createElement('div');
                imgContainer.className = 'bigImageContainer';

                var img;

                if (kachel.dataset.youtube !== undefined) {
                    img = document.createElement('iframe');
                    img.width = '1024';
                    img.height = '574';
                    img.src = 'https://www.youtube.com/embed/' + kachel.dataset.youtube + '?color=white&amp;rel=0&amp;showinfo=0;autoplay=1;frameborder=0';
                    img.frameborder = '0';
                    img.allowfullscreen = 'allowfullscreen';
                    img.className = 'bigKachelImage';

                }
                else {
                    img = document.createElement('img');
                    img.src = findAncestor(e.target, 'overlayImage').children[0].dataset.bigimage;
                    img.className = 'bigKachelImage';
                }

                imgContainer.appendChild(img);

                var container = findAncestor(e.target,'kachelContainer').nextSibling;
                container.classList.remove('hidden');

                container.appendChild(imgContainer);
            });
        }
    }

    // Galery Swiper
    Array.from(document.getElementsByClassName('gallery-container-top')).forEach(function(e) {

        var galleryTop = new Swiper(e, {
            spaceBetween: 10,
            
            navigation: {
                nextEl: e.children[2],
                prevEl: e.children[1]
            }
        });
        
        var galleryThumbs = new Swiper(e.nextSibling, {
            spaceBetween: 10,
            centeredSlides: true,
            slidesPerView: 'auto',
            touchRatio: 0.2,
            slideToClickedSlide: true,
        });

        galleryTop.controller.control = galleryThumbs;
        galleryThumbs.controller.control = galleryTop;
    });

    // Theaser Swiper
    Array.from(document.getElementsByClassName('swiperTheaser-container')).forEach(function(e) {

        var myTheaserSwiper = new Swiper (e, {

            pagination: {
                el: '.swiper-pagination',
                type: 'bullets',
                clickable: true
            },
            navigation: {
                nextEl: e.children[1].children[1],
                prevEl: e.children[1].children[2]
            },
            slidesPerView: 4,
            spaceBetween: 25,
            breakpoints: {
                900: {
                    slidesPerView: 2,
                    spaceBetween: 120
                },
                700: {
                    slidesPerView: 2,
                    spaceBetween: 40
                },
                450: {
                    slidesPerView: 1,
                    spaceBetween: 25
                }
            }
        });    
    });

    // Kachel Swiper
    Array.from(document.getElementsByClassName('swiperKachel-container')).forEach(function(e) {

        var myKachelSwiper = new Swiper (e, {

            pagination: {
                el: '.swiper-pagination',
                type: 'bullets',
                clickable: true
            },
            navigation: {
                nextEl: e.children[1].children[1],
                prevEl: e.children[1].children[2]
            },
            slidesPerView: 4,
            spaceBetween: 25,
            breakpoints: {
                992: {
                    slidesPerView: 3,
                    spaceBetween: 120
                },
                768: {
                    slidesPerView: 2,
                    spaceBetween: 40
                },
                576: {
                    slidesPerView: 1,
                    spaceBetween: 25
                }                
            }
        });
    });

    // add event listener Themen Slider click
    Array.from(document.getElementsByClassName('themenSliderItem')).forEach(function(item, i) {

        // initialize at loading
        if ( item.parentNode.children[0] == item) {
            item.children[1].classList.add('indicatorCheck');
            item.classList.add('themenSliderItemActive');
        }
        
        item.addEventListener('click', function() {

            var arrow = item.children[1];

            // remove all check symbols
            Array.from(item.parentNode.children).forEach(function(e) {
                e.children[1].classList.remove('indicatorCheck');
                e.classList.remove('themenSliderItemActive');            
            });

            // add symbol to node
            arrow.classList.add('indicatorCheck');
            item.classList.add('themenSliderItemActive')

            // Swiper functionality
            item.parentNode.parentNode.parentNode.childNodes[1].swiper.slideTo(parseInt(item.dataset.slideto) + 1);   
        });    
    });

    var ie = getIEVersion();

    // Swiper instances
    Array.from(document.getElementsByClassName('swiper-container-default')).forEach(function(e) {

        var mySwiper = new Swiper (e, {

            loop: true,
            setWrapperSize: true,
            preloadImages: false,
            slidesPerView: 1,

            lazy: {
                loadPrevNext: true,
                loadPrevNextAmount: 2
            },

            // Navigation arrows
            navigation: {
                nextEl: e.children[2],
                prevEl: e.children[1]
            },

            effect: 'fade',
            speed: 900        
        });

        if (ie == 11) mySwiper.update();   
    });

    var menuItems = [];
    var mainMenuItems = [];

    // tab Menu Division
    Array.from(document.getElementsByClassName("spartenDropdown")).forEach(function(e) {

        menuItems.push(document.getElementById('menu_' + e.id));

        e.addEventListener('touchstart', function(ev) {

            var info = document.getElementById('menu_' + e.id);
            
            if (info.classList.contains('hidden')) {

                ev.preventDefault();
                ev.stopPropagation();
                
                menuItems.forEach(function(ele) {
                    if (!ele.classList.contains('hidden')) ele.classList.add('hidden');
                });

                info.classList.remove('hidden');
            }
        });
    });

    // tab Main Menu
    Array.from(document.getElementsByClassName('bigPadding')).forEach(function(e) {

        var dropDown = e.parentNode.children[1];
        mainMenuItems.push(dropDown);

        e.addEventListener('touchstart', function(ev) {

            if (!dropDown.classList.contains('visibleImportant')) {

                ev.preventDefault();
                ev.stopPropagation();

                mainMenuItems.forEach(function(ele) {

                    if (ele.classList.contains('visibleImportant')) ele.classList.remove('visibleImportant');
                });              

                dropDown.classList.add('visibleImportant');
            }
        });
    });

    // close tab Menu
    window.addEventListener('touchstart', function(ev) {

        if (ev.target.tagName !== 'A' && ev.target.parentNode.tagName !== 'A') {
            menuItems.forEach(function(ele) {
                if (!ele.classList.contains('hidden')) ele.classList.add('hidden');
            });

            mainMenuItems.forEach(function(ele) {
                if (ele.classList.contains('visibleImportant')) ele.classList.remove('visibleImportant');
            });
        }
    });

    // hide Swiper navigation if not needed
    window.addEventListener('resize', function() {
        hideSwiperNavigation();

        // hide mobile navigation
        if (window.innerWidth > 992) {
            var el = document.getElementById('mobileNavigation');

            if (!el.classList.contains('hidden')) el.classList.add('hidden');
        }
    });


    hideSwiperNavigation();

    // Close Overlay Event listener
    Array.from(document.getElementsByClassName('overlayClose')).forEach(function(e) {
        
        e.addEventListener('click', function(e) {

            var container = findAncestor(e.target, 'kachelBigOverlay');

            if (container !== undefined) {
                // close
                if (!container.classList.contains('hidden')) {
                    container.classList.add('hidden');
                }
                // remove image
                var img = container.getElementsByClassName('bigImageContainer')[0];
                img.parentNode.removeChild(img);
            }           
        });
    });

    // Open Overlay Image Event Listener
    var kachelElements = ['kachelImage', 'overlayTextSmall', 'overlayTextBig', 'overlayVideoIcon'];

    kachelElements.forEach(function(name) {

        Array.from(document.getElementsByClassName(name)).forEach(function(e) {

            openOverlay(e);
        });
    });

    var contactLinks = [];

    // add target=_blank to links
    Array.from(document.getElementsByClassName('iconLink')).forEach(function(container) {
        
        if (container.dataset.link == '_blank') {

          Array.from(container.getElementsByTagName('a')).forEach(function(e) {
                  e.target = '_blank';
          });
        }

        if (container.dataset.contact == 'true') {

            Array.from(container.getElementsByTagName('a')).forEach(function(el) {

                contactLinks.push(el);
            });
        }

        // process linkId
        if (container.dataset.linkid !== undefined) {

            Array.from(container.getElementsByTagName('a')).forEach(function(e) {
                e.href += container.dataset.linkid;
            });
        }
    });

    // look for contact links
    Array.from(document.getElementsByClassName('possibleContact')).forEach(function(el) {

        if (el.dataset.contact == 'true') {

            contactLinks.push(el);
        }
    });

    // Add eventlistener to contact links
    contactLinks.forEach(function(el) {

        el.addEventListener('click', function(event) {

            var form = document.getElementById('contactForm');
            if (form !== null && form.classList.contains('hidden')) {
                form.classList.remove('hidden');
            }

            event.preventDefault();
        });
    });


    // get Elements that need scroll animation
    var animatedElements = [];

    Array.from(document.getElementsByClassName('animated')).forEach(function(el) {

        animatedElements.push( { element: el, position: getCoords(el) } );
    });

    // scroll elements
    var logo = document.getElementById('logo'),
        phone = document.getElementById('phoneLink'),
        menu = document.getElementById('mainMenuList'),
        logoContainer = document.getElementsByClassName('logoContainer')[0],
        backToTop = document.getElementById('backToTop');
        main = document.querySelector('main');

    var scrollEvents = function() {

        //var distanceY = e.target.scrollTop,
        var distanceY = window.pageYOffset,
            shrinkOn = 300;

        if (distanceY > shrinkOn) {
            logo.classList.add('logoSmall');
            menu.classList.add('mainMenuSmall');
            logoContainer.classList.add('logoContainerSmall');
            main.classList.add('mainSmallMargin');

        } else {
            
            if (logo.classList.contains('logoSmall')) logo.classList.remove('logoSmall');
            if (menu.classList.contains('mainMenuSmall')) menu.classList.remove('mainMenuSmall');
            if (logoContainer.classList.contains('logoContainerSmall')) logoContainer.classList.remove('logoContainerSmall');
            if (main.classList.contains('mainSmallMargin')) main.classList.remove('mainSmallMargin');  
        }

        var removeFromArray = [];

        // animation
        animatedElements.forEach(function(e) {

            if (distanceY > e.position.top - window.innerHeight / 2 - 50) {
                
                e.element.classList.remove('animated');
                e.element.classList.add(e.element.dataset.class);

                removeFromArray.push(e);
            }
        });

        // remove found elements
        removeFromArray.forEach(function(e) {

            animatedElements.splice(animatedElements.indexOf(e), 1);
        });        
    }


    // scroll
    window.addEventListener('scroll', function(e){

        scrollEvents();
    });

    window.addEventListener('touchmove', function(e) {

        scrollEvents();
    });
}




// get cooridnate of Element
function getCoords(elem) {
    
    var box = elem.getBoundingClientRect();

    var body = document.body;
    var docEl = document.documentElement;

    var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

    var clientTop = docEl.clientTop || body.clientTop || 0;
    var clientLeft = docEl.clientLeft || body.clientLeft || 0;

    var top  = box.top +  scrollTop - clientTop;
    var left = box.left + scrollLeft - clientLeft;

    return { top: Math.round(top), left: Math.round(left) };
}

function onSubmit(token) {

    if (validateForm() == true) {
        document.getElementById('contactForm2').submit();
    }
}

window.addEventListener('load', function() {

    // check if referencePage and if there are options
    if (document.getElementById('referenceContainerHeader') !== null) {

        var optionsStrings = window.location.search.substr(1).split('&');

        if (optionsStrings.length > 0) {

            var region, type;

            optionsStrings.forEach(function(e) {

                var valuePair = e.split('=');

                switch (valuePair[0]) {
                    case 'region': region = valuePair[1]; break;
                    case 'type': type = valuePair[1];
                }
            });

            if (region !== undefined || type !== undefined) {

                if (type !== undefined) {
                    type = H1.removeHex(type);
                    document.getElementById('labelType').innerHTML = type;
                    console.log(document.getElementById('labelType'));
                    var select = document.getElementById(type);
                    if (select !== null) select.checked = true;
                }
                if (region !== undefined) {
                    region = H1.removeHex(region);
                    document.getElementById('labelRegion').innerHTML = region;
                    var select = document.getElementById(region);
                    if (select !== null) select.checked = true;
                }
                 
                H1.sort();
            }
        }
    }
});