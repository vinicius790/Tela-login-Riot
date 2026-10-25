function calcularIMC() {
    const peso = parseFloat(document.getElementById('peso').value);
    const altura = parseFloat(document.getElementById('altura').value);
    const res = document.getElementById('resultado-imc');

    if (!peso || !altura || altura <= 0) {
        res.innerHTML = "Por favor, insira valores válidos!";
        res.style.color = "#ff4444";
        return;
    }

    const imc = peso / (altura * altura);
    let classificacao = "";

    if (imc < 18.5) {
        classificacao = "Abaixo do peso";
    } else if (imc < 25) {
        classificacao = "Peso normal (Parabéns!)";
    } else if (imc < 30) {
        classificacao = "Sobrepeso";
    } else {
        classificacao = "Obesidade";
    }

    res.style.color = "#00ff88";
    res.innerHTML = `IMC: ${imc.toFixed(2)} - ${classificacao}`;
}
