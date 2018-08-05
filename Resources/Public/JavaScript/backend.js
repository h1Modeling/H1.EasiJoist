Array.from(document.getElementsByClassName('animated')).forEach(function(e) {

	e.classList.remove('animated');
	e.classList.add(e.dataset.class);
});