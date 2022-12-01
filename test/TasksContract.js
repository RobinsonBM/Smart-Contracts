const TasksContract = artifacts.require('TasksContract');

contract('TasksContract', () => {
  before(async () => {
    this.tasksContract = await TasksContract.deployed();
  });

  it('Comprobar que el migrate se a desplegado correctamente', async () => {
    const address = this.tasksContract.address;

    assert.notEqual(address, null);
    assert.notEqual(address, undefined);
    assert.notEqual(address, 0x0);
    assert.notEqual(address, '');
  });

  it('obtener la lista de tareas', async () => {
    const tasksCounter = await this.tasksContract.tasksCounter();
    const task = await this.tasksContract.tasks(tasksCounter);

    assert.typeOf(task.id.toNumber(), 'number');
    assert.typeOf(task.title, 'string');
    assert.typeOf(task.description, 'string');
    assert.equal(task.done, false);
    assert.typeOf(tasksCounter.toNumber(), 'number');
  });

  it('Task Created successfully', async () => {
    const result = await this.tasksContract.createTask(
      'Some Task',
      'Description two'
    );
    const taskEvent = result.logs[0].args;
    const counter = await this.tasksContract.tasksCounter();

    assert.equal(counter, 2);
    assert.typeOf(taskEvent.id.toNumber(), 'number');
    assert.notEqual(taskEvent.title, '');
    assert.notEqual(taskEvent.description, '');
    assert.equal(taskEvent.done, false);
  });

  it('tasks toogleDone', async () => {
    const task = await this.tasksContract.tasks(1);
    const result = await this.tasksContract.toogleDone(1);
    const taskEvent = result.logs[0].args;

    assert.notEqual(taskEvent.done, task.done);
  });
});
