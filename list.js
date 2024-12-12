// Configuração Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Configuração do Firebase (informações do projeto Firebase)
const firebaseConfig = {
    apiKey: "AIzaSyCrZgHlPVX59zM68ENmAyXogc3JmoTU5rE",
    authDomain: "tentando-eed5d.firebaseapp.com",
    projectId: "tentando-eed5d",
    storageBucket: "tentando-eed5d.appspot.com",
    messagingSenderId: "103578231381",
    appId: "1:103578231381:web:485a8e94f53e8087e92adc",
    measurementId: "G-V3BFLM3V3X",
};

// Inicializa o Firebase e o Firestore
const app = initializeApp(firebaseConfig);  // Inicializa o app do Firebase com a configuração fornecida
const db = getFirestore(app);  // Inicializa o Firestore usando a instância do app

// Seleção de elementos do HTML
const btnAdd = document.getElementById('btnAdd');  // Botão de adicionar tarefa
const inputAtividade = document.getElementById('atividade');  // Campo de input para a atividade
const selectPrioridade = document.getElementById('prioridade');  // Campo select para escolher a prioridade da tarefa
const listaTarefas = document.getElementById('tarefas-lista');  // Elemento para exibir a lista de tarefas

// Função para carregar as tarefas do Firestore e exibi-las
async function carregarTarefas() {
    const tarefasRef = collection(db, "cleber");  // Referência à coleção "cleber" no Firestore
    const querySnapshot = await getDocs(tarefasRef);  // Obtém todas as tarefas da coleção

    querySnapshot.forEach((doc) => {  // Para cada documento de tarefa obtido
        const tarefa = doc.data();  // Obtém os dados do documento
        exibirTarefa(doc.id, tarefa.atividade, tarefa.prioridade, tarefa.confirmada);  // Exibe a tarefa
    });
}

// Função para adicionar tarefa ao Firestore
async function adicionarTarefa(atividade, prioridade) {
    try {
        // Adiciona um novo documento na coleção "cleber" com as informações da tarefa
        const docRef = await addDoc(collection(db, "cleber"), {
            atividade: atividade,
            prioridade: prioridade,
            confirmada: false  // A tarefa começa como não confirmada
        });
        console.log("Documento escrito com ID: ", docRef.id);  // Exibe o ID do documento no console
        exibirTarefa(docRef.id, atividade, prioridade, false);  // Exibe a tarefa na lista com status "não confirmada"
    } catch (e) {
        console.error("Erro ao adicionar documento: ", e);  // Caso ocorra um erro, exibe no console
    }
}

// Função para exibir uma tarefa na lista HTML
function exibirTarefa(id, atividade, prioridade, confirmada) {
    const li = document.createElement('li');  // Cria um novo elemento <li> para a tarefa
    li.classList.add(prioridade + '-priority');  // Adiciona uma classe CSS para a prioridade (baixo, média, alta)
    
    const textoTarefa = document.createElement('span');  // Cria um elemento <span> para exibir a descrição da tarefa
    textoTarefa.textContent = atividade;  // Define o texto do <span> como o nome da tarefa

    // Mudar a cor do texto com base na prioridade
    if (prioridade === 'baixo') {
        textoTarefa.style.color = '#0fff17';  // Verde para baixa prioridade
    } else if (prioridade === 'media') {
        textoTarefa.style.color = '#fce300';  // Amarelo para média prioridade
    } else if (prioridade === 'alta') {
        textoTarefa.style.color = '#ff0019';  // Vermelho para alta prioridade
    }

    // Botões de editar, cancelar e confirmar
    const btnEditar = document.createElement('button');
    btnEditar.classList.add('icon-btn');  // Adiciona uma classe para os botões de ícone
    btnEditar.innerHTML = '✏️';  // Define o ícone de edição
    btnEditar.addEventListener('click', () => editarTarefa(id, textoTarefa));  // Adiciona um evento de clique para editar a tarefa

    const btnCancelar = document.createElement('button');
    btnCancelar.classList.add('icon-btn');
    btnCancelar.innerHTML = '❌';  // Define o ícone de excluir
    btnCancelar.addEventListener('click', () => excluirTarefa(id, li));  // Adiciona um evento de clique para excluir a tarefa

    const btnConfirmar = document.createElement('button');
    btnConfirmar.classList.add('icon-btn');
    btnConfirmar.innerHTML = '✔️';  // Define o ícone de confirmar
    btnConfirmar.addEventListener('click', () => confirmarEdicao(id, textoTarefa, btnEditar, btnCancelar, btnConfirmar));  // Adiciona evento para confirmar a tarefa

    // Se a tarefa já foi confirmada, desabilitar os botões
    if (confirmada) {
        btnEditar.disabled = true;
        btnCancelar.disabled = true;
        btnConfirmar.disabled = true;
    }

    // Adicionando elementos ao <li>
    li.appendChild(textoTarefa);
    li.appendChild(btnEditar);
    li.appendChild(btnCancelar);
    li.appendChild(btnConfirmar);

    // Adicionando o <li> na lista de tarefas
    listaTarefas.appendChild(li);
}

// Função para adicionar tarefa ao clicar no botão
btnAdd.addEventListener('click', () => {
    const atividade = inputAtividade.value.trim();  // Obtém o texto da atividade e remove espaços extras
    const prioridade = selectPrioridade.value;  // Obtém a prioridade selecionada

    if (atividade) { 
        adicionarTarefa(atividade, prioridade);  // Adiciona a tarefa no Firestore
        inputAtividade.value = '';  // Limpa o campo de input
    } else {
        alert('Por favor, insira uma atividade.');  // Exibe um alerta se o campo de atividade estiver vazio
    }
});

// Função para editar tarefa
async function editarTarefa(id, textoTarefa) {
    const novoTexto = prompt('Editar tarefa:', textoTarefa.textContent);  // Solicita o novo texto via prompt
    if (novoTexto) {
        // Atualiza a tarefa no Firestore com o novo texto
        const tarefaRef = doc(db, "cleber", id);
        await updateDoc(tarefaRef, {
            atividade: novoTexto
        });
        textoTarefa.textContent = novoTexto;  // Atualiza o texto na interface
    }
}

// Função para confirmar edição e desabilitar os botões
async function confirmarEdicao(id, textoTarefa, btnEditar, btnCancelar, btnConfirmar) {
    alert('Tarefa confirmada: ' + textoTarefa.textContent);  // Exibe um alerta com o texto da tarefa confirmada

    // Atualiza o status da tarefa para "confirmada" no Firestore
    const tarefaRef = doc(db, "cleber", id);
    await updateDoc(tarefaRef, {
        confirmada: true  // Marca a tarefa como confirmada
    });

    // Desabilita os botões para evitar mudanças após a confirmação
    btnEditar.disabled = true;
    btnConfirmar.disabled = true;
}

// Função para excluir tarefa
async function excluirTarefa(id, li) {
    const tarefaRef = doc(db, "cleber", id);  // Referência ao documento da tarefa no Firestore
    await deleteDoc(tarefaRef);  // Exclui a tarefa do Firestore
    li.remove();  // Remove a tarefa da interface
}

// Carregar tarefas do Firestore quando a página carregar
window.addEventListener('load', carregarTarefas);  // Quando a página carregar, chama a função para carregar e exibir as tarefas