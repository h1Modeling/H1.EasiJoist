var activeMenuElement = null;

// Document events
var button = document.getElementById('menuButton');

if (button !== null) {
	button.addEventListener('click', function(){
	    (button.classList.contains('is-active') === true) ? button.classList.remove('is-active') : button.classList.add('is-active');
	});
}