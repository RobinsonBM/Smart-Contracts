App = {
  contracts: {},
  web3Provider: '',

  init: async () => {
    console.log('Loaded');
    await App.loadEthereum();
    await App.loadAccount();
    await App.loadContracts();
    App.render();
    await App.renderTask();
  },
  loadEthereum: async () => {
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      console.log('Ethereum existe');
      await window.ethereum.request({ method: 'eth_requestAccounts' });
    } else if (window.web3) {
      web3 = new Web3(window.web3.currentProvider);
    } else {
      console.warn(
        'No ethereum browser is installed. Try it binstall metamask'
      );
    }
  },

  loadAccount: async () => {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    App.account = accounts[0];
  },

  loadContracts: async () => {
    // Se trae el JSON del contrato desplegado
    const res = await fetch('TasksContract.json');
    const tasksContractJSON = await res.json();

    // Se convierte el JSON
    App.contracts.tasksContract = await TruffleContract(tasksContractJSON);

    // Se conecta el contrato a MetaMask
    App.contracts.tasksContract.setProvider(App.web3Provider);

    // Se conecta y utiliza el contrato desplegado
    App.tasksContract = await App.contracts.tasksContract.deployed();
  },

  render: () => {
    document.getElementById('account').innerText = App.account;
  },

  renderTask: async () => {
    const counter = await App.tasksContract.tasksCounter();
    const tasksCounter = counter.toNumber();

    let html = '';

    for (let i = 1; i <= tasksCounter; i++) {
      const task = await App.tasksContract.tasks(i);
      const taskId = task['id'];
      const taskTitle = task['title'];
      const taskDescription = task['description'];
      const tasksDone = task['done'];
      const taskCreated = task['createdAt'];

      let taskElement = `
      <div class="card bg-dark mb-2">
        <div class="card-header d-flex justify-content-between align-items-center">
          <span>${taskTitle}</span>
          <div class="form-check form-switch">
            <input class="form-check-input" data-id="${taskId}" type="checkbox" ${
        tasksDone && 'checked'
      }  onchange="App.toggleDone(this)"/>
          </div>
        </div>
        <div class="card-body">
          <span>${taskDescription}</span>
          <p class="text-muted">Task was create ${new Date(
            taskCreated * 1000
          ).toLocaleString()}</p>
        </div>
      </div>
      `;

      html += taskElement;
    }
    document.querySelector('#tasksList').innerHTML = html;
  },

  createTask: async (title, description) => {
    await App.tasksContract.createTask(title, description, {
      from: App.account,
    });

    window.location.reload();
  },

  toggleDone: async (element) => {
    const tasksId = element.dataset.id;

    await App.tasksContract.toggleDone(tasksId, {
      from: App.account,
    });

    window.location.reload();
  },
};
