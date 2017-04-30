var p = document.querySelector('.paginadora tr');
[0, 1, 2].map(i => p.childNodes[0].remove());
document.querySelector('.paginadora tr td span').remove();

