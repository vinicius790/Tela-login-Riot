window.onload = function() {
  fetch('https://sevencoders-starwars-wiki.herokuapp.com/films') 
  .then((data) => {
    console.log({data});
  })
  .catch((error) => {
    console.log({error});
    alert("Erro ao carregar os filmes");
  });
}
