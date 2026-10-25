/**
 * Creatina.js - Fitness Tools Engine (IMC, Hidratação & Taxa Metabólica Basal)
 */

// 1. Calculadora de IMC com Classificação
function calcularIMC() {
    const peso = parseFloat(document.getElementById('peso').value);
    const altura = parseFloat(document.getElementById('altura').value);
    const res = document.getElementById('resultado-imc');

    if (!peso || !altura || altura <= 0) {
        res.innerHTML = "Por favor, insira peso e altura válidos!";
        res.style.color = "#FF4444";
        return;
    }

    const imc = peso / (altura * altura);
    let classificacao = "";
    let cor = "#00FF88";

    if (imc < 18.5) {
        classificacao = "Abaixo do peso ideal";
        cor = "#3B82F6";
    } else if (imc < 24.9) {
        classificacao = "Peso normal e saudável (Excelente!)";
        cor = "#00FF88";
    } else if (imc < 29.9) {
        classificacao = "Sobrepeso (Atenção à dieta)";
        cor = "#F59E0B";
    } else {
        classificacao = "Obesidade (Recomendado acompanhamento)";
        cor = "#EF4444";
    }

    res.style.color = cor;
    res.innerHTML = `<strong>IMC: ${imc.toFixed(2)}</strong> — ${classificacao}`;
}

// 2. Calculadora de Ingestão Diária de Água (35 ml / kg)
function calcularAgua() {
    const peso = parseFloat(document.getElementById('peso-agua').value);
    const res = document.getElementById('resultado-agua');

    if (!peso || peso <= 0) {
        res.innerHTML = "Informe seu peso em kg.";
        res.style.color = "#FF4444";
        return;
    }

    const litros = (peso * 35) / 1000;
    res.style.color = "#38BDF8";
    res.innerHTML = `Meta Diária: <strong>${litros.toFixed(2)} Litros</strong> de água (~${Math.round(litros * 4)} copos de 250ml)`;
}

// 3. Calculadora de Taxa Metabólica Basal (Mifflin-St Jeor)
function calcularTMB() {
    const peso = parseFloat(document.getElementById('tmb-peso').value);
    const alturaCm = parseFloat(document.getElementById('tmb-altura').value);
    const idade = parseInt(document.getElementById('tmb-idade').value, 10);
    const sexo = document.getElementById('tmb-sexo').value;
    const res = document.getElementById('resultado-tmb');

    if (!peso || !alturaCm || !idade) {
        res.innerHTML = "Preencha todos os campos da TMB.";
        res.style.color = "#FF4444";
        return;
    }

    let tmb = (10 * peso) + (6.25 * alturaCm) - (5 * idade);
    tmb += (sexo === 'm') ? 5 : -161;

    res.style.color = "#A855F7";
    res.innerHTML = `Gasto Calórico Basal: <strong>~${Math.round(tmb)} kcal/dia</strong> (em repouso absoluto)`;
}
